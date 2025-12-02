// src/services/admin.products.ts
import { api } from "./api";

export type Locale = "vi" | "en";
export type LocalizedString = Partial<Record<Locale, string>>;

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
export type TemperatureOption = "hot" | "iced" | "both" | "warm";

export interface ProductStat {
  label: LocalizedString;
  value: number; // 0-100
}

export interface ProductImage {
  url: string;
  alt_i18n?: LocalizedString;
}

export interface Product {
  _id: string;
  name_i18n: LocalizedString;
  shortDescription_i18n?: LocalizedString;
  description_i18n?: LocalizedString;

  slug: string;
  slug_i18n?: LocalizedString;

  seoTitle_i18n?: LocalizedString;
  seoDescription_i18n?: LocalizedString;

  category?: ProductCategory;
  tags?: string[];
  price: number;
  temperatureOptions?: TemperatureOption[];

  image?: ProductImage | null;

  isBestSeller: boolean;
  bestSellerOrder?: number;
  bestSellerStats?: ProductStat[];

  isSignatureLineup: boolean;
  signatureOrder?: number;

  isPublished: boolean;

  // BE tự attach thêm
  metaTitle?: string;
  metaDescription?: string;

  createdAt: string;
  updatedAt: string;
}

export interface ProductListResponse {
  items: Product[];
  total: number;
}

export interface AdminProductsQuery {
  page?: number;
  limit?: number;
  q?: string;
  category?: ProductCategory;
  isPublished?: boolean;
  isBestSeller?: boolean;
  isSignatureLineup?: boolean;
}

export interface CreateOrUpdateProductDto {
  name_i18n: LocalizedString;
  shortDescription_i18n?: LocalizedString;
  description_i18n?: LocalizedString;

  slug: string;
  slug_i18n?: LocalizedString;

  seoTitle_i18n?: LocalizedString;
  seoDescription_i18n?: LocalizedString;

  category?: ProductCategory;
  tags?: string[];
  price: number;
  temperatureOptions?: TemperatureOption[];

  image?: ProductImage | null;

  isBestSeller: boolean;
  bestSellerOrder?: number;
  bestSellerStats?: ProductStat[];

  isSignatureLineup: boolean;
  signatureOrder?: number;

  isPublished: boolean;
}

type UploadImageResult = {
  url: string;
  secure_url?: string;
};

export const adminProductsApi = api.injectEndpoints({
  overrideExisting: true,
  endpoints: (builder) => ({
    getProductsAdmin: builder.query<
      ProductListResponse,
      AdminProductsQuery | undefined
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

    createProduct: builder.mutation<Product, CreateOrUpdateProductDto>({
      query: (body) => ({
        url: "/products",
        method: "POST",
        body,
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    deleteProduct: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),

    updateProduct: builder.mutation<
      Product,
      { id: string; patch: Partial<CreateOrUpdateProductDto> }
    >({
      query: ({ id, patch }) => ({
        url: `/products/${id}`,
        method: "PUT",
        body: patch,
      }),
      invalidatesTags: (result, error, arg) => [
        { type: "Products", id: arg.id },
        { type: "Products", id: "LIST" },
      ],
    }),

    // Đường dẫn upload bạn chỉnh lại theo BE của dự án cafe
    uploadProductImage: builder.mutation<UploadImageResult, { file: File }>({
      query: ({ file }) => {
        const formData = new FormData();
        formData.append("file", file);

        return {
          url: "/upload/single?folder=products",
          method: "POST",
          body: formData,
        };
      },
    }),
  }),
});

export const {
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} = adminProductsApi;
