# R8 / ProGuard rules for release builds.
#
# Enabled via android.enableMinifyInReleaseBuilds=true in gradle.properties.
#
# WHAT IS ALREADY COVERED — do not duplicate it here. These libraries ship
# consumerProguardFiles inside their AARs, which R8 applies automatically:
#
#   react-native        (ReactAndroid/proguard-rules.pro)  — @DoNotStrip, JNI,
#                       NativeModule/JavaScriptModule impls, @ReactProp methods,
#                       com.facebook.react.bridge.**, turbomodule core, Yoga
#   expo-modules-core   — Module subclasses, Record impls, ExpoView, SharedObject,
#                       Enumerable enums, view event callbacks
#   react-native-reanimated, react-native-svg, react-native-iap
#
# WHAT THIS FILE ADDS: the native modules that ship NO consumer rules of their
# own. Verified by grepping consumerProguardFiles across node_modules — these
# packages have none, so nothing keeps them but this file.
#
# The bias here is deliberately toward over-keeping. These packages are small
# next to the app bundle, and a wrongly-stripped reflective lookup surfaces as a
# production-only crash that is expensive to trace back to R8.

# ---------------------------------------------------------------------------
# Crash-trace readability
# ---------------------------------------------------------------------------
# Without SourceFile/LineNumberTable, every Play Vitals stack trace becomes
# unreadable. AGP writes the mapping file into the AAB automatically
# (BUNDLE-METADATA/com.android.tools.build.obfuscation/proguard.map) and Play
# deobfuscates with it, so keeping these costs nothing and preserves the only
# crash visibility this app has.
-keepattributes SourceFile,LineNumberTable
-renamesourcefileattribute SourceFile

# Reflection, generics and annotation lookups rely on these being intact.
-keepattributes *Annotation*,Signature,InnerClasses,EnclosingMethod,Exceptions

# ---------------------------------------------------------------------------
# Native modules without consumer rules
# ---------------------------------------------------------------------------

# react-native-screens — navigation containers, reflective window traits.
-keep class com.swmansion.rnscreens.** { *; }

# react-native-gesture-handler — handler classes resolved by name from JS.
-keep class com.swmansion.gesturehandler.** { *; }

# react-native-worklets — worklet runtime, called across the JSI boundary.
-keep class com.swmansion.worklets.** { *; }

# react-native-nitro-modules AND react-native-iap. IAP is built on Nitro and
# both live under com.margelo.nitro. Nitro binds JNI by exact class and method
# name, so obfuscation here breaks purchases at runtime — silently, and only in
# release builds.
-keep class com.margelo.nitro.** { *; }

# @react-native-async-storage/async-storage. This is the backing store for
# redux-persist, so anything R8 breaks here logs every user out and loses their
# persisted state. It ships no consumer rules of its own.
-keep class com.reactnativecommunity.asyncstorage.** { *; }

# react-native-fbsdk-next bridge.
-keep class com.facebook.reactnative.androidsdk.** { *; }

# Facebook SDK core — it reflects over its own model classes.
-keep class com.facebook.** { *; }
-dontwarn com.facebook.**

-keep class com.reactnativecommunity.webview.** { *; }
-keep class com.reactnativekeyboardcontroller.** { *; }
-keep class com.th3rdwave.safeareacontext.** { *; }
-keep class com.reactnativecommunity.picker.** { *; }
-keep class com.reactcommunity.rndatetimepicker.** { *; }
-keep class com.reactnativegooglesignin.** { *; }

# ---------------------------------------------------------------------------
# React Native registration surfaces — catch-all safety net
# ---------------------------------------------------------------------------
# React Native's own rules keep NativeModule and JavaScriptModule implementors,
# but not ReactPackage or ViewManager subclasses. Those are the classes that
# register every native module and every custom view with the JS runtime, so
# these keeps cover any current or future dependency that ships no rules of its
# own — the exact failure mode that async-storage above would have been.
-keep class * extends com.facebook.react.ReactPackage { *; }
-keep class * implements com.facebook.react.ReactPackage { *; }
-keep class * extends com.facebook.react.uimanager.ViewManager { *; }
-keep class * extends com.facebook.react.uimanager.ReactShadowNode { *; }

# ---------------------------------------------------------------------------
# Google Play services / Sign-In / In-App Billing
# ---------------------------------------------------------------------------
# GMS ships its own rules; these guard the reflective surfaces and silence
# warnings about optional classes that are absent at compile time.
-keep class com.google.android.gms.common.** { *; }
-keep class com.google.android.gms.auth.** { *; }
-keep class com.android.billingclient.** { *; }
-dontwarn com.google.android.gms.**
-dontwarn com.google.errorprone.annotations.**
-dontwarn javax.annotation.**

# ---------------------------------------------------------------------------
# Kotlin runtime
# ---------------------------------------------------------------------------
# Most native modules here are Kotlin. Coroutines uses a reflective
# service-loader path, and kotlin.Metadata must survive for reflection.
-keep class kotlin.Metadata { *; }
-keepclassmembers class kotlinx.coroutines.** { volatile <fields>; }
-dontwarn kotlinx.coroutines.**
-dontwarn kotlin.**

# ---------------------------------------------------------------------------
# Android platform idioms
# ---------------------------------------------------------------------------
# Enums, Parcelables and Serializables are all constructed reflectively by the
# framework, so their members must not be renamed or removed.
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

-keepclassmembers class * implements android.os.Parcelable {
    public static final ** CREATOR;
}

-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}

# ---------------------------------------------------------------------------
# App entry points
# ---------------------------------------------------------------------------
# R8 keeps manifest-referenced classes automatically; this is belt-and-braces
# because losing either one is a launch-time crash for every user.
-keep class in.unfluke.app.MainActivity { *; }
-keep class in.unfluke.app.MainApplication { *; }
