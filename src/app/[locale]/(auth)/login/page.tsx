/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import Image from "next/image";
import { getLocalePrefix } from "@/lib/routes";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const locale = String(params?.locale || "vi");
  const localePrefix = getLocalePrefix(locale as "vi" | "en");
  const adminPath = `${localePrefix}/admin`;

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [showPassword, setShowPassword] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await safeJson(res);
        throw new Error(data?.message || "Đăng nhập thất bại");
      }

      const nextUrl = searchParams.get("next") || adminPath;
      router.replace(nextUrl);
    } catch (err: any) {
      setError(err?.message || "Có lỗi xảy ra");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden">
      {/* Background image */}
      <Image
        src="/Home/Night1.jpg"
        alt=""
        fill
        className="object-cover object-center"
        priority
        quality={85}
      />

      {/* Dark overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70" />

      {/* Subtle warm vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_transparent_40%,_rgba(0,0,0,0.5)_100%)]" />

      {/* Login card */}
      <div className="relative z-10 w-full max-w-sm px-4">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <div className="h-20 w-20 overflow-hidden rounded-full border-2 border-amber-300/60 shadow-[0_0_32px_rgba(251,191,36,0.25)]">
            <Image
              src="/Logo/Logo0.png"
              alt="Drop In Cafe"
              width={80}
              height={80}
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div className="text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-300/90">
              Drop In Cafe
            </p>
            <h1 className="mt-1 text-2xl font-semibold text-white">
              Admin Portal
            </h1>
          </div>
        </div>

        {/* Form card */}
        <div className="rounded-2xl border border-white/10 bg-black/40 p-8 shadow-[0_24px_64px_rgba(0,0,0,0.5)] backdrop-blur-xl">
          <form className="flex flex-col gap-5" onSubmit={onSubmit}>
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="email"
                className="text-xs font-medium uppercase tracking-widest text-white/50"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="username"
                placeholder="admin@dropincafe.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-400/20"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="password"
                className="text-xs font-medium uppercase tracking-widest text-white/50"
              >
                Mật khẩu
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 pr-11 text-sm text-white placeholder:text-white/25 outline-none transition focus:border-amber-400/50 focus:bg-white/8 focus:ring-2 focus:ring-amber-400/20"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 transition hover:text-white/60"
                  tabIndex={-1}
                  aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                >
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"/>
                      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"/>
                      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"/>
                      <line x1="2" x2="22" y1="2" y2="22"/>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
                      <circle cx="12" cy="12" r="3"/>
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Error */}
            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-red-400">
                  <circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/>
                </svg>
                <p className="text-xs text-red-300">{error}</p>
              </div>
            ) : null}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-1 w-full rounded-xl bg-gradient-to-r from-amber-500 to-amber-400 px-4 py-3 text-sm font-semibold text-black shadow-[0_4px_20px_rgba(251,191,36,0.35)] transition hover:from-amber-400 hover:to-amber-300 hover:shadow-[0_4px_28px_rgba(251,191,36,0.5)] disabled:opacity-60 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="h-4 w-4 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                  </svg>
                  Đang đăng nhập...
                </span>
              ) : (
                "Đăng nhập"
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} Drop In Cafe
        </p>
      </div>
    </div>
  );
}

async function safeJson(res: Response) {
  try {
    return await res.json();
  } catch {
    return null;
  }
}
