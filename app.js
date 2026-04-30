const PHONE_E164 = "";

const prefersReducedMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

document.addEventListener(
  "DOMContentLoaded",
  () => {
    document.body.setAttribute("data-ready", "true");
  },
  { once: true }
);

function createToast() {
  const existing = document.querySelector("[data-toast]");
  if (existing) return existing;

  const el = document.createElement("div");
  el.setAttribute("data-toast", "");
  el.setAttribute("role", "status");
  el.setAttribute("aria-live", "polite");
  el.hidden = true;
  document.body.appendChild(el);
  return el;
}

function showToast(message) {
  const toast = createToast();
  toast.textContent = message;
  toast.hidden = false;

  window.clearTimeout(showToast._t);
  showToast._t = window.setTimeout(() => {
    toast.hidden = true;
  }, 3200);
}

function buildTelHref() {
  if (!PHONE_E164) return "#";
  return `tel:${PHONE_E164}`;
}

function buildSmsHref() {
  if (!PHONE_E164) return "#";
  return `sms:${PHONE_E164}`;
}

function showPhoneMissing() {
  showToast("Número pendiente. Pásame el teléfono en formato +1XXXXXXXXXX para activar Llamar/Texto.");
}

function handleAction(action) {
  if (!PHONE_E164) {
    showPhoneMissing();
    return;
  }

  if (action === "call") {
    window.location.href = buildTelHref();
    return;
  }

  if (action === "text") {
    window.location.href = buildSmsHref();
  }
}

function initCtas() {
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const btn = target.closest("[data-action]");
    if (!btn) return;

    const action = btn.getAttribute("data-action");
    if (!action) return;

    e.preventDefault();
    handleAction(action);
  });
}

function initFaq() {
  const root = document.querySelector("[data-faq]");
  if (!root) return;

  root.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const q = target.closest(".faq-q");
    if (!q) return;

    const item = q.closest(".faq-item");
    const a = item ? item.querySelector(".faq-a") : null;
    if (!a) return;

    const expanded = q.getAttribute("aria-expanded") === "true";
    q.setAttribute("aria-expanded", String(!expanded));
    a.hidden = expanded;
  });
}

function initYear() {
  const el = document.querySelector("[data-year]");
  if (el) el.textContent = String(new Date().getFullYear());
}

function initSmoothScroll() {
  document.addEventListener("click", (e) => {
    const target = e.target instanceof Element ? e.target : null;
    if (!target) return;

    const a = target.closest("a[href^='#']");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href || href === "#") return;

    const id = href.slice(1);
    const el = document.getElementById(id);
    if (!el) return;

    e.preventDefault();

    if (prefersReducedMotion) {
      el.scrollIntoView();
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });
}

function initRevealOnScroll() {
  if (prefersReducedMotion) return;
  if (typeof IntersectionObserver === "undefined") return;

  const candidates = document.querySelectorAll("section, .plan, .feature, .hero-card, .cta-panel");
  candidates.forEach((el) => el.setAttribute("data-reveal", "pending"));

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.setAttribute("data-reveal", "in");
        io.unobserve(entry.target);
      }
    },
    { threshold: 0.12 }
  );

  candidates.forEach((el) => io.observe(el));
}

function initBackgroundParallax() {
  if (prefersReducedMotion) return;

  let raf = 0;
  const onScroll = () => {
    if (raf) return;
    raf = window.requestAnimationFrame(() => {
      raf = 0;
      const y = window.scrollY || 0;
      const x1 = Math.min(24, y * 0.04);
      const x2 = Math.min(18, y * 0.03);
      document.body.style.backgroundPosition = `0px ${-x1}px, 0px ${-x2}px, 0px ${x2}px, 0px ${x1}px, 0px 0px`;
    });
  };

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
}

function initQuickRecommendation() {
  const root = document.querySelector("[data-reco]");
  if (!root) return;

  const sliders = {
    streaming: root.querySelector("[data-slider='streaming']"),
    work: root.querySelector("[data-slider='work']"),
    devices: root.querySelector("[data-slider='devices']"),
  };

  const out = {
    streaming: root.querySelector("[data-streaming-val]"),
    work: root.querySelector("[data-work-val]"),
    devices: root.querySelector("[data-devices-val]"),
    text: root.querySelector("[data-reco-text]"),
    sub: root.querySelector("[data-reco-sub]"),
  };

  if (!sliders.streaming || !sliders.work || !sliders.devices || !out.text) return;

  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  function calcPeopleScore(devices) {
    return clamp(Math.round(devices / 2) + 1, 1, 8);
  }

  function selectTier(score) {
    if (score >= 22) return { plan: "Fiber 1000Mbps", mbps: 1000 };
    if (score >= 14) return { plan: "Fiber 500Mbps", mbps: 500 };
    return { plan: "Fiber 300Mbps", mbps: 300 };
  }

  function update() {
    const streaming = Number(sliders.streaming.value);
    const work = Number(sliders.work.value);
    const devices = Number(sliders.devices.value);

    if (out.streaming) out.streaming.textContent = String(streaming);
    if (out.work) out.work.textContent = String(work);
    if (out.devices) out.devices.textContent = String(devices);

    const score = streaming * 1.2 + work * 1.1 + devices * 1.0;
    const tier = selectTier(score);
    const people = calcPeopleScore(devices);

    out.text.textContent = `${people}+ people? ${tier.plan} is ideal`;
    if (out.sub) {
      out.sub.textContent = "Basado en uso simultáneo estimado. Si hay buena cobertura de fibra, prioriza estabilidad.";
    }
  }

  root.addEventListener("input", (e) => {
    const target = e.target instanceof HTMLInputElement ? e.target : null;
    if (!target) return;
    if (target.type !== "range") return;
    update();
  });

  update();
}

initCtas();
initFaq();
initYear();
initSmoothScroll();
initRevealOnScroll();
initBackgroundParallax();
initQuickRecommendation();
