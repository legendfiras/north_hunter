"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(false);
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        username: form.get("username"),
        password: form.get("password"),
      }),
    });
    setBusy(false);
    if (!response.ok) {
      setError(true);
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto mt-10 max-w-md bg-paper p-6 sm:p-8">
      <h1 className="text-3xl font-semibold text-charcoal">Sign in</h1>
      <label className="mt-6 block text-sm text-charcoal">
        Username
        <input name="username" autoComplete="username" required className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" dir="ltr" />
      </label>
      <label className="mt-4 block text-sm text-charcoal">
        Password
        <input name="password" type="password" autoComplete="current-password" required className="mt-1 min-h-11 w-full border border-line bg-ivory px-3" dir="ltr" />
      </label>
      {error ? <p className="mt-4 text-sm font-medium text-olive">That username or password is not correct.</p> : null}
      <button type="submit" disabled={busy} className="mt-6 inline-flex min-h-12 w-full items-center justify-center bg-forest px-5 text-sm font-semibold text-cream disabled:opacity-60">
        {busy ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
