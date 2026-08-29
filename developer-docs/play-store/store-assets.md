# Google Play Store Visual Assets Inventory

Static promo graphics and high-resolution icons are stored in [`assets/`](assets/). The authoritative gameplay screenshot upload package is generated separately under [`store-assets/screenshots/`](../../store-assets/screenshots/README.md).

---

## Visual Assets Summary

| Asset | Specifications | Source File Path in Repository | Purpose |
| :--- | :--- | :--- | :--- |
| **App Icon** | 512×512 PNG (32-bit Argb) | [`assets/icon-512x512.png`](assets/icon-512x512.png) | Play Console App Icon & PWA Manifest |
| **Feature Graphic** | 1024×500 PNG (24-bit Rgb) | [`assets/feature-graphic-1024x500.png`](assets/feature-graphic-1024x500.png) | Play Console Store Listing Header |
| **Brand Logo** | 480×180 PNG | [`assets/brand-logo-war-of-attrition.png`](assets/brand-logo-war-of-attrition.png) | Marketing / Promotional Brand Mark |
| **Master Sheet** | 1024×682 JPEG | [`assets/master-promo.jpg`](assets/master-promo.jpg) | Original Promo & Gameplay Sheet |
| **Listing Screenshots** | 11 deterministic PNGs | [`store-assets/screenshots/`](../../store-assets/screenshots/README.md) | Phone, 7-inch tablet, and 10-inch tablet Play Store listing galleries |

---

## Gameplay listing screenshots

Run `npm run screenshots:store`, then `npm run screenshots:validate`. The pipeline renders production Angular configuration through deterministic real-UI scene fixtures and creates exactly:

- 5 phone captures at 1080×1920.
- 3 7-inch tablet captures at 1200×1920.
- 3 10-inch tablet captures at 2560×1600.

Upload those generated files to **Google Play Console** → **Store presence** → **Main store listing**. Follow the generated [`README.md`](../../store-assets/screenshots/README.md) for ordering and alt text. The older PNGs under `assets/screenshots/` are retained reference material, not the authoritative upload set.

This is a store-listing screenshot pipeline only. The repository has no separate Google Play Games profile-graphics capture pipeline or dedicated profile-image upload set; Play Games configuration here is achievement metadata documented in [`achievements-manifest.md`](achievements-manifest.md).

---

## Generated Application Assets

The new iconography has also been generated and integrated across the entire app stack:

* **PWA Web App Icons:** [`public/icons/`](../../public/icons/) (`icon-72x72.png` through `icon-512x512.png`) and [`public/favicon.ico`](../../public/favicon.ico).
* **Android Launcher Mipmaps:** [`android/app/src/main/res/`](../../android/app/src/main/res/) (`mipmap-mdpi`, `mipmap-hdpi`, `mipmap-xhdpi`, `mipmap-xxhdpi`, `mipmap-xxxhdpi`, `drawable/ic_launcher_background.png`, `drawable/ic_launcher_foreground.png`).
