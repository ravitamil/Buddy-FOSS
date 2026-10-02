[CmdletBinding()]
param(
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest

try {
  $payloadText = [Console]::In.ReadToEnd()
  $payload = if ([string]::IsNullOrWhiteSpace($payloadText)) {
    $null
  } else {
    $payloadText | ConvertFrom-Json
  }

  $sessionCwd = if ($payload -and $payload.cwd) {
    [string]$payload.cwd
  } else {
    (Get-Location).Path
  }
  $sessionId = if ($payload -and $payload.session_id) {
    [string]$payload.session_id
  } else {
    'manual'
  }

  $gitRoot = (& git -C $sessionCwd rev-parse --show-toplevel 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($gitRoot)) {
    exit 0
  }

  $hookRoot = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..\..')).TrimEnd('\')
  $resolvedGitRoot = [System.IO.Path]::GetFullPath($gitRoot).TrimEnd('\')
  if (-not $resolvedGitRoot.Equals($hookRoot, [System.StringComparison]::OrdinalIgnoreCase)) {
    exit 0
  }

  $branch = (& git -C $resolvedGitRoot branch --show-current 2>$null).Trim()
  if ($LASTEXITCODE -ne 0 -or [string]::IsNullOrWhiteSpace($branch)) {
    exit 0
  }

  & git -C $resolvedGitRoot remote get-url origin *> $null
  if ($LASTEXITCODE -ne 0) {
    exit 0
  }

  $remoteRef = "refs/remotes/origin/$branch"
  & git -C $resolvedGitRoot show-ref --verify --quiet $remoteRef
  $remoteBranchExists = $LASTEXITCODE -eq 0
  $aheadCount = $null
  $wouldPush = -not $remoteBranchExists
  if ($remoteBranchExists) {
    $aheadCountText = (& git -C $resolvedGitRoot rev-list --count "origin/$branch..HEAD" 2>$null).Trim()
    $parsedAheadCount = 0
    if ([int]::TryParse($aheadCountText, [ref]$parsedAheadCount)) {
      $aheadCount = $parsedAheadCount
      $wouldPush = $aheadCount -gt 0
    }
  }

  $workingTreeStatus = (& git -C $resolvedGitRoot status --porcelain=v1 2>$null | Out-String).Trim()
  if ($LASTEXITCODE -ne 0) {
    throw 'Unable to read the Git working tree status.'
  }
  $hasWorkingTreeChanges = -not [string]::IsNullOrWhiteSpace($workingTreeStatus)
  $wouldQueue = $hasWorkingTreeChanges -or $wouldPush

  $workerPath = Join-Path $PSScriptRoot 'session_end_push_worker.ps1'
  if ($DryRun) {
    [pscustomobject]@{
      projectRoot = $resolvedGitRoot
      branch = $branch
      sessionId = $sessionId
      remoteBranchExists = $remoteBranchExists
      aheadCount = $aheadCount
      hasWorkingTreeChanges = $hasWorkingTreeChanges
      wouldQueue = $wouldQueue
      wouldPush = $wouldPush
    } | ConvertTo-Json -Compress
    exit 0
  }

  if (-not $wouldQueue) {
    exit 0
  }

  Start-Process `
    -FilePath 'powershell.exe' `
    -ArgumentList @(
      '-NoProfile',
      '-ExecutionPolicy',
      'Bypass',
      '-File',
      "`"$workerPath`"",
      '-ProjectRoot',
      "`"$resolvedGitRoot`"",
      '-Branch',
      "`"$branch`"",
      '-SessionId',
      "`"$sessionId`""
    ) `
    -WindowStyle Hidden
} catch {
  [Console]::Error.WriteLine("BuddyIO SessionEnd push hook failed to queue: $($_.Exception.Message)")
  exit 1
}
