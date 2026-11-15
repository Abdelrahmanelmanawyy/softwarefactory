"use client";

import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";

const noopSubscribe = () => () => {};
import type { Dictionary } from "@/i18n/dictionaries/en";
import { BASE_PATH, LOCALE_META, type Locale } from "@/i18n/config";
import {
  COLORS,
  COLOR_HEX,
  FEATURES,
  FEATURE_INFO,
  PACKAGES,
  PACKAGE_INFO,
  SECTORS,
  SECTOR_THEME,
  STYLES,
  WHATSAPP_NUMBER,
  encodeConfig,
  orderNumber,
  quote,
  usd,
  type Config,
  type Feature,
} from "@/lib/catalog";
import { gsap, prefersReducedMotion } from "@/lib/motion";
import MockSite from "./MockSite";

type Props = {
  dict: Dictionary;
  lang: Locale;
  config: Config;
  update: (patch: Partial<Config>) => void;
};

/** Number that rolls to its new value instead of jumping. */
function useRolling(value: number) {
  const [shown, setShown] = useState(value);
  const obj = useRef({ v: value });
  useEffect(() => {
    const tw = gsap.to(obj.current, {
      v: value,
      duration: prefersReducedMotion() ? 0 : 0.6,
      ease: "expo.out",
      onUpdate: () => setShown(Math.round(obj.current.v)),
    });
    return () => {
      tw.kill();
    };
  }, [value]);
  return shown;
}

export default function Configurator({ dict, lang, config, update }: Props) {
  const t = dict.config;
  const intl = LOCALE_META[lang].intl;
  const money = usd;

  const q = quote(config);
  const price = useRolling(q.price);
  const days = useRolling(q.days);
  const order = orderNumber(config);

  // Browser-only values (origin, today's date) render after hydration.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const origin = mounted ? window.location.origin : "";
  const today = mounted ? new Date() : null;
  const [copied, setCopied] = useState(false);
  const devices = useRef<HTMLDivElement>(null);
  const lastAdded = useRef<Feature | null>(null);

  // When a feature is switched on, scroll each mock to the part that just appeared.
  useLayoutEffect(() => {
    const f = lastAdded.current;
    if (!f || !devices.current) return;
    lastAdded.current = null;
    devices.current.querySelectorAll<HTMLElement>(".ms").forEach((ms) => {
      const scroller = ms.querySelector<HTMLElement>(".ms-scroll");
      const part = ms.querySelector<HTMLElement>(`.ms-scroll [data-part="${f}"]`);
      if (scroller && part) {
        scroller.scrollTo({ top: Math.max(0, part.offsetTop - 16), behavior: prefersReducedMotion() ? "auto" : "smooth" });
      }
    });
  }, [config.features]);

  const toggle = (f: Feature) => {
    const on = config.features.includes(f);
    if (!on) lastAdded.current = f;
    const next = on ? config.features.filter((x) => x !== f) : [...config.features, f];
    update({ features: FEATURES.filter((x) => next.includes(x)) });
  };

  const shareLink = `${origin}${BASE_PATH}/${lang}?${encodeConfig(config)}`;
  const featureNames = config.features.map((f) => t.features[f]).join(", ") || t.none;
  const businessName = config.name.trim() || dict.mock[config.sector].name;
  const message = t.whatsapp
    .replace("{name}", businessName)
    .replace("{sector}", dict.sectors[config.sector])
    .replace("{pkg}", t.packages[config.pkg].name)
    .replace("{style}", t.styles[config.style])
    .replace("{color}", t.colors[config.color])
    .replace("{features}", featureNames)
    .replace("{price}", money(q.price))
    .replace("{days}", String(q.days))
    .replace("{order}", order)
    .replace("{link}", shareLink);
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const eta = today
    ? new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(today.getTime() + q.days * 86400000),
      )
    : "—";

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      window.prompt(t.ticket.share, shareLink);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const swatch = (c: (typeof COLORS)[number]) =>
    c === "auto" ? SECTOR_THEME[config.sector].accent : c === "mono" ? SECTOR_THEME[config.sector].ink : COLOR_HEX[c];

  return (
    <section className="cfg section" id="build">
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.sub}</p>
        </header>

        <div className="cfg-grid">
          <div className="cfg-controls">
            <fieldset className="step">
              <legend>
                <span className="step-n">01</span>
                {t.steps.name}
              </legend>
              <input
                className="text-input"
                value={config.name}
                maxLength={40}
                placeholder={dict.hero.namePlaceholder}
                onChange={(e) => update({ name: e.target.value })}
              />
            </fieldset>

            <fieldset className="step">
              <legend>
                <span className="step-n">02</span>
                {t.steps.sector}
              </legend>
              <div className="opt-grid opt-grid-3">
                {SECTORS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    className="opt"
                    aria-pressed={config.sector === s}
                    onClick={() => update({ sector: s })}
                  >
                    <span className="opt-swatch" style={{ background: SECTOR_THEME[s].bg }}>
                      <i style={{ background: SECTOR_THEME[s].accent }} />
                    </span>
                    {dict.sectors[s]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="step">
              <legend>
                <span className="step-n">03</span>
                {t.steps.pkg}
              </legend>
              <div className="opt-grid">
                {PACKAGES.map((p) => (
                  <button
                    key={p}
                    type="button"
                    className="opt opt-pkg"
                    aria-pressed={config.pkg === p}
                    onClick={() => update({ pkg: p })}
                  >
                    <span className="opt-main">
                      <b>{t.packages[p].name}</b>
                      <small>{t.packages[p].desc}</small>
                    </span>
                    <span className="opt-price">
                      {money(PACKAGE_INFO[p].price)}
                      <small>
                        {PACKAGE_INFO[p].days} {t.ticket.days}
                      </small>
                    </span>
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="step">
              <legend>
                <span className="step-n">04</span>
                {t.steps.style}
              </legend>
              <div className="segmented" role="group">
                {STYLES.map((s) => (
                  <button key={s} type="button" aria-pressed={config.style === s} onClick={() => update({ style: s })}>
                    {t.styles[s]}
                  </button>
                ))}
              </div>
              <div className="swatches" role="group">
                {COLORS.map((c) => (
                  <button
                    key={c}
                    type="button"
                    className="swatch"
                    aria-pressed={config.color === c}
                    onClick={() => update({ color: c })}
                  >
                    <i style={{ background: swatch(c) }} />
                    {t.colors[c]}
                  </button>
                ))}
              </div>
            </fieldset>

            <fieldset className="step">
              <legend>
                <span className="step-n">05</span>
                {t.steps.features}
              </legend>
              <div className="toggles">
                {FEATURES.map((f) => {
                  const on = config.features.includes(f);
                  return (
                    <button key={f} type="button" role="switch" aria-checked={on} className="toggle" onClick={() => toggle(f)}>
                      <span className="toggle-ui" aria-hidden="true" />
                      <span className="toggle-name">{t.features[f]}</span>
                      <span className="toggle-cost">
                        +{money(FEATURE_INFO[f].price)}
                        {FEATURE_INFO[f].days > 0 && <small> +{FEATURE_INFO[f].days}d</small>}
                      </span>
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>

          <div className="cfg-stage">
            <div className="cfg-devices" ref={devices}>
              <div className="laptop">
                <div className="laptop-lid">
                  <div className="screen">
                    <MockSite
                      sector={config.sector}
                      style={config.style}
                      color={config.color}
                      features={config.features}
                      name={config.name}
                      variant="desktop"
                      mock={dict.mock}
                      common={dict.mockCommon}
                    />
                  </div>
                </div>
                <div className="laptop-base" />
              </div>
              <div className="phone">
                <div className="screen">
                  <MockSite
                    sector={config.sector}
                    style={config.style}
                    color={config.color}
                    features={config.features}
                    name={config.name}
                    variant="mobile"
                    mock={dict.mock}
                    common={dict.mockCommon}
                  />
                </div>
              </div>
            </div>

            <div className="ticket" aria-live="polite">
              <div className="ticket-head">
                <span>{t.ticket.title}</span>
                <span>#{order}</span>
              </div>
              <dl className="ticket-lines">
                <div>
                  <dt>{t.ticket.business}</dt>
                  <dd>{businessName}</dd>
                </div>
                <div>
                  <dt>{dict.sectors[config.sector]} · {t.packages[config.pkg].name}</dt>
                  <dd>{money(q.base.price)}</dd>
                </div>
                {q.lines.map((l) => (
                  <div key={l.feature} className="ticket-add">
                    <dt>+ {t.features[l.feature]}</dt>
                    <dd>{money(l.price)}</dd>
                  </div>
                ))}
              </dl>
              <div className="ticket-total">
                <div>
                  <span>{t.ticket.total}</span>
                  <strong>{money(price)}</strong>
                </div>
                <div>
                  <span>{t.ticket.delivery}</span>
                  <strong>
                    {days} {t.ticket.days}
                  </strong>
                </div>
                <div>
                  <span>{t.ticket.eta}</span>
                  <strong suppressHydrationWarning>{eta}</strong>
                </div>
              </div>
              <div className="ticket-actions">
                <a className="btn btn-signal btn-block" href={waHref} target="_blank" rel="noopener noreferrer">
                  {t.ticket.send}
                  <span className="arrow" aria-hidden="true">→</span>
                </a>
                <button type="button" className="btn btn-ghost btn-block" onClick={copy}>
                  {copied ? `${t.ticket.copied} ✓` : t.ticket.share}
                </button>
              </div>
              <p className="ticket-note">{t.ticket.note}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="cfg-bar" aria-hidden="true">
        <div>
          <strong>{money(price)}</strong>
          <span>
            {days} {t.ticket.days}
          </span>
        </div>
        <a className="btn btn-signal" href={waHref} target="_blank" rel="noopener noreferrer" tabIndex={-1}>
          {t.ticket.send}
        </a>
      </div>
    </section>
  );
}
