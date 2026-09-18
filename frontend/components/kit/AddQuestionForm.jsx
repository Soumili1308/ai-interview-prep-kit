"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

export default function AddQuestionForm({
  onAdd,
  requirements = [],
}) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    prompt: "",
    answer_outline: "",
    category: "technical",
    difficulty: 1,
    requirement_ids:
      requirements[0]
        ? [requirements[0].id]
        : [],
  });

  function update(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function submit(event) {
    event.preventDefault();

    if (!form.prompt.trim()) {
      return;
    }

    await onAdd(form);

    setForm({
      prompt: "",
      answer_outline: "",
      category: "technical",
      difficulty: 1,
      requirement_ids:
        requirements[0]
          ? [requirements[0].id]
          : [],
    });

    setOpen(false);
  }

  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="secondary-button"
      >
        <Plus size={16} />
        Add question
      </button>
    );
  }

  return (
    <form
      onSubmit={submit}
      className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-5"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">
          New question
        </h3>

        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg p-2 hover:bg-white"
        >
          <X size={16} />
        </button>
      </div>

      <div className="mt-5 space-y-4">
        <textarea
          className="input min-h-[100px]"
          placeholder="Question..."
          value={form.prompt}
          onChange={(event) =>
            update(
              "prompt",
              event.target.value
            )
          }
        />

        <textarea
          className="input min-h-[100px]"
          placeholder="Answer outline..."
          value={form.answer_outline}
          onChange={(event) =>
            update(
              "answer_outline",
              event.target.value
            )
          }
        />

        <div>
          <label className="label">
            Requirement
          </label>

          <select
            className="input"
            value={form.requirement_ids[0] || ""}
            onChange={(event) =>
              update(
                "requirement_ids",
                event.target.value
                  ? [event.target.value]
                  : []
              )
            }
            required
          >
            <option value="">
              Select a requirement
            </option>
            {requirements.map((requirement) => (
              <option
                key={requirement.id}
                value={requirement.id}
              >
                {requirement.id} — {requirement.text}
              </option>
            ))}
          </select>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <select
            className="input"
            value={form.category}
            onChange={(event) =>
              update(
                "category",
                event.target.value
              )
            }
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

          <select
            className="input"
            value={form.difficulty}
            onChange={(event) =>
              update(
                "difficulty",
                Number(event.target.value)
              )
            }
          >
            <option value={1}>Difficulty 1</option>
            <option value={2}>Difficulty 2</option>
            <option value={3}>Difficulty 3</option>
          </select>
        </div>

        <button className="primary-button">
          Add question
        </button>
      </div>
    </form>
  );
}