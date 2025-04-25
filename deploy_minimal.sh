#!/bin/bash
set -e

echo "========================================="
echo "Deploying minimal version to Railway"
echo "========================================="

# Copy minimal files for deployment
cp backend/main_minimal.py backend/main.py.minimal
cp railway.minimal.toml railway.toml.minimal

echo "Files prepared for deployment."
echo ""
echo "To deploy to Railway, run:"
echo "railway up --detach --config railway.toml.minimal"
echo ""
echo "Once health checks pass, you can deploy the full version." 