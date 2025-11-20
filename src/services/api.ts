/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ||
  process.env.NEXT_PUBLIC_API_BASE?.replace(/\/$/, "") ||
  process.env.API_BASE_URL?.replace(/\/$/, "") ||
  process.env.API_BASE?.replace(/\/$/, "") ||
  "http://localhost:5001/api/v1";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl: BASE_URL,
    credentials: "include",
    prepareHeaders: (headers) => {
      let locale = "vi";
      if (typeof document !== "undefined") {
        const htmlLang = document.documentElement.lang || "vi";
        locale = htmlLang.startsWith("en") ? "en" : "vi";
      }
      headers.set("Accept-Language", locale);
      return headers;
    },
  }) as any,
  tagTypes: [],
  endpoints: () => ({}),
});

// Có thể inject endpoints sau này qua api.injectEndpoints(...)
