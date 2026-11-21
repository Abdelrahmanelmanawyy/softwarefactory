"use client";

import { useSyncExternalStore } from "react";
import { OFFER, offerLive } from "./catalog";

// One shared one-second clock for every countdown on the page.
let now = 0;
const subs = new Set<() => void>();
let timer = 0;
function subscribe(cb: () => void) {
  subs.add(cb);
  if (!timer) {
    now = Date.now();
    timer = window.setInterval(() => {
      now = Date.now();
      subs.forEach((s) => s());
    }, 1000);
  }
  return () => {
    subs.delete(cb);
    if (!subs.size) {
      window.clearInterval(timer);
      timer = 0;
    }
  };
}
const snapshot = () => now || (now = Date.now());

/** The launch offer as it stands right now, plus the time left (null before hydration). */
export function useOffer() {
  const t = useSyncExternalStore(subscribe, snapshot, () => 0);
  const live = offerLive(t || undefined);
  const left = t ? Math.max(0, Date.parse(OFFER.ends) - t) : null;
  return { ...OFFER, live, percentNow: live ? OFFER.percent : 0, left };
}

/** Split milliseconds into days, hours, minutes, seconds. */
export function splitTime(ms: number) {
  const s = Math.floor(ms / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}
