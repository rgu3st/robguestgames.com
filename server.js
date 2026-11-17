// Zero-dependency static file server for robguestgames.com
const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = path.join(__dirname, "public");

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8",
};

function send(res, status, file) {
  fs.readFile(file, (err, data) => {
    if (err) {
      res.writeHead(500, { "Content-Type": "text/plain" });
      return res.end("Server error");
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(status, {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600",
    });
    res.end(data);
  });
}

http
  .createServer((req, res) => {
    let urlPath;
    try {
      urlPath = decodeURIComponent(new URL(req.url, "http://x").pathname);
    } catch {
      urlPath = "/";
    }
    let file = path.normalize(path.join(ROOT, urlPath));
    if (!file.startsWith(ROOT)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }
    // Try: exact file, then dir/index.html, then file.html (pretty URLs)
    const bare = file.replace(/[\\/]+$/, "");
    const candidates = [file, path.join(file, "index.html"), bare + ".html"];
    const found = candidates.find((f) => {
      try { return fs.statSync(f).isFile(); } catch { return false; }
    });
    if (found) return send(res, 200, found);
    send(res, 404, path.join(ROOT, "404.html"));
  })
  .listen(PORT, () => console.log(`RobGuestGames running on http://localhost:${PORT}`));
