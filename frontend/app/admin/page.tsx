const widgets = [
  { label: 'Active employers', value: 78 },
  { label: 'Candidates onboarded', value: '12.4k' },
  { label: 'Monthly AI credits', value: '320k' },
  { label: 'WhatsApp events', value: '18.9k' },
];

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="card p-6">
          <span className="inline-flex rounded-full bg-nearhire-100 px-3 py-1 text-sm font-semibold text-nearhire-700">Admin</span>
          <h1 className="mt-4 text-3xl font-semibold text-slate-900">Platform analytics and access control.</h1>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Monitor usage, manage subscriptions, moderate fraud, and configure WhatsApp workflows across regions.</p>
        </div>

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {widgets.map((widget) => (
            <div key={widget.label} className="card p-5">
              <p className="text-sm uppercase tracking-[0.2em] text-slate-500">{widget.label}</p>
              <p className="mt-4 text-3xl font-semibold text-slate-900">{widget.value}</p>
            </div>
          ))}
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.7fr_1fr]">
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900">Operational controls</h2>
            <div className="mt-6 grid gap-4">
              {['Billing & subscriptions', 'WhatsApp API management', 'Regional language settings', 'Fraud monitoring'].map((item) => (
                <div key={item} className="rounded-3xl border border-gray-200 bg-white p-4 text-sm text-slate-700">{item}</div>
              ))}
            </div>
          </div>
          <div className="card p-6">
            <h2 className="text-xl font-semibold text-slate-900">AI usage monitoring</h2>
            <p className="mt-2 text-sm text-slate-600">Track voice transcription, match scoring, chat assistant requests, and translation events in real time.</p>
            <div className="mt-6 space-y-4">
              {['Voice requests', 'Match scoring', 'Resume parsing', 'Translation jobs'].map((item) => (
                <div key={item} className="rounded-3xl bg-nearhire-50 px-4 py-3 text-sm text-slate-800">{item}</div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
