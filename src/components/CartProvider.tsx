"use client";

import Image from "next/image";
import Link from "next/link";
import {
  createContext,
  useContext,
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import type { Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { hasText } from "@/lib/text";
import { formatPrice } from "@/lib/price";
import { productPath, productsPath } from "@/lib/paths";

const STORAGE_KEY = "north-hunter-cart";
const MAX_QTY = 20;

type CartLine = {
  slug: string;
  quantity: number;
  name: string;
  price: number;
  image: string;
};

type CartDraft = {
  slug: string;
  name: string;
  price: number;
  image: string;
};

type CartValue = {
  lines: CartLine[];
  count: number;
  open: boolean;
  openCart: () => void;
  closeCart: () => void;
  add: (item: CartDraft, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
};

const listeners = new Set<() => void>();
let cachedRaw = "";
let cachedLines: CartLine[] = [];
const emptyLines: CartLine[] = [];

function parseLines(raw: string): CartLine[] {
  if (!raw) return emptyLines;
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return emptyLines;
    const next = parsed.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const slug = "slug" in item && typeof item.slug === "string" ? item.slug : "";
      const name = "name" in item && typeof item.name === "string" ? item.name.trim() : "";
      const price = "price" in item && typeof item.price === "number" && Number.isFinite(item.price) ? item.price : Number.NaN;
      const image = "image" in item && typeof item.image === "string" ? item.image : "";
      const quantity = "quantity" in item && typeof item.quantity === "number" ? item.quantity : 0;
      if (!slug || !name || !Number.isFinite(price) || quantity < 1) return [];
      return [{ slug, name, price, image, quantity: Math.min(MAX_QTY, Math.floor(quantity)) }];
    });
    return next.length > 0 ? next : emptyLines;
  } catch {
    return emptyLines;
  }
}

function readLines() {
  const raw = window.localStorage.getItem(STORAGE_KEY) ?? "";
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedLines = parseLines(raw);
  }
  return cachedLines;
}

function writeLines(next: CartLine[]) {
  const raw = JSON.stringify(next);
  cachedRaw = raw;
  cachedLines = next.length > 0 ? next : emptyLines;
  window.localStorage.setItem(STORAGE_KEY, raw);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) listener();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const CartContext = createContext<CartValue | null>(null);

export function useCart() {
  const value = useContext(CartContext);
  if (!value) throw new Error("useCart must be used inside CartProvider");
  return value;
}

export function CartProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const lines = useSyncExternalStore(subscribe, readLines, () => emptyLines);
  const [open, setOpen] = useState(false);
  const count = lines.reduce((sum, line) => sum + line.quantity, 0);
  const openCart = useCallback(() => setOpen(true), []);
  const closeCart = useCallback(() => setOpen(false), []);

  const value = useMemo<CartValue>(
    () => ({
      lines,
      count,
      open,
      openCart,
      closeCart,
      add: (item, quantity = 1) => {
        if (!item.slug || !item.name.trim()) return;
        const addBy = Math.max(1, Math.floor(quantity));
        const current = readLines();
        const existing = current.find((line) => line.slug === item.slug);
        const next = existing
          ? current.map((line) =>
              line.slug === item.slug
                ? { ...item, quantity: Math.min(MAX_QTY, line.quantity + addBy) }
                : line,
            )
          : [...current, { ...item, quantity: Math.min(MAX_QTY, addBy) }];
        writeLines(next);
        openCart();
      },
      setQuantity: (slug, quantity) => {
        const nextQty = Math.floor(quantity);
        const current = readLines();
        writeLines(
          nextQty < 1
            ? current.filter((line) => line.slug !== slug)
            : current.map((line) =>
                line.slug === slug ? { ...line, quantity: Math.min(MAX_QTY, nextQty) } : line,
              ),
        );
      },
      remove: (slug) => writeLines(readLines().filter((line) => line.slug !== slug)),
    }),
    [closeCart, count, lines, open, openCart],
  );

  return (
    <CartContext.Provider value={value}>
      {children}
      <CartDrawer locale={locale} />
    </CartContext.Provider>
  );
}

function CartDrawer({ locale }: { locale: Locale }) {
  const { lines, open, closeCart, setQuantity, remove } = useCart();
  const copy = siteContent.cart;
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeCart();
    };
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [closeCart, open]);

  const detailed = lines.map((line) => ({
    line,
    unit: line.price,
    total: line.price * line.quantity,
  }));
  const subtotal = detailed.reduce((sum, item) => sum + item.total, 0);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70]" role="dialog" aria-modal="true" aria-labelledby={titleId}>
      <button type="button" className="absolute inset-0 bg-forest-deep/50" aria-label={copy.close[locale]} onClick={closeCart} />
      <div className="absolute inset-y-0 end-0 flex w-full max-w-md flex-col bg-paper shadow-xl">
        <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-4">
          <h2 id={titleId} className="text-lg font-semibold text-charcoal">
            {copy.label[locale]}
          </h2>
          <button
            ref={closeRef}
            type="button"
            onClick={closeCart}
            className="inline-flex h-11 min-w-11 items-center justify-center border border-line px-3 text-sm font-medium text-charcoal"
          >
            {copy.close[locale]}
          </button>
        </div>
        {detailed.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between px-4 py-6">
            <p className="text-sm text-moss">{copy.empty[locale]}</p>
            <Link
              href={productsPath(locale)}
              onClick={closeCart}
              className="inline-flex min-h-12 items-center justify-center bg-forest px-4 text-sm font-semibold text-cream"
            >
              {copy.continue[locale]}
            </Link>
          </div>
        ) : (
          <>
            <ul className="flex-1 overflow-y-auto px-4 py-4">
              {detailed.map(({ line, unit, total }) => {
                const image = hasText(line.image) ? line.image : "";
                return (
                  <li key={line.slug} className="flex gap-3 border-b border-line py-4">
                    <Link
                      href={productPath(locale, line.slug)}
                      onClick={closeCart}
                      className="relative h-20 w-16 shrink-0 bg-ivory"
                    >
                      {image ? (
                        <Image src={image} alt="" fill sizes="64px" unoptimized className="object-contain" />
                      ) : null}
                    </Link>
                    <div className="min-w-0 flex-1">
                      <Link
                        href={productPath(locale, line.slug)}
                        onClick={closeCart}
                        className="block text-sm font-semibold leading-snug text-charcoal hover:text-forest"
                      >
                        {line.name}
                      </Link>
                      <p className="mt-1 text-sm text-moss" dir="ltr">
                        {formatPrice(unit)}
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="inline-flex items-center border border-line">
                          <button
                            type="button"
                            className="h-11 w-11 text-lg text-charcoal"
                            aria-label={copy.decrease[locale]}
                            onClick={() => setQuantity(line.slug, line.quantity - 1)}
                          >
                            −
                          </button>
                          <span className="min-w-8 text-center text-sm font-semibold text-charcoal" dir="ltr">
                            {line.quantity}
                          </span>
                          <button
                            type="button"
                            className="h-11 w-11 text-lg text-charcoal"
                            aria-label={copy.increase[locale]}
                            onClick={() => setQuantity(line.slug, line.quantity + 1)}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="min-h-11 px-2 text-sm text-moss underline decoration-gold/70 underline-offset-4"
                          onClick={() => remove(line.slug)}
                        >
                          {copy.remove[locale]}
                        </button>
                        <p className="ms-auto text-sm font-semibold text-charcoal" dir="ltr">
                          {formatPrice(total)}
                        </p>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="border-t border-line px-4 py-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm text-moss">{copy.subtotal[locale]}</p>
                <p className="text-lg font-semibold text-charcoal" dir="ltr">
                  {formatPrice(subtotal)}
                </p>
              </div>
              <p className="mt-3 text-xs leading-relaxed text-moss">{copy.note[locale]}</p>
              <Link
                href={productsPath(locale)}
                onClick={closeCart}
                className="mt-4 inline-flex min-h-12 w-full items-center justify-center bg-forest px-4 text-sm font-semibold text-cream"
              >
                {copy.continue[locale]}
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
