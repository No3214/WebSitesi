Set-Location $PSScriptRoot
$log = Join-Path $PSScriptRoot "gate-w6.log"
"REZ-GATE $(Get-Date -Format HH:mm:ss)" | Set-Content $log
Get-NetTCPConnection -LocalPort 3006,3010 -State Listen -ErrorAction SilentlyContinue | ForEach-Object { Stop-Process -Id $_.OwningProcess -Force -ErrorAction SilentlyContinue }
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npm run build 2>&1 | Select-String "Compiled|Error" | Select-Object -First 3 | Add-Content $log
"BUILD:$LASTEXITCODE" | Add-Content $log
if ($LASTEXITCODE -eq 0) {
  npx playwright test tests/a11y.spec.ts -g "rezervasyon" --reporter=line 2>&1 | Select-Object -Last 5 | Add-Content $log
  "EXIT:$LASTEXITCODE" | Add-Content $log
}
"BITTI" | Add-Content $log
