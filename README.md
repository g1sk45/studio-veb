# StudioVeb — sajt za web design agenciju

Moderan, brz i potpuno responzivan one-page sajt (HTML / CSS / JavaScript).

## Pokretanje

```bash
python3 -m http.server 8000
# http://localhost:8000
```

## Struktura

```
├── index.html
├── styles.css
├── script.js
├── security.js         # XSS, forma, honeypot, rate limit
├── site-config.js      # domen, WhatsApp, Web3Forms (placeholder u repou)
├── site-config.example.js
├── sitemap.xml
├── robots.txt
├── manifest.webmanifest
├── _headers            # Netlify / Cloudflare Pages
├── vercel.json
├── .htaccess           # Apache / cPanel
├── security.txt
├── .well-known/security.txt
├── favicon.svg
├── assets/og-image.svg
├── privacy.html
├── SECURITY.md
├── DEPLOY.md
└── README.md
```

## Pre prvog push-a na Git

1. Proveri **`site-config.js`** — domen, email, telefon; `web3formsAccessKey` ostavi placeholder u **javnom** repou.
2. Pravi ključ Web3Forms stavi lokalno u `site-config.js` ili u **`site-config.local.js`** (u `.gitignore`, ne commituj).
3. **`sitemap.xml`** / **`robots.txt`** — isti domen kao `url` u config-u.
4. Lokalni test: SR/EN, mobilni meni, forma, `#work`, `#results`, `privacy.html`.
5. `git init` → `git add .` → `git commit` → `git remote add origin …` → **`git push`** (push radiš ti).

Detalji bezbednosti: **`SECURITY.md`**. Objava na hosting: **`DEPLOY.md`**.

## Pre objave na internet (posle push-a)

1. **`site-config.js`** na hostu — `url`, `whatsapp`, `web3formsAccessKey`
2. HTTPS + odgovarajući config fajl za host (`_headers` / `vercel.json` / `.htaccess`)
3. [web3forms.com](https://web3forms.com) — Access Key + CAPTCHA u panelu
4. Google Search Console + `sitemap.xml`

## Ugrađeno

- SEO: title/description (SR/EN), keywords, geo, hreflang, canonical
- Open Graph + Twitter Card + `manifest.webmanifest`
- Schema.org: WebSite, WebPage, ProfessionalService, FAQPage
- Bezbednost: CSP i zaglavlja na hostu, `security.js`, honeypot, rate limit
- Kontakt forma (Web3Forms) + WhatsApp
- SR/EN prekidač
- Portfolio 3×2 na mobilnom, kompaktna sekcija Rezultati
- Live preview `apartmanibanvrbas.rs` (desktop; mobil — link)

## Forma

Bez `web3formsAccessKey` forma upućuje na WhatsApp. Sa ključem — slanje preko Web3Forms (testiraj na **HTTPS** live sajtu).

## Prilagođavanje

- Boje → `styles.css` (`:root`)
- Tekst → `index.html` + `script.js` (`I18N`)
