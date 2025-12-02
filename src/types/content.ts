export type Locale = "vi" | "en";

export type LocalizedString = {
  vi?: string;
  en?: string;
};

export type ProductCategory =
  | "coffee"
  | "tea"
  | "cake"
  | "other"
  | "other drinks"
  | "espresso"
  | "cold brew"
  | "chocolate"
  | "green teas"
  | "other teas"
  | "matcha";

export type TemperatureOption = "hot" | "iced";

export interface Image {
  url: string;
  alt?: string;
}

export interface ProductStat {
  label: string;
  value: number;
}

export interface ProductStatDto {
  label: LocalizedString;
  value: number;
}

export interface ImageDto {
  url: string;
  alt_i18n?: LocalizedString;
}

export interface ProductDto {
  _id: string;

  name_i18n: LocalizedString;
  shortDescription_i18n?: LocalizedString;
  description_i18n?: LocalizedString;

  category?: ProductCategory;
  tags?: string[];

  price?: number;
  temperatureOptions?: TemperatureOption[];

  image?: ImageDto;

  isBestSeller: boolean;
  bestSellerOrder?: number;
  bestSellerStats?: ProductStatDto[];

  isSignatureLineup: boolean;
  signatureOrder?: number;

  isPublished: boolean;

  slug: string;

  createdAt: string;
  updatedAt: string;
  __v?: number;

  metaTitle?: string;
  metaDescription?: string;
}

export interface Product {
  _id: string;
  slug: string;

  name: string;
  shortDescription?: string;
  description?: string;

  category?: ProductCategory;
  tags: string[];

  price?: number;
  temperatureOptions: TemperatureOption[];

  image?: Image;

  isBestSeller: boolean;
  bestSellerOrder?: number;
  bestSellerStats: ProductStat[];

  isSignatureLineup: boolean;
  signatureOrder?: number;

  isPublished: boolean;

  createdAt: string;
  updatedAt: string;

  metaTitle: string;
  metaDescription: string;
}

export interface HomeHeroSlide {
  product?: string;
  title?: string;
  subtitle?: string;
  description?: string;
  image?: Image;
  order: number;
  isActive: boolean;
}

export interface CounterItem {
  label: string;
  value: string;
}

export interface StorySection {
  title?: string;
  headline?: string;
  paragraphs?: string[];
  image?: Image;
}

export interface SignatureSection {
  title: string;
  subtitle?: string;
  body?: string;
  backgroundImage?: Image;
}

export interface HomeContent {
  pageKey: "home";

  heroTitle: string;
  heroSubtitle?: string;
  heroBody?: string[];
  heroBackgroundImage?: Image;

  heroSlides: HomeHeroSlide[];

  counters: CounterItem[];

  storySection?: StorySection;

  signatureSection: SignatureSection;

  seoTitle?: string;
  seoDescription?: string;
  seoImageUrl?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}
