"use client";

import { useEffect, useState } from "react";
import {
  Pin,
  Save,
  Trash2,
} from "lucide-react";

export default function FlashcardEditor({
  flashcard,
  editorMeta,
  onSave,
  onDelete,
  onPin,
}) {
  const [form, setForm] = useState(flashcard);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(flashcard);
  }, [flashcard]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save() {
    setSaving(true);

    try {
      await onSave(flashcard.id, {
        front: form.front,
        back: form.back,
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-400">
            {flashcard.id}
          </span>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {editorMeta?.status || "generated"}
          </span>
        </div>

        <button
          onClick={() =>
            onPin(
              flashcard.id,
              !editorMeta?.pinned
            )
          }
          className="rounded-lg p-2 hover:bg-slate-100"
        >
          <Pin
            size={16}
            className={
              editorMeta?.pinned
                ? "fill-current"
                : ""
            }
          />
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <label className="label">
            Front
          </label>

          <textarea
            value={form.front}
            onChange={(event) =>
              update(
                "front",
                event.target.value
              )
            }
            className="input min-h-[90px]"
          />
        </div>

        <div>
          <label className="label">
            Back
          </label>

          <textarea
            value={form.back}
            onChange={(event) =>
              update(
                "back",
                event.target.value
              )
            }
            className="input min-h-[120px]"
          />
        </div>

        <div className="flex justify-between gap-3">
          <button
            onClick={() =>
              onDelete(flashcard.id)
            }
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-red-600 hover:bg-red-50"
          >
            <Trash2 size={16} />
            Delete
          </button>

          <button
            onClick={save}
            disabled={saving}
            className="primary-button"
          >
            <Save size={16} />
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </article>
  );
}