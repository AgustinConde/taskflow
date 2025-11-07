param(
    [Parameter(Mandatory = $true, Position = 0)]
    [ValidatePattern("^[A-Za-z0-9_-]+$")]
    [string]$Environment,

    [switch]$Persist
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Get-RepoRoot {
    param()
    return [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot ".."))
}

function Resolve-RepoPath {
    param(
        [string]$Root,
        [string]$Path
    )

    if ([string]::IsNullOrWhiteSpace($Path)) {
        return $null
    }

    if ([System.IO.Path]::IsPathRooted($Path)) {
        return [System.IO.Path]::GetFullPath($Path)
    }

    return [System.IO.Path]::GetFullPath((Join-Path $Root $Path))
}

$root = Get-RepoRoot
$configDir = Join-Path $root "config\environments"
$configPath = Join-Path $configDir ("{0}.ps1" -f $Environment)

if (-not (Test-Path -LiteralPath $configPath)) {
    $available = Get-ChildItem -Path $configDir -Filter "*.ps1" -Name | ForEach-Object { $_ -replace '\\.ps1$', '' }
    if (-not $available) {
        Write-Error "No environment profiles have been created yet. Copy one of the *.ps1.example templates in config\\environments." 
    }
    else {
        Write-Error ("Environment profile '{0}' was not found. Available profiles: {1}" -f $Environment, ($available -join ', '))
    }
    exit 1
}

# load profile (expects it to set $EnvironmentConfig)
. $configPath

if (-not (Get-Variable -Name EnvironmentConfig -Scope Script -ErrorAction SilentlyContinue)) {
    Write-Error "The profile script must define an `$EnvironmentConfig hashtable."
    exit 1
}

$envConfig = $EnvironmentConfig

$variables = @{}
if ($envConfig.ContainsKey('Variables') -and $envConfig.Variables) {
    $variables = $envConfig.Variables
}

$appliedVariables = @()
foreach ($pair in $variables.GetEnumerator()) {
    $name = [string]$pair.Key
    $value = [string]$pair.Value
    [System.Environment]::SetEnvironmentVariable($name, $value, "Process")
    if ($Persist.IsPresent) {
        [System.Environment]::SetEnvironmentVariable($name, $value, "User")
    }
    $appliedVariables += [PSCustomObject]@{ Name = $name; Value = $value }
}

# Track active environment for convenience
[System.Environment]::SetEnvironmentVariable("TASKFLOW_ACTIVE_ENV", $Environment, "Process")
if ($Persist.IsPresent) {
    [System.Environment]::SetEnvironmentVariable("TASKFLOW_ACTIVE_ENV", $Environment, "User")
}

$files = @()
if ($envConfig.ContainsKey('Files') -and $envConfig.Files) {
    $files = $envConfig.Files
}

$copiedFiles = @()
foreach ($file in $files) {
    if (-not ($file -is [System.Collections.IDictionary])) {
        Write-Warning "Skipping malformed file entry: $file"
        continue
    }

    $sourcePath = Resolve-RepoPath -Root $root -Path ([string]$file.Source)
    $targetPath = Resolve-RepoPath -Root $root -Path ([string]$file.Target)
    $optional = $false
    if ($file.ContainsKey('Optional')) {
        $optional = [bool]$file.Optional
    }

    if (-not (Test-Path -LiteralPath $sourcePath)) {
        if ($optional) {
            Write-Warning ("Optional source file not found: {0}" -f $sourcePath)
            continue
        }

        throw "Required source file not found: $sourcePath"
    }

    $targetDir = Split-Path -Parent $targetPath
    if (-not (Test-Path -LiteralPath $targetDir)) {
        New-Item -ItemType Directory -Path $targetDir -Force | Out-Null
    }

    Copy-Item -LiteralPath $sourcePath -Destination $targetPath -Force
    $copiedFiles += [PSCustomObject]@{ Source = $sourcePath; Target = $targetPath }
}

$displayName = $envConfig.DisplayName
if (-not $displayName) {
    $displayName = $Environment
}

Write-Host "Environment switched to: $displayName" -ForegroundColor Green
if ($envConfig.Description) {
    Write-Host $envConfig.Description.Trim()
}

if ($appliedVariables.Count -gt 0) {
    Write-Host "`nApplied environment variables:" -ForegroundColor Cyan
    $appliedVariables | Format-Table -AutoSize
}
else {
    Write-Host "`nNo environment variables defined in profile." -ForegroundColor Yellow
}

if ($copiedFiles.Count -gt 0) {
    Write-Host "`nUpdated configuration files:" -ForegroundColor Cyan
    $copiedFiles | Format-Table -AutoSize
}
else {
    Write-Host "`nNo configuration files were copied." -ForegroundColor Yellow
}

Write-Host "`nRemember to start new terminals or re-run use-env.ps1 in each shell that needs the variables." -ForegroundColor DarkGray
