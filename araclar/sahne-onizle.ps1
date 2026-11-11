# Asal Golcu - sahne onizleme: oyundaki yerlesim hesabiyla (oyun.js ve klipler.js) tek kare uretir.
# Ornek: sahne-onizle.ps1 -Kaleci 1 -Tur tut -KaleciSn 0.9 -GolcuSn 2.0 -Cikti kare.jpg [-Ayna] [-TopGoster]
param(
  [string]$Ffmpeg = 'ffmpeg',
  [int]$Kaleci = 1,
  [ValidateSet('tut', 'bos', 'orta')][string]$Tur = 'tut',
  [double]$KaleciSn = 0.04,
  [double]$GolcuSn = 0.5,
  [switch]$Ayna,
  [switch]$TopGoster,
  [double]$GolcuBoy = 0.30,
  [double]$TopGen = 0.086,
  [Parameter(Mandatory = $true)][string]$Cikti
)
$ErrorActionPreference = 'Stop'
$kok = Split-Path $PSScriptRoot -Parent
$olcu = @{ 1 = @(0.5, 0.767, 0.489); 2 = @(0.5, 0.933, 0.589); 3 = @(0.5, 0.767, 0.5); 4 = @(0.5, 0.822, 0.611); 5 = @(0.5, 0.733, 0.556); 6 = @(0.5, 0.8, 0.5); 7 = @(0.5, 0.733, 0.433); 8 = @(0.5, 0.778, 0.556) }
$W = 1280; $H = 720
$o = $olcu[$Kaleci]
$kOran = 0.25 / $o[2]
$ax = if ($Ayna) { 1 - $o[0] } else { $o[0] }
$kGen = [int]($kOran * $W); $kYuk = [int]($kOran * $H)
$kx = [int]((0.5 - $ax * $kOran) * $W); $ky = [int]((0.696 - $o[1] * $kOran) * $H)
$gOran = $GolcuBoy / 0.467
$gGen = [int]($gOran * $W); $gYuk = [int]($gOran * $H)
$gx = [int]((0.515 - 0.583 * $gOran) * $W); $gy = [int]((0.955 - 0.733 * $gOran) * $H)
$tw = [int]($TopGen * $W); $tx = [int](0.5 * $W - $tw / 2); $ty = [int](0.905 * $H - $tw / 2)
$aynaF = if ($Ayna) { ',hflip' } else { '' }
$kaleciDosya = Join-Path $kok "videolar\k$Kaleci-$Tur.webm"
$golcuDosya = Join-Path $kok 'videolar\golcu-vurus.webm'
$arka = Join-Path $kok 'gorseller\stadyum.jpg'
$top = Join-Path $kok 'gorseller\top.png'
$fc = "[0]scale=${W}:${H},setpts=PTS-STARTPTS[a];[1]setpts=PTS-STARTPTS,scale=${kGen}:${kYuk}${aynaF}[k];[2]setpts=PTS-STARTPTS,scale=${gGen}:${gYuk}[g];[3]scale=${tw}:${tw}[t];[a][k]overlay=${kx}:${ky}[ak];[ak][g]overlay=${gx}:${gy}[akg]"
if ($TopGoster) { $fc += ";[akg][t]overlay=${tx}:${ty}[son]" } else { $fc += ";[akg]null[son];[t]nullsink" }
$inv = [System.Globalization.CultureInfo]::InvariantCulture
& $Ffmpeg -v error -y -i $arka -c:v libvpx-vp9 -ss $KaleciSn.ToString($inv) -i $kaleciDosya -c:v libvpx-vp9 -ss $GolcuSn.ToString($inv) -i $golcuDosya -i $top -filter_complex $fc -map '[son]' -frames:v 1 $Cikti
"kaleci ${kGen}x${kYuk}@${kx},${ky}  golcu ${gGen}x${gYuk}@${gx},${gy}"
