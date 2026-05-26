'use client';

import Link from 'next/link';
import { useState, type ChangeEvent } from 'react';

const panels = [
  { label: 'Open roles', value: 24 },
  { label: 'Candidates', value: 136 },
  { label: 'Interviews', value: 12 },
  { label: 'Hires', value: 8 },
];

const candidates = [
  { id: 'cand-001', name: 'Avirul Srivastava', role: 'Frontend Developer', stage: 'Interview', score: 91, languages: ['Hindi', 'English'], experience: '2 yrs', phone: '919876543210' },
  { id: 'cand-002', name: 'Aastha Sinha', role: 'Data Analyst', stage: 'Shortlisted', score: 84, languages: ['Hindi', 'Marathi'], experience: '1 yr', phone: '919812345678' },
  { id: 'cand-003', name: 'Adwaya Srivastava', role: 'Business Development Representative', stage: 'New', score: 77, languages: ['Tamil', 'English'], experience: '3 yrs', phone: '919701234567' },
];

export default function EmployerPage() {
  const [actionMessage, setActionMessage] = useState('Ready to schedule interviews and send WhatsApp reminders.');
  const [scheduleForm, setScheduleForm] = useState({
    candidateId: 'cand-001',
    candidateName: 'Avirul Srivastava',
    jobId: 'job-001',
    date: '',
    time: '',
  });

  const handleScheduleInterview = async () => {
    if (!scheduleForm.date || !scheduleForm.time) {
      setActionMessage('❌ Please select a date and time before scheduling.');
      return;
    }

    const scheduleAt = `${scheduleForm.date} ${scheduleForm.time}`;
    
    try {
      const response = await fetch('/api/employer/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateId: scheduleForm.candidateId,
          candidateName: scheduleForm.candidateName,
          jobId: scheduleForm.jobId,
          scheduleAt,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setActionMessage(`❌ ${data.error || 'Failed to schedule interview'}`);
        return;
      }

      if (data.status === 'scheduled') {
        setActionMessage(`✓ Interview scheduled for ${scheduleForm.candidateName} on ${scheduleAt}`);

        // Generate WhatsApp reminder link
        const selected = candidates.find((item) => item.id === scheduleForm.candidateId);
        if (selected) {
          const waMessage = encodeURIComponent(
            `Hi ${selected.name}, your interview is scheduled for ${scheduleAt}. Please confirm your availability. Thank you!`
          );
          const waLink = `https://wa.me/${selected.phone}?text=${waMessage}`;
          setReminderLink(waLink);
        }
      } else {
        setActionMessage(`⚠️ ${data.message || 'Unexpected response'}`);
      }
    } catch (error) {
      setActionMessage(`❌ Error: ${(error as Error).message}`);
    }
  };

  const [reminderLink, setReminderLink] = useState<string | null>(null);

  const handleWhatsAppReminder = async (candidate: typeof candidates[number]) => {
    const interviewTime = 'Tomorrow 10:00 AM';
    setActionMessage(`Preparing WhatsApp reminder for ${candidate.name}...`);

    const response = await fetch('/api/whatsapp/remind', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ candidateName: candidate.name, interviewTime }),
    });
    const data = await response.json();

    const encodedMessage = encodeURIComponent(`Hi ${candidate.name}, your interview is scheduled for ${interviewTime}. Please confirm your availability.`);
    const waLink = `https://wa.me/${candidate.phone}?text=${encodedMessage}`;
    setReminderLink(waLink);
    setActionMessage(data.message ?? `WhatsApp reminder ready for ${candidate.name}.`);
  };

  const handleBulkWhatsApp = async () => {
    setActionMessage('Queuing bulk WhatsApp campaign...');
    const response = await fetch('/api/whatsapp/broadcast', { method: 'POST' });
    const data = await response.json();
    setActionMessage(data.message ?? 'Bulk WhatsApp campaign queued.');
  };

  const handleCandidateChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = candidates.find((item) => item.id === event.target.value);
    if (!selected) return;
    setScheduleForm({
      ...scheduleForm,
      candidateId: selected.id,
      candidateName: selected.name,
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="space-y-6">
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">Employer Portal</h2>
              <p className="mt-2 text-sm text-slate-600">Manage jobs, candidate pipelines, and AI-powered hiring in your regional workflow.</p>
            </div>
            <nav className="card space-y-2 p-4">
              {['Dashboard', 'Post a Job', 'Candidates', 'Interviews', 'Analytics'].map((item) => (
                <Link key={item} href="#" className="block rounded-3xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-nearhire-50">{item}</Link>
              ))}
            </nav>
          </aside>

          <main className="space-y-6">
            <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {panels.map((panel) => (
                <div key={panel.label} className="card p-5">
                  <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{panel.label}</p>
                  <p className="mt-4 text-3xl font-semibold text-slate-900">{panel.value}</p>
                </div>
              ))}
            </section>

            <section className="card p-6">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Candidate pipeline</h2>
                  <p className="mt-2 text-sm text-slate-600">Track applicants through new, shortlisted, interviews, hired, and rejected stages.</p>
                </div>
                <button onClick={handleBulkWhatsApp} className="rounded-full bg-nearhire-600 px-5 py-3 text-sm font-semibold text-white hover:bg-nearhire-700">Bulk WhatsApp campaign</button>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {['New', 'Shortlisted', 'Interview', 'Hired', 'Rejected'].map((stage) => (
                  <div key={stage} className="rounded-3xl bg-slate-50 p-4 text-sm font-semibold text-slate-700">{stage}</div>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-900">Top candidate recommendations</h2>
                  <p className="mt-2 text-sm text-slate-600">AI match score, skills, languages, and hiring assistant suggestions.</p>
                </div>
              </div>
              <div className="mt-6 space-y-4">
                {candidates.map((candidate) => (
                  <div key={candidate.id} className="rounded-3xl border border-gray-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-lg font-semibold text-slate-900">{candidate.name}</p>
                        <p className="text-sm text-slate-600">{candidate.role} • {candidate.experience}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="rounded-full bg-nearhire-100 px-3 py-1 text-sm font-semibold text-nearhire-700">Match {candidate.score}%</span>
                        <button onClick={() => handleWhatsAppReminder(candidate)} className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-nearhire-700 ring-1 ring-nearhire-100 hover:bg-nearhire-50">WhatsApp reminder</button>
                      </div>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2 text-sm text-slate-600">
                      {candidate.languages.map((lang) => (
                        <span key={lang} className="rounded-full bg-white px-3 py-1 ring-1 ring-slate-200">{lang}</span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">Schedule interview</h2>
              <p className="mt-2 text-sm text-slate-600">Schedule an interview with a candidate and send them WhatsApp reminders.</p>
              <div className="mt-5 grid gap-4">
                <label className="block text-sm font-medium text-slate-700">
                  Candidate
                  <select value={scheduleForm.candidateId} onChange={handleCandidateChange} className="mt-2 block w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm">
                    {candidates.map((candidate) => (
                      <option key={candidate.id} value={candidate.id}>{candidate.name}</option>
                    ))}
                  </select>
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700">
                    Date
                    <input type="date" value={scheduleForm.date} onChange={(event) => setScheduleForm({ ...scheduleForm, date: event.target.value })} className="mt-2 block w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" />
                  </label>
                  <label className="block text-sm font-medium text-slate-700">
                    Time
                    <input type="time" value={scheduleForm.time} onChange={(event) => setScheduleForm({ ...scheduleForm, time: event.target.value })} className="mt-2 block w-full rounded-3xl border border-gray-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm" />
                  </label>
                </div>
                <button onClick={handleScheduleInterview} className="rounded-full bg-nearhire-600 px-5 py-3 text-sm font-semibold text-white hover:bg-nearhire-700">Schedule interview</button>
                {reminderLink ? (
                  <a href={reminderLink} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-full border border-nearhire-600 bg-white px-4 py-3 text-sm font-semibold text-nearhire-700 hover:bg-nearhire-50">Open WhatsApp reminder</a>
                ) : null}
              </div>
            </section>

            <div className="card p-6">
              <h2 className="text-xl font-semibold text-slate-900">Action log</h2>
              <p className="mt-2 text-sm text-slate-600">Live status from candidate scheduling and WhatsApp workflows.</p>
              <div className="mt-4 rounded-3xl bg-nearhire-50 p-4 text-sm text-slate-800">{actionMessage}</div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
