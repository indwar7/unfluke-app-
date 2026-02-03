#!/bin/bash

echo "Complete ART package fix..."

# Fix ARTShapeShadowNode.java
SHAPE_FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTShapeShadowNode.java"
if [ -f "$SHAPE_FILE" ]; then
  sed -i '' '/import static com.facebook.react.common.ArrayUtils.copyArray;/d' "$SHAPE_FILE"
  sed -i '' 's/copyArray(/Arrays.copyOf(/g' "$SHAPE_FILE"
  if ! grep -q "import java.util.Arrays;" "$SHAPE_FILE"; then
    sed -i '' '/^package/a\
import java.util.Arrays;
' "$SHAPE_FILE"
  fi
  echo "✓ Fixed ARTShapeShadowNode"
fi

# Fix ARTRenderableViewManager.java
MANAGER_FILE="node_modules/@react-native-community/art/android/src/main/java/com/reactnativecommunity/art/ARTRenderableViewManager.java"
if [ -f "$MANAGER_FILE" ]; then
  # Add missing imports at top
  if ! grep -q "import javax.annotation.Nonnull;" "$MANAGER_FILE"; then
    sed -i '' '/^import android.view.View;/a\
import javax.annotation.Nonnull;\
import javax.annotation.Nullable;
' "$MANAGER_FILE"
  fi
  
  # Remove the problematic method
  perl -i -p0e 's/\s*@Override\s+public void prepareToRecycleView\([^}]+\}\s*//gs' "$MANAGER_FILE"
  
  # Add the correct method before final }
  sed -i '' '$d' "$MANAGER_FILE"
  cat >> "$MANAGER_FILE" << 'JAVA'

  @Nullable
  public View prepareToRecycleView(
      @Nonnull ThemedReactContext reactContext, @Nonnull View view) {
    return view;
  }
}
JAVA
  echo "✓ Fixed ARTRenderableViewManager"
fi

echo "All fixes applied!"
