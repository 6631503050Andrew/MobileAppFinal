@echo off
echo Fixing permissions for EAS Build...

:: Fix permissions for assets directory
icacls assets /grant Everyone:(OI)(CI)F /T /C /Q
icacls assets /grant Users:(OI)(CI)R /T /C /Q

:: Fix permissions for source files
icacls *.js /grant Everyone:R /Q
icacls *.json /grant Everyone:R /Q
icacls components\* /grant Everyone:R /Q
icacls context\* /grant Everyone:R /Q
icacls data\* /grant Everyone:R /Q
icacls screens\* /grant Everyone:R /Q
icacls utils\* /grant Everyone:R /Q

echo Permissions fixed successfully!
pause