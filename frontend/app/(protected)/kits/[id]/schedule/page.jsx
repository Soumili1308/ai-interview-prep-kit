"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";

import api from "../../../../../lib/api";

export default function SchedulePage() {
  const { id } = useParams();
  const [kit, setKit] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [busy, setBusy] =
    useState(false);
  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const response =
        await api.get(
          `/kits/${id}`
        );
      setKit(response.data?.kit || null);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load schedule."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (id) {
      load();
    }
  }, [id]);

  async function regenerate() {
    try {
      setBusy(true);
      setError("");
      const response =
        await api.post(
          `/kits/${id}/regenerate/schedule`,
          {}
        );
      setKit((current) => ({
        ...current,
        schedule:
          response.data?.schedule ||
          response.schedule,
      }));
    } catch (err) {
      setError(
        err.message ||
          "Unable to regenerate schedule."
      );
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="text-slate-500">
        Loading schedule...
      </div>
    );
  }

  if (error && !kit) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  const schedule =
    kit?.schedule;

  return (
    <div className="space-y-8">
      <Link
        href={`/kits/${id}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to kit
      </Link>

      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Preparation plan
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Study schedule
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            {schedule?.days_available || 0} days
          </p>
        </div>

        <button
          disabled={busy}
          onClick={regenerate}
          className="secondary-button"
        >
          {busy
            ? "Regenerating..."
            : "Regenerate schedule"}
        </button>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-5">
        {(schedule?.days || []).map(
          (day) => (
            <section
              key={day.day}
              className="card p-6"
            >
              <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Day {day.day}
                  </p>
                  <h2 className="mt-1 text-xl font-semibold text-slate-950">
                    {day.focus}
                  </h2>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
                  {day.minutes} min
                </span>
              </div>

              <div className="mt-5 space-y-2">
                {day.question_ids.map(
                  (questionId) => {
                    const question =
                      kit.questions.find(
                        (item) =>
                          item.id ===
                          questionId
                      );

                    if (!question) {
                      return null;
                    }

                    return (
                      <div
                        key={questionId}
                        className="rounded-xl border border-slate-200 p-4"
                      >
                        <span className="mr-2 text-xs font-semibold text-slate-400">
                          {question.id}
                        </span>
                        <span className="text-sm text-slate-800">
                          {question.prompt}
                        </span>
                      </div>
                    );
                  }
                )}
              </div>
            </section>
          )
        )}
      </div>
    </div>
  );
}