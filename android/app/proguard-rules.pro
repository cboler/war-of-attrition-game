# Google Play Services & Play Games v2
-keep class com.google.android.gms.games.** { *; }
-keep interface com.google.android.gms.games.** { *; }
-dontwarn com.google.android.gms.games.**
-dontwarn com.google.android.gms.**

# War of Attrition activity, native bridges, and callbacks
-keep class com.cboler.warofattrition.** { *; }
