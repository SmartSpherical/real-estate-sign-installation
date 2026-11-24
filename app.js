/* Renders the site from config.js + i18n.js and runs all page interactions.
   You shouldn't need to edit this file to change prices or contact info. */
(() => {
  "use strict";
  const S = window.SITE, UI = window.UI;
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- Language ---------------- */
  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch {} },
  };
  const urlLang = new URLSearchParams(location.search).get("lang");
  let lang = (urlLang === "zh" || urlLang === "en") ? urlLang
    : store.get("lang") || ((navigator.language || "").toLowerCase().startsWith("zh") ? "zh" : (S.business.defaultLanguage || "en"));

  const t = (v) => (v && typeof v === "object" && !Array.isArray(v)) ? (v[lang] ?? v.en ?? "") : (v ?? "");
  const ui = (k) => UI[lang]?.[k] ?? UI.en[k] ?? k;
  const get = (path) => path.split(".").reduce((o, k) => o?.[k], S);
  const money = (n) => S.business.currency + Math.round(n).toLocaleString("en-US");
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  /* ---------------- Icons ---------------- */
  const ICONS = {
    post: '<path d="M6 21V3M6 5h13M9 5v2M16 5v2M8 7h10v8H8zM11 11h4"/><path d="M3 21h8"/>',
    stake: '<rect x="5" y="4" width="14" height="9" rx="1"/><path d="M8 13v8M16 13v8M9 8.5h6"/>',
    rider: '<rect x="4" y="3" width="16" height="9" rx="1"/><path d="M8 12v2M16 12v2"/><rect x="5" y="14" width="14" height="5" rx="1"/><path d="M9 16.5h6"/>',
    openhouse: '<path d="M4 5h11l4 4-4 4H4zM8 13v8M7 21h4"/><path d="M7 9h6"/>',
    removal: '<path d="M12 3v10M8 9l4 4 4-4M4 17c2 2 4 2 8 2s6 0 8-2"/>',
    brochure: '<rect x="4" y="6" width="16" height="12" rx="1.5"/><path d="M4 10h16M8 14h5"/><path d="M8 6V4h8v2"/>',
    repair: '<path d="M14.7 6.3a4 4 0 015 5L12 19l-4 1 1-4 7.7-7.7zM5 3l3 3M3 5l3 3"/>',
    storage: '<path d="M3 8l9-5 9 5v12H3zM7 20v-7h10v7M7 16h10"/>',
    board: '<rect x="2" y="4" width="20" height="10" rx="1"/><path d="M6 14v7M18 14v7M6 9h12"/>',
  };
  const icon = (name) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ICONS.storefront}</svg>`;

  /* ---------------- Word splitter for reveal animations ---------------- */
  const CJK = /[　-鿿＀-￯]/;
  let wordIndex = 0;
  function splitNode(node) {
    const out = document.createDocumentFragment();
    node.childNodes.forEach((child) => {
      if (child.nodeType === 3) {
        const tokens = child.textContent.match(/[　-鿿＀-￯]|[^\s　-鿿＀-￯]+|\s+/g) || [];
        tokens.forEach((tok) => {
          if (/^\s+$/.test(tok)) { out.append(" "); return; }
          const w = document.createElement("span"); w.className = "w";
          const inner = document.createElement("span"); inner.textContent = tok;
          inner.style.setProperty("--i", wordIndex++);
          w.append(inner); out.append(w);
        });
      } else if (child.nodeName === "BR") {
        out.append(document.createElement("br"));
      } else {
        const clone = child.cloneNode(false);
        clone.append(splitNode(child)); out.append(clone);
      }
    });
    return out;
  }
  function split(el) {
    wordIndex = 0;
    const tmp = document.createElement("div"); tmp.innerHTML = el.innerHTML;
    el.innerHTML = ""; el.append(splitNode(tmp));
  }

  /* ---------------- Render (re-run on language switch) ---------------- */
  function render() {
    document.documentElement.lang = lang === "zh" ? "zh-CN" : "en";
    document.title = t(S.seo.title);
    $('meta[name="description"]').setAttribute("content", t(S.seo.description));
    $$("[data-lang]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.lang === lang)));

    $$("[data-i18n]").forEach((el) => { el.textContent = ui(el.dataset.i18n); });
    $$("[data-i18n-html]").forEach((el) => { el.innerHTML = ui(el.dataset.i18nHtml); });
    $$("[data-i18n-placeholder]").forEach((el) => { el.placeholder = ui(el.dataset.i18nPlaceholder); });
    $$("[data-bind]").forEach((el) => { el.textContent = t(get(el.dataset.bind)); });
    $$("[data-show]").forEach((el) => el.classList.toggle("is-empty", !t(get(el.dataset.show))));
    $$("[data-tel]").forEach((a) => a.href = "tel:" + S.contact.phoneLink);
    $$("[data-mail]").forEach((a) => a.href = "mailto:" + S.contact.email);

    const lead = S.services.find((s) => s.popular) || S.services[0];
    $("#heroBadge").textContent = `${ui("hero.badge")} ${money(lead.price)}`;
    $("#year").textContent = new Date().getFullYear();
    $("#avatar").textContent = (S.contact.person || "").split(/\s+/).map((w) => w[0]).join("").slice(0, 2);

    // ticker
    const names = S.services.map((s) => `<span>${esc(t(s.name))}</span>`).join("");
    $("#ticker").innerHTML = names + names;

    // stats
    $("#statsGrid").innerHTML = S.stats.map((s, i) => `
      <div class="stat glass fade-up" style="--d:${i}">
        <div class="stat__num"><span data-count="${s.value}" data-dec="${s.decimals || 0}">0</span><sup>${esc(s.suffix || "")}</sup></div>
        <p class="stat__label">${esc(t(s.label))}</p>
      </div>`).join("");

    // services
    $("#servicesGrid").innerHTML = S.services.map((s, i) => `
      <article class="svc fade-up" style="--d:${i % 3}">
        <div class="svc__top">
          <div class="svc__icon">${icon(s.icon)}</div>
          ${s.popular ? `<span class="svc__tag mono">${ui("services.popular")}</span>` : ""}
        </div>
        <h3 class="svc__name">${esc(t(s.name))}</h3>
        <p class="svc__blurb">${esc(t(s.blurb))}</p>
        <ul class="svc__list">${(s.includes || []).map((x) => `<li>${esc(t(x))}</li>`).join("")}</ul>
        <div class="svc__price">
          <div><span class="svc__from mono">${ui("services.from")}</span><span class="svc__amount">${money(s.price)}</span></div>
          <span class="svc__unit">${esc(t(s.unit))}</span>
        </div>
      </article>`).join("");

    // packages
    $("#packages").innerHTML = S.packages.map((p, i) => `
      <div class="pkg ${p.featured ? "pkg--featured" : ""} fade-up" style="--d:${i}">
        ${p.featured ? `<span class="pkg__flag mono">${ui("pricing.flag")}</span>` : ""}
        <div><h3 class="pkg__name">${esc(t(p.name))}</h3><p class="pkg__note">${esc(t(p.note))}</p></div>
        ${p.price == null
          ? `<div class="pkg__price pkg__price--custom">${ui("pricing.custom")}<small>${ui("pricing.customSub")}</small></div>`
          : `<div class="pkg__price">${money(p.price)}<small>${esc(t(p.per))}</small></div>`}
        <ul class="pkg__features">${p.features.map((f) => `<li>${esc(t(f))}</li>`).join("")}</ul>
        <a href="#contact" class="btn ${p.featured ? "btn--accent" : "btn--ghost"} btn--block" data-pkg="${esc(t(p.name))}">${esc(t(p.cta))} <i class="arrow">→</i></a>
      </div>`).join("");

    // price table
    $("#priceTable").innerHTML = "<tbody>" + S.services.map((s) => `
      <tr><td>${esc(t(s.name))}</td><td class="pt-unit">${esc(t(s.unit))}</td>
      <td class="pt-price"><small>${ui("services.from")}</small>${money(s.price)}</td></tr>`).join("") + "</tbody>";

    // process steps
    const n = S.process.length;
    $("#processSteps").innerHTML = S.process.map((p, i) => `
      <div class="pstep" data-step="${i}">
        <span class="pstep__n mono">${String(i + 1).padStart(2, "0")} / ${String(n).padStart(2, "0")}</span>
        <h3>${esc(t(p.title))}</h3><p>${esc(t(p.text))}</p>
      </div>`).join("");
    $("#hudTotal").textContent = String(n).padStart(2, "0");
    lastStep = -1;

    // why + quotes
    $("#whyGrid").innerHTML = S.reasons.map((r, i) => `
      <div class="reason fade-up" style="--d:${i}"><span class="reason__n mono">0${i + 1}</span>
      <h3>${esc(t(r.title))}</h3><p>${esc(t(r.text))}</p></div>`).join("");
    $("#quotes").innerHTML = S.testimonials.map((q, i) => `
      <figure class="quote fade-up" style="--d:${i}">
        <div class="quote__stars">★★★★★</div>
        <blockquote>“${esc(t(q.quote))}”</blockquote>
        <figcaption><span class="quote__avatar">${esc(q.name[0])}</span><div>${esc(q.name)}<span>${esc(t(q.role))}</span></div></figcaption>
      </figure>`).join("");

    // FAQ
    $("#faqList").innerHTML = S.faq.map((f, i) => `
      <div class="qa ${i === 0 ? "is-open" : ""}">
        <button type="button" aria-expanded="${i === 0}"><span>${esc(t(f.q))}</span><span class="qa__icon" aria-hidden="true"></span></button>
        <div class="qa__a"><div><p>${esc(t(f.a))}</p></div></div>
      </div>`).join("");

    // hours + socials
    $("#hours").innerHTML = S.contact.hours.map(([d, h]) => `<dt>${esc(t(d))}</dt><dd>${esc(t(h))}</dd>`).join("");
    $("#socials").innerHTML = [["Instagram", S.contact.instagram], ["Facebook", S.contact.facebook]]
      .filter(([, u]) => u).map(([n2, u]) => `<a href="${esc(u)}" target="_blank" rel="noopener">${n2} ↗</a>`).join("");

    // footer wordmark
    $("#footerWord").innerHTML = [...S.business.shortName].map((c) => `<span>${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
    fitFooter();

    // form service select
    const fs = $("#formService"), prevF = fs.value;
    fs.innerHTML = `<option value="">${ui("form.notSure")}</option>` +
      S.services.map((s) => `<option value="${s.id}">${esc(t(s.name))}</option>`).join("") +
      S.packages.map((p) => `<option value="pkg:${esc(t(p.name))}">${esc(t(p.name))}</option>`).join("");
    fs.value = prevF;

    renderEstimator();
    $$(".reveal").forEach(split);
    observeReveals();
    countedAll = false;
    jsonLd();
  }

  function fitFooter() {
    const fw = $("#footerWord"); if (!fw) return;
    fw.style.fontSize = "100px";
    const avail = fw.parentElement.clientWidth - parseFloat(getComputedStyle(fw.parentElement).paddingLeft) * 2;
    fw.style.fontSize = Math.floor(100 * avail / fw.scrollWidth * 0.98) + "px";
  }
  addEventListener("resize", () => fitFooter());
  document.fonts?.ready.then(() => fitFooter());

  /* ---------------- Estimator ---------------- */
  const E = S.estimator;
  const est = { service: S.services.find((s) => s.popular)?.id || S.services[0].id, qty: 1, zone: 0, ground: 0, extras: new Set() };
  function renderEstimator() {
    $("#estService").innerHTML = S.services.map((s) => `
      <label class="chip"><input type="radio" name="estsvc" value="${s.id}" ${s.id === est.service ? "checked" : ""}><span>${esc(t(s.name))}</span></label>`).join("");
    const opt = (arr, cur) => arr.map((o, i) => `<option value="${i}" ${i === cur ? "selected" : ""}>${esc(t(o.label))}${o.add ? ` (+${money(o.add)}${o.perSign ? " ×" : ""})` : ""}</option>`).join("");
    $("#estHeight").innerHTML = opt(E.zones, est.zone);
    $("#estSurface").innerHTML = opt(E.grounds, est.ground);
    $("#estExtras").innerHTML = E.extras.map((x, i) => `
      <label class="check"><input type="checkbox" value="${i}" ${est.extras.has(i) ? "checked" : ""}><span>${esc(t(x.label))}</span><small>+${money(x.add)}${x.perSign ? " ×" : ""}</small></label>`).join("");
    const r = $("#estSize"); r.min = 1; r.max = E.maxQty || 30; r.value = est.qty;
    $("#estSizeLabel").textContent = ui("est.q2count");
    const ticks = $$(".range-ticks span"), mx = +r.max;
    [1, Math.round(mx / 3), Math.round(mx * 2 / 3), mx].forEach((v, i) => ticks[i] && (ticks[i].textContent = v));
    calc(false);
  }

  let shownPrice = 0, priceAnim = 0;
  function calc(animate = true) {
    const svc = S.services.find((s) => s.id === est.service);
    const r = $("#estSize");
    const q = est.qty = +r.value;
    r.style.setProperty("--fill", ((q - r.min) / (r.max - r.min)) * 100 + "%");
    $("#estSizeOut").textContent = `${q} × ${money(svc.price)}`;
    const lines = [];
    let total = svc.price * q;
    lines.push([`${t(svc.name)} × ${q}`, total]);
    const z = E.zones[est.zone], g = E.grounds[est.ground];
    if (z.add) { total += z.add; lines.push([ui("est.height"), z.add]); }
    if (g.add) { const v = g.add * (g.perSign ? q : 1); total += v; lines.push([t(g.label), v]); }
    est.extras.forEach((i) => { const x = E.extras[i], v = x.add * (x.perSign ? q : 1); total += v; lines.push([t(x.label) + (x.perSign && q > 1 ? ` × ${q}` : ""), v]); });
    const vd = E.volumeDiscount;
    if (vd && q >= vd.minQty) { const d = Math.round(total * vd.percent / 100); total -= d; lines.push([`${ui("est.size")} (${vd.percent}%)`, -d]); }

    $("#estRange").textContent = q > 1 ? `≈ ${money(total / q)} ${ui("est.each")}` : t(svc.unit);
    $("#estLines").innerHTML = lines.map(([l, v]) => `<li><span>${esc(l)}</span><b>${v < 0 ? "−" + money(-v) : money(v)}</b></li>`).join("");
    est.total = total; est.svcName = t(svc.name);
    animatePrice(total, animate);
  }
  function animatePrice(target, animate) {
    cancelAnimationFrame(priceAnim);
    const el = $("#estPrice");
    if (!animate || reduced) { shownPrice = target; el.textContent = money(target); return; }
    const from = shownPrice, start = performance.now(), dur = 600;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 4);
      shownPrice = from + (target - from) * e; el.textContent = money(shownPrice);
      if (k < 1) priceAnim = requestAnimationFrame(step);
    };
    priceAnim = requestAnimationFrame(step);
  }
  function estimateSummary() {
    const extras = [...est.extras].map((i) => t(E.extras[i].label));
    return [
      `${ui("form.estimate")}: ${money(est.total)} + HST`,
      `${est.svcName} × ${est.qty}`,
      `${t(E.zones[est.zone].label)} · ${t(E.grounds[est.ground].label)}`,
      extras.length ? "+ " + extras.join(", ") : "",
    ].filter(Boolean).join("\n");
  }
  let attachEstimate = false;

  /* ---------------- Events (bound once) ---------------- */
  function bind() {
    // language
    $$("[data-lang]").forEach((b) => b.addEventListener("click", () => setLang(b.dataset.lang)));

    // estimator
    $("#estService").addEventListener("change", (e) => { est.service = e.target.value; calc(); });
    $("#estSize").addEventListener("input", () => calc());
    $("#estHeight").addEventListener("change", (e) => { est.zone = +e.target.value; calc(); });
    $("#estSurface").addEventListener("change", (e) => { est.ground = +e.target.value; calc(); });
    $("#estExtras").addEventListener("change", (e) => { const i = +e.target.value; e.target.checked ? est.extras.add(i) : est.extras.delete(i); calc(); });
    $("#estSend").addEventListener("click", () => {
      attachEstimate = true;
      $("#formService").value = est.service;
      showFormEstimate();
    });

    // packages → preselect in form
    $("#packages").addEventListener("click", (e) => {
      const a = e.target.closest("[data-pkg]"); if (a) $("#formService").value = "pkg:" + a.dataset.pkg;
    });

    // FAQ
    $("#faqList").addEventListener("click", (e) => {
      const btn = e.target.closest("button"); if (!btn) return;
      const qa = btn.parentElement, open = !qa.classList.contains("is-open");
      qa.classList.toggle("is-open", open); btn.setAttribute("aria-expanded", open);
    });

    // service card pointer glow
    $("#servicesGrid").addEventListener("pointermove", (e) => {
      const card = e.target.closest(".svc"); if (!card) return;
      const r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px"); card.style.setProperty("--my", e.clientY - r.top + "px");
    });

    // WeChat copy
    $("#wechatCopy").addEventListener("click", () => copy(S.contact.wechat).then(() => toast(ui("copied"))));

    // mobile menu
    const burger = $("#burger"), menu = $("#mobileMenu");
    const toggleMenu = (open) => {
      burger.setAttribute("aria-expanded", open); menu.classList.toggle("is-open", open);
      menu.setAttribute("aria-hidden", !open); document.body.style.overflow = open ? "hidden" : "";
    };
    burger.addEventListener("click", () => toggleMenu(burger.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => { if (e.target.closest("a")) toggleMenu(false); });

    // form
    $("#quoteForm").addEventListener("submit", submitForm);

    // cursor
    if (matchMedia("(hover: hover) and (pointer: fine)").matches && !reduced) {
      const c = $("#cursor"); let x = -100, y = -100, cx = x, cy = y;
      addEventListener("pointermove", (e) => { x = e.clientX; y = e.clientY; });
      document.addEventListener("pointerover", (e) => c.classList.toggle("is-hover", !!e.target.closest("a, button, label, select, input, summary")));
      (function loop() { cx += (x - cx) * .22; cy += (y - cy) * .22; c.style.transform = `translate(${cx}px, ${cy}px)`; requestAnimationFrame(loop); })();
    }

    // footer letters light up near the pointer
    const fw = $("#footerWord");
    fw.addEventListener("pointermove", (e) => {
      $$("span", fw).forEach((s) => { const r = s.getBoundingClientRect(); s.classList.toggle("lit", Math.abs(e.clientX - (r.left + r.width / 2)) < r.width * 0.9); });
    });
    fw.addEventListener("pointerleave", () => lightFooter());
  }

  function setLang(l) {
    if (l === lang) return;
    lang = l; store.set("lang", l);
    document.body.classList.add("lang-swap", "lang-fade");
    setTimeout(() => {
      render();
      if (attachEstimate) showFormEstimate();
      $$(".reveal, .fade-up").forEach((el) => { const r = el.getBoundingClientRect(); if (r.top < innerHeight) el.classList.add("is-in"); });
      document.body.classList.remove("lang-fade");
      window.dispatchEvent(new CustomEvent("langchange", { detail: lang }));
    }, 220);
  }

  function showFormEstimate() {
    const v = $("#formEstimateView"); v.hidden = false; v.textContent = estimateSummary();
  }

  /* ---------------- Form ---------------- */
  async function submitForm(e) {
    e.preventDefault();
    const f = e.target, status = $("#formStatus");
    const data = Object.fromEntries(new FormData(f));
    status.className = "form-status mono";
    $$(".field", f).forEach((x) => x.classList.remove("is-invalid"));
    if (!data.name.trim() || !data.phone.trim()) {
      if (!data.name.trim()) f.name.closest(".field").classList.add("is-invalid");
      if (!data.phone.trim()) f.phone.closest(".field").classList.add("is-invalid");
      status.textContent = ui("form.invalid"); status.classList.add("err"); return;
    }
    const svcName = (() => {
      if (!data.service) return ui("form.notSure");
      if (data.service.startsWith("pkg:")) return data.service.slice(4);
      return t(S.services.find((s) => s.id === data.service)?.name);
    })();
    const body = [
      ui("msg.hello"),
      `${ui("form.name")}: ${data.name}`,
      `${ui("form.phone")}: ${data.phone}`,
      data.email && `${ui("contact.email")}: ${data.email}`,
      `${ui("form.service")}: ${svcName}`,
      data.location && `${ui("form.location")}: ${data.location}`,
      data.message && `\n${data.message}`,
      attachEstimate && `\n${estimateSummary()}`,
    ].filter(Boolean).join("\n");

    const c = S.contact;
    if (c.formEndpoint) {
      status.textContent = ui("form.sending");
      try {
        const res = await fetch(c.formEndpoint, { method: "POST", headers: { Accept: "application/json", "Content-Type": "application/json" },
          body: JSON.stringify({
            _subject: `${ui("msg.hello")} – ${data.name}`, _template: "table", _captcha: "false",
            Name: data.name, Phone: data.phone, Email: data.email || "-", Service: svcName,
            "Listing address": data.location || "-", Message: data.message || "-",
            Estimate: attachEstimate ? estimateSummary() : "-", Language: lang === "zh" ? "中文" : "English",
            ...(data.email ? { _replyto: data.email } : {}),
          }) });
        const json = await res.json().catch(() => ({}));
        if (!res.ok || String(json.success) === "false") throw new Error(json.message || res.status);
        status.textContent = ui("form.ok"); status.classList.add("ok"); f.reset(); $("#formEstimateView").hidden = true; attachEstimate = false;
      } catch { status.textContent = ui("form.err"); status.classList.add("err"); }
      return;
    }
    if (c.email) {
      status.textContent = ui("form.mail");
      location.href = `mailto:${c.email}?subject=${encodeURIComponent(ui("msg.hello") + " – " + data.name)}&body=${encodeURIComponent(body)}`;
      return;
    }
    await copy(body);
    status.textContent = ui("form.sms"); status.classList.add("ok");
    location.href = `sms:${c.phoneLink}${/iPhone|iPad|Mac/.test(navigator.userAgent) ? "&" : "?"}body=${encodeURIComponent(body)}`;
  }

  function copy(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    fallbackCopy(text); return Promise.resolve();
  }
  function fallbackCopy(text) {
    const ta = document.createElement("textarea"); ta.value = text; ta.style.cssText = "position:fixed;opacity:0";
    document.body.append(ta); ta.select(); try { document.execCommand("copy"); } catch {} ta.remove();
  }
  let toastTimer;
  function toast(msg) {
    const el = $("#toast"); el.textContent = msg; el.classList.add("is-shown");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => el.classList.remove("is-shown"), 3600);
  }

  /* ---------------- Reveal + count-up ---------------- */
  let io;
  function observeReveals() {
    io?.disconnect();
    io = new IntersectionObserver((entries) => entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add("is-in"); io.unobserve(en.target);
      if (en.target.classList.contains("stat")) countUp(en.target);
      if (en.target.id === "footerWord") lightFooter(true);
    }), { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal, .fade-up, #footerWord").forEach((el) => io.observe(el));
  }
  let countedAll = false;
  function countUp(card) {
    const el = $("[data-count]", card), to = +el.dataset.count, dec = +el.dataset.dec;
    if (reduced) { el.textContent = to.toFixed(dec); return; }
    const start = performance.now(), dur = 1800;
    const step = (now) => {
      const k = Math.min(1, (now - start) / dur), e = 1 - Math.pow(1 - k, 4);
      el.textContent = (to * e).toLocaleString("en-US", { minimumFractionDigits: dec, maximumFractionDigits: dec });
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }
  function lightFooter(sequence) {
    const spans = $$("#footerWord span");
    spans.forEach((s) => s.classList.remove("lit"));
    if (!sequence) return;
    spans.forEach((s, i) => {
      setTimeout(() => s.classList.add("lit"), 120 * i + (Math.random() * 80));
      setTimeout(() => s.classList.remove("lit"), 120 * i + 90);
      setTimeout(() => s.classList.add("lit"), 120 * i + 200);
    });
    setTimeout(() => spans.forEach((s) => s.classList.remove("lit")), 120 * spans.length + 1600);
  }

  /* ---------------- Scroll: nav, HUD, shared progress for 3D ---------------- */
  const SCROLL = (window.SCROLL = { hero: 0, stats: 0, process: 0, processVisible: false, anyVisible: true });
  let lastY = 0, lastStep = -1, scrollFrame = null;
  function onScroll() {
    const y = scrollY, vh = innerHeight;
    const nav = $("#nav");
    nav.classList.toggle("is-scrolled", y > 40);
    nav.classList.toggle("is-hidden", y > vh && y > lastY + 2 && !$("#mobileMenu").classList.contains("is-open"));
    if (y < lastY - 2) nav.classList.remove("is-hidden");
    lastY = y;
    $("#actionBar").classList.toggle("is-shown", y > vh * 0.8);

    const hero = $("#hero").getBoundingClientRect();
    const stats = $("#stats").getBoundingClientRect();
    const proc = $("#process").getBoundingClientRect();
    SCROLL.hero = clamp(-hero.top / hero.height);
    SCROLL.stats = clamp((vh - stats.top) / (stats.height + vh));
    const pp = clamp(-proc.top / (proc.height - vh));
    SCROLL.process = pp;
    SCROLL.processVisible = proc.top < vh && proc.bottom > 0;
    SCROLL.anyVisible = stats.bottom > 0 || SCROLL.processVisible;

    // process HUD
    const n = S.process.length;
    const step = Math.min(n - 1, Math.floor(pp * n * 0.999));
    $("#hudBar").style.transform = `scaleX(${pp})`;
    if (step !== lastStep) {
      $$(".pstep").forEach((el, i) => { el.classList.toggle("is-active", i === step); el.classList.toggle("is-past", i < step); });
      $("#hudStep").textContent = String(step + 1).padStart(2, "0");
      lastStep = step;
    }
    // readouts follow the same story the 3D tells
    const lean = 4.5 * (1 - clamp((pp - 0.5) / 0.1));
    $("#roLevel").textContent = lean.toFixed(1) + "°";
    $("#roAnchors").textContent = `${Math.round(24 * clamp((pp - 0.42) / 0.12))}/24 in`;
    const on = pp > 0.86;
    const rc = $("#roCircuit"); rc.textContent = ui(on ? "ro.on" : "ro.off"); rc.classList.toggle("on", on);

    // active nav link
    let current = "";
    ["services", "pricing", "process", "faq", "contact"].forEach((id) => { const r = document.getElementById(id).getBoundingClientRect(); if (r.top < vh * 0.4) current = id; });
    $$(".nav__links a").forEach((a) => a.classList.toggle("is-active", a.getAttribute("href") === "#" + current));
  }
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const scheduleScroll = () => {
    if (scrollFrame !== null) return;
    scrollFrame = requestAnimationFrame(() => {
      scrollFrame = null;
      onScroll();
    });
  };

  /* ---------------- Structured data for Google ---------------- */
  function jsonLd() {
    let el = $("#ld"); if (!el) { el = document.createElement("script"); el.type = "application/ld+json"; el.id = "ld"; document.head.append(el); }
    el.textContent = JSON.stringify({
      "@context": "https://schema.org", "@type": "HomeAndConstructionBusiness",
      name: t(S.business.name), description: t(S.seo.description), telephone: S.contact.phoneLink,
      email: S.contact.email || undefined, areaServed: t(S.contact.serviceArea), url: location.href.split("#")[0],
      foundingDate: String(S.business.founded),
      makesOffer: S.services.map((s) => ({ "@type": "Offer", itemOffered: { "@type": "Service", name: t(s.name) },
        priceSpecification: { "@type": "PriceSpecification", minPrice: s.price, priceCurrency: "CAD" } })),
    });
  }

  /* ---------------- Boot ---------------- */
  render();
  bind();
  addEventListener("scroll", scheduleScroll, { passive: true });
  addEventListener("resize", scheduleScroll);
  onScroll();

  // loader: wait for fonts + 3D (or give up after 3.5s)
  let pct = 0; const pctEl = $("#loaderPct");
  const ticker = setInterval(() => { pct = Math.min(96, pct + Math.random() * 9); pctEl.textContent = Math.round(pct) + "%"; }, 90);
  const ready = Promise.all([
    document.fonts?.ready ?? Promise.resolve(),
    new Promise((r) => { window.addEventListener("scene-ready", r, { once: true }); setTimeout(r, 3500); }),
  ]);
  ready.then(() => {
    clearInterval(ticker); pctEl.textContent = "100%";
    setTimeout(() => {
      $("#loader").classList.add("is-done");
      document.body.classList.remove("is-loading");
      document.body.classList.add("is-ready");
    }, 250);
  });

  window.SITE_API = { t, ui, get lang() { return lang; } };
})();
