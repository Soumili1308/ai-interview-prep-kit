"use client";

import { useEffect, useState } from "react";
import {
  GripVertical,
  Pin,
  Save,
  Trash2,
} from "lucide-react";

export default function QuestionEditor({
  question,
  editorMeta,
  onSave,
  onDelete,
  onPin,
}) {
  const [form, setForm] = useState(question);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(question);
  }, [question]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save() {
    setSaving(true);

    try {
      await onSave(question.id, {
        prompt: form.prompt,
        answer_outline: form.answer_outline,
        difficulty: Number(form.difficulty),
        category: form.category,
      });
    } finally {
      setSaving(false);
    }
  }

  const status =
    editorMeta?.status || "generated";

  return (
    <article className="rounded-2xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex items-center gap-2">
          <GripVertical
            size={18}
            className="cursor-grab text-slate-300"
          />

          <span className="text-xs font-semibold text-slate-400">
            {question.id}
          </span>

          <span className="rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-600">
            {status}
          </span>

          {editorMeta?.pinned && (
            <Pin
              size={14}
              className="fill-current text-slate-600"
            />
          )}
        </div>

        <button
          onClick={() =>
            onPin(
              question.id,
              !editorMeta?.pinned
            )
          }
          className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-900"
          title={
            editorMeta?.pinned
              ? "Unpin"
              : "Pin"
          }
        >
          <Pin size={16} />
        </button>
      </div>

      <div className="space-y-5 p-5">
        <div>
          <label className="label">
            Question
          </label>

          <textarea
            value={form.prompt}
            onChange={(event) =>
              update(
                "prompt",
                event.target.value
              )
            }
            className="input min-h-[110px] resize-y"
          />
        </div>

        <div>
          <label className="label">
            Answer outline
          </label>

          <textarea
            value={form.answer_outline}
            onChange={(event) =>
              update(
                "answer_outline",
                event.target.value
              )
            }
            className="input min-h-[130px] resize-y"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Category
            </label>

            <select
              value={form.category}
              onChange={(event) =>
                update(
                  "category",
                  event.target.value
                )
              }
              className="input"
            >
              <option value="technical">
                Technical
              </option>
              <option value="behavioural">
                Behavioural
              </option>
              <option value="system-design">
                System Design
              </option>
              <option value="company-fit">
                Company Fit
              </option>
            </select>
          </div>

          <div>
            <label className="label">
              Difficulty
            </label>

            <select
              value={form.difficulty}
              onChange={(event) =>
                update(
                  "difficulty",
                  Number(event.target.value)
                )
              }
              className="input"
            >
              <option value={1}>1 — Easy</option>
              <option value={2}>2 — Medium</option>
              <option value={3}>3 — Hard</option>
            </select>
          </div>
        </div>

        <div className="flex flex-wrap justify-between gap-3">
          <button
            onClick={() =>
              onDelete(question.id)
            }
            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50"
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
            {saving ? "Saving..." : "Save changes"}
          </button>
        </div>
      </div>
    </article>
  );
}