import { Router } from 'express';

const router = Router();

router.get('/analytics', (_req, res) => {
  res.json({
    employers: 78,
    candidates: 12400,
    monthlyAiCredits: 320000,
    whatsappEvents: 18900,
  });
});

router.get('/platform', (_req, res) => {
  res.json({
    roles: ['admin', 'employer', 'candidate'],
    regionalSettings: ['Hindi', 'Marathi', 'Tamil', 'Bengali', 'English'],
    fraudAlerts: 4,
  });
});

export default router;
