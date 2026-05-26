import { Router } from 'express';

const router = Router();

router.post('/apply', (req, res) => {
  const { jobId, candidateId, language } = req.body;
  if (!jobId || !candidateId) {
    return res.status(400).json({ error: 'jobId and candidateId are required' });
  }

  res.json({
    status: 'whatsapp_apply_sent',
    jobId,
    candidateId,
    language: language ?? 'auto',
    message: 'WhatsApp quick apply message sent successfully.',
  });
});

router.post('/remind', (req, res) => {
  const { candidateName, interviewTime } = req.body;
  if (!candidateName || !interviewTime) {
    return res.status(400).json({ error: 'candidateName and interviewTime are required' });
  }

  res.json({
    status: 'whatsapp_reminder_sent',
    candidateName,
    interviewTime,
    message: 'Interview reminder sent via WhatsApp.',
  });
});

router.post('/broadcast', (_req, res) => {
  res.json({
    status: 'broadcast_scheduled',
    message: 'WhatsApp broadcast campaign queued for delivery.',
  });
});

export default router;
