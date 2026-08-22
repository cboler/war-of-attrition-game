package com.cboler.warofattrition;

import android.app.Activity;
import android.util.Log;
import android.view.View;
import android.view.ViewGroup;
import android.widget.FrameLayout;
import com.google.android.gms.ads.AdListener;
import com.google.android.gms.ads.AdRequest;
import com.google.android.gms.ads.AdSize;
import com.google.android.gms.ads.AdView;
import com.google.android.gms.ads.LoadAdError;
import com.google.android.gms.ads.MobileAds;

/**
 * Manages native anchored top banner advertisement lifecycle in the Android wrapper.
 * The web application remains 100% ad-free; this bridge only activates natively on Android.
 */
public class AdMobBannerBridge {
    private static final String TAG = "AdMobBannerBridge";
    private final Activity activity;
    private AdView adView;
    private FrameLayout bannerContainer;

    public AdMobBannerBridge(Activity activity) {
        this.activity = activity;
    }

    public void initialize() {
        try {
            boolean adsEnabled = activity.getResources().getBoolean(R.bool.ads_enabled);
            if (!adsEnabled) {
                Log.d(TAG, "AdMob disabled via ads_enabled configuration.");
                return;
            }
            MobileAds.initialize(activity, initializationStatus -> {
                Log.d(TAG, "AdMob MobileAds initialized successfully.");
                activity.runOnUiThread(this::setupAndLoadBanner);
            });
        } catch (Exception e) {
            Log.w(TAG, "Error initializing MobileAds:", e);
        }
    }

    private void setupAndLoadBanner() {
        try {
            String adUnitId = activity.getString(R.string.admob_banner_ad_unit_id);
            if (adUnitId == null || adUnitId.trim().isEmpty()) {
                Log.d(TAG, "AdMob banner ad unit ID not configured. Skipping banner.");
                return;
            }

            adView = new AdView(activity);
            adView.setAdUnitId(adUnitId);
            adView.setAdSize(AdSize.BANNER);

            adView.setAdListener(new AdListener() {
                @Override
                public void onAdLoaded() {
                    super.onAdLoaded();
                    Log.d(TAG, "AdMob top banner loaded successfully.");
                    if (adView != null) {
                        adView.setVisibility(View.VISIBLE);
                    }
                }

                @Override
                public void onAdFailedToLoad(LoadAdError loadAdError) {
                    super.onAdFailedToLoad(loadAdError);
                    Log.w(TAG, "AdMob top banner failed to load: " + loadAdError.getMessage());
                    if (adView != null) {
                        adView.setVisibility(View.GONE);
                    }
                }
            });

            AdRequest adRequest = new AdRequest.Builder().build();
            adView.loadAd(adRequest);
        } catch (Exception e) {
            Log.w(TAG, "Failed to load top banner ad:", e);
        }
    }

    public void pause() {
        if (adView != null) {
            adView.pause();
        }
    }

    public void resume() {
        if (adView != null) {
            adView.resume();
        }
    }

    public void destroy() {
        if (adView != null) {
            adView.destroy();
            adView = null;
        }
    }
}
