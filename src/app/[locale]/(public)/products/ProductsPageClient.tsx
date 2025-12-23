/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import { useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import { useLocale } from "next-intl";
import { useSearchParams, useRouter } from "next/navigation";
import { useGetProductsQuery, useGetProductBySlugQuery } from "@/services/api";
import type {
  Product as ApiProduct,
  Locale,
  ProductCategory,
} from "@/types/content";
import { getSiteUrl } from "@/lib/env";
import { getProductsListingPath } from "@/lib/routes";

type Category = "all" | ProductCategory;

interface ProductCardData {
  id: string;
  name: string;
  description: string;
  image: string;
  category: ProductCategory;
  price?: number;
  slug: string;
  badge?: string;
}

// Đã sửa lỗi hiển thị tiếng Việt
const CATEGORY_LABELS: Record<ProductCategory, { vi: string; en: string }> = {
  coffee: { vi: "Cà phê", en: "Coffee" },
  espresso: { vi: "Espresso", en: "Espresso" },
  "cold brew": { vi: "Cold brew", en: "Cold brew" },
  chocolate: { vi: "Chocolate", en: "Chocolate" },
  matcha: { vi: "Matcha", en: "Matcha" },
  tea: { vi: "Trà", en: "Tea" },
  "green teas": { vi: "Trà xanh", en: "Green teas" },
  "other teas": { vi: "Trà khác", en: "Other teas" },
  "other drinks": { vi: "Đồ uống khác", en: "Other drinks" },
  cake: { vi: "Bánh & dessert", en: "Cake & dessert" },
  other: { vi: "Khác", en: "Other" },
};

const CATEGORY_ORDER: ProductCategory[] = [
  "coffee",
  "espresso",
  "cold brew",
  "matcha",
  "tea",
  "green teas",
  "other teas",
  "chocolate",
  "cake",
  "other drinks",
  "other",
];

// Đã sửa lỗi hiển thị tiếng Việt
const COPY: Record<
  Locale,
  {
    bannerEyebrow: string;
    bannerTitle: string;
    bannerDescription: string;
    sectionEyebrow: string;
    sectionTitle: string;
    sectionDescription: string;
    loadMore: string;
    showLess: string;
    loading: string;
    emptyCategory: string;
    update: string;
    error: string;
  }
> = {
  vi: {
    bannerEyebrow: "Drop In Cafe",
    bannerTitle: "Menu thức uống",
    bannerDescription:
      "Ngồi bên đường tàu Hà Nội, nhâm nhi cà phê, trà hoặc món signature hợp mood tại Drop In Cafe.",
    sectionEyebrow: "Our menu",
    sectionTitle: "Tất cả thức uống",
    sectionDescription:
      "Dù bạn ghé vội mang đi hay ngồi lại làm việc, Drop In Cafe luôn có một ly dành cho bạn: cà phê phin, espresso, cold brew, trà trái cây và các món không cà phê nhẹ nhàng.",
    loadMore: "Xem thêm",
    showLess: "Thu gọn",
    loading: "Đang tải menu...",
    emptyCategory:
      "Hiện chưa có thức uống nào trong nhóm này. Vui lòng chọn danh mục khác.",
    update: "Đang cập nhật danh sách...",
    error: "Không thể tải danh sách sản phẩm. Vui lòng thử lại sau.",
  },
  en: {
    bannerEyebrow: "Drop In Cafe",
    bannerTitle: "Drink menu",
    bannerDescription:
      "Sip coffee or tea right by the Hanoi Train Street and pick a signature drink that fits your mood at Drop In Cafe.",
    sectionEyebrow: "Our menu",
    sectionTitle: "All drinks",
    sectionDescription:
      "Whether you grab-and-go or stay to work, we have a cup for you: phin coffee, espresso, cold brew, fruit teas, and gentle non-coffee options.",
    loadMore: "Load more",
    showLess: "Show less",
    loading: "Loading menu...",
    emptyCategory:
      "No drinks in this category yet. Please choose another category.",
    update: "Refreshing list...",
    error: "Unable to load products. Please try again later.",
  },
};

const BASE_URL = getSiteUrl();

function mapApiProductsToCardData(
  apiProducts: ApiProduct[]
): ProductCardData[] {
  const fallback = "/Product/product1.jpg";
  return apiProducts.map((p) => ({
    id: p._id,
    name: p.name,
    description: p.shortDescription || p.description || "",
    image:
      p.image?.url && !p.image.url.includes("/demo/") ? p.image.url : fallback,
    category: p.category || "other",
    price: p.price,
    badge: p.isBestSeller
      ? "Best seller"
      : p.isSignatureLineup
      ? "Signature"
      : undefined,
    slug: p.slug?.toLowerCase(),
  }));
}

function mapViewProductToCardData(p: ApiProduct): ProductCardData {
  const fallback = "/Product/product1.jpg";
  return {
    id: p._id,
    name: p.name,
    description: p.shortDescription || p.description || "",
    image: p.image?.url || fallback,
    category: p.category || "other",
    price: p.price,
    slug: p.slug?.toLowerCase() || "",
    badge: p.isBestSeller
      ? "Best seller"
      : p.isSignatureLineup
      ? "Signature"
      : undefined,
  };
}

export default function ProductsPageClient({
  initialSlug,
}: {
  initialSlug?: string;
}) {
  const locale = useLocale() as Locale;
  const searchParams = useSearchParams();
  const router = useRouter();
  const copy = COPY[locale] ?? COPY.vi;
  const baseUrl = BASE_URL;
  const localePath = locale === "en" ? "en" : "vi";
  const listingPath = getProductsListingPath(locale);
  const pageUrl = `${baseUrl}${listingPath}`;
  const productSeoJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CollectionPage",
        name: copy.bannerTitle,
        url: pageUrl,
        inLanguage: localePath,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Drop In Cafe",
            item: `${baseUrl}/${localePath}`,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Drop In Cafe - Menu", // Cập nhật tên rõ hơn cho SEO
            item: pageUrl,
          },
        ],
      },
    ],
  };
  const gridRef = useRef<HTMLDivElement | null>(null);

  const initialSlugFilter =
    initialSlug?.toLowerCase().trim() ||
    searchParams?.get("slug")?.toLowerCase().trim() ||
    "";
  const [slugFilter, setSlugFilter] = useState(initialSlugFilter);
  const [category, setCategory] = useState<Category>("all");
  const INITIAL_VISIBLE = 8;
  const LOAD_STEP = 8;
  const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE);

  const { data, isLoading, isError, error, isFetching } = useGetProductsQuery(
    {
      locale,
      limit: 40,
      withCount: false,
    },
    { refetchOnMountOrArgChange: false }
  );

  const {
    data: slugProduct,
    isFetching: slugFetching,
    isError: slugError,
  } = useGetProductBySlugQuery(
    { locale, slug: slugFilter },
    { skip: !slugFilter }
  );

  // Cache per-locale products so switching locale shows instantly if already fetched
  const cachedProducts = useRef<Partial<Record<Locale, ProductCardData[]>>>({});

  const mappedProducts = useMemo(
    () =>
      data?.items ? mapApiProductsToCardData(data.items as ApiProduct[]) : [],
    [data]
  );

  useEffect(() => {
    if (mappedProducts.length > 0) {
      cachedProducts.current[locale] = mappedProducts;
    }
  }, [mappedProducts, locale]);

  const products =
    mappedProducts.length > 0
      ? mappedProducts
      : cachedProducts.current[locale] || [];

  const availableCategories = useMemo(() => {
    const set = new Set<ProductCategory>();
    products.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set).sort((a, b) => {
      const ai = CATEGORY_ORDER.indexOf(a);
      const bi = CATEGORY_ORDER.indexOf(b);
      return (ai === -1 ? 999 : ai) - (bi === -1 ? 999 : bi);
    });
  }, [products]);

  useEffect(() => {
    if (category !== "all" && !availableCategories.includes(category)) {
      setCategory("all");
    }
  }, [availableCategories, category]);

  const filterOptions = useMemo(() => {
    const options = availableCategories.map((c) => ({
      id: c as ProductCategory,
      label: CATEGORY_LABELS[c] || { vi: c, en: c },
    }));
    return [
      { id: "all" as Category, label: { vi: "Tất cả", en: "All" } },
      ...options,
    ];
  }, [availableCategories]);

  const filteredProducts = useMemo(() => {
    if (slugFilter) {
      if (slugProduct)
        return [mapViewProductToCardData(slugProduct as ApiProduct)];
      return [];
    }

    let result = products;

    if (category !== "all") {
      result = result.filter((p) => p.category === category);
    }

    return result;
  }, [products, category, slugFilter, slugProduct]);

  // Reset visible count on category change
  useEffect(() => {
    setVisibleCount(INITIAL_VISIBLE);
  }, [category]);

  // Sync slug filter from URL (?slug=...), e.g. click from Best Sellers
  useEffect(() => {
    if (initialSlug) {
      setSlugFilter(initialSlug.toLowerCase().trim());
      setCategory("all");
      setVisibleCount(INITIAL_VISIBLE);
      return;
    }

    const nextSlug = searchParams?.get("slug")?.toLowerCase().trim() || "";
    setSlugFilter(nextSlug);
    setCategory("all");
    setVisibleCount(INITIAL_VISIBLE);
  }, [initialSlug, searchParams]);

  useEffect(() => {
    if (filteredProducts.length === 0) {
      setVisibleCount(0);
      return;
    }
    const target = Math.min(INITIAL_VISIBLE, filteredProducts.length);
    if (visibleCount === 0 || visibleCount > filteredProducts.length) {
      setVisibleCount(target);
    }
  }, [filteredProducts, visibleCount]);

  const visibleProducts = filteredProducts.slice(0, visibleCount);
  const hasMore = filteredProducts.length > visibleCount;
  const showingAll =
    filteredProducts.length > INITIAL_VISIBLE && !hasMore && visibleCount > 0;

  function clearSlugFilter() {
    if (!slugFilter) return;
    setSlugFilter("");
    router.replace(listingPath, { scroll: false });
    setVisibleCount(INITIAL_VISIBLE);
  }

  function handleCategoryChange(value: Category) {
    // Khi đổi category, bỏ lọc slug để filter hoạt động như bình thường
    if (slugFilter) {
      clearSlugFilter();
    }
    setCategory(value);
  }

  const handleLoadMore = () => {
    setVisibleCount((c) => Math.min(c + LOAD_STEP, filteredProducts.length));
  };

  const handleShowLess = () => {
    setVisibleCount(Math.min(INITIAL_VISIBLE, filteredProducts.length));
    if (gridRef.current) {
      gridRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <section>
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-6 lg:px-8">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(productSeoJsonLd) }}
        />
        {/* Banner */}
        <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-neutral-900/80 shadow-xl md:h-72 lg:h-80">
          <Image
            src="/PShowcase/8.jpg"
            alt="Drop In Cafe drinks banner"
            fill
            sizes="(min-width:1280px) 1100px, (min-width:1024px) 1000px, (min-width:768px) 90vw, 100vw"
            className="object-cover"
            priority
          />
          <div className="relative flex h-full w-full items-center bg-linear-to-r from-black/60 via-black/25 to-transparent px-6 md:px-10 lg:px-12">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 md:text-sm">
                {copy.bannerEyebrow}
              </p>
              <h1 className="mt-2 text-2xl font-semibold text-neutral-50 md:text-3xl lg:text-4xl">
                {copy.bannerTitle}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-neutral-100/85 md:text-base">
                {copy.bannerDescription}
              </p>
            </div>
          </div>
        </div>

        {/* Heading + mô tả */}
        <div className="mt-8 md:mt-10">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 md:text-sm">
            {copy.sectionEyebrow}
          </p>
          <h2 className="mt-2 text-2xl font-semibold text-neutral-900 md:text-3xl lg:text-4xl">
            {copy.sectionTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
            {copy.sectionDescription}
          </p>
        </div>

        {/* Filter tabs */}
        <ProductFilters
          category={category}
          onChange={handleCategoryChange}
          locale={locale}
          options={filterOptions}
        />

        {/* Grid sản phẩm */}
        <div className="mt-8 md:mt-10" ref={gridRef}>
          {isLoading && products.length === 0 && (
            <p className="text-sm text-neutral-500">{copy.loading}</p>
          )}

          {isError && products.length === 0 && (
            <div className="text-sm text-red-500 space-y-1">
              <p>{copy.error}</p>
              <pre className="mt-2 overflow-auto rounded bg-red-50 p-2 text-xs text-red-700">
                {JSON.stringify(error, null, 2)}
              </pre>
            </div>
          )}

          {products.length > 0 && (
            <>
              {filteredProducts.length === 0 ? (
                <p className="text-sm text-neutral-500">{copy.emptyCategory}</p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-3 md:gap-4 lg:grid-cols-4">
                  {visibleProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      locale={locale}
                    />
                  ))}
                </div>
              )}
            </>
          )}

          {isFetching && products.length > 0 && (
            <p className="mt-3 text-xs text-neutral-500">{copy.update}</p>
          )}

          {(hasMore || showingAll) && filteredProducts.length > 0 && (
            <div className="mt-8 flex justify-center">
              {hasMore ? (
                <button
                  type="button"
                  onClick={handleLoadMore}
                  className="cursor-pointer rounded-full border border-neutral-900 bg-neutral-900 px-5 py-2 text-sm font-semibold text-neutral-50 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  {copy.loadMore}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleShowLess}
                  className="cursor-pointer rounded-full border border-neutral-200 bg-white px-5 py-2 text-sm font-semibold text-neutral-800 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-neutral-900"
                >
                  {copy.showLess}
                </button>
              )}
            </div>
          )}
        </div>
      </main>
    </section>
  );
}

function ProductFilters({
  category,
  onChange,
  locale,
  options,
}: {
  category: Category;
  onChange: (value: Category) => void;
  locale: Locale;
  options: { id: Category; label: { vi: string; en: string } }[];
}) {
  return (
    <div id="allProduct-filters" className="mt-6 flex flex-wrap gap-3 md:mt-8">
      {options.map((cat) => {
        const isActive = category === cat.id;
        const label = cat.label[locale] ?? cat.label.vi;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={
              "rounded-full cursor-pointer border px-4 py-2 text-xs font-medium transition-colors md:text-sm " +
              (isActive
                ? "border-neutral-900 bg-neutral-900 text-neutral-50 shadow-sm"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900")
            }
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

function formatPrice(price: number | undefined, locale: Locale) {
  if (price == null) return "";
  const value = price * 1000; // Giá đang lưu đơn vị nghìn, hiển thị đủ VND
  try {
    return new Intl.NumberFormat(locale === "en" ? "en-US" : "vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    // Đã sửa ký hiệu tiền tệ từ lỗi font sang 'đ'
    return `${value.toLocaleString(locale === "en" ? "en-US" : "vi-VN")} đ`;
  }
}

function ProductCard({
  product,
  locale,
}: {
  product: ProductCardData;
  locale: Locale;
}) {
  const [errored, setErrored] = useState(false);
  const imgSrc =
    !errored && product.image ? product.image : "/Product/product1.jpg";

  return (
    <article className="group relative overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-neutral-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative w-full cursor-pointer h-72 sm:h-72 md:h-60 lg:h-64 overflow-hidden rounded-xl">
        {/* Ảnh sản phẩm */}
        <Image
          src={imgSrc}
          alt={product.name}
          fill
          sizes="(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          loading="eager"
          onError={() => setErrored(true)}
        />

        {/* Panel thông tin xuất hiện khi hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-white/65 px-4 py-3 md:px-5 md:py-4 border-t border-neutral-200/80">
            <div className="flex items-start justify-between gap-2">
              <h3 className="text-sm font-semibold text-neutral-900 md:text-base">
                {product.name}
              </h3>
              {product.price != null && (
                <span className="text-sm font-semibold text-neutral-900 md:text-base whitespace-nowrap">
                  {formatPrice(product.price, locale)}
                </span>
              )}
            </div>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600 md:text-sm line-clamp-3">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
