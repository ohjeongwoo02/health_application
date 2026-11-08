# One-off: shrink img/*.jpg to max 400px wide using built-in System.Drawing (no dependencies).
Add-Type -AssemblyName System.Drawing
$codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq 'image/jpeg' }
$enc = New-Object System.Drawing.Imaging.EncoderParameters(1)
$enc.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter([System.Drawing.Imaging.Encoder]::Quality, 75L)
Get-ChildItem (Join-Path $PSScriptRoot '..\img\*.jpg') | ForEach-Object {
  $src = [System.Drawing.Image]::FromFile($_.FullName)
  if ($src.Width -le 400) { $src.Dispose(); return }
  $h = [int]($src.Height * 400 / $src.Width)
  $bmp = New-Object System.Drawing.Bitmap 400, $h
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.InterpolationMode = 'HighQualityBicubic'
  $g.DrawImage($src, 0, 0, 400, $h)
  $g.Dispose(); $src.Dispose()
  $tmp = $_.FullName + '.tmp'
  $bmp.Save($tmp, $codec, $enc); $bmp.Dispose()
  Move-Item -Force $tmp $_.FullName
}
