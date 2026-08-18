package com.cboler.warofattrition;

import android.net.Uri;
import android.os.Bundle;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

/**
 * Main Activity launching the Trusted Web Activity with Play Games Services integration.
 */
public class MainActivity extends LauncherActivity {
    private static final String TAG = "MainActivity";
    private PlayGamesBridge playGamesBridge;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        playGamesBridge = new PlayGamesBridge(this);
        playGamesBridge.initialize();
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
