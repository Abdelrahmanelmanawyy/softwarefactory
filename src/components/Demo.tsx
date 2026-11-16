"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { BASE_PATH, type Locale } from "@/i18n/config";
import { DEFAULT_CONFIG, decodeConfig, encodeConfig, type Config, type Sector } from "@/lib/catalog";
import { Mark } from "./Logo";
import MockSite from "./MockSite";

const noop = () => () => {};
const PHONE = "(max-width: 760px)";
const watchPhone = (cb: () => void) => {
  const mq = window.matchMedia(PHONE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};

/** One sector's template as a real, full-screen website the visitor can scroll and share. */
export default function Demo({ dict, lang, sector }: { dict: Dictionary; lang: Locale; sector: Sector }) {
  // The page is static, so the visitor's choices (name, palette, features) arrive in the URL.
  const search = useSyncExternalStore(noop, () => window.location.search, () => "");
  const phone = useSyncExternalStore(watchPhone, () => window.matchMedia(PHONE).matches, () => false);
  const config: Config = useMemo(() => ({ ...DEFAULT_CONFIG, ...decodeConfig(search), sector }), [search, sector]);

  const orderHref = `${BASE_PATH}/${lang}?${encodeConfig(config)}`;

  return (
    <div className="demo">
      <div className="demo-bar">
        <a className="demo-bar-info" href={`${BASE_PATH}/${lang}`}>
          <Mark className="logo-mark" />
          <span>{dict.demo.banner}</span>
        </a>
        <div className="demo-bar-actions">
          <a className="btn btn-signal btn-sm" href={orderHref}>
            {dict.demo.order}
            <span className="arrow" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
      <main className="demo-screen">
        <MockSite
          sector={sector}
          style={config.style}
          color={config.color}
          features={config.features}
          name={config.name}
          variant={phone ? "mobile" : "desktop"}
          tpl={dict.tpl}
          common={dict.tplCommon}
          sizes="100vw"
        />
      </main>
    </div>
  );
}
