import { Router } from 'express';

const router = Router();

// Mock database for scheduled interviews
const scheduledInterviews: Array<{ candidateId: string; jobId: string; scheduledAt: string; status: string; candidateName?: string; id: string }> = [];

router.get('/dashboard', (_req, res) => {
  res.json({
    openRoles: 24,
    candidates: 136,
    interviews: scheduledInterviews.length,
    hires: 8,
    topSuggestions: [
      { name: 'Asha Patel', score: 91, stage: 'Interview' },
      { name: 'Rohit Singh', score: 84, stage: 'Shortlisted' },
    ],
  });
});

router.post('/schedule', (req, res) => {
  const { candidateId, candidateName, jobId, scheduleAt } = req.body;
  
  if (!candidateId || !jobId || !scheduleAt) {
    return res.status(400).json({ 
      error: 'Missing required fields: candidateId, jobId, scheduleAt',
      status: 'failed'
    });
  }

  // Validate date format (basic ISO date check)
  if (isNaN(new Date(scheduleAt).getTime())) {
    return res.status(400).json({
      error: 'Invalid date format. Use ISO format: YYYY-MM-DD HH:MM',
      status: 'failed'
    });
  }

  // Check for duplicate scheduling
  const existing = scheduledInterviews.find(
    (interview) => interview.candidateId === candidateId && interview.jobId === jobId && interview.status === 'scheduled'
  );

  if (existing) {
    return res.status(409).json({
      error: `Interview already scheduled for ${candidateId} on ${existing.scheduledAt}`,
      status: 'conflict',
      existingSchedule: existing,
    });
  }

  // Schedule the interview
  const interview = {
    candidateId,
    jobId,
    scheduledAt: scheduleAt,
    status: 'scheduled',
    candidateName: candidateName || 'Candidate',
    id: `interview-${Date.now()}`,
  };

  scheduledInterviews.push(interview);

  res.status(201).json({
    status: 'scheduled',
    message: `Interview scheduled successfully for ${candidateName || candidateId} on ${scheduleAt}`,
    candidateId,
    jobId,
    scheduledAt: scheduleAt,
    interviewId: interview.id,
  });
});

router.get('/scheduled', (_req, res) => {
  res.json({
    status: 'success',
    count: scheduledInterviews.length,
    interviews: scheduledInterviews,
  });
});

router.delete('/scheduled/:interviewId', (req, res) => {
  const { interviewId } = req.params;
  const index = scheduledInterviews.findIndex((i) => i.id === interviewId);

  if (index === -1) {
    return res.status(404).json({ error: 'Interview not found', status: 'not_found' });
  }

  const removed = scheduledInterviews.splice(index, 1);
  res.json({
    status: 'cancelled',
    message: `Interview cancelled for ${removed[0].candidateName}`,
    interview: removed[0],
  });
});

export default router;
