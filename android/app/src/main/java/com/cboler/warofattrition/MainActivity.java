package com.cboler.warofattrition;

import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsCallback;
import androidx.browser.customtabs.CustomTabsSession;
import com.google.androidbrowserhelper.trusted.LauncherActivity;
import com.google.androidbrowserhelper.trusted.QualityEnforcer;

/**
 * Main Activity launching the Trusted Web Activity with Play Games Services integration
 * and bidirectional TWA postMessage transport.
 */
public class MainActivity extends LauncherActivity {
    private static final String TAG = "MainActivity";

    private PlayGamesBridge playGamesBridge;
    private PlayGameStatsBridge playGameStatsBridge;
    private TwaPostMessageManager postMessageManager;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        playGamesBridge = new PlayGamesBridge(this);
        playGameStatsBridge = new PlayGameStatsBridge(this);
        postMessageManager = new TwaPostMessageManager(playGamesBridge, playGameStatsBridge);

        playGamesBridge.initialize();
        playGameStatsBridge.initialize();
    }

    @Override
    protected void onCustomTabsSessionAvailable(@NonNull CustomTabsSession session) {
        Log.i(TAG, "onCustomTabsSessionAvailable hook invoked with session");
        if (postMessageManager != null) {
            postMessageManager.setCustomTabsSession(session);
        }
    }

    @NonNull
    @Override
    protected CustomTabsCallback getCustomTabsCallback() {
        return new TwaCustomTabsCallback();
    }

    @Override
    protected Uri getLaunchingUrl() {
        Uri uri = super.getLaunchingUrl();
        if (uri == null) {
            return Uri.parse(getString(R.string.launchUrl));
        }
        return uri;
    }

    /**
     * Subclass of QualityEnforcer to preserve ABH quality enforcement crashes
     * while hooking navigation, relationship validation, and postMessage channel events.
     */
    private class TwaCustomTabsCallback extends QualityEnforcer {
        @Override
        public void onNavigationEvent(int navigationEvent, @Nullable Bundle extras) {
            super.onNavigationEvent(navigationEvent, extras);
            Log.d(TAG, "onNavigationEvent: " + navigationEvent);
            if (navigationEvent == NAVIGATION_FINISHED) {
                Log.i(TAG, "Navigation finished in TWA");
                if (postMessageManager != null) {
                    postMessageManager.onNavigationFinished();
                }
            }
        }

        @Override
        public void onRelationshipValidationResult(
                int relation, @NonNull Uri requestedOrigin, boolean result, @Nullable Bundle extras) {
            super.onRelationshipValidationResult(relation, requestedOrigin, result, extras);
            Log.i(TAG, "Relationship validation for origin " + requestedOrigin
                    + " (relation=" + relation + "): result=" + result);
        }

        @Override
        public void onMessageChannelReady(@Nullable Bundle extras) {
            super.onMessageChannelReady(extras);
            Log.i(TAG, "onMessageChannelReady callback received");
            if (postMessageManager != null) {
                postMessageManager.onMessageChannelReady();
            }
        }

        @Override
        public void onPostMessage(@NonNull String message, @Nullable Bundle extras) {
            super.onPostMessage(message, extras);
            Log.d(TAG, "onPostMessage received from web");
            if (postMessageManager != null) {
                postMessageManager.onPostMessage(message);
            }
        }
    }
}
