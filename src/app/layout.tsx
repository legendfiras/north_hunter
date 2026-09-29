import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Cairo, Outfit } from "next/font/google";
import { headers } from "next/headers";
import { business } from "@/content/business";
import { defaultLocale, dirFor, isLocale, type Locale } from "@/i18n";
import { siteContent } from "@/content/site";
import { indexRobots, siteUrl } from "@/lib/seo";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-outfit",
  display: "swap",
});

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cairo",
  display: "swap",
});

export const viewport: Viewport = {
  themeColor: "#0e0c0a",
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: siteContent.meta.en.title,
  description: siteContent.meta.en.description,
  applicationName: business.legalName.en,
  authors: [{ name: business.legalName.en }],
  robots: indexRobots,
  verification: process.env.GOOGLE_SITE_VERIFICATION
    ? { google: process.env.GOOGLE_SITE_VERIFICATION }
    : undefined,
  icons: business.images.logo.trim()
    ? {
        icon: [
          { url: "/images/north-hunter/favicon-16.png", sizes: "16x16", type: "image/png" },
          { url: "/images/north-hunter/favicon-32.png", sizes: "32x32", type: "image/png" },
          { url: "/images/north-hunter/favicon-48.png", sizes: "48x48", type: "image/png" },
          { url: "/images/north-hunter/favicon-192.png", sizes: "192x192", type: "image/png" },
          { url: "/images/north-hunter/favicon-512.png", sizes: "512x512", type: "image/png" },
        ],
        apple: [{ url: "/images/north-hunter/apple-touch-icon.png", sizes: "180x180", type: "image/png" }],
      }
    : undefined,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const headerList = await headers();
  const raw = headerList.get("x-locale") ?? defaultLocale;
  const locale: Locale = isLocale(raw) ? raw : defaultLocale;

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={`${outfit.variable} ${cairo.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full bg-ivory text-charcoal">{children}</body>
    </html>
  );
}
