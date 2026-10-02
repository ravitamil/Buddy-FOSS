@echo off
REM Batch wrapper for normalize-font-extensions.ps1
REM This script normalizes font file extensions from .OTF to .otf

echo Normalizing font file extensions...
powershell.exe -ExecutionPolicy Bypass -File "%~dp0normalize-font-extensions.ps1"

if %ERRORLEVEL% EQU 0 (
    echo.
    echo Font extension normalization completed successfully!
) else (
    echo.
    echo Font extension normalization failed with errors.
)

pause