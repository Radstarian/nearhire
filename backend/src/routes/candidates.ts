import { Router } from 'express';

const router = Router();

// In-memory storage for candidate profiles
interface CandidateProfile {
  candidateId: string;
  jobId: string;
  jobTitle: string;
  company: string;
  audioFileName: string;
  transcript: string;
  resume: string;
  language: string;
  recordedAt: string;
  resumeScore?: number;
  audioUrl?: string;
  status: 'pending' | 'submitted' | 'reviewed';
}

const candidateProfiles: Record<string, CandidateProfile[]> = {};

// Create or update candidate profile from audio
router.post('/profile', (req, res) => {
  const { 
    candidateId, 
    jobId, 
    jobTitle, 
    company,
    audioFileName, 
    transcript, 
    resume,
    language = 'English',
    resumeScore = 88
  } = req.body;

  if (!candidateId || !jobId || !transcript || !resume) {
    return res.status(400).json({ 
      error: 'Missing required fields: candidateId, jobId, transcript, resume' 
    });
  }

  const profile: CandidateProfile = {
    candidateId,
    jobId,
    jobTitle: jobTitle || 'Applied Position',
    company: company || 'Company',
    audioFileName: audioFileName || `voice-intro-${Date.now()}.webm`,
    transcript,
    resume,
    language,
    recordedAt: new Date().toISOString(),
    resumeScore,
    status: 'pending',
  };

  // Store profile (grouped by candidateId for easy retrieval)
  if (!candidateProfiles[candidateId]) {
    candidateProfiles[candidateId] = [];
  }
  
  // Check if profile for this job already exists and replace it
  const existingIndex = candidateProfiles[candidateId].findIndex(p => p.jobId === jobId);
  if (existingIndex >= 0) {
    candidateProfiles[candidateId][existingIndex] = profile;
  } else {
    candidateProfiles[candidateId].push(profile);
  }

  return res.status(201).json({
    success: true,
    message: `Profile created successfully for ${jobTitle} at ${company}`,
    profile: {
      candidateId,
      jobId,
      jobTitle,
      company,
      recordedAt: profile.recordedAt,
      resumeScore,
      language,
      transcriptLength: transcript.length,
      status: 'pending'
    }
  });
});

// Get all profiles for a candidate
router.get('/profile/:candidateId', (req, res) => {
  const { candidateId } = req.params;
  
  const profiles = candidateProfiles[candidateId] || [];
  
  return res.json({
    candidateId,
    totalProfiles: profiles.length,
    profiles: profiles.map(p => ({
      candidateId: p.candidateId,
      jobId: p.jobId,
      jobTitle: p.jobTitle,
      company: p.company,
      recordedAt: p.recordedAt,
      resumeScore: p.resumeScore,
      language: p.language,
      status: p.status,
      transcriptPreview: p.transcript.substring(0, 100) + '...'
    }))
  });
});

// Get specific profile
router.get('/profile/:candidateId/:jobId', (req, res) => {
  const { candidateId, jobId } = req.params;
  
  const profiles = candidateProfiles[candidateId] || [];
  const profile = profiles.find(p => p.jobId === jobId);
  
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }
  
  return res.json(profile);
});

// Update profile status (after submission or review)
router.put('/profile/:candidateId/:jobId', (req, res) => {
  const { candidateId, jobId } = req.params;
  const { status } = req.body;

  if (!status || !['pending', 'submitted', 'reviewed'].includes(status)) {
    return res.status(400).json({ error: 'Invalid status' });
  }

  const profiles = candidateProfiles[candidateId];
  if (!profiles) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  const profile = profiles.find(p => p.jobId === jobId);
  if (!profile) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  profile.status = status as 'pending' | 'submitted' | 'reviewed';

  return res.json({
    success: true,
    message: `Profile status updated to ${status}`,
    profile: {
      candidateId: profile.candidateId,
      jobId: profile.jobId,
      jobTitle: profile.jobTitle,
      status: profile.status,
      updatedAt: new Date().toISOString()
    }
  });
});

// Delete profile
router.delete('/profile/:candidateId/:jobId', (req, res) => {
  const { candidateId, jobId } = req.params;

  const profiles = candidateProfiles[candidateId];
  if (!profiles) {
    return res.status(404).json({ error: 'Candidate not found' });
  }

  const index = profiles.findIndex(p => p.jobId === jobId);
  if (index < 0) {
    return res.status(404).json({ error: 'Profile not found' });
  }

  const deleted = profiles.splice(index, 1)[0];

  return res.json({
    success: true,
    message: 'Profile deleted successfully',
    profile: {
      candidateId: deleted.candidateId,
      jobId: deleted.jobId,
      jobTitle: deleted.jobTitle
    }
  });
});

export default router;
