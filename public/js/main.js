// ===== Theme toggle (remembered) =====
(function () {
  const btn = document.querySelector(".theme-toggle");
  if (!btn) return;
  const root = document.documentElement;
  const sync = () => btn.setAttribute("aria-label",
    root.dataset.theme === "dark" ? "Switch to light mode" : "Switch to dark mode");
  sync();
  btn.addEventListener("click", () => {
    const next = root.dataset.theme === "dark" ? "light" : "dark";
    root.dataset.theme = next;
    try { localStorage.setItem("rgg-theme", next); } catch (e) {}
    sync();
  });
})();

// ===== Logo die: shows a random face, rolls on hover-click =====
(function () {
  const die = document.querySelector(".brand-die");
  if (!die) return;
  const faces = { 1: [4], 2: [0, 8], 3: [0, 4, 8], 4: [0, 2, 6, 8], 5: [0, 2, 4, 6, 8], 6: [0, 2, 3, 5, 6, 8] };
  die.innerHTML = "<span></span>".repeat(9);
  const pips = die.querySelectorAll("span");
  const show = (n) => pips.forEach((p, i) => p.classList.toggle("on", faces[n].includes(i)));
  show(5);
  die.addEventListener("mouseenter", () => {
    die.classList.remove("rolling"); void die.offsetWidth; die.classList.add("rolling");
    let t = 0;
    const spin = setInterval(() => { show(1 + Math.floor(Math.random() * 6)); if (++t > 5) clearInterval(spin); }, 90);
  });
})();

// ===== Card tilt =====
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  document.querySelectorAll("[data-tilt]").forEach((card) => {
    card.addEventListener("pointermove", (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `perspective(900px) rotateX(${-y * 5}deg) rotateY(${x * 6}deg) translateY(-4px)`;
    });
    card.addEventListener("pointerleave", () => { card.style.transform = ""; });
  });
})();

// ===== Reveal on scroll =====
(function () {
  const els = document.querySelectorAll(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => entries.forEach((en) => {
    if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
  }), { threshold: 0.12 });
  els.forEach((e) => io.observe(e));
})();

// ===== Footer year =====
document.querySelectorAll("[data-year]").forEach((el) => (el.textContent = new Date().getFullYear()));
