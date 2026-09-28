#!/usr/bin/env bash
set -euo pipefail

HARNESS_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
HIGHBAR_ROOT="${HIGHBAR_ROOT:-/tmp/roadmap-barc-result-native}"
ASSET_ROOT="${BARC_NATIVE_ASSET_ROOT:-/tmp/barc-native-assets}"
RUN_DIR="${BARC_NATIVE_RUN_DIR:-/tmp/barc-fsbar-native-proof}"
LISTEN="${BARC_FSBAR_LISTEN:-127.0.0.1:5021}"
ENGINE="$ASSET_ROOT/engine/spring-headless"
WRITE_DIR="$ASSET_ROOT/engine"
PLUGIN="$ASSET_ROOT/RecoilEngine/build333/AI/Skirmish/BARb/data/libSkirmishAI.so"
START_SCRIPT="$HIGHBAR_ROOT/tests/headless/scripts/minimal.startscript"
HARNESS_LOG="$RUN_DIR/fsbar-harness.log"
ENGINE_LOG="$RUN_DIR/highbar-engine.log"
ENGINE_PID_FILE="$RUN_DIR/highbar-engine.pid"

mkdir -p "$RUN_DIR"
: > "$HARNESS_LOG"
: > "$ENGINE_LOG"

cleanup() {
    if [[ -f "$ENGINE_PID_FILE" ]]; then
        kill -TERM "$(cat "$ENGINE_PID_FILE")" 2>/dev/null || true
    fi
    if [[ -n "${HARNESS_PID:-}" ]]; then
        kill -TERM "$HARNESS_PID" 2>/dev/null || true
    fi
}
trap cleanup EXIT

for required in "$ENGINE" "$PLUGIN" "$START_SCRIPT" "$HIGHBAR_ROOT/tests/headless/_launch.sh"; do
    if [[ ! -f "$required" ]]; then
        echo "real-native-move: required asset missing: $required" >&2
        exit 2
    fi
done

dotnet run --project "$HARNESS_ROOT/tests/Broker.NativeProof/Broker.NativeProof.fsproj" -- "$LISTEN" \
    > "$HARNESS_LOG" 2>&1 &
HARNESS_PID=$!

for _ in $(seq 1 120); do
    if grep -q '^HARNESS_READY ' "$HARNESS_LOG"; then
        break
    fi
    if ! kill -0 "$HARNESS_PID" 2>/dev/null; then
        cat "$HARNESS_LOG" >&2
        exit 1
    fi
    sleep 0.25
done
if ! grep -q '^HARNESS_READY ' "$HARNESS_LOG"; then
    echo "real-native-move: FSBar Protocol host did not become ready" >&2
    cat "$HARNESS_LOG" >&2
    exit 1
fi

HIGHBAR_COORDINATOR_OWNER_SKIRMISH_AI_ID=1 \
HIGHBAR_DATA_DIRS="$ASSET_ROOT/game:$WRITE_DIR" \
"$HIGHBAR_ROOT/tests/headless/_launch.sh" \
    --start-script "$START_SCRIPT" \
    --coordinator "$LISTEN" \
    --runtime-dir "$RUN_DIR" \
    --writedir "$WRITE_DIR" \
    --engine "$ENGINE" \
    --plugin-so "$PLUGIN" \
    --log "$ENGINE_LOG" \
    --pid-file "$ENGINE_PID_FILE"

set +e
wait "$HARNESS_PID"
status=$?
set -e
HARNESS_PID=""

cat "$HARNESS_LOG"
if [[ $status -ne 0 ]]; then
    echo "real-native-move: proof failed; engine tail follows" >&2
    tail -80 "$ENGINE_LOG" >&2
    exit "$status"
fi

engine_sha="$(sha256sum "$ENGINE" | awk '{print $1}')"
plugin_sha="$(sha256sum "$PLUGIN" | awk '{print $1}')"
map_sha="$(sha256sum "$ASSET_ROOT/game/maps/avalanche_3.4.sd7" | awk '{print $1}')"
echo "ASSET_HASH engine_sha256=$engine_sha plugin_sha256=$plugin_sha map_sha256=$map_sha"
echo "real-native-move: PASS"
