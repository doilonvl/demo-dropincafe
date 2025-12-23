/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TemperatureSelector } from "@/components/admin/products/TemperatureSelector";
import {
  StatsEditor,
  StatFormRow,
} from "@/components/admin/products/StatsEditor";

import type {
  Product,
  ProductCategory,
  TemperatureOption,
  ProductStat,
  CreateOrUpdateProductDto,
} from "@/services/admin.products";
import {
  useGetProductsAdminQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useUploadProductImageMutation,
} from "@/services/admin.products";
import { getApiBaseUrl } from "@/lib/env";

const BASE = getApiBaseUrl();

const CATEGORY_OPTIONS: { value: ProductCategory; label: string }[] = [
  { value: "coffee", label: "Coffee" },
  { value: "espresso", label: "Espresso" },
  { value: "cold brew", label: "Cold Brew" },
  { value: "tea", label: "Tea" },
  { value: "green teas", label: "Green Teas" },
  { value: "other teas", label: "Other Teas" },
  { value: "matcha", label: "Matcha" },
  { value: "chocolate", label: "Chocolate" },
  { value: "cake", label: "Cake & Dessert" },
  { value: "other drinks", label: "Other Drinks" },
];

const slugifyLocal = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

function rtqErrMsg(err: any) {
  if (err && typeof err === "object" && "status" in err) {
    const status = (err as any).status;
    const data = (err as any).data;
    const detail =
      typeof data === "string"
        ? data
        : data?.message || data?.error || JSON.stringify(data);
    return `(${status}) ${detail || "Request failed"}`;
  }
  return err?.message || "Unknown error";
}

function parseTags(raw: string): string[] {
  return raw
    .split(/[,\s]+/)
    .map((t) => t.trim())
    .filter(Boolean);
}

function statsRowsToPayload(rows: StatFormRow[]): ProductStat[] | undefined {
  const mapped = rows
    .map<ProductStat | null>((r) => {
      if (!(r.labelVi || r.labelEn)) return null;
      return {
        label: {
          vi: r.labelVi || undefined,
          en: r.labelEn || undefined,
        },
        value: r.value ?? 0,
      };
    })
    .filter(Boolean) as ProductStat[];

  return mapped.length ? mapped : undefined;
}

export default function ProductsAdminPage() {
  // ---------- List filters ----------
  const [page, setPage] = React.useState(1);
  const [limit, setLimit] = React.useState(12);
  const [q, setQ] = React.useState("");
  const [fCategory, setFCategory] = React.useState<ProductCategory | "all">(
    "all"
  );
  const [fPublished, setFPublished] = React.useState<
    "all" | "published" | "draft"
  >("all");

  const { data, isFetching, refetch } = useGetProductsAdminQuery({
    page,
    limit,
    q: q.trim() || undefined,
    category: fCategory === "all" ? undefined : fCategory,
    isPublished:
      fPublished === "all"
        ? undefined
        : fPublished === "published"
        ? true
        : false,
  });

  const total = data?.total ?? 0;
  const hasPrev = page > 1;
  const hasNext = page * limit < total;

  // ---------- Mutations ----------
  const [createProduct, { isLoading: creating }] = useCreateProductMutation();
  const [updateProduct] = useUpdateProductMutation();
  const [deleteProduct] = useDeleteProductMutation();
  const [uploadImage, { isLoading: uploadingImage }] =
    useUploadProductImageMutation();

  // ---------- Create form ----------
  const [nameVi, setNameVi] = React.useState("");
  const [nameEn, setNameEn] = React.useState("");
  const [slug, setSlug] = React.useState("");
  const [category, setCategory] = React.useState<ProductCategory | "coffee">(
    "coffee"
  );
  const [price, setPrice] = React.useState<number>(0);
  const [tagsInput, setTagsInput] = React.useState("");
  const [temps, setTemps] = React.useState<TemperatureOption[]>([
    "hot",
    "iced",
  ]);

  const [shortVi, setShortVi] = React.useState("");
  const [shortEn, setShortEn] = React.useState("");
  const [descVi, setDescVi] = React.useState("");
  const [descEn, setDescEn] = React.useState("");

  const [seoTitleVi, setSeoTitleVi] = React.useState("");
  const [seoTitleEn, setSeoTitleEn] = React.useState("");
  const [seoDescVi, setSeoDescVi] = React.useState("");
  const [seoDescEn, setSeoDescEn] = React.useState("");

  const [imageFile, setImageFile] = React.useState<File | null>(null);
  const [imageUrl, setImageUrl] = React.useState("");

  const [altVi, setAltVi] = React.useState("");
  const [altEn, setAltEn] = React.useState("");

  const [isBestSeller, setIsBestSeller] = React.useState(false);
  const [bestSellerOrder, setBestSellerOrder] = React.useState<number>(0);
  const [statsRows, setStatsRows] = React.useState<StatFormRow[]>([]);

  const [isSignature, setIsSignature] = React.useState(false);
  const [signatureOrder, setSignatureOrder] = React.useState<number>(0);

  const [isPublished, setIsPublished] = React.useState(true);

  React.useEffect(() => {
    const base = nameVi || nameEn || "";
    if (!base) return;
    setSlug((prev) => (prev ? prev : slugifyLocal(base)));
  }, [nameVi, nameEn]);

  const canCreate =
    !!(nameVi || nameEn) &&
    !!slug.trim() &&
    price >= 0 &&
    !creating &&
    !uploadingImage;

  async function uploadImageIfNeeded() {
    if (!imageFile) return imageUrl || undefined;
    const result = await uploadImage({ file: imageFile }).unwrap();
    const url = result.secure_url || result.url;
    if (!url) throw new Error("Upload ảnh thất bại");
    setImageUrl(url);
    return url;
  }

  async function handleCreate() {
    try {
      const baseName = nameVi || nameEn || "";
      const finalSlug = (slug.trim() || slugifyLocal(baseName)).toLowerCase();

      const uploadedImageUrl = await uploadImageIfNeeded();
      const temperatureOptions: TemperatureOption[] = [...temps];
      const bestSellerStats = isBestSeller
        ? statsRowsToPayload(statsRows)
        : undefined;

      const payload: CreateOrUpdateProductDto = {
        name_i18n: {
          vi: nameVi || undefined,
          en: nameEn || undefined,
        },
        shortDescription_i18n:
          shortVi || shortEn
            ? { vi: shortVi || undefined, en: shortEn || undefined }
            : undefined,
        description_i18n:
          descVi || descEn
            ? { vi: descVi || undefined, en: descEn || undefined }
            : undefined,

        slug: finalSlug,
        slug_i18n: undefined,

        seoTitle_i18n:
          seoTitleVi || seoTitleEn
            ? { vi: seoTitleVi || undefined, en: seoTitleEn || undefined }
            : undefined,
        seoDescription_i18n:
          seoDescVi || seoDescEn
            ? { vi: seoDescVi || undefined, en: seoDescEn || undefined }
            : undefined,

        category,
        tags: parseTags(tagsInput),
        price,
        temperatureOptions,

        image: uploadedImageUrl
          ? {
              url: uploadedImageUrl,
              alt_i18n:
                altVi || altEn
                  ? { vi: altVi || undefined, en: altEn || undefined }
                  : undefined,
            }
          : undefined,

        isBestSeller,
        bestSellerOrder: isBestSeller ? bestSellerOrder || 0 : undefined,
        bestSellerStats,

        isSignatureLineup: isSignature,
        signatureOrder: isSignature ? signatureOrder || 0 : undefined,

        isPublished,
      };

      await createProduct(payload).unwrap();

      // Reset form
      setNameVi("");
      setNameEn("");
      setSlug("");
      setCategory("coffee");
      setPrice(0);
      setTagsInput("");
      setTemps(["hot", "iced"]);
      setShortVi("");
      setShortEn("");
      setDescVi("");
      setDescEn("");
      setSeoTitleVi("");
      setSeoTitleEn("");
      setSeoDescVi("");
      setSeoDescEn("");
      setImageFile(null);
      setImageUrl("");
      setAltVi("");
      setAltEn("");
      setIsBestSeller(false);
      setBestSellerOrder(0);
      setStatsRows([]);
      setIsSignature(false);
      setSignatureOrder(0);
      setIsPublished(true);

      refetch();
      toast.success("Đã tạo product");
    } catch (e: any) {
      console.error("CREATE_PRODUCT_ERROR", e);
      toast.error(rtqErrMsg(e));
    }
  }

  // ---------- Edit ----------
  const [editing, setEditing] = React.useState<Product | null>(null);
  const [editSlug, setEditSlug] = React.useState("");
  const [editCategory, setEditCategory] = React.useState<
    ProductCategory | "coffee"
  >("coffee");
  const [editPrice, setEditPrice] = React.useState<number>(0);
  const [editTagsInput, setEditTagsInput] = React.useState("");
  const [editTemps, setEditTemps] = React.useState<TemperatureOption[]>([]);

  const [editNameVi, setEditNameVi] = React.useState("");
  const [editNameEn, setEditNameEn] = React.useState("");
  const [editShortVi, setEditShortVi] = React.useState("");
  const [editShortEn, setEditShortEn] = React.useState("");
  const [editDescVi, setEditDescVi] = React.useState("");
  const [editDescEn, setEditDescEn] = React.useState("");

  const [editSeoTitleVi, setEditSeoTitleVi] = React.useState("");
  const [editSeoTitleEn, setEditSeoTitleEn] = React.useState("");
  const [editSeoDescVi, setEditSeoDescVi] = React.useState("");
  const [editSeoDescEn, setEditSeoDescEn] = React.useState("");

  const [editImageFile, setEditImageFile] = React.useState<File | null>(null);
  const [editImageUrl, setEditImageUrl] = React.useState("");
  const [editRemoveImage, setEditRemoveImage] = React.useState(false);

  const [editAltVi, setEditAltVi] = React.useState("");
  const [editAltEn, setEditAltEn] = React.useState("");

  const [editIsBestSeller, setEditIsBestSeller] = React.useState(false);
  const [editBestSellerOrder, setEditBestSellerOrder] =
    React.useState<number>(0);
  const [editStatsRows, setEditStatsRows] = React.useState<StatFormRow[]>([]);

  const [editIsSignature, setEditIsSignature] = React.useState(false);
  const [editSignatureOrder, setEditSignatureOrder] = React.useState<number>(0);

  const [editIsPublished, setEditIsPublished] = React.useState(true);

  function openEdit(p: Product) {
    setEditing(p);

    setEditSlug(p.slug);
    setEditCategory(p.category || "coffee");
    setEditPrice(p.price);
    setEditTagsInput((p.tags || []).join(", "));

    setEditNameVi(p.name_i18n?.vi || "");
    setEditNameEn(p.name_i18n?.en || "");
    setEditShortVi(p.shortDescription_i18n?.vi || "");
    setEditShortEn(p.shortDescription_i18n?.en || "");
    setEditDescVi(p.description_i18n?.vi || "");
    setEditDescEn(p.description_i18n?.en || "");

    setEditSeoTitleVi(p.seoTitle_i18n?.vi || "");
    setEditSeoTitleEn(p.seoTitle_i18n?.en || "");
    setEditSeoDescVi(p.seoDescription_i18n?.vi || "");
    setEditSeoDescEn(p.seoDescription_i18n?.en || "");

    const t = p.temperatureOptions || [];
    setEditTemps(t.length ? t : []);

    setEditImageFile(null);
    setEditImageUrl(p.image?.url || "");
    setEditAltVi(p.image?.alt_i18n?.vi || "");
    setEditAltEn(p.image?.alt_i18n?.en || "");
    setEditRemoveImage(false);

    setEditIsBestSeller(p.isBestSeller);
    setEditBestSellerOrder(p.bestSellerOrder ?? 0);
    setEditStatsRows(
      (p.bestSellerStats || []).map<StatFormRow>((s, idx) => ({
        id: `${p._id}-${idx}`,
        labelVi: s.label.vi || "",
        labelEn: s.label.en || "",
        value: s.value,
      }))
    );

    setEditIsSignature(p.isSignatureLineup);
    setEditSignatureOrder(p.signatureOrder ?? 0);

    setEditIsPublished(p.isPublished);
  }

  async function uploadEditImageIfNeeded() {
    if (editRemoveImage) return undefined;
    if (!editImageFile) return editImageUrl || undefined;
    const result = await uploadImage({ file: editImageFile }).unwrap();
    const url = result.secure_url || result.url;
    if (!url) throw new Error("Upload ảnh thất bại");
    setEditImageUrl(url);
    return url;
  }

  async function saveEdit() {
    if (!editing) return;
    try {
      const baseName = editNameVi || editNameEn || "";
      const finalSlug = (
        editSlug.trim() || slugifyLocal(baseName)
      ).toLowerCase();

      const temperatureOptions: TemperatureOption[] = [...editTemps];
      const uploadedImageUrl = editRemoveImage
        ? undefined
        : await uploadEditImageIfNeeded();
      const bestSellerStats = editIsBestSeller
        ? statsRowsToPayload(editStatsRows)
        : undefined;

      let imagePayload: CreateOrUpdateProductDto["image"] | undefined | null;
      if (editRemoveImage) {
        imagePayload = null;
      } else {
        const finalImageUrl = uploadedImageUrl || editImageUrl || undefined;
        if (finalImageUrl) {
          imagePayload = {
            url: finalImageUrl,
            alt_i18n:
              editAltVi || editAltEn
                ? {
                    vi: editAltVi || undefined,
                    en: editAltEn || undefined,
                  }
                : undefined,
          };
        }
      }

      const patch: Partial<CreateOrUpdateProductDto> = {
        name_i18n: {
          vi: editNameVi || undefined,
          en: editNameEn || undefined,
        },
        shortDescription_i18n:
          editShortVi || editShortEn
            ? {
                vi: editShortVi || undefined,
                en: editShortEn || undefined,
              }
            : undefined,
        description_i18n:
          editDescVi || editDescEn
            ? {
                vi: editDescVi || undefined,
                en: editDescEn || undefined,
              }
            : undefined,

        slug: finalSlug,
        slug_i18n: undefined,

        seoTitle_i18n:
          editSeoTitleVi || editSeoTitleEn
            ? {
                vi: editSeoTitleVi || undefined,
                en: editSeoTitleEn || undefined,
              }
            : undefined,
        seoDescription_i18n:
          editSeoDescVi || editSeoDescEn
            ? {
                vi: editSeoDescVi || undefined,
                en: editSeoDescEn || undefined,
              }
            : undefined,

        category: editCategory,
        tags: parseTags(editTagsInput),
        price: editPrice,
        temperatureOptions,

        image: imagePayload,

        isBestSeller: editIsBestSeller,
        bestSellerOrder: editIsBestSeller
          ? editBestSellerOrder || 0
          : undefined,
        bestSellerStats,

        isSignatureLineup: editIsSignature,
        signatureOrder: editIsSignature ? editSignatureOrder || 0 : undefined,

        isPublished: editIsPublished,
      };

      await updateProduct({ id: editing._id, patch }).unwrap();
      setEditing(null);
      refetch();
      toast.success("Đã cập nhật product");
    } catch (e: any) {
      console.error("UPDATE_PRODUCT_ERROR", e);
      toast.error(rtqErrMsg(e));
    }
  }

  async function togglePublish(row: Product, v: boolean) {
    try {
      await updateProduct({ id: row._id, patch: { isPublished: v } }).unwrap();
      refetch();
      toast.success("Đã cập nhật hiển thị");
    } catch (e: any) {
      toast.error(rtqErrMsg(e));
    }
  }

  // ---------- Delete ----------
  const [pendingDelete, setPendingDelete] = React.useState<Product | null>(
    null
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Quản lý Products</h1>
        <p className="text-sm text-muted-foreground">
          Tạo / sửa / xoá món cho Drop In Cafe, kèm i18n, best-seller &
          signature lineup.
        </p>
      </div>

      <Separator />

      {/* Create */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Left: basic info */}
        <div className="grid gap-3 lg:col-span-2">
          <div className="grid gap-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <Label className="text-base font-semibold">
                Tên, mô tả & nội dung (2 ngôn ngữ)
              </Label>
              <span className="text-xs text-muted-foreground">
                VI & EN cho name/short/description
              </span>
            </div>
            <Tabs defaultValue="vi" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                <TabsTrigger value="en">English</TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="mt-3 space-y-3">
                <div className="grid gap-1.5">
                  <Label>Tên món (VI)</Label>
                  <Input
                    value={nameVi}
                    onChange={(e) => setNameVi(e.target.value)}
                    placeholder="Cà phê trứng, Matcha Latte..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Mô tả ngắn (VI)</Label>
                  <Input
                    value={shortVi}
                    onChange={(e) => setShortVi(e.target.value)}
                    placeholder="Mô tả ngắn cho menu..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Mô tả chi tiết (VI)</Label>
                  <textarea
                    value={descVi}
                    onChange={(e) => setDescVi(e.target.value)}
                    className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Mô tả dài, ghi rõ hương vị, cách pha..."
                  />
                </div>
              </TabsContent>
              <TabsContent value="en" className="mt-3 space-y-3">
                <div className="grid gap-1.5">
                  <Label>Name (EN)</Label>
                  <Input
                    value={nameEn}
                    onChange={(e) => setNameEn(e.target.value)}
                    placeholder="Egg Coffee, Matcha Latte..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Short description (EN)</Label>
                  <Input
                    value={shortEn}
                    onChange={(e) => setShortEn(e.target.value)}
                    placeholder="Short copy for menu..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label>Description (EN)</Label>
                  <textarea
                    value={descEn}
                    onChange={(e) => setDescEn(e.target.value)}
                    className="min-h-28 w-full rounded-md border px-3 py-2 text-sm"
                    placeholder="Longer description in English..."
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* SEO */}
          <div className="mt-4 grid gap-3">
            <div className="flex items-center justify-between gap-2">
              <Label className="text-base font-semibold">
                SEO Title & Description
              </Label>
              <span className="text-xs text-muted-foreground">
                Nếu bỏ trống sẽ fallback từ name/shortDescription
              </span>
            </div>
            <Tabs defaultValue="vi">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="vi">SEO VI</TabsTrigger>
                <TabsTrigger value="en">SEO EN</TabsTrigger>
              </TabsList>
              <TabsContent value="vi" className="mt-3 space-y-3">
                <Input
                  value={seoTitleVi}
                  onChange={(e) => setSeoTitleVi(e.target.value)}
                  placeholder="SEO title (VI)"
                />
                <textarea
                  value={seoDescVi}
                  onChange={(e) => setSeoDescVi(e.target.value)}
                  className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="SEO description (VI)"
                />
              </TabsContent>
              <TabsContent value="en" className="mt-3 space-y-3">
                <Input
                  value={seoTitleEn}
                  onChange={(e) => setSeoTitleEn(e.target.value)}
                  placeholder="SEO title (EN)"
                />
                <textarea
                  value={seoDescEn}
                  onChange={(e) => setSeoDescEn(e.target.value)}
                  className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                  placeholder="SEO description (EN)"
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Right: meta fields */}
        <div className="grid gap-3">
          <div className="grid gap-2">
            <Label>Slug</Label>
            <Input
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="egg-coffee-signature"
            />
            <p className="text-xs text-muted-foreground">
              Nếu để trống sẽ tự tạo từ tên món.
            </p>
          </div>

          <div className="grid gap-2">
            <Label>Category</Label>
            <Select
              value={category}
              onValueChange={(v: string) => setCategory(v as ProductCategory)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Chọn category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORY_OPTIONS.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Price (k VND)</Label>
            <Input
              type="number"
              value={price}
              onChange={(e) => setPrice(Number(e.target.value || 0))}
            />
          </div>

          <div className="grid gap-2">
            <Label>Tags</Label>
            <Input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="egg_coffee, signature, hot"
            />
            <p className="text-xs text-muted-foreground">
              Cách nhau bởi dấu phẩy hoặc khoảng trắng.
            </p>
          </div>

          <TemperatureSelector value={temps} onChange={setTemps} />

          <div className="grid gap-2">
            <Label>Ảnh sản phẩm</Label>
            {imageUrl && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={imageUrl}
                alt=""
                className="mb-2 h-24 w-32 rounded-md border object-cover"
              />
            )}
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            />
            {imageFile && (
              <p className="mt-1 text-xs text-muted-foreground">
                Đã chọn: {imageFile.name}
              </p>
            )}
            <div className="grid gap-1 mt-2">
              <Label className="text-xs">Alt (VI)</Label>
              <Input
                value={altVi}
                onChange={(e) => setAltVi(e.target.value)}
                placeholder="Ảnh sản phẩm tại Drop In Cafe"
              />
              <Label className="text-xs mt-1">Alt (EN)</Label>
              <Input
                value={altEn}
                onChange={(e) => setAltEn(e.target.value)}
                placeholder="Product photo at Drop In Cafe"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Best-seller</Label>
            <div className="flex items-center gap-2">
              <Switch
                checked={isBestSeller}
                onCheckedChange={setIsBestSeller}
              />
              <span className="text-sm">Đánh dấu là best-seller</span>
            </div>
            {isBestSeller && (
              <>
                <Input
                  className="mt-2"
                  type="number"
                  value={bestSellerOrder}
                  onChange={(e) =>
                    setBestSellerOrder(Number(e.target.value || 0))
                  }
                  placeholder="Thứ tự trong best-seller section"
                />
                <div className="mt-2">
                  <Label className="text-sm">Best-seller stats</Label>
                  <StatsEditor rows={statsRows} onChange={setStatsRows} />
                </div>
              </>
            )}
          </div>

          <div className="grid gap-2">
            <Label>Signature lineup</Label>
            <div className="flex items-center gap-2">
              <Switch checked={isSignature} onCheckedChange={setIsSignature} />
              <span className="text-sm">Thuộc Signature lineup</span>
            </div>
            {isSignature && (
              <Input
                className="mt-2"
                type="number"
                value={signatureOrder}
                onChange={(e) => setSignatureOrder(Number(e.target.value || 0))}
                placeholder="Thứ tự trong Signature lineup"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            <Switch checked={isPublished} onCheckedChange={setIsPublished} />
            <span className="text-sm">Published</span>
          </div>

          <Button className="mt-2" onClick={handleCreate} disabled={!canCreate}>
            {creating || uploadingImage ? "Đang tạo..." : "Tạo product"}
          </Button>
        </div>
      </div>

      <Separator />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <Label className="text-sm">Category</Label>
          <Select
            value={fCategory}
            onValueChange={(v: any) => {
              setFCategory(v as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Publish</Label>
          <Select
            value={fPublished}
            onValueChange={(v: any) => {
              setFPublished(v as any);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="published">Published</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Label className="text-sm">Tìm kiếm</Label>
          <Input
            value={q}
            onChange={(e) => {
              setQ(e.target.value);
              setPage(1);
            }}
            placeholder="name / slug / description"
            className="w-64"
          />
        </div>
      </div>

      {/* List */}
      <div className="mt-3 rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tên</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Best</TableHead>
              <TableHead>Sig.</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={8}>Đang tải…</TableCell>
              </TableRow>
            ) : data?.items?.length ? (
              data.items.map((row) => (
                <TableRow key={row._id}>
                  <TableCell className="font-medium">
                    {row.name_i18n?.vi || row.name_i18n?.en || "(no name)"}
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    {row.slug}
                  </TableCell>
                  <TableCell className="text-xs">
                    {row.category || "—"}
                  </TableCell>
                  <TableCell>{row.price}</TableCell>
                  <TableCell>{row.isBestSeller ? "★" : ""}</TableCell>
                  <TableCell>{row.isSignatureLineup ? "✓" : ""}</TableCell>
                  <TableCell>
                    <Switch
                      checked={row.isPublished}
                      onCheckedChange={(v) => togglePublish(row, v)}
                    />
                  </TableCell>
                  <TableCell className="space-x-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEdit(row)}
                    >
                      Sửa
                    </Button>
                    <a
                      className="ml-1 text-sm text-primary underline"
                      href={`${BASE}/products/${row.slug}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      API
                    </a>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setPendingDelete(row)}
                    >
                      Xoá
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8}>Chưa có product</TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-muted-foreground">
          Tổng: {total} — Trang {page}/
          {Math.max(1, Math.ceil((total || 0) / (limit || 1)))}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            disabled={!hasPrev}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Trang trước
          </Button>
          <Button
            variant="outline"
            disabled={!hasNext}
            onClick={() => setPage((p) => p + 1)}
          >
            Trang sau
          </Button>
          <Input
            type="number"
            value={limit}
            onChange={(e) => {
              setLimit(Math.max(1, Number(e.target.value) || 1));
              setPage(1);
            }}
            className="w-20"
          />
        </div>
      </div>

      {/* Edit dialog */}
      <Dialog.Root
        open={!!editing}
        onOpenChange={(open) => {
          if (!open) setEditing(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 max-h-[90vh] w-[96vw] max-w-5xl -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-white p-5 shadow-2xl">
            <Dialog.Title className="text-base font-semibold">
              Cập nhật product
            </Dialog.Title>
            <Dialog.Description className="sr-only">
              Cập nhật thông tin sản phẩm.
            </Dialog.Description>

            {editing && (
              <div className="mt-4 max-h-[75vh] overflow-y-auto pr-1">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="grid gap-3 lg:col-span-2">
                    {/* i18n fields */}
                    <Tabs defaultValue="vi">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="vi">Tiếng Việt</TabsTrigger>
                        <TabsTrigger value="en">English</TabsTrigger>
                      </TabsList>
                      <TabsContent value="vi" className="mt-3 space-y-3">
                        <div className="grid gap-1.5">
                          <Label>Tên (VI)</Label>
                          <Input
                            value={editNameVi}
                            onChange={(e) => setEditNameVi(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Short (VI)</Label>
                          <Input
                            value={editShortVi}
                            onChange={(e) => setEditShortVi(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Description (VI)</Label>
                          <textarea
                            value={editDescVi}
                            onChange={(e) => setEditDescVi(e.target.value)}
                            className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                      </TabsContent>
                      <TabsContent value="en" className="mt-3 space-y-3">
                        <div className="grid gap-1.5">
                          <Label>Name (EN)</Label>
                          <Input
                            value={editNameEn}
                            onChange={(e) => setEditNameEn(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Short (EN)</Label>
                          <Input
                            value={editShortEn}
                            onChange={(e) => setEditShortEn(e.target.value)}
                          />
                        </div>
                        <div className="grid gap-1.5">
                          <Label>Description (EN)</Label>
                          <textarea
                            value={editDescEn}
                            onChange={(e) => setEditDescEn(e.target.value)}
                            className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </div>
                      </TabsContent>
                    </Tabs>

                    {/* SEO edit */}
                    <div className="mt-4 grid gap-3">
                      <Label className="text-sm font-semibold">
                        SEO Title & Description
                      </Label>
                      <Tabs defaultValue="vi">
                        <TabsList className="grid w-full grid-cols-2">
                          <TabsTrigger value="vi">VI</TabsTrigger>
                          <TabsTrigger value="en">EN</TabsTrigger>
                        </TabsList>
                        <TabsContent value="vi" className="mt-3 space-y-3">
                          <Input
                            value={editSeoTitleVi}
                            onChange={(e) => setEditSeoTitleVi(e.target.value)}
                            placeholder="SEO title (VI)"
                          />
                          <textarea
                            value={editSeoDescVi}
                            onChange={(e) => setEditSeoDescVi(e.target.value)}
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </TabsContent>
                        <TabsContent value="en" className="mt-3 space-y-3">
                          <Input
                            value={editSeoTitleEn}
                            onChange={(e) => setEditSeoTitleEn(e.target.value)}
                            placeholder="SEO title (EN)"
                          />
                          <textarea
                            value={editSeoDescEn}
                            onChange={(e) => setEditSeoDescEn(e.target.value)}
                            className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
                          />
                        </TabsContent>
                      </Tabs>
                    </div>
                  </div>

                  {/* Right col in edit dialog */}
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label>Slug</Label>
                      <Input
                        value={editSlug}
                        onChange={(e) => setEditSlug(e.target.value)}
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Category</Label>
                      <Select
                        value={editCategory}
                        onValueChange={(v: string) =>
                          setEditCategory(v as ProductCategory)
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((c) => (
                            <SelectItem key={c.value} value={c.value}>
                              {c.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid gap-2">
                      <Label>Price</Label>
                      <Input
                        type="number"
                        value={editPrice}
                        onChange={(e) =>
                          setEditPrice(Number(e.target.value || 0))
                        }
                      />
                    </div>

                    <div className="grid gap-2">
                      <Label>Tags</Label>
                      <Input
                        value={editTagsInput}
                        onChange={(e) => setEditTagsInput(e.target.value)}
                      />
                    </div>

                    <TemperatureSelector
                      value={editTemps}
                      onChange={setEditTemps}
                    />

                    <div className="grid gap-2">
                      <Label>Ảnh</Label>
                      {editImageUrl && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={editImageUrl}
                          alt=""
                          className={
                            "h-24 w-32 rounded-md border object-cover " +
                            (editRemoveImage ? "opacity-50" : "")
                          }
                        />
                      )}
                      {editRemoveImage && (
                        <p className="text-xs text-destructive">
                          Ảnh này sẽ được xoá khi lưu thay đổi.
                        </p>
                      )}
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            setEditImageFile(e.target.files?.[0] || null);
                            setEditRemoveImage(false);
                          }}
                        />
                        {editImageUrl && !editRemoveImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setEditRemoveImage(true);
                              setEditImageFile(null);
                            }}
                          >
                            Xoá ảnh hiện tại
                          </Button>
                        )}
                        {editRemoveImage && (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setEditRemoveImage(false)}
                          >
                            Hoàn tác
                          </Button>
                        )}
                      </div>
                      {editImageFile && (
                        <p className="mt-1 text-xs text-muted-foreground">
                          New: {editImageFile.name}
                        </p>
                      )}
                      <div className="grid gap-1 mt-2">
                        <Label className="text-xs">Alt (VI)</Label>
                        <Input
                          value={editAltVi}
                          onChange={(e) => setEditAltVi(e.target.value)}
                        />
                        <Label className="text-xs mt-1">Alt (EN)</Label>
                        <Input
                          value={editAltEn}
                          onChange={(e) => setEditAltEn(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label>Best-seller</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editIsBestSeller}
                          onCheckedChange={setEditIsBestSeller}
                        />
                        <span className="text-sm">Best-seller</span>
                      </div>
                      {editIsBestSeller && (
                        <>
                          <Input
                            className="mt-2"
                            type="number"
                            value={editBestSellerOrder}
                            onChange={(e) =>
                              setEditBestSellerOrder(
                                Number(e.target.value || 0)
                              )
                            }
                            placeholder="Order"
                          />
                          <div className="mt-2">
                            <Label className="text-sm">Best-seller stats</Label>
                            <StatsEditor
                              rows={editStatsRows}
                              onChange={setEditStatsRows}
                            />
                          </div>
                        </>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label>Signature lineup</Label>
                      <div className="flex items-center gap-2">
                        <Switch
                          checked={editIsSignature}
                          onCheckedChange={setEditIsSignature}
                        />
                        <span className="text-sm">Signature</span>
                      </div>
                      {editIsSignature && (
                        <Input
                          className="mt-2"
                          type="number"
                          value={editSignatureOrder}
                          onChange={(e) =>
                            setEditSignatureOrder(Number(e.target.value || 0))
                          }
                          placeholder="Order"
                        />
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <Switch
                        checked={editIsPublished}
                        onCheckedChange={setEditIsPublished}
                      />
                      <span className="text-sm">Published</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Đóng</Button>
              </Dialog.Close>
              <Button onClick={saveEdit}>Lưu thay đổi</Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete dialog */}
      <Dialog.Root
        open={!!pendingDelete}
        onOpenChange={(open) => {
          if (!open) setPendingDelete(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 backdrop-blur-[1px]" />
          <Dialog.Content className="fixed left-1/2 top-1/2 w-[92vw] max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-xl border bg-white p-5 shadow-2xl">
            <Dialog.Title className="text-base font-semibold">
              Xác nhận xoá
            </Dialog.Title>
            <Dialog.Description className="mt-1 text-sm text-muted-foreground">
              {pendingDelete ? (
                <>
                  Bạn có chắc chắn muốn xoá{" "}
                  <span className="font-medium">
                    “
                    {pendingDelete.name_i18n?.vi ||
                      pendingDelete.name_i18n?.en ||
                      pendingDelete.slug}
                    ”
                  </span>
                  ? Thao tác này không thể hoàn tác.
                </>
              ) : (
                <>
                  Bạn có chắc chắn muốn xoá mục này? Thao tác này không thể hoàn
                  tác.
                </>
              )}
            </Dialog.Description>
            <div className="mt-5 flex items-center justify-end gap-2">
              <Dialog.Close asChild>
                <Button variant="outline">Huỷ</Button>
              </Dialog.Close>
              <Button
                variant="destructive"
                onClick={async () => {
                  if (!pendingDelete) return;
                  try {
                    await deleteProduct(pendingDelete._id).unwrap();
                    toast.success("Đã xoá sản phẩm");
                    setPendingDelete(null);
                    refetch();
                  } catch (e: any) {
                    toast.error(rtqErrMsg(e));
                  }
                }}
              >
                Xoá
              </Button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
