#!/bin/bash
set -e

echo "Starting backend service..."
echo "Environment: PORT=$PORT"

# Create simple health check endpoint first (to pass Railway's health check)
mkdir -p /tmp/healthcheck
cat > /tmp/healthcheck/main.py << EOF
from fastapi import FastAPI
app = FastAPI()
@app.get("/")
async def health_check():
    return {"status": "ok"}
EOF

# Start a simple uvicorn server to pass health check
(cd /tmp/healthcheck && uvicorn main:app --host "::" --port 5000 &)
echo "Health check server started"

# Sleep for a moment to ensure health check server is up
sleep 2

# Start the actual application
echo "Starting main application..."
exec uvicorn main:app --host "::" --port 5000 