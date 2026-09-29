"use client";

import Link from "next/link";
import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";

type LanguageSwitchProps = {
  locale: Locale;
  variant?: "light" | "dark" | "plain";
};

function languageSwitchClass(variant: LanguageSwitchProps["variant"] = "dark") {
  if (variant === "plain") {
    return "inline-flex min-h-8 shrink-0 items-center text-[11px] font-medium text-cream/50 transition-colors hover:text-white";
  }
  if (variant === "light") {
    return "inline-flex min-h-10 shrink-0 items-center rounded-sm border border-cream/30 px-3 text-sm font-medium text-cream hover:border-cream hover:text-white";
  }
  return "inline-flex min-h-10 shrink-0 items-center rounded-sm border border-line px-3 text-sm font-medium text-charcoal transition-colors hover:border-forest hover:text-forest";
}

export function LanguageSwitch({ locale, variant = "dark" }: LanguageSwitchProps) {
  return (
    <Suspense fallback={<LanguageSwitchFallback locale={locale} variant={variant} />}>
      <LanguageSwitchInner locale={locale} variant={variant} />
    </Suspense>
  );
}

function LanguageSwitchFallback({ locale, variant }: LanguageSwitchProps) {
  return (
    <span className={languageSwitchClass(variant)}>
      {siteContent.language[locale].switchTo}
    </span>
  );
}

function LanguageSwitchInner({ locale, variant = "dark" }: LanguageSwitchProps) {
  const pathname = usePathname() || `/${locale}`;
  const searchParams = useSearchParams();
  const target = siteContent.language[locale].switchToLocale;
  const label = siteContent.language[locale].switchTo;

  const nextPath = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), `/${target}`);
  const query = searchParams.toString();
  const href = query ? `${nextPath}?${query}` : nextPath;

  return (
    <Link
      href={href}
      hrefLang={target}
      lang={target}
      className={languageSwitchClass(variant)}
      aria-label={locale === "ar" ? "Switch to English" : "التبديل إلى العربية"}
    >
      {label}
    </Link>
  );
}
