# Script to copy built frontend files to backend wwwroot directory
# Modify PATH with your own root path and run this script after building the frontend to update the backend's wwwroot
# Usage: ".\copy-frontend-to-wwwroot.ps1" (on Windows PowerShell)
$PATH = "c:\Users\Awus1\Documents\taskflow\"

$frontendDist = "$PATH\taskflow-frontend\dist"
$backendWwwroot = "$PATH\TaskFlow.Api\wwwroot"

Write-Host "Deleting existing files in wwwroot..."
Get-ChildItem -Path $backendWwwroot | Where-Object { $_.Name -ne 'uploads' } | Remove-Item -Recurse -Force #exclude uploads folder

Write-Host "Copying files from frontend build to wwwroot..."
Copy-Item -Recurse -Force "$frontendDist\*" $backendWwwroot

Write-Host "Done! Frontend is updated in wwwroot."
