#!/usr/bin/env bash
set -e
cd "$(dirname "$0")"
ROOT="$(cd .. && pwd)"

mkdir -p htdocs/scripts htdocs/css

ln -sfn "$ROOT/components/elements/scripts" htdocs/scripts/elements
ln -sfn "$ROOT/components/utils/scripts"    htdocs/scripts/utils
ln -sfn "$ROOT/components/utils/css"        htdocs/css/utils

NODE_PATH="$(pwd)/htdocs/scripts" node htdocs/scripts/utils/pack.js \
  -bundle bundle elements.ui.all

echo "Built: $(pwd)/bundle.js, $(pwd)/bundle.css"
echo "Serve with: (cd $(pwd) && python3 -m http.server 8000)"
