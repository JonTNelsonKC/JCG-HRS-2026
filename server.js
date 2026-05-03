import http from "node:http";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  buildDashboard,
  getNewsDashboard,
  getScheduleDashboard,
  getWreckhouseDashboard
} from "./functions/_lib/nascar-data.js";
import {
  listFanRankings,
  removeFanRanking,
  upsertFanRanking
} from "./functions/_lib/f1-rankings-store.js";

const PORT = Number(process.env.PORT || 5173);
const HOST = process.env.HOST || "127.0.0.1";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PUBLIC_DIR = path.join(ROOT, "public");
const LOCAL_F1_RANKINGS_ENV = {
  ...process.env,
  F1_ALLOW_MEMORY_FALLBACK: process.env.F1_ALLOW_MEMORY_FALLBACK || "1"
};

const JSON_HEADERS = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, JSON_HEADERS);
  response.end(JSON.stringify(payload));
}

function readJsonBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => {
      if (!chunks.length) {
        resolve({});
        return;
      }

      try {
        resolve(JSON.parse(Buffer.concat(chunks).toString("utf8")));
      } catch {
        resolve({});
      }
    });
    request.on("error", () => resolve({}));
  });
}

function contentType(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  return {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".svg": "image/svg+xml",
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".webp": "image/webp",
    ".ico": "image/x-icon"
  }[ext] || "application/octet-stream";
}

async function serveStatic(requestUrl, response) {
  const url = new URL(requestUrl, `http://${HOST}:${PORT}`);
  let pathname = decodeURIComponent(url.pathname);
  if (pathname === "/") pathname = "/index.html";

  const filePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!filePath.startsWith(`${PUBLIC_DIR}${path.sep}`) && filePath !== PUBLIC_DIR) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const data = await readFile(filePath);
    response.writeHead(200, {
      "content-type": contentType(filePath),
      "cache-control": "no-cache"
    });
    response.end(data);
  } catch {
    response.writeHead(404);
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    const url = new URL(request.url, `http://${HOST}:${PORT}`);

    if (url.pathname === "/api/health") {
      sendJson(response, 200, { ok: true, generatedAt: new Date().toISOString() });
      return;
    }

    if (url.pathname === "/api/dashboard") {
      sendJson(response, 200, await buildDashboard());
      return;
    }

    if (url.pathname === "/api/wreckhouse") {
      sendJson(response, 200, await getWreckhouseDashboard());
      return;
    }

    if (url.pathname === "/api/schedule") {
      sendJson(response, 200, await getScheduleDashboard());
      return;
    }

    if (url.pathname === "/api/news") {
      sendJson(response, 200, await getNewsDashboard());
      return;
    }

    if (url.pathname === "/api/f1-rankings") {
      if (request.method === "GET") {
        sendJson(response, 200, {
          ok: true,
          entries: await listFanRankings(LOCAL_F1_RANKINGS_ENV)
        });
        return;
      }

      if (request.method === "POST") {
        const body = await readJsonBody(request);
        sendJson(response, 200, {
          ok: true,
          entries: await upsertFanRanking(LOCAL_F1_RANKINGS_ENV, body)
        });
        return;
      }

      if (request.method === "DELETE") {
        const body = await readJsonBody(request);
        sendJson(response, 200, {
          ok: true,
          entries: await removeFanRanking(LOCAL_F1_RANKINGS_ENV, body)
        });
        return;
      }

      sendJson(response, 405, {
        ok: false,
        error: "Method not allowed"
      });
      return;
    }

    await serveStatic(request.url, response);
  } catch (error) {
    sendJson(response, 500, {
      ok: false,
      error: error.message
    });
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Stenhouse Superfans dashboard running at http://${HOST}:${PORT}`);
  console.log("Press Ctrl+C to stop.");
});
