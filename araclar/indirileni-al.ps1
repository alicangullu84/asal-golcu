# Indirilenler klasorundeki en yeni Flow dosyasini gorseller\ham altina verilen adla tasir.
# Kullanim: indirileni-al.ps1 -Ad kaleci-1
param([Parameter(Mandatory = $true)][string]$Ad, [int]$Bekle = 20)
$ErrorActionPreference = 'Stop'
$dl = Join-Path $env:USERPROFILE 'Downloads'
$hedefKlasor = Join-Path $PSScriptRoot '..\gorseller\ham'
New-Item -ItemType Directory -Force $hedefKlasor | Out-Null
$son = $null
for ($i = 0; $i -lt $Bekle; $i++) {
  $son = Get-ChildItem $dl -File | Where-Object { $_.LastWriteTime -gt (Get-Date).AddMinutes(-3) -and ($_.Extension -in '.tmp', '.jpg', '.jpeg', '.png') } | Sort-Object LastWriteTime -Descending | Select-Object -First 1
  if ($son) {
    $b1 = $son.Length; Start-Sleep -Milliseconds 700; $son.Refresh()
    if ($son.Length -eq $b1 -and $b1 -gt 1000) { break }
  }
  Start-Sleep -Seconds 1
}
if (-not $son) { throw 'Yeni indirilen dosya bulunamadi.' }
$bas = [System.IO.File]::ReadAllBytes($son.FullName)[0..3]
$uz = if ($bas[0] -eq 0x89 -and $bas[1] -eq 0x50) { '.png' } elseif ($bas[0] -eq 0xFF -and $bas[1] -eq 0xD8) { '.jpg' } else { '.bin' }
$hedef = Join-Path $hedefKlasor ($Ad + $uz)
Move-Item $son.FullName $hedef -Force
"{0} -> {1} ({2} KB)" -f $son.Name, (Split-Path $hedef -Leaf), [Math]::Round((Get-Item $hedef).Length / 1KB)
