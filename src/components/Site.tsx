"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { LOCALES, LOCALE_META, type Locale } from "@/i18n/config";
import { DEFAULT_CONFIG, WHATSAPP_NUMBER, decodeConfig, encodeConfig, type Config, type Pkg } from "@/lib/catalog";
import { gsap, ScrollTrigger, useGSAP, scrollToId, setLenis, prefersReducedMotion } from "@/lib/motion";
import Hero from "./Hero";
import Logo from "./Logo";
import Process from "./Process";
import Configurator from "./Configurator";
import { Pricing, Stats, FinalCta, Footer } from "./Sections";

function Nav({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const t = dict.nav;
  const go = (id: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToId(id);
  };
  // Switching language keeps the visitor's configuration (query string) and position.
  const switchTo = (l: Locale) => (e: React.MouseEvent) => {
    e.preventDefault();
    // Full page load on purpose: <html lang/dir> and fonts change per language.
    window.location.assign(new URL(`/${l}${window.location.search}${window.location.hash}`, window.location.origin).href);
  };
  return (
    <header className="nav">
      <div className="wrap nav-inner">
        <a href="#top" className="brand" onClick={go("top")} aria-label={t.brand}>
          <Logo brand={t.brand} />
        </a>
        <nav className="nav-links">
          <a href="#line" onClick={go("line")}>{t.line}</a>
          <a href="#build" onClick={go("build")}>{t.build}</a>
          <a href="#pricing" onClick={go("pricing")}>{t.pricing}</a>
        </nav>
        <div className="nav-end">
          <div className="lang" role="group" aria-label={t.language}>
            {LOCALES.map((l) => (
              <a key={l} href={`/${l}`} hrefLang={l} aria-current={l === lang ? "true" : undefined} onClick={switchTo(l)}>
                {LOCALE_META[l].label}
              </a>
            ))}
          </div>
          <a
            className="btn btn-signal btn-sm"
            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(dict.cta.message)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            {t.cta}
          </a>
        </div>
      </div>
    </header>
  );
}

function CursorGlow() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || !window.matchMedia("(pointer: fine)").matches) return;
    const x = gsap.quickTo(el, "x", { duration: 0.6, ease: "power3.out" });
    const y = gsap.quickTo(el, "y", { duration: 0.6, ease: "power3.out" });
    const move = (e: PointerEvent) => {
      el.style.opacity = "1";
      x(e.clientX);
      y(e.clientY);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  }, []);
  return <div className="cursor-glow" ref={ref} aria-hidden="true" />;
}

export default function Site({ dict, lang }: { dict: Dictionary; lang: Locale }) {
  const [config, setConfig] = useState<Config>(DEFAULT_CONFIG);
  const dirty = useRef(false);

  // Smooth scrolling, driven by GSAP's ticker so ScrollTrigger stays in sync.
  useEffect(() => {
    document.documentElement.classList.add("anim-ready");
    if (prefersReducedMotion()) return;
    const lenis = new Lenis({ autoRaf: false, lerp: 0.12 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  // Restore a shared configuration from the URL, then jump to the order desk.
  useEffect(() => {
    const fromUrl = decodeConfig(window.location.search);
    if (!Object.keys(fromUrl).length) return;
    const raf = requestAnimationFrame(() => setConfig((c) => ({ ...c, ...fromUrl })));
    const id = window.setTimeout(() => scrollToId("build"), 300);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(id);
    };
  }, []);

  // Keep the URL in sync so any configuration can be shared.
  useEffect(() => {
    if (!dirty.current) return;
    const id = window.setTimeout(() => {
      window.history.replaceState(null, "", `${window.location.pathname}?${encodeConfig(config)}`);
    }, 250);
    return () => window.clearTimeout(id);
  }, [config]);

  const update = useCallback((patch: Partial<Config>) => {
    dirty.current = true;
    setConfig((c) => ({ ...c, ...patch }));
  }, []);

  // Section reveals for anything marked data-reveal.
  useGSAP(() => {
    gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
      ScrollTrigger.batch("[data-reveal]", {
        start: "top 88%",
        once: true,
        onEnter: (els) =>
          gsap.to(els, { opacity: 1, y: 0, duration: 1, ease: "expo.out", stagger: 0.08, overwrite: true }),
      });
    });
  });

  const pickPackage = (p: Pkg) => {
    update({ pkg: p });
    scrollToId("build");
  };

  return (
    <>
      <Nav dict={dict} lang={lang} />
      <main>
        <Hero
          dict={dict}
          name={config.name}
          onName={(name) => update({ name })}
          onSector={(sector) => update({ sector })}
          onBuild={() => scrollToId("build")}
          onPricing={() => scrollToId("pricing")}
        />
        <Process dict={dict} />
        <Configurator dict={dict} lang={lang} config={config} update={update} />
        <Stats dict={dict} />
        <Pricing dict={dict} onPick={pickPackage} />
        <FinalCta dict={dict} />
      </main>
      <Footer dict={dict} />
      <CursorGlow />
    </>
  );
}
