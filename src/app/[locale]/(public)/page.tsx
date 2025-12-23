import type { Metadata } from "next";
import Image from "next/image";
import { getLocale, getTranslations } from "next-intl/server";
import type { Locale, Product } from "@/types/content";
import { getSiteUrl } from "@/lib/env";
import ProductShowcase from "@/components/animation/ProductShowcase";
import TextOnScroll from "@/components/animation/TextOnScroll";
import BestSellersSection from "@/components/home/BestSellers";
import HomeStoryAndStats from "@/components/home/HomeStory";
import { StackSlider } from "@/components/animation/StackSlider";
import FadeIn from "@/components/animation/FadeIn";
import ScrollStrokePage from "@/components/animation/ScrollStrokePage";
import { getProductDetailPath, getProductsListingPath } from "@/lib/routes";
import { fetchBestSellers, fetchSignatureLineup } from "./_data/home";

export const revalidate = 300;

const BASE_URL = getSiteUrl();
const DEFAULT_OG_IMAGE = "https://www.dropincafe.com.vn/Home/home3.jpg";

const HOME_META = {
  vi: {
    title:
      "Drop In Cafe – Cà phê trứng & specialty coffee bên đường tàu Hà Nội",
    description:
      "Drop In Cafe tại 163 Phùng Hưng, Phố Cổ Hà Nội, nổi tiếng với cà phê trứng, coconut coffee và không gian chill ngay cạnh phố đường tàu lịch sử. Ghé quán, ngồi nhìn tàu chạy hoặc đặt mang đi đúng giờ bạn cần.",
  },
  en: {
    title: "Drop In Cafe – Egg coffee & specialty coffee by Hanoi Train Street",
    description:
      "Drop In Cafe at 163 Phung Hung, Hanoi Old Quarter, serving egg coffee, coconut coffee and specialty drinks in a cozy spot right next to the historic train street. Visit, sit for a train, or order takeout on time.",
  },
} as const;

function getLocalePrefix(locale: Locale) {
  return locale === "en" ? "/en" : "";
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const meta = HOME_META[locale === "en" ? "en" : "vi"];
  const prefix = getLocalePrefix(locale);
  const canonical = prefix ? `${BASE_URL}${prefix}` : `${BASE_URL}/`;

  return {
    title: { absolute: meta.title },
    description: meta.description,
    alternates: {
      canonical,
      languages: {
        "vi-VN": `${BASE_URL}/`,
        en: `${BASE_URL}/en`,
      },
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      url: canonical,
      type: "website",
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.title,
      description: meta.description,
      images: [DEFAULT_OG_IMAGE],
    },
  };
}

type ShowcaseItem = {
  id: string;
  name: string;
  description: string;
  img: string;
  route: string;
};

type ShowcaseSeedItem = Omit<ShowcaseItem, "route"> & { slug: string };

const FALLBACK_SIGNATURE_ITEMS: ShowcaseSeedItem[] = [
  {
    id: "fallback-1",
    name: "Signature Blend",
    description: "Bold aroma from beans roasted fresh each day.",
    img: "/Signature/1.jpg",
    slug: "signature-blend",
  },
  {
    id: "fallback-2",
    name: "Cold Brew Citrus",
    description: "Deep-cold brew with a light citrus twist.",
    img: "/Signature/2.jpg",
    slug: "cold-brew-citrus",
  },
  {
    id: "fallback-3",
    name: "Classic Latte",
    description: "Steamed milk and gentle foam for slow mornings.",
    img: "/Signature/3.jpg",
    slug: "classic-latte",
  },
  {
    id: "fallback-4",
    name: "Matcha Fusion",
    description: "Creamy matcha layered with robust espresso.",
    img: "/Signature/4.jpg",
    slug: "matcha-fusion",
  },
  {
    id: "fallback-5",
    name: "Hazelnut Cappuccino",
    description: "Toasted hazelnut notes with silky foam.",
    img: "/Signature/5.jpg",
    slug: "hazelnut-cappuccino",
  },
  {
    id: "fallback-6",
    name: "Vietnamese Phin",
    description: "Traditional phin brew with a chocolaty finish.",
    img: "/Signature/6.jpg",
    slug: "vietnamese-phin",
  },
];

function mapProductsToShowcaseItems(
  products: Product[],
  locale: Locale
): ShowcaseItem[] {
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
        ? getProductDetailPath(locale, p.slug)
        : getProductsListingPath(locale),
    };
  });
}

export default async function HomePage() {
  const locale = (await getLocale()) as Locale;
  const t = await getTranslations("home");

  const baseUrl = BASE_URL;
  const localePrefix = locale === "en" ? "/en" : "";
  const pageUrl = localePrefix ? `${baseUrl}${localePrefix}` : `${baseUrl}/`;

  const alternateNames = ["Dropin Cafe", "Dropincafe", "Drop In Cafe Hanoi"];

  const homeJsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "CafeOrCoffeeShop",
        "@id": `${pageUrl}#cafe`,
        name: "Drop In Cafe",
        alternateName: alternateNames,
        url: pageUrl,
        image: `${baseUrl}/Logo/Logo1.jpg`,
        address: {
          addressLocality: "Hanoi",
          addressCountry: "VN",
        },
        servesCuisine: ["Coffee", "Tea"],
        sameAs: [
          "https://www.facebook.com/dropincafevn",
          "https://www.instagram.com/dropincafevn",
        ],
      },
      {
        "@type": "WebSite",
        "@id": `${pageUrl}#website`,
        name: "Drop In Cafe",
        alternateName: alternateNames,
        url: pageUrl,
        inLanguage: locale === "en" ? "en" : "vi-VN",
      },
    ],
  };

  const sliderItems = [
    {
      name: t("slider.item1.name"),
      description: t("slider.item1.description"),
      img: "/Home/home1.jpg",
      route: getProductDetailPath(locale, "signature-blend"),
    },
    {
      name: t("slider.item2.name"),
      description: t("slider.item2.description"),
      img: "/Home/home2.jpg",
      route: getProductDetailPath(locale, "cold-brew-citrus"),
    },
    {
      name: t("slider.item3.name"),
      description: t("slider.item3.description"),
      img: "/Home/home5.jpg",
      route: getProductDetailPath(locale, "caramel-macchiato"),
    },
    {
      name: t("slider.item4.name"),
      description: t("slider.item4.description"),
      img: "/Home/home4.jpg",
      route: getProductDetailPath(locale, "classic-latte"),
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
      ? mapProductsToShowcaseItems(signatureProducts, locale)
      : FALLBACK_SIGNATURE_ITEMS.map((item) => ({
          ...item,
          route: getProductDetailPath(locale, item.slug),
        }));
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
