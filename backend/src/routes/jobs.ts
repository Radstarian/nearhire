import { Router } from 'express';

const router = Router();

router.get('/nearby', (_req, res) => {
  const jobs = [
    {
      id: 'job-001',
      title: 'Store Associate',
      company: 'GreenMart Grocers',
      salary: '₹18k–₹22k',
      distance: '2.1 km',
      location: 'Pune',
      match: 88,
      tags: ['Urgent', 'Full-time'],
    },
    {
      id: 'job-002',
      title: 'Delivery Partner',
      company: 'PayFast Logistics',
      salary: '₹16k–₹20k',
      distance: '4.8 km',
      location: 'Mumbai',
      match: 75,
      tags: ['Part-time'],
    },
    {
      id: 'job-003',
      title: 'Receptionist',
      company: 'Urban Hotels',
      salary: '₹20k–₹24k',
      distance: '1.5 km',
      location: 'Navi Mumbai',
      match: 92,
      tags: ['Full-time', 'Voice Apply'],
    },
  ];

  res.json({ jobs });
});

router.post('/apply', (req, res) => {
  const { jobId, candidateId, channel } = req.body;
  if (!jobId || !candidateId) {
    return res.status(400).json({ error: 'jobId and candidateId are required' });
  }
  return res.json({ status: 'applied', jobId, candidateId, channel: channel ?? 'web' });
});

export default router;
