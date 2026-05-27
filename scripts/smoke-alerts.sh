#!/usr/bin/env bash
# Local smoke test for `siggy alerts`. Run from repo root:
#   ./scripts/smoke-alerts.sh
# Live API section runs when SIGGY_CONSOLE_API_KEY, STATSIG_CONSOLE_API_KEY,
# or ~/.netrc statsig.com consolekey is set.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

echo "== build =="
pnpm build

run_siggy() {
  node dist/app.js "$@"
}

echo "== CLI registration =="
run_siggy alerts --help | grep -q 'create \[options\]'
run_siggy alerts events --help | grep -q 'list \[options\] <alert-id>'

echo "== readJsonBody validation =="
node <<'NODE'
const { readJsonBody } = require('./dist/utils/readJsonBody');
function assert(cond, msg) {
  if (!cond) {
    console.error('FAIL:', msg);
    process.exit(1);
  }
}
assert(readJsonBody('[]', undefined) === null, 'array rejected');
assert(readJsonBody('null', undefined) === null, 'null rejected');
assert(readJsonBody('{"name":"test alert name"}', undefined)?.name === 'test alert name', 'object ok');
assert(readJsonBody(undefined, undefined) === null, 'missing body rejected');
console.log('readJsonBody checks passed');
NODE

echo "== missing API key =="
if run_siggy alerts list 2>/dev/null; then
  echo "FAIL: alerts list should fail without a key"
  exit 1
fi
echo "missing key correctly rejected"

if [ -n "${SIGGY_CONSOLE_API_KEY:-}" ] || [ -n "${STATSIG_CONSOLE_API_KEY:-}" ] || \
   grep -q 'consolekey' "$HOME/.netrc" 2>/dev/null; then
  echo "== live API (read) =="
  run_siggy alerts list -l 3
  FIRST_ID="$(run_siggy alerts list -l 1 2>/dev/null | node -e "
    let s=''; process.stdin.on('data',d=>s+=d); process.stdin.on('end',()=>{
      try {
        const j=JSON.parse(s);
        const row=Array.isArray(j)?j[0]:null;
        if(row?.id) process.stdout.write(row.id);
      } catch {}
    });
  ")"
  if [ -n "$FIRST_ID" ]; then
    echo "== live API get $FIRST_ID =="
    run_siggy alerts get "$FIRST_ID" | head -20
    echo "== live API events list =="
    run_siggy alerts events list "$FIRST_ID" -l 3 | head -20
  else
    echo "(no alerts in project; list OK)"
  fi
  echo "live API smoke passed"
else
  echo "== skip live API (set SIGGY_CONSOLE_API_KEY or siggy config -c) =="
fi

echo "All smoke checks passed."
