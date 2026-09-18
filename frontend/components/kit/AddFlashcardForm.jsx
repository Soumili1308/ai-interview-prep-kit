"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

export default function AddFlashcardForm({
  onAdd,
}) {
  const [open, setOpen] = useState(false);

  const [front, setFront] = useState("");
  const [back, setBack] = useState("");

  async function submit(event) {
    event.preventDefault();

    if (!front.trim()) {
      return;
    }

    await onAdd({
      front,
      back,
      requirement_ids: [],
    });

    setFront("");
    setBack("");
    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="secondary-button"
      >
        <Plus size={16} />
        Add flashcard
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"
    >
      <div className="space-y-4">
        <input
          className="input"
          placeholder="Front"
          value={front}
          onChange={(event) =>
            setFront(event.target.value)
          }
        />

        <textarea
          className="input min-h-[100px]"
          placeholder="Back"
          value={back}
          onChange={(event) =>
            setBack(event.target.value)
          }
        />

        <div className="flex gap-2">
          <button className="primary-button">
            Add flashcard
          </button>

          <button
            type="button"
            onClick={() => setOpen(false)}
            className="secondary-button"
          >
            Cancel
          </button>
        </div>
      </div>
    </form>
  );
}