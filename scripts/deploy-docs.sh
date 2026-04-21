#!/usr/bin/env bash
# Build docs + demos and publish them to the gh-pages branch.
# Layout mirrors the repo (docs/js/ and demos/) so existing relative links
# stay valid both locally and on the deployed site.
set -e
cd "$(dirname "$0")/.."

REMOTE=${REMOTE:-origin}
REMOTE_URL=$(git remote get-url "$REMOTE")

echo "==> Generating API docs"
npm run docs

echo "==> Building demos bundle"
./demos/build.sh >/dev/null

STAGE=.gh-pages-staging
rm -rf "$STAGE"
mkdir -p "$STAGE/docs/js" "$STAGE/demos"

cp -r docs/js/. "$STAGE/docs/js/"
cp demos/index.html demos/bundle.js demos/bundle.css "$STAGE/demos/"
touch "$STAGE/.nojekyll"

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
# Init a throwaway repo inside the staging dir and force-push its initial
# commit to gh-pages. This avoids leaking master's .gitignore, submodules,
# or other tracked files from any clone-based publishing tool.
TMPGIT=$(mktemp -d)
trap 'rm -rf "$TMPGIT"' EXIT

cp -r "$STAGE/." "$TMPGIT/"
cd "$TMPGIT"

AUTHOR_NAME=$(cd - >/dev/null && git config user.name)
AUTHOR_EMAIL=$(cd - >/dev/null && git config user.email)

git -c init.defaultBranch=gh-pages init -q
git -c user.name="$AUTHOR_NAME" -c user.email="$AUTHOR_EMAIL" add -A
git -c user.name="$AUTHOR_NAME" -c user.email="$AUTHOR_EMAIL" commit -q -m "Deploy docs"
git push -q --force "$REMOTE_URL" HEAD:refs/heads/gh-pages

echo "==> Published to $REMOTE_URL (gh-pages)"
