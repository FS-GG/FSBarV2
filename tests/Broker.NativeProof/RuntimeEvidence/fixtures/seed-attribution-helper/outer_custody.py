"""Source reuse of reviewed Wizard pidfd/WNOWAIT custody; no runtime at import."""
import os, signal, subprocess, selectors, time, json
from pathlib import Path
STREAM_CAP=524288
PROC_CAP=8192
MEMBER_CAP=128
def require(ok, reason):
    if not ok:raise ValueError(reason)
def proc_identity(pid):
    try:
        with (Path('/proc') / str(pid) / 'stat').open() as stream: raw = stream.read(4096)
        fields = raw[raw.rfind(')') + 2:].split()
        return dict(pid=pid, state=fields[0], ppid=int(fields[1]), pgid=int(fields[2]), sid=int(fields[3]), start=int(fields[19]))
    except (FileNotFoundError, ProcessLookupError): return None


def all_processes():
    entries = list(Path('/proc').iterdir()); require(len(entries) <= PROC_CAP, 'proc-scan-cap')
    return [identity for entry in entries if entry.name.isdigit() and (identity := proc_identity(int(entry.name))) is not None]


def same_process(one, two):
    return two is not None and all(one[k] == two[k] for k in ('pid', 'start'))


class OwnedChild:
    """Leader stays unreaped while its session is observed; signals use bound pidfds only."""
    def __init__(self, proc, adopted=False):
        self.proc = proc; self.members = {}; self.reaped = False; self.adopted = adopted
        # Popen has not polled/waited: this child PID is reserved until our reap.
        try: fd = os.pidfd_open(proc.pid, 0)
        except BaseException:
            # Popen.kill polls under its wait lock; only this unreaped child is eligible.
            proc.kill(); proc.wait(timeout=2); raise
        try:
            self.leader = proc_identity(proc.pid)
            require(self.leader is not None and self.leader['pgid'] == self.leader['sid'] == proc.pid and self.leader['ppid'] == os.getpid(), 'owned-session-identity')
            self.members[(self.leader['pid'], self.leader['start'])] = (dict(self.leader), fd)
        except BaseException:
            try: signal.pidfd_send_signal(fd, signal.SIGKILL, None, 0)
            except ProcessLookupError: pass
            try: proc.wait(timeout=2)
            finally: os.close(fd)
            raise

    def acquire(self, identity):
        key = (identity['pid'], identity['start'])
        if key in self.members: return
        require(len(self.members) < MEMBER_CAP, 'owned-member-cap')
        fd = os.pidfd_open(identity['pid'], 0)
        if not same_process(identity, proc_identity(identity['pid'])):
            os.close(fd); raise ValueError('pidfd-start-identity-drift')
        self.members[key] = (dict(identity), fd)

    def observe(self):
        require(not self.reaped and same_process(self.leader, proc_identity(self.proc.pid)), 'leader-start-identity-drift')
        current = proc_identity(self.proc.pid)
        require(current['sid'] == current['pgid'] == self.leader['pid'], 'leader-session-drift')
        identities = all_processes()
        # The held leader PID cannot be reused; same-session members are owned.
        owned = [i for i in identities if i['sid'] == self.leader['sid'] or (self.adopted and i['ppid'] == os.getpid())]
        # Retain observed descendants even if they change their process group/session.
        known = {i['pid'] for i, fd in self.members.values() if same_process(i, proc_identity(i['pid']))}
        changed = True
        while changed:
            added = [i for i in identities if i['ppid'] in known and i['pid'] not in known]
            changed = bool(added); known.update(i['pid'] for i in added); owned.extend(added)
        for identity in owned:
            try: self.acquire(identity)
            except ProcessLookupError: pass
        return owned

    def exited(self):
        # WNOWAIT reserves leader PID/session authority until settlement completes.
        return os.waitid(os.P_PID, self.proc.pid, os.WEXITED | os.WNOHANG | os.WNOWAIT)

    def signal_member(self, identity, fd, sig=signal.SIGKILL):
        # Even if numeric PID was reused, this pidfd can only signal its original process.
        current = proc_identity(identity['pid'])
        if not same_process(identity, current): return False
        identity['lastObserved'] = current
        try: signal.pidfd_send_signal(fd, sig, None, 0)
        except ProcessLookupError: pass
        return True

    def settle(self, deadline):
        require(not self.reaped, 'already-reaped-custody')
        errors=set(); started=time.monotonic(); finite_end=min(deadline,started+6)
        def current_held():
            remaining=[]
            for identity,fd in self.members.values():
                try:
                    current=proc_identity(identity['pid'])
                    if current is None:continue
                    if not same_process(identity,current):errors.add('held-pid-identity-drift');continue
                    if identity['pid']!=self.proc.pid and self.adopted and current['ppid']==os.getpid() and current['state']=='Z':
                        try:os.waitid(os.P_PID,identity['pid'],os.WEXITED|os.WNOHANG)
                        except ChildProcessError:pass
                        current=proc_identity(identity['pid'])
                    if current is not None:remaining.append(dict(identity))
                except BaseException as error:errors.add('held-observation-Unknown:'+type(error).__name__)
            return remaining
        while time.monotonic()<finite_end:
            try:self.observe()
            except BaseException as error:errors.add('discovery-Unknown:'+type(error).__name__+':'+str(error))
            sig=signal.SIGTERM if time.monotonic()<started+3 else signal.SIGKILL
            for identity,fd in self.members.values():
                try:
                    current=proc_identity(identity['pid'])
                    if current is not None and not same_process(identity,current):errors.add('held-pid-identity-drift');continue
                    if current is not None and current['state']!='Z':self.signal_member(identity,fd,sig)
                except BaseException as error:errors.add('held-signal-Unknown:'+type(error).__name__)
            remaining=current_held()
            try:exited=self.exited()
            except BaseException as error:errors.add('leader-exit-Unknown:'+type(error).__name__);exited=None
            if not [i for i in remaining if i['pid']!=self.proc.pid] and exited is not None:break
            time.sleep(min(.02,max(0,finite_end-time.monotonic())))
        remaining=current_held()
        try:
            if self.exited()is not None:
                self.proc.wait(timeout=0);self.reaped=True;remaining=[i for i in remaining if i['pid']!=self.proc.pid]
            else:
                if not any(i['pid']==self.proc.pid for i in remaining):remaining.append(dict(self.leader))
        except BaseException as error:errors.add('leader-reap-Unknown:'+type(error).__name__)
        record={'leader':self.leader,'members':[dict(i)for i,fd in self.members.values()],'leaderReaped':self.reaped,'remaining':remaining,'errors':sorted(errors),'discoveryComplete':not bool(errors),'status':'Unknown'if errors or remaining or not self.reaped else 'settled'}
        # Handles are retained until exact-held settlement has been attempted and recorded.
        for identity,fd in self.members.values():os.close(fd)
        return record


def capture(proc, custody, deadline):
    buffers = {'stdout': bytearray(), 'stderr': bytearray()}; selector = selectors.DefaultSelector()
    for name in buffers:
        stream = getattr(proc, name); os.set_blocking(stream.fileno(), False); selector.register(stream, selectors.EVENT_READ, name)
    try:
        while selector.get_map() or custody.exited() is None:
            require(time.monotonic() < deadline, 'command-deadline')
            custody.observe()
            for key, mask in selector.select(min(0.05, max(0, deadline - time.monotonic()))):
                data = os.read(key.fileobj.fileno(), 16 * 1024)
                if not data: selector.unregister(key.fileobj); continue
                require(len(buffers[key.data]) + len(data) <= STREAM_CAP, 'command-stream-cap:' + key.data)
                buffers[key.data].extend(data)
        status = custody.exited()
        code = status.si_status if status.si_code == os.CLD_EXITED else -status.si_status
        return dict(actualExitCode=code, **{name: bytes(data).decode('utf-8', errors='replace') for name, data in buffers.items()})
    except BaseException as error:
        error.boundedCapture={name:bytes(data).decode('utf-8',errors='replace') for name,data in buffers.items()}
        raise
    finally:
        selector.close()
        for name in buffers: getattr(proc, name).close()


def bounded_json(path, value, cap):
    data = json.dumps(value, indent=2).encode() + b'\n'; require(len(data) <= cap, 'output-file-cap')
    Path(path).write_bytes(data)


