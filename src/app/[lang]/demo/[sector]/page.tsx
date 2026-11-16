import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";
import { SECTORS, type Sector } from "@/lib/catalog";
import Demo from "@/components/Demo";

export const dynamicParams = false;

export function generateStaticParams() {
  return SECTORS.map((sector) => ({ sector }));
}

const isSector = (v: string): v is Sector => (SECTORS as readonly string[]).includes(v);

export async function generateMetadata({ params }: PageProps<"/[lang]/demo/[sector]">): Promise<Metadata> {
  const { lang, sector } = await params;
  if (!hasLocale(lang) || !isSector(sector)) return {};
  const dict = await getDictionary(lang);
  return {
    title: `${dict.tpl[sector].brand} · ${dict.demo.banner}`,
    description: dict.tpl[sector].sub,
    // Sample sites are sales material, not pages to rank.
    robots: { index: false },
  };
}

export default async function Page({ params }: PageProps<"/[lang]/demo/[sector]">) {
  const { lang, sector } = await params;
  if (!hasLocale(lang) || !isSector(sector)) notFound();
  const dict = await getDictionary(lang);
  return <Demo dict={dict} lang={lang} sector={sector} />;
}
