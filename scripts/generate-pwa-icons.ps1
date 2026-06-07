# scripts/generate-pwa-icons.ps1
param (
    [string]$SourcePath
)

if (-not $SourcePath) {
    Write-Error "Please provide a -SourcePath"
    exit 1
}

# Load the System.Drawing assembly
Add-Type -AssemblyName System.Drawing

function Resize-Image {
    param (
        [string]$Path,
        [string]$Destination,
        [int]$Width,
        [int]$Height
    )
    
    try {
        $srcImage = [System.Drawing.Image]::FromFile($Path)
        $destBitmap = New-Object System.Drawing.Bitmap($Width, $Height)
        $graphics = [System.Drawing.Graphics]::FromImage($destBitmap)
        
        $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
        $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
        $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
        
        $graphics.DrawImage($srcImage, 0, 0, $Width, $Height)
        
        # Save image as PNG
        if (Test-Path $Destination) {
            Remove-Item $Destination -Force
        }
        
        $destBitmap.Save($Destination, [System.Drawing.Imaging.ImageFormat]::Png)
        
        # Clean up
        $graphics.Dispose()
        $destBitmap.Dispose()
        $srcImage.Dispose()
        
        Write-Host "Generated: $Destination ($Width x $Height)"
    }
    catch {
        Write-Error "Failed to resize image to $Destination`: $_"
    }
}

$publicDir = Resolve-Path (Join-Path $PSScriptRoot "../public")

Write-Host "Starting icon generation from $SourcePath..."
Resize-Image -Path $SourcePath -Destination "$publicDir/favicon.png" -Width 32 -Height 32
Resize-Image -Path $SourcePath -Destination "$publicDir/apple-touch-icon.png" -Width 180 -Height 180
Resize-Image -Path $SourcePath -Destination "$publicDir/icon-192.png" -Width 192 -Height 192
Resize-Image -Path $SourcePath -Destination "$publicDir/icon-192-maskable.png" -Width 192 -Height 192
Resize-Image -Path $SourcePath -Destination "$publicDir/icon-512.png" -Width 512 -Height 512
Resize-Image -Path $SourcePath -Destination "$publicDir/icon-512-maskable.png" -Width 512 -Height 512
Write-Host "Icon generation completed!"
