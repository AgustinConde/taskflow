# Script to build frontend and copy to backend wwwroot
# This allows the .NET backend to serve the React frontend as static files

Write-Host "[BUILD] Building and deploying TaskFlow frontend..." -ForegroundColor Cyan

# Detect environment (default: development for local, production for CI/CD)
$buildMode = $env:NODE_ENV
if ([string]::IsNullOrEmpty($buildMode)) {
    # Check if running in CI/CD environment
    if ($env:CI -eq "true" -or $env:GITHUB_ACTIONS -eq "true") {
        $buildMode = "production"
    }
    else {
        $buildMode = "development"
    }
}

Write-Host "[INFO] Build mode: $buildMode" -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "taskflow-frontend"

# Install dependencies
Write-Host "[INSTALL] Installing dependencies..." -ForegroundColor Yellow
# Always do a fresh install in CI/CD
if ($env:CI -eq "true" -or $env:GITHUB_ACTIONS -eq "true") {
    # Clean install in CI/CD
    if (Test-Path "node_modules") {
        Remove-Item -Path "node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    }
    # Temporarily unset NODE_ENV to install devDependencies
    $originalNodeEnv = $env:NODE_ENV
    $env:NODE_ENV = ""
    npm install --include=dev --legacy-peer-deps
    $env:NODE_ENV = $originalNodeEnv
}
else {
    # In local development, only install if node_modules doesn't exist
    if (-not (Test-Path "node_modules")) {
        npm install --include=dev --legacy-peer-deps
    }
    else {
        Write-Host "[SKIP] Dependencies already installed" -ForegroundColor Gray
    }
}
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
    exit 1
}

# Verify vite is installed
$vitePath = "node_modules\.bin\vite.cmd"
if (-not (Test-Path $vitePath)) {
    Write-Host "[ERROR] Vite not found in node_modules" -ForegroundColor Red
    Write-Host "[DEBUG] Listing node_modules\.bin:" -ForegroundColor Yellow
    Get-ChildItem "node_modules\.bin" -ErrorAction SilentlyContinue
    exit 1
}

# Build the frontend with detected environment
Write-Host "[BUILD] Building frontend in $buildMode mode..." -ForegroundColor Yellow
$env:NODE_ENV = $buildMode
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Build failed" -ForegroundColor Red
    exit 1
}

# Navigate back to root
Set-Location -Path ".."

# Define paths
$sourcePath = "taskflow-frontend\dist"
$destPath = "TaskFlow.Api\wwwroot"

# Check if source build exists
if (-not (Test-Path $sourcePath)) {
    Write-Host "[ERROR] Build directory not found at $sourcePath" -ForegroundColor Red
    exit 1
}

# Clean destination directory
if (Test-Path $destPath) {
    Write-Host "[CLEAN] Cleaning destination directory..." -ForegroundColor Yellow
    Remove-Item -Path "$destPath\*" -Recurse -Force -ErrorAction SilentlyContinue
}
else {
    Write-Host "[CREATE] Creating destination directory..." -ForegroundColor Yellow
    New-Item -Path $destPath -ItemType Directory -Force | Out-Null
}

# Copy files
Write-Host "[COPY] Copying files to wwwroot..." -ForegroundColor Yellow
Copy-Item -Path "$sourcePath\*" -Destination $destPath -Recurse -Force

# Verify copy
$fileCount = (Get-ChildItem -Path $destPath -Recurse -File).Count
Write-Host "[SUCCESS] Successfully copied $fileCount files to wwwroot" -ForegroundColor Green

# Show summary
Write-Host "`n[SUMMARY] Deployment Summary:" -ForegroundColor Cyan
Write-Host "  Build mode: $buildMode" -ForegroundColor Gray
Write-Host "  Source: $sourcePath" -ForegroundColor Gray
Write-Host "  Destination: $destPath" -ForegroundColor Gray
Write-Host "  Files: $fileCount" -ForegroundColor Gray

Write-Host "`n[DONE] Frontend deployed successfully!" -ForegroundColor Green
Write-Host "[INFO] You can now run the backend with: dotnet run --project TaskFlow.Api/TaskFlow.Api.csproj" -ForegroundColor Cyan
