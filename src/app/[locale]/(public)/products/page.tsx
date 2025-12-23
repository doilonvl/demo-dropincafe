import type { Metadata } from "next";
import { redirect } from "next/navigation";
import type { Locale, Paged, Product, ProductDto } from "@/types/content";
import { getApiBaseUrl, getSiteUrl } from "@/lib/env";
import { mapProductDtoToView } from "@/lib/product-mapper";
import { getProductDetailPath, getProductsListingPath } from "@/lib/routes";
import ProductsPageClient from "./ProductsPageClient";

const BASE_URL = getSiteUrl();
const DEFAULT_OG_IMAGE = "https://www.dropincafe.com.vn/Home/home3.jpg";

const LISTING_META = {
  vi: {
    title: "Menu thức uống Drop In Cafe – cà phê, trà & đồ uống signature",
    description:
      "Khám phá menu Drop In Cafe: cà phê phin, espresso, cold brew, trà trái cây, matcha, sinh tố và line-up đồ uống signature phục vụ cả ngày bên đường tàu Hà Nội.",
  },
  en: {
    title: "Drop In Cafe drinks menu – coffee, tea & signature drinks",
    description:
      "Explore Drop In Cafe’s drinks menu: phin coffee, espresso, cold brew, fruit teas, matcha, smoothies and a signature lineup served all day by Hanoi Train Street.",
  },
} as const;

type PageParams = {
  params: Promise<{ locale: Locale }>;
  searchParams?: Promise<{ slug?: string | string[] }>;
};

async function fetchProducts(locale: Locale): Promise<Product[]> {
  const baseUrl = getApiBaseUrl();
  const url = new URL(`${baseUrl}/products`);
  url.searchParams.set("locale", locale);
  url.searchParams.set("page", "1");
  url.searchParams.set("limit", "40");
  url.searchParams.set("withCount", "false");
  url.searchParams.set("isPublished", "true");

  try {
    const res = await fetch(url.toString(), {
      next: { revalidate: 300 },
    });
    if (!res.ok) return [];
    const data = (await res.json()) as Paged<ProductDto>;
    return data.items?.map((item) => mapProductDtoToView(item, locale)) ?? [];
  } catch (err) {
    console.error("FETCH_PRODUCTS_FAILED", err);
    return [];
  }
}

function buildListingMetadata(locale: Locale): Metadata {
  const meta = LISTING_META[locale === "en" ? "en" : "vi"];
  const canonicalPath = getProductsListingPath(locale);
  const canonical = `${BASE_URL}${canonicalPath}`;

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}${getProductsListingPath("vi")}`,
        en: `${BASE_URL}${getProductsListingPath("en")}`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

export async function generateMetadata({
  params,
}: PageParams): Promise<Metadata> {
  const { locale } = await params;
  return buildListingMetadata(locale);
}

export default async function ProductsPage({
  params,
  searchParams,
}: PageParams) {
  const { locale } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const slugParam = resolvedSearchParams?.slug;
  const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
  const normalizedSlug = slug?.trim();

  if (normalizedSlug) {
    redirect(getProductDetailPath(locale, normalizedSlug));
  }

  const products = await fetchProducts(locale);
  return <ProductsPageClient initialProducts={products} />;
}
