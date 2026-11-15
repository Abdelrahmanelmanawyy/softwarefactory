// Everything the configurator sells, in one place: sectors, packages, add-ons,
// their prices and delivery times. Edit numbers here and the whole site follows.

/** WhatsApp number in international format, digits only (no +, no spaces). */
export const WHATSAPP_NUMBER = "905000000000"; // TODO: replace with the real business number

export const SECTORS = ["restaurant", "gym", "clinic", "auto", "store", "startup"] as const;
export type Sector = (typeof SECTORS)[number];

export const PACKAGES = ["landing", "website", "mvp"] as const;
export type Pkg = (typeof PACKAGES)[number];

export const STYLES = ["modern", "minimal", "bold"] as const;
export type Style = (typeof STYLES)[number];

export const COLORS = ["auto", "sage", "ocean", "ember", "mono"] as const;
export type Color = (typeof COLORS)[number];

export const FEATURES = ["catalog", "booking", "whatsapp", "payments", "admin", "app", "lang"] as const;
export type Feature = (typeof FEATURES)[number];

export const PLANS = ["quickfix", "landing", "website", "mvp"] as const;
export type Plan = (typeof PLANS)[number];

export const PLAN_PRICE: Record<Plan, number> = { quickfix: 10, landing: 49, website: 149, mvp: 499 };

export const PACKAGE_INFO: Record<Pkg, { price: number; days: number }> = {
  landing: { price: PLAN_PRICE.landing, days: 2 },
  website: { price: PLAN_PRICE.website, days: 3 },
  mvp: { price: PLAN_PRICE.mvp, days: 7 },
};

export const FEATURE_INFO: Record<Feature, { price: number; days: number }> = {
  catalog: { price: 20, days: 0 },
  booking: { price: 40, days: 1 },
  whatsapp: { price: 10, days: 0 },
  payments: { price: 60, days: 1 },
  admin: { price: 90, days: 2 },
  app: { price: 250, days: 5 },
  lang: { price: 30, days: 1 },
};

/** Look of each sample business. `font` picks a type family in the mock site. */
export const SECTOR_THEME: Record<
  Sector,
  { bg: string; surface: string; ink: string; accent: string; font: "serif" | "grotesk" | "rounded" | "mono"; radius: number }
> = {
  restaurant: { bg: "#F4ECE1", surface: "#FFF8EF", ink: "#2A1A12", accent: "#B4532A", font: "serif", radius: 3 },
  gym: { bg: "#101010", surface: "#1B1B1B", ink: "#F3F3EE", accent: "#D4FF3A", font: "grotesk", radius: 0 },
  clinic: { bg: "#EEF5F6", surface: "#FFFFFF", ink: "#0F2B33", accent: "#2A9D8F", font: "rounded", radius: 16 },
  auto: { bg: "#13161B", surface: "#1D2229", ink: "#E8ECF1", accent: "#FF6A2B", font: "mono", radius: 4 },
  store: { bg: "#FAF6F3", surface: "#FFFFFF", ink: "#1E1B18", accent: "#C2185B", font: "grotesk", radius: 10 },
  startup: { bg: "#0C0E1A", surface: "#151830", ink: "#EDEFFF", accent: "#7C6CFF", font: "grotesk", radius: 12 },
};

export const COLOR_HEX: Record<Exclude<Color, "auto" | "mono">, string> = {
  sage: "#7FA37A",
  ocean: "#2F6FEB",
  ember: "#FF5A1F",
};

export function accentFor(sector: Sector, color: Color): string {
  const theme = SECTOR_THEME[sector];
  if (color === "auto") return theme.accent;
  if (color === "mono") return theme.ink;
  return COLOR_HEX[color];
}

/** Black or white text, whichever reads better on the given colour. */
export function onColor(hex: string): string {
  const n = parseInt(hex.slice(1), 16);
  const ch = [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  const lum = 0.2126 * ch[0] + 0.7152 * ch[1] + 0.0722 * ch[2];
  return lum > 0.4 ? "#111111" : "#FFFFFF";
}

/** Prices are in US dollars everywhere; "$149" reads the same in TR, EN and AR. */
export const usd = (n: number) => "$" + n.toLocaleString("en-US");

export type Config = {
  sector: Sector;
  pkg: Pkg;
  style: Style;
  color: Color;
  features: Feature[];
  name: string;
};

export const DEFAULT_CONFIG: Config = {
  sector: "restaurant",
  pkg: "website",
  style: "modern",
  color: "auto",
  features: ["catalog", "booking", "whatsapp"],
  name: "",
};

export function quote(c: Config) {
  const base = PACKAGE_INFO[c.pkg];
  const lines = c.features.map((f) => ({ feature: f, ...FEATURE_INFO[f] }));
  const price = base.price + lines.reduce((s, l) => s + l.price, 0);
  const days = base.days + lines.reduce((s, l) => s + l.days, 0);
  return { base, lines, price, days };
}

const pick = <T extends string>(list: readonly T[], v: string | null): T | undefined =>
  v && (list as readonly string[]).includes(v) ? (v as T) : undefined;

/** Serialise a configuration into a short, shareable query string. */
export function encodeConfig(c: Config): string {
  const p = new URLSearchParams();
  p.set("t", c.sector);
  p.set("p", c.pkg);
  p.set("s", c.style);
  p.set("c", c.color);
  p.set("f", c.features.join("."));
  if (c.name.trim()) p.set("n", c.name.trim().slice(0, 40));
  return p.toString();
}

export function decodeConfig(search: string): Partial<Config> {
  const p = new URLSearchParams(search);
  const out: Partial<Config> = {};
  const sector = pick(SECTORS, p.get("t"));
  const pkg = pick(PACKAGES, p.get("p"));
  const style = pick(STYLES, p.get("s"));
  const color = pick(COLORS, p.get("c"));
  if (sector) out.sector = sector;
  if (pkg) out.pkg = pkg;
  if (style) out.style = style;
  if (color) out.color = color;
  const f = p.get("f");
  if (f !== null) out.features = f.split(".").filter((x): x is Feature => (FEATURES as readonly string[]).includes(x));
  const n = p.get("n");
  if (n) out.name = n.slice(0, 40);
  return out;
}

/** Stable short order number derived from the configuration (same config, same number). */
export function orderNumber(c: Config): string {
  const s = encodeConfig(c);
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return "SF-" + ((h >>> 0) % 100000).toString().padStart(5, "0");
}
