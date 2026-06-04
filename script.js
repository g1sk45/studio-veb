/* =========================================================
   STUDIO VEB — interakcije + i18n (SR / EN)
   ========================================================= */
(function () {
  "use strict";

  const SEC = window.SiteSecurity || null;
  const BUDGET_VALUES = new Set(["150", "350", "600+", "nisam-siguran"]);

  const CFG = window.SITE_CONFIG || {
    url: "https://studioveb.rs",
    email: "ognjen@studioveb.rs",
    phoneDisplay: "+381 61 289 2059",
    phoneE164: "+381612892059",
    whatsapp: "381612892059",
    web3formsAccessKey: "",
    googleSiteVerification: "",
    seo: {}
  };

  const SEO_DEFAULTS = {
    titleSr: "Sajt koji prodaje — od 150€ | Studio Veb",
    titleEn: "A Site That Sells — From €150 | Studio Veb",
    descriptionSr:
      "Izrada modernih responzivnih sajtova za male biznise u Srbiji. Web dizajn, SEO i brzina uključeni. Transparentne cene od 150€. Besplatna procena u 24h.",
    descriptionEn:
      "Fast, modern responsive websites for small businesses in Serbia. Web design, SEO and speed included. From €150. Free quote within 24 hours.",
    keywordsSr:
      "izrada sajtova, web dizajn, sajt po meri, izrada web sajta, web dizajn Srbija, responzivni sajt, landing stranica, SEO, Studio Veb",
    keywordsEn:
      "website design Serbia, custom website, web development, responsive website, landing page, SEO, Studio Veb",
    ogImagePath: "/assets/og-image.jpg?v=6"
  };

  const seoCfg = () => ({ ...SEO_DEFAULTS, ...(CFG.seo || {}) });

  const applySeoMeta = (lang) => {
    const s = seoCfg();
    const isEn = lang === "en";
    const title = isEn ? s.titleEn : s.titleSr;
    const desc = isEn ? s.descriptionEn : s.descriptionSr;
    const keywords = isEn ? s.keywordsEn : s.keywordsSr;

    document.title = title;
    const setContent = (id, value) => {
      const el = document.getElementById(id);
      if (el && value) el.setAttribute("content", value);
    };
    setContent("metaDescription", desc);
    setContent("metaKeywords", keywords);
    setContent("ogTitle", title);
    setContent("ogDescription", desc);
    setContent("twitterTitle", title);
    setContent("twitterDescription", desc);

    const ogLocale = document.querySelector('meta[property="og:locale"]');
    if (ogLocale) ogLocale.setAttribute("content", isEn ? "en_US" : "sr_RS");
  };

  /* ---------- Podešavanje iz site-config.js (domen, forma, WhatsApp) ---------- */
  const applySiteConfig = () => {
    let base = (CFG.url || "").replace(/\/$/, "");
    if (base && SEC && !SEC.isSafeSiteOrigin(base)) base = "";
    const s = seoCfg();
    if (base) {
      const home = base + "/";
      const enUrl = base + "/?lang=en";
      const canon = document.getElementById("canonicalLink");
      if (canon) canon.href = home;
      document.querySelectorAll('meta[property="og:url"]').forEach((m) => { m.content = home; });
      const ogPath = (s.ogImagePath || "/assets/og-image.jpg?v=6").replace(/^\//, "");
      const ogImg = base + "/" + ogPath;
      document.querySelectorAll('meta[property="og:image"], meta[property="og:image:secure_url"], meta[name="twitter:image"]').forEach((m) => {
        m.content = ogImg;
      });
      const ogType = document.querySelector('meta[property="og:image:type"]');
      const ogPathClean = ogPath.split("?")[0];
      if (ogType) {
        ogType.content = ogPathClean.endsWith(".png") ? "image/png" : ogPathClean.endsWith(".jpg") || ogPathClean.endsWith(".jpeg")
          ? "image/jpeg"
          : "image/svg+xml";
      }
      ["hreflangSr", "hreflangDefault"].forEach((id) => {
        const el = document.getElementById(id);
        if (el) el.href = home;
      });
      const hrefEn = document.getElementById("hreflangEn");
      if (hrefEn) hrefEn.href = enUrl;

      const schema = document.getElementById("schemaGraph");
      if (schema) {
        try {
          const data = JSON.parse(schema.textContent);
          const root = base + "/";
          const patchUrl = (node) => {
            if (!node || typeof node !== "object") return;
            if (node["@id"] && String(node["@id"]).includes("studioveb")) {
              node["@id"] = node["@id"].replace(/https?:\/\/[^/]+/, base);
            }
            if (node.url && String(node.url).includes("studioveb")) node.url = root;
            if (node.image && String(node.image).includes("studioveb")) node.image = ogImg;
            if (node.logo && String(node.logo).includes("studioveb")) node.logo = base + "/favicon.svg";
          };
          (data["@graph"] || []).forEach((node) => {
            patchUrl(node);
            if (node["@type"] === "WebPage" && node.primaryImageOfPage) {
              node.primaryImageOfPage.url = ogImg;
            }
            if (node["@type"] === "ProfessionalService") {
              if (CFG.email) {
                node.email = CFG.email;
                if (node.contactPoint) node.contactPoint.email = CFG.email;
              }
              if (CFG.phoneE164) {
                node.telephone = CFG.phoneE164;
                if (node.contactPoint) node.contactPoint.telephone = CFG.phoneE164;
              }
            }
          });
          schema.textContent = JSON.stringify(data);
        } catch (e) { /* ignore */ }
      }
    }
    if (CFG.googleSiteVerification) {
      let meta = document.querySelector('meta[name="google-site-verification"]');
      if (!meta) {
        meta = document.createElement("meta");
        meta.name = "google-site-verification";
        document.head.appendChild(meta);
      }
      meta.content = CFG.googleSiteVerification;
    }
    syncFormAccessKey();
    const waUrl = "https://wa.me/" + (CFG.whatsapp || "381612892059") + "?text=" +
      encodeURIComponent("Zdravo! Zanima me izrada sajta — Studio Veb.");
    ["whatsappLink", "whatsappFloat"].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.href = waUrl;
    });
    const phoneLink = document.getElementById("phoneLink");
    if (phoneLink && CFG.phoneE164) phoneLink.href = "tel:" + CFG.phoneE164.replace(/\s/g, "");
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      if (CFG.email) {
        a.href = "mailto:" + CFG.email;
        if (a.closest(".footer__contact")) a.textContent = CFG.email;
      }
    });
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      if (CFG.phoneE164) {
        a.href = "tel:" + CFG.phoneE164.replace(/\s/g, "");
        if (a.id === "phoneLink" || a.closest(".footer__contact")) {
          a.textContent = CFG.phoneDisplay || CFG.phoneE164;
        }
      }
    });
  };

  const getWeb3FormsKey = () => {
    const fromCfg = (CFG.web3formsAccessKey || "").trim();
    if (fromCfg && fromCfg !== "YOUR_WEB3FORMS_ACCESS_KEY") return fromCfg;
    const input = document.getElementById("formAccessKey");
    const fromInput = input ? input.value.trim() : "";
    if (fromInput && fromInput !== "YOUR_WEB3FORMS_ACCESS_KEY") return fromInput;
    return "";
  };

  const syncFormAccessKey = () => {
    const key = getWeb3FormsKey();
    const input = document.getElementById("formAccessKey");
    if (input && key) input.value = key;
    return key;
  };

  applySiteConfig();

  /* ========================================================
     I18N — rečnik prevoda
     ======================================================== */
  const I18N = {
    sr: {
      "skip": "Preskoči na sadržaj",

      "nav.services": "Usluge",
      "nav.work": "Radovi",
      "nav.pricing": "Cene",
      "nav.process": "Proces",
      "nav.about": "O meni",
      "nav.faq": "FAQ",
      "nav.cta": "Zakaži poziv",
      "nav.menuOpen": "Otvori meni",
      "nav.menuClose": "Zatvori meni",

      "hero.eyebrow": "Web dizajn & izrada sajtova",
      "hero.title": 'Moderan sajt koji <span class="accent">prodaje</span> — već od 150€',
      "hero.lead": "Pravim brze, elegantne i responzivne sajtove po meri za preduzetnike i male biznise. Čist dizajn, smooth animacije i fokus na jedno — da posetilac postane klijent.",
      "hero.cta1": "Započni svoj projekat",
      "hero.cta2": "Pogledaj cene",
      "hero.stat1": "početna cena",
      "hero.stat2num": "3 dana",
      "hero.stat2": "prosečna izrada",
      "hero.stat3num": "0",
      "hero.stat3": "gotovih šablona",

      "trust.responsive": "Responsive",

      "services.eyebrow": "Usluge",
      "services.title": "Sve što ti treba da budeš online",
      "services.sub": "Od jednostavne vizit‑karte do kompletne prezentacije biznisa — sve po meri tvojih ciljeva.",
      "services.s1.title": "Landing stranice",
      "services.s1.desc": "Jednostavna, ubedljiva stranica sa jednim jasnim ciljem — više poziva, prijava ili prodaje.",
      "services.s2.title": "Sajtovi za biznis",
      "services.s2.desc": "Višestranični sajt sa uslugama, galerijom i kontaktom. Profesionalan utisak od prvog klika.",
      "services.s3.title": "Redizajn",
      "services.s3.desc": "Imaš star sajt? Osvežavam ga modernim dizajnom, bržim učitavanjem i boljom konverzijom.",
      "services.s4.title": "Optimizacija brzine",
      "services.s4.desc": "Brz sajt = bolji Google rang i zadovoljniji posetioci. Optimizujem slike, kod i učitavanje.",
      "services.s5.title": "SEO osnove",
      "services.s5.desc": "Postavljam meta tagove, strukturu i brzinu tako da te ljudi lakše pronađu na pretrazi.",
      "services.s6.title": "Održavanje",
      "services.s6.desc": "Izmene, dopune i mesečna briga o sajtu — da uvek bude ažuran i bezbedan.",

      "work.eyebrow": "Radovi",
      "work.title": "Nekoliko primera dizajna",
      "work.sub": "Stil koji možeš da očekuješ — čisto, moderno i prilagođeno tvojoj branši.",
      "work.open": "Otvori uživo ↗",
      "work.loading": "Učitavam sajt…",
      "work.live": "Sajt uživo",
      "work.projectTitle": "Primer završenog projekta",
      "work.desc": "Moderan biznis sajt sa jasnom strukturom, kontaktom i optimizacijom za pretragu — spreman za deljenje i rast online prisustva.",
      "work.openBtn": "Otvori sajt uživo ↗",
      "work.fallbackTitle": "Primer klijentskog sajta",
      "work.fallbackText": "Na mobilnom prikazujemo link umesto teškog preview-a — brže učitavanje.",
      "case.m1": "responzivan dizajn",
      "case.m2": "osnovna optimizacija",
      "case.m3": "prosečna izrada",
      "faq.eyebrow": "FAQ",
      "faq.title": "Često postavljana pitanja",
      "faq.sub": "Odgovori pre nego što pošalješ upit — bez skrivenih uslova.",
      "faq.q1": "Koliko traje izrada sajta?",
      "faq.a1": "Start paket: izrada do 3 dana. Biznis sajt: do nedelju dana, u zavisnosti od broja stranica i materijala koje pošalješ.",
      "faq.q2": "Da li u cenu ulazi domen i hosting?",
      "faq.a2": "Cena je za dizajn i izradu. Domen i hosting su posebno (oko 15–30€ godišnje), ali mogu da pomognem oko izbora i postavljanja.",
      "faq.q3": "Mogu li sam da menjam tekst i slike?",
      "faq.a3": "Da — u Premium paketu mogu uključiti CMS (WordPress ili slično). Za manje sajtove radim izmene po dogovoru ili kratko uputstvo.",
      "faq.q4": "Šta ako mi se dizajn ne sviđa?",
      "faq.a4": "Radimo iteracije dok ne budeš zadovoljan u okviru dogovorenog broja revizija. Cilj je da sajt bude tvoj, ne generički šablon.",
      "faq.q5": "Da li pravite sajtove na engleskom?",
      "faq.a5": "Da. Ovaj sajt ima SR/EN prekidač — isto mogu uraditi i za tvoj biznis ako ciljaš strane goste ili izvoz.",
      "faq.q6": "Kako funkcioniše plaćanje?",
      "faq.a6": "Obično 50% avans pre početka, 50% po završetku i predaji sajta. Za veće projekte dogovaramo rate po fazama.",
      "work.i1.title": "Kafe bar", "work.i1.tag": "Landing",
      "work.i2.title": "Fitnes trener", "work.i2.tag": "Portfolio",
      "work.i3.title": "Frizerski salon", "work.i3.tag": "Biznis sajt",
      "work.i4.title": "Advokat", "work.i4.tag": "Korporativni",
      "work.i5.title": "Prodavnica", "work.i5.tag": "E‑commerce",
      "work.i6.title": "Restoran", "work.i6.tag": "Rezervacije",

      "results.eyebrow": "Rezultati",
      "results.title": "Sajt koji donosi merljive rezultate",
      "results.sub": "Moderan, optimizovan sajt ne izgleda samo lepo — donosi više posetilaca, upita i prodaje.",
      "results.traffic.title": "Organski saobraćaj",
      "results.traffic.note": "rast u prvih 6 meseci",
      "results.seo.title": "SEO ocena stranice",
      "results.speed.title": "Brzina učitavanja",
      "results.leads.title": "Mesečne posete",
      "results.leads.note": "više poseta nakon redizajna",
      "results.responsive.title": "Responzivno na svim uređajima",
      "results.responsive.note": "Testirano na svim rezolucijama",

      "pricing.eyebrow": "Cene",
      "pricing.title": "Pošteno i transparentno",
      "pricing.sub": "Biraš paket, ja se bavim ostalim.",
      "pricing.badge": "Najpopularnije",
      "pricing.p1.desc": "Idealno za prvu profesionalnu pojavu online.",
      "pricing.p1.f1": "1 landing stranica",
      "pricing.p1.f2": "Responzivan dizajn",
      "pricing.p1.f3": "Kontakt forma",
      "pricing.p1.f4": "Osnovni SEO",
      "pricing.p1.f5": "Izrada do 3 dana",
      "pricing.p1.cta": "Izaberi Start",
      "pricing.p2.desc": "Kompletna prezentacija tvog biznisa.",
      "pricing.p2.f1": "Do 5 stranica",
      "pricing.p2.f2": "Premium dizajn po meri",
      "pricing.p2.f3": "Galerija / portfolio",
      "pricing.p2.f4": "SEO + brzina",
      "pricing.p2.f5": "Google mapa & integracije",
      "pricing.p2.f6": "Izrada do nedelju dana",
      "pricing.p2.cta": "Izaberi Biznis",
      "pricing.p3.amount": 'od 600<span>€</span>',
      "pricing.p3.desc": "Za one koji žele potpuno custom rešenje.",
      "pricing.p3.f1": "Neograničeno stranica",
      "pricing.p3.f2": "Animacije & interakcije",
      "pricing.p3.f3": "CMS / blog",
      "pricing.p3.f4": "Napredni SEO",
      "pricing.p3.f5": "Mesec dana podrške",
      "pricing.p3.cta": "Izaberi Premium",
      "pricing.note": 'Nisi siguran šta ti treba? <a href="#contact">Javi se za besplatnu procenu.</a>',

      "process.eyebrow": "Proces",
      "process.title": "Jednostavno od ideje do sajta",
      "process.sub": "Bez tehničkog stresa — vodim te kroz svaki korak.",
      "process.s1.title": "Razgovor",
      "process.s1.desc": "Kratak poziv da razumem tvoj biznis, cilj i stil koji ti se sviđa.",
      "process.s2.title": "Dizajn",
      "process.s2.desc": "Pravim predlog dizajna. Ti daješ povratnu informaciju dok ne bude savršeno.",
      "process.s3.title": "Izrada",
      "process.s3.desc": "Kodiram brz, responzivan i optimizovan sajt spreman za sve uređaje.",
      "process.s4.title": "Lansiranje",
      "process.s4.desc": "Postavljamo sajt online, povezujemo domen i pratimo da sve radi besprekorno.",

      "about.eyebrow": "O meni",
      "about.title": "Dizajn koji radi za tvoj biznis",
      "about.p1": "Pravim sajtove jer verujem da svaki biznis — i mali i veliki — zaslužuje da na internetu izgleda profesionalno. Ne prodajem ti komplikovane pakete koje ne razumeš; nudim jasna, pristupačna rešenja koja donose rezultate.",
      "about.p2": 'Svaki sajt pravim sa fokusom na tri stvari: <strong>poverenje, jasnoću i osećaj</strong>. Posetilac mora odmah da zna šta nudiš, da ti veruje i da poželi da te kontaktira.',
      "about.cta": "Hajde da sarađujemo",
      "about.b1": "od",
      "about.b2": "dana izrada",
      "about.b3": "responzivno",
      "about.tag": "Dizajn · Kod · Konverzija",

      "contact.eyebrow": "Kontakt",
      "contact.title": "Spreman za novi sajt?",
      "contact.sub": "Popuni formu i javljam se u roku od 24h sa besplatnom procenom — bez obaveze.",
      "contact.name": "Ime",
      "contact.namePh": "Tvoje ime",
      "contact.email": "Email",
      "contact.emailPh": "tvoj@email.com",
      "contact.budget": "Budžet",
      "contact.budget1": "150€ (Start)",
      "contact.budget2": "350€ (Biznis)",
      "contact.budget3": "600€+ (Premium)",
      "contact.budget4": "Nisam siguran",
      "contact.message": "Poruka",
      "contact.messagePh": "Ukratko o tvom projektu...",
      "contact.submit": "Pošalji upit",
      "contact.whatsapp": "Piši na WhatsApp",
      "contact.call": "Pozovi direktno",
      "contact.legal": 'Slanjem prihvataš <a href="privacy.html">politiku privatnosti</a>. Odgovaram u roku od 24h.',

      "footer.tagline": "Moderni sajtovi po meri za preduzetnike i male biznise.",
      "footer.contact": "Kontakt",
      "footer.rights": '© <span id="year"></span> StudioVeb. Sva prava zadržana.',
      "footer.made": "Dizajnirano i kodirano sa pažnjom.",
      "footer.privacy": "Politika privatnosti",

      "form.invalid": "Molim te popuni obavezna polja ispravno.",
      "form.sending": "Šaljem...",
      "form.success": "Hvala! Javljam ti se u roku od 24h. 🙌",
      "form.error": "Greška pri slanju. Piši na WhatsApp ili email.",
      "form.notConfigured": "Forma još nije povezana — postavi Web3Forms ključ u site-config.js ili piši na WhatsApp.",
      "form.rateLimit": "Previše pokušaja. Sačekaj 10 minuta ili piši na WhatsApp.",
      "doc.title": "Sajt koji prodaje — od 150€ | Studio Veb"
    },

    en: {
      "skip": "Skip to content",

      "nav.services": "Services",
      "nav.work": "Work",
      "nav.pricing": "Pricing",
      "nav.process": "Process",
      "nav.about": "About",
      "nav.faq": "FAQ",
      "nav.cta": "Book a call",
      "nav.menuOpen": "Open menu",
      "nav.menuClose": "Close menu",

      "hero.eyebrow": "Web design & development",
      "hero.title": 'A modern website that <span class="accent">sells</span> — from just €150',
      "hero.lead": "I build fast, elegant and responsive custom websites for entrepreneurs and small businesses. Clean design, smooth animations and one focus — turning visitors into clients.",
      "hero.cta1": "Start your project",
      "hero.cta2": "View pricing",
      "hero.stat1": "starting price",
      "hero.stat2num": "3 days",
      "hero.stat2": "average delivery",
      "hero.stat3num": "0",
      "hero.stat3": "off-the-shelf templates",

      "trust.responsive": "Responsive",

      "services.eyebrow": "Services",
      "services.title": "Everything you need to be online",
      "services.sub": "From a simple one‑pager to a full business presence — all tailored to your goals.",
      "services.s1.title": "Landing pages",
      "services.s1.desc": "A simple, persuasive page with one clear goal — more calls, sign‑ups or sales.",
      "services.s2.title": "Business websites",
      "services.s2.desc": "A multi‑page site with services, gallery and contact. A professional impression from the first click.",
      "services.s3.title": "Redesign",
      "services.s3.desc": "Got an old site? I refresh it with modern design, faster loading and better conversion.",
      "services.s4.title": "Speed optimization",
      "services.s4.desc": "A fast site = better Google ranking and happier visitors. I optimize images, code and loading.",
      "services.s5.title": "SEO basics",
      "services.s5.desc": "I set up meta tags, structure and speed so people can find you more easily in search.",
      "services.s6.title": "Maintenance",
      "services.s6.desc": "Edits, updates and monthly care for your site — so it stays current and secure.",

      "work.eyebrow": "Work",
      "work.title": "A few design examples",
      "work.sub": "The style you can expect — clean, modern and tailored to your industry.",
      "work.open": "Open live ↗",
      "work.loading": "Loading site…",
      "work.live": "Live site",
      "work.projectTitle": "Sample completed project",
      "work.desc": "A modern business site with clear structure, contact options and search optimization — ready to share and grow online presence.",
      "work.openBtn": "Open live site ↗",
      "work.fallbackTitle": "Client website example",
      "work.fallbackText": "On mobile we show a link instead of a heavy preview — faster loading.",
      "case.m1": "responsive design",
      "case.m2": "basic SEO setup",
      "case.m3": "average delivery",
      "faq.eyebrow": "FAQ",
      "faq.title": "Frequently asked questions",
      "faq.sub": "Answers before you send an inquiry — no hidden terms.",
      "faq.q1": "How long does it take?",
      "faq.a1": "Start package: delivery within 3 days. Business site: within one week, depending on pages and materials you provide.",
      "faq.q2": "Is domain and hosting included?",
      "faq.a2": "Pricing is for design and build. Domain and hosting are separate (~€15–30/year), but I can help you choose and set them up.",
      "faq.q3": "Can I edit text and images myself?",
      "faq.a3": "Yes — Premium can include a CMS (WordPress, etc.). For smaller sites I do updates by agreement or short training.",
      "faq.q4": "What if I don't like the design?",
      "faq.a4": "We iterate until you're happy within the agreed revision rounds. The site should feel yours, not a generic template.",
      "faq.q5": "Do you build sites in English?",
      "faq.a5": "Yes. This site has an SR/EN toggle — I can do the same for your business if you target international guests.",
      "faq.q6": "How does payment work?",
      "faq.a6": "Usually 50% upfront, 50% on delivery. Larger projects can be split by milestone.",
      "work.i1.title": "Café bar", "work.i1.tag": "Landing",
      "work.i2.title": "Fitness trainer", "work.i2.tag": "Portfolio",
      "work.i3.title": "Hair salon", "work.i3.tag": "Business site",
      "work.i4.title": "Lawyer", "work.i4.tag": "Corporate",
      "work.i5.title": "Shop", "work.i5.tag": "E‑commerce",
      "work.i6.title": "Restaurant", "work.i6.tag": "Reservations",

      "results.eyebrow": "Results",
      "results.title": "A website that delivers measurable results",
      "results.sub": "A modern, optimized website doesn't just look good — it brings more visitors, inquiries and sales.",
      "results.traffic.title": "Organic traffic",
      "results.traffic.note": "growth in the first 6 months",
      "results.seo.title": "On‑page SEO score",
      "results.speed.title": "Loading speed",
      "results.leads.title": "Monthly visits",
      "results.leads.note": "more visits after redesign",
      "results.responsive.title": "Responsive on all devices",
      "results.responsive.note": "Tested on all resolutions",

      "pricing.eyebrow": "Pricing",
      "pricing.title": "Fair and transparent",
      "pricing.sub": "You pick a package, I handle the rest.",
      "pricing.badge": "Most popular",
      "pricing.p1.desc": "Ideal for your first professional appearance online.",
      "pricing.p1.f1": "1 landing page",
      "pricing.p1.f2": "Responsive design",
      "pricing.p1.f3": "Contact form",
      "pricing.p1.f4": "Basic SEO",
      "pricing.p1.f5": "Delivery within 3 days",
      "pricing.p1.cta": "Choose Start",
      "pricing.p2.desc": "A complete presentation of your business.",
      "pricing.p2.f1": "Up to 5 pages",
      "pricing.p2.f2": "Premium custom design",
      "pricing.p2.f3": "Gallery / portfolio",
      "pricing.p2.f4": "SEO + speed",
      "pricing.p2.f5": "Google map & integrations",
      "pricing.p2.f6": "Delivery within 1 week",
      "pricing.p2.cta": "Choose Business",
      "pricing.p3.amount": 'from €600',
      "pricing.p3.desc": "For those who want a fully custom solution.",
      "pricing.p3.f1": "Unlimited pages",
      "pricing.p3.f2": "Animations & interactions",
      "pricing.p3.f3": "CMS / blog",
      "pricing.p3.f4": "Advanced SEO",
      "pricing.p3.f5": "One month of support",
      "pricing.p3.cta": "Choose Premium",
      "pricing.note": 'Not sure what you need? <a href="#contact">Get in touch for a free quote.</a>',

      "process.eyebrow": "Process",
      "process.title": "Simple, from idea to website",
      "process.sub": "No technical stress — I guide you through every step.",
      "process.s1.title": "Talk",
      "process.s1.desc": "A short call so I understand your business, goal and the style you like.",
      "process.s2.title": "Design",
      "process.s2.desc": "I create a design proposal. You give feedback until it's perfect.",
      "process.s3.title": "Build",
      "process.s3.desc": "I code a fast, responsive and optimized site ready for all devices.",
      "process.s4.title": "Launch",
      "process.s4.desc": "We put the site online, connect the domain and make sure everything runs flawlessly.",

      "about.eyebrow": "About",
      "about.title": "Design that works for your business",
      "about.p1": "I build websites because I believe every business — big or small — deserves to look professional online. I don't sell you complicated packages you don't understand; I offer clear, affordable solutions that deliver results.",
      "about.p2": 'I build every site with a focus on three things: <strong>trust, clarity and feeling</strong>. A visitor must instantly know what you offer, trust you, and want to contact you.',
      "about.cta": "Let's work together",
      "about.b1": "from",
      "about.b2": "days delivery",
      "about.b3": "responsive",
      "about.tag": "Design · Code · Conversion",

      "contact.eyebrow": "Contact",
      "contact.title": "Ready for a new website?",
      "contact.sub": "Fill out the form and I'll reply within 24h with a free, no‑obligation quote.",
      "contact.name": "Name",
      "contact.namePh": "Your name",
      "contact.email": "Email",
      "contact.emailPh": "your@email.com",
      "contact.budget": "Budget",
      "contact.budget1": "€150 (Start)",
      "contact.budget2": "€350 (Business)",
      "contact.budget3": "€600+ (Premium)",
      "contact.budget4": "Not sure",
      "contact.message": "Message",
      "contact.messagePh": "Briefly about your project...",
      "contact.submit": "Send inquiry",
      "contact.whatsapp": "Message on WhatsApp",
      "contact.call": "Call directly",
      "contact.legal": 'By sending you accept our <a href="privacy.html">privacy policy</a>. I reply within 24h.',

      "footer.tagline": "Modern custom websites for entrepreneurs and small businesses.",
      "footer.contact": "Contact",
      "footer.rights": '© <span id="year"></span> StudioVeb. All rights reserved.',
      "footer.made": "Designed and coded with care.",
      "footer.privacy": "Privacy policy",

      "form.invalid": "Please fill in the required fields correctly.",
      "form.sending": "Sending...",
      "form.success": "Thanks! I'll get back to you within 24h. 🙌",
      "form.error": "Something went wrong. Try WhatsApp or email.",
      "form.notConfigured": "Form not connected yet — add your Web3Forms key in site-config.js or use WhatsApp.",
      "form.rateLimit": "Too many attempts. Wait 10 minutes or use WhatsApp.",
      "doc.title": "A Site That Sells — From €150 | Studio Veb"
    }
  };

  let currentLang = "sr";

  const t = (key) => (I18N[currentLang] && I18N[currentLang][key]) || key;

  const setYear = () => {
    const year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();
  };

  const applyLang = (lang) => {
    currentLang = I18N[lang] ? lang : "sr";
    const dict = I18N[currentLang];

    // Tekstualni sadržaj
    document.querySelectorAll("[data-i18n]").forEach((el) => {
      const val = dict[el.getAttribute("data-i18n")];
      if (val != null) el.textContent = val;
    });
    // HTML sadržaj (sadrži <span>, <strong>, <a> ...)
    document.querySelectorAll("[data-i18n-html]").forEach((el) => {
      const val = dict[el.getAttribute("data-i18n-html")];
      if (val != null) {
        el.innerHTML = SEC ? SEC.sanitizeI18nHtml(val) : val;
      }
    });
    // Placeholderi
    document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
      const val = dict[el.getAttribute("data-i18n-placeholder")];
      if (val != null) el.setAttribute("placeholder", val);
    });

    // <html lang>, SEO meta, dugme jezika
    document.documentElement.setAttribute("lang", currentLang === "en" ? "en" : "sr");
    applySeoMeta(currentLang);
    const label = document.getElementById("langLabel");
    if (label) label.textContent = currentLang.toUpperCase();

    updateMenuAria();

    setYear(); // ponovo upiši godinu (footer.rights je innerHTML)

    try { localStorage.setItem("lang", currentLang); } catch (e) {}

    try {
      const url = new URL(window.location.href);
      if (currentLang === "en") url.searchParams.set("lang", "en");
      else url.searchParams.delete("lang");
      window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    } catch (e) { /* ignore */ }
  };

  /* ========================================================
     INTERAKCIJE
     ======================================================== */

  /* ---------- Sticky nav na scroll ---------- */
  const nav = document.getElementById("nav");
  const onScroll = () => {
    if (window.scrollY > 20) nav.classList.add("is-scrolled");
    else nav.classList.remove("is-scrolled");
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Mobilni meni ---------- */
  const toggle = document.getElementById("navToggle");
  const links = document.getElementById("navLinks");
  const backdrop = document.getElementById("navBackdrop");
  const navInner = document.querySelector(".nav__inner");
  const langBtn = document.getElementById("langToggle");
  const mainEl = document.querySelector("main");
  const mqNavMobile = window.matchMedia("(max-width: 980px)");

  const updateMenuAria = () => {
    if (!toggle || !links) return;
    const open = links.classList.contains("is-open");
    toggle.setAttribute("aria-label", t(open ? "nav.menuClose" : "nav.menuOpen"));
    if (backdrop) backdrop.setAttribute("aria-label", t("nav.menuClose"));
    links.setAttribute("aria-hidden", open ? "false" : "true");
  };

  const closeMenu = () => {
    if (!links || !toggle) return;
    links.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    document.body.classList.remove("menu-open");
    if (backdrop) backdrop.hidden = true;
    updateMenuAria();
  };
  const openMenu = () => {
    if (!links || !toggle) return;
    links.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    document.body.classList.add("menu-open");
    if (backdrop) backdrop.hidden = false;
    updateMenuAria();
  };

  const placeNavForViewport = () => {
    if (!links || !navInner || !nav) return;
    if (mqNavMobile.matches) {
      if (mainEl) {
        if (backdrop && backdrop.parentElement !== document.body) {
          document.body.insertBefore(backdrop, mainEl);
        }
        if (links.parentElement !== document.body) {
          document.body.insertBefore(links, mainEl);
        }
      }
    } else {
      closeMenu();
      if (langBtn && links.parentElement !== navInner) {
        navInner.insertBefore(links, langBtn);
      }
      if (backdrop && backdrop.parentElement !== nav) {
        nav.appendChild(backdrop);
      }
      links.removeAttribute("aria-hidden");
    }
    updateMenuAria();
  };

  placeNavForViewport();
  if (typeof mqNavMobile.addEventListener === "function") {
    mqNavMobile.addEventListener("change", placeNavForViewport);
  } else if (typeof mqNavMobile.addListener === "function") {
    mqNavMobile.addListener(placeNavForViewport);
  }

  if (toggle && links) {
    toggle.addEventListener("click", () => {
      links.classList.contains("is-open") ? closeMenu() : openMenu();
    });
    links.querySelectorAll("a").forEach((a) => a.addEventListener("click", closeMenu));
    if (backdrop) backdrop.addEventListener("click", closeMenu);
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") closeMenu(); });
    updateMenuAria();
  }

  // Inicijalni jezik: ?lang= u URL-u > localStorage > sr (primarni za SEO)
  const rawLang = new URLSearchParams(window.location.search).get("lang");
  const urlLang = rawLang === "en" || rawLang === "sr" ? rawLang : null;
  const saved = (function () {
    try {
      const v = localStorage.getItem("lang");
      return v === "en" || v === "sr" ? v : null;
    } catch (e) { return null; }
  })();
  const initial = urlLang || (saved === "en" ? "en" : "sr");
  applyLang(initial);

  /* ---------- Deep link putanje (/work → #work) za deljenje i Netlify _redirects ---------- */
  const PATH_TO_SECTION = {
    "/services": "#services",
    "/work": "#work",
    "/pricing": "#pricing",
    "/process": "#process",
    "/about": "#about",
    "/faq": "#faq",
    "/contact": "#contact"
  };
  const scrollToPathSection = () => {
    const path = window.location.pathname.replace(/\/$/, "") || "/";
    const sel = PATH_TO_SECTION[path];
    if (!sel) return;
    const target = document.querySelector(sel);
    if (!target) return;
    const go = () => target.scrollIntoView({ behavior: "smooth", block: "start" });
    if (document.readyState === "complete") go();
    else window.addEventListener("load", go, { once: true });
  };
  scrollToPathSection();

  const langToggle = document.getElementById("langToggle");
  if (langToggle) {
    langToggle.addEventListener("click", () => {
      closeMenu();
      applyLang(currentLang === "sr" ? "en" : "sr");
    });
  }

  /* ---------- Scroll reveal (IntersectionObserver) ---------- */
  const reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const delay = (i % 6) * 70;
            setTimeout(() => entry.target.classList.add("is-visible"), delay);
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-visible"));
  }

  /* ---------- Forma: validacija + demo slanje ---------- */
  const form = document.getElementById("contactForm");
  const status = document.getElementById("formStatus");

  const setError = (field, hasError) => {
    field.closest(".field").classList.toggle("is-invalid", hasError);
  };

  const hasFormBackend = () => Boolean(syncFormAccessKey());

  if (form) {
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      status.className = "form__status";
      status.textContent = "";

      if (SEC && SEC.isHoneypotTripped(form)) {
        form.reset();
        status.classList.add("is-success");
        status.textContent = t("form.success");
        return;
      }

      const name = form.name;
      const email = form.email;
      const message = form.message;
      const budget = form.budget;

      if (SEC) {
        name.value = SEC.sanitizeText(name.value, 80);
        const cleanEmail = SEC.sanitizeEmail(email.value);
        email.value = cleanEmail || SEC.sanitizeText(email.value, 254);
        message.value = SEC.sanitizeText(message.value, 2000);
        if (budget && !BUDGET_VALUES.has(budget.value)) budget.value = "nisam-siguran";
      }

      let valid = true;

      if (!name.value.trim()) { setError(name, true); valid = false; } else setError(name, false);
      const emailOk = SEC
        ? Boolean(SEC.sanitizeEmail(email.value))
        : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim());
      if (!emailOk) { setError(email, true); valid = false; } else setError(email, false);
      if (!message.value.trim()) { setError(message, true); valid = false; } else setError(message, false);

      if (!valid) {
        status.classList.add("is-error");
        status.textContent = t("form.invalid");
        return;
      }

      if (SEC && !SEC.canSubmitForm()) {
        status.classList.add("is-error");
        status.textContent = t("form.rateLimit");
        return;
      }

      const accessKey = syncFormAccessKey();
      if (!accessKey) {
        status.classList.add("is-error");
        status.textContent = t("form.notConfigured");
        const wa = document.getElementById("whatsappLink");
        if (wa) wa.focus();
        return;
      }

      const btn = form.querySelector("button[type=submit]");
      btn.disabled = true;
      btn.textContent = t("form.sending");

      try {
        const payload = new FormData(form);
        payload.set("access_key", accessKey);
        const res = await fetch(form.action, {
          method: "POST",
          body: payload,
          headers: { Accept: "application/json" }
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.success === false) throw new Error(data.message || "fail");
        if (SEC) SEC.recordFormSubmit();
        form.reset();
        status.classList.add("is-success");
        status.textContent = t("form.success");
      } catch (err) {
        status.classList.add("is-error");
        status.textContent = t("form.error");
      } finally {
        btn.disabled = false;
        btn.textContent = t("contact.submit");
      }
    });
  }

  /* ---------- Rezultati: animacija grafikona + brojača ---------- */
  const results = document.getElementById("results");
  if (results) {
    const RING_CIRC = 327; // 2 * PI * 52

    const countUp = (el) => {
      const target = parseFloat(el.getAttribute("data-count")) || 0;
      const prefix = el.getAttribute("data-prefix") || "";
      const suffix = el.getAttribute("data-suffix") || "";
      const dur = 1300;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = prefix + Math.round(target * eased) + suffix;
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    };

    const runResults = () => {
      results.classList.add("is-animated");
      // prstenovi
      results.querySelectorAll(".ring").forEach((ring) => {
        const pct = parseFloat(ring.getAttribute("data-pct")) || 0;
        const bar = ring.querySelector(".ring__bar");
        if (bar) bar.style.strokeDashoffset = String(RING_CIRC * (1 - pct / 100));
      });
      // brojači
      results.querySelectorAll("[data-count]").forEach(countUp);
    };

    if ("IntersectionObserver" in window) {
      const rObs = new IntersectionObserver(
        (entries, obs) => {
          entries.forEach((e) => {
            if (e.isIntersecting) { runResults(); obs.disconnect(); }
          });
        },
        { threshold: 0.3 }
      );
      rObs.observe(results);
    } else {
      runResults();
    }
  }

  /* ---------- Live prikaz (sajt u sajtu) — desktop only, lazy load ---------- */
  const frame = document.getElementById("browserFrame");
  const loader = document.getElementById("browserLoader");
  const sizer = document.getElementById("browserSizer");
  const viewport = document.getElementById("browserViewport");
  const fallback = document.getElementById("browserFallback");
  const browser = document.getElementById("browser");
  const mqMobile = window.matchMedia("(max-width: 980px)");
  const useIframePreview = () => !mqMobile.matches;

  const setPreviewMode = () => {
    const desktop = useIframePreview();
    if (fallback) fallback.hidden = desktop;
    if (sizer) sizer.hidden = !desktop;
    if (loader && !desktop) loader.classList.add("is-hidden");
    if (!desktop && frame) {
      frame.removeAttribute("src");
    }
  };
  setPreviewMode();
  mqMobile.addEventListener("change", setPreviewMode);

  const loadIframe = () => {
    if (!frame || !useIframePreview()) return;
    const src = frame.getAttribute("data-src");
    if (!src) return;
    if (SEC && !SEC.isAllowedIframeSrc(src)) return;
    if (!frame.getAttribute("src")) frame.setAttribute("src", src);
  };

  if (browser && "IntersectionObserver" in window) {
    const bObs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) { loadIframe(); bObs.disconnect(); }
        });
      },
      { rootMargin: "120px" }
    );
    bObs.observe(browser);
  } else {
    loadIframe();
  }

  if (frame && loader) {
    const hideLoader = () => loader.classList.add("is-hidden");
    frame.addEventListener("load", hideLoader);
    setTimeout(hideLoader, 8000);
  }

  if (frame && sizer && viewport) {
    const FRAME_W = 1200;
    const FRAME_H = 5200;
    const fit = () => {
      if (!useIframePreview()) return;
      const scale = viewport.clientWidth / FRAME_W;
      frame.style.transform = "scale(" + scale + ")";
      sizer.style.height = FRAME_H * scale + "px";
    };
    fit();
    window.addEventListener("resize", fit, { passive: true });
    frame.addEventListener("load", fit);
  }
})();
