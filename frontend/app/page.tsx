import Link from 'next/link';

const portalCards = [
  { title: 'Candidate App', href: '/candidate', description: 'Nearby jobs, voice apply, WhatsApp quick apply, and AI profile matching.' },
  { title: 'Employer Portal', href: '/employer', description: 'Post jobs, manage pipelines, interview reminders, and analytics.' },
  { title: 'Admin Dashboard', href: '/admin', description: 'Platform analytics, billing, fraud monitoring, and CMS controls.' },
];

export default function Home() {
  return (
    <main className="min-h-screen px-4 py-10 sm:px-6 lg:px-10">
      <section className="mx-auto max-w-6xl">
        <div className="rounded-[32px] border border-gray-200 bg-white/80 px-6 py-10 shadow-xl backdrop-blur-xl sm:px-10">
          <div className="mb-10 max-w-3xl">
            <span className="inline-flex rounded-full bg-nearhire-100 px-4 py-2 text-sm font-semibold text-nearhire-700">NearHire</span>
            <h1 className="mt-6 text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">AI hiring for local talent with voice, WhatsApp, and multilingual intelligence.</h1>
            <p className="mt-4 text-base leading-8 text-slate-600 sm:text-lg">A modern responsive platform built for candidates, employers, and admins to discover jobs, screen talent, and manage hiring workflows across Indian regional languages.</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3">
            {portalCards.map((portal) => (
              <div key={portal.title} className="card p-6 transition-transform duration-300 hover:-translate-y-1">
                <h2 className="text-xl font-semibold text-slate-900">{portal.title}</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">{portal.description}</p>
                <Link href={portal.href} className="mt-6 inline-flex items-center rounded-full bg-nearhire-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-nearhire-700">
                  Open portal
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
