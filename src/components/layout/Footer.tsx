/* eslint-disable @next/next/no-img-element */
"use client";

import {
  CheckCircle2,
  Clock,
  ExternalLink,
  Facebook,
  Info,
  Instagram,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type DayHours = { day: string; start: string; end: string };

const weeklyHours: DayHours[] = [
  { day: "Thứ Hai", start: "07:30", end: "22:30" },
  { day: "Thứ Ba", start: "07:30", end: "22:30" },
  { day: "Thứ Tư", start: "07:30", end: "22:30" },
  { day: "Thứ Năm", start: "07:30", end: "22:30" },
  { day: "Thứ Sáu", start: "07:30", end: "22:30" },
  { day: "Thứ Bảy", start: "07:30", end: "22:30" },
  { day: "Chủ Nhật", start: "07:30", end: "22:30" },
];

const services = [
  "Chỗ ngồi ngoài trời",
  "Nhận hàng ngay bên ngoài",
  "Đặt mua rồi tự đến lấy tại cửa hàng",
];

const features = ["Mức giá · $", "100% đề xuất (16 lượt đánh giá)"];
const isOpenNow = () => {
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const [startH, startM] = weeklyHours[0].start.split(":").map(Number);
  const [endH, endM] = weeklyHours[0].end.split(":").map(Number);
  const start = startH * 60 + startM;
  const end = endH * 60 + endM;
  return minutes >= start && minutes <= end;
};

export default function Footer() {
  const [isOpen, setIsOpen] = useState(isOpenNow());
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setIsOpen(isOpenNow()), 60_000);
    return () => clearInterval(id);
  }, []);

  const statusLabel = useMemo(
    () => (isOpen ? "Đang mở cửa" : "Đang đóng cửa"),
    [isOpen]
  );

  return (
    <>
      <footer
        id="contact"
        className="mt-16 border-t border-amber-100 text-slate-900"
      >
        <div className="h-1 w-full bg-linear-to-r from-amber-600 to-rose-500" />
        <div className="mx-auto max-w-6xl px-4 py-10">
          <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-5">
              <div className="flex items-center gap-3">
                <img
                  src="/Logo/Logo.jpg"
                  alt="Drop In Cafe"
                  className="h-12 w-12 rounded-full border border-amber-200 object-cover shadow-sm"
                />
                <div>
                  <p className="text-base font-semibold text-slate-950">
                    Drop In Cafe
                  </p>
                  <p className="text-sm text-slate-600">
                    Coffee & Chill in Old Quarter
                  </p>
                </div>
              </div>
              <div className="space-y-2 text-sm text-slate-700">
                <p className="flex items-start gap-2">
                  <MapPin className="mt-0.5 h-5 w-5 text-amber-500" />
                  <span>163 Phùng Hưng, Cửa Đông, Hoàn Kiếm, Hà Nội</span>
                </p>
                <p className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-green-500" />
                  <a
                    href="tel:+84961689163"
                    className="transition hover:text-amber-600"
                  >
                    096 168 91 63
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Mail className="h-5 w-5 text-red-600" />
                  <a
                    href="mailto:dropincafehn@gmail.com"
                    className="transition hover:text-amber-600"
                  >
                    dropincafehn@gmail.com
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Instagram className="h-5 w-5 text-pink-500" />
                  <a
                    href="https://instagram.com/dropincafevn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-600"
                  >
                    @dropincafevn
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <Facebook className="h-5 w-5 text-blue-500" />
                  <a
                    href="https://www.facebook.com/dropincafevn"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-600"
                  >
                    Drop In Cafe
                  </a>
                </p>
                <p className="flex items-center gap-2">
                  <ExternalLink className="h-5 w-5 text-slate-500" />
                  <a
                    href="https://maps.app.goo.gl/m1dF4toG6xPYLGdQ9"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transition hover:text-amber-600"
                  >
                    maps.app.goo.gl/m1dF4toG6xPYLGdQ9
                  </a>
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between rounded-xl border border-amber-100 bg-white/80 px-4 py-3 shadow-sm">
                <div className="flex items-center gap-3">
                  {isOpen ? (
                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                  ) : (
                    <XCircle className="h-6 w-6 text-amber-500" />
                  )}
                  <div>
                    <p className="text-sm text-slate-500">Giờ hoạt động</p>
                    <p className="text-base font-semibold text-slate-900">
                      {statusLabel}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPopup(true)}
                  className="text-sm font-medium text-sky-700 underline underline-offset-4 hover:text-amber-600 cursor-pointer"
                >
                  Xem chi tiết
                </button>
              </div>

              <div className="space-y-2 rounded-xl border border-amber-100 bg-white/80 p-4 shadow-sm">
                <p className="flex items-start gap-2 text-sm text-slate-800">
                  <Info className="mt-0.5 h-4 w-4 text-amber-500" />
                  <span>{statusLabel}</span>
                </p>
                {services.map((s) => (
                  <p
                    key={s}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                    <span>{s}</span>
                  </p>
                ))}
                {features.map((f) => (
                  <p
                    key={f}
                    className="flex items-start gap-2 text-sm text-slate-700"
                  >
                    <Info className="mt-0.5 h-4 w-4 text-slate-500" />
                    <span>{f}</span>
                  </p>
                ))}
              </div>
            </div>

            <div className="rounded-xl border border-amber-100 bg-white/80 p-3 shadow-sm">
              <div className="aspect-4/3 w-full overflow-hidden rounded-lg border border-amber-100">
                <iframe
                  title="Drop In Cafe map"
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3726.09016140042!2d105.841!3d21.033!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zMTLCsDAyJzIxLjAiTiAxMDXCsDUwJzI3LjYiRQ!5e0!3m2!1sen!2s!4v1700000000000!5m2!1sen!2s"
                  width="100%"
                  height="100%"
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full w-full"
                />
              </div>
              <a
                href="https://maps.app.goo.gl/m1dF4toG6xPYLGdQ9"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-2 text-sm text-sky-700 hover:text-amber-600"
              >
                Mở trong Google Maps
                <ExternalLink className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="mt-8 flex flex-col items-center justify-between gap-3 border-t border-amber-100 pt-4 text-xs text-slate-600 md:flex-row">
            <p>
              © {new Date().getFullYear()} Drop In Cafe. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {showPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-lg rounded-2xl border border-amber-100 bg-white p-6 text-slate-900 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm text-slate-500">Giờ hoạt động</p>
                <p className="text-lg font-semibold text-slate-900">
                  {statusLabel}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="text-slate-500 hover:text-amber-600 cursor-pointer rounded-full p-2 transition"
                aria-label="Đóng"
              >
                ✕
              </button>
            </div>
            <div className="mt-4 space-y-2 text-sm text-slate-800">
              {weeklyHours.map((d) => (
                <div key={d.day} className="flex items-center justify-between">
                  <span>{d.day}</span>
                  <span className="tabular-nums">{`${d.start} - ${d.end}`}</span>
                </div>
              ))}
            </div>
            {/* <p className="mt-4 text-xs text-slate-500">
              Updated khoang 5 nam truoc
            </p> */}
            <div className="mt-4 space-y-2">
              <p className="flex items-center gap-2 text-sm text-slate-900">
                <Clock className="h-4 w-4 text-amber-500" />
                Dich vu
              </p>
              {services.map((s) => (
                <p
                  key={s}
                  className="flex items-start gap-2 text-sm text-slate-800"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 text-emerald-500" />
                  <span>{s}</span>
                </p>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setShowPopup(false)}
              className="mt-6 w-full cursor-pointer rounded-lg bg-amber-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-amber-300"
            >
              Đóng
            </button>
          </div>
        </div>
      )}
    </>
  );
}
