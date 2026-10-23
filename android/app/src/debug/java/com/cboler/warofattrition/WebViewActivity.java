package com.cboler.warofattrition;

import android.annotation.SuppressLint;
import android.net.Uri;
import android.os.Bundle;
import android.util.Log;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import androidx.activity.OnBackPressedCallback;
import androidx.appcompat.app.AppCompatActivity;
import androidx.webkit.JavaScriptReplyProxy;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.util.HashSet;
import java.util.Set;

/**
 * SPIKE (debug builds only): hosts the game in an in-app WebView instead of a Trusted Web Activity.
 *
 * <p>The game's screen then belongs to this app's own activity, so Android credits play time to
 * the app package, and the Play Games bridge becomes a direct, origin-restricted JavaScript
 * channel ({@code window.AttritionNative}) instead of Chrome's Custom Tabs postMessage handshake.
 * Routing and buffering are reused from {@link TwaPostMessageManager}; only the transport differs.
 *
 * <p>Launch URL: the hosted game by default, or {@code --es url <url>} for a local dev server
 * (forward it with {@code adb reverse tcp:4200 tcp:4200}).
 */
public class WebViewActivity extends AppCompatActivity {
    private static final String TAG = "WebViewActivity";
    static final String BRIDGE_OBJECT = "AttritionNative";
    private static final String DEFAULT_URL = "https://cboler.github.io/war-of-attrition-game/?webview=1";

    private WebView webView;
    private TwaPostMessageManager manager;
    private JavaScriptReplyProxy replyProxy;

    @SuppressLint("SetJavaScriptEnabled")
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        webView = new WebView(this);
        setContentView(webView);

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        webView.setWebViewClient(new WebViewClient());

        PlayGamesBridge playGames = new PlayGamesBridge(this);
        PlayGameStatsBridge gameStats = new PlayGameStatsBridge(this);
        manager = new TwaPostMessageManager(playGames, gameStats);
        manager.setPostMessageSender(new TwaPostMessageManager.PostMessageSender() {
            @Override
            public int postMessage(String message) {
                if (replyProxy == null) return -1;
                replyProxy.postMessage(message);
                return TwaPostMessageManager.POST_MESSAGE_RESULT_SUCCESS;
            }

            @Override
            public boolean requestPostMessageChannel(Uri sourceOrigin, Uri targetOrigin) {
                // The page opens the channel itself by saying hello; nothing to request.
                return true;
            }
        });

        String url = getIntent().getStringExtra("url");
        if (url == null || url.isEmpty()) url = DEFAULT_URL;
        installBridge(url);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        playGames.initialize();
        Log.i(TAG, "Loading " + url);
        webView.loadUrl(url);
    }

    private void installBridge(String url) {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            Log.w(TAG, "WEB_MESSAGE_LISTENER unsupported; Play Games bridge disabled");
            return;
        }
        Set<String> origins = new HashSet<>();
        origins.add("https://cboler.github.io");
        Uri parsed = Uri.parse(url);
        if ("localhost".equals(parsed.getHost())) {
            origins.add(parsed.getScheme() + "://localhost:" + parsed.getPort());
        }
        WebViewCompat.addWebMessageListener(webView, BRIDGE_OBJECT, origins,
                (view, message, sourceOrigin, isMainFrame, proxy) -> {
                    if (!isMainFrame) return;
                    String data = message.getType() == WebMessageCompat.TYPE_STRING ? message.getData() : null;
                    if (data == null) return;
                    if (data.contains("\"TWA_PORT_HANDSHAKE\"")) {
                        // Every document says hello once at boot. Treat it as a fresh channel:
                        // reset per-document state, then mark ready so buffered replies flow.
                        replyProxy = proxy;
                        Log.i(TAG, "Bridge connected from " + sourceOrigin);
                        manager.onNavigationFinished();
                        manager.onNavigationSettledForPostMessage();
                        manager.onMessageChannelReady();
                        return;
                    }
                    replyProxy = proxy;
                    manager.onPostMessage(data);
                });
        Log.i(TAG, "Bridge object '" + BRIDGE_OBJECT + "' installed for " + origins);
    }

    @Override
    protected void onResume() {
        super.onResume();
        webView.onResume();
    }

    @Override
    protected void onPause() {
        webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        webView.destroy();
        super.onDestroy();
    }
}
