"use client";

import { useId } from "react";

/** Software Fabrika SF monogram: cream S whose top bar runs into a green, folded F. */
export function Mark({ className }: { className?: string }) {
  // Several marks can be on one page, so each one gets its own gradient ids.
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="100 115 813 396" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}cream`} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#F7F4E8"/><stop offset="1" stopColor="#E9E5D3"/></linearGradient>
        <linearGradient id={`${id}leaf`} x1="1" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#6FA35F"/><stop offset="1" stopColor="#3A6F39"/></linearGradient>
        <linearGradient id={`${id}arm`} x1="0" y1="0" x2="1" y2="0"><stop offset="0" stopColor="#A9CC94"/><stop offset="0.7" stopColor="#7FAF6B"/><stop offset="1" stopColor="#5F9550"/></linearGradient>
        <linearGradient id={`${id}stem`} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3B703A"/><stop offset="0.5" stopColor="#558A4A"/><stop offset="1" stopColor="#386B36"/></linearGradient>
      </defs>
      <path fill={`url(#${id}cream)`} d="M270 120 H880 L805 205 H310 A40 40 0 0 0 310 285 H470 A85 102.5 0 0 1 470 490 H105 L190 405 H465 A30 30 0 0 0 465 345 H270 A90 112.5 0 0 1 270 120 Z" />
      <path fill={`url(#${id}leaf)`} d="M880 120 H908 Q880 192 805 205 Z" />
      <path fill={`url(#${id}arm)`} d="M556 264 H878 Q852 340 782 346 H640 Q610 300 556 264 Z" />
      <path fill="#5F9550" opacity="0.55" d="M770 264 H878 Q862 310 830 330 Z" />
      <path fill={`url(#${id}stem)`} d="M556 264 Q612 300 640 346 Q648 440 556 506 Q590 420 582 340 Q578 296 556 264 Z" />
    </svg>
  );
}

export default function Logo({ brand }: { brand: string }) {
  const [first, ...rest] = brand.split(" ");
  return (
    <span className="logo">
      <Mark className="logo-mark" />
      <span className="logo-rule" aria-hidden="true" />
      <span className="logo-word">
        <span className="logo-top">{first}</span>
        <span className="logo-bottom">{rest.join(" ")}</span>
      </span>
    </span>
  );
}
