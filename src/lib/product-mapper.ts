import type {
  Locale,
  LocalizedString,
  Product,
  ProductDto,
  ProductStat,
} from "@/types/content";

export function pickLocalized(
  value: LocalizedString | undefined,
  locale: Locale,
  fallback = ""
): string {
  if (!value) return fallback;
  if (locale === "en") {
    return value.en || value.vi || fallback;
  }
  return value.vi || value.en || fallback;
}

export function mapProductDtoToView(dto: ProductDto, locale: Locale): Product {
  const name = pickLocalized(dto.name_i18n, locale);
  const shortDescription = pickLocalized(dto.shortDescription_i18n, locale);
  const description = pickLocalized(dto.description_i18n, locale);

  const imageAlt =
    dto.image?.alt_i18n &&
    pickLocalized(dto.image.alt_i18n, locale, name || "Product image");

  const metaTitle =
    dto.metaTitle ||
    name ||
    (locale === "vi" ? "Sản phẩm tại Drop In Cafe" : "Drop In Cafe product");

  const metaDescription =
    dto.metaDescription ||
    shortDescription ||
    description ||
    (locale === "vi"
      ? "Thức uống và món ăn tại Drop In Cafe."
      : "Drinks and food at Drop In Cafe.");

  const stats: ProductStat[] = (dto.bestSellerStats || []).map((s) => ({
    label: pickLocalized(s.label, locale),
    value: s.value,
  }));

  return {
    _id: dto._id,
    slug: dto.slug,

    name,
    shortDescription: shortDescription || undefined,
    description: description || undefined,

    category: dto.category,
    tags: dto.tags || [],

    price: dto.price,
    temperatureOptions: dto.temperatureOptions || [],

    image: dto.image
      ? {
          url: dto.image.url,
          alt: imageAlt,
        }
      : undefined,

    isBestSeller: dto.isBestSeller,
    bestSellerOrder: dto.bestSellerOrder,
    bestSellerStats: stats,

    isSignatureLineup: dto.isSignatureLineup,
    signatureOrder: dto.signatureOrder,

    isPublished: dto.isPublished,

    createdAt: dto.createdAt,
    updatedAt: dto.updatedAt,

    metaTitle,
    metaDescription,
  };
}
