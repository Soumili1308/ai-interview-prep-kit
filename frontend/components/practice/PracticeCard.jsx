"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

import ConfidenceSelector from "./ConfidenceSelector";

export default function PracticeCard({
  card,
  onConfidence,
}) {
  const [revealed, setRevealed] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  async function chooseConfidence(
    confidence
  ) {
    setSaving(true);

    try {
      await onConfidence(
        card.id,
        confidence
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="card overflow-hidden">
      <div className="border-b border-slate-100 px-6 py-4">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            {card.id}
          </span>

          {card.covered && (
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-600">
              Previously reviewed
            </span>
          )}
        </div>
      </div>

      <div className="p-6 sm:p-8">
        <p className="text-xl font-semibold leading-8 text-slate-950">
          {card.front}
        </p>

        <div className="mt-8">
          {!revealed ? (
            <button
              onClick={() =>
                setRevealed(true)
              }
              className="secondary-button"
            >
              <Eye size={17} />
              Reveal answer
            </button>
          ) : (
            <div className="rounded-2xl bg-slate-50 p-5">
              <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-500">
                <EyeOff size={16} />
                Answer
              </div>

              <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {card.back}
              </p>
            </div>
          )}
        </div>

        {revealed && (
          <div className="mt-8 border-t border-slate-100 pt-6">
            <ConfidenceSelector
              value={card.confidence}
              disabled={saving}
              onSelect={
                chooseConfidence
              }
            />
          </div>
        )}
      </div>
    </div>
  );
}