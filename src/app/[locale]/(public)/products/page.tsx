/* eslint-disable @next/next/no-img-element */
"use client";

import { useMemo, useState } from "react";
import FadeIn from "@/components/animation/FadeIn";

type ProductCategory = "signature" | "coffee" | "tea" | "nonCoffee";
type Category = "all" | ProductCategory;

interface Product {
  id: number;
  name: string;
  description: string;
  image: string;
  category: ProductCategory;
  badge?: string;
}

const CATEGORY_CONFIG: { id: Category; label: string }[] = [
  { id: "all", label: "Tất cả sản phẩm" },
  { id: "signature", label: "Signature" },
  { id: "coffee", label: "Cà phê" },
  { id: "tea", label: "Trà" },
  { id: "nonCoffee", label: "Không cà phê" },
];

const PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Drop In Signature Egg Coffee",
    description:
      "Cà phê robusta đánh cùng lớp kem trứng mịn, ngọt nhẹ, thêm một chút vanilla – ly “must-try” cho lần ghé đầu tiên.",
    image: "/Products/product1.jpg",
    category: "signature",
    badge: "Best seller",
  },
  {
    id: 2,
    name: "Salted Caramel Latte",
    description:
      "Espresso đậm, sữa tươi và sốt caramel muối biển, cân bằng giữa ngọt, béo và hơi mằn mặn ở hậu vị.",
    image: "/Products/product2.jpg",
    category: "coffee",
  },
  {
    id: 3,
    name: "Midnight Cold Brew",
    description:
      "Cold brew ủ lạnh nhiều giờ, vị êm, ít chua, thêm lát cam sấy và syrup đường đen cho những buổi tối cần tập trung.",
    image: "/Products/product3.jpg",
    category: "coffee",
  },
  {
    id: 4,
    name: "Peach Oolong Tea",
    description:
      "Trà ô long ủ vừa, mix cùng đào ngâm và cam vàng, hậu trà rõ nhưng vẫn rất dễ uống, phù hợp mọi thời điểm trong ngày.",
    image: "/Products/product4.jpg",
    category: "tea",
  },
  {
    id: 5,
    name: "Lychee Jasmine Cold Tea",
    description:
      "Trà lài thơm nhẹ, kết hợp vải tươi và chút bạc hà, tạo cảm giác tươi mát, nhẹ nhàng nhưng vẫn rất “đã khát”.",
    image: "/Products/product5.jpg",
    category: "tea",
  },
  {
    id: 6,
    name: "Coconut Cloud Frappe",
    description:
      "Sinh tố dừa xay cùng sữa tươi, kem béo và vụn dừa nướng – lựa chọn không cà phê nhưng vẫn đầy năng lượng.",
    image: "/Products/product6.jpg",
    category: "nonCoffee",
  },
  {
    id: 7,
    name: "Matcha Tiramisu Latte",
    description:
      "Matcha Nhật, mascarpone và lớp kem cheese mặn nhẹ, dành cho những ai thích vị béo nhưng không quá ngọt.",
    image: "/Products/product7.jpg",
    category: "signature",
  },
  {
    id: 8,
    name: "Classic Vietnamese Phin",
    description:
      "Cà phê phin truyền thống, có thể chọn uống nóng hoặc đá, đậm đà và tỉnh táo đúng chuẩn phong cách Việt.",
    image: "/Products/product8.jpg",
    category: "coffee",
  },
];

export default function ProductsPage() {
  const [category, setCategory] = useState<Category>("all");

  const filteredProducts = useMemo(() => {
    if (category === "all") return PRODUCTS;
    return PRODUCTS.filter((p) => p.category === category);
  }, [category]);

  return (
    <section>
      <main className="mx-auto max-w-6xl px-4 pt-24 pb-16 md:px-6 lg:px-8">
        {/* Banner */}
        <FadeIn direction="down">
          <div className="relative h-56 w-full overflow-hidden rounded-3xl bg-neutral-900/80 shadow-xl md:h-72 lg:h-80">
            <img
              src="/PShowcase/8.jpg"
              alt="Drop In Cafe drinks banner"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <div className="relative flex h-full w-full items-center bg-linear-to-r from-black/60 via-black/25 to-transparent px-6 md:px-10 lg:px-12">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-300 md:text-sm">
                  Drop In Cafe
                </p>
                <h1 className="mt-2 text-2xl font-semibold text-neutral-50 md:text-3xl lg:text-4xl">
                  Crafted drinks for every kind of day
                </h1>
                <p className="mt-3 max-w-xl text-sm text-neutral-100/85 md:text-base">
                  Từ những buổi sáng chậm rãi đến tối muộn chạy deadline, hãy
                  chọn một ly cà phê, trà hoặc món signature phù hợp mood của
                  bạn tại Drop In Cafe.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Heading + mô tả */}
        <FadeIn direction="down">
          <div className="mt-8 md:mt-10">
            <p className="text-xs font-semibold uppercase tracking-[0.25em] text-amber-700 md:text-sm">
              Our menu
            </p>
            <h2 className="mt-2 text-2xl font-semibold text-neutral-900 md:text-3xl lg:text-4xl">
              Tất cả thức uống
            </h2>
            <p className="mt-3 max-w-2xl text-sm text-neutral-600 md:text-base">
              Dù bạn ghé vội mua mang đi hay ngồi lại làm việc vài giờ, Drop In
              Cafe luôn có một ly dành cho bạn: cà phê phin, espresso, cold
              brew, trà trái cây và các món không cà phê nhẹ nhàng nhưng vẫn đủ
              “năng lượng”.
            </p>
          </div>
        </FadeIn>

        {/* Filter tabs */}
        <FadeIn direction="left">
          <ProductFilters category={category} onChange={setCategory} />
        </FadeIn>

        {/* Grid sản phẩm */}
        <FadeIn direction="down">
          <div className="mt-8 md:mt-10">
            {filteredProducts.length === 0 ? (
              <p className="text-sm text-neutral-500">
                Hiện chưa có thức uống nào trong nhóm này. Vui lòng chọn danh
                mục khác.
              </p>
            ) : (
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 md:gap-3 lg:grid-cols-4">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </FadeIn>
      </main>
    </section>
  );
}

function ProductFilters({
  category,
  onChange,
}: {
  category: Category;
  onChange: (value: Category) => void;
}) {
  return (
    <div id="allProduct-filters" className="mt-6 flex flex-wrap gap-3 md:mt-8">
      {CATEGORY_CONFIG.map((cat) => {
        const isActive = category === cat.id;
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => onChange(cat.id)}
            className={
              "rounded-full cursor-pointer border px-4 py-2 text-xs font-medium transition-colors md:text-sm " +
              (isActive
                ? "border-neutral-900 bg-neutral-900 text-neutral-50 shadow-sm"
                : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-900 hover:text-neutral-900")
            }
          >
            {cat.label}
          </button>
        );
      })}
    </div>
  );
}

function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group relative overflow-hidden bg-white shadow-sm ring-1 ring-neutral-100 transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="relative h-56 md:h-60 lg:h-64 cursor-pointer">
        {/* Ảnh sản phẩm */}
        <img
          src={product.image}
          alt={product.name}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Panel trắng trượt lên/xuống theo hover */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-500 ease-out group-hover:translate-y-0 group-hover:opacity-100">
          <div className="bg-white/65 px-4 py-3 md:px-5 md:py-4 border-t border-neutral-200/80">
            <h3 className="text-sm font-semibold text-neutral-900 md:text-base">
              {product.name}
            </h3>
            <p className="mt-1 text-xs leading-relaxed text-neutral-600 md:text-sm line-clamp-3">
              {product.description}
            </p>
          </div>
        </div>
      </div>
    </article>
  );
}
