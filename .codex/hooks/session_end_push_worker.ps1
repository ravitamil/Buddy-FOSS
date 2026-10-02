[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ProjectRoot,

  [Parameter(Mandatory = $true)]
  [string]$Branch,

  [Parameter(Mandatory = $true)]
  [string]$SessionId
)

$ErrorActionPreference = 'Stop'
Set-StrictMode -Version Latest
$env:GIT_TERMINAL_PROMPT = '0'
$env:GCM_INTERACTIVE = 'Never'

$logPath = Join-Path $ProjectRoot '.git\codex-session-push.log'
$timestamp = (Get-Date).ToString('o')

function Invoke-GitCommand {
  param(
    [Parameter(Mandatory = $true)]
    [string[]]$Arguments
  )

  $previousErrorActionPreference = $ErrorActionPreference
  try {
    $ErrorActionPreference = 'Continue'
    $output = & git -C $ProjectRoot @Arguments 2>&1
    $exitCode = $LASTEXITCODE
  } finally {
    $ErrorActionPreference = $previousErrorActionPreference
  }

  if ($exitCode -ne 0) {
    $renderedOutput = ($output | Out-String).Trim()
    throw "git $($Arguments -join ' ') failed: $renderedOutput"
  }

  return ($output | Out-String).Trim()
}

function New-SessionSummary {
  param(
    [Parameter(Mandatory = $true)]
    [string]$ShortStat,

    [Parameter(Mandatory = $true)]
    [string]$DirectoryStat
  )

  $summaryDirectory = Join-Path $ProjectRoot 'docs\session-summaries'
  New-Item -ItemType Directory -Path $summaryDirectory -Force | Out-Null

  $safeSessionId = $SessionId -replace '[^A-Za-z0-9_-]', '-'
  $summaryName = "{0}-{1}.md" -f (Get-Date -Format 'yyyy-MM-dd-HHmmss'), $safeSessionId
  $summaryPath = Join-Path $summaryDirectory $summaryName
  $summaryLines = @(
    '# Session checkpoint',
    '',
    "- Created: $timestamp",
    "- Branch: $Branch",
    "- Session: $SessionId",
    '',
    '## Change summary',
    '',
    $ShortStat,
    '',
    '## Changed areas',
    '',
    '```',
    $DirectoryStat,
    '```'
  )

  Set-Content -LiteralPath $summaryPath -Value $summaryLines -Encoding utf8
  return $summaryPath
}

try {
  $workingTreeStatus = Invoke-GitCommand -Arguments @('status', '--porcelain=v1')
  if (-not [string]::IsNullOrWhiteSpace($workingTreeStatus)) {
    Invoke-GitCommand -Arguments @('add', '-A') | Out-Null
    $shortStat = Invoke-GitCommand -Arguments @('diff', '--cached', '--shortstat')
    $directoryStat = Invoke-GitCommand -Arguments @('diff', '--cached', '--dirstat=files,0')
    $summaryPath = New-SessionSummary -ShortStat $shortStat -DirectoryStat $directoryStat
    $normalizedProjectRoot = $ProjectRoot.TrimEnd([char[]]@([char]'\', [char]'/'))
    $summaryPathRelative = $summaryPath.Substring($normalizedProjectRoot.Length).TrimStart([char[]]@([char]'\', [char]'/'))

    Invoke-GitCommand -Arguments @('add', '--', $summaryPathRelative) | Out-Null
    Invoke-GitCommand -Arguments @('commit', '-m', 'chore(session): checkpoint changes') | Out-Null
  }

  $head = (& git -C $ProjectRoot rev-parse HEAD 2>$null).Trim()
  $message = (& git -C $ProjectRoot log -1 --pretty=%s 2>$null).Trim()
  $pushOutput = & git -C $ProjectRoot push origin "HEAD:refs/heads/$Branch" 2>&1
  $exitCode = $LASTEXITCODE
  $renderedOutput = ($pushOutput | Out-String).Trim()

  Add-Content -LiteralPath $logPath -Value (
    "[$timestamp] session=$SessionId branch=$Branch head=$head message=$message exit=$exitCode`n$renderedOutput"
  )

  exit $exitCode
} catch {
  Add-Content -LiteralPath $logPath -Value (
    "[$timestamp] session=$SessionId branch=$Branch exception=$($_.Exception.Message)"
  )
  exit 1
}
