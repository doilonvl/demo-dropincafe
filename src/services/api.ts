/* eslint-disable @typescript-eslint/no-explicit-any */
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type {
  BaseQueryFn,
  FetchArgs,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query";
import type {
  Product,
  ProductDto,
  ProductCategory,
  Paged,
  HomeContent,
  Locale,
  LocalizedString,
  ProductStat,
  ProductStatDto,
  TemperatureOption,
} from "@/types/content";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

function pickLocalized(
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

function mapProductDtoToView(dto: ProductDto, locale: Locale): Product {
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

function getClientToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("access_token");
}

const rawBaseQuery = fetchBaseQuery({
  baseUrl: BASE_URL,
  credentials: "include",
  prepareHeaders: (headers) => {
    const token = getClientToken();
    if (token && !headers.has("authorization")) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    try {
      const refreshRes = await fetch("/api/auth/refresh", {
        method: "POST",
        credentials: "include",
      });

      if (refreshRes.ok) {
        const data = await refreshRes
          .json()
          .catch(() => ({ accessToken: null as string | null }));
        const newAccess =
          (data as any)?.accessToken ||
          (data as any)?.access_token ||
          (data as any)?.token;
        if (newAccess && typeof window !== "undefined") {
          localStorage.setItem("access_token", newAccess);
        }
        result = await rawBaseQuery(args, api, extraOptions);
      }
    } catch (err) {
      console.error("REFRESH_TOKEN_FAILED", err);
    }
  }

  return result;
};

// ---- API ----

export const api = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: ["Products", "Home"],
  endpoints: (builder) => ({
    // -------- HOME --------
    getHomeContent: builder.query<HomeContent, { locale: Locale }>({
      query: ({ locale }) => ({
        url: "/home",
        params: { locale },
      }),
      providesTags: ["Home"],
    }),

    // -------- PRODUCTS (PUBLIC) --------
    getProducts: builder.query<
      Paged<Product>,
      {
        locale: Locale;
        category?: ProductCategory;
        page?: number;
        limit?: number;
        q?: string;
        isBestSeller?: boolean;
        isSignatureLineup?: boolean;
      }
    >({
      query: ({ locale, ...params }) => ({
        url: "/products",
        params: {
          ...params,
          locale,
        },
      }),
      transformResponse: (response: Paged<ProductDto>, _meta, arg) => {
        const locale = arg.locale;
        return {
          ...response,
          items: response.items.map((dto) => mapProductDtoToView(dto, locale)),
        };
      },
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({
                type: "Products" as const,
                id: p._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    getBestSellers: builder.query<
      { items: Product[] },
      { locale: Locale; limit?: number; category?: ProductCategory }
    >({
      query: ({ locale, ...params }) => ({
        url: "/products/best-sellers",
        params: { ...params, locale },
      }),
      transformResponse: (response: { items: ProductDto[] }, _meta, arg) => {
        const locale = arg.locale;
        return {
          items: response.items.map((dto) => mapProductDtoToView(dto, locale)),
        };
      },
      providesTags: [{ type: "Products", id: "BEST_SELLERS" }],
    }),

    getSignatureLineup: builder.query<
      { items: Product[] },
      { locale: Locale; limit?: number; category?: ProductCategory }
    >({
      query: ({ locale, ...params }) => ({
        url: "/products/signature-lineup",
        params: { ...params, locale },
      }),
      transformResponse: (response: { items: ProductDto[] }, _meta, arg) => {
        const locale = arg.locale;
        return {
          items: response.items.map((dto) => mapProductDtoToView(dto, locale)),
        };
      },
      providesTags: [{ type: "Products", id: "SIGNATURE" }],
    }),

    // -------- PRODUCTS (ADMIN) --------
    getProductsAdmin: builder.query<
      Paged<ProductDto>,
      {
        page?: number;
        limit?: number;
        q?: string;
        category?: ProductCategory;
        isPublished?: boolean;
        isBestSeller?: boolean;
        isSignatureLineup?: boolean;
        sort?: string;
      }
    >({
      query: (params) => ({
        url: "/products/admin",
        params,
      }),
      providesTags: (result) =>
        result?.items
          ? [
              ...result.items.map((p) => ({
                type: "Products" as const,
                id: p._id,
              })),
              { type: "Products" as const, id: "LIST" },
            ]
          : [{ type: "Products" as const, id: "LIST" }],
    }),

    createProduct: builder.mutation<
      ProductDto,
      {
        name_i18n: LocalizedString;
        shortDescription_i18n?: LocalizedString;
        description_i18n?: LocalizedString;
        category?: ProductCategory;
        tags?: string[];
        price?: number;
        temperatureOptions?: TemperatureOption[];
        image?: { url: string; alt_i18n?: LocalizedString };
        isBestSeller?: boolean;
        bestSellerOrder?: number;
        bestSellerStats?: ProductStatDto[];
        isSignatureLineup?: boolean;
        signatureOrder?: number;
        isPublished?: boolean;
        slug: string;
        metaTitle?: string;
        metaDescription?: string;
      }
    >({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    updateProduct: builder.mutation<
      ProductDto,
      {
        id: string;
        patch: Partial<{
          name_i18n: LocalizedString;
          shortDescription_i18n?: LocalizedString;
          description_i18n?: LocalizedString;
          category?: ProductCategory;
          tags?: string[];
          price?: number;
          temperatureOptions?: TemperatureOption[];
          image?: { url: string; alt_i18n?: LocalizedString };
          isBestSeller?: boolean;
          bestSellerOrder?: number;
          bestSellerStats?: ProductStatDto[];
          isSignatureLineup?: boolean;
          signatureOrder?: number;
          isPublished?: boolean;
          slug?: string;
          metaTitle?: string;
          metaDescription?: string;
        }>;
      }
    >({
      query: ({ id, patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, _error, arg) => [
        { type: "Products", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    deleteProduct: builder.mutation<{ success?: boolean }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: (result, _error, id) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),
  }),
});

export const {
  useGetHomeContentQuery,
  useGetProductsQuery,
  useGetBestSellersQuery,
  useGetSignatureLineupQuery,
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;
