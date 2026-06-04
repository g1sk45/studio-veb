# Bezbednost — Studio Veb sajt

## Šta je zaštićeno

- **XSS** — prevodi sa HTML-om (`data-i18n-html`) prolaze kroz `sanitizeI18nHtml()` (samo bezbedni tagovi i linkovi).
- **Spam / botovi** — skriveno honeypot polje; lažan uspeh ako bot popuni polje.
- **Pretrpanje forme** — klijentski rate limit (5 slanja / 10 min), `maxlength` na poljima, čišćenje kontrolnih karaktera.
- **Clickjacking** — `X-Frame-Options: DENY` + CSP `frame-ancestors 'none'`.
- **Lažni iframe** — učitavanje samo sa `apartmanibanvrbas.rs` (HTTPS).
- **Osetljiva zaglavlja** — CSP, Referrer-Policy, Permissions-Policy (vidi `_headers` / `vercel.json` / `.htaccess`).

## Šta host mora da uključi

Staticki fajlovi **ne mogu sami** da postave HTTP zaglavlja — hosting mora da servira:

- Netlify / Cloudflare Pages → `_headers`
- Vercel → `vercel.json`
- cPanel / Apache → `.htaccess` + `mod_headers`

Lokalno (`python3 -m http.server`) zaglavlja **neće** biti aktivna — to je normalno.

## Prijava ranjivosti

Email: zdravo@studioveb.rs (vidi i `security.txt`).

## Ograničenja statičnog sajta

- Nema serverske sesije ni baze — napadi tipa SQL injection ne važe.
- Pravo ograničavanje spam-a na formi radi **Web3Forms** + honeypot; za jaču zaštitu uključi CAPTCHA u Web3Forms panelu.
- CSP ne zamenjuje redovno ažuriranje zavisnosti (nema npm paketa na sajtu).
