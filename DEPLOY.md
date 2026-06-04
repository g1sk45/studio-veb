# Objavljivanje — domen, HTTPS, Search Console

## 0. Git → hosting

1. Repozitorijum na GitHub/GitLab (javni: **ne commituj** pravi Web3Forms ključ).
2. Poveži repo sa Netlify / Vercel / Cloudflare Pages (build nije potreban — samo statički fajlovi).
3. Publish directory: koren projekta (`index.html` u root-u).
4. Posle deploya postavi `web3formsAccessKey` u `site-config.js` na hostu ili kroz env ako host podržava zamenu fajla.
5. **Deep linkovi** (`/work`, `/pricing`…): fajl `_redirects` na Netlify servira `index.html` (isti OG kao početna). Deljenje: `https://studioveb.rs/work` radi preview slike.

## 1. Domen i hosting

1. Kupi domen (npr. `studioveb.rs`) i poveži ga sa hostingom (Netlify, Vercel, Cloudflare Pages, cPanel…).
2. U `site-config.js` postavi tačan `url` (npr. `https://studioveb.rs`).
3. U `index.html`, `sitemap.xml` i `robots.txt` proveri da canonical / Sitemap URL odgovaraju tom domenu.

## 2. HTTPS (obavezno)

- Većina hostova uključuje **besplatan SSL** (Let’s Encrypt) automatski.
- Uključi **„Force HTTPS”** / „Always use HTTPS” u panelu hosta.
- Proveri: `https://tvoj-domen.rs` otvara sajt bez upozorenja u browseru.

## 3. Search Console

1. Idi na [Google Search Console](https://search.google.com/search-console).
2. Dodaj **property** → URL prefix: `https://studioveb.rs`.
3. Verifikacija (jedna od opcija):
   - **HTML tag**: kopiraj `content` iz meta taga i stavi u `site-config.js` → `googleSiteVerification`, pa ponovo uploaduj sajt; ili
   - **DNS TXT** zapis kod registrara domena.
4. Po verifikaciji: **Sitemaps** → dodaj `https://studioveb.rs/sitemap.xml`.
5. Za Bing: [Bing Webmaster Tools](https://www.bing.com/webmasters) — isti sitemap.

## 4. SEO (ugrađeno u sajt)

- **Meta + OG + Twitter** — naslovi i opisi u `site-config.js` → `seo` (SR/EN).
- **hreflang** — sr na `/`, en na `/?lang=en` (Google zna da sajt ima dva jezika).
- **Schema.org** — `WebSite`, `WebPage`, `ProfessionalService`, `FAQPage` (JSON-LD u `index.html`).
- **sitemap.xml** — samo početna (bez `privacy.html`, jer je `noindex`).
- **robots.txt** — dozvoljava indeksiranje, blokira samo politiku privatnosti.

Posle većih izmena sadržaja ažuriraj `<lastmod>` u `sitemap.xml`.

## 5. Open Graph slika

- Podrazumevano: `assets/og-image.svg` (podesi `seo.ogImagePath` u `site-config.js`).
- Za **Viber, Facebook i Instagram** bolje radi **PNG 1200×630** — sačuvaj kao `assets/og-image.png` i u config stavi: `ogImagePath: "/assets/og-image.png"`.

## 6. Kontakt forma (Web3Forms)

1. [web3forms.com](https://web3forms.com) → Access Key.
2. U `site-config.js`: `web3formsAccessKey: "tvoj_kljuc"`.
3. Testiraj slanje sa live HTTPS sajta.

## 7. WhatsApp

U `site-config.js` izmeni `whatsapp` (samo cifre, npr. `381601234567`).

## 8. Bezbednost (ugrađeno)

Sajt je statičan; zaštita je višeslojna:

| Sloj | Šta radi |
|------|----------|
| **HTTP zaglavlja** | `_headers` (Netlify/Cloudflare Pages), `vercel.json`, `.htaccess` (Apache) — CSP, X-Frame-Options, nosniff, HTTPS redirect |
| **security.js** | Sanitizacija i18n HTML-a, validacija forme, honeypot, rate limit (5 / 10 min), allowlist iframe domena |
| **Forma** | `maxlength`, honeypot `botcheck`, slanje samo na `api.web3forms.com` |
| **security.txt** | `/security.txt` i `/.well-known/security.txt` za prijavu ranjivosti |

Posle uploada proveri zaglavlja: [securityheaders.com](https://securityheaders.com/) (unesi live URL).

**Napomena:** Web3Forms Access Key u `site-config.js` je namenjen frontendu — ne deli ga javno u tutorialima; rotiraj ključ na web3forms.com ako curi.

## 9. Provera posle objave

- [PageSpeed Insights](https://pagespeed.web.dev/)
- [Rich Results Test](https://search.google.com/test/rich-results) — FAQ + ProfessionalService
- [Schema Markup Validator](https://validator.schema.org/) — URL live sajta
- Deljenje linka na Viber/WhatsApp — da li se vidi `og:image` i naslov
- Search Console → **Indexing** → proveri da je početna indeksirana, FAQ može dobiti rich rezultate
