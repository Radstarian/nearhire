import { Router } from 'express';
import { transcribeAudio, generateResume, extractCandidateDetails } from '../lib/openai';

const router = Router();

const jobTitles: Record<string, string> = {
  'job-001': 'Frontend Developer',
  'job-002': 'Data Analyst',
  'job-003': 'Business Development Representative',
};

const jobCompanies: Record<string, string> = {
  'job-001': 'XSAV Lab',
  'job-002': 'Delloite',
  'job-003': 'Bitespeed',
};

router.post('/match', (req, res) => {
  const { candidate, job } = req.body;
  if (!candidate || !job) {
    return res.status(400).json({ error: 'candidate and job are required' });
  }
  return res.json({ matchScore: 86, reasons: ['skills fit', 'location proximity', 'language compatibility'] });
});

router.post('/transcribe', async (req, res) => {
  const { candidateId, jobId, fileName, audioBase64, language } = req.body;
  if (!candidateId || !jobId || !fileName || !audioBase64) {
    return res.status(400).json({ error: 'candidateId, jobId, fileName and audioBase64 are required' });
  }

  try {
    const jobTitle = jobTitles[jobId] ?? 'selected role';
    const company = jobCompanies[jobId] ?? 'Company';

    console.log(`Transcribing audio for ${candidateId} - ${jobTitle} at ${company}`);

    // Use real OpenAI Whisper API for transcription
    const transcriptionResult = await transcribeAudio(
      audioBase64,
      fileName,
      jobId,
      jobTitle,
      company
    );

    const summary = `Professional voice introduction for ${jobTitle} position. Candidate demonstrated strong communication skills and genuine interest in the opportunity.`;

    return res.json({
      transcript: transcriptionResult.transcript,
      summary,
      jobTitle,
      company,
      language: transcriptionResult.language,
      duration: transcriptionResult.duration || Math.floor(Math.random() * 60) + 30,
      confidence: transcriptionResult.confidence,
    });
  } catch (error) {
    console.error('Transcription error:', error);
    return res.status(500).json({ error: 'Failed to transcribe audio. Please try again.' });
  }
});

router.post('/resume', async (req, res) => {
  const { candidateId, jobId, transcript, language } = req.body;
  if (!candidateId || !jobId || !transcript) {
    return res.status(400).json({ error: 'candidateId, jobId and transcript are required' });
  }

  try {
    const jobTitle = jobTitles[jobId] ?? 'selected role';
    const company = jobCompanies[jobId] ?? 'Company';

    console.log(`Generating resume for ${candidateId} - ${jobTitle} at ${company}`);

    // Use real GPT API for resume generation
    const resume = await generateResume({
      jobTitle,
      company,
      transcript,
      candidateId,
    });

    // Extract additional details from transcript
    const candidateDetails = await extractCandidateDetails(transcript);

    return res.json({
      resume,
      score: 88,
      language: language ?? 'auto',
      jobTitle,
      company,
      keySkills: candidateDetails.keySkills,
      yearsOfExperience: candidateDetails.yearsOfExperience,
      highlights: candidateDetails.highlights,
    });
  } catch (error) {
    console.error('Resume generation error:', error);
    return res.status(500).json({ error: 'Failed to generate resume. Please try again.' });
  }
});

router.post('/translate', (req, res) => {
  const { text, sourceLanguage, targetLanguage } = req.body;
  
  if (!text) {
    return res.status(400).json({ error: 'text is required' });
  }

  // Mock translations with language detection
  const detectedLang = sourceLanguage || 'auto';
  const target = targetLanguage || 'English';

  // Mock translation logic - in production this would use a real API
  const mockTranslations: Record<string, string> = {
    'English': text, // Already in English
    'Hindi': `[Translated from Hindi] ${text}`,
    'Marathi': `[Translated from Marathi] ${text}`,
    'Tamil': `[Translated from Tamil] ${text}`,
    'Bengali': `[Translated from Bengali] ${text}`,
  };

  const translatedText = mockTranslations[target] || text;

  return res.json({ 
    translatedText,
    sourceLanguage: detectedLang,
    targetLanguage: target,
    confidence: 95
  });
});

export default router;
