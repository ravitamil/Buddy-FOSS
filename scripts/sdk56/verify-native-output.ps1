$ErrorActionPreference = 'Stop'

$manifestPath = 'android\app\src\main\AndroidManifest.xml'
$mainActivityPath = Get-ChildItem -Path 'android\app\src\main' -Recurse -File -Filter 'MainActivity.kt' |
    Select-Object -First 1 -ExpandProperty FullName

if (-not (Test-Path -LiteralPath $manifestPath)) {
    throw "Android manifest was not generated: $manifestPath"
}

if (-not $mainActivityPath) {
    throw 'Android MainActivity.kt was not generated'
}

$manifest = Get-Content -Raw -LiteralPath $manifestPath
$mainActivity = Get-Content -Raw -LiteralPath $mainActivityPath

$forbiddenPermissions = @(
    'android.permission.READ_EXTERNAL_STORAGE',
    'android.permission.WRITE_EXTERNAL_STORAGE',
    'android.permission.WRITE_CONTACTS',
    'android.permission.RECORD_AUDIO'
)

foreach ($permission in $forbiddenPermissions) {
    $escapedPermission = [Regex]::Escape($permission)
    $permissionDeclaration = [Regex]::Match(
        $manifest,
        "<uses-permission\b[^>]*android:name=`"$escapedPermission`"[^>]*/?>"
    )

    if ($permissionDeclaration.Success -and -not $permissionDeclaration.Value.Contains('tools:node="remove"')) {
        throw "Forbidden permission is active in generated manifest: $permission"
    }
}

if (-not $mainActivity.Contains('super.onCreate(null)')) {
    throw 'react-native-screens restoration guard is missing'
}

if (-not $mainActivity.Contains('RNScreensFragmentFactory')) {
    throw 'react-native-screens fragment factory guard is missing'
}

Write-Host 'SDK 56 native output verification passed.'
