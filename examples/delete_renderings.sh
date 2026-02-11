#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"

count=0
for f in *.svg; do
  [ -f "$f" ] || continue
  rm "$f"
  echo "Deleted $f"
  count=$((count + 1))
done

if [ -f index.html ]; then
  rm index.html
  echo "Deleted index.html"
  count=$((count + 1))
fi

echo "Removed $count file(s)"
