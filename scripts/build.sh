#!/usr/bin/env bash
# Produce the pre-bundled distribution at build/elation.{js,css}.
#
# Elation core has no opinion about how its consumers bundle — janusweb-
# style projects use elation.require()'s dependency graph (see pack.js)
# to roll up only the modules they actually use. This script exists to
# give script-tag and CDN consumers a working drop-in artifact without
# having to set up bundling themselves.
set -e
cd "$(dirname "$0")/.."
ROOT="$(pwd)"

# pack.js resolves modules from htdocs/scripts/<dotted.name>.js — set up
# a throwaway staging dir that mirrors that layout, then run pack.js
# from inside it.
STAGE=$(mktemp -d)
trap 'rm -rf "$STAGE"' EXIT

mkdir -p "$STAGE/htdocs/scripts" "$STAGE/htdocs/css"
ln -sfn "$ROOT/components/elements/scripts" "$STAGE/htdocs/scripts/elements"
ln -sfn "$ROOT/components/utils/scripts"    "$STAGE/htdocs/scripts/utils"
ln -sfn "$ROOT/components/utils/css"        "$STAGE/htdocs/css/utils"
ln -sfn "$ROOT/components/elements/css/ui"  "$STAGE/htdocs/css/ui"

cd "$STAGE"
NODE_PATH="$STAGE/htdocs/scripts" node htdocs/scripts/utils/pack.js \
  -bundle elation elements.ui.all elements.collection.all
cd "$ROOT"

mkdir -p build build/themes
mv "$STAGE/elation.js"  build/elation.js
mv "$STAGE/elation.css" build/elation.css

# Visual themes are layered on top of the structural CSS in build/elation.css.
# Each theme file in components/themes/ becomes a peer artifact under build/themes/.
cp components/themes/*.css build/themes/

echo "Built: build/elation.js         ($(wc -c < build/elation.js | tr -d ' ') bytes)"
echo "       build/elation.css        ($(wc -c < build/elation.css | tr -d ' ') bytes)"
for theme in build/themes/*.css; do
  echo "       $theme ($(wc -c < "$theme" | tr -d ' ') bytes)"
done
