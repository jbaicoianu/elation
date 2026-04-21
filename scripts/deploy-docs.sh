#!/usr/bin/env bash
# Stage docs + demos into a gh-pages layout that mirrors the repo structure
# (docs/js/ and demos/), then publish via the `gh-pages` npm package.
set -e
cd "$(dirname "$0")/.."

echo "==> Generating API docs"
npm run docs

echo "==> Building demos bundle"
./demos/build.sh >/dev/null

STAGE=.gh-pages-staging
rm -rf "$STAGE"
mkdir -p "$STAGE/docs/js" "$STAGE/demos"

cp -r docs/js/. "$STAGE/docs/js/"
cp demos/index.html demos/bundle.js demos/bundle.css "$STAGE/demos/"

cat > "$STAGE/index.html" <<'HTML'
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Elation Elements</title>
  <meta http-equiv="refresh" content="0; url=docs/js/index.html">
</head>
<body>
  <p><a href="docs/js/index.html">Elation Elements documentation</a></p>
</body>
</html>
HTML

echo "==> Publishing to gh-pages branch"
npx gh-pages -d "$STAGE" -m "Deploy docs"
