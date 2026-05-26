import { Router } from 'express';
import { signJwt } from '../lib/jwt';

const router = Router();

router.post('/otp-login', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }

  // OTP flow placeholder
  const token = signJwt({ sub: phone, role: 'candidate' });
  return res.json({ token, user: { phone, role: 'candidate', name: 'Anonymous Candidate' } });
});

router.post('/whatsapp-login', (req, res) => {
  const { phone } = req.body;
  if (!phone) {
    return res.status(400).json({ error: 'Phone number is required' });
  }
  const token = signJwt({ sub: phone, role: 'candidate' });
  return res.json({ token, user: { phone, role: 'candidate', name: 'WhatsApp User' } });
});

export default router;
