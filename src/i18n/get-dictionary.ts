import "server-only";
import type { Locale } from "./config";

const dictionaries = {
  tr: () => import("./dictionaries/tr").then((m) => m.default),
  en: () => import("./dictionaries/en").then((m) => m.default),
  ar: () => import("./dictionaries/ar").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
