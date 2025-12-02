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
        className="slider-text pointer-events-none absolute inset-0 grid place-items-center px-6 text-center"
        ref={textRef}
      >
        <div className="max-w-2xl space-y-1.5 px-8 py-6 text-white shadow-2xl backdrop-blur-[1px]">
          <h3 className="slider-title text-4xl sm:text-5xl font-bold tracking-tight drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
            {current.name}
          </h3>
          <p className="slider-desc text-lg sm:text-xl text-white/90 drop-shadow-[0_1px_6px_rgba(0,0,0,0.35)]">
            {current.description}
          </p>
        </div>
      </div>
    </section>
  );
}
