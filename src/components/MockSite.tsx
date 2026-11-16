"use client";

/* eslint-disable @next/next/no-img-element -- static export: plain <img> with our own pre-sized files */
import { useEffect, useRef, type CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { SECTOR_THEME, accentFor, onColor, type Color, type Feature, type Sector, type Style } from "@/lib/catalog";
import { photo, productPhoto, type PhotoN } from "@/lib/photos";

type Props = {
  sector: Sector;
  style: Style;
  color: Color;
  features: readonly Feature[];
  name: string;
  variant: "desktop" | "mobile";
  tpl: Dictionary["tpl"];
  common: Dictionary["tplCommon"];
  /** Blueprint labels per part, shown before a part is assembled (hero only). */
  labels?: Partial<Record<string, string>>;
  /** Part that was just switched on: it drops in with a highlight. */
  flash?: string | null;
  /** `sizes` hint for the photos. Small mock-ups only need the small files. */
  sizes?: string;
};

/** Each sector gets its own page structure, not only its own colours. */
const LAYOUT: Record<Sector, { hero: "cover" | "split" | "center"; list: "menu" | "plans" | "cards" | "products" }> = {
  restaurant: { hero: "cover", list: "menu" },
  gym: { hero: "cover", list: "plans" },
  clinic: { hero: "split", list: "cards" },
  auto: { hero: "cover", list: "cards" },
  store: { hero: "split", list: "products" },
  startup: { hero: "center", list: "plans" },
};

const BARS = [38, 62, 45, 80, 58, 92, 70, 84, 66, 96];

function Photo({ sector, n, sizes, eager, product }: { sector: Sector; n: PhotoN; sizes: string; eager?: boolean; product?: boolean }) {
  const p = product ? productPhoto(n as 1 | 2 | 3 | 4) : photo(sector, n);
  return (
    <img
      src={p.small}
      srcSet={p.srcSet}
      sizes={sizes}
      alt=""
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

/**
 * A complete sample website for one sector, with real photos.
 * It scales with its container (the laptop, the phone, or the full demo page),
 * so the same component is the small preview and the full-screen demo.
 */
export default function MockSite({ sector, style, color, features, name, variant, tpl, common, labels, flash, sizes }: Props) {
  const theme = SECTOR_THEME[sector];
  const layout = LAYOUT[sector];
  const t = tpl[sector];
  const accent = accentFor(sector, color);
  const has = (f: Feature) => features.includes(f);
  const brand = name.trim() || t.brand;
  const label = (k: string) => labels?.[k];
  const desktop = variant === "desktop";
  const imgSizes = sizes ?? (desktop ? "(max-width: 980px) 70vw, 40vw" : "30vw");
  const scroller = useRef<HTMLDivElement>(null);

  // A new sector is a new page: start it from the top.
  useEffect(() => {
    if (scroller.current) scroller.current.scrollTop = 0;
  }, [sector]);

  const vars = {
    "--ms-bg": theme.bg,
    "--ms-surface": theme.surface,
    "--ms-ink": theme.ink,
    "--ms-accent": accent,
    "--ms-on-accent": onColor(accent),
  } as CSSProperties;

  const part = (k: string) => ({
    "data-part": k,
    "data-label": label(k),
    "data-new": flash === k ? "" : undefined,
  });

  const items = layout.list === "plans" ? t.items.slice(0, 3) : t.items;

  return (
    <div
      className="ms"
      data-sector={sector}
      data-style={style}
      data-variant={variant}
      data-hero={layout.hero}
      data-list={layout.list}
      data-dark={theme.dark ? "" : undefined}
      style={vars}
    >
      <i className="ms-loadbar" key={sector} aria-hidden="true" />
      <div className="ms-scroll" ref={scroller} data-tabs={has("app") && !desktop ? "" : undefined}>
        <div className="ms-page" key={sector}>
          <header className="ms-nav ms-part" {...part("nav")}>
            <span className="ms-logo">
              <i>{brand.trim().charAt(0).toLocaleUpperCase()}</i>
              <span>{brand}</span>
            </span>
            {desktop && (
              <nav className="ms-links">
                {t.nav.map((n) => (
                  <span key={n}>{n}</span>
                ))}
              </nav>
            )}
            {has("lang") && <span className="ms-langs">{common.langs}</span>}
            {desktop ? <span className="ms-btn ms-btn-sm">{t.cta}</span> : <span className="ms-burger" />}
          </header>

          <section className="ms-hero ms-part" {...part("hero")}>
            <div className="ms-hero-photo">
              <Photo sector={sector} n={1} sizes={imgSizes} eager />
            </div>
            <div className="ms-hero-copy">
              <p className="ms-eyebrow">{t.eyebrow}</p>
              <h1>{name.trim() ? brand : t.title}</h1>
              <p className="ms-lead">{name.trim() ? `${t.title} ${t.sub}` : t.sub}</p>
              <div className="ms-actions">
                <span className="ms-btn">{t.cta}</span>
                <span className="ms-btn ms-btn-ghost">{t.cta2}</span>
              </div>
            </div>
            <dl className="ms-stats">
              {t.stats.map(([v, l]) => (
                <div key={l}>
                  <dt>{v}</dt>
                  <dd>{l}</dd>
                </div>
              ))}
            </dl>
          </section>

          {has("catalog") && (
            <section className="ms-sec ms-catalog ms-part" {...part("catalog")}>
              <header className="ms-sec-head">
                <h2>{t.listTitle}</h2>
                <span className="ms-more">{common.viewAll} →</span>
              </header>
              <ul className="ms-items">
                {items.map(([n, d, p], i) => (
                  <li key={n} data-featured={layout.list === "plans" && i === 1 ? "" : undefined}>
                    {(layout.list === "products" || layout.list === "menu") && (
                      <span className="ms-item-photo">
                        {layout.list === "products" ? (
                          <Photo sector={sector} n={(i + 1) as PhotoN} sizes={imgSizes} product />
                        ) : (
                          <Photo sector={sector} n={(i + 2) as PhotoN} sizes={imgSizes} />
                        )}
                      </span>
                    )}
                    {layout.list === "cards" && <span className="ms-item-n">0{i + 1}</span>}
                    <span className="ms-item-main">
                      <b>{n}</b>
                      <small>{d}</small>
                    </span>
                    <span className="ms-item-price">{p}</span>
                    {layout.list === "plans" && <span className="ms-btn ms-btn-block">{t.cta}</span>}
                    {layout.list === "products" && <span className="ms-add">+ {common.add}</span>}
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="ms-sec ms-about">
            <div className="ms-about-photo">
              <Photo sector={sector} n={2} sizes={imgSizes} />
            </div>
            <div className="ms-about-copy">
              <h2>{t.about.title}</h2>
              <p className="ms-lead">{t.about.text}</p>
              <ul className="ms-perks">
                {t.perks.map(([h, d], i) => (
                  <li key={h}>
                    <i>{i + 1}</i>
                    <span>
                      <b>{h}</b>
                      <small>{d}</small>
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="ms-sec ms-gallery">
            <div className="ms-shots">
              {([3, 4, 5] as PhotoN[]).map((n) => (
                <span key={n}>
                  <Photo sector={sector} n={n} sizes={imgSizes} />
                </span>
              ))}
            </div>
            <figure className="ms-quote">
              <blockquote>“{t.quote.text}”</blockquote>
              <figcaption>
                <span className="ms-stars" aria-hidden="true">★★★★★</span>
                {t.quote.who}
              </figcaption>
            </figure>
          </section>

          {has("booking") && (
            <section className="ms-sec ms-booking ms-part" {...part("booking")}>
              <div className="ms-booking-copy">
                <h2>{t.bookTitle}</h2>
                <p className="ms-lead">{t.hours}</p>
                <p className="ms-lead">{t.addr}</p>
              </div>
              <div className="ms-form">
                <div className="ms-fields">
                  <span className="ms-field">{common.book.name}</span>
                  <span className="ms-field">{common.book.phone}</span>
                </div>
                <div className="ms-chips">
                  {common.days.map((d, i) => (
                    <span key={d} data-on={i === 1 ? "" : undefined}>
                      {d}
                    </span>
                  ))}
                </div>
                <div className="ms-chips">
                  {common.slots.map((s, i) => (
                    <span key={s} data-on={i === 2 ? "" : undefined}>
                      {s}
                    </span>
                  ))}
                </div>
                <span className="ms-btn ms-btn-block">{common.book.confirm}</span>
              </div>
            </section>
          )}

          {has("payments") && (
            <section className="ms-sec ms-pay ms-part" {...part("payments")}>
              <div className="ms-pay-copy">
                <h2>{common.pay.title}</h2>
                <p className="ms-lead">{common.pay.safe}</p>
              </div>
              <div className="ms-form">
                <div className="ms-pay-row">
                  <span>{t.items[0][0]}</span>
                  <b>{t.items[0][2]}</b>
                </div>
                <div className="ms-paycard">
                  <span>•••• •••• •••• 4242</span>
                  <i />
                </div>
                <div className="ms-pay-row ms-pay-total">
                  <span>{common.pay.total}</span>
                  <b>{t.items[0][2]}</b>
                </div>
                <span className="ms-btn ms-btn-block">{common.pay.cta}</span>
              </div>
            </section>
          )}

          {has("admin") && (
            <section className="ms-sec ms-admin ms-part" {...part("admin")}>
              <div className="ms-dash">
                <aside>
                  <b>{common.admin.title}</b>
                  <span data-on="" />
                  <span />
                  <span />
                  <span />
                </aside>
                <div className="ms-dash-main">
                  <div className="ms-kpis">
                    <div>
                      <small>{common.admin.orders}</small>
                      <b>128</b>
                    </div>
                    <div>
                      <small>{common.admin.revenue}</small>
                      <b>$4.2k</b>
                    </div>
                    <div>
                      <small>{common.admin.visitors}</small>
                      <b>2.4k</b>
                    </div>
                  </div>
                  <div className="ms-bars">
                    {BARS.map((h, i) => (
                      <i key={i} style={{ height: `${h}%` }} />
                    ))}
                  </div>
                  <ul className="ms-feed">
                    {t.items.slice(0, 3).map(([n, , p], i) => (
                      <li key={n}>
                        <span>{n}</span>
                        <small>
                          {common.admin.today} · {9 + i * 2}:{i === 1 ? "05" : "40"}
                        </small>
                        <b>{p}</b>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </section>
          )}

          {has("app") && desktop && (
            <section className="ms-sec ms-app ms-part" {...part("app")}>
              <div>
                <h2>{common.app.title}</h2>
                <p className="ms-lead">{common.app.sub}</p>
                <div className="ms-stores">
                  <span>{common.app.store}</span>
                  <span>{common.app.play}</span>
                </div>
              </div>
              <div className="ms-app-phone">
                <Photo sector={sector} n={1} sizes={imgSizes} />
              </div>
            </section>
          )}

          <footer className="ms-foot ms-part" {...part("footer")}>
            <div>
              <span className="ms-logo">
                <i>{brand.trim().charAt(0).toLocaleUpperCase()}</i>
                <span>{brand}</span>
              </span>
              <p>{t.addr}</p>
              <p>{t.hours}</p>
            </div>
            <nav>
              {t.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </nav>
            <small>
              © 2026 {brand} · {common.rights}
            </small>
          </footer>
        </div>
      </div>

      {has("app") && !desktop && (
        <nav className="ms-tabs ms-part" {...part("app")}>
          {common.tabs.map((tab, i) => (
            <span key={tab} data-on={i === 0 ? "" : undefined}>
              <i />
              {tab}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
