#!/bin/bash

# Test NearHire Audio Workflow
echo "=== NearHire Audio Workflow Test ==="
echo ""

# Test 1: Check if backend is running
echo "Test 1: Checking backend health..."
HEALTH=$(curl -s http://localhost:4000/api/health)
if [[ $HEALTH == *"ok"* ]]; then
  echo "✓ Backend is running on port 4000"
else
  echo "✗ Backend NOT running on port 4000"
  echo "  Please run: npm run dev (from root)"
  exit 1
fi

# Test 2: Test transcription endpoint
echo ""
echo "Test 2: Testing /api/ai/transcribe endpoint..."
TRANSCRIBE=$(curl -s -X POST http://localhost:4000/api/ai/transcribe \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "cand-001",
    "jobId": "job-001",
    "fileName": "test.webm",
    "audioBase64": "Zm9vYmFy",
    "language": "auto"
  }')

if [[ $TRANSCRIBE == *"transcript"* ]]; then
  echo "✓ Transcription endpoint working"
  echo "  Response: $TRANSCRIBE" | head -c 100
  echo "..."
else
  echo "✗ Transcription endpoint failed"
  echo "  Response: $TRANSCRIBE"
  exit 1
fi

# Test 3: Test resume generation endpoint
echo ""
echo "Test 3: Testing /api/ai/resume endpoint..."
RESUME=$(curl -s -X POST http://localhost:4000/api/ai/resume \
  -H "Content-Type: application/json" \
  -d '{
    "candidateId": "cand-001",
    "jobId": "job-001",
    "transcript": "I am interested in the Store Associate position",
    "language": "English"
  }')

if [[ $RESUME == *"resume"* ]]; then
  echo "✓ Resume endpoint working"
  echo "  Response: $RESUME" | head -c 100
  echo "..."
else
  echo "✗ Resume endpoint failed"
  echo "  Response: $RESUME"
  exit 1
fi

# Test 4: Test translation endpoint
echo ""
echo "Test 4: Testing /api/ai/translate endpoint..."
TRANSLATE=$(curl -s -X POST http://localhost:4000/api/ai/translate \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Mujhe ye job karna hai",
    "sourceLanguage": "Hindi",
    "targetLanguage": "English"
  }')

if [[ $TRANSLATE == *"translatedText"* ]]; then
  echo "✓ Translation endpoint working"
  echo "  Response: $TRANSLATE" | head -c 100
  echo "..."
else
  echo "✗ Translation endpoint failed"
  echo "  Response: $TRANSLATE"
  exit 1
fi

echo ""
echo "=== All API endpoints working! ==="
echo ""
echo "Frontend Test Instructions:"
echo "1. Open browser: http://localhost:3000/candidate"
echo "2. Check browser console (F12) for debug logs"
echo "3. Click 'Record voice intro'"
echo "4. Record audio and submit"
echo "5. Watch console for workflow steps:"
echo "   - Step 1: Uploading audio..."
echo "   - Step 2: Transcribing..."
echo "   - Step 3: Translating... (if non-English)"
echo "   - Step 4: Generating resume..."
echo "6. Check if Transcript and Resume appear below"
echo ""
