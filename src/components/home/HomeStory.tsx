"use client";

import FadeIn from "@/components/animation/FadeIn";

export default function HomeStoryAndStats() {
  return (
    <>
      {/* STATS SECTION */}
      <section
        id="stats"
        className="relative mt-20 bg-fixed bg-center bg-no-repeat bg-cover bg-[url(/PShowcase/2.jpg)]"
      >
        {/* overlay */}
        <div className="absolute inset-0 bg-stone-950/80" />

        {/* nội dung */}
        <div className="container relative mx-auto flex w-full max-w-5xl flex-col items-center justify-center px-4 py-15 md:flex-row lg:gap-22">
          <FadeIn direction="left">
            <div className="stats-item">
              <h1 className="counter">20+</h1>
              <h2>Công thức đồ uống đặc trưng</h2>
            </div>
          </FadeIn>

          {/* đường kẻ dọc */}
          <svg
            viewBox="-1 -1 3 137"
            width="3"
            height="137"
            className="hidden md:block"
          >
            <defs>
              <linearGradient
                id="lineGradientStats1"
                x1="0"
                y1="0"
                x2="-5.90104e-06"
                y2="135"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="0.494792" stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="135"
              stroke="url(#lineGradientStats1)"
              strokeOpacity="0.3"
              fill="none"
            />
          </svg>
          <FadeIn direction="down">
            <div className="stats-item">
              <h1 className="counter">15k+</h1>
              <h2>Ly đồ uống bên đường tàu</h2>
            </div>
          </FadeIn>

          {/* đường kẻ dọc */}
          <svg
            viewBox="-1 -1 3 137"
            width="3"
            height="137"
            className="hidden md:block"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <linearGradient
                id="lineGradientStats2"
                x1="0"
                y1="0"
                x2="-5.90104e-06"
                y2="135"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="white" stopOpacity="0" />
                <stop offset="0.494792" stopColor="white" />
                <stop offset="1" stopColor="white" stopOpacity="0" />
              </linearGradient>
            </defs>
            <line
              x1="0.5"
              y1="0"
              x2="0.5"
              y2="135"
              stroke="url(#lineGradientStats2)"
              strokeOpacity="0.3"
              fill="none"
            />
          </svg>
          <FadeIn direction="right">
            <div className="stats-item">
              <h1 className="counter">4.8+</h1>
              <h2>Điểm đánh giá từ khách ghé quán</h2>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* STORY SECTION */}
      <section id="story">
        {/* lớp chứa hình nền */}
        <div className="flex h-screen max-h-[1100px] w-full max-w-none justify-end bg-[url(/PShowcase/3.jpg)] bg-cover bg-center bg-no-repeat">
          {/* lớp overlay chiếm 2/3 màn hình */}
          <div className="h-full w-full bg-stone-950/60 lg:w-2/3">
            <div className="container relative flex h-full items-center justify-center md:justify-end 2xl:justify-center">
              {/* watermark – vẫn giữ rotation, không cần fade */}
              <div className="absolute top-1/2 right-1/2 hidden -translate-y-1/2 md:block 2xl:translate-x-0">
                <h1 className="text-center text-[140px] font-bold leading-[120px] uppercase text-amber-50/25 -rotate-90">
                  DROP IN
                  <br />
                  CAFE
                </h1>
              </div>

              {/* nội dung chính – thay AOS bằng FadeIn */}
              <FadeIn direction="left" amount={0.3}>
                <div className="relative mx-auto max-w-xl">
                  <div className="mb-9">
                    <h2 className="sub_heading !text-amber-200 text-3xl">
                      Câu chuyện
                    </h2>
                    <h1 className="main_heading text-white text-2xl">
                      Nơi nhịp tàu gặp nhịp cà phê
                    </h1>
                  </div>

                  <p className="text-1.5xl text-stone-200 md:text-base">
                    Tại Drop In Cafe, chúng tôi sinh ra từ nhịp tàu hỏa trên phố
                    đường tàu Hà Nội – nơi mỗi chuyến tàu lướt qua đều mang theo
                    một câu chuyện mới. Mỗi ly egg coffee, flat white hay matcha
                    lạnh đều được pha chậm, ưu tiên sự cân bằng giữa hương, vị
                    và cảm giác mà bạn mang theo sau khi rời quán.
                    <br />
                    <br />
                    Chúng tôi muốn tạo ra một điểm dừng nhỏ, nơi bạn có thể ghé
                    vào bất chợt để ngồi đủ lâu nhìn một chuyến tàu đi qua, trò
                    chuyện với bạn đồng hành, hoặc hoàn thành nốt vài dòng công
                    việc. Từng chi tiết – từ menu, ánh sáng đến chỗ ngồi sát
                    đường ray – đều được thiết kế để giúp bạn cảm thấy được chào
                    đón, kết nối hơn với thành phố này và với nhau.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
