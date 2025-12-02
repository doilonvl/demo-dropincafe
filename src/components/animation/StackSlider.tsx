/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-expressions */
"use client";

import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { geistSansLocal, geistMonoLocal } from "./StackSliderFont";

gsap.registerPlugin(SplitText);

type StackSlide = {
  title: string;
  image: string;
};

type StackSliderConfig = {
  sliderClass?: string;
  slideClass?: string;
  imageClass?: string;
  titleClass?: string;
  wheelThreshold?: number;
  touchThreshold?: number;
  depthStep?: number;
  maxVisible?: number;
};

type StackSliderInstance = { destroy: () => void };

const DEFAULT_CONFIG = {
  wheelThreshold: 100,
  touchThreshold: 50,
  depthStep: 15,
  maxVisible: 5,
};

export function createStackSlider(
  container: HTMLElement,
  slides: StackSlide[],
  config: StackSliderConfig = {}
): StackSliderInstance {
  if (!container) throw new Error("Missing container element");
  if (!slides?.length) throw new Error("slides array is required");

  const merged = { ...DEFAULT_CONFIG, ...config };
  const visibleCount = Math.min(
    merged.maxVisible ?? DEFAULT_CONFIG.maxVisible,
    slides.length
  );

  const slider = document.createElement("div");
  slider.className = merged.sliderClass || "stack-slider-track";
  container.appendChild(slider);

  let frontIndex = 0;
  let isAnimating = false;
  let wheelAccumulator = 0;

  const classNames = {
    slide: merged.slideClass || "stack-slide",
    img: merged.imageClass || "stack-slide-image",
    title: merged.titleClass || "stack-slide-title",
  };

  function buildSlide(data: StackSlide) {
    const el = document.createElement("div");
    el.className = classNames.slide;
    el.innerHTML = `
      <img src="${data.image}" alt="${data.title}" class="${classNames.img}" loading="lazy" />
      <h1 class="${classNames.title}">${data.title}</h1>
    `;
    const title = el.querySelector(
      `.${classNames.title}`
    ) as HTMLElement | null;
    const split = title
      ? new SplitText(title, { type: "words", mask: "words" })
      : null;
    return { el, split };
  }

  function layoutSlides() {
    const all = slider.querySelectorAll(`.${classNames.slide}`);
    all.forEach((slide, i) => {
      const isHidden = i > visibleCount - 1;
      gsap.set(slide, {
        y: -merged.depthStep + merged.depthStep * i + "%",
        z: merged.depthStep * i,
        opacity: isHidden ? 0 : 1,
      });
    });
  }

  function init() {
    slides.slice(0, visibleCount).forEach((data) => {
      const { el } = buildSlide(data);
      slider.appendChild(el);
    });
    layoutSlides();
  }

  function animateDown() {
    const all = slider.querySelectorAll(`.${classNames.slide}`);
    if (slides.length === 1 || all.length === 0) {
      isAnimating = false;
      return;
    }
    const first = all[0];
    frontIndex = (frontIndex + 1) % slides.length;
    const newBackIdx = (frontIndex + (visibleCount - 1)) % slides.length;
    const nextData = slides[newBackIdx];
    const { el, split } = buildSlide(nextData);

    if (split?.words) gsap.set(split.words, { yPercent: 100 });
    slider.appendChild(el);
    gsap.set(el, {
      y: -merged.depthStep + merged.depthStep * visibleCount + "%",
      z: merged.depthStep * visibleCount,
      opacity: 0,
    });

    const updated = slider.querySelectorAll(`.${classNames.slide}`);
    updated.forEach((slide, i) => {
      const target = i - 1;
      const isOutOfFrame = target < 0 || target > visibleCount - 1;
      gsap.to(slide, {
        y: -merged.depthStep + merged.depthStep * target + "%",
        z: merged.depthStep * target,
        opacity: isOutOfFrame ? 0 : 1,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          if (i === 0) {
            first.remove();
            isAnimating = false;
          }
        },
      });
    });

    if (split?.words) {
      gsap.to(split.words, {
        yPercent: 0,
        duration: 0.75,
        ease: "power4.out",
        stagger: 0.15,
        delay: 0.5,
      });
    }
  }

  function animateUp() {
    const all = slider.querySelectorAll(`.${classNames.slide}`);
    if (slides.length === 1 || all.length === 0) {
      isAnimating = false;
      return;
    }
    const last = all[all.length - 1];
    frontIndex = (frontIndex - 1 + slides.length) % slides.length;
    const prevData = slides[frontIndex];
    const { el, split } = buildSlide(prevData);

    slider.prepend(el);
    if (split?.words) gsap.set(split.words, { yPercent: 100 });
    gsap.set(el, {
      y: -merged.depthStep + merged.depthStep * -1 + "%",
      z: merged.depthStep * -1,
      opacity: 0,
    });

    const updated = Array.from(slider.querySelectorAll(`.${classNames.slide}`));
    updated.forEach((slide, i) => {
      const isHidden = i > visibleCount - 1;
      gsap.to(slide, {
        y: -merged.depthStep + merged.depthStep * i + "%",
        z: merged.depthStep * i,
        opacity: isHidden ? 0 : 1,
        duration: 1,
        ease: "power3.inOut",
        onComplete: () => {
          if (i === updated.length - 1) {
            last.remove();
            isAnimating = false;
          }
        },
      });
    });

    if (split?.words) {
      gsap.to(split.words, {
        yPercent: 0,
        duration: 0.75,
        ease: "power4.out",
        stagger: 0.15,
        delay: 0.45,
      });
    }
  }

  function handleChange(dir = "down") {
    if (isAnimating || slides.length <= 1) return;
    isAnimating = true;
    dir === "down" ? animateDown() : animateUp();
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault();
    if (isAnimating) return;
    wheelAccumulator += Math.abs(e.deltaY);
    if (
      wheelAccumulator >=
      (merged.wheelThreshold ?? DEFAULT_CONFIG.wheelThreshold)
    ) {
      wheelAccumulator = 0;
      handleChange(e.deltaY > 0 ? "down" : "up");
    }
  }

  const touch = { startY: 0, startX: 0 };
  function onTouchStart(e: TouchEvent) {
    touch.startY = e.touches[0].clientY;
    touch.startX = e.touches[0].clientX;
  }
  function onTouchEnd(e: TouchEvent) {
    if (isAnimating) return;
    const endY = e.changedTouches[0].clientY;
    const endX = e.changedTouches[0].clientX;
    const deltaY = touch.startY - endY;
    const deltaX = Math.abs(touch.startX - endX);
    const threshold = merged.touchThreshold ?? DEFAULT_CONFIG.touchThreshold;
    if (Math.abs(deltaY) > deltaX && Math.abs(deltaY) > threshold) {
      handleChange(deltaY > 0 ? "down" : "up");
    }
  }

  container.addEventListener("wheel", onWheel, { passive: false });
  container.addEventListener("touchstart", onTouchStart, { passive: true });
  container.addEventListener("touchend", onTouchEnd, { passive: true });

  init();

  return {
    destroy() {
      container.removeEventListener("wheel", onWheel);
      container.removeEventListener("touchstart", onTouchStart);
      container.removeEventListener("touchend", onTouchEnd);
      slider.remove();
    },
  };
}

type StackSliderProps = {
  slides: StackSlide[];
  className?: string;
};

export function StackSlider({ slides, className }: StackSliderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const sliderRef = useRef<StackSliderInstance | null>(null);
  const lastWidthRef = useRef<number | null>(null);
  const widthBucketRef = useRef<string | null>(null);

  const memoSlides = useMemo(
    () => slides.filter((item) => item && item.title && item.image),
    [slides]
  );

  const getWidthBucket = () => {
    const w = window.innerWidth;
    if (w < 640) return "sm";
    if (w < 1024) return "md";
    if (w < 1280) return "lg";
    return "xl";
  };

  useEffect(() => {
    if (!containerRef.current || memoSlides.length === 0) return;

    let cancelled = false;

    const initSlider = async () => {
      // Chờ font sẵn sàng để tránh SplitText cảnh báo
      try {
        if ((document as any).fonts?.ready) {
          await (document as any).fonts.ready;
        }
      } catch {
        // ignore
      }
      if (cancelled || !containerRef.current) return;

      sliderRef.current?.destroy();
      lastWidthRef.current = window.innerWidth;
      widthBucketRef.current = getWidthBucket();
      sliderRef.current = createStackSlider(containerRef.current!, memoSlides, {
        sliderClass: "stack-slider-track",
        slideClass: "stack-slide",
        imageClass: "stack-slide-image",
        titleClass: "stack-slide-title",
        wheelThreshold: 100,
        touchThreshold: 50,
        depthStep: 15,
        maxVisible: Math.min(5, memoSlides.length),
      });
    };

    initSlider();

    let resizeTimer: ReturnType<typeof setTimeout> | null = null;
    const handleResize = () => {
      if (resizeTimer) clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const currentWidth = window.innerWidth;
        const lastWidth = lastWidthRef.current;
        const bucket = getWidthBucket();
        if (
          lastWidth !== null &&
          Math.abs(currentWidth - lastWidth) < 48 &&
          bucket === widthBucketRef.current
        )
          return;
        initSlider();
      }, 200);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeTimer) clearTimeout(resizeTimer);
      sliderRef.current?.destroy();
      cancelled = true;
    };
  }, [memoSlides]);

  return (
    <div
      className={`stack-slider-shell ${geistSansLocal.variable} ${
        geistMonoLocal.variable
      } ${className ?? ""}`}
    >
      <div ref={containerRef} className="stack-slider-stage" />
    </div>
  );
}
