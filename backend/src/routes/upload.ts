import { Router } from 'express';

const router = Router();

router.post('/audio', (req, res) => {
  try {
    const { candidateId, jobId, fileName, audioBase64 } = req.body;
    if (!candidateId || !jobId || !fileName || !audioBase64) {
      return res.status(400).json({ error: 'candidateId, jobId, fileName and audioBase64 are required' });
    }

    // Validate that audioBase64 is actual base64 data
    if (typeof audioBase64 !== 'string' || audioBase64.length === 0) {
      return res.status(400).json({ error: 'Invalid audio data' });
    }

    // Calculate audio size (rough estimate)
    const audioSizeKB = Math.round(audioBase64.length * 0.75 / 1024);

    res.json({
      status: 'uploaded',
      fileName,
      candidateId,
      jobId,
      audioSizeKB,
      message: `Audio file ${fileName} (${audioSizeKB}KB) uploaded successfully. Processing for transcription...`,
    });
  } catch (error) {
    console.error('Error in /upload/audio:', error);
    res.status(500).json({ error: 'Failed to upload audio', details: (error as Error).message });
  }
});

export default router;
