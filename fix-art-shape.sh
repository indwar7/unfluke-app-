#!/bin/bash

FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTShapeShadowNode.java"

# Backup
cp "$FILE" "$FILE.backup"

# ArrayUtils import ko replace kar with manual array copy
sed -i.bak 's/import static com.facebook.react.common.ArrayUtils.copyArray;//g' "$FILE"

# copyArray calls ko manual implementation se replace kar
# Agar copyArray use ho raha hai toh usko Arrays.copyOf se replace kar
sed -i.bak 's/copyArray(/Arrays.copyOf(/g' "$FILE"

# java.util.Arrays import add kar if needed
if ! grep -q "import java.util.Arrays;" "$FILE"; then
    sed -i.bak '1a\
import java.util.Arrays;
' "$FILE"
fi

echo "✓ Fixed ARTShapeShadowNode.java"
