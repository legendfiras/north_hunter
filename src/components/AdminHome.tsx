"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { Locale } from "@/i18n";
import { dirFor } from "@/i18n";
import { Dashboard } from "@/components/Dashboard";

export function AdminHome() {
  const router = useRouter();
  const [locale, setLocale] = useState<Locale>("en");

  async function logout() {
    await fetch("/api/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="mt-8" lang={locale} dir={dirFor(locale)}>
      <div className="mb-6 flex flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => setLocale(locale === "ar" ? "en" : "ar")}
          className="inline-flex min-h-11 items-center border border-line px-3 text-sm"
        >
          {locale === "ar" ? "English" : "العربية"}
        </button>
        <button type="button" onClick={logout} className="inline-flex min-h-11 items-center px-3 text-sm text-moss underline">
          {locale === "ar" ? "خروج" : "Log out"}
        </button>
      </div>
      <Dashboard locale={locale} />
    </div>
  );
}
