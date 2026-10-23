package com.cboler.warofattrition;

import java.net.URI;
import java.util.Locale;

/**
 * Decides where a URL opens: inside the game's WebView, in the user's browser, or nowhere.
 * Plain Java (java.net.URI) so it can be unit tested without Android.
 */
public final class GameUrlPolicy {
    public static final String GAME_ORIGIN = "https://cboler.github.io";
    public static final String GAME_PATH = "/war-of-attrition-game";

    public enum Target { GAME, EXTERNAL, BLOCKED }

    private final boolean allowLocalDev;

    public GameUrlPolicy(boolean allowLocalDev) {
        this.allowLocalDev = allowLocalDev;
    }

    public Target classify(String url) {
        if (url == null || url.isEmpty()) return Target.BLOCKED;
        URI uri;
        try {
            uri = new URI(url);
        } catch (Exception e) {
            return Target.BLOCKED;
        }
        String scheme = uri.getScheme() == null ? "" : uri.getScheme().toLowerCase(Locale.ROOT);
        switch (scheme) {
            case "https":
            case "http":
                if (isGameUrl(uri) || isLocalDev(uri)) return Target.GAME;
                return Target.EXTERNAL;
            case "about":
                return Target.GAME;
            case "mailto":
                return Target.EXTERNAL;
            default:
                // javascript:, file:, intent:, content:, data: navigations are never followed.
                return Target.BLOCKED;
        }
    }

    /** True for the hosted game, the only origin allowed to use the native bridge in release. */
    public boolean isGameUrl(String url) {
        try {
            return isGameUrl(new URI(url));
        } catch (Exception e) {
            return false;
        }
    }

    private boolean isGameUrl(URI uri) {
        String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
        String path = uri.getPath() == null ? "" : uri.getPath();
        return "https".equalsIgnoreCase(uri.getScheme())
                && "cboler.github.io".equals(host)
                && uri.getPort() == -1
                && (path.equals(GAME_PATH) || path.startsWith(GAME_PATH + "/"));
    }

    private boolean isLocalDev(URI uri) {
        if (!allowLocalDev) return false;
        String host = uri.getHost() == null ? "" : uri.getHost();
        return "localhost".equals(host) || "127.0.0.1".equals(host);
    }
}
