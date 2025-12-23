import { getApiBaseUrl, getSiteUrl } from "@/lib/env";
import { getProductDetailPath, getProductsListingPath } from "@/lib/routes";
import type { Locale, Paged, ProductDto } from "@/types/content";

function xmlEscape(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

type SitemapUrl = {
  loc: string;
  lastmod: string;
  changefreq: "daily" | "weekly" | "monthly" | "yearly";
  priority: number;
};

function toUrlEntry({ loc, lastmod, changefreq, priority }: SitemapUrl) {
  return (
    "  <url>\n" +
    `    <loc>${xmlEscape(loc)}</loc>\n` +
    `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` +
    `    <changefreq>${changefreq}</changefreq>\n` +
    `    <priority>${priority.toFixed(1)}</priority>\n` +
    "  </url>"
  );
}

async function fetchProductSlugs(locale: Locale) {
  const base = getApiBaseUrl();
  const limit = 200;
  const slugs: Array<{ slug: string; updatedAt?: string }> = [];
  let page = 1;

  while (page <= 50) {
    const url = new URL(`${base}/products`);
    url.searchParams.set("locale", locale);
    url.searchParams.set("page", String(page));
    url.searchParams.set("limit", String(limit));
    url.searchParams.set("withCount", "true");
    url.searchParams.set("isPublished", "true");

    const res = await fetch(url.toString(), {
      next: { revalidate: 3600 },
    });

    if (!res.ok) break;
    const data = (await res.json()) as Paged<ProductDto>;
    if (!data?.items?.length) break;

    for (const item of data.items) {
      if (!item?.slug) continue;
      if (item.isPublished === false) continue;
      slugs.push({ slug: item.slug, updatedAt: item.updatedAt });
    }

    if (data.total && slugs.length >= data.total) break;
    if (data.items.length < limit) break;
    page += 1;
  }

  return slugs;
}

export async function GET() {
  const base = getSiteUrl();

  const now = new Date().toISOString();
  const staticUrls: SitemapUrl[] = [
    {
      loc: `${base}/`,
      lastmod: now,
      changefreq: "weekly",
      priority: 1.0,
    },
    {
      loc: `${base}/en`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.9,
    },
    {
      loc: `${base}${getProductsListingPath("vi")}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${base}${getProductsListingPath("en")}`,
      lastmod: now,
      changefreq: "weekly",
      priority: 0.8,
    },
    {
      loc: `${base}/privacy-policy`,
      lastmod: now,
      changefreq: "yearly",
      priority: 0.3,
    },
    {
      loc: `${base}/en/privacy-policy`,
      lastmod: now,
      changefreq: "yearly",
      priority: 0.3,
    },
  ];

  const [viProducts, enProducts] = await Promise.all([
    fetchProductSlugs("vi"),
    fetchProductSlugs("en"),
  ]);

  const productUrls: SitemapUrl[] = [
    ...viProducts.map((item) => ({
      loc: `${base}${getProductDetailPath("vi", item.slug)}`,
      lastmod: item.updatedAt || now,
      changefreq: "weekly" as const,
      priority: 0.6,
    })),
    ...enProducts.map((item) => ({
      loc: `${base}${getProductDetailPath("en", item.slug)}`,
      lastmod: item.updatedAt || now,
      changefreq: "weekly" as const,
      priority: 0.6,
    })),
  ];

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    [...staticUrls, ...productUrls].map(toUrlEntry).join("\n") +
    "\n</urlset>\n";

  return new Response(body, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}
