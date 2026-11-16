import { BASE_PATH } from "@/i18n/config";
import type { Sector } from "./catalog";

export type PhotoN = 1 | 2 | 3 | 4 | 5;

/**
 * Photo n (1-5) of a sector. 1 is the wide hero shot.
 * Files live in public/photos (sources listed in CREDITS.md); "-sm" is the 640px version.
 */
export function photo(sector: Sector, n: PhotoN) {
  const base = `${BASE_PATH}/photos/${sector}/${n}`;
  return {
    src: `${base}.webp`,
    small: `${base}-sm.webp`,
    srcSet: `${base}-sm.webp 640w, ${base}.webp ${n === 1 ? 1800 : 1100}w`,
  };
}

/** Product shots for the store template (p1-p4). */
export function productPhoto(n: 1 | 2 | 3 | 4) {
  const base = `${BASE_PATH}/photos/store/p${n}`;
  return { src: `${base}.webp`, small: `${base}-sm.webp`, srcSet: `${base}-sm.webp 640w, ${base}.webp 900w` };
}
