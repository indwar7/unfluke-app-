#!/bin/bash

FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTRenderableViewManager.java"

# Line 85 se pehle (updateExtraData ke baad) method add karo
sed -i.bak '85 i\
\
  @Override\
  public View prepareToRecycleView(\
      @NonNull ThemedReactContext reactContext, @NonNull View view) {\
    return view;\
  }\
' "$FILE"

echo "✓ Added prepareToRecycleView method"
