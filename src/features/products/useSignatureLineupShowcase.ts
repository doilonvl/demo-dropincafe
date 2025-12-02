"use client";

import { useMemo } from "react";
import { useGetProductsQuery } from "@/services/api";
import type { Locale, Product as ApiProduct } from "@/types/content";

export type ShowcaseProduct = {
  name: string;
  description: string;
  img: string;
  route: string;
};

export type ShowcaseItem = ShowcaseProduct & {
  id: string;
};

const FALLBACK_SIGNATURE_ITEMS: ShowcaseItem[] = [
  {
    id: "fallback-1",
    name: "Signature Blend",
    description: "Bold aroma from beans roasted fresh each day.",
    img: "/Signature/1.jpg",
    route: "/products/signature-blend",
  },
  {
    id: "fallback-2",
    name: "Cold Brew Citrus",
    description: "Deep-cold brew with a light citrus twist.",
    img: "/Signature/2.jpg",
    route: "/products/cold-brew-citrus",
  },
  {
    id: "fallback-3",
    name: "Classic Latte",
    description: "Steamed milk and gentle foam for slow mornings.",
    img: "/Signature/3.jpg",
    route: "/products/classic-latte",
  },
  {
    id: "fallback-4",
    name: "Matcha Fusion",
    description: "Creamy matcha layered with robust espresso.",
    img: "/Signature/4.jpg",
    route: "/products/matcha-fusion",
  },
  {
    id: "fallback-5",
    name: "Hazelnut Cappuccino",
    description: "Toasted hazelnut notes with silky foam.",
    img: "/Signature/5.jpg",
    route: "/products/hazelnut-cappuccino",
  },
  {
    id: "fallback-6",
    name: "Vietnamese Phin",
    description: "Traditional phin brew with a chocolaty finish.",
    img: "/Signature/6.jpg",
    route: "/products/vietnamese-phin",
  },
];

function mapApiToShowcaseItem(p: ApiProduct): ShowcaseItem {
  const fallbackImg = "/Signature/1.jpg";
  const url = p.image?.url || "";
  const safeImg =
    url && !url.includes("/demo/") && !url.includes("res.cloudinary.com/demo")
      ? url
      : fallbackImg;

  return {
    id: p._id,
    name: p.name,
    description: p.shortDescription || p.description || "",
    img: safeImg,
    route: `/products/${p.slug}`,
  };
}

export function useSignatureLineupShowcase(locale: Locale, limit = 6) {
  const { data, isLoading, isError } = useGetProductsQuery({
    locale,
    isSignatureLineup: true,
    limit,
  });

  const items = useMemo<ShowcaseItem[]>(() => {
    if (data?.items && data.items.length > 0) {
      return data.items.map(mapApiToShowcaseItem);
    }

    if (isError) {
      return FALLBACK_SIGNATURE_ITEMS;
    }

    return [];
  }, [data, isError]);

  return {
    items,
    isLoading,
    isError,
  };
}
