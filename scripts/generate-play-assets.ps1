Add-Type -AssemblyName System.Drawing

$rootDir = Split-Path -Parent $PSScriptRoot
$assetsDir = Join-Path $rootDir "developer-docs\play-store\assets"
$srcPath = Join-Path $assetsDir "master-promo.jpg"

if (!(Test-Path $assetsDir)) { New-Item -ItemType Directory -Path $assetsDir -Force }
$screenshotsDir = Join-Path $assetsDir "screenshots"
if (!(Test-Path $screenshotsDir)) { New-Item -ItemType Directory -Path $screenshotsDir -Force }

if (!(Test-Path $srcPath)) {
    Write-Error "Source master promo image not found at $srcPath"
    exit 1
}

$src = [System.Drawing.Bitmap]::FromFile($srcPath)

function Crop-Image-To-Bitmap($x, $y, $w, $h, $targetW, $targetH, [System.Drawing.Color]$bgColor = [System.Drawing.Color]::Transparent) {
    $rect = New-Object System.Drawing.Rectangle($x, $y, $w, $h)
    $dest = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    if ($bgColor -ne [System.Drawing.Color]::Transparent) {
        $g.Clear($bgColor)
    }
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetW, $targetH)
    $g.DrawImage($src, $destRect, $rect, [System.Drawing.GraphicsUnit]::Pixel)
    $g.Dispose()
    return $dest
}

function Save-Resized-Icon($sourceBitmap, $targetSize, $destPath) {
    $dest = New-Object System.Drawing.Bitmap($targetSize, $targetSize, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($dest)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    
    $destRect = New-Object System.Drawing.Rectangle(0, 0, $targetSize, $targetSize)
    $srcRect = New-Object System.Drawing.Rectangle(0, 0, $sourceBitmap.Width, $sourceBitmap.Height)
    $g.DrawImage($sourceBitmap, $destRect, $srcRect, [System.Drawing.GraphicsUnit]::Pixel)
    $dest.Save($destPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $dest.Dispose()
    Write-Output "Generated icon: $destPath ($targetSize x $targetSize)"
}

Write-Output "--- Extracting Master 512x512 App Icon ---"
# App Icon badge: x: 13, y: 58, w: 140, h: 174
$appIcon512 = Crop-Image-To-Bitmap 13 58 140 174 512 512
$appIcon512.Save((Join-Path $assetsDir "icon-512x512.png"), [System.Drawing.Imaging.ImageFormat]::Png)

Write-Output "--- Generating PWA Icons in public/icons/ ---"
$pwaIconsDir = Join-Path $rootDir "public\icons"
$sizes = @(72, 96, 128, 144, 152, 192, 384, 512)
foreach ($size in $sizes) {
    $outPath = Join-Path $pwaIconsDir "icon-${size}x${size}.png"
    Save-Resized-Icon $appIcon512 $size $outPath
}

# Favicon
$faviconPath = Join-Path $rootDir "public\favicon.ico"
$icon64 = New-Object System.Drawing.Bitmap(64, 64, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g = [System.Drawing.Graphics]::FromImage($icon64)
$g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$g.DrawImage($appIcon512, (New-Object System.Drawing.Rectangle(0,0,64,64)))
$g.Dispose()
$icon64.Save($faviconPath, [System.Drawing.Imaging.ImageFormat]::Png)
$icon64.Dispose()
Write-Output "Generated Favicon at: $faviconPath"

Write-Output "--- Generating Android Launcher Mipmaps ---"
$resDir = Join-Path $rootDir "android\app\src\main\res"
$mipmaps = @{
    "mipmap-mdpi" = 48
    "mipmap-hdpi" = 72
    "mipmap-xhdpi" = 96
    "mipmap-xxhdpi" = 144
    "mipmap-xxxhdpi" = 192
}

foreach ($folder in $mipmaps.Keys) {
    $targetDir = Join-Path $resDir $folder
    if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir -Force }
    $size = $mipmaps[$folder]
    
    Save-Resized-Icon $appIcon512 $size (Join-Path $targetDir "ic_launcher.png")
    Save-Resized-Icon $appIcon512 $size (Join-Path $targetDir "ic_launcher_round.png")
}

# Adaptive Drawables
$drawableDir = Join-Path $resDir "drawable"
if (!(Test-Path $drawableDir)) { New-Item -ItemType Directory -Path $drawableDir -Force }
$adaptiveFg = Crop-Image-To-Bitmap 163 88 135 146 512 512
$adaptiveFg.Save((Join-Path $drawableDir "ic_launcher_foreground.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$adaptiveFg.Dispose()

$adaptiveBg = Crop-Image-To-Bitmap 308 88 140 146 512 512
$adaptiveBg.Save((Join-Path $drawableDir "ic_launcher_background.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$adaptiveBg.Dispose()

Write-Output "--- Generating Play Store Feature Graphic (1024x500) ---"
$feltColor = [System.Drawing.ColorTranslator]::FromHtml("#0d221c")
$featureGraphic = New-Object System.Drawing.Bitmap(1024, 500, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
$gFeature = [System.Drawing.Graphics]::FromImage($featureGraphic)
$gFeature.Clear($feltColor)
$gFeature.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
$gFeature.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
$gFeature.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

$srcFeatureRect = New-Object System.Drawing.Rectangle(472, 50, 535, 218)
$destFeatureRect = New-Object System.Drawing.Rectangle(0, 0, 1024, 500)
$gFeature.DrawImage($src, $destFeatureRect, $srcFeatureRect, [System.Drawing.GraphicsUnit]::Pixel)
$gFeature.Dispose()
$featureGraphic.Save((Join-Path $assetsDir "feature-graphic-1024x500.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$featureGraphic.Dispose()
Write-Output "Generated Feature Graphic: feature-graphic-1024x500.png"

Write-Output "--- Generating Play Store Gameplay Screenshots (1080x1920) ---"
$screenshots = @(
    @{ Name = "1-challenge-decision.png"; X = 17; Y = 290; W = 176; H = 275 },
    @{ Name = "2-battle-target-selection.png"; X = 208; Y = 290; W = 176; H = 275 },
    @{ Name = "3-battle-resolution.png"; X = 399; Y = 290; W = 176; H = 275 },
    @{ Name = "4-casualty-reveal.png"; X = 590; Y = 290; W = 176; H = 275 },
    @{ Name = "5-story-book.png"; X = 793; Y = 290; W = 176; H = 275 }
)

foreach ($ss in $screenshots) {
    $ssBitmap = Crop-Image-To-Bitmap $ss.X $ss.Y $ss.W $ss.H 1080 1920 $feltColor
    $ssPath = Join-Path $screenshotsDir $ss.Name
    $ssBitmap.Save($ssPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $ssBitmap.Dispose()
    Write-Output "Generated Screenshot: $ssPath (1080x1920)"
}

Write-Output "--- Generating Brand Logo & Title Banner ---"
$brandLogo = Crop-Image-To-Bitmap 15 615 160 60 480 180
$brandLogo.Save((Join-Path $assetsDir "brand-logo-war-of-attrition.png"), [System.Drawing.Imaging.ImageFormat]::Png)
$brandLogo.Dispose()

$appIcon512.Dispose()
$src.Dispose()

Write-Output "All promo and iconography assets generated successfully!"
