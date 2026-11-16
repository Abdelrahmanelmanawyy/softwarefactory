// Everything the configurator sells, in one place: sectors, packages, add-ons,
// their prices and delivery times. Edit numbers here and the whole site follows.

/** WhatsApp number in international format, digits only (no +, no spaces). */
export const WHATSAPP_NUMBER = "905000000000"; // TODO: replace with the real business number

/**
 * Where e-mail orders go.
 * - WEB3FORMS_KEY set  -> the order is sent straight to your inbox from the page (free key from web3forms.com,
 *   it is safe to keep in public code: it can only deliver to the address you registered).
 * - only ORDER_EMAIL set -> the customer's mail app opens with the order already written.
 */
export const WEB3FORMS_KEY = ""; // TODO: paste your Web3Forms access key
export const ORDER_EMAIL = ""; // TODO: e.g. orders@yourdomain.com

export const SECTORS = ["restaurant", "gym", "clinic", "auto", "store", "startup"] as const;
export type Sector = (typeof SECTORS)[number];

export const PACKAGES = ["landing", "website", "mvp"] as const;
export type Pkg = (typeof PACKAGES)[number];

export const STYLES = ["modern", "minimal", "bold"] as const;
export type Style = (typeof STYLES)[number];

export const COLORS = ["auto", "sage", "ocean", "ember", "rose", "gold", "mono"] as const;
export type Color = (typeof COLORS)[number];

export const FEATURES = ["catalog", "booking", "whatsapp", "payments", "admin", "app", "lang"] as const;
export type Feature = (typeof FEATURES)[number];

/** Does the customer already have a design? "none" means we also design the logo and brand. */
export const DESIGNS = ["ready", "logo", "none"] as const;
export type Design = (typeof DESIGNS)[number];

export const SPEEDS = ["standard", "express"] as const;
export type Speed = (typeof SPEEDS)[number];

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

export const DESIGN_INFO: Record<Design, { price: number; days: number }> = {
  ready: { price: 0, days: 0 },
  logo: { price: 0, days: 0 },
  none: { price: 20, days: 1 },
};

/** Express = rush queue: +30% of the total, and the delivery time is cut by 40%. */
export const EXPRESS = { surcharge: 0.3, daysFactor: 0.6 };

/** Look of each sample business (used by the swatches, the hero chips and the templates). */
export const SECTOR_THEME: Record<
  Sector,
  { bg: string; surface: string; ink: string; accent: string; dark: boolean }
> = {
  restaurant: { bg: "#F6EEE3", surface: "#FFF9F1", ink: "#2A1A12", accent: "#B4532A", dark: false },
  gym: { bg: "#0E0E0E", surface: "#1A1A1A", ink: "#F3F3EE", accent: "#D4FF3A", dark: true },
  clinic: { bg: "#EEF5F6", surface: "#FFFFFF", ink: "#0F2B33", accent: "#1F9C8E", dark: false },
  auto: { bg: "#121519", surface: "#1C2127", ink: "#E8ECF1", accent: "#FF6A2B", dark: true },
  store: { bg: "#FAF6F2", surface: "#FFFFFF", ink: "#1E1B18", accent: "#C2185B", dark: false },
  startup: { bg: "#0C0E1A", surface: "#151830", ink: "#EDEFFF", accent: "#7C6CFF", dark: true },
};

export const COLOR_HEX: Record<Exclude<Color, "auto" | "mono">, string> = {
  sage: "#7FA37A",
  ocean: "#2F6FEB",
  ember: "#FF5A1F",
  rose: "#E0457B",
  gold: "#D9A441",
};

export function accentFor(sector: Sector, color: Color): string {
  const theme = SECTOR_THEME[sector];
  if (color === "auto") return theme.accent;
  if (color === "mono") return theme.dark ? "#F3F3EE" : "#1A1A1A";
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
  design: Design;
  speed: Speed;
};

export const DEFAULT_CONFIG: Config = {
  sector: "restaurant",
  pkg: "website",
  style: "modern",
  color: "auto",
  features: ["catalog", "booking", "whatsapp"],
  name: "",
  design: "logo",
  speed: "standard",
};

export type QuoteLine = { id: string; kind: "feature" | "design" | "speed"; key: string; price: number; days: number };

export function quote(c: Config) {
  const base = PACKAGE_INFO[c.pkg];
  const lines: QuoteLine[] = c.features.map((f) => ({ id: `f-${f}`, kind: "feature", key: f, ...FEATURE_INFO[f] }));
  const design = DESIGN_INFO[c.design];
  if (design.price || design.days) lines.push({ id: "design", kind: "design", key: c.design, ...design });

  const sub = base.price + lines.reduce((s, l) => s + l.price, 0);
  const subDays = base.days + lines.reduce((s, l) => s + l.days, 0);

  let rush = 0;
  let days = subDays;
  if (c.speed === "express") {
    rush = Math.round(sub * EXPRESS.surcharge);
    days = Math.max(1, Math.ceil(subDays * EXPRESS.daysFactor));
    lines.push({ id: "speed", kind: "speed", key: "express", price: rush, days: days - subDays });
  }
  return { base, lines, price: sub + rush, days };
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
  p.set("d", c.design);
  p.set("v", c.speed);
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
  const design = pick(DESIGNS, p.get("d"));
  const speed = pick(SPEEDS, p.get("v"));
  if (sector) out.sector = sector;
  if (pkg) out.pkg = pkg;
  if (style) out.style = style;
  if (color) out.color = color;
  if (design) out.design = design;
  if (speed) out.speed = speed;
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
