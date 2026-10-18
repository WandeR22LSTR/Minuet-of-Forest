// Tiny static server for dist/ under the configured base path. Used by the PDF and check scripts.
import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import { join, extname, normalize } from "node:path";
import { BASE } from "../site.config.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".css": "text/css", ".js": "text/javascript", ".svg": "image/svg+xml", ".xml": "application/xml", ".pdf": "application/pdf", ".png": "image/png", ".txt": "text/plain" };

export async function serve(root = "dist") {
  const prefix = BASE.replace(/\/$/, "");
  const server = createServer(async (req, res) => {
    const path = decodeURIComponent(new URL(req.url, "http://x").pathname);
    if (!path.startsWith(prefix + "/")) return send404();
    let file = join(root, normalize(path.slice(prefix.length)));
    try { if ((await stat(file)).isDirectory()) file = join(file, "index.html"); } catch {}
    try {
      const body = await readFile(file);
      res.writeHead(200, { "content-type": TYPES[extname(file)] ?? "application/octet-stream" }).end(body);
    } catch { send404(); }
    async function send404() {
      res.writeHead(404, { "content-type": TYPES[".html"] }).end(await readFile(join(root, "404.html")).catch(() => "404"));
    }
  });
  await new Promise((r) => server.listen(0, "127.0.0.1", r));
  return { origin: `http://127.0.0.1:${server.address().port}`, base: prefix, close: () => server.close() };
}
