"use client";

import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";
import { useCallback, useEffect, useRef, useState } from "react";

type NavItem = {
  label: string;
  target?: string;
  href?: string;
};

const navItems: NavItem[] = [
  { label: "Sản phẩm", href: "/products" },
  { label: "Giới thiệu", target: "story" },
  { label: "Liên hệ", target: "contact" },
];

export default function Header() {
  const [isVisible, setIsVisible] = useState(true);
  const lastScrollY = useRef(0);
  const locale = useLocale();

  const scrollToTarget = useCallback((targetId: string) => {
    if (typeof window === "undefined") return;
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const current = window.scrollY;
      const last = lastScrollY.current;

      if (current <= 0 || current < last) {
        setIsVisible(true);
      } else if (current > last) {
        setIsVisible(false);
      }

      lastScrollY.current = current;
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 z-30 transition-transform duration-300 ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 text-white">
        <Link href={`/${locale}`} className="pointer-events-auto">
          <Image
            src="/Logo/Logo.jpg"
            alt="Drop In Cafe"
            width={220}
            height={78}
            className="h-12 w-auto rounded-full border border-white/30 object-cover shadow"
            priority
          />
        </Link>

        <nav className="pointer-events-auto">
          <ul className="flex flex-wrap items-center gap-2 rounded-full border border-white/25 bg-black/35 px-4 py-2 text-sm font-semibold backdrop-blur">
            {navItems.map((item) => (
              <li key={item.label}>
                {item.href ? (
                  <Link
                    href={`/${locale}${item.href}`}
                    className="cursor-pointer rounded-full px-3 py-1 transition hover:bg-white/15"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={() => item.target && scrollToTarget(item.target)}
                    className="cursor-pointer rounded-full px-3 py-1 transition hover:bg-white/15"
                  >
                    {item.label}
                  </button>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
