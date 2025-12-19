/* eslint-disable @next/next/no-img-element */

import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale, Product } from "@/types/content";
import ProductShowcase from "@/components/animation/ProductShowcase";
import TextOnScroll from "@/components/animation/TextOnScroll";
import BestSellersSection from "@/components/home/BestSellers";
import HomeStoryAndStats from "@/components/home/HomeStory";
import { StackSlider } from "@/components/animation/StackSlider";
import FadeIn from "@/components/animation/FadeIn";
import ScrollStrokePage from "@/components/animation/ScrollStrokePage";
import { fetchBestSellers, fetchSignatureLineup } from "./_data/home";

// Next.js requires segment config values to be statically analyzable in the same file.
export const revalidate = 300;

type ShowcaseItem = {
  id: string;
  name: string;
  description: string;
  img: string;
  route: string;
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

function mapProductsToShowcaseItems(products: Product[]): ShowcaseItem[] {
  const fallbackImg = "/Signature/1.jpg";

  return (products || []).map((p) => {
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
      route: p.slug
        ? `/products?slug=${encodeURIComponent(p.slug)}`
        : "/products",
    };
  });
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home");

  const baseUrl = (
    process.env.NEXT_PUBLIC_APP_URL || "https://dropincafe.com.vn"
  ).replace(/\/$/, "");
  const localePath = locale === "en" ? "en" : "vi";
  const pageUrl = `${baseUrl}/${localePath}`;

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@type": "CafeOrCoffeeShop",
    name: "Drop In Cafe",
    url: pageUrl,
    image: `${baseUrl}/Logo/Logo1.jpg`,
    address: {
      addressLocality: "Hanoi",
      addressCountry: "VN",
    },
    servesCuisine: ["Coffee", "Tea"],
    sameAs: [
      "https://www.facebook.com/dropincafe",
      "https://www.instagram.com/dropincafe",
    ],
  };

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

  const stackSliderSlides = sliderItems.slice(0, 6).map((item) => ({
    title: item.name,
    image: item.img,
  }));

  let signatureProducts: Product[] = [];
  let bestSellerProducts: Product[] = [];

  try {
    signatureProducts = await fetchSignatureLineup(locale, 6);
  } catch (err) {
    console.error("FETCH_SIGNATURE_LINEUP_FAILED", err);
  }

  try {
    bestSellerProducts = await fetchBestSellers(locale, 4);
  } catch (err) {
    console.error("FETCH_BEST_SELLERS_FAILED", err);
  }

  const signatureItems =
    signatureProducts.length > 0
      ? mapProductsToShowcaseItems(signatureProducts)
      : FALLBACK_SIGNATURE_ITEMS;
  const signatureHasServerData = signatureProducts.length > 0;
  const signatureUsingFallback =
    signatureProducts.length === 0 && signatureItems.length > 0;

  return (
    <main className="min-h-screen">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd) }}
      />

      {stackSliderSlides.length > 0 && (
        <section className="stack-slider-section py-12 text-stone-900 relative">
          <div className="mx-auto mt-6 max-w-6xl px-4">
            <StackSlider slides={stackSliderSlides} />
          </div>
        </section>
      )}

      <section className="bg-linear-to-r from-amber-500 to-rose-400 text-white">
        <FadeIn direction="right">
          <div className="mx-auto flex w-full flex-col gap-10 lg:flex-row lg:items-center">
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

            <div className="relative w-full lg:w-1/2">
              <TextOnScroll className="text-lg sm:text-xl md:text-2xl text-white leading-snug text-balance">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 text-white text-balance">
                  {hero.title}
                </h2>
                {hero.lines.map((line) => (
                  <p key={line}>{line}</p>
                ))}
              </TextOnScroll>
            </div>

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

      <FadeIn direction="left">
        <BestSellersSection items={bestSellerProducts} />
      </FadeIn>

      <FadeIn direction="right">
        <HomeStoryAndStats />
      </FadeIn>

      <section>
        <ScrollStrokePage />
      </section>

      <section id="product-showcase" className="mx-auto mt-12 max-w-6xl px-4">
        <div className="text-center">
          <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-amber-600">
            {signatureText.heading}
          </p>
          <p className="mt-2 text-sm text-stone-500">{signatureText.sub}</p>
        </div>

        {!signatureHasServerData && !signatureUsingFallback && (
          <p className="mt-6 text-sm text-stone-500">{signatureText.loading}</p>
        )}

        {!signatureHasServerData && signatureItems.length === 0 && (
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
