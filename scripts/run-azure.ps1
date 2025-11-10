param(
    [int]$ApiPort = 6000,
    [switch]$SkipApi,
    [switch]$SkipFunctions,
    [switch]$SkipFrontend,
    [switch]$KillApiPort
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$unsafePorts = @(6000, 6665, 6666, 6667, 6668, 6669, 6697, 10080)
if ($ApiPort -le 1023 -or $unsafePorts -contains $ApiPort) {
    $fallbackPort = 5149
    Write-Warning "Port $ApiPort is blocked by modern browsers. Switching to $fallbackPort for local requests."
    $ApiPort = $fallbackPort
}

function Start-WindowedProcess {
    param(
        [string]$Title,
        [string]$Command
    )

    $escaped = $Command.Replace('"', '`"')
    Start-Process -FilePath "powershell" -ArgumentList "-NoLogo", "-NoExit", "-Command", "Write-Host '*** $Title ***' -ForegroundColor Yellow; $escaped" -WindowStyle Normal -PassThru
}

function Test-PortAvailability {
    param(
        [int]$Port,
        [switch]$Kill
    )

    $connections = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
    if ($connections) {
        $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Sort-Object -Unique

        if ($Kill) {
            foreach ($processId in $processIds) {
                try {
                    $process = Get-Process -Id $processId -ErrorAction Stop
                    Write-Warning "Stopping process '$($process.ProcessName)' (PID $processId) holding port $Port..."
                    Stop-Process -Id $processId -Force -ErrorAction Stop
                }
                catch {
                    Write-Warning "Failed to stop PID ${processId}: $_"
                }
            }

            Start-Sleep -Seconds 1
            $connections = Get-NetTCPConnection -State Listen -LocalPort $Port -ErrorAction SilentlyContinue
            if (-not $connections) {
                Write-Host "Port $Port cleared successfully." -ForegroundColor Green
                return
            }
            $processIds = $connections | Select-Object -ExpandProperty OwningProcess -Unique | Sort-Object -Unique
            Write-Warning "Port $Port is still in use by PID(s) $($processIds -join ', ')."
        }

        Write-Warning "Port $Port is already in use by PID(s) $($processIds -join ', ')."
        Write-Host "Terminate these process IDs or rerun with -KillApiPort before retrying." -ForegroundColor Yellow
        throw "Port $Port is not available."
    }
}

Write-Host "Switching to Azure (production) environment..." -ForegroundColor Yellow
powershell -NoProfile -ExecutionPolicy Bypass -File "${PSScriptRoot}\use-env.ps1" azure

Write-Host "Ensuring connectivity to Azure SQL (warming up)..." -ForegroundColor Yellow
$localSettingsPath = Join-Path $PSScriptRoot "..\TaskFlow.Api\appsettings.Local.json"
if (Test-Path $localSettingsPath) {
    $localSettings = Get-Content $localSettingsPath -Raw | ConvertFrom-Json
    $connectionString = $localSettings.ConnectionStrings.DefaultConnection
    if ($connectionString) {
        try {
            $builder = New-Object System.Data.SqlClient.SqlConnectionStringBuilder $connectionString
            $server = $builder.DataSource
        }
        catch {
            $match = [regex]::Match($connectionString, "Server=([^;]+);")
            if ($match.Success) {
                $server = $match.Groups[1].Value
            }
        }

        if ($server) {
            $sqlHost = $server -replace "^tcp:", "" -replace ",[0-9]+$", ""
            if ($sqlHost) {
                try {
                    Test-NetConnection -ComputerName $sqlHost -Port 1433 | Out-Null
                }
                catch {
                    Write-Warning "Failed to reach Azure SQL at ${sqlHost}: $_"
                }
            }
        }
    }
}

Write-Host "Launching services that point to Azure resources..." -ForegroundColor Yellow

$apiSettingsPath = Join-Path $PSScriptRoot "..\TaskFlow.Api\appsettings.Local.json"
$apiSettingsOriginal = $null
$frontendEnvPath = Join-Path $PSScriptRoot "..\taskflow-frontend\.env.local"
$frontendEnvOriginal = $null

$restoreConnectionString = $null
$restoreLegacyConnectionString = $null
$hadConnectionStringVar = $false
$hadLegacyConnectionStringVar = $false
$launchedProcesses = @()

try {
    if ($SkipFunctions) {
        if (Test-Path Env:AzureStorage__ConnectionString) {
            $restoreConnectionString = $env:AzureStorage__ConnectionString
            $hadConnectionStringVar = $true
            Remove-Item Env:AzureStorage__ConnectionString -ErrorAction SilentlyContinue
        }
        else {
            $hadConnectionStringVar = $false
        }

        if (Test-Path Env:AZURE_STORAGE_CONNECTION_STRING) {
            $restoreLegacyConnectionString = $env:AZURE_STORAGE_CONNECTION_STRING
            $hadLegacyConnectionStringVar = $true
            Remove-Item Env:AZURE_STORAGE_CONNECTION_STRING -ErrorAction SilentlyContinue
        }
        else {
            $hadLegacyConnectionStringVar = $false
        }

        Write-Warning "Functions skipped; AzureStorage connection strings removed so API falls back to direct SMTP."

        if (Test-Path -LiteralPath $apiSettingsPath) {
            try {
                $apiSettings = Get-Content -LiteralPath $apiSettingsPath -Raw | ConvertFrom-Json
                if ($apiSettings.PSObject.Properties.Name -contains "AzureStorage") {
                    $azureStorage = $apiSettings.AzureStorage
                    if ($azureStorage.PSObject.Properties.Name -contains "ConnectionString") {
                        $apiSettingsOriginal = $azureStorage.ConnectionString
                        $azureStorage.PSObject.Properties.Remove("ConnectionString")
                        $apiSettings | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $apiSettingsPath -Encoding UTF8
                        Write-Warning "Removed AzureStorage.ConnectionString from appsettings.Local.json for fallback testing."
                    }
                }
            }
            catch {
                Write-Warning "Failed to wipe AzureStorage connection string in appsettings.Local.json: $_"
            }
        }

        try {
            if (Test-Path -LiteralPath $frontendEnvPath) {
                $frontendEnvOriginal = Get-Content -LiteralPath $frontendEnvPath -Raw
                $frontendLines = ($frontendEnvOriginal -split "`n") | ForEach-Object { $_.TrimEnd("`r") }
            }
            else {
                $frontendLines = @()
            }

            $retainedLines = @()
            foreach ($line in $frontendLines) {
                if ($line -match '^\s*VITE_ROOT_URL=') { continue }
                $retainedLines += $line
            }

            $localRoot = "VITE_ROOT_URL=http://localhost:$ApiPort"
            $updatedLines = @($localRoot) + ($retainedLines | Where-Object { $_ -ne "" })
            $content = [string]::Join([Environment]::NewLine, $updatedLines)
            Set-Content -LiteralPath $frontendEnvPath -Value $content -Encoding UTF8
            Write-Warning "Updated taskflow-frontend\.env.local to target http://localhost:$ApiPort for fallback testing."
        }
        catch {
            Write-Warning "Failed to update taskflow-frontend\.env.local: $_"
        }
    }

    if (-not $SkipApi) {
        Test-PortAvailability -Port $ApiPort -Kill:$KillApiPort
        $apiProcess = Start-WindowedProcess -Title "API (Azure)" -Command "Set-Location '$PSScriptRoot\..\TaskFlow.Api'; dotnet run --configuration Release --project TaskFlow.Api.csproj --no-launch-profile --urls http://localhost:$ApiPort"
        if ($apiProcess) { $launchedProcesses += $apiProcess }
    }

    if (-not $SkipFunctions) {
        $functionsProcess = Start-WindowedProcess -Title "Functions (Azure)" -Command "Set-Location '$PSScriptRoot\..\TaskFlow.Functions'; func start"
        if ($functionsProcess) { $launchedProcesses += $functionsProcess }
    }

    if (-not $SkipFrontend) {
        $frontendProcess = Start-WindowedProcess -Title "Frontend (Azure config)" -Command "Set-Location '$PSScriptRoot\..\taskflow-frontend'; npm run dev"
        if ($frontendProcess) { $launchedProcesses += $frontendProcess }
    }

    Write-Host "All requested processes started. Close each window or press Ctrl+C inside them to stop." -ForegroundColor Green

    if ($SkipFunctions -and $launchedProcesses.Count -gt 0) {
        Write-Host "Waiting for started processes to exit before restoring Azure storage configuration..." -ForegroundColor Yellow
        try {
            $processIds = $launchedProcesses | Where-Object { $_ } | Select-Object -ExpandProperty Id
            if ($processIds) {
                Wait-Process -Id $processIds
            }
        }
        catch [System.Exception] {
            Write-Warning "Wait-Process interrupted: $_"
        }
    }
}
finally {
    if ($SkipFunctions) {
        if ($null -ne $apiSettingsOriginal -and (Test-Path -LiteralPath $apiSettingsPath)) {
            try {
                $apiSettings = Get-Content -LiteralPath $apiSettingsPath -Raw | ConvertFrom-Json
                if ($apiSettings.PSObject.Properties.Name -contains "AzureStorage") {
                    $azureStorage = $apiSettings.AzureStorage
                    $azureStorage | Add-Member -NotePropertyName "ConnectionString" -NotePropertyValue $apiSettingsOriginal -Force
                    $apiSettings | ConvertTo-Json -Depth 10 | Set-Content -LiteralPath $apiSettingsPath -Encoding UTF8
                }
            }
            catch {
                Write-Warning "Failed to restore AzureStorage connection string in appsettings.Local.json: $_"
            }
        }

        if ($hadConnectionStringVar) {
            $env:AzureStorage__ConnectionString = $restoreConnectionString
        }
        else {
            Remove-Item Env:AzureStorage__ConnectionString -ErrorAction SilentlyContinue
        }

        if ($hadLegacyConnectionStringVar) {
            $env:AZURE_STORAGE_CONNECTION_STRING = $restoreLegacyConnectionString
        }
        else {
            Remove-Item Env:AZURE_STORAGE_CONNECTION_STRING -ErrorAction SilentlyContinue
        }

        if ($null -ne $frontendEnvOriginal) {
            try {
                Set-Content -LiteralPath $frontendEnvPath -Value $frontendEnvOriginal -Encoding UTF8
            }
            catch {
                Write-Warning "Failed to restore taskflow-frontend\.env.local: $_"
            }
        }
        else {
            Remove-Item -LiteralPath $frontendEnvPath -ErrorAction SilentlyContinue
        }
        Write-Host "Restored Azure storage connection settings after launch." -ForegroundColor DarkGray
    }
}
