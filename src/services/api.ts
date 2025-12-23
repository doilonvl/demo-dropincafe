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
import { mapProductDtoToView, pickLocalized } from "@/lib/product-mapper";
import { getApiBaseUrl } from "@/lib/env";

const BASE_URL = getApiBaseUrl();

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
        withCount?: boolean;
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

    getProductBySlug: builder.query<Product, { locale: Locale; slug: string }>({
      query: ({ locale, slug }) => ({
        url: `/products/${slug}`,
        params: { locale },
      }),
      transformResponse: (response: ProductDto, _meta, arg) =>
        mapProductDtoToView(response, arg.locale),
      providesTags: (result) =>
        result
          ? [{ type: "Products", id: result._id }]
          : [{ type: "Products", id: "DETAIL" }],
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
  useGetProductBySlugQuery,
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
} = api;
