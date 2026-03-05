$ErrorActionPreference = "Stop"

$projectRoot = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path
$escapedProjectRoot = [Regex]::Escape($projectRoot)

# Stop existing Next.js dev processes for this same project path.
$running = Get-CimInstance Win32_Process -Filter "Name = 'node.exe'" |
  Where-Object {
    $_.CommandLine -and
    $_.CommandLine -match "next(\.js)?\s+dev" -and
    $_.CommandLine -match $escapedProjectRoot
  }

foreach ($proc in $running) {
  try {
    Stop-Process -Id $proc.ProcessId -Force -ErrorAction Stop
  } catch {
    Write-Host "Could not stop process $($proc.ProcessId): $($_.Exception.Message)"
  }
}

Start-Sleep -Milliseconds 300

$lockPath = Join-Path $projectRoot ".next\dev\lock"
if (Test-Path $lockPath) {
  try {
    Remove-Item -Force $lockPath -ErrorAction Stop
  } catch {
    Write-Host "Lock file is still in use and could not be removed."
  }
}

Set-Location $projectRoot
$nextCmd = Join-Path $projectRoot "node_modules\.bin\next.cmd"
if (Test-Path $nextCmd) {
  & $nextCmd "dev"
} else {
  cmd /c "npx next dev"
}
