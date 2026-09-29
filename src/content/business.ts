/**
 * Editable North Hunter details.
 *
 * Leave a field as an empty string when it is still unknown. The site hides
 * TikTok, the map, the address, and brand photographs until a value is present.
 *
 * Image paths are relative to `public`, for example `/images/north-hunter/hero.jpg`.
 */

export type BusinessConfig = {
  brand: { en: string; ar: string };
  legalName: { en: string; ar: string };
  tagline: string;
  instagram: { handle: string; url: string };
  /** Leave the URL empty until a real TikTok profile is supplied. */
  tiktok: { handle: string; url: string };
  /** Street address. Leave empty when none has been supplied. */
  location: { ar: string; en: string };
  /** Readable phone, for example "+961 3 460 697". */
  phoneDisplay: string;
  /** Full tel link, for example "tel:+9613460697". */
  phoneTel: string;
  /**
   * International number, digits only, no plus sign.
   * Example: "9613460697". Leave empty until the number is verified.
   */
  whatsappE164: string;
  /** Readable local format, for example "+961 3 460 697". */
  whatsappDisplay: string;
  /** Do not guess. Leave empty until confirmed. */
  ownerName: string;
  /** Do not guess. Leave empty until confirmed. */
  hours: string;
  email: string;
  /** Google Maps link for the store pin. Leave empty until a pin is supplied. */
  mapUrl: string;
  latitude: number | null;
  longitude: number | null;
  images: {
    logo: string;
    hero: string;
    owner: string;
    categories: {
      clothing: string;
      camping: string;
      lighting: string;
    };
    products: {
      "camo-jacket": string;
      "camo-set": string;
      "olive-fleece": string;
      "outdoor-vest": string;
      flashlight: string;
      "camping-chair": string;
    };
  };
};

export const business: BusinessConfig = {
  brand: {
    en: "NORTH HUNTER",
    ar: "مؤسسة النور",
  },
  legalName: {
    en: "North Hunter",
    ar: "مؤسسة النور",
  },
  tagline: "HUNTING",
  instagram: {
    handle: "@north_hunter_taleb",
    url: "https://www.instagram.com/north_hunter_taleb/",
  },
  tiktok: {
    handle: "@north_hunter_taleb",
    url: "https://www.tiktok.com/@north_hunter_taleb",
  },
  location: {
    ar: "",
    en: "",
  },
  phoneDisplay: "+961 3 460 697",
  phoneTel: "tel:+9613460697",
  whatsappE164: "9613460697",
  whatsappDisplay: "+961 3 460 697",
  ownerName: "",
  hours: "",
  email: "",
  mapUrl: "https://www.google.com/maps?q=34.52452850341797,36.157135009765625&z=17&hl=en",
  latitude: 34.52452850341797,
  longitude: 36.157135009765625,
  images: {
    logo: "/images/north-hunter/logo.png",
    hero: "/images/north-hunter/hero.jpg",
    owner: "",
    categories: {
      clothing: "/images/products/sea-to-summit-ultra-sil-nano-poncho-lime.webp",
      camping: "/images/covers/camping-chair.jpg",
      lighting: "/images/products/biolite-alpenglow-500.png",
    },
    products: {
      "camo-jacket": "",
      "camo-set": "",
      "olive-fleece": "",
      "outdoor-vest": "",
      flashlight: "",
      "camping-chair": "",
    },
  },
};

export function optionalImage(src: string) {
  const value = src.trim();
  return value.length > 0 ? value : null;
}

export function whatsappDigits() {
  return business.whatsappE164.replace(/\D/g, "");
}

export function isWhatsAppConfigured() {
  return whatsappDigits().length >= 8;
}

export function isTikTokConfigured() {
  return business.tiktok.url.trim().length > 0;
}

export function isInstagramConfigured() {
  return business.instagram.url.trim().length > 0;
}

export function phoneHref() {
  const value = business.phoneTel.trim();
  return value.startsWith("tel:") ? value : null;
}

export function mapEmbedUrl() {
  if (!business.mapUrl.trim() || business.latitude == null || business.longitude == null) return "";
  return `https://maps.google.com/maps?q=${business.latitude},${business.longitude}&z=17&output=embed`;
}
