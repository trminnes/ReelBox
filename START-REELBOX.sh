#!/bin/bash

echo "=========================================="
echo "  REELBOX - Starting Local Server..."
echo "=========================================="
echo ""

# Navigate to script directory
cd "$(dirname "$0")"

# Check for Python
if command -v python3 &>/dev/null; then
    PYTHON=python3
elif command -v python &>/dev/null; then
    PYTHON=python
else
    echo "ERROR: Python is not installed."
    echo "Install it from https://python.org"
    exit 1
fi

echo "Starting server on http://localhost:8080"
echo ""
echo "ReelBox will open in your browser automatically..."
echo ""
echo "Keep this window open while using ReelBox."
echo "Press Ctrl+C to stop the server."
echo ""

# Open browser after 1 second delay
(sleep 1 && open "http://localhost:8080/index.html" 2>/dev/null || \
 xdg-open "http://localhost:8080/index.html" 2>/dev/null) &

# Start server
$PYTHON -m http.server 8080
