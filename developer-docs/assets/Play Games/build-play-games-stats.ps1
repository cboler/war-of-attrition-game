# Run from any directory. Icons already use the names in RepetitiveStatsConfig.csv.
# Resizes source icons to upload-ready 512x512 PNGs (<= 1 MB) in a disposable generated/ directory.
# Packages RepetitiveStatsConfig.csv and the ten 512x512 icons at the ZIP root.
# PlayerGameEvent.csv stays separate and is NOT included in the ZIP.
# Alternate artwork in alternates/ and source PNGs are preserved untouched.
[CmdletBinding()]
param()

$ErrorActionPreference = 'Stop'

# Define paths
$sourceDir = $PSScriptRoot
$generatedDir = Join-Path $sourceDir 'generated'
$zipPath = Join-Path $sourceDir 'game-stats-v1.zip'
$temporaryZip = Join-Path $sourceDir ('.game-stats-' + [guid]::NewGuid().ToString('N') + '.zip')

# Required source CSVs
foreach ($name in @('PlayerGameEvent.csv', 'RepetitiveStatsConfig.csv')) {
    $csvPath = Join-Path $sourceDir $name
    if (-not (Test-Path -LiteralPath $csvPath -PathType Leaf)) {
        throw "Required CSV not found: $name at $csvPath"
    }
}

# Validate RepetitiveStatsConfig.csv structure and stat references
$configPath = Join-Path $sourceDir 'RepetitiveStatsConfig.csv'
$stats = @(Import-Csv -LiteralPath $configPath)
if ($stats.Count -eq 0 -or $stats[0].PSObject.Properties.Name -notcontains 'Icon File Name') {
    throw 'RepetitiveStatsConfig.csv must contain stats and an "Icon File Name" column.'
}

$expectedIcons = @(
    'wars_fought.png',
    'wars_won.png',
    'comeback_victories.png',
    'greatest_comeback.png',
    'battles_fought.png',
    'deepest_battle.png',
    'longest_war.png',
    'reinforcements_sent.png',
    'successful_reinforcements.png',
    'aces_felled_by_twos.png'
)

# Verify expected icon filenames are unique
$uniqueExpected = @($expectedIcons | Sort-Object -Unique)
if ($uniqueExpected.Count -ne $expectedIcons.Count) {
    throw 'Expected icon filename list contains duplicates.'
}

$csvIconNames = @($stats | ForEach-Object { $_.'Icon File Name' })
if ($csvIconNames.Count -ne $expectedIcons.Count) {
    throw "RepetitiveStatsConfig.csv references $($csvIconNames.Count) icons, expected $($expectedIcons.Count)."
}

foreach ($name in $csvIconNames) {
    if ($name -cnotmatch '^[a-z0-9_]+\.png$') {
        throw "Invalid icon filename in CSV: '$name'. Expected a lowercase PNG basename."
    }
    if ($expectedIcons -notcontains $name) {
        throw "Unexpected icon filename in CSV: '$name'."
    }
    $sourceIconPath = Join-Path $sourceDir $name
    if (-not (Test-Path -LiteralPath $sourceIconPath -PathType Leaf)) {
        throw "Source icon referenced by CSV not found: $name at $sourceIconPath"
    }
    $srcItem = Get-Item -LiteralPath $sourceIconPath
    if ($srcItem.Length -eq 0) {
        throw "Source icon is empty: $name"
    }
}

# Image processing strategy:
# 1. Existing ImageMagick (magick) if installed
# 2. Installed repo/runtime image tool (none present)
# 3. Native .NET System.Drawing (GDI+) in PowerShell
$magickCmd = Get-Command magick -ErrorAction SilentlyContinue
$toolName = ''

if ($magickCmd) {
    $toolName = 'ImageMagick (magick)'
} else {
    Add-Type -AssemblyName System.Drawing
    $toolName = '.NET System.Drawing (GDI+)'
}
Write-Host "Using image processing tool: $toolName"

function Resize-Icon {
    param(
        [string]$SourcePath,
        [string]$DestinationPath,
        [int]$TargetWidth = 512,
        [int]$TargetHeight = 512
    )

    if ($magickCmd) {
        & magick convert $SourcePath -resize "${TargetWidth}x${TargetHeight}!" -strip $DestinationPath
        if ($LASTEXITCODE -ne 0) {
            throw "ImageMagick failed to resize '$SourcePath'"
        }
    } else {
        $srcImg = [System.Drawing.Image]::FromFile($SourcePath)
        try {
            $destBmp = New-Object System.Drawing.Bitmap($TargetWidth, $TargetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
            try {
                $g = [System.Drawing.Graphics]::FromImage($destBmp)
                try {
                    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
                    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
                    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
                    $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
                    $g.Clear([System.Drawing.Color]::Transparent)
                    $rect = New-Object System.Drawing.Rectangle(0, 0, $TargetWidth, $TargetHeight)
                    $g.DrawImage($srcImg, $rect)
                    $destBmp.Save($DestinationPath, [System.Drawing.Imaging.ImageFormat]::Png)
                }
                finally {
                    $g.Dispose()
                }
            }
            finally {
                $destBmp.Dispose()
            }
        }
        finally {
            $srcImg.Dispose()
        }
    }
}

# Clean and recreate disposable generated/ directory
if (Test-Path -LiteralPath $generatedDir) {
    Remove-Item -LiteralPath $generatedDir -Recurse -Force
}
New-Item -ItemType Directory -Path $generatedDir -Force | Out-Null

# Copy RepetitiveStatsConfig.csv into generated/
$generatedConfigPath = Join-Path $generatedDir 'RepetitiveStatsConfig.csv'
Copy-Item -LiteralPath $configPath -Destination $generatedConfigPath -Force

# Generate 512x512 icons into generated/
Write-Host "Resizing icons to 512x512..."
foreach ($iconName in $expectedIcons) {
    $srcPath = Join-Path $sourceDir $iconName
    $destPath = Join-Path $generatedDir $iconName
    Resize-Icon -SourcePath $srcPath -DestinationPath $destPath -TargetWidth 512 -TargetHeight 512
}

# Validate generated images
Write-Host "Validating generated icon files..."
foreach ($iconName in $expectedIcons) {
    $destPath = Join-Path $generatedDir $iconName
    if (-not (Test-Path -LiteralPath $destPath -PathType Leaf)) {
        throw "Generated icon missing: $iconName"
    }

    if ([System.IO.Path]::GetExtension($destPath) -ne '.png') {
        throw "Generated icon does not have .png extension: $iconName"
    }

    $destItem = Get-Item -LiteralPath $destPath
    if ($destItem.Length -le 0) {
        throw "Generated icon is empty: $iconName"
    }

    if ($destItem.Length -gt 1MB) {
        throw "Generated icon exceeds 1 MB limit: $iconName ($($destItem.Length) bytes)"
    }

    # Verify exact 512x512 dimensions
    Add-Type -AssemblyName System.Drawing
    $verifyImg = [System.Drawing.Image]::FromFile($destPath)
    try {
        if ($verifyImg.Width -ne 512 -or $verifyImg.Height -ne 512) {
            throw "Generated icon $iconName dimensions are $($verifyImg.Width)x$($verifyImg.Height), expected 512x512."
        }
    }
    finally {
        $verifyImg.Dispose()
    }

    $sizeKb = [math]::Round($destItem.Length / 1KB, 1)
    Write-Host "  $iconName`: 512x512, $sizeKb KB ($($destItem.Length) bytes)"
}

# Validate generated directory contents (must be exactly RepetitiveStatsConfig.csv + 10 icons)
$expectedGeneratedFiles = @('RepetitiveStatsConfig.csv') + $expectedIcons
$actualGeneratedItems = @(Get-ChildItem -LiteralPath $generatedDir)
$actualGeneratedNames = @($actualGeneratedItems | ForEach-Object { $_.Name })

if ($actualGeneratedNames.Count -ne $expectedGeneratedFiles.Count) {
    throw "Generated directory contains $($actualGeneratedNames.Count) files, expected $($expectedGeneratedFiles.Count)."
}

$generatedDiff = @(Compare-Object -ReferenceObject ($expectedGeneratedFiles | Sort-Object) -DifferenceObject ($actualGeneratedNames | Sort-Object))
if ($generatedDiff.Count -gt 0) {
    throw "Generated directory contents do not match expected files: $($generatedDiff | Out-String)"
}

# Build game-stats-v1.zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
$zipFiles = @($expectedGeneratedFiles | ForEach-Object { Join-Path $generatedDir $_ })

try {
    Compress-Archive -LiteralPath $zipFiles -DestinationPath $temporaryZip -CompressionLevel Optimal
    $archive = [System.IO.Compression.ZipFile]::OpenRead($temporaryZip)
    try {
        $entries = @($archive.Entries)
        if ($entries.Count -ne 11) {
            throw "ZIP archive must contain exactly 11 entries, found $($entries.Count)."
        }

        $entryNames = @($entries | ForEach-Object { $_.FullName })

        # Verify all entries are at root with no directories
        foreach ($entry in $entries) {
            if ($entry.FullName.Contains('/') -or $entry.FullName.Contains('\')) {
                throw "ZIP entry is inside a subdirectory: '$($entry.FullName)'"
            }
            if ($entry.Name -ne $entry.FullName) {
                throw "ZIP entry name mismatch: '$($entry.FullName)'"
            }
        }

        # Verify exact file set matches expected files
        $zipDiff = @(Compare-Object -ReferenceObject ($expectedGeneratedFiles | Sort-Object) -DifferenceObject ($entryNames | Sort-Object))
        if ($zipDiff.Count -gt 0) {
            throw "ZIP contents do not match required files: $($zipDiff | Out-String)"
        }

        # Verify PlayerGameEvent.csv is NOT in the ZIP
        if ($entryNames -contains 'PlayerGameEvent.csv') {
            throw 'PlayerGameEvent.csv must NOT be in the stats ZIP.'
        }

        # Verify total uncompressed contents <= 10 MB
        $totalUncompressed = ($entries | Measure-Object -Property Length -Sum).Sum
        if ($totalUncompressed -gt 10MB) {
            throw "Total uncompressed size ($totalUncompressed bytes) exceeds 10 MB limit."
        }
    }
    finally {
        $archive.Dispose()
    }

    Move-Item -LiteralPath $temporaryZip -Destination $zipPath -Force
}
finally {
    if (Test-Path -LiteralPath $temporaryZip) {
        Remove-Item -LiteralPath $temporaryZip -Force
    }
}

$finalZipItem = Get-Item -LiteralPath $zipPath
$zipKb = [math]::Round($finalZipItem.Length / 1KB, 1)
$uncompressedKb = [math]::Round($totalUncompressed / 1KB, 1)

Write-Host "Successfully built: $zipPath"
Write-Host "Final compressed ZIP size: $zipKb KB ($($finalZipItem.Length) bytes)"
Write-Host "Final uncompressed package size: $uncompressedKb KB ($totalUncompressed bytes)"
Write-Host "Validated all $($expectedGeneratedFiles.Count) entries at ZIP root (0 subdirectories, 0 unexpected files)."
