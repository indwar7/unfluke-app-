#!/bin/bash

echo "🔧 Fixing @react-native-community/art..."

# Fix ARTRenderableViewManager.java - Add prepareToRecycleView method
FILE1="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTRenderableViewManager.java"

# Find the last closing brace and add method before it
sed -i.backup '/^}$/i\
\
  @Override\
  public void prepareToRecycleView(\
      @androidx.annotation.NonNull ThemedReactContext reactContext,\
      @androidx.annotation.NonNull View view) {\
    super.prepareToRecycleView(reactContext, view);\
  }
' "$FILE1"

echo "✅ Fixed ARTRenderableViewManager.java"
echo "🎉 Done! Now create the patch..."

