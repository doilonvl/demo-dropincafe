/* eslint-disable @next/next/no-img-element */
"use client";
import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

type Product = {
  name: string;
  description: string;
  img: string;
  route: string;
};

type Props = {
  items: Product[];
  yOffset?: number;
  duration?: number;
  stagger?: number;
  start?: string;
};

export default function ProductShowcase({
  items,
  yOffset = 600,
  duration = 1,
  stagger = 0.2,
  start = "top 60%",
}: Props) {
  const sectionRef = useRef<HTMLElement | null>(null);

  // Pair 2 items per row
  const rows: Product[][] = [];
  for (let i = 0; i < items.length; i += 2) {
    rows.push(items.slice(i, i + 2));
  }

  useGSAP(
    () => {
      gsap.registerPlugin(ScrollTrigger);

      gsap.set(".work-item", { y: yOffset });

      sectionRef.current?.querySelectorAll(".row").forEach((row) => {
        const cards = row.querySelectorAll(".work-item");

        cards.forEach((card, idx) => {
          const isLeft = idx === 0;
          gsap.set(card, {
            rotation: isLeft ? -60 : 60,
            transformOrigin: "center center",
          });
        });

        ScrollTrigger.create({
          trigger: row,
          start,
          onEnter: () => {
            gsap.to(cards, {
              y: 0,
              rotation: 0,
              duration,
              ease: "power4.out",
              stagger,
            });
          },
        });
      });
      ScrollTrigger.refresh();
    },
    { scope: sectionRef }
  );

  return (
    <section className="work" ref={sectionRef}>
      {rows.map((pair, rowIdx) => (
        <div className="row" key={rowIdx}>
          {pair.map((item) => (
            <a
              className="work-item work-item-link"
              href={item.route}
              key={item.route}
            >
              <div className="work-item-img">
                <img src={item.img} alt={item.name} />
              </div>
              <div className="work-item-copy">
                <h3>{item.name}</h3>
                <p>{item.description}</p>
              </div>
            </a>
          ))}
        </div>
      ))}
    </section>
  );
}
