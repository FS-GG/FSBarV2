"""Host-only CLR doublemapper metadata; never open or hash generated memory."""
import os,re,stat
from private_io import need
from runtime_identity import proc_bytes,start_ticks
NAME='/memfd:doublemapper (deleted)'
PROFILE={'class':'clr-doublemapper-metadata','role':'host','name':NAME,'permissions':['r-xs','rw-s','---s'],'objects':1,'rows':512,'fds':256,'linkBytes':4096,'fdinfoBytes':16384}
U64=2**64
ROW=re.compile(r'^([0-9a-f]+)-([0-9a-f]+) ([rwxps-]{4}) ([0-9a-f]+) ([0-9a-f]+):([0-9a-f]+) ([0-9]+)(?: +(.*))?$')

def classify(lines,role,profile,page_size):
    need(profile==PROFILE and role=='host','host-dynamic-profile')
    need(type(page_size) is int and page_size>0,'host-dynamic-page-size')
    ordinary=[];rows=[];objects=set();last_end=0
    for line in lines:
        fields=line.split(None,5);name=fields[5] if len(fields)==6 else ''
        if name!=NAME:
            need(not name.startswith('/memfd:') and not name.endswith(' (deleted)'),'host-dynamic-unidentified-deleted-map')
            ordinary.append(line);continue
        match=ROW.fullmatch(line);need(match is not None,'host-dynamic-malformed-row')
        begin,end,perms,offset,major,minor,inode,name=match.groups()
        begin,end,offset,major,minor,inode=(int(begin,16),int(end,16),int(offset,16),int(major,16),int(minor,16),int(inode))
        need(perms in PROFILE['permissions'],'host-dynamic-permissions')
        need(0<begin<end<U64 and begin>=last_end and begin%page_size==end%page_size==0,'host-dynamic-range')
        need(0<=offset<U64 and offset%page_size==0 and offset<=U64-1-(end-begin),'host-dynamic-offset-overflow')
        need(0<inode<U64 and 0<=major<U64 and 0<=minor<U64,'host-dynamic-object-range')
        last_end=end;objects.add((major,minor,inode));need(len(objects)<=1,'host-dynamic-multiple-objects')
        rows.append({'start':begin,'end':end,'offset':offset,'permissions':perms,'deviceMajor':major,'deviceMinor':minor,'inode':inode})
        need(len(rows)<=PROFILE['rows'],'host-dynamic-row-bound')
    return ordinary,rows

def held_process(held,executable):
    need(type(held['pid']) is int and held['pid']>1 and held['uid']==os.geteuid(),'host-dynamic-owned-process')
    pid=held['pid'];need(os.stat(f'/proc/{pid}').st_uid==held['uid'] and int(start_ticks(pid))==int(held['startTicks']),'host-dynamic-process-reuse')
    need(os.readlink(f'/proc/{pid}/exe')==executable,'host-dynamic-executable')
    actual=os.stat(f'/proc/{pid}/exe');expected=os.stat(executable,follow_symlinks=False)
    need(stat.S_ISREG(expected.st_mode) and (actual.st_dev,actual.st_ino)==(expected.st_dev,expected.st_ino),'host-dynamic-executable-inode')
    return {'pid':pid,'startTicks':int(held['startTicks']),'uid':held['uid'],'executable':executable,'executableDevice':actual.st_dev,'executableInode':actual.st_ino}

def _fd_stat(info):
    return {'device':info.st_dev,'deviceMajor':os.major(info.st_dev),'deviceMinor':os.minor(info.st_dev),'inode':info.st_ino,'size':info.st_size,'mode':info.st_mode,'uid':info.st_uid,'nlink':info.st_nlink}

def owner_metadata(held,executable,rows):
    before=held_process(held,executable);pid=held['pid'];matches=[]
    # Iterate boundedly rather than allocating an unbounded list of FD names.
    with os.scandir(f'/proc/{pid}/fd') as entries:
        for count,entry in enumerate(entries,1):
            need(count<=PROFILE['fds'],'host-dynamic-fd-bound');need(entry.name.isascii() and entry.name.isdecimal(),'host-dynamic-fd-name')
            path=f'/proc/{pid}/fd/{entry.name}'
            try:link=os.readlink(path)
            except FileNotFoundError:continue
            need(len(os.fsencode(link))<=PROFILE['linkBytes'],'host-dynamic-link-bound')
            if link!=NAME:continue
            # Follow only the exact matched proc FD, for stat metadata, never data.
            first=_fd_stat(os.stat(path));fdinfo=proc_bytes(pid,f'fdinfo/{entry.name}',PROFILE['fdinfoBytes']).decode('ascii')
            need(os.readlink(path)==NAME,'host-dynamic-fd-link-race');last=_fd_stat(os.stat(path))
            need(first==last,'host-dynamic-fd-stat-race')
            matches.append({'fd':int(entry.name),'link':link,'stat':first,'fdinfo':fdinfo})
    after=held_process(held,executable);need(before==after,'host-dynamic-process-race')
    # Recheck every captured descriptor after census and process check.
    for item in matches:
        path=f"/proc/{pid}/fd/{item['fd']}"
        need(os.readlink(path)==NAME and _fd_stat(os.stat(path))==item['stat'],'host-dynamic-owner-race')
    need(held_process(held,executable)==before,'host-dynamic-final-process-race')
    return validate_owner(rows,matches,before,after)

def validate_owner(rows,matches,before,after):
    """Pure metadata join also used by explicitly mocked source controls."""
    need(before==after,'host-dynamic-process-race');need(len(matches)<=PROFILE['fds'],'host-dynamic-fd-bound')
    objects=set()
    for item in matches:
        info=item['stat'];need(type(item['fd']) is int and item['fd']>=0 and item['link']==NAME,'host-dynamic-fd-identity')
        need(stat.S_ISREG(info['mode']) and info['uid']==before['uid'] and info['nlink']==0 and type(info['size']) is int and 0<=info['size']<U64,'host-dynamic-fd-custody')
        need((os.major(info['device']),os.minor(info['device']))==(info['deviceMajor'],info['deviceMinor']),'host-dynamic-fd-device')
        objects.add((info['deviceMajor'],info['deviceMinor'],info['inode']));need(len(objects)<=1,'host-dynamic-multiple-fd-objects')
        need(len(item['fdinfo'].encode('ascii'))<=PROFILE['fdinfoBytes'],'host-dynamic-fdinfo-bound')
        # Kernel fdinfo inode joins the same object; flags/position retained as metadata.
        inode=re.findall(r'^ino:\s+([0-9]+)$',item['fdinfo'],re.M)
        need(len(inode)==1 and int(inode[0])==info['inode'],'host-dynamic-fdinfo-inode')
    if rows:
        need(bool(matches),'host-dynamic-owner')
        expected={(r['deviceMajor'],r['deviceMinor'],r['inode']) for r in rows}
        need(expected==objects,'host-dynamic-owner-object')
        for row in rows:
            need(all(row['offset']+row['end']-row['start']<=item['stat']['size'] for item in matches),'host-dynamic-backing-size')
    return {'class':PROFILE['class'],'dynamicMappingMetadata':'Observed' if rows else 'Pending','owner':before,'descriptors':matches,'mappings':rows,'dynamicContentSHA256':None,'dynamicContentProvenance':'Unknown','creatorAttribution':'Inference','exhaustiveMemoryOrIOProof':False}
