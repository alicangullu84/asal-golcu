# Asal Golcu - gorsel isleme
# Kullanim:
#   gorsel-isle.ps1 -Mod dekupe -Girdi ham\kaleci-1.jpg -Cikti kaleci-1.png -Boyut 640
#   gorsel-isle.ps1 -Mod kucult -Girdi ham\stadyum.jpg -Cikti stadyum.jpg -Boyut 1920
# dekupe: duz yesil fonu saydam yapar, yesil tasmasini temizler, bos kenarlari kirpar.
# kucult: en uzun kenari Boyut olacak sekilde kucultur, JPEG kalite 86 ile kaydeder.
param(
  [Parameter(Mandatory = $true)][ValidateSet('dekupe', 'kucult')][string]$Mod,
  [Parameter(Mandatory = $true)][string]$Girdi,
  [Parameter(Mandatory = $true)][string]$Cikti,
  [int]$Boyut = 640,
  [int]$Pay = 8
)
$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$kod = @"
using System;
using System.Drawing;
using System.Drawing.Imaging;
using System.Runtime.InteropServices;

public static class GorselIsle {
  // Yesil fonu saydam yapar. Dondurdugu dizi: kirpma kutusu x, y, w, h
  public static int[] Dekupe(Bitmap bmp) {
    int w = bmp.Width, h = bmp.Height;
    Rectangle r = new Rectangle(0, 0, w, h);
    BitmapData d = bmp.LockBits(r, ImageLockMode.ReadWrite, PixelFormat.Format32bppArgb);
    int n = d.Stride * h;
    byte[] px = new byte[n];
    Marshal.Copy(d.Scan0, px, 0, n);
    int minX = w, minY = h, maxX = -1, maxY = -1;
    for (int y = 0; y < h; y++) {
      int satir = y * d.Stride;
      for (int x = 0; x < w; x++) {
        int i = satir + x * 4;
        int b = px[i], g = px[i + 1], rr = px[i + 2];
        int mx = Math.Max(rr, b);
        int fark = g - mx;
        int a = 255;
        if (g > 90 && fark > 70) a = 0;
        else if (fark > 25) a = (int)(255.0 * (1.0 - (fark - 25) / 45.0));
        if (a < 0) a = 0;
        if (a > 255) a = 255;
        if (fark > 0) px[i + 1] = (byte)mx;
        px[i + 3] = (byte)a;
        if (a > 24) {
          if (x < minX) minX = x;
          if (y < minY) minY = y;
          if (x > maxX) maxX = x;
          if (y > maxY) maxY = y;
        }
      }
    }
    Marshal.Copy(px, 0, d.Scan0, n);
    bmp.UnlockBits(d);
    if (maxX < 0) return new int[] { 0, 0, w, h };
    return new int[] { minX, minY, maxX - minX + 1, maxY - minY + 1 };
  }
}
"@
if (-not ('GorselIsle' -as [type])) { Add-Type -TypeDefinition $kod -ReferencedAssemblies System.Drawing }

function Yeniden-Boyutla([System.Drawing.Image]$kaynak, [System.Drawing.Rectangle]$alan, [int]$enUzun, [bool]$saydam) {
  $oran = [Math]::Min(1.0, $enUzun / [double][Math]::Max($alan.Width, $alan.Height))
  $yw = [int][Math]::Round($alan.Width * $oran)
  $yh = [int][Math]::Round($alan.Height * $oran)
  $fmt = if ($saydam) { [System.Drawing.Imaging.PixelFormat]::Format32bppArgb } else { [System.Drawing.Imaging.PixelFormat]::Format24bppRgb }
  $hedef = New-Object System.Drawing.Bitmap $yw, $yh, $fmt
  $g = [System.Drawing.Graphics]::FromImage($hedef)
  $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
  $g.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
  if ($saydam) { $g.Clear([System.Drawing.Color]::Transparent) }
  $g.DrawImage($kaynak, (New-Object System.Drawing.Rectangle 0, 0, $yw, $yh), $alan, [System.Drawing.GraphicsUnit]::Pixel)
  $g.Dispose()
  return $hedef
}

$girdiYolu = (Resolve-Path $Girdi).Path
$ciktiYolu = [System.IO.Path]::GetFullPath((Join-Path (Get-Location) $Cikti))
$ham = [System.Drawing.Image]::FromFile($girdiYolu)
$bmp = New-Object System.Drawing.Bitmap $ham.Width, $ham.Height, ([System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
$g0 = [System.Drawing.Graphics]::FromImage($bmp)
$g0.DrawImage($ham, 0, 0, $ham.Width, $ham.Height)
$g0.Dispose()
$ham.Dispose()

if ($Mod -eq 'dekupe') {
  $k = [GorselIsle]::Dekupe($bmp)
  $x = [Math]::Max(0, $k[0] - $Pay); $y = [Math]::Max(0, $k[1] - $Pay)
  $x2 = [Math]::Min($bmp.Width, $k[0] + $k[2] + $Pay); $y2 = [Math]::Min($bmp.Height, $k[1] + $k[3] + $Pay)
  $alan = New-Object System.Drawing.Rectangle $x, $y, ($x2 - $x), ($y2 - $y)
  $son = Yeniden-Boyutla $bmp $alan $Boyut $true
  $son.Save($ciktiYolu, [System.Drawing.Imaging.ImageFormat]::Png)
} else {
  $alan = New-Object System.Drawing.Rectangle 0, 0, $bmp.Width, $bmp.Height
  $son = Yeniden-Boyutla $bmp $alan $Boyut $false
  $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
  $ep = New-Object System.Drawing.Imaging.EncoderParameters 1
  $ep.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter ([System.Drawing.Imaging.Encoder]::Quality), ([long]86)
  $son.Save($ciktiYolu, $codec, $ep)
}
"{0} -> {1} ({2} x {3}, {4} KB)" -f (Split-Path $girdiYolu -Leaf), (Split-Path $ciktiYolu -Leaf), $son.Width, $son.Height, [Math]::Round((Get-Item $ciktiYolu).Length / 1KB)
$son.Dispose()
$bmp.Dispose()
