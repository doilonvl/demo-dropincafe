/* eslint-disable react-hooks/rules-of-hooks */
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

  const rawContent = useMemo<React.ReactNode>(() => {
    return text ?? children;
  }, [text, children]);

  if (!rawContent) return null;

  // Flatten children để tránh mất phần tử cuối
  const flatNodes = useMemo(
    () => React.Children.toArray(rawContent),
    [rawContent]
  );

  const totalChars = useMemo(
    () => flatNodes.reduce<number>((sum, node) => sum + countChars(node), 0),
    [flatNodes]
  );

  const baseColor = "rgba(226, 232, 240, 0.6)"; // slate-200 slightly muted
  const focusColor = "rgb(255, 255, 255)"; // bright for dark bg

  const Tag = as as React.ElementType;

  const shouldAnimate =
    mounted && isInView && !(respectReducedMotion && prefersReducedMotion);

  let runningIndex = 0;

  const renderNode = (
    node: React.ReactNode,
    nodeIdx: number
  ): React.ReactNode => {
    if (typeof node === "string" || typeof node === "number") {
      const str = String(node);

      return str.split("").map((char, charIdx) => {
        const absoluteIdx = runningIndex++;
        const order =
          scrollDir === "down"
            ? absoluteIdx
            : Math.max(totalChars - 1 - absoluteIdx, 0);

        return (
          <motion.span
            key={`${nodeIdx}-${charIdx}-${scrollDir}`}
            // để inline mặc định, tránh dính chữ
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
            {char}
          </motion.span>
        );
      });
    }

    if (Array.isArray(node)) {
      return node.map((child, idx) => renderNode(child, idx));
    }

    if (React.isValidElement(node)) {
      const el = node as React.ReactElement<any>;
      return React.cloneElement(el, {
        key: el.key ?? `node-${nodeIdx}`,
        children: renderNode(el.props.children, nodeIdx),
      });
    }

    return null;
  };

  return (
    <Tag
      ref={containerRef as any}
      className={`mx-auto text-center text-lg leading-relaxed text-white sm:text-xl whitespace-pre-wrap ${className}`}
    >
      {flatNodes.map((node, idx) => renderNode(node, idx))}
    </Tag>
  );
}
