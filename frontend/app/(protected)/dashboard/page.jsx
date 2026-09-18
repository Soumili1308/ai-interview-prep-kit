import Link from "next/link";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div className="max-w-3xl">
        <p className="text-sm font-medium text-slate-400">
          AI Interview Prep Kit
        </p>
        <h1 className="mt-2 text-4xl font-bold tracking-tight text-slate-950">
          Prepare with a requirement-grounded interview workspace.
        </h1>
        <p className="mt-4 text-slate-500">
          Turn a job description and company website into research-backed questions, flashcards and a deterministic preparation schedule.
        </p>
      </div>

      <Link
        href="/create"
        className="primary-button"
      >
        Create interview kit
      </Link>
    </div>
  );
}