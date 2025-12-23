import type { Metadata } from "next";
import type {
  Locale,
  LocalizedString,
  Product,
  ProductDto,
} from "@/types/content";
import { mapProductDtoToView, pickLocalized } from "@/lib/product-mapper";
import { getApiBaseUrl, getSiteUrl } from "@/lib/env";
import { getProductDetailPath, getProductsListingPath } from "@/lib/routes";
import ProductsPageClient from "../ProductsPageClient";

const BASE_URL = getSiteUrl();
const API_BASE_URL = getApiBaseUrl();
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

const PRODUCT_FALLBACK_TITLE = {
  vi: "Thức uống Drop In Cafe",
  en: "Drop In Cafe drink",
} as const;

const PRODUCT_SUFFIX = {
  vi: "Thưởng thức tại Drop In Cafe, 163 Phùng Hưng, phố đường tàu Hà Nội hoặc gọi mang đi đúng giờ bạn cần.",
  en: "Enjoy it at Drop In Cafe, 163 Phung Hung by Hanoi Train Street, or order it for pickup at your time.",
} as const;

type PageParams = {
  params: Promise<{ locale: Locale; slug: string }>;
};

type ProductSeoDto = ProductDto & {
  seoTitle_i18n?: LocalizedString;
  seoDescription_i18n?: LocalizedString;
};

function resolveImageUrl(imageUrl: string | undefined) {
  if (!imageUrl) return DEFAULT_OG_IMAGE;
  if (imageUrl.startsWith("http://") || imageUrl.startsWith("https://")) {
    return imageUrl;
  }
  const normalized = imageUrl.startsWith("/") ? imageUrl : `/${imageUrl}`;
  return `${BASE_URL}${normalized}`;
}

function buildProductDescription(locale: Locale, base?: string) {
  const suffix = PRODUCT_SUFFIX[locale];
  const trimmed = base?.trim() ?? "";
  if (!trimmed) return suffix;
  if (trimmed.length < 80) return `${trimmed} ${suffix}`;
  return trimmed;
}

async function fetchProductBySlug(
  slug: string,
  locale: Locale
): Promise<ProductSeoDto | null> {
  const safeSlug = encodeURIComponent(slug);
  const url = `${API_BASE_URL}/products/${safeSlug}?locale=${locale}`;

  const res = await fetch(url, {
    next: { revalidate: 300 },
  });

  if (res.status === 404) return null;
  if (!res.ok) return null;

  return (await res.json()) as ProductSeoDto;
}

async function fetchProductViewBySlug(
  slug: string,
  locale: Locale
): Promise<Product | null> {
  const dto = await fetchProductBySlug(slug, locale);
  if (!dto) return null;
  return mapProductDtoToView(dto, locale);
}

function buildListingMetadata(locale: Locale): Metadata {
  const meta = LISTING_META[locale === "en" ? "en" : "vi"];
  const canonical = `${BASE_URL}${getProductsListingPath(locale)}`;

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
  const { locale, slug } = await params;
  const normalizedSlug = slug?.trim();

  if (!normalizedSlug) {
    return buildListingMetadata(locale);
  }

  const product = await fetchProductBySlug(normalizedSlug, locale);
  if (!product) {
    return buildListingMetadata(locale);
  }

  const titleBase =
    pickLocalized(product.seoTitle_i18n, locale) ||
    pickLocalized(product.name_i18n, locale, PRODUCT_FALLBACK_TITLE[locale]);
  const descBase =
    pickLocalized(product.seoDescription_i18n, locale) ||
    pickLocalized(product.shortDescription_i18n, locale) ||
    pickLocalized(product.description_i18n, locale) ||
    product.metaDescription;
  const title =
    locale === "en"
      ? `${titleBase} – Drop In Cafe drinks menu`
      : `${titleBase} – Menu Drop In Cafe`;
  const description = buildProductDescription(locale, descBase);
  const imageUrl = resolveImageUrl(product.image?.url);
  const canonical = `${BASE_URL}${getProductDetailPath(
    locale,
    normalizedSlug
  )}`;

  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}${getProductDetailPath("vi", normalizedSlug)}`,
        en: `${BASE_URL}${getProductDetailPath("en", normalizedSlug)}`,
      },
    },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "website",
      images: [imageUrl],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({ params }: PageParams) {
  const { locale, slug } = await params;
  const normalizedSlug = slug?.trim() || "";
  const product = normalizedSlug
    ? await fetchProductViewBySlug(normalizedSlug, locale)
    : null;

  return (
    <ProductsPageClient
      initialSlug={normalizedSlug}
      initialProduct={product ?? undefined}
    />
  );
}
