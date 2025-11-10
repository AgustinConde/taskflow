param(
    [switch]$SkipApi,
    [switch]$SkipFunctions,
    [switch]$SkipFrontend
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

function Start-WindowedProcess {
    param(
        [string]$Title,
        [string]$Command
    )

    $escaped = $Command.Replace('"', '`"')
    Start-Process -FilePath "powershell" -ArgumentList "-NoLogo", "-NoExit", "-Command", "Write-Host '*** $Title ***' -ForegroundColor Cyan; $escaped" -WindowStyle Normal
}

Write-Host "Switching to local development environment..." -ForegroundColor Cyan
powershell -NoProfile -ExecutionPolicy Bypass -File "${PSScriptRoot}\use-env.ps1" local

Write-Host "Launching services..." -ForegroundColor Cyan

if (-not $SkipApi) {
    Start-WindowedProcess -Title "API (local)" -Command "Set-Location '$PSScriptRoot\..\TaskFlow.Api'; dotnet watch run --project TaskFlow.Api.csproj"
}

if (-not $SkipFunctions) {
    Start-WindowedProcess -Title "Functions (local)" -Command "Set-Location '$PSScriptRoot\..\TaskFlow.Functions'; func start"
}

if (-not $SkipFrontend) {
    Start-WindowedProcess -Title "Frontend (local)" -Command "Set-Location '$PSScriptRoot\..\taskflow-frontend'; npm run dev"
}

Write-Host "All requested processes started. Close each window or press Ctrl+C inside them to stop." -ForegroundColor Green
