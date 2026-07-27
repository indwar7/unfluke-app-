#!/bin/bash
# render.sh <html_url_or_path> <w> <h> <out.png>  — old headless + kill-guard so it never hangs
CHROME="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
UDD="$(mktemp -d)"; URL="$1"; OUT="$4"
case "$URL" in file://*|http*) : ;; *) URL="file://$1" ;; esac
rm -f "$OUT"
"$CHROME" --headless --disable-gpu --hide-scrollbars --no-sandbox \
  --no-first-run --no-default-browser-check --disable-background-networking \
  --disable-default-apps --disable-sync --disable-extensions --disable-component-update \
  --disable-features=Translate,MediaRouter --metrics-recording-only \
  --allow-file-access-from-files --force-device-scale-factor=1 \
  --run-all-compositor-stages-before-draw --virtual-time-budget=5000 \
  --user-data-dir="$UDD" --window-size="$2,$3" --screenshot="$OUT" "$URL" >/dev/null 2>&1 &
CPID=$!
for k in $(seq 1 80); do [ -f "$OUT" ] && break; sleep 0.5; done
sleep 1
kill "$CPID" >/dev/null 2>&1; pkill -9 -f "user-data-dir=$UDD" >/dev/null 2>&1; wait "$CPID" 2>/dev/null
rm -rf "$UDD"
[ -f "$OUT" ] && /opt/homebrew/bin/magick "$OUT" -format "OK %wx%h\n" info: 2>/dev/null || echo "FAIL $OUT"
