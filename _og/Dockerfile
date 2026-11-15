# Headless Chromium for rendering _og/template.html to a PNG.
# Built and run by _og/render.sh; Chromium comes from Debian's own packages.
FROM debian:bookworm-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends chromium \
 && rm -rf /var/lib/apt/lists/*

ENTRYPOINT ["chromium", "--headless", "--no-sandbox", "--disable-gpu", \
            "--hide-scrollbars", "--force-device-scale-factor=1", \
            "--window-size=1200,630", "--virtual-time-budget=5000"]
