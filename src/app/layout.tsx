import Providers from "@/provider";
import "./globals.css";
import type { Metadata } from "next";
import { getLocale } from "next-intl/server";
import { Caladea } from "next/font/google";

const caladea = Caladea({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-caladea",
});

export const metadata: Metadata = {
  title: { default: "Drop in cafe", template: "%s | Drop in cafe" },
  description:
    "A cafe where you can drop in anytime to relax and enjoy a cup of coffee.",
  icons: { icon: [{ url: "/Logo/Logo1.jpg", rel: "icon", type: "image/jpeg" }] },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <html lang={locale} suppressHydrationWarning className={caladea.variable}>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
