/**
 * A static file server for a folder, so a site with no dev server (plain HTML,
 * a build output) can be walked like a running one. Localhost only, a free
 * port, closed when the run ends.
 */
import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import { extname, join, normalize, resolve } from "node:path";

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".mjs": "text/javascript; charset=utf-8",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".avif": "image/avif",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".txt": "text/plain; charset=utf-8",
  ".xml": "application/xml",
};

export function serve(dir) {
  const root = resolve(dir);
  const server = createServer((req, res) => {
    const url = new URL(req.url, "http://localhost");
    let path = normalize(join(root, decodeURIComponent(url.pathname)));
    if (!path.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    if (existsSync(path) && statSync(path).isDirectory()) {
      // As every static host does: a folder without its slash redirects, so relative links resolve inside it.
      if (!url.pathname.endsWith("/")) {
        res.writeHead(301, { location: url.pathname + "/" + url.search }).end();
        return;
      }
      path = join(path, "index.html");
    }
    else if (!existsSync(path) && existsSync(path + ".html")) path += ".html";
    if (!existsSync(path)) {
      res.writeHead(404, { "content-type": "text/plain" }).end("Not found");
      return;
    }
    res.writeHead(200, { "content-type": TYPES[extname(path).toLowerCase()] ?? "application/octet-stream" });
    createReadStream(path).pipe(res);
  });
  return new Promise((ok) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      ok({ url: `http://127.0.0.1:${port}`, close: () => new Promise((done) => server.close(done)) });
    });
  });
}
