#!/bin/bash
BASE="/private/tmp/claude-501/-Users-abhayindwar-Projects-unfluke-app--nosync/b54e4d00-7323-4d0b-a2f4-9fe1d4f7f66e/scratchpad/premium"
mkdir -p "$BASE/final/69" "$BASE/final/65"
for n in 1 2 3 4 5 6 7; do
  nn=$(printf "%02d" $n)
  bash "$BASE/render.sh" "$BASE/template.html?n=$n&w=1290&h=2796" 1290 2796 "$BASE/final/69/ios_6_9_$nn.png"
  /opt/homebrew/bin/magick "$BASE/final/69/ios_6_9_$nn.png" -resize 1242x2688\! -strip "$BASE/final/65/ios_6_5_$nn.png" 2>/dev/null
  echo "done $nn"
done
echo "ALL DONE 7x2"
