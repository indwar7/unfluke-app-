#!/bin/bash

FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTRenderableViewManager.java"

# Add import if not exists
if ! grep -q "androidx.annotation.NonNull" "$FILE"; then
    sed -i.bak '9 a\
import androidx.annotation.NonNull;
' "$FILE"
fi

# Add method before last }
sed -i.bak '86 i\
\
  @Override\
  public View prepareToRecycleView(\
      @NonNull ThemedReactContext reactContext, @NonNull View view) {\
    return view;\
  }
' "$FILE"

echo "✓ Fixed ARTRenderableViewManager.java"
