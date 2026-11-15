"use client";

import { useEffect, useRef, useState } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { SECTORS, SECTOR_THEME, type Feature, type Sector } from "@/lib/catalog";
import { gsap, useGSAP, SNAP } from "@/lib/motion";
import MockSite from "./MockSite";

const HERO_FEATURES: Feature[] = ["catalog", "booking", "whatsapp"];
const ORDER = ["nav", "hero", "catalog", "booking", "footer"] as const;

function slug(name: string, fallback: string) {
  const s = name
    .toLocaleLowerCase("tr")
    .replace(/ı/g, "i")
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "");
  return s || fallback;
}

type Props = {
  dict: Dictionary;
  name: string;
  onName: (v: string) => void;
  onSector: (s: Sector) => void;
  onBuild: () => void;
  onPricing: () => void;
};

export default function Hero({ dict, name, onName, onSector, onBuild, onPricing }: Props) {
  const t = dict.hero;
  const root = useRef<HTMLElement>(null);
  const [sector, setSector] = useState<Sector>("restaurant");
  const [assembled, setAssembled] = useState(false);
  const [auto, setAuto] = useState(true);

  const labels = Object.fromEntries(ORDER.map((k, i) => [k, `0${i + 1} · ${t.parts[k]}`]));

  // Assembly sequence: blueprint -> each part pressed into place -> paint -> QC stamp.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motion: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          const q = gsap.utils.selector(root);
          const screen = q(".browser-screen")[0] as HTMLElement;
          const ms = q(".ms")[0] as HTMLElement;
          const press = q(".press")[0] as HTMLElement;
          const rows = q(".log-row") as HTMLElement[];
          const parts = ORDER.map((k) => q(`.hero-frame [data-part="${k}"]`)[0] as HTMLElement);
          const extras = q('.hero-frame [data-part="whatsapp"]') as HTMLElement[];
          const done = (el?: HTMLElement) => el && (el.dataset.state = "done");

          if (ctx.conditions?.reduce) {
            [...parts, ...extras].forEach(done);
            rows.forEach(done);
            ms.dataset.built = "";
            setAssembled(true);
            return;
          }

          const count = { v: 0 };
          const num = q(".meter-num")[0] as HTMLElement;
          num.textContent = "0";

          const tl = gsap.timeline({ delay: 0.25, onComplete: () => setAssembled(true) });
          tl.to(q(".hero-title .line > span"), { y: 0, yPercent: 0, duration: 1.1, ease: SNAP, stagger: 0.09 }, 0)
            .to(q(".hero-fade"), { opacity: 1, y: 0, duration: 0.9, ease: "power3.out", stagger: 0.07 }, 0.35)
            .to(q(".hero-machine"), { opacity: 1, y: 0, duration: 1, ease: SNAP }, 0.2)
            .to(q(".meter-num"), { opacity: 1, duration: 0.3 }, 0.8);

          parts.forEach((p, i) => {
            if (!p) return;
            const at = 1.05 + i * 0.42;
            tl.call(
              () => {
                const a = screen.getBoundingClientRect();
                const b = p.getBoundingClientRect();
                gsap.set(press, { x: b.left - a.left, y: b.top - a.top, width: b.width, height: b.height });
                rows[i].dataset.state = "active";
              },
              [],
              at,
            )
              .fromTo(press, { opacity: 0, scale: 1.08 }, { opacity: 1, scale: 1, duration: 0.2, ease: "power4.in" }, at)
              .call(() => {
                done(p);
                done(rows[i]);
              }, [], at + 0.2)
              .fromTo(p, { scale: 0.985 }, { scale: 1, duration: 0.45, ease: SNAP, clearProps: "scale" }, at + 0.2)
              .to(press, { opacity: 0, duration: 0.25 }, at + 0.28)
              .to(count, { v: ((i + 1) / parts.length) * 3, duration: 0.4, ease: "none", onUpdate: () => (num.textContent = String(Math.round(count.v))) }, at)
              .to(q(".meter-bar i"), { scaleX: (i + 1) / parts.length, duration: 0.4, ease: SNAP }, at);
          });

          const end = 1.05 + parts.length * 0.42 + 0.15;
          tl.call(() => {
            ms.dataset.built = "";
            extras.forEach(done);
          }, [], end)
            .fromTo(
              q(".qc-stamp"),
              { opacity: 0, scale: 1.9, rotate: -14 },
              { opacity: 1, scale: 1, rotate: -8, duration: 0.32, ease: "power4.in" },
              end + 0.35,
            )
            .fromTo(q(".hero-frame"), { x: 0 }, { x: 3, duration: 0.05, repeat: 3, yoyo: true, ease: "none", clearProps: "x" }, end + 0.67);
        },
      );
    },
    { scope: root },
  );

  // After assembly, the demo flips through sectors until the visitor picks one.
  useEffect(() => {
    if (!assembled || !auto) return;
    const id = window.setInterval(() => {
      setSector((s) => SECTORS[(SECTORS.indexOf(s) + 1) % SECTORS.length]);
    }, 3200);
    return () => window.clearInterval(id);
  }, [assembled, auto]);

  const pick = (s: Sector) => {
    setAuto(false);
    setSector(s);
    onSector(s);
    const ms = root.current?.querySelector<HTMLElement>(".hero-frame .ms");
    if (ms) ms.dataset.built = "";
  };

  const m = dict.mock[sector];

  return (
    <section className="hero" id="top" ref={root}>
      <div className="hero-grid" aria-hidden="true" />
      <div className="wrap hero-inner">
        <div className="hero-copy">
          <p className="eyebrow hero-fade">
            <span className="live-dot" />
            {t.eyebrow}
          </p>
          <h1 className="hero-title">
            {t.title.map((l, i) => (
              <span className="line" key={i}>
                <span className={i === 1 ? "hl" : undefined}>{l}</span>
              </span>
            ))}
          </h1>
          <p className="hero-sub hero-fade">{t.sub}</p>

          <label className="name-field hero-fade">
            <span className="label">{t.nameLabel}</span>
            <span className="name-input">
              <input
                value={name}
                maxLength={40}
                placeholder={t.namePlaceholder}
                onChange={(e) => onName(e.target.value)}
                autoComplete="organization"
              />
              <span className="name-tag">PART 00</span>
            </span>
          </label>

          <div className="hero-actions hero-fade">
            <a href="#build" className="btn btn-signal" onClick={(e) => (e.preventDefault(), onBuild())}>
              {t.primary}
              <span className="arrow" aria-hidden="true">→</span>
            </a>
            <a href="#pricing" className="btn btn-ghost" onClick={(e) => (e.preventDefault(), onPricing())}>
              {t.secondary}
            </a>
          </div>
        </div>

        <div className="hero-machine">
          <div className="machine-head">
            <span>STATION 01 / ASSEMBLY</span>
            <span className="machine-sector">
              <i style={{ background: SECTOR_THEME[sector].accent }} />
              {dict.sectors[sector]}
            </span>
          </div>

          <div className="browser hero-frame">
            <div className="browser-bar">
              <i />
              <i />
              <i />
              <span className="url">{slug(name, slug(m.name, sector))}.com</span>
            </div>
            <div className="browser-screen">
              <MockSite
                sector={sector}
                style="modern"
                color="auto"
                features={HERO_FEATURES}
                name={name}
                variant="desktop"
                mock={dict.mock}
                common={dict.mockCommon}
                labels={labels}
              />
              <div className="press" aria-hidden="true">
                <span>PRESS</span>
              </div>
              <div className="qc-stamp" aria-hidden="true">
                {t.qc} ✓
              </div>
            </div>
          </div>

          <div className="belt" aria-hidden="true">
            <div className="belt-track" />
          </div>

          <div className="machine-foot">
            <div className="log">
              <span className="label">{t.log}</span>
              <ol>
                {ORDER.map((k, i) => (
                  <li className="log-row" key={k}>
                    <span className="log-n">0{i + 1}</span>
                    <span className="log-name">{t.parts[k]}</span>
                    <span className="log-tick" aria-hidden="true">
                      ✓
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <div className="meter">
              <span className="label">{t.shipped}</span>
              <strong>
                <span className="meter-num">3</span> {t.days}
              </strong>
              <div className="meter-bar">
                <i />
              </div>
            </div>
          </div>

          <div className="sector-switch">
            <span className="label">{t.demo}</span>
            <div className="chips" role="group" aria-label={t.demo}>
              {SECTORS.map((s) => (
                <button
                  key={s}
                  type="button"
                  className="chip"
                  aria-pressed={s === sector}
                  onClick={() => pick(s)}
                >
                  <i style={{ background: SECTOR_THEME[s].accent }} />
                  {dict.sectors[s]}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
