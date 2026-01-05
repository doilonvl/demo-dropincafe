import { createNavigation } from "next-intl/navigation";
import { locales, defaultLocale } from "./request";

export const pathnames = {
  "/": "/",
  "/products": {
    vi: "/san-pham",
    en: "/products",
  },
  "/products/[slug]": {
    vi: "/san-pham/[slug]",
    en: "/products/[slug]",
  },
  "/blog": {
    vi: "/blog",
    en: "/blog",
  },
  "/blog/[slug]": {
    vi: "/blog/[slug]",
    en: "/blog/[slug]",
  },
  "/admin": {
    vi: "/admin",
    en: "/admin",
  },
  "/admin/products": {
    vi: "/admin/products",
    en: "/admin/products",
  },
  "/admin/blogs": {
    vi: "/admin/blogs",
    en: "/admin/blogs",
  },
  "/admin/blogs/new": {
    vi: "/admin/blogs/new",
    en: "/admin/blogs/new",
  },
  "/admin/blogs/[id]": {
    vi: "/admin/blogs/[id]",
    en: "/admin/blogs/[id]",
  },
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({
    locales,
    defaultLocale,
    pathnames,
    localePrefix: "as-needed",
  });
