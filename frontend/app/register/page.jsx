"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

import { useAuth } from "../../context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();

  const router = useRouter();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function updateField(event) {
    setForm((current) => ({
      ...current,
      [event.target.name]: event.target.value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      await register(
        form.name,
        form.email,
        form.password
      );

      router.replace("/dashboard");
    } catch (err) {
      setError(
        err.message || "Unable to create account."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-slate-950">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Start building personalized interview kits.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="card p-6 sm:p-8"
        >
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <div>
            <label className="label">
              Name
            </label>

            <input
              name="name"
              value={form.name}
              onChange={updateField}
              className="input"
              placeholder="Your name"
              required
            />
          </div>

          <div className="mt-5">
            <label className="label">
              Email
            </label>

            <input
              name="email"
              type="email"
              value={form.email}
              onChange={updateField}
              className="input"
              placeholder="you@example.com"
              required
            />
          </div>

          <div className="mt-5">
            <label className="label">
              Password
            </label>

            <input
              name="password"
              type="password"
              value={form.password}
              onChange={updateField}
              className="input"
              placeholder="At least 8 characters"
              minLength={8}
              required
            />
          </div>

          <button
            disabled={loading}
            className="primary-button mt-6 w-full"
          >
            {loading
              ? "Creating account..."
              : "Create account"}
          </button>

          <p className="mt-6 text-center text-sm text-slate-500">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-slate-900 underline"
            >
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </main>
  );
}