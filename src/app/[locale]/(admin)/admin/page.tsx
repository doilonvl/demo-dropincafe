"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useGetProductsAdminQuery } from "@/services/admin.products";
import {
  Package,
  CheckCircle2,
  EyeOff,
  Star,
  ArrowUpRight,
} from "lucide-react";

function useProductCount(
  params?: Parameters<typeof useGetProductsAdminQuery>[0]
) {
  const { data, isFetching, isError } = useGetProductsAdminQuery(
    {
      page: 1,
      limit: 1,
      ...(typeof params === "object" && params !== null ? params : {}),
    },
    { refetchOnMountOrArgChange: true }
  );
  return {
    total: data?.total ?? 0,
    isLoading: isFetching,
    isError,
  };
}

function StatPill({
  label,
  value,
  loading,
  error,
}: {
  label: string;
  value: number;
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-center gap-2 rounded-full border border-amber-100 bg-amber-50/70 px-3 py-1.5 text-xs font-medium text-amber-900">
      {loading ? "Đang tải..." : error ? "Lỗi" : value}
      <span className="text-[11px] font-normal text-amber-800/90">{label}</span>
    </div>
  );
}

export default function AdminHome() {
  const params = useParams();
  const locale = String(params?.locale || "vi");

  const all = useProductCount();
  const published = useProductCount({ isPublished: true });
  const draft = useProductCount({ isPublished: false });
  const bestSeller = useProductCount({ isBestSeller: true });

  return (
    <div className="space-y-6 p-6">
      <Card className="overflow-hidden border-amber-200/70 bg-gradient-to-r from-amber-50 via-white to-white shadow-sm">
        <div className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Admin
            </p>
            <h1 className="text-2xl font-semibold leading-tight text-neutral-900">
              Tổng quan vận hành
            </h1>
            <p className="text-sm text-muted-foreground">
              Nắm trạng thái sản phẩm và đi thẳng tới trang quản lý chỉ với một
              cú nhấp.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              <StatPill
                label="Tổng sản phẩm"
                value={all.total}
                loading={all.isLoading}
                error={all.isError}
              />
              <StatPill
                label="Đang hiển thị"
                value={published.total}
                loading={published.isLoading}
                error={published.isError}
              />
              <StatPill
                label="Nháp/Ẩn"
                value={draft.total}
                loading={draft.isLoading}
                error={draft.isError}
              />
              <StatPill
                label="Best seller"
                value={bestSeller.total}
                loading={bestSeller.isLoading}
                error={bestSeller.isError}
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button asChild size="lg">
              <Link href={`/${locale}/admin/products`}>
                Mở quản lý Products
                <ArrowUpRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              Thống kê nhanh
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <StatRow
              icon={<Package className="h-4 w-4" />}
              label="Tổng sản phẩm"
              value={all.total}
              loading={all.isLoading}
              error={all.isError}
              hint="Tất cả danh mục, bao gồm đang ẩn."
            />
            <StatRow
              icon={<CheckCircle2 className="h-4 w-4" />}
              label="Đang hiển thị"
              value={published.total}
              loading={published.isLoading}
              error={published.isError}
              hint="Sản phẩm đang public trên website."
            />
            <StatRow
              icon={<EyeOff className="h-4 w-4" />}
              label="Nháp / Ẩn"
              value={draft.total}
              loading={draft.isLoading}
              error={draft.isError}
              hint="Chưa public hoặc tạm ẩn."
            />
            <StatRow
              icon={<Star className="h-4 w-4" />}
              label="Best seller"
              value={bestSeller.total}
              loading={bestSeller.isLoading}
              error={bestSeller.isError}
              hint="Được đánh dấu best-seller."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatRow({
  icon,
  label,
  value,
  hint,
  loading,
  error,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  hint?: string;
  loading?: boolean;
  error?: boolean;
}) {
  return (
    <div className="flex items-start justify-between rounded-lg border border-neutral-100 bg-neutral-50/60 px-3 py-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 rounded-full bg-white p-2 text-amber-700 shadow-sm">
          {icon}
        </div>
        <div>
          <p className="text-sm font-semibold text-neutral-900">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>
      <div className="text-right text-base font-semibold text-neutral-900">
        {loading ? "..." : error ? "—" : value}
      </div>
    </div>
  );
}
