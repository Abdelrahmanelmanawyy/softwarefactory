export const LOCALES = ["tr", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

/** Prefix for hand-built URLs when the site is served from a sub-path (GitHub Pages). */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const hasLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

export const LOCALE_META: Record<Locale, { label: string; dir: "ltr" | "rtl"; intl: string }> = {
  tr: { label: "TR", dir: "ltr", intl: "tr-TR" },
  en: { label: "EN", dir: "ltr", intl: "en-US" },
  ar: { label: "AR", dir: "rtl", intl: "ar-u-nu-latn" },
};
