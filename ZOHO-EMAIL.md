# Zoho Mail — `studioveb.rs` (MX i DNS)

MX zapise **ne dodaješ u kod sajta**, već tamo gde je **DNS zona** za `studioveb.rs`.

## 1. Gde je DNS?

Proveri kod **registrara** domena (RNIDS registrant) ili u **Netlify**:

- Netlify → tvoj sajt → **Domain management** → `studioveb.rs`
  - Ako piše **„Netlify DNS“** / nameserveri tipa `dns1.p0x.ns.netlify.com` → zapise dodaješ **u Netlify** (DNS panel za domen).
  - Ako piše da koristiš **external DNS** → zapise dodaješ kod **registrara** (panel gde si kupio `.rs`).

**Pravilo:** MX ide na isti panel gde su **nameserveri** domena (Zoho to i naglašava).

---

## 2. MX zapisi (Zoho EU — sa tvog ekrana)

Obriši **stare MX** zapise ako postoje (Gmail, hosting…). Dodaj **samo ove tri**:

| Tip | Host / ime | Prioritet | Vrednost / pokazuje na |
|-----|------------|-----------|-------------------------|
| MX  | `@` ili prazno | 10 | `mx.zoho.eu` |
| MX  | `@` ili prazno | 20 | `mx2.zoho.eu` |
| MX  | `@` ili prazno | 50 | `mx3.zoho.eu` |

**Host `@`** = koren domena `studioveb.rs` (kod nekih registrara: prazno polje ili `studioveb.rs`).

**TTL:** Auto ili 3600.

---

## 3. Primer: Netlify DNS

1. Netlify → **Domain management** → `studioveb.rs` → **DNS records**
2. **Add record** → MX → priority 10 → `mx.zoho.eu` → host `@`
3. Ponovi za 20 → `mx2.zoho.eu` i 50 → `mx3.zoho.eu`
4. **Ne briši** A/CNAME zapise koji vode sajt na Netlify (sajt i email mogu zajedno).

---

## 4. Primer: registrar (spoljni DNS)

1. Panel registrara → DNS zona za `studioveb.rs`
2. Dodaj 3 MX zapisa kao gore
3. Ostavi A/CNAME za sajt kako su bile (Netlify IP ili CNAME `apex-loadbalancer.netlify.com` itd.)

---

## 5. Posle MX-a u Zoho-u

U čarobnjaku uradi i ostalo što Zoho traži (isti DNS panel):

- **TXT** — SPF (Zoho ti da tačan string)
- **TXT** — DKIM (jedan ili više zapisa)
- **CNAME** — mail / zb… (ako traži)

Kopiraj vrednosti **tačno** iz Zoho ekrana za `studioveb.rs`.

---

## 6. Verifikacija

1. Sačekaj **30 min – 24 h** (DNS propagacija).
2. Provera: [https://mxtoolbox.com/SuperTool.aspx](https://mxtoolbox.com/SuperTool.aspx) → MX Lookup → `studioveb.rs`  
   Treba da vidi `mx.zoho.eu` sa prioritetom 10.
3. U Zoho-u klikni **Verify** / **Proceed**.

Ako i dalje crveno: MX si verovatno dodao na **pogrešnom** mestu (registrar umesto Netlify ili obrnuto).

---

## 7. Sajt vs email

| Servis | Gde se podešava |
|--------|------------------|
| Sajt (Netlify) | A / CNAME → Netlify |
| Email (Zoho) | MX + SPF + DKIM → DNS zona domena |
| Kontakt forma | Web3Forms ključ u `site-config.js` |

Email adresa posle uspeha: npr. `ognjen@studioveb.rs`, `zdravo@studioveb.rs`.
