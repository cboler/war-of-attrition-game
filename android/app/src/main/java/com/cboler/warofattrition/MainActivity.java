package com.cboler.warofattrition;

import android.content.Context;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import androidx.browser.customtabs.CustomTabsCallback;
import androidx.browser.customtabs.CustomTabsClient;
import androidx.browser.customtabs.CustomTabsSession;
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

    /**
     * JS Interface bridge for direct WebView or CustomTabs postMessage integration
     */
    public class WebAppInterface {
        Context context;

        WebAppInterface(Context c) {
            context = c;
        }

        @JavascriptInterface
        public void postMessage(String jsonMessage) {
            if (playGamesBridge != null) {
                runOnUiThread(() -> playGamesBridge.handleWebMessage(jsonMessage));
            }
        }
    }
}
