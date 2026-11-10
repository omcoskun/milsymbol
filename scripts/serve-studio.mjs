import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "dist", "studio");
const port = Number(process.env.PORT || 4173);
const mime = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".json": "application/json; charset=utf-8", ".svg": "image/svg+xml" };

createServer((request, response) => {
  const pathname = decodeURIComponent(new URL(request.url, `http://${request.headers.host}`).pathname);
  const candidate = path.resolve(root, `.${pathname === "/" ? "/index.html" : pathname}`);
  if (!candidate.startsWith(root) || !fs.existsSync(candidate) || fs.statSync(candidate).isDirectory()) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
    return;
  }
  response.writeHead(200, { "Content-Type": mime[path.extname(candidate)] || "application/octet-stream", "Cache-Control": "no-store" });
  fs.createReadStream(candidate).pipe(response);
}).listen(port, "127.0.0.1", () => console.log(`Military Symbol Editor: http://127.0.0.1:${port}`));
