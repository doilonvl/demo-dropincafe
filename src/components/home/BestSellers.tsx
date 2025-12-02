/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @next/next/no-img-element */
"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { useLocale, useTranslations } from "next-intl";
import FadeIn from "@/components/animation/FadeIn";
import { useGetBestSellersQuery } from "@/services/api";
import type { Product as ApiProduct, Locale } from "@/types/content";

type Stat = {
  label: string;
  value: number;
};

type BestSeller = {
  name: string;
  description: string;
  stats: Stat[];
  image: string;
};

const AUTOPLAY_DELAY = 4000;

const FALLBACK_BEST_SELLERS: BestSeller[] = [
  {
    name: "Hanoi Egg Coffee Signature",
    image: "/PShowcase/5.jpg",
    description:
      "Robusta concentrate whisked with a rich egg custard, vanilla syrup, and a hint of cacao. It is the ritual most guests choose for their first visit to Drop In Cafe.",
    stats: [
      { label: "Velvety egg crema", value: 98 },
      { label: "Bold roast depth", value: 96 },
      { label: "Balanced sweetness", value: 93 },
      { label: "Guests ordering again", value: 97 },
    ],
  },
  {
    name: "Drop In Flat White",
    image: "/PShowcase/6.jpg",
    description:
      "Inspired by Australian mornings: syrupy espresso folded into micro-foamed milk for a creamy, composed cup that still lets the coffee shine.",
    stats: [
      { label: "Morning energy", value: 95 },
      { label: "Espresso clarity", value: 94 },
      { label: "Milk texture", value: 92 },
      { label: "Travelers' favorite", value: 96 },
    ],
  },
  {
    name: "Matcha Latte Cold",
    image: "/PShowcase/7.jpg",
    description:
      "Ceremonial-grade matcha shaken with chilled milk and a touch of honey. A calm, refreshing option when you would rather sip green than brown.",
    stats: [
      { label: "Matcha aroma", value: 92 },
      { label: "Cooling finish", value: 94 },
      { label: "Tea & milk balance", value: 91 },
      { label: "Afternoon pick-me-up", value: 93 },
    ],
  },
  {
    name: "Peach Lemongrass Brew",
    image: "/PShowcase/4.jpg",
    description:
      "Cold-brewed white tea infused with peach, lemongrass, and citrus peel. Light, fragrant, and perfect for watching the trains glide past.",
    stats: [
      { label: "Juicy fruit notes", value: 97 },
      { label: "Herbal refreshment", value: 94 },
      { label: "Low caffeine", value: 90 },
      { label: "Non-coffee crowd", value: 95 },
    ],
  },
];

function mapApiProductToBestSeller(product: ApiProduct): BestSeller {
  const statsFromApi =
    product.bestSellerStats && product.bestSellerStats.length > 0
      ? product.bestSellerStats.map((s) => ({ label: s.label, value: s.value }))
      : null;

  const fallbackStats: Stat[] = [
    { label: "Guest favorite", value: 95 },
    { label: "Flavor balance", value: 93 },
    { label: "Aroma", value: 94 },
    { label: "Order again", value: 96 },
  ];

  return {
    name: product.name,
    description: product.shortDescription || product.description || "",
    image: product.image?.url || "/PShowcase/5.jpg",
    stats:
      statsFromApi && statsFromApi.length > 0 ? statsFromApi : fallbackStats,
  };
}

function ProgressBar({ label, value, active }: Stat & { active: boolean }) {
  const [visualValue, setVisualValue] = useState(0);
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let startFrameId: number | null = null;

    if (!active) {
      setVisualValue(0);
      setDisplayValue(0);
      return;
    }

    setVisualValue(0);
    setDisplayValue(0);

    const NUMBER_DURATION = 250;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const startAnimation = (startTime: number) => {
      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / NUMBER_DURATION, 1);
        const eased = easeOutCubic(progress);
        setDisplayValue(eased * value);

        if (progress < 1) {
          rafId = requestAnimationFrame(tick);
        }
      };

      setVisualValue(value);

      rafId = requestAnimationFrame(tick);
    };

    startFrameId = requestAnimationFrame((startTime) => {
      startAnimation(startTime);
    });

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      if (startFrameId !== null) cancelAnimationFrame(startFrameId);
    };
  }, [active, value]);

  const width = `${visualValue}%`;
  const left = `${visualValue}%`;
  const shownValue = Math.round(displayValue);

  return (
    <div className="mb-4">
      <h4 className="text-sm font-medium text-stone-800">{label}</h4>

      <div className="relative mt-3 h-5">
        <div
          className="pointer-events-none absolute bottom-0 flex -translate-x-1/2 flex-col items-center transition-[left] duration-700 ease-out"
          style={{ left }}
        >
          <div className="rounded bg-stone-800 px-2 py-1 text-xs font-semibold text-white">
            {shownValue}%
          </div>
          <div className="h-0 w-0 border-l-[6px] border-r-[6px] border-t-[7px] border-l-transparent border-r-transparent border-t-stone-800" />
        </div>
      </div>

      <div className="h-2 w-full overflow-hidden rounded bg-neutral-200">
        <div
          className="h-2 rounded bg-gradient-to-r from-amber-600 to-rose-500 transition-[width] duration-700 ease-out"
          style={{ width }}
        />
      </div>
    </div>
  );
}

export default function BestSellersCarousel() {
  const locale = useLocale() as Locale;
  const t = useTranslations("bestSellers");

  const { data, isLoading, isError } = useGetBestSellersQuery({
    locale,
    limit: 4,
  });

  const bestSellers: BestSeller[] = useMemo(() => {
    if (data?.items && data.items.length > 0) {
      return data.items.map(mapApiProductToBestSeller);
    }

    if (isError) {
      return FALLBACK_BEST_SELLERS;
    }

    return [];
  }, [data, isError]);

  const total = bestSellers.length;

  const slides = useMemo(
    () => (total ? [...bestSellers, ...bestSellers, ...bestSellers] : []),
    [bestSellers, total]
  );

  const [index, setIndex] = useState(0);
  const [enableTransition, setEnableTransition] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState(0);

  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);

  const dragRef = useRef({
    startX: 0,
    dragging: false,
    baseIndex: 0,
  });

  // When total > 0, reset index to the middle "loop" for smoother wrap
  useEffect(() => {
    if (total > 0) {
      setIndex(total);
      dragRef.current.baseIndex = total;
    }
  }, [total]);

  const visibleIndex = total ? ((index % total) + total) % total : 0;

  const handleTransitionEnd = () => {
    if (!total) return;
    setIndex((current) => {
      if (current >= total * 2) {
        setEnableTransition(false);
        return current - total;
      }
      if (current < total) {
        setEnableTransition(false);
        return current + total;
      }
      return current;
    });
  };

  useEffect(() => {
    if (!enableTransition) {
      const id = requestAnimationFrame(() => {
        setEnableTransition(true);
      });
      return () => cancelAnimationFrame(id);
    }
  }, [enableTransition]);

  useEffect(() => {
    if (total <= 1) return;
    if (isDragging) return;

    const timer = window.setTimeout(() => {
      setEnableTransition(true);
      setDragOffset(0);
      setIndex((i) => i + 1);
    }, AUTOPLAY_DELAY);

    return () => {
      window.clearTimeout(timer);
    };
  }, [isDragging, total, visibleIndex]);

  const goTo = (target: number) => {
    if (total === 0) return;
    setEnableTransition(true);
    setDragOffset(0);
    setIndex(total + target);
  };

  const goPrev = () => {
    setEnableTransition(true);
    setDragOffset(0);
    setIndex((i) => i - 1);
  };

  const goNext = () => {
    setEnableTransition(true);
    setDragOffset(0);
    setIndex((i) => i + 1);
  };

  const handlePointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!viewportRef.current) return;
    dragRef.current = {
      startX: e.clientX,
      dragging: true,
      baseIndex: index,
    };
    setIsDragging(true);
    setEnableTransition(false);
    setDragOffset(0);
    viewportRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging || !viewportRef.current) return;
    const dx = e.clientX - dragRef.current.startX;
    const width = viewportRef.current.clientWidth || 1;
    const offsetPercent = (dx / width) * 100;
    setDragOffset(offsetPercent);
  };

  const handlePointerEnd = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging || !viewportRef.current) return;

    dragRef.current.dragging = false;
    setIsDragging(false);
    viewportRef.current.releasePointerCapture(e.pointerId);

    const dx = e.clientX - dragRef.current.startX;
    const width = viewportRef.current.clientWidth || 1;
    const threshold = width * 0.08;

    let direction = 0;
    if (dx > threshold) direction = -1;
    else if (dx < -threshold) direction = 1;

    setEnableTransition(true);
    setDragOffset(0);

    if (direction === 0) {
      setIndex(dragRef.current.baseIndex);
    } else {
      setIndex(dragRef.current.baseIndex + direction);
    }
  };

  const trackTransform = `translateX(calc(-${index * 100}% + ${dragOffset}%))`;

  return (
    <section id="best-sellers" className="py-10 md:py-12">
      <div className="mx-auto max-w-7xl px-4">
        <FadeIn direction="up" amount={0.3}>
          <div className="flex flex-col items-start md:items-center lg:items-start">
            <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-600">
              {t("eyebrow")}
            </h2>
            <p className="mt-3 text-3xl font-semibold text-stone-900 md:text-4xl">
              {t("title")}
            </p>
            <p className="mt-3 max-w-2xl text-sm text-stone-500">
              {t("intro")}
            </p>
          </div>
        </FadeIn>

        {isLoading && total === 0 && (
          <p className="mt-10 text-sm text-stone-500">{t("loading")}</p>
        )}

        {!isLoading && total === 0 && !isError && (
          <p className="mt-10 text-sm text-stone-500">{t("empty")}</p>
        )}

        {total > 0 && (
          <div className="mt-12">
            <div
              className="relative overflow-hidden select-none"
              ref={viewportRef}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerEnd}
              onPointerLeave={handlePointerEnd}
            >
              <div className="absolute inset-y-0 left-0 z-10 hidden items-center lg:flex">
                <button
                  type="button"
                  aria-label={t("prev")}
                  className="rounded-full cursor-pointer border border-amber-200 bg-white/80 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-white"
                  onClick={goPrev}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                >
                  <span aria-hidden="true">‹</span>
                </button>
              </div>

              <div className="absolute inset-y-0 right-0 z-10 hidden items-center lg:flex">
                <button
                  type="button"
                  aria-label={t("next")}
                  className="rounded-full cursor-pointer border border-amber-200 bg-white/80 px-4 py-2 text-sm font-medium text-stone-800 shadow-sm hover:bg-white"
                  onClick={goNext}
                  onPointerDown={(e) => e.stopPropagation()}
                  onPointerUp={(e) => e.stopPropagation()}
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>

              <div className="overflow-hidden">
                <div
                  ref={trackRef}
                  onTransitionEnd={handleTransitionEnd}
                  className={`flex ${
                    enableTransition && !isDragging
                      ? "transition-transform duration-500 ease-out"
                      : ""
                  }`}
                  style={{ transform: trackTransform }}
                >
                  {slides.map((item, idx) => {
                    const isActive =
                      item.name === bestSellers[visibleIndex].name &&
                      idx % total === visibleIndex;

                    return (
                      <div
                        key={`${item.name}-${idx}`}
                        className="w-full shrink-0 px-1 md:px-3 bg-amber-50 shadow-lg"
                      >
                        <div className="flex flex-col gap-10 p-6 lg:h-[520px] lg:flex-row lg:items-stretch">
                          <div className="flex-1 space-y-4 text-stone-900">
                            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
                              {t("signatureLabel")}
                            </p>
                            <h3 className="text-2xl font-semibold md:text-3xl">
                              {item.name}
                            </h3>
                            <p className="text-sm text-stone-600">
                              {item.description}
                            </p>

                            <div className="mt-8 grid gap-6 md:grid-cols-2">
                              {item.stats.map((stat) => (
                                <ProgressBar
                                  key={`${item.name}-${stat.label}`}
                                  label={stat.label}
                                  value={stat.value}
                                  active={isActive}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex flex-1 items-center">
                            <Link
                              href="/products"
                              className="block h-80 w-full overflow-hidden rounded-tl-3xl rounded-bl-3xl bg-stone-100 md:h-[420px] lg:h-full"
                              onDragStart={(e) => e.preventDefault()}
                            >
                              <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full object-cover"
                                draggable={false}
                                onDragStart={(e) => e.preventDefault()}
                              />
                            </Link>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="mt-10 flex justify-center gap-3">
              {bestSellers.map((_, idx) => {
                const isActive = idx === visibleIndex;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => goTo(idx)}
                    className={`h-2 rounded-full border border-amber-500 transition-all cursor-pointer ${
                      isActive ? "w-6 bg-amber-500" : "w-2 bg-transparent"
                    }`}
                    aria-label={t("goToSlide", { index: idx + 1 })}
                  />
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
import Link from "next/link";
