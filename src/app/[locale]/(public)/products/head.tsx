const BASE_URL = (
  process.env.NEXT_PUBLIC_APP_URL || "https://dropincafe.vercel.app"
).replace(/\/$/, "");

const META = {
  vi: {
    title: "Menu đồ uống Drop In Cafe | Cà phê & trà signature",
    description:
      "Khám phá menu Drop In Cafe: cà phê trứng, cold brew, espresso, trà trái cây, signature lineup và best seller. Đặt món nhanh, menu cập nhật liên tục.",
  },
  en: {
    title: "Drop In Cafe Menu | Coffee & Signature Drinks",
    description:
      "Explore Drop In Cafe menu: egg coffee, cold brew, espresso, fruit teas, signature lineup, and best sellers. Quick menu access and frequent updates.",
  },
};

function getLocaleOrDefault(locale: string | undefined) {
  return locale === "en" ? "en" : "vi";
}

export default function Head({ params }: { params: { locale: string } }) {
  const lang = getLocaleOrDefault(params?.locale);
  const { title, description } = META[lang];
  const url = `${BASE_URL}/${lang}/products`;
  const ogImage = `${BASE_URL}/Logo/Logo1.jpg`;

  const alternates = [
    { href: `${BASE_URL}/vi/products`, hrefLang: "vi" },
    { href: `${BASE_URL}/en/products`, hrefLang: "en" },
    { href: url, hrefLang: "x-default" },
  ];

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow" />
      <link rel="canonical" href={url} />
      {alternates.map((alt) => (
        <link
          key={alt.hrefLang}
          rel="alternate"
          hrefLang={alt.hrefLang}
          href={alt.href}
        />
      ))}

      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Drop In Cafe" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "en" ? "en_US" : "vi_VN"} />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:site" content="@dropincafe" />
    </>
  );
}
