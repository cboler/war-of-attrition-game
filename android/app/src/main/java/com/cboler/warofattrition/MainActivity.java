package com.cboler.warofattrition;

import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.browser.customtabs.CustomTabsCallback;
import androidx.browser.customtabs.CustomTabsSession;
import com.google.androidbrowserhelper.trusted.LauncherActivity;

/**
 * Main Activity launching the Trusted Web Activity with Play Games Services integration
 * and bidirectional TWA postMessage transport.
 */
public class MainActivity extends LauncherActivity {
    private static final String TAG = "MainActivity";

    private PlayGamesBridge playGamesBridge;
    private PlayGameStatsBridge playGameStatsBridge;
    private TwaPostMessageManager postMessageManager;
    private final Handler mainHandler = new Handler(Looper.getMainLooper());
    private boolean deferNextFinishForPostMessageHandshake;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        try {
            playGamesBridge = new PlayGamesBridge(this);
            playGameStatsBridge = new PlayGameStatsBridge(this);
            postMessageManager = new TwaPostMessageManager(playGamesBridge, playGameStatsBridge);

            // Defensively initialize Play Games achievements bridge.
            // Game Stats initialization is deferred until explicitly requested by web or needed for telemetry.
            playGamesBridge.initialize();
        } catch (Throwable t) {
            Log.e(TAG, "Non-fatal error initializing Play Games native bridges: " + t.getMessage(), t);
        }
    }

    @Override
    protected void onCustomTabsSessionAvailable(@NonNull CustomTabsSession session) {
        Log.i(TAG, "onCustomTabsSessionAvailable hook invoked with session");
        if (postMessageManager != null) {
            // ABH 2.7.3 finishes LauncherActivity immediately after this hook. Keep it alive until
            // Chrome binds the PostMessageService so the callback binder is not destroyed mid-handshake.
            deferNextFinishForPostMessageHandshake = true;
            postMessageManager.setCustomTabsSession(session);
        }
    }

    @Override
    public void finish() {
        if (deferNextFinishForPostMessageHandshake) {
            deferNextFinishForPostMessageHandshake = false;
            Log.i(TAG, "Deferring LauncherActivity finish until postMessage channel is ready");
            return;
        }
        super.finish();
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
     * Resilient CustomTabsCallback implementation that hooks navigation, relationship validation,
     * and postMessage channel events without inheriting QualityEnforcer's intentional crash path.
     */
    private class TwaCustomTabsCallback extends CustomTabsCallback {
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

            // Chrome now owns a live binding to PostMessageService, so ABH can safely release its
            // launcher activity without invalidating the callback during channel setup.
            mainHandler.post(MainActivity.this::finish);
        }

        @Override
        public void onPostMessage(@NonNull String message, @Nullable Bundle extras) {
            super.onPostMessage(message, extras);
            Log.d(TAG, "onPostMessage received from web");
            if (postMessageManager != null) {
                postMessageManager.onPostMessage(message);
            }
        }

        @Override
        public void extraCallback(@NonNull String callbackName, @Nullable Bundle args) {
            super.extraCallback(callbackName, args);
            Log.w(TAG, "CustomTabs extraCallback received: " + callbackName + ", args=" + args);
        }
    }
}
