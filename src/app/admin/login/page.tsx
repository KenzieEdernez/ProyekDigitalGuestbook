"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useState } from "react";
import { LockKeyhole } from "lucide-react";
import { useEventSettings } from "@/hooks/useEventSettings";

function AdminLoginForm() {
  const eventSettings = useEventSettings();
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams?.get("next") || "/admin";
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Login failed.");
        return;
      }

      router.replace(next);
      router.refresh();
    } catch {
      setError("Failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-cream px-6 py-10">
      <form onSubmit={handleSubmit} className="card-premium w-full max-w-md p-8">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-royal/15">
            <LockKeyhole className="h-7 w-7 text-royal" />
          </div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-royal">
            Staff Area
          </p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-navy">
            Staff Login
          </h1>
          <p className="mt-2 text-sm text-stone-500">{eventSettings.name}</p>
        </div>

        {error && (
          <div className="mt-6 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="mt-6 space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Username
            </label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              autoComplete="username"
              autoFocus
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-stone-500">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="input-field"
              autoComplete="current-password"
            />
          </div>
        </div>

        <button disabled={loading} className="btn-navy mt-6 w-full py-4">
          {loading ? "Processing..." : "Login"}
        </button>
      </form>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginForm />
    </Suspense>
  );
}
