#!/usr/bin/env bash
# The maintained HighBar launcher remains responsible for setup and engine launch.
set -euo pipefail
[[ $# -eq 1 && "$1" == /input/startscript.txt ]] || {
  echo 'usage: image /input/startscript.txt (a separately admitted, hash-pinned input)' >&2; exit 64;
}
[[ "$(id -u)" == 10001 && -d /work && ! -L /work ]] || {
  echo 'headless runtime requires UID10001 and its fresh /work directory' >&2; exit 2;
}
[[ -z "$(find /work -mindepth 1 -print -quit)" ]] || {
  echo 'refusing retained/nonempty runtime: original attempts are never replayed' >&2; exit 2;
}
[[ -f "$1" && ! -L "$1" && "${BARC_STARTSCRIPT_SHA256:-}" =~ ^[0-9a-f]{64}$ ]] || {
  echo 'missing exact startscript identity' >&2; exit 2;
}
[[ "$(sha256sum "$1" | cut -d' ' -f1)" == "$BARC_STARTSCRIPT_SHA256" ]] || {
  echo 'startscript identity changed' >&2; exit 2;
}
# Clear paths stay inside this new attempt; no external token path is inherited.
export HIGHBAR_TOKEN_PATH=/work/highbar.token
export HIGHBAR_DATA_DIRS=/work:/opt/barc/data:/opt/barc/engine
export HIGHBAR_ENABLE_BUILTIN=false
unset DISPLAY WAYLAND_DISPLAY XAUTHORITY
mkdir -m 0700 /work/runtime /work/logs
SPRING_PID=
stop_child() {
  if [[ -n "$SPRING_PID" ]]; then kill -TERM "$SPRING_PID" 2>/dev/null || true; fi
}
trap stop_child TERM INT
# Source the maintained launcher so its engine is a direct child that can be waited.
source /opt/highbar/tests/headless/_launch.sh \
  --start-script "$1" --engine /opt/barc/engine/spring-headless \
  --plugin-so /opt/barc/plugin/libSkirmishAI.so \
  --writedir /work --runtime-dir /work/runtime \
  --log /work/logs/engine.log --pid-file /work/engine.pid
status=0
wait "$SPRING_PID" || status=$?
# A signal-interrupted wait must still collect the child's terminal status.
if kill -0 "$SPRING_PID" 2>/dev/null; then
  stop_child
  wait "$SPRING_PID" || status=$?
fi
exit "$status"
