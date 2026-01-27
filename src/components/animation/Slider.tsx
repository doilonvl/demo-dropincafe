/* eslint-disable react-hooks/rules-of-hooks */
/* eslint-disable @next/next/no-img-element */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";

type Product = {
  name: string;
  description: string;
  img: string;
  route: string;
};

type Props = {
  items: Product[];
  autoPlay?: boolean;
  autoPlayDelay?: number; // ms
  transitionDuration?: number; // s
};

export default function ProductSlider({
  items,
  autoPlay = true,
  autoPlayDelay = 4500,
  transitionDuration = 0.7,
}: Props) {
  const trackRef = useRef<HTMLDivElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const textRef = useRef<HTMLDivElement | null>(null);
  const [index, setIndex] = useState(() => items.length || 0);
  const [isDragging, setIsDragging] = useState(false);
  const [textColor, setTextColor] = useState<"light" | "dark">("light");
  const dragRef = useRef({
    startX: 0,
    dragging: false,
    baseIndex: 0,
  });

  // duplicate items for seamless-looking loop (start in the middle copy)
  const slides = useMemo(() => [...items, ...items, ...items], [items]);
  const total = items.length;

  if (total === 0) return null;

  // normalize index and movement
  useEffect(() => {
    if (!trackRef.current || total === 0) return;

    // wrap index to stay in middle copy to avoid jump
    if (index >= total * 2) {
      const wrapped = index - total;
      gsap.set(trackRef.current, { xPercent: -(100 * wrapped) });
      setIndex(wrapped);
      return;
    }
    if (index < total) {
      const wrapped = index + total;
      gsap.set(trackRef.current, { xPercent: -(100 * wrapped) });
      setIndex(wrapped);
      return;
    }

    gsap.to(trackRef.current, {
      xPercent: -(100 * index),
      duration: transitionDuration,
      ease: "power3.out",
    });
  }, [index, total, transitionDuration]);

  // text animation
  useEffect(() => {
    if (!textRef.current) return;
    const tl = gsap.timeline();
    const title = textRef.current.querySelector(
      ".slider-title"
    ) as Element | null;
    const desc = textRef.current.querySelector(
      ".slider-desc"
    ) as Element | null;
    if (title) {
      tl.fromTo(
        title,
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.6, ease: "power3.out" }
      );
    }
    if (desc) {
      tl.fromTo(
        desc,
        { y: 15, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.5, ease: "power3.out" },
        "-=0.2"
      );
    }
    return () => {
      tl.kill();
    };
  }, [index]);

  // autoplay
  useEffect(() => {
    if (!autoPlay || isDragging) return;
    const id = setInterval(() => setIndex((i) => i + 1), autoPlayDelay);
    return () => clearInterval(id);
  }, [autoPlay, autoPlayDelay, isDragging]);

  // drag/swipe
  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault(); // stop native image/link drag
    if (!viewportRef.current) return;
    dragRef.current = {
      startX: e.clientX,
      dragging: true,
      baseIndex: index,
    };
    setIsDragging(true);
    viewportRef.current.setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging || !trackRef.current || !viewportRef.current)
      return;
    const dx = e.clientX - dragRef.current.startX;
    const width = viewportRef.current.clientWidth || 1;
    const offsetPercent =
      -(100 * dragRef.current.baseIndex) + (dx / width) * 100;
    gsap.set(trackRef.current, { xPercent: offsetPercent });
  };

  const handlePointerEnd = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.dragging || !viewportRef.current) return;
    dragRef.current.dragging = false;
    setIsDragging(false);
    viewportRef.current.releasePointerCapture(e.pointerId);
    const dx = e.clientX - dragRef.current.startX;
    const width = viewportRef.current.clientWidth || 1;
    const threshold = width * 0.1; // 10% drag to change slide
    const direction = dx > threshold ? -1 : dx < -threshold ? 1 : 0;
    if (direction === 0) {
      if (trackRef.current) {
        gsap.to(trackRef.current, {
          xPercent: -(100 * dragRef.current.baseIndex),
          duration: 0.25,
          ease: "power2.out",
        });
      }
    } else {
      setIndex((i) => i + direction);
    }
  };

  const current = items[((index % total) + total) % total];

  // derive text color from current image brightness
  useEffect(() => {
    const imgSrc = current?.img;
    if (!imgSrc) return;

    const img = new Image();
    img.src = imgSrc;

    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const sampleSize = 32;
        canvas.width = sampleSize;
        canvas.height = sampleSize;
        ctx.drawImage(img, 0, 0, sampleSize, sampleSize);
        const data = ctx.getImageData(0, 0, sampleSize, sampleSize).data;
        let totalLuminance = 0;
        const count = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          // perceived luminance
          totalLuminance += 0.2126 * r + 0.7152 * g + 0.0722 * b;
        }

        const avg = totalLuminance / count;
        setTextColor(avg > 140 ? "dark" : "light");
      } catch {
        setTextColor("light");
      }
    };

    img.onerror = () => setTextColor("light");
  }, [current?.img]);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const root = document.documentElement;
    root.dataset.heroTone = textColor;
    return () => {
      if (root.dataset.heroTone === textColor) {
        delete root.dataset.heroTone;
      }
    };
  }, [textColor]);

  return (
    <section className="slider relative w-full overflow-hidden">
      <div
        className="slider-viewport relative w-full h-screen min-h-[520px] overflow-hidden touch-pan-y"
        ref={viewportRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerEnd}
        onPointerLeave={handlePointerEnd}
      >
        <div className="slider-track flex w-full h-full" ref={trackRef}>
          {slides.map((item, idx) => (
            <a
              className="slide relative h-full w-full shrink-0"
              href={item.route}
              key={`${item.route}-${idx}`}
              draggable={false}
              onDragStart={(e) => e.preventDefault()}
            >
              <div className="slide-img absolute inset-0 overflow-hidden">
                <img
                  className="h-full w-full object-cover"
                  src={item.img}
                  alt={item.name}
                  draggable={false}
                />
              </div>
            </a>
          ))}
        </div>
      </div>

      <div
        className="slider-text pointer-events-none absolute bottom-0 left-0 px-6 pb-8 text-left sm:px-10 sm:pb-12"
        ref={textRef}
      >
        <div
          className={`max-w-sm space-y-1 px-4 py-3 ${
            textColor === "dark" ? "text-stone-900" : "text-white"
          }`}
          style={{
            textShadow:
              textColor === "dark"
                ? "0 1px 6px rgba(255,255,255,0.45)"
                : "0 2px 10px rgba(0,0,0,0.45)",
          }}
        >
          <h3 className="slider-title text-2xl sm:text-3xl font-semibold tracking-tight">
            {current.name}
          </h3>
          <p
            className={`slider-desc text-sm sm:text-base ${
              textColor === "dark" ? "text-stone-800" : "text-white/85"
            }`}
          >
            {current.description}
          </p>
        </div>
      </div>
    </section>
  );
}
