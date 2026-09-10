# Google Play Services & Play Games v2
-keep class com.google.android.gms.games.** { *; }
-keep interface com.google.android.gms.games.** { *; }
-dontwarn com.google.android.gms.games.**
-dontwarn com.google.android.gms.**

# Android Browser Helper and AndroidX Browser
-keep class com.google.androidbrowserhelper.** { *; }
-keep class androidx.browser.** { *; }

# War of Attrition native bridges, activities, and callbacks
-keep class com.cboler.warofattrition.** { *; }
