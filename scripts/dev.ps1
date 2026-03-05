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

# If port 3000 is occupied by a stale Next.js node process, stop it so dev stays on 3000.
try {
  $port3000 = Get-NetTCPConnection -LocalPort 3000 -State Listen -ErrorAction Stop
  $pids = $port3000 | Select-Object -ExpandProperty OwningProcess -Unique
  foreach ($pid in $pids) {
    $proc = Get-CimInstance Win32_Process -Filter "ProcessId = $pid" -ErrorAction SilentlyContinue
    if ($proc -and $proc.Name -eq 'node.exe') {
      try {
        Stop-Process -Id $pid -Force -ErrorAction Stop
      } catch {
        Write-Host "Could not stop process on port 3000 ($pid): $($_.Exception.Message)"
      }
    }
  }
} catch {
  # Port 3000 not in use.
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
  # Turbopack can intermittently fail on Windows with mapped-file cache writes.
  & $nextCmd "dev" "--webpack"
} else {
  cmd /c "npx next dev --webpack"
}
