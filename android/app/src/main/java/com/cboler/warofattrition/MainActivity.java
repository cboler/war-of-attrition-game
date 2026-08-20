package com.cboler.warofattrition;

import android.net.Uri;
import android.os.Bundle;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

/**
 * Main Activity launching the Trusted Web Activity with Play Games Services & native top banner AdMob integration.
 */
public class MainActivity extends LauncherActivity {
    private static final String TAG = "MainActivity";
    private PlayGamesBridge playGamesBridge;
    private AdMobBannerBridge adMobBannerBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        playGamesBridge = new PlayGamesBridge(this);
        playGamesBridge.initialize();

        adMobBannerBridge = new AdMobBannerBridge(this);
        adMobBannerBridge.initialize();
    }

    @Override
    protected void onPause() {
        super.onPause();
        if (adMobBannerBridge != null) {
            adMobBannerBridge.pause();
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (adMobBannerBridge != null) {
            adMobBannerBridge.resume();
        }
    }

    @Override
    protected void onDestroy() {
        if (adMobBannerBridge != null) {
            adMobBannerBridge.destroy();
        }
        super.onDestroy();
    }

    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = super.getLaunchingUrl();
        if (uri == null) {
            return Uri.parse(getString(R.string.launchUrl));
        }
        return uri;
    }
}
