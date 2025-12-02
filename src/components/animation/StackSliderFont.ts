import { Space_Grotesk } from "next/font/google";
import { GeistMono } from "geist/font/mono";

export const geistSansLocal = Space_Grotesk({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-space-grotesk",
});

export const geistMonoLocal = GeistMono;
