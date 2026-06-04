/**
 * Studio Veb — klijentska zaštita (XSS, spam, validacija).
 * Učitava se pre script.js.
 */
(function () {
  "use strict";

  const ALLOWED_HTML_TAGS = new Set(["A", "SPAN", "STRONG", "EM", "B", "I", "BR"]);
  const SAFE_HREF = /^(#[\w-]*|\/[\w./?#&=%+-]*|\.\/[\w./?#&=%+-]*|https:\/\/[\w.-]+(?:\/[\w./?#&=%+-]*)?)$/i;

  const IFRAME_ALLOWLIST = new Set([
    "apartmanibanvrbas.rs",
    "www.apartmanibanvrbas.rs"
  ]);

  const RATE_KEY = "sv_form_times";
  const RATE_MAX = 5;
  const RATE_WINDOW_MS = 10 * 60 * 1000;

  const stripControl = (s) => String(s).replace(/[\0-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "");

  const sanitizeText = (value, maxLen) => {
    if (value == null) return "";
    let s = stripControl(value).trim();
    if (maxLen > 0 && s.length > maxLen) s = s.slice(0, maxLen);
    return s;
  };

  const sanitizeEmail = (value) => {
    const s = sanitizeText(value, 254).toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "";
    if (s.includes("..") || s.startsWith(".") || s.endsWith(".")) return "";
    return s;
  };

  const sanitizeI18nHtml = (html) => {
    if (!html) return "";
    const tpl = document.createElement("template");
    tpl.innerHTML = html;

    const walk = (parent) => {
      [...parent.childNodes].forEach((node) => {
        if (node.nodeType === Node.TEXT_NODE) return;
        if (node.nodeType !== Node.ELEMENT_NODE) {
          node.remove();
          return;
        }
        const tag = node.tagName;
        if (!ALLOWED_HTML_TAGS.has(tag)) {
          while (node.firstChild) parent.insertBefore(node.firstChild, node);
          node.remove();
          walk(parent);
          return;
        }
        [...node.attributes].forEach((attr) => {
          const name = attr.name.toLowerCase();
          if (tag === "A" && name === "href") {
            const href = attr.value.trim().replace(/\s/g, "");
            if (!href || /^javascript:/i.test(href) || /^data:/i.test(href) || !SAFE_HREF.test(href)) {
              node.removeAttribute("href");
            } else {
              node.setAttribute("href", href);
              if (href.startsWith("http")) node.setAttribute("rel", "noopener noreferrer");
            }
            return;
          }
          if (tag === "SPAN" && name === "id" && attr.value === "year") return;
          node.removeAttribute(attr.name);
        });
        walk(node);
      });
    };
    walk(tpl.content);
    return tpl.innerHTML;
  };

  const isHttpsUrl = (url) => {
    try {
      const u = new URL(url);
      return u.protocol === "https:";
    } catch {
      return false;
    }
  };

  const isAllowedIframeSrc = (url) => {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") return false;
      return IFRAME_ALLOWLIST.has(u.hostname);
    } catch {
      return false;
    }
  };

  const isSafeSiteOrigin = (url) => {
    try {
      const u = new URL(url);
      if (u.protocol !== "https:") return false;
      if (u.username || u.password) return false;
      return /^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$/i.test(u.hostname);
    } catch {
      return false;
    }
  };

  const getRateTimes = () => {
    try {
      const raw = localStorage.getItem(RATE_KEY);
      const now = Date.now();
      const list = raw ? JSON.parse(raw) : [];
      if (!Array.isArray(list)) return [];
      return list.filter((t) => typeof t === "number" && now - t < RATE_WINDOW_MS);
    } catch {
      return [];
    }
  };

  const canSubmitForm = () => getRateTimes().length < RATE_MAX;

  const recordFormSubmit = () => {
    try {
      const times = getRateTimes();
      times.push(Date.now());
      localStorage.setItem(RATE_KEY, JSON.stringify(times));
    } catch { /* ignore */ }
  };

  const isHoneypotTripped = (form) => {
    const hp = form.querySelector('input[name="botcheck"]');
    return hp && hp.checked;
  };

  window.SiteSecurity = {
    sanitizeText,
    sanitizeEmail,
    sanitizeI18nHtml,
    isHttpsUrl,
    isAllowedIframeSrc,
    isSafeSiteOrigin,
    canSubmitForm,
    recordFormSubmit,
    isHoneypotTripped,
    IFRAME_ALLOWLIST
  };
})();
