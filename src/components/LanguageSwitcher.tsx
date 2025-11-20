"use client";

import type { ReactNode } from "react";
import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import type { Locale } from "@/i18n/request";

type LanguageSwitcherProps = {
  children?: (utils: {
    locale: Locale;
    changeLocale: (target: Locale) => void;
  }) => ReactNode;
};

export default function LanguageSwitcher({ children }: LanguageSwitcherProps) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = useLocale() as Locale;

  const changeLocale = (target: Locale) => {
    if (target === locale) return;
    router.replace({ pathname }, { locale: target });
  };

  if (typeof children === "function") {
    return <>{children({ locale, changeLocale })}</>;
  }
  return null;
}
