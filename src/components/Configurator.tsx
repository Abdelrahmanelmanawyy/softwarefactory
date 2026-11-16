"use client";

/* eslint-disable @next/next/no-img-element -- static export: plain <img> with our own pre-sized files */
import { useEffect, useLayoutEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { BASE_PATH, LOCALE_META, type Locale } from "@/i18n/config";
import {
  COLORS,
  DESIGNS,
  DESIGN_INFO,
  FEATURES,
  FEATURE_INFO,
  PACKAGES,
  PACKAGE_INFO,
  SECTORS,
  SECTOR_THEME,
  SPEEDS,
  STYLES,
  PRICES,
  WHATSAPP_NUMBER,
  accentFor,
  money,
  encodeConfig,
  orderNumber,
  quote,
  type Config,
  type Feature,
} from "@/lib/catalog";
import { sendOrderEmail } from "@/lib/order";
import { photo } from "@/lib/photos";
import { gsap, ScrollTrigger, useGSAP, prefersReducedMotion, scrollTour } from "@/lib/motion";
import MockSite from "./MockSite";

const noopSubscribe = () => () => {};

const STEPS = ["sector", "name", "design", "color", "style", "pkg", "features", "speed", "contact"] as const;
type Step = (typeof STEPS)[number];
const LAST = STEPS.length - 1;
/** One tap is the whole answer on these steps, so they move on by themselves. */
const AUTO_NEXT: readonly Step[] = ["sector", "design", "pkg", "speed"];

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
  const root = useRef<HTMLElement>(null);
  const devices = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [reached, setReached] = useState(0);
  const [dir, setDir] = useState<"fwd" | "back">("fwd");
  const [flash, setFlash] = useState<{ part: Feature; n: number; sector: string } | null>(null);
  const [contact, setContact] = useState({ name: "", phone: "", email: "", note: "", trap: "" });
  const [mail, setMail] = useState<"idle" | "need" | "sending" | "sent" | "mail-app" | "failed">("idle");
  const [copied, setCopied] = useState(false);
  const autoTimer = useRef(0);
  const current = STEPS[step];
  // The highlight belongs to the page it was added on, not to the next template.
  const flashPart = flash && flash.sector === config.sector ? flash.part : null;

  const usd = (n: number) => money(n, config.currency);
  const P = PRICES[config.currency];
  const q = quote(config);
  const price = useRolling(q.price);
  const days = useRolling(q.days);
  const order = orderNumber(config);

  // Browser-only values (origin, today's date) render after hydration.
  const mounted = useSyncExternalStore(noopSubscribe, () => true, () => false);
  const origin = mounted ? window.location.origin : "";
  const today = mounted ? new Date() : null;

  const go = (to: number) => {
    window.clearTimeout(autoTimer.current);
    const next = Math.max(0, Math.min(LAST, to));
    setDir(next >= step ? "fwd" : "back");
    setStep(next);
    setReached((r) => Math.max(r, next));
  };
  const answer = (patch: Partial<Config>) => {
    update(patch);
    if (AUTO_NEXT.includes(current)) {
      window.clearTimeout(autoTimer.current);
      autoTimer.current = window.setTimeout(() => go(step + 1), 420);
    }
  };
  useEffect(() => () => window.clearTimeout(autoTimer.current), []);

  // A shared link opens straight on the finished order.
  useEffect(() => {
    if (!new URLSearchParams(window.location.search).has("t")) return;
    const raf = requestAnimationFrame(() => {
      setStep(LAST);
      setReached(LAST);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const setFeature = (f: Feature, on: boolean) => {
    if (config.features.includes(f) === on) return;
    if (on) setFlash((p) => ({ part: f, n: (p?.n ?? 0) + 1, sector: config.sector }));
    const next = on ? [...config.features, f] : config.features.filter((x) => x !== f);
    update({ features: FEATURES.filter((x) => next.includes(x)) });
  };

  // When a feature is switched on, both previews scroll to the part that just appeared.
  useLayoutEffect(() => {
    if (!flash || !devices.current) return;
    devices.current.querySelectorAll<HTMLElement>(".ms").forEach((ms) => {
      const scroller = ms.querySelector<HTMLElement>(".ms-scroll");
      const part = ms.querySelector<HTMLElement>(`.ms-scroll [data-part="${flash.part}"]`);
      if (!scroller) return;
      const top = part
        ? part.getBoundingClientRect().top - scroller.getBoundingClientRect().top + scroller.scrollTop - scroller.clientHeight * 0.12
        : flash.part === "lang"
          ? 0
          : scroller.scrollTop;
      const pos = { y: scroller.scrollTop };
      gsap.to(pos, {
        y: Math.max(0, top),
        duration: prefersReducedMotion() ? 0 : 0.7,
        ease: "power3.inOut",
        onUpdate: () => (scroller.scrollTop = pos.y),
      });
    });
  }, [flash]);

  // Between answers the previews scroll by themselves, like a screen recording.
  const featureKey = config.features.join(".");
  useEffect(() => {
    const el = devices.current;
    if (!el) return;
    const stops: Array<() => void> = [];
    const id = window.setTimeout(() => {
      el.querySelectorAll<HTMLElement>(".ms-scroll").forEach((s, i) => stops.push(scrollTour(s, i * 0.6)));
    }, 2600);
    return () => {
      window.clearTimeout(id);
      stops.forEach((s) => s());
    };
  }, [config.sector, config.style, featureKey, flash]);

  // Devices: the lid opens when the section arrives, then everything leans toward the cursor.
  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const el = devices.current;
        if (!el) return;
        const rtl = document.documentElement.dir === "rtl";
        const lid = el.querySelector(".laptop-lid");
        const lapScreen = el.querySelector(".laptop .screen");
        const phone = el.querySelector(".phone");
        gsap.set(lid, { rotationX: -86, transformOrigin: "50% 100%" });
        gsap.set(lapScreen, { opacity: 0 });
        gsap.set(phone, { xPercent: rtl ? -60 : 60, yPercent: 14, rotation: rtl ? -8 : 8, opacity: 0 });

        const tl = gsap.timeline({
          scrollTrigger: { trigger: el, start: "top 82%", once: true },
          defaults: { ease: "expo.out" },
        });
        tl.to(lid, { rotationX: 0, duration: 1.7, ease: "power3.out" })
          .to(lapScreen, { opacity: 1, duration: 0.6, ease: "power2.out" }, 0.7)
          .to(phone, { xPercent: 0, yPercent: 0, rotation: 0, opacity: 1, duration: 1.3 }, 0.8);

        if (!window.matchMedia("(pointer: fine)").matches) return;
        const tilt = el.querySelector(".cfg-tilt");
        const stage = el.closest(".cfg-stage") as HTMLElement | null;
        if (!tilt || !stage) return;
        const rx = gsap.quickTo(tilt, "rotationX", { duration: 0.9, ease: "power3.out" });
        const ry = gsap.quickTo(tilt, "rotationY", { duration: 0.9, ease: "power3.out" });
        const px = gsap.quickTo(phone, "x", { duration: 0.9, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const r = stage.getBoundingClientRect();
          const nx = (e.clientX - r.left) / r.width - 0.5;
          const ny = (e.clientY - r.top) / r.height - 0.5;
          ry(nx * 9);
          rx(-ny * 6);
          px(nx * -14);
        };
        const leave = () => {
          rx(0);
          ry(0);
          px(0);
        };
        stage.addEventListener("pointermove", move, { passive: true });
        stage.addEventListener("pointerleave", leave);
        return () => {
          stage.removeEventListener("pointermove", move);
          stage.removeEventListener("pointerleave", leave);
        };
      });
      // Layout above may still be settling (fonts, photos): keep trigger positions right.
      const id = window.setTimeout(() => ScrollTrigger.refresh(), 600);
      return () => window.clearTimeout(id);
    },
    { scope: root },
  );

  // ---------- texts for the order ----------
  const brand = config.name.trim() || dict.tpl[config.sector].brand;
  const shareLink = `${origin}${BASE_PATH}/${lang}?${encodeConfig(config)}`;
  const demoLink = `${BASE_PATH}/${lang}/demo/${config.sector}?${encodeConfig(config)}`;
  const featureNames = config.features.map((f) => t.features[f]).join(", ") || t.ticket.none;
  const who = [contact.name.trim(), contact.phone.trim(), contact.email.trim()].filter(Boolean).join(" · ") || "-";
  const message = t.whatsapp
    .replace("{name}", brand)
    .replace("{sector}", dict.sectors[config.sector])
    .replace("{pkg}", t.packages[config.pkg].name)
    .replace("{style}", t.styles[config.style])
    .replace("{color}", t.colors[config.color])
    .replace("{design}", t.designs[config.design].name)
    .replace("{features}", featureNames)
    .replace("{speed}", t.speeds[config.speed].name)
    .replace("{price}", usd(q.price))
    .replace("{days}", String(q.days))
    .replace("{order}", order)
    .replace("{contact}", who)
    .replace("{link}", shareLink);
  const fullMessage = contact.note.trim() ? `${message}\n\n${contact.note.trim()}` : message;
  const waHref = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(fullMessage)}`;

  const eta = today
    ? new Intl.DateTimeFormat(intl, { day: "numeric", month: "short", year: "numeric" }).format(
        new Date(today.getTime() + q.days * 86400000),
      )
    : "—";

  const sendMail = async () => {
    if (!contact.name.trim() || !(contact.phone.trim() || contact.email.trim())) {
      setMail("need");
      return;
    }
    setMail("sending");
    const result = await sendOrderEmail({
      subject: t.contact.mailSubject.replace("{order}", order),
      message: fullMessage,
      name: contact.name.trim(),
      phone: contact.phone.trim(),
      email: contact.email.trim(),
      trap: contact.trap,
    });
    setMail(result);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
    } catch {
      window.prompt(t.contact.copy, shareLink);
    }
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  const field = (k: "name" | "phone" | "email" | "note") => ({
    value: contact[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setContact((c) => ({ ...c, [k]: e.target.value }));
      if (mail !== "idle" && mail !== "sending") setMail("idle");
    },
  });

  const lineName = (l: (typeof q.lines)[number]) =>
    l.kind === "feature" ? t.features[l.key as Feature] : l.kind === "design" ? t.ticket.logoLine : t.ticket.expressLine;

  const stdDays = quote({ ...config, speed: "standard" }).days;
  const expQuote = quote({ ...config, speed: "express" });
  const expExtra = expQuote.price - quote({ ...config, speed: "standard" }).price;

  const qa = t.q[current];
  const mailNote =
    mail === "need"
      ? t.contact.need
      : mail === "sent"
        ? t.contact.sent
        : mail === "mail-app"
          ? t.contact.mailApp
          : mail === "failed"
            ? t.contact.failed
            : "";

  return (
    <section className="cfg section" id="build" ref={root}>
      <div className="wrap">
        <header className="section-head" data-reveal>
          <p className="eyebrow">{t.eyebrow}</p>
          <h2 className="h2">{t.title}</h2>
          <p className="lead">{t.sub}</p>
        </header>

        <div className="cfg-grid">
          <div className="quiz">
            <div className="quiz-top">
              <span className="label">{t.stepOf.replace("{n}", String(step + 1)).replace("{total}", String(STEPS.length))}</span>
              <div className="quiz-progress">
                {STEPS.map((s, i) => (
                  <button
                    key={s}
                    type="button"
                    aria-label={t.q[s].title}
                    aria-current={i === step ? "step" : undefined}
                    data-done={i < step ? "" : undefined}
                    disabled={i > reached}
                    onClick={() => go(i)}
                  />
                ))}
              </div>
            </div>

            <div className="quiz-body" key={current} data-dir={dir}>
              <h3 className="quiz-q">{qa.title}</h3>
              <p className="quiz-hint">{qa.hint}</p>

              {current === "sector" && (
                <div className="pick-grid">
                  {SECTORS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="pick-photo"
                      aria-pressed={config.sector === s}
                      onClick={() => answer({ sector: s })}
                    >
                      <img src={photo(s, 1).small} alt="" loading="lazy" decoding="async" />
                      <span>
                        <i style={{ background: SECTOR_THEME[s].accent }} />
                        {dict.sectors[s]}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {current === "name" && (
                <input
                  className="text-input text-input-lg"
                  value={config.name}
                  maxLength={40}
                  placeholder={dict.hero.namePlaceholder}
                  autoComplete="organization"
                  onChange={(e) => update({ name: e.target.value })}
                  onKeyDown={(e) => e.key === "Enter" && go(step + 1)}
                />
              )}

              {current === "design" && (
                <div className="opt-grid">
                  {DESIGNS.map((d) => (
                    <button
                      key={d}
                      type="button"
                      className="opt opt-row"
                      aria-pressed={config.design === d}
                      onClick={() => answer({ design: d })}
                    >
                      <span className="opt-main">
                        <b>{t.designs[d].name}</b>
                        <small>{t.designs[d].desc}</small>
                      </span>
                      <span className="opt-price">
                        <bdi>{P.design[d] ? `+${usd(P.design[d])}` : usd(0)}</bdi>
                        {DESIGN_INFO[d].days > 0 && (
                          <small>
                            <bdi>+{DESIGN_INFO[d].days}</bdi> {t.ticket.days}
                          </small>
                        )}
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {current === "color" && (
                <div className="pick-grid pick-grid-colors">
                  {COLORS.map((c) => {
                    const theme = SECTOR_THEME[config.sector];
                    return (
                      <button
                        key={c}
                        type="button"
                        className="pick-color"
                        aria-pressed={config.color === c}
                        onClick={() => update({ color: c })}
                      >
                        <span className="pick-color-chip" style={{ background: theme.bg }}>
                          <i style={{ background: accentFor(config.sector, c) }} />
                          <i style={{ background: theme.ink }} />
                          <i style={{ background: theme.surface }} />
                        </span>
                        {t.colors[c]}
                      </button>
                    );
                  })}
                </div>
              )}

              {current === "style" && (
                <div className="pick-grid pick-grid-3">
                  {STYLES.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="pick-style"
                      data-style={s}
                      aria-pressed={config.style === s}
                      onClick={() => update({ style: s })}
                    >
                      <span className="pick-style-aa" aria-hidden="true">
                        Aa
                      </span>
                      <b>{t.styles[s]}</b>
                      <small>{t.styleDesc[s]}</small>
                    </button>
                  ))}
                </div>
              )}

              {current === "pkg" && (
                <div className="opt-grid">
                  {PACKAGES.map((p) => (
                    <button
                      key={p}
                      type="button"
                      className="opt opt-row"
                      aria-pressed={config.pkg === p}
                      onClick={() => answer({ pkg: p })}
                    >
                      <span className="opt-main">
                        <b>{t.packages[p].name}</b>
                        <small>{t.packages[p].desc}</small>
                      </span>
                      <span className="opt-price">
                        {usd(P.plans[p])}
                        <small>
                          {PACKAGE_INFO[p].days} {t.ticket.days}
                        </small>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {current === "features" && (
                <div className="asks">
                  {FEATURES.map((f) => {
                    const on = config.features.includes(f);
                    return (
                      <div key={f} className="ask" data-on={on ? "" : undefined}>
                        <span className="ask-q">
                          {t.asks[f]}
                          <small>
                            <bdi>+{usd(P.features[f])}</bdi>
                            {FEATURE_INFO[f].days > 0 && (
                              <>
                                {" · "}
                                <bdi>+{FEATURE_INFO[f].days}</bdi> {t.ticket.days}
                              </>
                            )}
                          </small>
                        </span>
                        <span className="yesno" role="group" aria-label={t.features[f]}>
                          <button type="button" aria-pressed={on} onClick={() => setFeature(f, true)}>
                            {t.yes}
                          </button>
                          <button type="button" aria-pressed={!on} onClick={() => setFeature(f, false)}>
                            {t.no}
                          </button>
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}

              {current === "speed" && (
                <div className="opt-grid">
                  {SPEEDS.map((s) => (
                    <button
                      key={s}
                      type="button"
                      className="opt opt-row"
                      aria-pressed={config.speed === s}
                      onClick={() => answer({ speed: s })}
                    >
                      <span className="opt-main">
                        <b>{t.speeds[s].name}</b>
                        <small>{t.speeds[s].desc.replace("{days}", String(s === "express" ? expQuote.days : stdDays))}</small>
                      </span>
                      <span className="opt-price">
                        <bdi>{s === "express" ? `+${usd(expExtra)}` : usd(0)}</bdi>
                      </span>
                    </button>
                  ))}
                </div>
              )}

              {current === "contact" && (
                <div className="ticket">
                  <div className="ticket-head">
                    <span>{t.ticket.title}</span>
                    <span>#{order}</span>
                  </div>
                  <dl className="ticket-lines">
                    <div>
                      <dt>{t.ticket.business}</dt>
                      <dd>{brand}</dd>
                    </div>
                    <div>
                      <dt>
                        {dict.sectors[config.sector]} · {t.packages[config.pkg].name}
                      </dt>
                      <dd>{usd(q.base.price)}</dd>
                    </div>
                    {q.lines.map((l) => (
                      <div key={l.id}>
                        <dt>+ {lineName(l)}</dt>
                        <dd>{usd(l.price)}</dd>
                      </div>
                    ))}
                  </dl>
                  <div className="ticket-total">
                    <div>
                      <span>{t.ticket.total}</span>
                      <strong>{usd(price)}</strong>
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

                  <div className="ticket-form">
                    <input className="ticket-input" placeholder={t.contact.name} autoComplete="name" {...field("name")} />
                    <input className="ticket-input" placeholder={t.contact.phone} autoComplete="tel" inputMode="tel" {...field("phone")} />
                    <input className="ticket-input ticket-input-wide" placeholder={t.contact.email} autoComplete="email" type="email" {...field("email")} />
                    <textarea className="ticket-input ticket-input-wide" placeholder={t.contact.note} rows={2} {...field("note")} />
                    <input
                      className="ticket-trap"
                      tabIndex={-1}
                      autoComplete="off"
                      aria-hidden="true"
                      value={contact.trap}
                      onChange={(e) => setContact((c) => ({ ...c, trap: e.target.value }))}
                    />
                  </div>

                  <div className="ticket-actions">
                    <a className="btn btn-signal btn-block" href={waHref} target="_blank" rel="noopener noreferrer">
                      {t.contact.whatsapp}
                      <span className="arrow" aria-hidden="true">→</span>
                    </a>
                    <button type="button" className="btn btn-ghost btn-block" onClick={sendMail} disabled={mail === "sending" || mail === "sent"}>
                      {mail === "sending" ? t.contact.sending : mail === "sent" ? "✓" : t.contact.email_btn}
                    </button>
                  </div>
                  <p className="ticket-status" role="status" data-state={mail}>
                    {mailNote}
                  </p>
                  <div className="ticket-foot">
                    <p className="ticket-note">{t.contact.disclaimer}</p>
                    <button type="button" className="ticket-link" onClick={copy}>
                      {copied ? `${t.contact.copied} ✓` : t.contact.copy}
                    </button>
                  </div>
                </div>
              )}
            </div>

            <div className="quiz-foot">
              <button type="button" className="btn btn-ghost" onClick={() => go(step - 1)} disabled={step === 0}>
                <span className="arrow arrow-back" aria-hidden="true">←</span>
                {t.back}
              </button>
              <div className="quiz-price" aria-live="polite">
                <strong>{usd(price)}</strong>
                <span>
                  {days} {t.ticket.days}
                </span>
              </div>
              {step < LAST ? (
                <button type="button" className="btn btn-signal" onClick={() => go(step + 1)}>
                  {step === LAST - 1 ? t.review : t.next}
                  <span className="arrow" aria-hidden="true">→</span>
                </button>
              ) : (
                <button type="button" className="btn btn-ghost" onClick={() => go(0)}>
                  {t.restart}
                </button>
              )}
            </div>
          </div>

          <div className="cfg-stage">
            <div className="cfg-devices" ref={devices}>
              <div className="cfg-tilt">
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
                        tpl={dict.tpl}
                        common={dict.tplCommon}
                        flash={flashPart}
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
                      tpl={dict.tpl}
                      common={dict.tplCommon}
                      flash={flashPart}
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="cfg-caption">
              <span>
                <i style={{ background: accentFor(config.sector, config.color) }} />
                {brand} · {dict.sectors[config.sector]}
              </span>
              <a href={demoLink} target="_blank" rel="noopener">
                {t.openDemo} ↗
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
