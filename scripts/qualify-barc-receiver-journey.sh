#!/usr/bin/env bash
set -euo pipefail

usage() {
  echo "usage: $0 --product-root <joined-fsbar> --receiver-evidence <qualified-receiver> --evidence <new-directory>" >&2
  exit 64
}

product_root=
receiver_evidence=
evidence=
while [[ $# -gt 0 ]]; do
  case "$1" in
    --product-root) [[ $# -ge 2 ]] || usage; product_root="$2"; shift 2 ;;
    --receiver-evidence) [[ $# -ge 2 ]] || usage; receiver_evidence="$2"; shift 2 ;;
    --evidence) [[ $# -ge 2 ]] || usage; evidence="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$product_root" && -n "$receiver_evidence" && -n "$evidence" ]] || usage
product_root="$(cd "$product_root" && pwd)"
receiver_evidence="$(cd "$receiver_evidence" && pwd)"
[[ ! -e "$evidence" ]] || { echo "evidence path must not exist: $evidence" >&2; exit 1; }

receiver_receipt="$receiver_evidence/qualification.json"
receiver_root="$receiver_evidence/receiver"
receiver_publish="$receiver_evidence/publish"
companion="$product_root/src/Broker.Browser.Preview/bin/Release/net10.0/Broker.Browser.Preview.dll"
client_tests="$product_root/tests/Broker.Browser.Client.Tests"
jq -e '.result == "passed" and .mode == "joined-archive" and .consumed.archiveSha256 != null' \
  "$receiver_receipt" >/dev/null
[[ -f "$receiver_publish/Server.dll" && -f "$companion" ]] || {
  echo "receiver publish or Release companion is missing" >&2
  exit 2
}
[[ -f "$client_tests/actual-companion.spec.js" ]] || { echo "actual companion journey is missing" >&2; exit 2; }

umask 077
mkdir -p "$evidence/companion-assets/assets" "$evidence/companion-assets/src" "$evidence/companion-assets/guests"
archive_root="$receiver_root/Client/public/barc-preview"
install -m 0644 "$archive_root/src/Broker.Browser.Client/dist/assets/barc-preview.js" \
  "$evidence/companion-assets/assets/barc-preview.js"
install -m 0644 "$archive_root/src/Broker.Browser.Client/dist/assets/barc-preview.css" \
  "$evidence/companion-assets/assets/barc-preview.css"
for relative in src/Broker.Browser.Wasm src/Broker.Browser.Contracts; do
  mkdir -p "$evidence/companion-assets/$(dirname "$relative")"
  tar -C "$archive_root" -cf - "$relative" | tar -C "$evidence/companion-assets" -xf -
done
install -m 0644 "$archive_root/guests/manual-preview.wasm" "$evidence/companion-assets/guests/manual-preview.wasm"
install -m 0644 "$archive_root/guests/custom-preview.wasm" "$evidence/companion-assets/guests/custom-preview.wasm"

read -r receiver_port grpc_port gateway_port static_port < <(python3 - <<'PY'
import socket
sockets = []
for _ in range(4):
    sock = socket.socket()
    sock.bind(("127.0.0.1", 0))
    sockets.append(sock)
print(*(sock.getsockname()[1] for sock in sockets))
for sock in sockets:
    sock.close()
PY
)
receiver_origin="http://127.0.0.1:$receiver_port"
receiver_url="$receiver_origin/barc/"
ready="$evidence/ready.json"
native_receipt="$evidence/native-qualification.json"
receiver_pid=
companion_pid=
journey_pid=

stop_process() {
  local pid="$1" label="$2"
  [[ -n "$pid" ]] || return 0
  if kill -0 "$pid" 2>/dev/null; then
    kill -INT "$pid"
    for _ in $(seq 1 200); do
      kill -0 "$pid" 2>/dev/null || break
      sleep 0.05
    done
    if kill -0 "$pid" 2>/dev/null; then
      kill -KILL "$pid" 2>/dev/null || true
      wait "$pid" 2>/dev/null || true
      echo "$label did not stop cleanly" >&2
      return 1
    fi
  fi
  wait "$pid"
}

cleanup() {
  local status=$?
  if [[ -n "$companion_pid" ]] && kill -0 "$companion_pid" 2>/dev/null; then
    kill -KILL "$companion_pid" 2>/dev/null || true
    wait "$companion_pid" 2>/dev/null || true
  fi
  if [[ -n "$journey_pid" ]] && kill -0 "$journey_pid" 2>/dev/null; then
    kill -KILL "$journey_pid" 2>/dev/null || true
    wait "$journey_pid" 2>/dev/null || true
  fi
  if [[ -n "$receiver_pid" ]] && kill -0 "$receiver_pid" 2>/dev/null; then
    kill -KILL "$receiver_pid" 2>/dev/null || true
    wait "$receiver_pid" 2>/dev/null || true
  fi
  exit "$status"
}
trap cleanup EXIT

npm ci --ignore-scripts --prefix "$client_tests" > "$evidence/client-test-install.log"

(cd "$receiver_publish" && trap - INT && exec dotnet Server.dll --urls "$receiver_origin" --BasePath=/barc) \
  > "$evidence/receiver-server.log" 2>&1 &
receiver_pid=$!
ready_receiver=false
for _ in $(seq 1 200); do
  if curl -fsS "$receiver_origin/barc/healthz" > "$evidence/receiver-health.json"; then
    ready_receiver=true
    break
  fi
  sleep 0.05
done
[[ "$ready_receiver" == true ]] || { echo "generated receiver did not become ready" >&2; exit 1; }

# Start Chromium before the companion so the journey is already waiting on the
# private handoff when the fixture emits its first complete observation.
BARC_RUN_ACTUAL_COMPANION=1 \
BARC_EXTERNAL_READY_FILE="$ready" \
BARC_EXTERNAL_PRODUCT_URL="$receiver_url" \
  npm run test:actual --prefix "$client_tests" > "$evidence/actual-receiver-journey.log" &
journey_pid=$!
sleep 1
kill -0 "$journey_pid" 2>/dev/null || { echo "actual receiver journey exited before companion startup" >&2; exit 1; }

(trap - INT; exec dotnet "$companion" --fixture \
  --assets-root "$evidence/companion-assets" --base-path /barc/ \
  --grpc-port "$grpc_port" --gateway-port "$gateway_port" --static-port "$static_port" \
  --browser-origin "$receiver_origin" --ready-file "$ready" \
  --qualification-receipt "$native_receipt") \
  > "$evidence/companion.log" 2>&1 &
companion_pid=$!
for _ in $(seq 1 200); do
  [[ -f "$ready" ]] && break
  kill -0 "$companion_pid" 2>/dev/null || { echo "actual companion exited before ready" >&2; exit 1; }
  sleep 0.05
done
[[ -f "$ready" ]] || { echo "actual companion did not produce its private handoff" >&2; exit 1; }
[[ "$(stat -c '%a' "$ready")" == 600 ]] || { echo "private handoff mode is not 0600" >&2; exit 1; }
jq -e '.schema == "barc.preview.ready/v1" and .fixtureMode == true' "$ready" >/dev/null

wait "$journey_pid"
journey_pid=

stop_process "$companion_pid" "actual companion"
companion_pid=
[[ ! -e "$ready" ]] || { echo "private handoff was not deleted on companion teardown" >&2; exit 1; }
[[ -f "$native_receipt" && "$(stat -c '%a' "$native_receipt")" == 600 ]] || {
  echo "native qualification receipt is missing or not mode 0600" >&2
  exit 1
}
jq -e '.schema == "barc.preview.qualification/v1" and .nativeSubmissionCount == 0 and .cleanShutdown == true' \
  "$native_receipt" >/dev/null

stop_process "$receiver_pid" "generated receiver"
receiver_pid=
trap - EXIT

jq -n \
  --arg receiverUrl "$receiver_url" \
  --arg archiveSha "$(jq -r '.consumed.archiveSha256' "$receiver_receipt")" \
  --arg clientSha "$(jq -r '.consumed.assets.clientJs' "$receiver_receipt")" \
  --arg workerSha "$(jq -r '.consumed.assets.worker' "$receiver_receipt")" \
  --arg manualSha "$(jq -r '.consumed.assets.manualGuest' "$receiver_receipt")" \
  --arg customSha "$(jq -r '.consumed.assets.customGuest' "$receiver_receipt")" \
  '{schema:"fsbar.barc-receiver-journey/v1",result:"passed",receiverUrl:$receiverUrl,
    archiveSha256:$archiveSha,assets:{clientJs:$clientSha,worker:$workerSha,manualGuest:$manualSha,customGuest:$customSha},
    actualCompanion:{nativeSubmissionCount:0,cleanShutdown:true,privateFilesMode:"0600",readyDeleted:true}}' \
  > "$evidence/qualification.json"

echo "$evidence/qualification.json"
