"use client";

import { useState } from "react";
import { RefreshCw } from "lucide-react";

import api from "../../lib/api";

export default function RegenerationPanel({
  kitId,
  onUpdated,
}) {
  const [loading, setLoading] = useState("");

  async function regenerateCategory(category) {
    setLoading(category);

    try {
      const response = await api.post(
        `/kits/${kitId}/regenerate/questions/${category}`,
        {}
      );

      onUpdated(response);
    } catch (error) {
      window.alert(
        error.message ||
          "Regeneration failed."
      );
    } finally {
      setLoading("");
    }
  }

  async function regenerateBrief() {
    setLoading("brief");

    try {
      const response = await api.post(
        `/kits/${kitId}/regenerate/company-brief`,
        {}
      );

      onUpdated(response);
    } catch (error) {
      window.alert(
        error.message ||
          "Brief regeneration failed."
      );
    } finally {
      setLoading("");
    }
  }

  return (
    <section className="card p-5">
      <h2 className="font-semibold">
        Regenerate sections
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Regenerate one section without replacing
        unrelated edits.
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          onClick={regenerateBrief}
          disabled={Boolean(loading)}
          className="secondary-button"
        >
          <RefreshCw
            size={15}
            className={
              loading === "brief"
                ? "animate-spin"
                : ""
            }
          />
          Company brief
        </button>

        {[
          "technical",
          "behavioural",
          "system-design",
          "company-fit",
        ].map((category) => (
          <button
            key={category}
            onClick={() =>
              regenerateCategory(category)
            }
            disabled={Boolean(loading)}
            className="secondary-button"
          >
            <RefreshCw
              size={15}
              className={
                loading === category
                  ? "animate-spin"
                  : ""
              }
            />

            {category}
          </button>
        ))}
      </div>
    </section>
  );
}