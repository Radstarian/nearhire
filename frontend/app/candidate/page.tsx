'use client';

import Link from 'next/link';
import { useRef, useState, type ChangeEvent } from 'react';
import AudioRecorder from '../components/AudioRecorder';

const jobs = [
  {
    id: 'job-001',
    title: 'Frontend Developer',
    company: 'XSAV Lab',
    salary: '₹40k–₹55k',
    distance: '2.1 km',
    match: 88,
    tags: ['Urgent', 'Full-time'],
    location: 'Pune',
  },
  {
    id: 'job-002',
    title: 'Data Analyst',
    company: 'Delloite',
    salary: '₹40k–₹50k',
    distance: '4.8 km',
    match: 75,
    tags: ['Part-time'],
    location: 'Mumbai',
  },
  {
    id: 'job-003',
    title: 'Business Development Representative',
    company: 'Bitespeed',
    salary: '₹20k–₹24k',
    distance: '1.5 km',
    match: 92,
    tags: ['Full-time', 'Voice Apply'],
    location: 'Bangalore',
  },
];

export default function CandidatePage() {
  const [status, setStatus] = useState<string>('Ready to apply and upload voice files.');
  const [uploadFileName, setUploadFileName] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string>(jobs[0].id);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [resumeText, setResumeText] = useState<string | null>(null);
  const [isProcessingAudio, setIsProcessingAudio] = useState(false);
  const [showAudioRecorder, setShowAudioRecorder] = useState(false);
  const [editedTranscript, setEditedTranscript] = useState<string>('');
  const [transcriptApproved, setTranscriptApproved] = useState(false);
  const [pendingAudioFile, setPendingAudioFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const candidateId = 'cand-001';

  const fileToBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result === 'string') {
        const base64 = result.split(',')[1] ?? '';
        resolve(base64);
      } else {
        reject(new Error('Failed to read file')); 
      }
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });

  const uploadAudioFile = async (file: File, jobId: string) => {
    setUploadFileName(file.name);
    setIsProcessingAudio(true);
    setStatus('Uploading audio for transcription...');

    try {
      const audioBase64 = await fileToBase64(file);
      console.log('Audio file converted to base64, size:', audioBase64.length);
      
      // Step 1: Upload audio file
      console.log('Step 1: Uploading audio...');
      const uploadResponse = await fetch('/api/upload/audio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobId, fileName: file.name, audioBase64 }),
      });
      const uploadData = await uploadResponse.json();
      console.log('Upload response:', uploadData, 'Status:', uploadResponse.status);
      
      if (!uploadResponse.ok) {
        setStatus(`Upload failed: ${uploadData.error || 'Unknown error'}`);
        setIsProcessingAudio(false);
        return;
      }

      setStatus('Transcribing your voice introduction...');

      // Step 2: Transcribe audio
      console.log('Step 2: Transcribing...');
      const transcribeResponse = await fetch('/api/ai/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobId, fileName: file.name, audioBase64, language: 'auto' }),
      });
      const transcriptData = await transcribeResponse.json();
      console.log('Transcribe response:', transcriptData, 'Status:', transcribeResponse.status);

      if (!transcribeResponse.ok) {
        setStatus(`Transcription failed: ${transcriptData.error || 'Unknown error'}`);
        setIsProcessingAudio(false);
        return;
      }

      let transcriptText = transcriptData.transcript ?? 'Transcription completed.';
      const detectedLanguage = transcriptData.language ?? 'auto';
      console.log('Transcript:', transcriptText, 'Language:', detectedLanguage);

      // Step 3: Translate to English if needed
      if (detectedLanguage !== 'English' && detectedLanguage !== 'auto') {
        setStatus(`Translating transcription to English...`);
        console.log('Step 3: Translating...');
        
        const translateResponse = await fetch('/api/ai/translate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            text: transcriptText, 
            sourceLanguage: detectedLanguage,
            targetLanguage: 'English' 
          }),
        });
        const translateData = await translateResponse.json();
        console.log('Translate response:', translateData, 'Status:', translateResponse.status);

        if (translateResponse.ok && translateData.translatedText) {
          transcriptText = translateData.translatedText;
        }
      }

      setTranscript(transcriptText);
      setEditedTranscript(transcriptText);
      setTranscriptApproved(false);
      setPendingAudioFile(file);
      setStatus('✓ Transcription complete! Please review and approve before continuing...');
      setIsProcessingAudio(false);
      return;  // Stop here - wait for user approval
    } catch (error) {
      console.error('Error in uploadAudioFile:', error);
      setStatus(`Error: ${(error as Error).message}`);
      setIsProcessingAudio(false);
    }
  };

  const handleTranscriptApproval = async () => {
    if (!transcriptApproved || !pendingAudioFile || !editedTranscript) {
      setStatus('Error: Missing transcript approval data');
      return;
    }

    const jobId = selectedJobId;
    const file = pendingAudioFile;

    try {
      setIsProcessingAudio(true);
      setStatus('🤖 Generating AI resume from your voice...');

      // Step 4: Generate resume from transcript (using approved edited version)
      console.log('Step 4: Generating resume...');
      const resumeResponse = await fetch('/api/ai/resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ candidateId, jobId, transcript: editedTranscript, language: 'English' }),
      });
      const resumeData = await resumeResponse.json();
      console.log('Resume response:', resumeData, 'Status:', resumeResponse.status);

      if (!resumeResponse.ok) {
        setStatus(`Resume generation failed: ${resumeData.error || 'Unknown error'}`);
        setIsProcessingAudio(false);
        return;
      }

      setResumeText(resumeData.resume ?? 'Resume created successfully.');
      
      // Step 5: Create candidate profile (FINAL STEP - saves everything)
      console.log('Step 5: Creating candidate profile...');
      const selectedJob = jobs.find(j => j.id === jobId);
      
      const profileResponse = await fetch('/api/candidates/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          candidateId,
          jobId,
          jobTitle: selectedJob?.title || 'Applied Position',
          company: selectedJob?.company || 'Company',
          audioFileName: file.name,
          transcript: editedTranscript,
          resume: resumeData.resume,
          language: 'English',
          resumeScore: resumeData.score || 88
        }),
      });
      const profileData = await profileResponse.json();
      console.log('Profile response:', profileData, 'Status:', profileResponse.status);

      if (!profileResponse.ok) {
        setStatus(`Profile creation failed: ${profileData.error || 'Unknown error'}`);
        setIsProcessingAudio(false);
        return;
      }

      setStatus('✓ Profile created successfully! Your application is ready to submit.');
      setIsProcessingAudio(false);
      setTranscriptApproved(false);
      setEditedTranscript('');
      setPendingAudioFile(null);
    } catch (error) {
      console.error('Error in handleTranscriptApproval:', error);
      setStatus(`Error: ${(error as Error).message}`);
      setIsProcessingAudio(false);
    }
  };

  const handleApply = async (jobId: string) => {
    setStatus('Submitting application...');
    const response = await fetch('/api/jobs/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, candidateId, channel: 'web' }),
    });
    const data = await response.json();
    setStatus(data.message ?? `Applied to ${jobId} successfully.`);
  };

  const handleWhatsAppApply = async (jobId: string) => {
    const job = jobs.find((jobItem) => jobItem.id === jobId);
    if (!job) {
      setStatus('Selected job not found.');
      return;
    }

    const message = `Hi, I'm interested in the ${job.title} role at ${job.company}. Please share the next steps for applying.`;
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    setStatus(`Opening WhatsApp to apply for ${job.title}...`);

    const response = await fetch('/api/whatsapp/apply', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobId, candidateId, language: 'auto' }),
    });
    const data = await response.json();
    setStatus(data.message ?? `WhatsApp apply opened for ${job.title}.`);
  };

  const handleVoiceApply = async (jobId: string) => {
    setSelectedJobId(jobId);
    setShowAudioRecorder(true);
  };

  const handleAudioRecorderSubmit = async (file: File) => {
    await uploadAudioFile(file, selectedJobId);
    setShowAudioRecorder(false);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleUploadChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    await uploadAudioFile(file, selectedJobId);
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <header className="mb-8 flex flex-col gap-4 rounded-[32px] border border-gray-200 bg-white/90 p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-nearhire-700">Candidate Portal</p>
            <h1 className="mt-2 text-3xl font-semibold text-slate-900 sm:text-4xl">Nearby jobs & voice-powered applications.</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Discover local jobs, apply with one click, and create your AI profile using voice in Hindi, Marathi, Tamil or Bengali.</p>
          </div>
          <div className="space-y-3 sm:text-right">
            <Link href="#jobs" className="inline-flex rounded-full bg-nearhire-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-nearhire-700">Explore jobs</Link>
          </div>
        </header>

        {/* Transcript Review UI */}
        {transcript && !transcriptApproved && (
          <div className="mb-8 rounded-[32px] border-2 border-amber-300 bg-amber-50 p-8 shadow-lg">
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-amber-900">✓ Review Your Transcription</h2>
                <p className="mt-2 text-sm text-amber-800">
                  We've transcribed your voice introduction. Please review the text below and make any corrections before we generate your resume.
                </p>
              </div>

              <textarea
                value={editedTranscript}
                onChange={(e) => setEditedTranscript(e.target.value)}
                className="w-full rounded-2xl border-2 border-amber-200 bg-white p-4 font-mono text-sm leading-relaxed focus:border-amber-400 focus:outline-none"
                rows={8}
                placeholder="Your transcript will appear here..."
              />

              <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                <button
                  onClick={() => {
                    setTranscriptApproved(true);
                    setTimeout(() => handleTranscriptApproval(), 100);
                  }}
                  disabled={isProcessingAudio || !editedTranscript.trim()}
                  className="flex-1 rounded-full bg-green-600 px-6 py-3 font-semibold text-white shadow-md hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-gray-400"
                >
                  ✓ Approve & Generate Resume
                </button>
                <button
                  onClick={() => {
                    setTranscript(null);
                    setEditedTranscript('');
                    setTranscriptApproved(false);
                    setPendingAudioFile(null);
                    setShowAudioRecorder(true);
                  }}
                  disabled={isProcessingAudio}
                  className="flex-1 rounded-full border-2 border-orange-600 bg-white px-6 py-3 font-semibold text-orange-600 hover:bg-orange-50 disabled:cursor-not-allowed disabled:border-gray-400 disabled:text-gray-400"
                >
                  🔄 Re-record
                </button>
              </div>

              <p className="text-xs text-amber-700">
                💡 Tip: Review the text carefully. Correct any errors or missing details before approving to ensure your resume is accurate.
              </p>
            </div>
          </div>
        )}

        {/* Show approval button for next step when transcript is approved */}
        {transcript && transcriptApproved && isProcessingAudio && (
          <div className="mb-8 rounded-[32px] bg-blue-50 p-6 text-center">
            <p className="font-semibold text-blue-900">Processing your approved transcript...</p>
            <p className="mt-2 text-sm text-blue-700">Generating your AI resume...</p>
          </div>
        )}

        <section className="grid gap-6 lg:grid-cols-[1fr_380px]" style={{ display: transcript && !transcriptApproved ? 'none' : undefined }}>
          <div className="space-y-6">
            <div className="card p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Your candidate dashboard</h2>
                  <p className="mt-2 text-sm text-slate-600">Track applied jobs, interview status, saved roles, and WhatsApp notifications in one place.</p>
                </div>
                <div className="grid gap-2 sm:grid-cols-3">
                  {['Applied', 'Interview', 'Saved'].map((item) => (
                    <div key={item} className="rounded-3xl bg-nearhire-50 px-4 py-3 text-center text-sm font-semibold text-slate-900">{item}</div>
                  ))}
                </div>
              </div>
            </div>

            <div id="jobs" className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Nearby jobs</h2>
                  <p className="text-sm text-slate-600">Recommended based on your skills, location and application history.</p>
                </div>
                <span className="rounded-full bg-nearhire-100 px-3 py-1 text-sm text-nearhire-700">Nearby search</span>
              </div>
              <div className="grid gap-4">
                {jobs.map((job) => (
                  <article key={job.id} className="card p-5">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-sm text-slate-500"><span>{job.location}</span><span>•</span><span>{job.distance}</span></div>
                        <h3 className="mt-3 text-2xl font-semibold text-slate-900">{job.title}</h3>
                        <p className="mt-2 text-sm text-slate-600">{job.company}</p>
                        <div className="mt-4 flex flex-wrap gap-2">
                          {job.tags.map((tag) => (
                            <span key={tag} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-slate-700">{tag}</span>
                          ))}
                        </div>
                      </div>
                      <div className="flex flex-col items-start gap-3 text-right sm:items-end">
                        <p className="text-sm text-slate-500">Salary</p>
                        <p className="text-lg font-semibold text-slate-900">{job.salary}</p>
                        <p className="rounded-full bg-nearhire-50 px-3 py-1 text-sm font-semibold text-nearhire-700">Match {job.match}%</p>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div className="rounded-3xl bg-slate-50 p-4 text-sm text-slate-600">Use WhatsApp quick apply or convert your spoken introduction into a profile.</div>
                      <div className="flex flex-wrap gap-3">
                        <button onClick={() => handleApply(job.id)} className="rounded-full bg-nearhire-600 px-4 py-2 text-sm font-semibold text-white hover:bg-nearhire-700">Apply now</button>
                        <button onClick={() => handleWhatsAppApply(job.id)} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">WhatsApp apply</button>
                        <button onClick={() => handleVoiceApply(job.id)} className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">Voice apply</button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">Voice onboarding</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600">Select the job you want this audio resume to target, then record or upload your introduction.</p>
              <div className="mt-6 space-y-4">
                <label className="block text-sm font-medium text-slate-700">
                  Target job
                  <select value={selectedJobId} onChange={(event) => setSelectedJobId(event.target.value)} className="mt-2 block w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {jobs.map((job) => (
                      <option key={job.id} value={job.id}>{job.title} at {job.company}</option>
                    ))}
                  </select>
                </label>
                {showAudioRecorder ? (
                  <AudioRecorder onAudioSubmit={handleAudioRecorderSubmit} isProcessing={isProcessingAudio} jobId={selectedJobId} />
                ) : (
                  <>
                    <button onClick={() => setShowAudioRecorder(true)} disabled={isProcessingAudio} className="w-full rounded-3xl bg-nearhire-600 px-4 py-3 text-sm font-semibold text-white hover:bg-nearhire-700 disabled:cursor-not-allowed disabled:bg-slate-300">🎤 Record voice intro</button>
                    <button onClick={handleUploadClick} disabled={isProcessingAudio} className="w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700">📁 Upload audio file</button>
                    <input ref={fileInputRef} type="file" accept="audio/*" className="hidden" onChange={handleUploadChange} />
                  </>
                )}
              </div>
              {uploadFileName ? <p className="mt-4 text-sm text-slate-600">Uploaded file: {uploadFileName}</p> : null}
            </div>

            {transcript || resumeText ? (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-slate-900">AI generated resume</h2>
                <p className="mt-2 text-sm text-slate-600">Your audio has been transcribed and your resume is generated for the selected job.</p>
                {transcript ? (
                  <div className="mt-4 rounded-3xl bg-slate-50 p-4 text-sm text-slate-700">
                    <p className="font-semibold">Transcript</p>
                    <p className="whitespace-pre-wrap mt-2">{transcript}</p>
                  </div>
                ) : null}
                {resumeText ? (
                  <div className="mt-4 rounded-3xl bg-white p-4 text-sm text-slate-700 shadow-sm">
                    <p className="font-semibold">Generated resume</p>
                    <pre className="whitespace-pre-wrap text-sm leading-6 mt-2">{resumeText}</pre>
                  </div>
                ) : null}
              </div>
            ) : null}

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">AI profile score</h2>
              <p className="mt-2 text-sm text-slate-600">Improve your score by adding skills, languages, and a valid resume.</p>
              <div className="mt-5 rounded-3xl bg-slate-100 p-4">
                <div className="mb-3 flex items-center justify-between text-sm text-slate-600"><span>Profile strength</span><span>74%</span></div>
                <div className="h-3 overflow-hidden rounded-full bg-white">
                  <div className="h-full w-3/4 rounded-full bg-nearhire-600"></div>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">Activity status</h2>
              <p className="mt-2 text-sm text-slate-600">Live action updates from your application and voice workflows.</p>
              <div className="mt-4 rounded-3xl bg-nearhire-50 p-4 text-sm text-slate-800">{status}</div>
            </div>
          </aside>
        </section>
      </div>
    </div>
  );
}
