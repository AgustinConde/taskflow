# TaskFlow Deployment Verification Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TaskFlow Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allPassed = $true

# Detect environment (default: production)
$envMode = $env:ASPNETCORE_ENVIRONMENT
if ([string]::IsNullOrEmpty($envMode)) { $envMode = "Production" }
Write-Host "[INFO] Environment: $envMode" -ForegroundColor Cyan

# Backend env file selection
if ($envMode -eq "Production") {
    $backendEnvFile = "TaskFlow.Api\.env.production"
    $backendSettingsFile = "TaskFlow.Api\appsettings.Production.json"
}
elseif ($envMode -eq "Development") {
    $backendEnvFile = "TaskFlow.Api\.env.development"
    $backendSettingsFile = "TaskFlow.Api\appsettings.Development.json"
}
else {
    $backendEnvFile = "TaskFlow.Api\.env"
    $backendSettingsFile = "TaskFlow.Api\appsettings.json"
}

# Frontend env file selection
if ($envMode -eq "Production") {
    $frontendEnvFile = "taskflow-frontend\.env.production"
}
elseif ($envMode -eq "Development") {
    $frontendEnvFile = "taskflow-frontend\.env.development"
}
else {
    $frontendEnvFile = "taskflow-frontend\.env"
}

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
Write-Host "[3/7] Checking backend env file ($backendEnvFile)..." -ForegroundColor Yellow
if (Test-Path $backendEnvFile) {
    $envContent = Get-Content $backendEnvFile -Raw
    $missingVars = @()
    if ($envContent -notmatch "ConnectionStrings__DefaultConnection=(.+)") {
        $missingVars += "ConnectionStrings__DefaultConnection missing"
    }
    if ($envContent -notmatch "Smtp__Host=(.+)") {
        $missingVars += "Smtp__Host missing"
    }
    if ($envContent -notmatch "Smtp__User=(.+)") {
        $missingVars += "Smtp__User missing"
    }
    if ($envContent -notmatch "Jwt__Key=(.+)") {
        $missingVars += "Jwt__Key missing"
    }
    if ($missingVars.Count -eq 0) {
        Write-Host "  [OK] All critical backend env variables present" -ForegroundColor Green
    }
    else {
        Write-Host "  [ERROR] Backend env file issues:" -ForegroundColor Red
        foreach ($var in $missingVars) {
            Write-Host "    - $var" -ForegroundColor Red
        }
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] Backend env file not found: $backendEnvFile" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Frontend env file
Write-Host "[4/7] Checking frontend env file ($frontendEnvFile)..." -ForegroundColor Yellow
if (Test-Path $frontendEnvFile) {
    $envContent = Get-Content $frontendEnvFile -Raw
    if ($envContent -match "VITE_ROOT_URL=(.+)") {
        $viteUrl = $matches[1].Trim()
        Write-Host "  [OK] VITE_ROOT_URL = $viteUrl" -ForegroundColor Green
    }
    else {
        Write-Host "  [WARN] VITE_ROOT_URL not found in $frontendEnvFile" -ForegroundColor Yellow
    }
    if ($envContent -match "VITE_GOOGLE_MAPS_API_KEY=(.+)") {
        $apiKey = $matches[1].Trim()
        if ($apiKey -eq "your_google_maps_api_key_here") {
            Write-Host "  [WARN] Google Maps API key not configured" -ForegroundColor Yellow
        }
        else {
            Write-Host "  [OK] Google Maps API key configured" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "  [WARN] Frontend env file not found: $frontendEnvFile" -ForegroundColor Yellow
}

# Check 5: Database migrations
Write-Host "[5/7] Checking database migrations..." -ForegroundColor Yellow
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

# Check 6: Node modules (for development)
Write-Host "[6/7] Checking frontend dependencies..." -ForegroundColor Yellow
$nodeModules = "taskflow-frontend\node_modules"
if (Test-Path $nodeModules) {
    Write-Host "  [OK] node_modules/ exists" -ForegroundColor Green
}
else {
    Write-Host "  [ERROR] node_modules/ not found" -ForegroundColor Red
    Write-Host "    Run: cd taskflow-frontend; npm install" -ForegroundColor Gray
    $allPassed = $false
}

# Check 7: appsettings file (optional)
Write-Host "[7/7] Checking backend appsettings file ($backendSettingsFile)..." -ForegroundColor Yellow
if (Test-Path $backendSettingsFile) {
    $config = Get-Content $backendSettingsFile | ConvertFrom-Json
    $issues = @()
    if ($config.ConnectionStrings.DefaultConnection -eq "") {
        $issues += "ConnectionString is empty (using env file is OK)"
    }
    if ($config.Smtp.Host -eq "") {
        $issues += "SMTP Host is empty (using env file is OK)"
    }
    if ($config.Smtp.User -eq "") {
        $issues += "SMTP User is empty (using env file is OK)"
    }
    if ($config.Jwt.Key -eq "") {
        $issues += "JWT Key is empty (using env file is OK)"
    }
    if ($issues.Count -eq 0) {
        Write-Host "  [OK] appsettings file present (values may be set via env file)" -ForegroundColor Green
    }
    else {
        Write-Host "  [INFO] appsettings file present but values are empty (expected if using env files)" -ForegroundColor Yellow
        foreach ($issue in $issues) {
            Write-Host "    - $issue" -ForegroundColor Yellow
        }
    }
}
else {
    Write-Host "  [INFO] appsettings file not found: $backendSettingsFile (expected if using env files)" -ForegroundColor Yellow
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
