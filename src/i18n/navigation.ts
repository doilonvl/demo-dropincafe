import { createNavigation } from "next-intl/navigation";
import { locales } from "./request";

export const pathnames = {
  "/": "/",
} as const;

export const { Link, useRouter, usePathname, redirect, getPathname } =
  createNavigation({ locales, pathnames });
