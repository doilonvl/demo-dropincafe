import { mapProductDtoToView } from "@/lib/product-mapper";
import type { Locale, Product, ProductDto } from "@/types/content";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export const HOME_REVALIDATE_SECONDS = 300;

async function fetchJson<T>(path: string, locale: Locale) {
  const hasQuery = path.includes("?");
  const url = `${BASE_URL}${path}${hasQuery ? "&" : "?"}locale=${locale}`;

  const res = await fetch(url, {
    // Cache/ISR like the Hasake setup
    next: { revalidate: HOME_REVALIDATE_SECONDS },
  });

  if (res.status === 404) {
    // Treat 404 as "no data" instead of hard error to keep page rendering
    return null as T;
  }

  if (!res.ok) {
    throw new Error(`Failed to fetch ${path}: ${res.status}`);
  }

  return (await res.json()) as T;
}

export async function fetchSignatureLineup(
  locale: Locale,
  limit = 6
): Promise<Product[]> {
  const data = await fetchJson<{ items: ProductDto[] } | null>(
    `/products?isSignatureLineup=true&limit=${limit}&withCount=false`,
    locale
  );
  if (!data?.items) return [];
  return (data.items || []).map((dto) => mapProductDtoToView(dto, locale));
}

export async function fetchBestSellers(
  locale: Locale,
  limit = 4
): Promise<Product[]> {
  const data = await fetchJson<{ items: ProductDto[] } | null>(
    `/products?isBestSeller=true&limit=${limit}&withCount=false`,
    locale
  );
  if (!data?.items) return [];
  return (data.items || []).map((dto) => mapProductDtoToView(dto, locale));
}
