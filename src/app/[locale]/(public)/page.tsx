/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @next/next/no-img-element */
"use client";

import Image from "next/image";
import { useMemo } from "react";
import ProductShowcase from "@/components/animation/ProductShowcase";
import ProductSlider from "@/components/animation/Slider";
import TextOnScroll from "@/components/animation/TextOnScroll";
import BestSellersSection from "@/components/home/BestSellers";
import HomeStoryAndStats from "@/components/home/HomeStory";
import { StackSlider } from "@/components/animation/StackSlider";
import FadeIn from "@/components/animation/FadeIn";
import { useSignatureLineupShowcase } from "@/features/products/useSignatureLineupShowcase";
import { useLocale, useTranslations } from "next-intl";
import type { Locale } from "@/types/content";

export default function HomePage() {
  const locale = useLocale() as Locale;
  const t = useTranslations("home");

  const sliderItems = [
    {
      name: t("slider.item1.name"),
      description: t("slider.item1.description"),
      img: "/Home/home1.jpg",
      route: "/products/signature-blend",
    },
    {
      name: t("slider.item2.name"),
      description: t("slider.item2.description"),
      img: "/Home/home2.jpg",
      route: "/products/cold-brew-citrus",
    },
    {
      name: t("slider.item3.name"),
      description: t("slider.item3.description"),
      img: "/Home/home5.jpg",
      route: "/products/caramel-macchiato",
    },
    {
      name: t("slider.item4.name"),
      description: t("slider.item4.description"),
      img: "/Home/home4.jpg",
      route: "/products/classic-latte",
    },
  ];

  const hero = {
    title: t("hero.title"),
    lines: [
      t("hero.line1"),
      t("hero.line2"),
      t("hero.line3"),
      t("hero.line4"),
      t("hero.line5"),
    ],
  };

  const signatureText = {
    heading: t("signature.heading"),
    sub: t("signature.sub"),
    loading: t("signature.loading"),
    empty: t("signature.empty"),
  };

  const {
    items: signatureItems,
    isLoading: isSignatureLoading,
    isError: isSignatureError,
  } = useSignatureLineupShowcase(locale, 6);

  const stackSliderSlides = useMemo(
    () =>
      sliderItems.slice(0, 6).map((item) => ({
        title: item.name,
        image: item.img,
      })),
    [sliderItems]
  );

  return (
    <main className="min-h-screen">
      {/* Stack slider */}
      {stackSliderSlides.length > 0 && (
        <section className="stack-slider-section py-12 text-stone-900 relative">
          <div className="mx-auto mt-6 max-w-6xl px-4">
            <StackSlider slides={stackSliderSlides} />
          </div>
        </section>
      )}

      {/* Product slider */}
      {/* <section className="relative">
        <ProductSlider
          items={sliderItems}
          autoPlay
          autoPlayDelay={4200}
          transitionDuration={0.65}
        />
      </section> */}

      {/* Text on scroll */}
      <section className="bg-linear-to-r from-amber-500 to-rose-400 text-white">
        <FadeIn direction="right">
          <div className="mx-auto flex w-full flex-col gap-10 lg:flex-row lg:items-center">
            {/* Left image */}
            <div className="hidden lg:block w-full max-w-sm mx-auto overflow-hidden border border-white/20 shadow-2xl lg:mx-0 lg:ml-auto">
              <div className="relative h-80 w-full sm:h-80 md:h-80 lg:h-[360px]">
                <Image
                  src="/Logo/Logo5.jpg"
                  alt="Drop In Cafe interior"
                  fill
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover"
                  loading="eager"
                />
              </div>
            </div>

            {/* Center text */}
            <div className="relative w-full lg:w-1/2">
              <TextOnScroll className="text-xl sm:text-2xl text-white">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  {hero.title}
                </h2>
                {hero.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </TextOnScroll>
            </div>

            {/* Right image */}
            <div className="hidden lg:block w-full max-w-sm mx-auto overflow-hidden border border-white/20 shadow-2xl lg:mx-0 lg:ml-auto">
              <div className="relative h-80 w-full sm:h-80 md:h-80 lg:h-[360px]">
                <Image
                  src="/Logo/Logo11.jpg"
                  alt="Drop In Cafe interior"
                  fill
                  sizes="(min-width: 1024px) 320px, 100vw"
                  className="object-cover"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Best sellers */}
      <FadeIn direction="left">
        <BestSellersSection />
      </FadeIn>

      {/* Home story and stats */}
      <FadeIn direction="right">
        <HomeStoryAndStats />
      </FadeIn>

      {/* Signature line */}
      <section id="product-showcase" className="mx-auto mt-12 max-w-6xl px-4">
        <div className="text-center">
          <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-amber-600">
            {signatureText.heading}
          </p>
          <p className="mt-2 text-sm text-stone-500">{signatureText.sub}</p>
        </div>

        {isSignatureLoading && signatureItems.length === 0 && (
          <p className="mt-6 text-sm text-stone-500">{signatureText.loading}</p>
        )}

        {!isSignatureLoading &&
          !isSignatureError &&
          signatureItems.length === 0 && (
            <p className="mt-6 text-sm text-stone-500">{signatureText.empty}</p>
          )}

        {signatureItems.length > 0 && (
          <ProductShowcase
            items={signatureItems}
            yOffset={500}
            duration={0.9}
            stagger={0.18}
            start="top 65%"
          />
        )}
      </section>
    </main>
  );
}
