// Tiny playable demos for game pages. Each reads CSS vars so it matches light/dark.
function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }

function setupCanvas(canvas) {
  const W = 640, H = 320, dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = W * dpr; canvas.height = H * dpr;
  const ctx = canvas.getContext("2d"); ctx.scale(dpr, dpr);
  const toLocal = (e) => {
    const r = canvas.getBoundingClientRect();
    return { x: (e.clientX - r.left) * (W / r.width), y: (e.clientY - r.top) * (H / r.height) };
  };
  return { ctx, W, H, toLocal };
}

// --- Starfall Drift: move the ship, catch stars, dodge rocks ---
function starfall(canvas, scoreEl, bestEl) {
  const { ctx, W, H, toLocal } = setupCanvas(canvas);
  let ship = { x: W / 2, y: H - 34 }, items = [], score = 0, running = false, t = 0, lives = 3;
  let best = +localStorage.getItem("rgg-starfall-best") || 0;
  bestEl.textContent = best;
  canvas.addEventListener("pointermove", (e) => { ship.x = toLocal(e).x; });
  canvas.addEventListener("pointerdown", (e) => { ship.x = toLocal(e).x; if (!running) start(); });
  function start() { items = []; score = 0; lives = 3; t = 0; running = true; scoreEl.textContent = 0; loop(); }
  function star(x, y, r, c) {
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const a = (Math.PI / 5) * i - Math.PI / 2, rr = i % 2 ? r * .45 : r;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.fillStyle = c; ctx.fill();
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = cssVar("--muted");
    for (let i = 0; i < 40; i++) { ctx.globalAlpha = .25; ctx.fillRect((i * 97 + t * .3) % W, (i * 53 + t * (0.5 + i % 3)) % H, 2, 2); }
    ctx.globalAlpha = 1;
    items.forEach((it) => {
      if (it.good) star(it.x, it.y, 12, cssVar("--accent-3"));
      else { ctx.beginPath(); ctx.arc(it.x, it.y, 13, 0, 7); ctx.fillStyle = cssVar("--muted"); ctx.fill(); }
    });
    // ship
    ctx.save(); ctx.translate(ship.x, ship.y);
    ctx.beginPath(); ctx.moveTo(0, -18); ctx.lineTo(18, 14); ctx.lineTo(0, 7); ctx.lineTo(-18, 14); ctx.closePath();
    ctx.fillStyle = cssVar("--accent"); ctx.fill();
    ctx.fillStyle = cssVar("--accent-2"); ctx.fillRect(-4, 10, 8, 6 + Math.random() * 6);
    ctx.restore();
    ctx.fillStyle = cssVar("--text"); ctx.font = "600 15px Inter, sans-serif";
    ctx.fillText("♥".repeat(lives), 14, 24);
    if (!running) {
      ctx.textAlign = "center"; ctx.font = "700 24px 'Space Grotesk', sans-serif";
      ctx.fillText(score ? `Game over! ${score} stars` : "Tap to play", W / 2, H / 2 - 6);
      ctx.font = "500 14px Inter, sans-serif"; ctx.fillStyle = cssVar("--muted");
      ctx.fillText("Move to catch ★ — dodge the rocks", W / 2, H / 2 + 20); ctx.textAlign = "left";
    }
  }
  function loop() {
    if (!running) return draw();
    t++;
    if (t % Math.max(14, 34 - Math.floor(score / 4)) === 0)
      items.push({ x: 20 + Math.random() * (W - 40), y: -15, v: 2 + Math.random() * 1.5 + score * .04, good: Math.random() > .3 });
    items.forEach((it) => (it.y += it.v));
    items = items.filter((it) => {
      if (Math.hypot(it.x - ship.x, it.y - ship.y) < 24) {
        if (it.good) { score++; scoreEl.textContent = score; } else lives--;
        return false;
      }
      return it.y < H + 20;
    });
    if (lives <= 0) {
      running = false;
      if (score > best) { best = score; localStorage.setItem("rgg-starfall-best", best); bestEl.textContent = best; }
    }
    draw(); requestAnimationFrame(loop);
  }
  draw();
  new MutationObserver(() => !running && draw()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

// --- Blobble Pop: pop the blobs before they float away ---
function blobble(canvas, scoreEl, bestEl) {
  const { ctx, W, H, toLocal } = setupCanvas(canvas);
  let blobs = [], pops = [], score = 0, missed = 0, running = false, t = 0;
  let best = +localStorage.getItem("rgg-blobble-best") || 0;
  bestEl.textContent = best;
  const colors = ["--accent", "--accent-2", "--accent-3"];
  canvas.addEventListener("pointerdown", (e) => {
    if (!running) { blobs = []; score = 0; missed = 0; t = 0; running = true; scoreEl.textContent = 0; return loop(); }
    const p = toLocal(e);
    for (let i = blobs.length - 1; i >= 0; i--) {
      const b = blobs[i];
      if (Math.hypot(p.x - b.x, p.y - b.y) < b.r + 6) {
        score++; scoreEl.textContent = score;
        for (let k = 0; k < 8; k++) pops.push({ x: b.x, y: b.y, a: k * .785, d: 0, c: b.c });
        blobs.splice(i, 1); break;
      }
    }
  });
  function draw() {
    ctx.clearRect(0, 0, W, H);
    blobs.forEach((b) => {
      const wob = Math.sin(t * .1 + b.ph) * 2;
      ctx.beginPath(); ctx.ellipse(b.x, b.y, b.r + wob, b.r - wob, 0, 0, 7);
      ctx.fillStyle = cssVar(b.c); ctx.fill();
      ctx.fillStyle = "#1d1b22";
      ctx.beginPath(); ctx.arc(b.x - b.r * .3, b.y - 3, 3, 0, 7); ctx.arc(b.x + b.r * .3, b.y - 3, 3, 0, 7); ctx.fill();
      ctx.beginPath(); ctx.arc(b.x, b.y + 4, 5, 0, Math.PI); ctx.strokeStyle = "#1d1b22"; ctx.lineWidth = 2; ctx.stroke();
    });
    pops.forEach((p) => {
      ctx.globalAlpha = 1 - p.d / 30; ctx.fillStyle = cssVar(p.c);
      ctx.beginPath(); ctx.arc(p.x + Math.cos(p.a) * p.d, p.y + Math.sin(p.a) * p.d, 4, 0, 7); ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.fillStyle = cssVar("--text"); ctx.font = "600 15px Inter, sans-serif";
    ctx.fillText(`Escaped: ${missed}/5`, 14, 24);
    if (!running) {
      ctx.textAlign = "center"; ctx.font = "700 24px 'Space Grotesk', sans-serif";
      ctx.fillText(score ? `Nice! ${score} pops` : "Tap to play", W / 2, H / 2 - 6);
      ctx.font = "500 14px Inter, sans-serif"; ctx.fillStyle = cssVar("--muted");
      ctx.fillText("Pop the blobbles before 5 float away", W / 2, H / 2 + 20); ctx.textAlign = "left";
    }
  }
  function loop() {
    if (!running) return draw();
    t++;
    if (t % Math.max(18, 45 - score) === 0)
      blobs.push({ x: 30 + Math.random() * (W - 60), y: H + 25, r: 16 + Math.random() * 12, v: 1 + Math.random() + score * .03, ph: Math.random() * 6, c: colors[Math.floor(Math.random() * 3)] });
    blobs.forEach((b) => { b.y -= b.v; b.x += Math.sin(t * .05 + b.ph) * .6; });
    blobs = blobs.filter((b) => { if (b.y < -30) { missed++; return false; } return true; });
    pops.forEach((p) => p.d += 1.5); pops = pops.filter((p) => p.d < 30);
    if (missed >= 5) {
      running = false;
      if (score > best) { best = score; localStorage.setItem("rgg-blobble-best", best); bestEl.textContent = best; }
    }
    draw(); requestAnimationFrame(loop);
  }
  draw();
  new MutationObserver(() => !running && draw()).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
}

document.querySelectorAll("[data-minigame]").forEach((wrap) => {
  const fn = { starfall, blobble }[wrap.dataset.minigame];
  if (fn) fn(wrap.querySelector("canvas"), wrap.querySelector("[data-score]"), wrap.querySelector("[data-best]"));
});
