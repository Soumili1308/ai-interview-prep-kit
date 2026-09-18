import Link from "next/link";
import {
  BrainCircuit,
  FileSearch,
  ListChecks,
  CalendarDays,
} from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="border-b border-slate-200 bg-white">
        <div className="page-container py-20 sm:py-28">
          <div className="max-w-3xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-sm text-slate-600">
              <BrainCircuit size={16} />
              AI-powered interview preparation
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-950 sm:text-6xl">
              Turn any job description into a focused interview prep kit.
            </h1>

            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
              Research the company, extract role requirements,
              generate targeted questions and flashcards,
              and build a practical preparation schedule.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="primary-button"
              >
                Create your kit
              </Link>

              <Link
                href="/login"
                className="secondary-button"
              >
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="page-container py-16">
        <div className="grid gap-5 md:grid-cols-3">
          <FeatureCard
            icon={<FileSearch size={20} />}
            title="Research-driven"
            text="Use the company website and public interview information to ground the preparation kit."
          />

          <FeatureCard
            icon={<ListChecks size={20} />}
            title="Requirement coverage"
            text="Questions are connected to explicit job requirements so important skills don't get missed."
          />

          <FeatureCard
            icon={<CalendarDays size={20} />}
            title="Actionable schedule"
            text="Turn the generated questions into a deterministic day-by-day preparation plan."
          />
        </div>
      </section>
    </main>
  );
}

function FeatureCard({ icon, title, text }) {
  return (
    <div className="card p-6">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-700">
        {icon}
      </div>

      <h2 className="font-semibold text-slate-900">
        {title}
      </h2>

      <p className="mt-2 text-sm leading-6 text-slate-500">
        {text}
      </p>
    </div>
  );
}