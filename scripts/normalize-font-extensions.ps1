param(
    [string]$FontsPath = "assets\fonts"
)

$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Definition
$ProjectRoot = Split-Path -Parent $ScriptDir
$FullFontsPath = Join-Path $ProjectRoot $FontsPath

Write-Host "Normalizing font file extensions in: $FullFontsPath" -ForegroundColor Green

if (-not (Test-Path $FullFontsPath)) {
    Write-Host "Fonts directory not found: $FullFontsPath" -ForegroundColor Red
    exit 1
}

$otfFiles = Get-ChildItem -Path $FullFontsPath -File | Where-Object { $_.Name -cmatch '\.OTF$' }

if ($otfFiles.Count -eq 0) {
    Write-Host "No .OTF files found to rename." -ForegroundColor Yellow
    exit 0
}

Write-Host "Found $($otfFiles.Count) .OTF file(s) to rename:" -ForegroundColor Cyan

$renamedCount = 0
$errorCount = 0

foreach ($file in $otfFiles) {
    $oldName = $file.Name
    $newName = $oldName -replace '\.OTF$', '.otf'
    $newPath = Join-Path $file.Directory.FullName $newName
    
    try {
        if ($oldName.ToLower() -eq $newName.ToLower() -and $oldName -cne $newName) {
            $tempName = "$($file.BaseName)_TEMP_RENAME$($file.Extension)"
            $tempPath = Join-Path $file.Directory.FullName $tempName
            
            Rename-Item -Path $file.FullName -NewName $tempName -ErrorAction Stop
            Rename-Item -Path $tempPath -NewName $newName -ErrorAction Stop
            
            Write-Host "  Renamed: '$oldName' to '$newName'" -ForegroundColor Green
            $renamedCount++
        }
        elseif (Test-Path $newPath -and $oldName -cne $newName) {
            Write-Host "  Skipping '$oldName' - target file '$newName' already exists" -ForegroundColor Yellow
            continue
        }
        elseif ($oldName -cne $newName) {
            Rename-Item -Path $file.FullName -NewName $newName -ErrorAction Stop
            Write-Host "  Renamed: '$oldName' to '$newName'" -ForegroundColor Green
            $renamedCount++
        }
        else {
            Write-Host "  Skipping '$oldName' - already has correct extension" -ForegroundColor Cyan
        }
    }
    catch {
        Write-Host "  Failed to rename '$oldName': $($_.Exception.Message)" -ForegroundColor Red
        $errorCount++
    }
}

Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  Successfully renamed: $renamedCount file(s)" -ForegroundColor Green
if ($errorCount -gt 0) {
    Write-Host "  Errors encountered: $errorCount file(s)" -ForegroundColor Red
}

if ($errorCount -gt 0) {
    exit 1
} else {
    Write-Host "Font extension normalization completed successfully!" -ForegroundColor Green
    exit 0
}