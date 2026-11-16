"use client";

import { useRef } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { PLANS, PRICES, SECTORS, WHATSAPP_NUMBER, minPrice, money, type Currency, type Pkg } from "@/lib/catalog";
import { gsap, useGSAP } from "@/lib/motion";
import Logo from "./Logo";

const wa = (text: string) => `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;

export function Pricing({ dict, currency, onPick }: { dict: Dictionary; currency: Currency; onPick: (p: Pkg) => void }) {
  const t = dict.pricing;

  return (
    <section className="pricing section light" id="pricing">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title}</h2>
        </header>
        <div className="plans">
          {PLANS.map((p, i) => {
            const plan = t.plans[p];
            const featured = p === "website";
            return (
              <article className="plan" data-featured={featured ? "" : undefined} key={p} data-reveal>
                <div className="plan-top">
                  <span className="label">SKU-0{i + 1}</span>
                  {featured && <span className="plan-badge">{t.popular}</span>}
                </div>
                <h3>{plan.name}</h3>
                <p className="plan-desc">{plan.desc}</p>
                <p className="plan-price">{money(PRICES[currency].plans[p], currency)}</p>
                <ul>
                  {plan.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
                {p === "quickfix" ? (
                  <a className="btn btn-ghost btn-block" href={wa(t.fixMessage)} target="_blank" rel="noopener noreferrer">
                    {t.order}
                  </a>
                ) : (
                  <button
                    type="button"
                    className={`btn btn-block ${featured ? "btn-signal" : "btn-ghost"}`}
                    onClick={() => onPick(p)}
                  >
                    {t.configure}
                    <span className="arrow" aria-hidden="true">→</span>
                  </button>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Stats({ dict, currency }: { dict: Dictionary; currency: Currency }) {
  const root = useRef<HTMLElement>(null);
  // "{money}" stats show the smallest job in the chosen currency; the others count a plain number.
  const show = (format: string, v: number) =>
    format.includes("{money}") ? format.replace("{money}", money(v, currency)) : format.replace("{n}", String(v));
  const target = (s: Dictionary["stats"][number]) => (s.format.includes("{money}") ? minPrice(currency) : s.value);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        (gsap.utils.toArray(".stat", root.current) as HTMLElement[]).forEach((el) => {
          const out = el.querySelector<HTMLElement>(".stat-value")!;
          const end = Number(el.dataset.value);
          const format = el.dataset.format!;
          const o = { v: 0 };
          out.textContent = show(format, 0);
          gsap.to(o, {
            v: end,
            duration: 1.6,
            ease: "expo.out",
            scrollTrigger: { trigger: el, start: "top 85%", once: true },
            onUpdate: () => (out.textContent = show(format, Math.round(o.v))),
          });
        });
      });
    },
    { scope: root, dependencies: [currency], revertOnUpdate: true },
  );

  return (
    <section className="stats light" ref={root}>
      <div className="wrap stats-grid">
        {dict.stats.map((s) => (
          <div className="stat" key={s.label} data-value={target(s)} data-format={s.format} data-reveal>
            <span className="stat-value">{show(s.format, target(s))}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export function FinalCta({ dict }: { dict: Dictionary }) {
  const t = dict.cta;
  const words = SECTORS.map((s) => dict.sectors[s]);
  return (
    <section className="final dark" id="contact">
      <div className="marquee" aria-hidden="true">
        <div className="marquee-track">
          {[0, 1].map((k) => (
            <span key={k}>
              {words.map((w) => (
                <span key={w}>
                  {w}
                  <i>✦</i>
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>
      <div className="wrap final-inner">
        <h2 className="final-title" data-reveal>
          {t.title}
        </h2>
        <p className="lead" data-reveal>
          {t.sub}
        </p>
        <a className="btn btn-signal btn-xl" href={wa(t.message)} target="_blank" rel="noopener noreferrer" data-reveal>
          {t.button}
          <span className="arrow" aria-hidden="true">→</span>
        </a>
      </div>
    </section>
  );
}

export function Footer({ dict }: { dict: Dictionary }) {
  return (
    <footer className="footer dark">
      <div className="wrap footer-inner">
        <Logo brand={dict.nav.brand} />
        <span>{dict.footer.tagline}</span>
        <span className="label">© 2026 · {dict.footer.rights}</span>
      </div>
    </footer>
  );
}
