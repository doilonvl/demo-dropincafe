/* eslint-disable @next/next/no-img-element */
import ProductShowcase from "@/components/animation/ProductShowcase";
import ProductSlider from "@/components/animation/Slider";
import TextOnScroll from "@/components/animation/TextOnScroll";
import BestSellersSection from "@/components/home/BestSellers";
import HomeStoryAndStats from "@/components/home/HomeStory";
import FadeIn from "@/components/animation/FadeIn";

const sliderItems = [
  {
    name: "Signature Blend",
    description: "Espresso blend caramelized just enough for a syrupy body.",
    img: "/PShowcase/8.jpg",
    route: "/products/signature-blend",
  },
  {
    name: "Cold Brew Citrus",
    description: "Slow-steeped, then brightened with a zest of citrus.",
    img: "/PShowcase/8.jpg",
    route: "/products/cold-brew-citrus",
  },
  {
    name: "Caramel Macchiato",
    description: "Velvety milk layers, caramel ribbon, double espresso on top.",
    img: "/PShowcase/8.jpg",
    route: "/products/caramel-macchiato",
  },
  {
    name: "Classic Latte",
    description: "Silky steamed milk over a clean, sweet espresso shot.",
    img: "/PShowcase/8.jpg",
    route: "/products/classic-latte",
  },
  {
    name: "Matcha Fusion",
    description: "Stone-ground matcha swirled with a short pull of espresso.",
    img: "/PShowcase/8.jpg",
    route: "/products/matcha-fusion",
  },
  {
    name: "Hazelnut Cappuccino",
    description: "Nutty aroma, microfoam peak, dusted with toasted cocoa.",
    img: "/PShowcase/8.jpg",
    route: "/products/hazelnut-cappuccino",
  },
  {
    name: "Vietnamese Phin",
    description: "Traditional phin drip, condensed milk, chocolate finish.",
    img: "/PShowcase/8.jpg",
    route: "/products/vietnamese-phin",
  },
  {
    name: "Chocolate Frappe",
    description: "Crushed ice, dark chocolate base, topped with fresh cream.",
    img: "/PShowcase/8.jpg",
    route: "/products/chocolate-frappe",
  },
];

const showcaseItems = [
  {
    name: "Signature Blend",
    description: "Bold aroma from beans roasted fresh each day.",
    img: "/Signature/1.jpg",
    route: "/products/signature-blend",
  },
  {
    name: "Cold Brew Citrus",
    description: "Deep-cold brew with a light citrus twist.",
    img: "/Signature/2.jpg",
    route: "/products/cold-brew-citrus",
  },
  {
    name: "Classic Latte",
    description: "Steamed milk and gentle foam for slow mornings.",
    img: "/Signature/3.jpg",
    route: "/products/classic-latte",
  },
  {
    name: "Matcha Fusion",
    description: "Creamy matcha layered with robust espresso.",
    img: "/Signature/4.jpg",
    route: "/products/matcha-fusion",
  },
  {
    name: "Hazelnut Cappuccino",
    description: "Toasted hazelnut notes with silky foam.",
    img: "/Signature/5.jpg",
    route: "/products/hazelnut-cappuccino",
  },
  {
    name: "Vietnamese Phin",
    description: "Traditional phin brew with a chocolaty finish.",
    img: "/Signature/6.jpg",
    route: "/products/vietnamese-phin",
  },
];

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <section className="relative">
        <ProductSlider
          items={sliderItems}
          autoPlay
          autoPlayDelay={4200}
          transitionDuration={0.65}
        />
      </section>
      <section className="bg-linear-to-r from-amber-600 to-rose-500 text-white">
        <FadeIn direction="right">
          <div className="mx-auto flex w-full flex-col gap-10 lg:flex-row lg:items-center">
            <div className="relative w-full lg:w-1/2">
              <TextOnScroll className="text-xl sm:text-2xl text-white">
                <h2 className="text-3xl font-bold mb-2 text-white">
                  Drop In Cafe
                </h2>
                <p>
                  Celebrating Australian and Vietnamese coffee culture in Hanoi
                  Old Quarter.
                </p>
                <p>Our famous egg coffee is a must-try. </p>
                <p>Located right across from the historic Train Street.</p>
                <p>Visit for a truly unique cafe experience. </p>
                <p>Just drop in.</p>
              </TextOnScroll>
            </div>
            <div className="w-full overflow-hidden border border-white/20 shadow-2xl lg:w-1/2">
              <img
                src="/Logo/Logo.jpg"
                alt="Drop In Cafe interior"
                className="h-[260px] w-full object-cover sm:h-80 md:h-[380px] lg:h-[560px]"
              />
            </div>
          </div>
        </FadeIn>
      </section>
      <FadeIn direction="left">
        <BestSellersSection />
      </FadeIn>
      <FadeIn direction="right">
        <HomeStoryAndStats />
      </FadeIn>

      <section id="product-showcase" className="mx-auto mt-12 max-w-6xl px-4">
        <div className="text-center">
          <p className="text-3xl font-semibold uppercase tracking-[0.3em] text-amber-600">
            Signature Lineup
          </p>
          {/* <h2 className="mt-2 text-3xl font-semibold text-stone-900 md:text-4xl">
            Product Showcase
          </h2> */}
          <p className="mt-2 text-sm text-stone-500">
            Handcrafted drinks highlighting the best of Drop In Cafe.
          </p>
        </div>
        <ProductShowcase
          items={showcaseItems}
          yOffset={500}
          duration={0.9}
          stagger={0.18}
          start="top 65%"
        />
      </section>
    </main>
  );
}
