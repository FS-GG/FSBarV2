#!/usr/bin/env bash
set -euo pipefail
usage() { echo "usage: $0 --handoff <private-mode0600.json> --evidence <new-directory>" >&2; exit 64; }
handoff=
evidence=
while [[ $# -gt 0 ]]; do
  case "$1" in
    --handoff) [[ $# -ge 2 ]] || usage; handoff="$2"; shift 2 ;;
    --evidence) [[ $# -ge 2 ]] || usage; evidence="$2"; shift 2 ;;
    *) usage ;;
  esac
done
[[ -n "$handoff" && -n "$evidence" ]] || usage
handoff="$(realpath -e "$handoff")"
[[ ! -e "$evidence" ]] || { echo "evidence path must not exist: $evidence" >&2; exit 1; }
repo_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
tests="$repo_root/tests/Broker.Browser.Receiver.Tests"
umask 077
mkdir -m 0700 "$evidence"
node --input-type=module - "$handoff" "$tests/live-native-evidence.mjs" <<'JS'
const [handoff,modulePath]=process.argv.slice(2); const api=await import(`file://${modulePath}`); await api.loadHandoff(handoff);
JS
npm ci --ignore-scripts --prefix "$tests" > "$evidence/npm-install.log"
(cd "$tests" && BARC_RUN_LIVE_NATIVE_RECEIVER=1 BARC_LIVE_NATIVE_HANDOFF="$handoff" \
  BARC_LIVE_NATIVE_EVIDENCE="$evidence" \
  npx playwright test live-native-journey.spec.js) > "$evidence/playwright.log"
node --input-type=module - "$handoff" "$tests/live-native-evidence.mjs" "$evidence" "$evidence/qualification.json" <<'JS'
const [handoff,modulePath,evidence,output]=process.argv.slice(2); const api=await import(`file://${modulePath}`); await api.summarize(handoff,evidence,output);
JS
echo "$evidence/qualification.json"
