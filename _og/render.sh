#!/usr/bin/env sh
# Render the Open Graph image: _og/template.html -> assets/og-image.png (1200x630).
#
#   sh _og/render.sh
#
# Needs Docker. The first run builds a small Chromium image (j47-og);
# later runs reuse it and take a few seconds.
set -e

cd "$(dirname "$0")/.."
# Docker Desktop on Windows wants a Windows path for the volume mount
REPO="$(pwd -W 2>/dev/null || pwd)"

docker build --quiet --tag j47-og _og >/dev/null

MSYS_NO_PATHCONV=1 docker run --rm -v "$REPO:/srv" j47-og \
  --screenshot=/srv/assets/og-image.png \
  file:///srv/_og/template.html

echo "wrote assets/og-image.png"
