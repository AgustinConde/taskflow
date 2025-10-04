# TaskFlow Deployment Verification Script
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "  TaskFlow Deployment Verification" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

$allPassed = $true

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

# Check 3: appsettings.json configuration
Write-Host "[3/7] Checking appsettings.json..." -ForegroundColor Yellow
$appsettings = "TaskFlow.Api\appsettings.json"
if (Test-Path $appsettings) {
    $config = Get-Content $appsettings | ConvertFrom-Json
    
    $issues = @()
    if ([string]::IsNullOrEmpty($config.ConnectionStrings.DefaultConnection)) {
        $issues += "ConnectionString is empty"
    }
    if ([string]::IsNullOrEmpty($config.Smtp.Host)) {
        $issues += "SMTP Host is empty"
    }
    if ([string]::IsNullOrEmpty($config.Smtp.User)) {
        $issues += "SMTP User is empty"
    }
    if ([string]::IsNullOrEmpty($config.Jwt.Key)) {
        $issues += "JWT Key is empty"
    }
    elseif ($config.Jwt.Key.Length -lt 32) {
        $issues += "JWT Key too short (needs 32+ characters)"
    }
    
    if ($issues.Count -eq 0) {
        Write-Host "  [OK] appsettings.json configured" -ForegroundColor Green
    }
    else {
        Write-Host "  [ERROR] appsettings.json issues:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "    - $issue" -ForegroundColor Red
        }
        $allPassed = $false
    }
}
else {
    Write-Host "  [ERROR] appsettings.json not found" -ForegroundColor Red
    $allPassed = $false
}

# Check 4: Environment variables
Write-Host "[4/7] Checking environment variables..." -ForegroundColor Yellow
$frontendUrl = [Environment]::GetEnvironmentVariable("FRONTEND_URL")
if ([string]::IsNullOrEmpty($frontendUrl)) {
    Write-Host "  [WARN] FRONTEND_URL not set (will default to http://localhost:5173)" -ForegroundColor Yellow
    Write-Host "    For production, set: set FRONTEND_URL=https://your-domain.com" -ForegroundColor Gray
}
else {
    Write-Host "  [OK] FRONTEND_URL = $frontendUrl" -ForegroundColor Green
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

# Check 7: .env file
Write-Host "[7/7] Checking frontend .env file..." -ForegroundColor Yellow
$envFile = "taskflow-frontend\.env"
if (Test-Path $envFile) {
    $envContent = Get-Content $envFile -Raw
    if ($envContent -match "VITE_ROOT_URL=(.+)") {
        $viteUrl = $matches[1].Trim()
        Write-Host "  [OK] VITE_ROOT_URL = $viteUrl" -ForegroundColor Green
    }
    else {
        Write-Host "  [WARN] VITE_ROOT_URL not found in .env" -ForegroundColor Yellow
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
    Write-Host "  [WARN] .env file not found. Copy from .env.example" -ForegroundColor Yellow
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
Write-Host "  4. Test all features using the checklist in DEPLOYMENT.md`n" -ForegroundColor Gray

# Return exit code
if ($allPassed) { exit 0 } else { exit 1 }
