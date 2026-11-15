import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { Space_Grotesk, JetBrains_Mono, Fraunces, IBM_Plex_Sans_Arabic } from "next/font/google";
import { LOCALES, LOCALE_META, hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import "../globals.css";

const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin", "latin-ext"], display: "swap" });
const mono = JetBrains_Mono({ variable: "--font-mono", subsets: ["latin", "latin-ext"], display: "swap" });
const serif = Fraunces({ variable: "--font-serif", subsets: ["latin", "latin-ext"], display: "swap", preload: false });
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const dynamicParams = false;

export function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!hasLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: dict.meta.title,
    description: dict.meta.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(LOCALES.map((l) => [l, `/${l}`])),
    },
    openGraph: { title: dict.meta.title, description: dict.meta.description, locale: LOCALE_META[lang].intl },
  };
}

export const viewport: Viewport = {
  themeColor: "#0B1510",
};

// Runs before first paint: marks the document so the hero can start in its
// "blueprint" state instead of flashing the finished site first.
// If the app never boots (script blocked, error), drop back to the finished state.
const motionScript = `try{var d=document.documentElement;if(!matchMedia('(prefers-reduced-motion: reduce)').matches){d.classList.add('motion');setTimeout(function(){if(!d.classList.contains('anim-ready'))d.classList.remove('motion')},4000)}}catch(e){}`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  return (
    <html
      lang={lang}
      dir={LOCALE_META[lang].dir}
      className={`${display.variable} ${mono.variable} ${serif.variable} ${arabic.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: motionScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
