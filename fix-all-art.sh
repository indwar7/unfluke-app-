#!/bin/bash

echo "Fixing ART package completely..."

# Fix ARTShapeShadowNode
SHAPE_FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTShapeShadowNode.java"

if [ -f "$SHAPE_FILE" ]; then
    # Remove ArrayUtils import
    sed -i.bak '/import static com.facebook.react.common.ArrayUtils/d' "$SHAPE_FILE"
    
    # Add Arrays import if not present
    if ! grep -q "import java.util.Arrays;" "$SHAPE_FILE"; then
        sed -i.bak '1 a\
import java.util.Arrays;' "$SHAPE_FILE"
    fi
    
    # Replace copyArray with Arrays.copyOf
    # This is a simple replacement - might need manual adjustment
    perl -i -pe 's/copyArray\(([^)]+)\)/Arrays.copyOf($1, $1.length)/g' "$SHAPE_FILE"
    
    echo "✓ Fixed ARTShapeShadowNode.java"
else
    echo "✗ ARTShapeShadowNode.java not found"
fi

echo "Done!"
