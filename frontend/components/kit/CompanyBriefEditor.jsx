"use client";

import { useEffect, useState } from "react";
import { Save } from "lucide-react";

export default function CompanyBriefEditor({
  brief,
  editorMeta,
  onSave,
}) {
  const [form, setForm] = useState(brief);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm(brief);
  }, [brief]);

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function save() {
    setSaving(true);

    try {
      await onSave({
        summary: form.summary,
        what_they_do: form.what_they_do,
        sources: form.sources || [],
      });
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="card p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold">
            Company brief
          </h2>

          <span className="mt-1 inline-block rounded-full bg-slate-100 px-2 py-1 text-xs text-slate-500">
            {editorMeta?.status || "generated"}
          </span>
        </div>
      </div>

      <div className="space-y-5">
        <div>
          <label className="label">
            Summary
          </label>

          <textarea
            value={form.summary || ""}
            onChange={(event) =>
              update(
                "summary",
                event.target.value
              )
            }
            className="input min-h-[130px]"
          />
        </div>

        <div>
          <label className="label">
            What they do
          </label>

          <textarea
            value={form.what_they_do || ""}
            onChange={(event) =>
              update(
                "what_they_do",
                event.target.value
              )
            }
            className="input min-h-[130px]"
          />
        </div>

        <button
          onClick={save}
          disabled={saving}
          className="primary-button"
        >
          <Save size={16} />
          {saving ? "Saving..." : "Save brief"}
        </button>
      </div>
    </section>
  );
}