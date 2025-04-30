#!/bin/bash
# Script to fix permissions for EAS Build

# Make script executable
chmod +x permissions-fix.sh

# Fix permissions for assets directory
chmod -R 755 ./assets
find ./assets -type d -exec chmod 755 {} \;
find ./assets -type f -exec chmod 644 {} \;

# Fix permissions for source code
chmod -R 644 *.js *.json
find ./components -type f -exec chmod 644 {} \;
find ./context -type f -exec chmod 644 {} \;
find ./data -type f -exec chmod 644 {} \;
find ./screens -type f -exec chmod 644 {} \;
find ./utils -type f -exec chmod 644 {} \;

echo "Permissions fixed successfully!"
