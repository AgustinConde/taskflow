# TaskFlow Deployment Verification Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TaskFlow Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allPassed = $true

# Detect environment (default: production)
$envMode = $env:ASPNETCORE_ENVIRONMENT
if ([string]::IsNullOrEmpty($envMode)) { $envMode = "Production" }
Write-Host "[INFO] Environment: $envMode" -ForegroundColor Cyan

$profileName = $env:TASKFLOW_ACTIVE_ENV
if ([string]::IsNullOrEmpty($profileName)) {
    switch ($envMode) {
        "Development" { $profileName = "local" }
        "Production" { $profileName = "azure" }
        default { $profileName = $envMode.ToLowerInvariant() }
    }
}
Write-Host "[INFO] Active profile: $profileName" -ForegroundColor Cyan

$backendLocalFile = "TaskFlow.Api\appsettings.Local.json"
$functionsSettingsFile = "TaskFlow.Functions\local.settings.json"
$frontendEnvLocalFile = "taskflow-frontend\.env.local"

# Check 1: Frontend build exists
Write-Host "[1/7] Checking frontend build..." -ForegroundColor Yellow
$frontendDist = "taskflow-frontend\dist"
if (Test-Path $frontendDist) {
    $fileCount = (Get-ChildItem -Path $frontendDist -Recurse -File).Count
    Write-Host "  [OK] Frontend dist/ exists with $fileCount files" -ForegroundColor Green
}
else {
    Write-Host "  [ERROR] Frontend dist/ not found" -ForegroundColor Red
    Write-Host "    Run: cd taskflow-frontend; npm run build" -ForegroundColor Gray
    $allPassed = $false
}

# Check 2: wwwroot copy
Write-Host "[2/7] Checking wwwroot deployment..." -ForegroundColor Yellow
$wwwroot = "TaskFlow.Api\wwwroot"
if (Test-Path $wwwroot) {
    $wwwrootFiles = (Get-ChildItem -Path $wwwroot -Recurse -File).Count
    if ($wwwrootFiles -gt 10) {
        Write-Host "  [OK] wwwroot/ contains $wwwrootFiles files" -ForegroundColor Green
    }
    else {
        Write-Host "  [WARN] wwwroot/ has only $wwwrootFiles files" -ForegroundColor Yellow
        Write-Host "    Run: .\copy-frontend-to-wwwroot.ps1" -ForegroundColor Gray
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] wwwroot/ not found" -ForegroundColor Red
    Write-Host "    Run: .\copy-frontend-to-wwwroot.ps1" -ForegroundColor Gray
    $allPassed = $false
}

# Check 3: Backend env file
Write-Host "[3/7] Checking backend appsettings override ($backendLocalFile)..." -ForegroundColor Yellow
if (Test-Path $backendLocalFile) {
    try {
        $config = Get-Content $backendLocalFile -Raw | ConvertFrom-Json
        $missingVars = @()
        if (-not $config.ConnectionStrings -or [string]::IsNullOrWhiteSpace($config.ConnectionStrings.DefaultConnection)) {
            $missingVars += "ConnectionStrings.DefaultConnection missing"
        }
        if (-not $config.Smtp -or [string]::IsNullOrWhiteSpace($config.Smtp.Host)) {
            $missingVars += "Smtp.Host missing"
        }
        if (-not $config.Smtp -or [string]::IsNullOrWhiteSpace($config.Smtp.User)) {
            $missingVars += "Smtp.User missing"
        }
        if (-not $config.Jwt -or [string]::IsNullOrWhiteSpace($config.Jwt.Key)) {
            $missingVars += "Jwt.Key missing"
        }
        if (-not $config.AI -or [string]::IsNullOrWhiteSpace($config.AI.ApiKey)) {
            $missingVars += "AI.ApiKey missing"
        }

        if ($missingVars.Count -eq 0) {
            Write-Host "  [OK] appsettings.Local.json contains required values" -ForegroundColor Green
        }
        else {
            Write-Host "  [ERROR] Missing values in appsettings.Local.json:" -ForegroundColor Red
            foreach ($var in $missingVars) {
                Write-Host "    - $var" -ForegroundColor Red
            }
            $allPassed = $false
        }
    }
    catch {
        Write-Host "  [ERROR] Unable to parse $backendLocalFile as JSON: $_" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] Backend override file not found: $backendLocalFile" -ForegroundColor Red
    Write-Host "    Run: pwsh scripts/use-env.ps1 $profileName" -ForegroundColor Gray
    $allPassed = $false
}

# Check 4: Azure Functions local settings
Write-Host "[4/7] Checking Functions settings ($functionsSettingsFile)..." -ForegroundColor Yellow
if (Test-Path $functionsSettingsFile) {
    try {
        $functionsConfig = Get-Content $functionsSettingsFile -Raw | ConvertFrom-Json
        $values = $functionsConfig.Values
        $missingValues = @()
        if (-not $values -or [string]::IsNullOrWhiteSpace($values."AzureWebJobsStorage")) {
            $missingValues += "Values.AzureWebJobsStorage missing"
        }
        if (-not $values -or [string]::IsNullOrWhiteSpace($values."ConnectionStrings__DefaultConnection")) {
            $missingValues += "Values.ConnectionStrings__DefaultConnection missing"
        }
        if (-not $values -or [string]::IsNullOrWhiteSpace($values."Smtp__Host")) {
            $missingValues += "Values.Smtp__Host missing"
        }
        if (-not $values -or [string]::IsNullOrWhiteSpace($values."Smtp__User")) {
            $missingValues += "Values.Smtp__User missing"
        }
        if ($missingValues.Count -eq 0) {
            Write-Host "  [OK] local.settings.json contains required values" -ForegroundColor Green
        }
        else {
            Write-Host "  [ERROR] Missing entries in local.settings.json:" -ForegroundColor Red
            foreach ($var in $missingValues) {
                Write-Host "    - $var" -ForegroundColor Red
            }
            $allPassed = $false
        }
    }
    catch {
        Write-Host "  [ERROR] Unable to parse $functionsSettingsFile as JSON: $_" -ForegroundColor Red
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] Functions settings file not found: $functionsSettingsFile" -ForegroundColor Red
    Write-Host "    Run: pwsh scripts/use-env.ps1 $profileName" -ForegroundColor Gray
    $allPassed = $false
}

# Check 5: Frontend .env.local
Write-Host "[5/7] Checking frontend env file ($frontendEnvLocalFile)..." -ForegroundColor Yellow
if (Test-Path $frontendEnvLocalFile) {
    $envContent = Get-Content $frontendEnvLocalFile -Raw
    $missingFrontend = @()
    if ($envContent -match "VITE_ROOT_URL=(.+)") {
        $viteUrl = $matches[1].Trim()
        if ([string]::IsNullOrWhiteSpace($viteUrl)) {
            $missingFrontend += "VITE_ROOT_URL is empty"
        }
        else {
            Write-Host "  [OK] VITE_ROOT_URL is set" -ForegroundColor Green
        }
    }
    else {
        $missingFrontend += "VITE_ROOT_URL missing"
    }

    if ($envContent -match "VITE_GOOGLE_MAPS_API_KEY=(.*)") {
        $mapsKey = $matches[1].Trim()
        if ([string]::IsNullOrWhiteSpace($mapsKey)) {
            Write-Host "  [WARN] VITE_GOOGLE_MAPS_API_KEY is blank" -ForegroundColor Yellow
        }
        else {
            Write-Host "  [OK] VITE_GOOGLE_MAPS_API_KEY present" -ForegroundColor Green
        }
    }
    else {
        Write-Host "  [WARN] VITE_GOOGLE_MAPS_API_KEY not found (optional)" -ForegroundColor Yellow
    }

    if ($missingFrontend.Count -ne 0) {
        Write-Host "  [ERROR] Missing values in .env.local:" -ForegroundColor Red
        foreach ($item in $missingFrontend) {
            Write-Host "    - $item" -ForegroundColor Red
        }
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] Frontend env file not found: $frontendEnvLocalFile" -ForegroundColor Red
    Write-Host "    Run: pwsh scripts/use-env.ps1 $profileName" -ForegroundColor Gray
    $allPassed = $false
}

# Check 6: Database migrations
Write-Host "[6/7] Checking database migrations..." -ForegroundColor Yellow
$migrationsFolder = "TaskFlow.Api\Migrations"
if (Test-Path $migrationsFolder) {
    $migrationFiles = Get-ChildItem -Path $migrationsFolder -Filter "*.cs" | Where-Object { $_.Name -notlike "*Designer.cs" }
    $migrationCount = $migrationFiles.Count
    Write-Host "  [OK] Found $migrationCount migrations" -ForegroundColor Green
    Write-Host "    Remember to run: cd TaskFlow.Api; dotnet ef database update" -ForegroundColor Gray
}
else {
    Write-Host "  [ERROR] Migrations folder not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 7: Node modules (for development)
Write-Host "[7/7] Checking frontend dependencies..." -ForegroundColor Yellow
$nodeModules = "taskflow-frontend\node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  [OK] node_modules/ exists" -ForegroundColor Green
}
else {
    Write-Host "  [ERROR] node_modules/ not found" -ForegroundColor Red
    Write-Host "    Run: cd taskflow-frontend; npm install" -ForegroundColor Gray
    $allPassed = $false
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
if ($allPassed) {
    Write-Host "  [OK] All critical checks passed!" -ForegroundColor Green
    Write-Host "  Ready to deploy TaskFlow" -ForegroundColor Green
}
else {
    Write-Host "  [ERROR] Some checks failed" -ForegroundColor Red
    Write-Host "  Fix the issues above before deploying" -ForegroundColor Red
}
Write-Host "========================================`n" -ForegroundColor Cyan

Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Review docs/DEPLOYMENT.md for detailed instructions" -ForegroundColor Gray
Write-Host "  2. Apply database migrations: cd TaskFlow.Api; dotnet ef database update" -ForegroundColor Gray
Write-Host "  3. Start the backend: dotnet run --project TaskFlow.Api/TaskFlow.Api.csproj" -ForegroundColor Gray
Write-Host "  4. Test all features using el checklist in DEPLOYMENT.md`n" -ForegroundColor Gray

# Return exit code
if ($allPassed) { exit 0 } else { exit 1 }
