#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

# Build if needed
if [ ! -f dist/cli.js ] || [ -n "$(find src -name '*.ts' -newer dist/cli.js 2>/dev/null | head -1)" ]; then
  echo "Building..."
  npm run build
fi

success=0
fail=0
failures=""

for f in examples/*.owm; do
  name="$(basename "${f%.owm}")"
  out="examples/${name}.svg"
  if node dist/cli.js "$f" -o "$out" 2>/dev/null; then
    echo "OK: $f -> $out"
    success=$((success + 1))
  else
    echo "FAIL: $f"
    failures="$failures  $f\n"
    fail=$((fail + 1))
  fi
done

echo ""
echo "=== Summary ==="
echo "Rendered: $success"
echo "Failed:   $fail"
if [ "$fail" -gt 0 ]; then
  echo "Failures:"
  echo -e "$failures"
fi
