import { business, isWhatsAppConfigured, whatsappDigits } from "@/content/business";
import type { Locale } from "@/i18n";
import { aboutPath } from "@/lib/paths";

export function inquiryMessage(locale: Locale, productName: string) {
  if (locale === "ar") {
    return `مرحباً مؤسسة النور، أود الاستفسار عن: ${productName}`;
  }
  return `Hello North Hunter, I would like to ask about: ${productName}`;
}

export function whatsappHref(text?: string) {
  if (!isWhatsAppConfigured()) return null;
  const base = `https://wa.me/${whatsappDigits()}`;
  if (!text) return base;
  return `${base}?text=${encodeURIComponent(text)}`;
}

export function inquiryHref(locale: Locale, productName: string, slug: string) {
  return (
    whatsappHref(inquiryMessage(locale, productName)) ??
    `${aboutPath(locale)}?item=${encodeURIComponent(slug)}#contact`
  );
}

export function contactActionHref(locale: Locale) {
  return whatsappHref() ?? `${aboutPath(locale)}#contact`;
}

export function whatsappLabel(locale: Locale) {
  const display = business.whatsappDisplay.trim();
  return {
    name: locale === "ar" ? "واتساب" : "WhatsApp",
    display: display || business.whatsappE164.trim(),
  };
}
