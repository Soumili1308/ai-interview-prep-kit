"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import api from "../../../lib/api";

export default function KitsPage() {
  const [kits, setKits] =
    useState([]);
  const [loading, setLoading] =
    useState(true);
  const [error, setError] =
    useState("");

  useEffect(() => {
    let active = true;

    api.get("/kits")
      .then((response) => {
        if (active) {
          setKits(
            response.data || []
          );
        }
      })
      .catch((err) => {
        if (active) {
          setError(
            err.message ||
              "Unable to load kits."
          );
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-medium text-slate-400">
            Workspace
          </p>
          <h1 className="mt-1 text-3xl font-bold text-slate-950">
            Your interview kits
          </h1>
        </div>

        <Link
          href="/create"
          className="primary-button"
        >
          New kit
        </Link>
      </div>

      {loading && (
        <p className="text-slate-500">
          Loading your kits...
        </p>
      )}

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading &&
        !error &&
        kits.length === 0 && (
          <div className="card p-8 text-center">
            <h2 className="font-semibold text-slate-900">
              No interview kits yet
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Create your first kit from a job description and company website.
            </p>
            <Link
              href="/create"
              className="primary-button mt-5"
            >
              Create a kit
            </Link>
          </div>
        )}

      <div className="grid gap-5 md:grid-cols-2">
        {kits.map((kit) => (
          <Link
            key={kit.id}
            href={`/kits/${kit.id}`}
            className="card block p-6 transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <p className="text-sm font-medium text-slate-400">
              {kit.company ||
                "Company not specified"}
            </p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950">
              {kit.role ||
                "Interview preparation"}
            </h2>
            <p className="mt-3 text-sm text-slate-500">
              Status: {kit.status}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}