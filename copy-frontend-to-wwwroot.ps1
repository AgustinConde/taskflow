# Script to build frontend and copy to backend wwwroot
# This allows the .NET backend to serve the React frontend as static files

Write-Host "[BUILD] Building and deploying TaskFlow frontend..." -ForegroundColor Cyan

# Navigate to frontend directory
Set-Location -Path "taskflow-frontend"

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
    Write-Host "[INSTALL] Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Failed to install dependencies" -ForegroundColor Red
        exit 1
    }
}

# Build the frontend
Write-Host "[BUILD] Building frontend..." -ForegroundColor Yellow
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
Write-Host "  Source: $sourcePath" -ForegroundColor Gray
Write-Host "  Destination: $destPath" -ForegroundColor Gray
Write-Host "  Files: $fileCount" -ForegroundColor Gray

Write-Host "`n[DONE] Frontend deployed successfully!" -ForegroundColor Green
Write-Host "[INFO] You can now run the backend with: dotnet run --project TaskFlow.Api/TaskFlow.Api.csproj" -ForegroundColor Cyan
