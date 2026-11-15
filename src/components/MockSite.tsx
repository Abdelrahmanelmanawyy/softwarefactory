import type { CSSProperties } from "react";
import type { Dictionary } from "@/i18n/dictionaries/en";
import { SECTOR_THEME, accentFor, onColor, type Color, type Feature, type Sector, type Style } from "@/lib/catalog";

type Props = {
  sector: Sector;
  style: Style;
  color: Color;
  features: readonly Feature[];
  name: string;
  variant: "desktop" | "mobile";
  mock: Dictionary["mock"];
  common: Dictionary["mockCommon"];
  /** Blueprint labels per part, shown before a part is assembled (hero only). */
  labels?: Partial<Record<string, string>>;
};

const BARS = [38, 62, 45, 80, 58, 92, 70];

/** A small, fully CSS-drawn sample website that re-skins itself per sector. */
export default function MockSite({ sector, style, color, features, name, variant, mock, common, labels }: Props) {
  const theme = SECTOR_THEME[sector];
  const m = mock[sector];
  const accent = accentFor(sector, color);
  const has = (f: Feature) => features.includes(f);
  const title = name.trim() || m.name;
  const label = (k: string) => labels?.[k];

  const vars = {
    "--ms-bg": theme.bg,
    "--ms-surface": theme.surface,
    "--ms-ink": theme.ink,
    "--ms-accent": accent,
    "--ms-on-accent": onColor(accent),
    "--ms-r": `${theme.radius}px`,
  } as CSSProperties;

  return (
    <div className="ms" data-sector={sector} data-style={style} data-variant={variant} data-font={theme.font} style={vars}>
      <div className="ms-scroll" data-tabs={has("app") && variant === "mobile" ? "" : undefined}>
        <header className="ms-nav ms-part" data-part="nav" data-label={label("nav")}>
          <span className="ms-logo">
            <i />
            <span>{title}</span>
          </span>
          {variant === "desktop" && (
            <nav className="ms-links">
              {common.nav.map((n) => (
                <span key={n}>{n}</span>
              ))}
            </nav>
          )}
          {has("lang") && <span className="ms-langs">TR · EN · AR</span>}
          {variant === "mobile" && <span className="ms-burger" />}
        </header>

        <section className="ms-hero ms-part" data-part="hero" data-label={label("hero")}>
          <div className="ms-hero-copy" key={`${sector}-${title}`}>
            <h3>{title}</h3>
            <p>{m.tagline}</p>
            <span className="ms-btn">{m.cta}</span>
          </div>
          <div className="ms-visual" aria-hidden="true" />
        </section>

        <div className="ms-grid">
          {has("catalog") && (
            <section className="ms-card ms-part" data-part="catalog" data-label={label("catalog")}>
              <h4>{m.list}</h4>
              <ul className="ms-list">
                {m.items.map(([n, p]) => (
                  <li key={n}>
                    <span>{n}</span>
                    <b>{p}</b>
                  </li>
                ))}
              </ul>
            </section>
          )}
          {has("booking") && (
            <section className="ms-card ms-part" data-part="booking" data-label={label("booking")}>
              <h4>{m.book}</h4>
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
            </section>
          )}
          {has("payments") && (
            <section className="ms-card ms-part" data-part="payments">
              <h4>{common.pay}</h4>
              <div className="ms-paycard">
                <span>•••• 4242</span>
                <i />
              </div>
              <span className="ms-btn ms-btn-block">{common.pay}</span>
            </section>
          )}
          {has("admin") && (
            <section className="ms-card ms-part ms-admin" data-part="admin">
              <h4>{common.admin.title}</h4>
              <div className="ms-kpis">
                <div>
                  <small>{common.admin.orders}</small>
                  <b>128</b>
                </div>
                <div>
                  <small>{common.admin.revenue}</small>
                  <b>4.2k</b>
                </div>
              </div>
              <div className="ms-bars">
                {BARS.map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>
            </section>
          )}
          {has("app") && variant === "desktop" && (
            <section className="ms-card ms-part ms-app" data-part="app">
              <h4>{common.app}</h4>
              <div className="ms-stores">
                <span>App Store</span>
                <span>Google Play</span>
              </div>
            </section>
          )}
        </div>

        <footer className="ms-foot ms-part" data-part="footer" data-label={label("footer")}>
          © 2026 {title}
        </footer>
      </div>

      {has("whatsapp") && (
        <span className="ms-wa ms-part" data-part="whatsapp" aria-label={common.chat}>
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm0 18.2c-1.5 0-3-.4-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2Zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.4.1-.6.3-.2.2-.8.8-.8 2s.8 2.3 1 2.5c.1.2 1.6 2.5 4 3.5 1.5.6 2 .7 2.8.6.4-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.3-.4Z"
            />
          </svg>
        </span>
      )}
      {has("app") && variant === "mobile" && (
        <nav className="ms-tabs ms-part" data-part="app">
          {common.tabs.map((t, i) => (
            <span key={t} data-on={i === 0 ? "" : undefined}>
              <i />
              {t}
            </span>
          ))}
        </nav>
      )}
    </div>
  );
}
