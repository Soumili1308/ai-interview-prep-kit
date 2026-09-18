"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import api from "../../../../../lib/api";

export default function PracticePage() {
  const { id } = useParams();
  const [cards, setCards] =
    useState([]);
  const [index, setIndex] =
    useState(0);
  const [revealed, setRevealed] =
    useState(false);
  const [confidence, setConfidence] =
    useState(null);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  async function load() {
    try {
      setLoading(true);
      setError("");
      const response =
        await api.get(
          `/kits/${id}/practice`
        );
      setCards(
        response.data?.flashcards ||
          response.flashcards ||
          []
      );
      setIndex(0);
    } catch (err) {
      setError(
        err.message ||
          "Unable to load practice mode."
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

  const card = cards[index];

  async function submitConfidence(value) {
    if (!card) {
      return;
    }

    try {
      setConfidence(value);
      const response =
        await api.post(
          `/kits/${id}/practice/${card.id}/confidence`,
          { confidence: value }
        );
      const nextCards =
        response.data?.flashcards ||
        response.flashcards ||
        [];
      setCards(nextCards);
      setIndex(0);
      setRevealed(false);
    } catch (err) {
      setError(
        err.message ||
          "Unable to record confidence."
      );
    }
  }

  if (loading) {
    return (
      <div className="text-slate-500">
        Loading practice mode...
      </div>
    );
  }

  if (error && !card) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (!card) {
    return (
      <div className="space-y-5">
        <Link
          href={`/kits/${id}`}
          className="text-sm text-slate-500"
        >
          ← Back to kit
        </Link>
        <div className="card p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-950">
            No flashcards yet
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Add a flashcard from the kit editor to start practice.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href={`/kits/${id}`}
        className="text-sm text-slate-500 hover:text-slate-900"
      >
        ← Back to kit
      </Link>

      <div>
        <p className="text-sm font-medium text-slate-400">
          Practice mode
        </p>
        <h1 className="mt-1 text-3xl font-bold text-slate-950">
          One flashcard at a time
        </h1>
        <p className="mt-2 text-sm text-slate-500">
          The next session is ordered from least confident to most confident.
        </p>
      </div>

      <article className="card p-6 sm:p-8">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>
            Card {index + 1} of {cards.length}
          </span>
          <span>
            {card.covered
              ? "Covered"
              : "Uncovered"}
          </span>
        </div>

        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Front
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-slate-950">
            {card.front}
          </h2>
        </div>

        {revealed && (
          <div className="mt-8 rounded-2xl bg-slate-50 p-5">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Answer
            </p>
            <p className="mt-2 whitespace-pre-wrap text-slate-700">
              {card.back}
            </p>
          </div>
        )}

        {!revealed ? (
          <button
            onClick={() =>
              setRevealed(true)
            }
            className="primary-button mt-8"
          >
            Reveal answer
          </button>
        ) : (
          <div className="mt-8">
            <p className="text-sm font-medium text-slate-700">
              How confident are you?
            </p>
            <div className="mt-3 grid grid-cols-5 gap-2">
              {[1, 2, 3, 4, 5].map(
                (value) => (
                  <button
                    key={value}
                    onClick={() =>
                      submitConfidence(
                        value
                      )
                    }
                    className={`rounded-xl border px-3 py-3 text-sm font-semibold ${
                      confidence === value
                        ? "border-slate-950 bg-slate-950 text-white"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {value}
                  </button>
                )
              )}
            </div>
          </div>
        )}
      </article>
    </div>
  );
}