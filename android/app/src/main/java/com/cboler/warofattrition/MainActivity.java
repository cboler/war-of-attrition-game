package com.cboler.warofattrition;

import android.annotation.SuppressLint;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.util.Log;
import android.view.ViewGroup;
import android.webkit.ConsoleMessage;
import android.webkit.RenderProcessGoneDetail;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.FrameLayout;
import androidx.activity.EdgeToEdge;
import androidx.activity.OnBackPressedCallback;
import androidx.activity.SystemBarStyle;
import androidx.annotation.NonNull;
import androidx.annotation.Nullable;
import androidx.annotation.RequiresApi;
import androidx.appcompat.app.AppCompatActivity;
import androidx.browser.customtabs.CustomTabColorSchemeParams;
import androidx.browser.customtabs.CustomTabsIntent;
import androidx.core.graphics.Insets;
import androidx.core.splashscreen.SplashScreen;
import androidx.core.view.ViewCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.webkit.WebMessageCompat;
import androidx.webkit.WebSettingsCompat;
import androidx.webkit.WebViewCompat;
import androidx.webkit.WebViewFeature;

import java.util.HashSet;
import java.util.Set;

/**
 * Hosts War of Attrition in an in-app WebView.
 *
 * <p>The game is the hosted PWA (so web deploys reach players immediately); this activity adds
 * the native pieces: an origin-restricted bridge ({@code window.AttritionNative}) to Play Games
 * and Game Stats, system-bar insets, a splash screen, links to other sites in the browser, an
 * offline screen, and recovery if the WebView renderer dies.
 */
public class MainActivity extends AppCompatActivity {
    private static final String TAG = "MainActivity";
    static final String BRIDGE_OBJECT = "AttritionNative";
    private static final long SPLASH_MAX_MS = 4000L;
    private static final String STATE_WEBVIEW = "webview";

    private FrameLayout root;
    private WebView webView;
    private NativeBridgeRouter router;
    private GameUrlPolicy urlPolicy;
    private String launchUrl;
    private boolean firstPageVisible = false;
    private boolean splashTimedOut = false;
    private final Handler handler = new Handler(Looper.getMainLooper());

    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        SplashScreen splash = SplashScreen.installSplashScreen(this);
        super.onCreate(savedInstanceState);
        splash.setKeepOnScreenCondition(() -> !firstPageVisible && !splashTimedOut);
        handler.postDelayed(() -> splashTimedOut = true, SPLASH_MAX_MS);

        int background = getColor(R.color.backgroundColor);
        EdgeToEdge.enable(this, SystemBarStyle.dark(background), SystemBarStyle.dark(background));

        urlPolicy = new GameUrlPolicy(BuildConfig.DEBUG);
        launchUrl = resolveLaunchUrl(getIntent());

        PlayGamesBridge playGames = new PlayGamesBridge(this);
        PlayGameStatsBridge gameStats = new PlayGameStatsBridge(this);
        router = new NativeBridgeRouter(playGames, gameStats);

        root = new FrameLayout(this);
        root.setBackgroundColor(background);
        setContentView(root);
        ViewCompat.setOnApplyWindowInsetsListener(root, (view, insets) -> {
            Insets bars = insets.getInsets(
                    WindowInsetsCompat.Type.systemBars() | WindowInsetsCompat.Type.displayCutout());
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return WindowInsetsCompat.CONSUMED;
        });

        createWebView(savedInstanceState);

        getOnBackPressedDispatcher().addCallback(this, new OnBackPressedCallback(true) {
            @Override
            public void handleOnBackPressed() {
                if (webView != null && webView.canGoBack()) {
                    webView.goBack();
                } else {
                    finish();
                }
            }
        });

        try {
            playGames.initialize();
        } catch (Throwable t) {
            Log.e(TAG, "Play Games initialisation failed; local play continues", t);
        }
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void createWebView(@Nullable Bundle savedInstanceState) {
        webView = new WebView(this);
        webView.setBackgroundColor(getColor(R.color.backgroundColor));
        root.addView(webView, new FrameLayout.LayoutParams(
                ViewGroup.LayoutParams.MATCH_PARENT, ViewGroup.LayoutParams.MATCH_PARENT));

        WebSettings settings = webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setMediaPlaybackRequiresUserGesture(false);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(false);
        settings.setSupportMultipleWindows(false);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        if (WebViewFeature.isFeatureSupported(WebViewFeature.ALGORITHMIC_DARKENING)) {
            // The game has its own dark palette; automatic darkening would distort it.
            WebSettingsCompat.setAlgorithmicDarkeningAllowed(settings, false);
        }
        WebView.setWebContentsDebuggingEnabled(BuildConfig.DEBUG);

        webView.setWebViewClient(new GameWebViewClient());
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public boolean onConsoleMessage(ConsoleMessage message) {
                if (BuildConfig.DEBUG) {
                    Log.d(TAG, "console: " + message.message());
                }
                return true;
            }
        });
        installBridge();

        Bundle webState = savedInstanceState == null ? null : savedInstanceState.getBundle(STATE_WEBVIEW);
        if (webState == null || webView.restoreState(webState) == null) {
            Log.i(TAG, "Loading " + launchUrl);
            webView.loadUrl(launchUrl);
        }
    }

    // The feature check below returns early, which lint's RequiresFeature check cannot see.
    @SuppressLint("RequiresFeature")
    private void installBridge() {
        if (!WebViewFeature.isFeatureSupported(WebViewFeature.WEB_MESSAGE_LISTENER)) {
            // Android System WebView older than ~M86. The game still runs; Play sync is off.
            Log.w(TAG, "WEB_MESSAGE_LISTENER unsupported; Play Games bridge disabled");
            return;
        }
        Set<String> origins = new HashSet<>();
        origins.add(GameUrlPolicy.GAME_ORIGIN);
        if (BuildConfig.DEBUG) {
            Uri dev = Uri.parse(launchUrl);
            if ("localhost".equals(dev.getHost()) || "127.0.0.1".equals(dev.getHost())) {
                origins.add(dev.getScheme() + "://" + dev.getHost() + ":" + dev.getPort());
            }
        }
        WebViewCompat.addWebMessageListener(webView, BRIDGE_OBJECT, origins,
                (view, message, sourceOrigin, isMainFrame, replyProxy) -> {
                    if (!isMainFrame || message.getType() != WebMessageCompat.TYPE_STRING) return;
                    router.onPageMessage(message.getData(), reply -> {
                        replyProxy.postMessage(reply);
                        return true;
                    });
                });
    }

    /** The hosted game, a deep link into it, or (debug builds only) a local dev server. */
    private String resolveLaunchUrl(@Nullable Intent intent) {
        if (BuildConfig.DEBUG && intent != null) {
            String override = intent.getStringExtra("url");
            if (override != null && !override.isEmpty()) return override;
        }
        Uri data = intent == null ? null : intent.getData();
        if (data != null && urlPolicy.isGameUrl(data.toString())) {
            return data.toString();
        }
        return getString(R.string.launchUrl);
    }

    @Override
    protected void onNewIntent(@NonNull Intent intent) {
        super.onNewIntent(intent);
        Uri data = intent.getData();
        if (data != null && urlPolicy.isGameUrl(data.toString()) && webView != null) {
            webView.loadUrl(data.toString());
        }
    }

    private void openExternally(Uri uri) {
        try {
            if ("mailto".equalsIgnoreCase(uri.getScheme())) {
                startActivity(new Intent(Intent.ACTION_SENDTO, uri));
                return;
            }
            int color = getColor(R.color.backgroundColor);
            new CustomTabsIntent.Builder()
                    .setDefaultColorSchemeParams(new CustomTabColorSchemeParams.Builder()
                            .setToolbarColor(color).build())
                    .build()
                    .launchUrl(this, uri);
        } catch (ActivityNotFoundException e) {
            try {
                startActivity(new Intent(Intent.ACTION_VIEW, uri));
            } catch (ActivityNotFoundException ignored) {
                Log.w(TAG, "No app can open " + uri);
            }
        }
    }

    private void showOfflinePage() {
        String retry = launchUrl.replace("\"", "%22");
        String html = "<!doctype html><html><head><meta name=viewport content='width=device-width,initial-scale=1'>"
                + "<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;"
                + "background:#0d221c;color:#f3e7c9;font-family:Georgia,serif;text-align:center;padding:24px;box-sizing:border-box}"
                + "a{display:inline-block;margin-top:20px;padding:12px 28px;border-radius:6px;background:#c9a24a;"
                + "color:#0d221c;text-decoration:none;font-family:sans-serif;font-weight:600}</style></head><body><div>"
                + "<h1 style='font-weight:normal'>The field is out of reach</h1>"
                + "<p>Attrition needs a connection the first time it loads. After that it can play offline.</p>"
                + "<a href=\"" + retry + "\">Try again</a></div></body></html>";
        webView.loadDataWithBaseURL(null, html, "text/html", "UTF-8", null);
    }

    private class GameWebViewClient extends WebViewClient {
        @Override
        public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
            Uri uri = request.getUrl();
            switch (urlPolicy.classify(uri.toString())) {
                case GAME:
                    return false;
                case EXTERNAL:
                    openExternally(uri);
                    return true;
                default:
                    Log.w(TAG, "Blocked navigation to " + uri.getScheme() + ": URL");
                    return true;
            }
        }

        @Override
        public void onPageStarted(WebView view, String url, Bitmap favicon) {
            // A new document has no bridge until it says hello.
            router.onPageGone();
        }

        @Override
        public void onPageCommitVisible(WebView view, String url) {
            firstPageVisible = true;
        }

        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (request.isForMainFrame()) {
                Log.w(TAG, "Main frame failed (" + error.getErrorCode() + "): " + error.getDescription());
                firstPageVisible = true;
                showOfflinePage();
            }
        }

        @RequiresApi(26)
        @Override
        public boolean onRenderProcessGone(WebView view, RenderProcessGoneDetail detail) {
            // The renderer crashed or was reclaimed for memory. Rebuild the WebView instead of
            // letting the app crash; game progress lives in web storage and survives.
            Log.e(TAG, "WebView renderer gone (crashed=" + detail.didCrash() + "); rebuilding");
            router.onPageGone();
            root.removeView(webView);
            webView.destroy();
            createWebView(null);
            return true;
        }
    }

    @Override
    protected void onSaveInstanceState(@NonNull Bundle outState) {
        super.onSaveInstanceState(outState);
        if (webView != null) {
            Bundle webState = new Bundle();
            webView.saveState(webState);
            outState.putBundle(STATE_WEBVIEW, webState);
        }
    }

    @Override
    protected void onResume() {
        super.onResume();
        if (webView != null) webView.onResume();
    }

    @Override
    protected void onPause() {
        if (webView != null) webView.onPause();
        super.onPause();
    }

    @Override
    protected void onDestroy() {
        handler.removeCallbacksAndMessages(null);
        if (webView != null) {
            root.removeView(webView);
            webView.destroy();
            webView = null;
        }
        super.onDestroy();
    }
}
