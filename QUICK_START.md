# Quick Start Guide - NearHire Audio-to-Resume

## One-Line Setup
```bash
npm run dev
```

## What This Does
- Starts Next.js frontend on `http://localhost:3000`
- Starts Express backend on `http://localhost:4000`
- API calls automatically proxy from frontend to backend

## Test the Audio Workflow

### 1. Record Audio & Auto-Generate Resume (Candidate)
```
Visit: http://localhost:3000/candidate
1. Click "Record voice intro" button
2. Record 30-60 seconds of introduction
3. Click "Play" to preview (optional)
4. Click "Submit Recording"
→ Automatic flow starts:
   - Uploads audio
   - Transcribes to text
   - Translates to English (if needed)
   - Generates AI resume
   - Shows results in 30 seconds
```

### 2. Schedule Interview & Send Reminder (Employer)
```
Visit: http://localhost:3000/employer
1. Select candidate from dropdown
2. Pick date and time
3. Click "Schedule interview"
4. Click "Open WhatsApp reminder"
→ WhatsApp opens with auto-generated message
```

## File Structure
```
frontend/
  next.config.mjs         ← API proxy configuration
  .env.local              ← API URL (http://localhost:4000)
  app/
    candidate/page.tsx    ← Audio recording UI
    employer/page.tsx     ← Interview scheduling UI
    components/
      AudioRecorder.tsx   ← Recording controls component

backend/
  src/routes/
    ai.ts                 ← Transcribe, translate, resume
    employer.ts           ← Interview scheduling
    upload.ts             ← Audio upload validation
  tsconfig.json           ← TypeScript config
  .env                    ← Backend env (PORT=4000)
```

## API Flow (Automatic)
```
User Records → Upload → Transcribe → Translate → Resume → Display
(30 sec)    (instant) (instant)   (instant)   (instant) (instant)
```

## Troubleshooting

### Error: "<!DOCTYPE html>" instead of JSON
→ Backend not running on port 4000
→ Check `frontend/.env.local` has correct API_URL
→ Run: `npm run dev` to start backend

### No resume appearing
→ Check browser console for errors
→ Verify all 4 API endpoints are called in sequence
→ Check `backend` is running: `curl http://localhost:4000/api/health`

### Interview scheduling shows HTML error
→ Same as above - backend routing issue
→ Verify API proxy in `next.config.mjs`

## Key Status Messages
```
✓ Uploading audio for transcription...
✓ Transcribing your voice introduction...
✓ Translating transcription to English...
✓ 🤖 Generating AI resume from your voice...
✓ Resume automatically generated from your voice!
```

## Supported Languages
- Hindi → English (auto-detected & translated)
- Marathi → English (auto-detected & translated)
- Tamil → English (auto-detected & translated)
- Bengali → English (auto-detected & translated)
- English → English (no translation needed)

---
**All systems functional ✅ | Ready to test 🚀**
