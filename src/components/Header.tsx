"use client";

import Link from "next/link";
import { Suspense, useEffect, useId, useState } from "react";
import { usePathname } from "next/navigation";
import type { Locale } from "@/i18n";
import { navHref, navItems, siteContent } from "@/content/site";
import { Container } from "@/components/Container";
import { LanguageSwitch } from "@/components/LanguageSwitch";
import { Logo, logoAlt } from "@/components/Logo";
import { SearchField } from "@/components/SearchField";
import { useCart } from "@/components/CartProvider";

type HeaderProps = {
  locale: Locale;
};

export function Header({ locale }: HeaderProps) {
  return (
    <Suspense fallback={<HeaderShell locale={locale} />}>
      <HeaderInner locale={locale} />
    </Suspense>
  );
}

function HeaderShell({ locale }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-deep">
      <Container className="flex min-h-[5.5rem] items-center py-2">
        <Link href={`/${locale}`} aria-label={logoAlt}>
          <Logo locale={locale} variant="light" showName={false} />
        </Link>
      </Container>
    </header>
  );
}

function HeaderInner({ locale }: HeaderProps) {
  const [open, setOpen] = useState(false);
  const [hash, setHash] = useState("");
  const panelId = useId();
  const pathname = usePathname() || `/${locale}`;
  const [menuKey, setMenuKey] = useState(`${pathname}${hash}`);
  const copy = siteContent.header[locale];
  const nav = siteContent.nav[locale];
  const nextMenuKey = `${pathname}${hash}`;

  if (menuKey !== nextMenuKey) {
    setMenuKey(nextMenuKey);
    setOpen(false);
  }

  useEffect(() => {
    const read = () => setHash(window.location.hash);
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open]);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-forest-deep/95 text-cream backdrop-blur-md">
      <Container className="flex min-h-[5.5rem] items-center gap-2 py-2 sm:gap-3 lg:min-h-[6.5rem] lg:gap-6">
        <Link href={`/${locale}`} aria-label={logoAlt} className="min-w-0 shrink-0">
          <Logo locale={locale} variant="light" showName={false} priority />
        </Link>

        <nav className="ms-2 hidden items-center gap-6 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active = item.match(pathname, locale, hash);
            return (
              <Link
                key={item.key}
                href={navHref(item.key, locale)}
                aria-current={active ? "page" : undefined}
                className={`text-sm font-medium ${
                  active ? "text-gold" : "text-cream/80 hover:text-cream"
                }`}
              >
                {nav[item.key]}
              </Link>
            );
          })}
        </nav>

        <div className="ms-auto hidden min-w-0 flex-1 lg:block lg:max-w-xs">
          <SearchField locale={locale} tone="dark" id="search-desktop" />
        </div>

        <div className="ms-auto flex items-center gap-1.5 sm:gap-2 lg:ms-0">
          <CartButton locale={locale} onOpen={() => setOpen(false)} />
          <LanguageSwitch locale={locale} variant="light" />
          <Link
            href={navHref("contact", locale)}
            className="hidden min-h-11 items-center bg-gold px-3 text-sm font-semibold text-charcoal transition-colors hover:bg-gold-bright sm:inline-flex sm:px-4"
          >
            <span className="sm:hidden">{copy.contactShort}</span>
            <span className="hidden sm:inline">{copy.contact}</span>
          </Link>
          <button
            type="button"
            className="inline-flex h-11 w-11 items-center justify-center border border-cream/20 text-cream lg:hidden"
            aria-expanded={open}
            aria-controls={panelId}
            onClick={() => setOpen((value) => !value)}
          >
            <span className="sr-only">{open ? copy.closeMenu : copy.openMenu}</span>
            <span className="flex w-5 flex-col gap-1.5" aria-hidden="true">
              <span className={`block h-px w-full bg-cream transition-transform ${open ? "translate-y-[3.5px] rotate-45" : ""}`} />
              <span className={`block h-px w-full bg-cream ${open ? "opacity-0" : ""}`} />
              <span className={`block h-px w-full bg-cream transition-transform ${open ? "-translate-y-[3.5px] -rotate-45" : ""}`} />
            </span>
          </button>
        </div>
      </Container>

      <div id={panelId} hidden={!open} className="border-t border-white/10 bg-forest-deep lg:hidden">
        <Container className="flex flex-col gap-2 py-4">
          <SearchField locale={locale} tone="dark" id="search-menu" />
          <nav aria-label="Primary" className="mt-2 flex flex-col">
            {navItems.map((item) => {
              const active = item.match(pathname, locale, hash);
              return (
                <Link
                  key={item.key}
                  href={navHref(item.key, locale)}
                  aria-current={active ? "page" : undefined}
                  className={`min-h-12 py-3 text-base ${active ? "text-gold" : "text-cream"}`}
                >
                  {nav[item.key]}
                </Link>
              );
            })}
          </nav>
        </Container>
      </div>
    </header>
  );
}

function CartButton({ locale, onOpen }: { locale: Locale; onOpen: () => void }) {
  const { count, openCart } = useCart();
  const copy = siteContent.cart;
  const label = count > 0 ? `${copy.open[locale]} (${count})` : copy.open[locale];

  return (
    <button
      type="button"
      onClick={() => {
        onOpen();
        openCart();
      }}
      aria-label={label}
      className="relative inline-flex h-11 w-11 items-center justify-center border border-cream/20 text-cream"
    >
      <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 7h12l-1 13H7L6 7Z" />
        <path d="M9 7a3 3 0 0 1 6 0" />
      </svg>
      {count > 0 ? (
        <span
          className="absolute -top-1.5 -end-1.5 flex h-5 min-w-5 items-center justify-center bg-gold px-1 text-[0.65rem] font-semibold text-charcoal"
          dir="ltr"
        >
          {count > 99 ? "99+" : count}
        </span>
      ) : null}
    </button>
  );
}
