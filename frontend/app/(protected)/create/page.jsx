"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import api from "../../../lib/api";

export default function CreateKitPage() {
  const router = useRouter();

  const [form, setForm] =
    useState({
      jd: "",
      companyUrl: "",
      days: 5,
      location: "",
    });
  const [loading, setLoading] =
    useState(false);
  const [error, setError] =
    useState("");

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]:
        event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response =
        await api.post(
          "/kits/generate",
          {
            jd: form.jd,
            companyUrl:
              form.companyUrl,
            days: Number(form.days),
            location: form.location,
          }
        );

      const kitId =
        response.data?.id ||
        response.data?.kit?._id ||
        response.id;

      if (!kitId) {
        throw new Error(
          "The server did not return a kit ID."
        );
      }

      router.push(
        `/kits/${kitId}`
      );
    } catch (err) {
      setError(
        err.message ||
          "Unable to generate the interview kit."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-3xl">
      <div>
        <h1 className="text-3xl font-bold text-slate-950">
          Create an interview kit
        </h1>

        <p className="mt-2 text-slate-500">
          Paste the job description and company website.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="card mt-8 p-6 sm:p-8"
      >
        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <div>
          <label className="label">
            Job description
          </label>

          <textarea
            name="jd"
            value={form.jd}
            onChange={updateField}
            className="input min-h-[280px] resize-y"
            placeholder="Paste the complete job description here..."
            required
          />
        </div>

        <div className="mt-6">
          <label className="label">
            Company website
          </label>

          <input
            name="companyUrl"
            type="url"
            value={form.companyUrl}
            onChange={updateField}
            className="input"
            placeholder="https://company.com"
            required
          />
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Location
            </label>

            <input
              name="location"
              value={form.location}
              onChange={updateField}
              className="input"
              placeholder="Optional"
            />
          </div>

          <div>
            <label className="label">
              Preparation days
            </label>

            <input
              name="days"
              type="number"
              min="1"
              max="60"
              value={form.days}
              onChange={updateField}
              className="input"
              required
            />
          </div>
        </div>

        <div className="mt-8 flex justify-end">
          <button
            disabled={loading}
            className="primary-button"
          >
            {loading
              ? "Researching & generating..."
              : "Generate interview kit"}
          </button>
        </div>
      </form>
    </div>
  );
}