# Asal Golcu - Flow kliplerini oyun icin hazirlar (ffmpeg gerekir).
# videolar\ham\vNN.mp4 -> videolar\<ad>.webm : yesil fon silinmis (VP9 alfa), ses yok, 3.4 sn,
# sik anahtar kare (hizli ileri sarma).
param([string]$Ffmpeg = 'ffmpeg', [string]$Sadece = '')
$ErrorActionPreference = 'Stop'
$kok = Split-Path $PSScriptRoot -Parent
$eslesme = [ordered]@{
  'golcu-vurus' = 'v17'
  'k1-tut' = 'v18'; 'k1-bos' = 'v15'; 'k1-orta' = 'v23'
  'k2-tut' = 'v22'; 'k2-bos' = 'v20'; 'k2-orta' = 'v19'
  'k3-tut' = 'v21'; 'k3-bos' = 'v12'; 'k3-orta' = 'v14'
  'k4-tut' = 'v24'; 'k4-bos' = 'v13'; 'k4-orta' = 'v16'
  'k5-tut' = 'v07'; 'k5-bos' = 'v10'; 'k5-orta' = 'v09'
  'k6-tut' = 'v06'; 'k6-bos' = 'v11'; 'k6-orta' = 'v00'
  'k7-tut' = 'v03'; 'k7-bos' = 'v08'; 'k7-orta' = 'v01'
  'k8-tut' = 'v02'; 'k8-bos' = 'v05'; 'k8-orta' = 'v04'
}
$filtre = 'chromakey=0x1AF115:0.17:0.07,despill=type=green:mix=0.7:expand=0.05,format=yuva420p'
foreach ($ad in $eslesme.Keys) {
  if ($Sadece -and $ad -ne $Sadece) { continue }
  $girdi = Join-Path $kok ("videolar\ham\" + $eslesme[$ad] + ".mp4")
  if (-not (Test-Path $girdi)) { "atlandi (yok): $ad"; continue }
  $cikti = Join-Path $kok ("videolar\" + $ad + ".webm")
  & $Ffmpeg -v error -y -i $girdi -t 3.4 -an -vf $filtre -c:v libvpx-vp9 -pix_fmt yuva420p -b:v 0 -crf 31 -auto-alt-ref 0 -g 5 -row-mt 1 -deadline good -cpu-used 4 $cikti
  "{0} <- {1} ({2} KB)" -f $ad, $eslesme[$ad], [Math]::Round((Get-Item $cikti).Length / 1KB)
}
