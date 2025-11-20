/* eslint-disable @typescript-eslint/no-explicit-any */

"use client";

import React, { JSX, useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";

type TextOnScrollProps = {
  text?: string;
  children?: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
  stagger?: number;
  delay?: number;
  respectReducedMotion?: boolean;
};

const countChars = (node: React.ReactNode): number => {
  if (typeof node === "string" || typeof node === "number")
    return String(node).length;
  if (Array.isArray(node))
    return node.reduce((sum, n) => sum + countChars(n), 0);
  if (React.isValidElement(node))
    return countChars((node as React.ReactElement<any>).props.children);
  return 0;
};

export default function TextOnScroll({
  text,
  children,
  as = "div",
  className = "",
  stagger = 0.0075,
  delay = 0,
  respectReducedMotion = false,
}: TextOnScrollProps) {
  const [mounted, setMounted] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scrollDir, setScrollDir] = useState<"down" | "up">("down");
  const containerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(containerRef, { amount: 0.4, margin: "-5% 0px" });

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const media =
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    const update = () => setPrefersReducedMotion(media?.matches ?? false);
    update();
    media?.addEventListener("change", update);
    return () => media?.removeEventListener("change", update);
  }, []);

  // detect scroll direction to reverse stagger when scrolling up
  useEffect(() => {
    let lastY = window.scrollY;
    const onScroll = () => {
      const currentY = window.scrollY;
      const dir = currentY > lastY ? "down" : "up";
      if (dir !== scrollDir) setScrollDir(dir);
      lastY = currentY;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [scrollDir]);

  const content = useMemo(() => (text ? text : children), [text, children]);
  const totalChars = useMemo(() => countChars(content), [content]);

  const baseColor = "rgba(226, 232, 240, 0.6)"; // slate-200 slightly muted
  const focusColor = "rgb(255, 255, 255)"; // bright for dark bg

  const Tag = as as React.ElementType;

  if (!content) return null;

  let runningIndex = 0;
  const shouldAnimate =
    mounted && isInView && !(respectReducedMotion && prefersReducedMotion);

  return (
    <Tag
      ref={containerRef as any}
      className={`mx-auto text-center text-lg leading-relaxed text-white sm:text-xl ${className}`}
    >
      {(Array.isArray(content) ? content : [content]).map((node, nodeIdx) => {
        const render = (n: React.ReactNode): React.ReactNode => {
          if (typeof n === "string" || typeof n === "number") {
            const str = String(n);
            return str.split("").map((char) => {
              const absoluteIdx = runningIndex++;
              const order =
                scrollDir === "down"
                  ? absoluteIdx
                  : Math.max(totalChars - 1 - absoluteIdx, 0);
              return (
                <motion.span
                  key={`${absoluteIdx}-${scrollDir}`}
                  className="inline-block"
                  initial={{ opacity: 0.55, y: 0, color: baseColor }}
                  animate={
                    shouldAnimate
                      ? {
                          opacity: 1,
                          y: 0,
                          color: focusColor,
                          transition: {
                            delay: delay + order * stagger,
                            duration: 0.25,
                            ease: [0.25, 0.9, 0.3, 1],
                          },
                        }
                      : { opacity: 0.55, y: 0, color: baseColor }
                  }
                >
                  {char === " " ? "\u00A0" : char}
                </motion.span>
              );
            });
          }
          if (Array.isArray(n)) return n.map(render);
          if (React.isValidElement(n)) {
            return React.cloneElement(n as React.ReactElement<any>, {
              children: render((n as React.ReactElement<any>).props.children),
              key:
                (n as React.ReactElement<any>).key ??
                `${nodeIdx}-${runningIndex}`,
            });
          }
          return null;
        };
        return render(node);
      })}
    </Tag>
  );
}
