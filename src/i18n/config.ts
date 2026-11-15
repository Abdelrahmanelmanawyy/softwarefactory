export const LOCALES = ["tr", "en", "ar"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "tr";

export const hasLocale = (v: string): v is Locale => (LOCALES as readonly string[]).includes(v);

export const LOCALE_META: Record<Locale, { label: string; dir: "ltr" | "rtl"; intl: string }> = {
  tr: { label: "TR", dir: "ltr", intl: "tr-TR" },
  en: { label: "EN", dir: "ltr", intl: "en-US" },
  ar: { label: "AR", dir: "rtl", intl: "ar-u-nu-latn" },
};
