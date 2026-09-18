#!/bin/bash
# Generate App Store 6.5" (1242x2688) screenshots from the existing Android composites.
# Reuses the same brand style: warm->black gradient, gold dash, rounded Arial caption,
# real in-app capture (Android status bar cropped out) floated as a rounded card.
set -e

SRC="/Users/abhayindwar/Projects/unfluke-app-.nosync/playstore-assets/generated/screenshots"
OUTROOT="/Users/abhayindwar/Projects/unfluke-app-.nosync/appstore-assets/generated"
WORK="/private/tmp/claude-501/-Users-abhayindwar-Projects-unfluke-app--nosync/b54e4d00-7323-4d0b-a2f4-9fe1d4f7f66e/scratchpad/ios-ss"
mkdir -p "$WORK"

# Target size passed in:  $1 = width  $2 = height  $3 = label (e.g. 6_5)
W="${1:-1242}"; H="${2:-2688}"; LABEL="${3:-6_5}"
OUT="$OUTROOT/screenshots-${LABEL}"
mkdir -p "$OUT"

GOLD="#E9C46A"
FONT="/System/Library/Fonts/Supplemental/Arial Rounded Bold.ttf"

# App-UI crop rectangle inside each 1080x1920 composite (drops Android status bar, keeps header->bottom nav)
CROP="1080x1362+0+500"

# Card geometry — derived from canvas size so it scales across device sizes
CX=$((W/2))                       # horizontal centre
RADIUS=46                         # rounded corner radius
CARDW=$(printf '%.0f' "$(echo "$W*0.917" | bc -l)")   # ~91.7% of width
CARD_Y=$(printf '%.0f' "$(echo "$H*0.329" | bc -l)")  # top of card from canvas top
DASH_X1=$((CX-60)); DASH_X2=$((CX+60))

# ---- build the shared background once ----
BG="$WORK/_bg_ios.png"
# base: subtle warm top -> deep black bottom
magick -size ${W}x${H} gradient:'#1b170f'-'#0b0c10' "$WORK/_base.png"
# warm radial hotspot behind the caption
HOTH=$(printf '%.0f' "$(echo "$H*0.283" | bc -l)")
magick -size 1500x900 radial-gradient:'#4a3c1e'-'#000000' -resize ${W}x${HOTH}\! "$WORK/_hot.png"
magick "$WORK/_base.png" "$WORK/_hot.png" -gravity north -compose screen -composite "$BG"

# captions per screenshot (2 lines each)
CAP1=$'Real fundamentals\nat a glance'
CAP2=$'Live charts\nthat just work'
CAP3=$'Scan for\nwinning setups'
CAP4=$'Ask AI about\nany stock'
CAP5=$'Light & Dark,\nyour choice'
CAP6=$'Beautiful in\nlight mode too'
CAP7=$'All your tools\nin one place'

for i in 1 2 3 4 5 6 7; do
  cap_var="CAP$i"; CAPTION="${!cap_var}"

  # 1) crop app UI + scale to card width
  magick "$SRC/screenshot_$i.png" -crop $CROP +repage -resize ${CARDW}x "$WORK/_app_$i.png"
  CW=$(magick "$WORK/_app_$i.png" -format "%w" info:)
  CH=$(magick "$WORK/_app_$i.png" -format "%h" info:)

  # 2) round the corners
  magick "$WORK/_app_$i.png" \
    \( +clone -alpha extract -draw "fill black polygon 0,0 0,$RADIUS $RADIUS,0 fill white circle $RADIUS,$RADIUS $RADIUS,0" \
       \( +clone -flip \) -compose Multiply -composite \
       \( +clone -flop \) -compose Multiply -composite \) \
    -alpha off -compose CopyOpacity -composite "$WORK/_round_$i.png"

  # 3) thin gold hairline border on the rounded card
  magick "$WORK/_round_$i.png" -fill none -stroke '#E9C46A' -strokewidth 2 \
    -draw "roundrectangle 1,1 $((CW-2)),$((CH-2)) $RADIUS,$RADIUS" "$WORK/_bord_$i.png"

  # 4) card + soft drop shadow
  magick "$WORK/_bord_$i.png" \( +clone -background black -shadow 55x26+0+16 \) +swap \
    -background none -layers merge +repage "$WORK/_card_$i.png"

  # 5) compose: bg -> dash -> caption -> card
  DASH_Y1=$(printf '%.0f' "$(echo "$H*0.054" | bc -l)"); DASH_Y2=$((DASH_Y1+12))
  CAP_Y=$(printf '%.0f' "$(echo "$H*0.086" | bc -l)")
  magick "$BG" \
    -fill "$GOLD" -draw "roundrectangle ${DASH_X1},${DASH_Y1} ${DASH_X2},${DASH_Y2} 6,6" \
    -font "$FONT" -pointsize 88 -fill white -gravity north -interline-spacing 12 \
    -annotate +0+${CAP_Y} "$CAPTION" \
    "$WORK/_card_$i.png" -gravity north -geometry +0+$((CARD_Y-26)) -composite \
    -background '#0b0c10' -alpha remove -alpha off -strip \
    "$OUT/ios_${LABEL}_screenshot_$i.png"

  echo "built ios_${LABEL}_screenshot_$i.png  ($(magick "$OUT/ios_${LABEL}_screenshot_$i.png" -format '%wx%h' info:))"
done

echo "---- all done, output in: $OUT ----"
