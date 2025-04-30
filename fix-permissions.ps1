# PowerShell script to fix file permissions for Windows
Write-Host "Fixing file permissions for Windows..." -ForegroundColor Green

# Check if assets directory exists
if (Test-Path -Path ".\assets") {
    Write-Host "Removing read-only attributes from assets directory..." -ForegroundColor Yellow
    Get-ChildItem -Path ".\assets" -Recurse | ForEach-Object {
        if (($_.Attributes -band [System.IO.FileAttributes]::ReadOnly) -eq [System.IO.FileAttributes]::ReadOnly) {
            $_.Attributes = $_.Attributes -band -bnot [System.IO.FileAttributes]::ReadOnly
            Write-Host "Fixed: $($_.FullName)" -ForegroundColor Gray
        }
    }
} else {
    Write-Host "Assets directory not found!" -ForegroundColor Red
}

# Fix source code files
$directories = @(".", ".\components", ".\context", ".\data", ".\screens", ".\utils")
$extensions = @("*.js", "*.json")

foreach ($dir in $directories) {
    if (Test-Path -Path $dir) {
        Write-Host "Checking directory: $dir" -ForegroundColor Yellow
        foreach ($ext in $extensions) {
            Get-ChildItem -Path $dir -Filter $ext -Recurse | ForEach-Object {
                if (($_.Attributes -band [System.IO.FileAttributes]::ReadOnly) -eq [System.IO.FileAttributes]::ReadOnly) {
                    $_.Attributes = $_.Attributes -band -bnot [System.IO.FileAttributes]::ReadOnly
                    Write-Host "Fixed: $($_.FullName)" -ForegroundColor Gray
                }
            }
        }
    }
}

Write-Host "Permissions fixed successfully!" -ForegroundColor Green
