"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import type Lenis from "lenis";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

/** Shared ease: parts snap and lock into place, they never bounce. */
export const SNAP = "expo.out";

let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};

/** Smooth-scroll to a section id, falling back to native scrolling. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  if (lenis) lenis.scrollTo(el, { offset: -64 });
  else el.scrollIntoView({ behavior: "smooth", block: "start" });
}

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Makes a preview scroll by itself, like a screen recording: slowly down to the
 * end, a pause, then back to the top, forever. Runs only while it is on screen.
 * Returns a function that stops it.
 */
export function scrollTour(scroller: HTMLElement, delay = 1.4): () => void {
  if (prefersReducedMotion()) return () => {};
  const max = scroller.scrollHeight - scroller.clientHeight;
  if (max <= 4) return () => {};
  const pos = { y: scroller.scrollTop };
  const apply = () => {
    scroller.scrollTop = pos.y;
  };
  const down = Math.max(5, (max - pos.y) / (scroller.clientHeight * 0.22));
  const tl = gsap.timeline({ repeat: -1, delay, repeatDelay: 1 });
  tl.to(pos, { y: max, duration: down, ease: "sine.inOut", onUpdate: apply }).to(
    pos,
    { y: 0, duration: 1.8, ease: "power2.inOut", onUpdate: apply },
    "+=1.4",
  );
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) tl.play();
    else tl.pause();
  });
  io.observe(scroller);
  return () => {
    io.disconnect();
    tl.kill();
  };
}

export { gsap, ScrollTrigger, useGSAP };
