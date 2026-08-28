param(
  [Parameter(Mandatory = $false)]
  [string]$SourcePath = '',

  [Parameter(Mandatory = $false)]
  [string]$OutputPath = ''
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.Drawing

if (-not $SourcePath) {
  $SourcePath = Join-Path $PSScriptRoot '..\developer-docs\assets\commander-portraits\commander-sprite-sheet.png'
}
if (-not $OutputPath) {
  $OutputPath = Join-Path $PSScriptRoot '..\public\assets\commanders'
}

$source = [System.IO.Path]::GetFullPath($SourcePath)
$output = [System.IO.Path]::GetFullPath($OutputPath)

if (-not (Test-Path -LiteralPath $source -PathType Leaf)) {
  throw "Commander sprite sheet not found: $source"
}

[System.IO.Directory]::CreateDirectory($output) | Out-Null

# These bounds were inspected against the canonical 1491 x 1055 production
# sheet. They sit just inside its printed rules so derived assets never expose
# a neighbouring cell, header, or commander label.
$columns = [ordered]@{
  calm       = [System.Drawing.Rectangle]::new(210, 0, 208, 0)
  smug       = [System.Drawing.Rectangle]::new(422, 0, 207, 0)
  determined = [System.Drawing.Rectangle]::new(633, 0, 207, 0)
  angry      = [System.Drawing.Rectangle]::new(844, 0, 208, 0)
  sad        = [System.Drawing.Rectangle]::new(1056, 0, 205, 0)
  surprised  = [System.Drawing.Rectangle]::new(1265, 0, 216, 0)
}

$rows = [ordered]@{
  quartermaster    = @{ Y = 45;  Height = 208; Crest = [System.Drawing.Rectangle]::new(25, 49, 166, 146) }
  gambler           = @{ Y = 257; Height = 209; Crest = [System.Drawing.Rectangle]::new(25, 263, 166, 143) }
  analyst           = @{ Y = 470; Height = 186; Crest = [System.Drawing.Rectangle]::new(38, 474, 145, 132) }
  attritionist      = @{ Y = 660; Height = 185; Crest = [System.Drawing.Rectangle]::new(30, 665, 165, 132) }
  'cornered-general' = @{ Y = 849; Height = 193; Crest = [System.Drawing.Rectangle]::new(28, 852, 165, 126) }
}

$jpegCodec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() |
  Where-Object MimeType -eq 'image/jpeg' |
  Select-Object -First 1
$qualityEncoder = [System.Drawing.Imaging.Encoder]::Quality
$encoderParameters = [System.Drawing.Imaging.EncoderParameters]::new(1)
$encoderParameters.Param[0] = [System.Drawing.Imaging.EncoderParameter]::new($qualityEncoder, [long]93)

function Export-Crop {
  param(
    [Parameter(Mandatory = $true)]
    [System.Drawing.Bitmap]$Image,
    [Parameter(Mandatory = $true)]
    [System.Drawing.Rectangle]$Bounds,
    [Parameter(Mandatory = $true)]
    [string]$Destination
  )

  $crop = [System.Drawing.Bitmap]::new($Bounds.Width, $Bounds.Height)
  try {
    $graphics = [System.Drawing.Graphics]::FromImage($crop)
    try {
      $graphics.DrawImage(
        $Image,
        [System.Drawing.Rectangle]::new(0, 0, $Bounds.Width, $Bounds.Height),
        $Bounds,
        [System.Drawing.GraphicsUnit]::Pixel
      )
    }
    finally {
      $graphics.Dispose()
    }
    $crop.Save($Destination, $jpegCodec, $encoderParameters)
  }
  finally {
    $crop.Dispose()
  }
}

$image = [System.Drawing.Bitmap]::FromFile($source)
try {
  if ($image.Width -ne 1491 -or $image.Height -ne 1055) {
    throw "Unexpected commander sprite sheet dimensions: $($image.Width) x $($image.Height). Expected 1491 x 1055."
  }

  foreach ($commander in $rows.GetEnumerator()) {
    $commanderPath = Join-Path $output $commander.Key
    [System.IO.Directory]::CreateDirectory($commanderPath) | Out-Null

    foreach ($expression in $columns.GetEnumerator()) {
      $bounds = [System.Drawing.Rectangle]::new(
        $expression.Value.X,
        $commander.Value.Y,
        $expression.Value.Width,
        $commander.Value.Height
      )
      Export-Crop -Image $image -Bounds $bounds -Destination (Join-Path $commanderPath "$($expression.Key).jpg")
    }

    Export-Crop -Image $image -Bounds $commander.Value.Crest -Destination (Join-Path $commanderPath 'crest.jpg')
  }
}
finally {
  $image.Dispose()
  $encoderParameters.Dispose()
}

Write-Output "Extracted commander art to $output"
