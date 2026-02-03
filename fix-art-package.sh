#!/bin/bash

echo "Fixing ART package..."

ART_MANAGER="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTRenderableViewManager.java"

# Check if file exists
if [ ! -f "$ART_MANAGER" ]; then
    echo "Error: ARTRenderableViewManager.java not found"
    exit 1
fi

# Remove duplicate prepareToRecycleView method
# Keep only the first occurrence
awk '
/public View prepareToRecycleView/ {
    if (!seen) {
        seen = 1
        print
        next
    } else {
        skip = 1
        next
    }
}
skip && /^  \}$/ {
    skip = 0
    next
}
!skip { print }
' "$ART_MANAGER" > "$ART_MANAGER.tmp" && mv "$ART_MANAGER.tmp" "$ART_MANAGER"

echo "✓ Fixed ARTRenderableViewManager.java"
echo "ART package fixed!"
