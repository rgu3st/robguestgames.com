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

// ===== Screenshot lightbox =====
(function () {
  const shots = [...document.querySelectorAll("[data-full]")];
  if (!shots.length) return;
  const lb = document.createElement("div");
  lb.className = "lightbox";
  lb.setAttribute("role", "dialog");
  lb.setAttribute("aria-label", "Screenshot viewer");
  lb.innerHTML = '<img alt=""><button class="lb-close" aria-label="Close">✕</button><button class="lb-prev" aria-label="Previous">‹</button><button class="lb-next" aria-label="Next">›</button>';
  document.body.appendChild(lb);
  const img = lb.querySelector("img");
  let i = 0;
  const show = (n) => { i = (n + shots.length) % shots.length; img.src = shots[i].dataset.full; img.alt = shots[i].querySelector("img").alt; };
  const close = () => lb.classList.remove("open");
  shots.forEach((s, n) => s.addEventListener("click", () => { show(n); lb.classList.add("open"); lb.querySelector(".lb-close").focus(); }));
  lb.querySelector(".lb-close").onclick = close;
  lb.querySelector(".lb-prev").onclick = (e) => { e.stopPropagation(); show(i - 1); };
  lb.querySelector(".lb-next").onclick = (e) => { e.stopPropagation(); show(i + 1); };
  lb.addEventListener("click", (e) => { if (e.target === lb) close(); });
  document.addEventListener("keydown", (e) => {
    if (!lb.classList.contains("open")) return;
    if (e.key === "Escape") close();
    if (e.key === "ArrowLeft") show(i - 1);
    if (e.key === "ArrowRight") show(i + 1);
  });
})();
