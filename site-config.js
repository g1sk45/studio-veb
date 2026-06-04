/**
 * Jedno mesto za podešavanje pre objave.
 * Izmeni vrednosti ispod, pa uploaduj ceo folder na hosting.
 */
window.SITE_CONFIG = {
  /** Pun URL sajta (bez trailing slash) — koristi se za canonical, OG, sitemap */
  url: "https://studioveb.rs",

  email: "ognjen@studioveb.rs",
  /** Format za tel: link i WhatsApp (bez + i razmaka za wa.me) */
  phoneDisplay: "+381 61 289 2059",
  phoneE164: "+381612892059",
  whatsapp: "381612892059",

  /**
   * Web3Forms — besplatan prijem poruka sa forme.
   * 1. Registruj se na https://web3forms.com
   * 2. Kopiraj Access Key ovde
   * Ključ je javan u browseru — rotiraj ga na web3forms.com ako curi; u panelu uključi CAPTCHA za jaču anti-spam zaštitu.
   */
  web3formsAccessKey: "f2547dc4-4bf3-49f3-a4c6-951d188289f8",

  /** Google Search Console verification (opciono) — meta content vrednost */
  googleSiteVerification: "",

  /**
   * SEO — naslovi i opisi (SR je primarni za Google u Srbiji).
   * script.js ih primenjuje na meta, OG, Twitter i pri promeni jezika.
   */
  seo: {
    titleSr: "Izrada sajtova po meri | Web dizajn — Studio Veb od 150€",
    titleEn: "Custom Website Design Serbia | Studio Veb from €150",
    descriptionSr:
      "Izrada modernih responzivnih sajtova za male biznise u Srbiji. Web dizajn, SEO i brzina uključeni. Transparentne cene od 150€. Besplatna procena u 24h.",
    descriptionEn:
      "Fast, modern responsive websites for small businesses in Serbia. Web design, SEO and speed included. From €150. Free quote within 24 hours.",
    keywordsSr:
      "izrada sajtova, web dizajn, sajt po meri, izrada web sajta, web dizajn Srbija, responzivni sajt, landing stranica, SEO, Studio Veb",
    keywordsEn:
      "website design Serbia, custom website, web development, responsive website, landing page, SEO, Studio Veb",
    /** Apsolutna putanja do OG slike (PNG 1200×630 preporučeno za Viber/Facebook) */
    ogImagePath: "/assets/og-image.svg"
  }
};
