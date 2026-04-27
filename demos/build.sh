#!/usr/bin/env bash
# The demo page loads ../build/elation.{js,css} and ../build/themes/*.css
# from the top-level dist build. This script is a convenience wrapper that
# rebuilds the dist, so visiting demos/index.html locally always picks up
# the latest sources.
set -e
cd "$(dirname "$0")/.."
npm run build
echo
echo "Serve the demo with:"
echo "  (cd demos && python3 -m http.server 8000)"
