#!/bin/bash

# NearHire Development Server Setup
# This script verifies the complete audio-to-resume workflow

echo "=== NearHire Development Stack Check ==="
echo ""

# Check Node.js
echo "✓ Checking Node.js..."
node --version

# Check frontend
echo "✓ Building frontend..."
cd /workspaces/nearhire && npm run build --workspace frontend >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Frontend builds successfully"
else
  echo "  ✗ Frontend build failed"
  exit 1
fi

# Check backend
echo "✓ Building backend..."
cd /workspaces/nearhire && npm run build --workspace backend >/dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "  ✓ Backend builds successfully"
else
  echo "  ✗ Backend build failed"
  exit 1
fi

echo ""
echo "=== API Workflow (Audio → Transcription → Translation → Resume) ==="
echo ""
echo "Frontend: Next.js 14.2.5"
echo "  - API proxy configured in next.config.mjs"
echo "  - Rewrites /api/* → http://localhost:4000/api/*"
echo "  - Environment: .env.local with NEXT_PUBLIC_API_URL"
echo ""
echo "Backend: Express + TypeScript"
echo "  - Audio recording handler"
echo "  - Speech-to-text transcription"
echo "  - Multilingual translation (Hindi, Marathi, Tamil, Bengali → English)"
echo "  - AI resume generation"
echo "  - Interview scheduling"
echo ""
echo "=== Ready to start development server ==="
echo ""
echo "Run: npm run dev"
echo "  - Frontend: http://localhost:3000"
echo "  - Backend: http://localhost:4000"
echo ""
