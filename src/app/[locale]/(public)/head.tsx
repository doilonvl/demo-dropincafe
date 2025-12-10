const BASE_URL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ||
  "https://dropincafe.com.vn";

const META = {
  vi: {
    title: "Drop In Cafe | Cà phê phố tàu Hà Nội",
    description:
      "Menu cà phê trứng, cold brew, trà trái cây tại Drop In Cafe ngay phố đường tàu Hà Nội. Thử signature drink và best seller được khách yêu thích.",
  },
  en: {
    title: "Drop In Cafe | Hanoi Train Street Coffee",
    description:
      "Egg coffee, cold brew, fruit teas, and signature drinks at Drop In Cafe on Hanoi Train Street. Try our best sellers and house specials.",
  },
};

export default function Head({ params }: { params: { locale: string } }) {
  const lang = params?.locale === "en" ? "en" : "vi";
  const { title, description } = META[lang];
  const url = `${BASE_URL}/${lang}`;
  const ogImage = `${BASE_URL}/Logo/Logo1.jpg`;

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={url} />

      <meta property="og:type" content="website" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "vi_VN"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
    </>
  );
}
