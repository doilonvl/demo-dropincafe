/* eslint-disable @next/next/no-img-element */
"use client";

import { useTranslations } from "next-intl";
import FadeIn from "@/components/animation/FadeIn";

export default function HomeStoryAndStats() {
  const t = useTranslations("homeStory");

  return (
    <>
      {/* STATS SECTION */}
      <section
        id="stats"
        className="relative mt-20 bg-fixed bg-center bg-no-repeat bg-cover bg-[url(/PShowcase/2.jpg)]"
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-stone-950/80" />

        {/* content */}
        <div className="container relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-15 md:flex-row lg:gap-22">
          <FadeIn direction="left">
            <div className="stats-item">
              <h1 className="counter">40+</h1>
              <h2>{t("stat1")}</h2>
            </div>
          </FadeIn>

          <Divider idSuffix="1" />

          <FadeIn direction="down">
            <div className="stats-item">
              <h1 className="counter">200K+</h1>
              <h2>{t("stat2")}</h2>
            </div>
          </FadeIn>

          <Divider idSuffix="2" />

          <FadeIn direction="right">
            <div className="stats-item">
              <h1 className="counter">4.8+</h1>
              <h2>{t("stat3")}</h2>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="story">
        <div className="flex h-screen max-h-[1100px] w-full max-w-none justify-end bg-[url(/PShowcase/3.jpg)] bg-cover bg-center bg-no-repeat">
          <div className="h-full w-full bg-stone-950/60 lg:w-2/3">
            <div className="container relative flex h-full items-center justify-center md:justify-end 2xl:justify-center">
              <div className="absolute top-1/2 right-1/2 hidden -translate-y-1/2 md:block 2xl:translate-x-0">
                <h1 className="text-center text-[140px] font-bold leading-[120px] uppercase text-amber-50/25 -rotate-90">
                  DROP IN
                  <br />
                  CAFE
                </h1>
              </div>

              <FadeIn direction="left" amount={0.3}>
                <div className="relative mx-auto max-w-xl">
                  <div className="mb-9">
                    <h2 className="sub_heading text-amber-200! text-3xl">
                      {t("eyebrow")}
                    </h2>
                    <h1 className="main_heading text-white text-2xl">
                      {t("title")}
                    </h1>
                  </div>

                  <p className="text-1.5xl text-stone-200 md:text-base">
                    {t("body")}
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function Divider({ idSuffix }: { idSuffix: string }) {
  return (
    <svg
      viewBox="-1 -1 3 137"
      width="3"
      height="137"
      className="hidden md:block"
    >
      <defs>
        <linearGradient
          id={`lineGradientStats${idSuffix}`}
          x1="0"
          y1="0"
          x2="-5.90104e-06"
          y2="135"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="white" stopOpacity="0" />
          <stop offset="0.494792" stopColor="white" />
          <stop offset="1" stopColor="white" stopOpacity="0" />
        </linearGradient>
      </defs>
      <line
        x1="0.5"
        y1="0"
        x2="0.5"
        y2="135"
        stroke={`url(#lineGradientStats${idSuffix})`}
        strokeOpacity="0.3"
        fill="none"
      />
    </svg>
  );
}
