"use client";

import type { Dictionary } from "@/i18n/dictionaries/en";
import { splitTime, useOffer } from "@/lib/useOffer";
import { scrollToId } from "@/lib/motion";

const fill = (s: string, v: Record<string, string | number>) =>
  Object.entries(v).reduce((acc, [k, x]) => acc.replaceAll(`{${k}}`, String(x)), s);
const pad = (n: number) => String(n).padStart(2, "0");

/** Thin strip on top of the navigation while the launch offer runs. */
export function OfferBar({ dict }: { dict: Dictionary }) {
  const o = useOffer();
  if (!o.live) return null;
  const t = dict.offer;
  const time = o.left === null ? null : splitTime(o.left);
  return (
    <a
      className="offer-bar"
      href="#offer"
      onClick={(e) => {
        e.preventDefault();
        scrollToId("offer");
      }}
    >
      <span className="offer-bar-badge">-{fill(t.pct, { pct: o.percent })}</span>
      <span className="offer-bar-text">
        <b>{t.badge}</b>
        <span className="offer-bar-long"> · {fill(t.bar, { pct: o.percent, total: o.places })}</span>
      </span>
      <span className="offer-bar-places">{fill(t.left, { n: o.placesLeft, total: o.places })}</span>
      {time && (
        <span className="offer-bar-time" suppressHydrationWarning>
          <bdi>
            {time.d} {t.units.d}
          </bdi>{" "}
          <bdi dir="ltr">
            {pad(time.h)}:{pad(time.m)}:{pad(time.s)}
          </bdi>
        </span>
      )}
      <span className="offer-bar-cta" aria-hidden="true">
        →
      </span>
    </a>
  );
}

/** The campaign section: big percentage seal, countdown, places meter and the call to action. */
export function OfferSection({ dict }: { dict: Dictionary }) {
  const o = useOffer();
  if (!o.live) return null;
  const t = dict.offer;
  const time = o.left === null ? null : splitTime(o.left);
  const pct = fill(t.pct, { pct: o.percent });
  // Arabic letters must stay joined, so the ring text is not stretched to fit.
  const rtl = dict.nav.language === "اللغة";
  const unit = `${t.badge} · −${pct} · `;
  // Arabic is not stretched, so it needs more repeats to go all the way round.
  const ring = unit.repeat(rtl ? 4 : 2);

  return (
    <section className="offer section dark" id="offer">
      <div className="offer-glow" aria-hidden="true" />
      <div className="wrap offer-inner">
        <div className="offer-seal" aria-hidden="true">
          <svg viewBox="0 0 200 200" className="offer-ring">
            <defs>
              <path id="offer-circle" d="M100 100 m-82 0 a82 82 0 1 1 164 0 a82 82 0 1 1 -164 0" />
            </defs>
            <text direction="ltr">
              <textPath href="#offer-circle" {...(rtl ? {} : { textLength: 512, lengthAdjust: "spacing" })}>{ring.toUpperCase()}</textPath>
            </text>
          </svg>
          <div className="offer-pct" data-before={t.pct.startsWith("%") ? "" : undefined}>
            {o.percent}
            <span>%</span>
          </div>
        </div>

        <div className="offer-copy">
          <p className="eyebrow">
            <span className="live-dot" />
            {t.badge}
          </p>
          <h2 className="h2">{fill(t.title, { pct: o.percent, total: o.places })}</h2>
          <p className="lead">{fill(t.sub, { pct: o.percent, total: o.places })}</p>

          <div className="offer-clock" aria-label={t.ends}>
            <span className="label">{t.ends}</span>
            <div className="offer-tiles" suppressHydrationWarning>
              {(["d", "h", "m", "s"] as const).map((k) => (
                <div className="offer-tile" key={k}>
                  <b suppressHydrationWarning>{time ? pad(time[k]) : "--"}</b>
                  <small>{t.units[k]}</small>
                </div>
              ))}
            </div>
          </div>

          <div className="offer-places">
            <div className="offer-dots" aria-hidden="true">
              {Array.from({ length: o.places }, (_, i) => (
                <i key={i} data-taken={i < o.places - o.placesLeft ? "" : undefined} />
              ))}
            </div>
            <span>{fill(t.left, { n: o.placesLeft, total: o.places })}</span>
          </div>

          <ul className="offer-perks">
            {t.perks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>

          <button type="button" className="btn btn-signal btn-xl" onClick={() => scrollToId("build")}>
            {t.cta}
            <span className="arrow" aria-hidden="true">
              →
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
