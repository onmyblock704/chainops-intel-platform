
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";
import { defineConfig, type Plugin, type ViteDevServer } from "vite";

// =============================================================================
// Paths
// =============================================================================

const PROJECT_ROOT = import.meta.dirname;
const LOG_DIR = path.join(PROJECT_ROOT, ".manus-logs");

const MAX_LOG_SIZE_BYTES = 1 * 1024 * 1024;
const TRIM_TARGET_BYTES = Math.floor(MAX_LOG_SIZE_BYTES * 0.6);

type LogSource =
  | "browserConsole"
  | "networkRequests"
  | "sessionReplay";

// =============================================================================
// Log Helpers
// =============================================================================

function ensureLogDir() {
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }
}

function trimLogFile(logPath: string, maxSize: number) {
  try {
    if (
      !fs.existsSync(logPath) ||
      fs.statSync(logPath).size <= maxSize
    ) {
      return;
    }

    const lines = fs.readFileSync(logPath, "utf-8").split("\n");

    const keptLines: string[] = [];
    let keptBytes = 0;

    for (let i = lines.length - 1; i >= 0; i--) {
      const lineBytes = Buffer.byteLength(`${lines[i]}\n`, "utf-8");

      if (keptBytes + lineBytes > TRIM_TARGET_BYTES) break;

      keptLines.unshift(lines[i]);
      keptBytes += lineBytes;
    }

    fs.writeFileSync(logPath, keptLines.join("\n"), "utf-8");
  } catch {
    // ignore
  }
}

function writeToLogFile(source: LogSource, entries: unknown[]) {
  if (!entries.length) return;

  ensureLogDir();

  const logPath = path.join(LOG_DIR, `${source}.log`);

  const lines = entries.map((entry) => {
    return `[${new Date().toISOString()}] ${JSON.stringify(entry)}`;
  });

  fs.appendFileSync(logPath, `${lines.join("\n")}\n`, "utf-8");

  trimLogFile(logPath, MAX_LOG_SIZE_BYTES);
}

// =============================================================================
// Debug Collector Plugin
// =============================================================================

function vitePluginManusDebugCollector(): Plugin {
  return {
    name: "manus-debug-collector",

    transformIndexHtml(html) {
      if (process.env.NODE_ENV === "production") {
        return html;
      }

      return {
        html,
        tags: [
          {
            tag: "script",
            attrs: {
              src: "/__manus__/debug-collector.js",
              defer: true,
            },
            injectTo: "head",
          },
        ],
      };
    },

    configureServer(server: ViteDevServer) {
      server.middlewares.use("/__manus__/logs", (req, res, next) => {
        if (req.method !== "POST") return next();

        let body = "";

        req.on("data", (chunk) => {
          body += chunk.toString();
        });

        req.on("end", () => {
          try {
            const payload = JSON.parse(body);

            if (payload.consoleLogs?.length) {
              writeToLogFile("browserConsole", payload.consoleLogs);
            }

            if (payload.networkRequests?.length) {
              writeToLogFile("networkRequests", payload.networkRequests);
            }

            if (payload.sessionEvents?.length) {
              writeToLogFile("sessionReplay", payload.sessionEvents);
            }

            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: true }));
          } catch (e) {
            res.writeHead(400, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ success: false, error: String(e) }));
          }
        });
      });
    },
  };
}

// =============================================================================
// Storage Proxy Plugin
// =============================================================================

function vitePluginStorageProxy(): Plugin {
  return {
    name: "manus-storage-proxy",

    configureServer(server: ViteDevServer) {
      server.middlewares.use("/manus-storage", async (req, res) => {
        const key = req.url?.replace(/^\//, "");

        if (!key) {
          res.writeHead(400);
          res.end("Missing storage key");
          return;
        }

        const forgeBaseUrl = (process.env.BUILT_IN_FORGE_API_URL || "").replace(/\/+$/, "");
        const forgeKey = process.env.BUILT_IN_FORGE_API_KEY;

        if (!forgeBaseUrl || !forgeKey) {
          res.writeHead(500);
          res.end("Storage proxy not configured");
          return;
        }

        try {
          const forgeUrl = new URL("v1/storage/presign/get", `${forgeBaseUrl}/`);
          forgeUrl.searchParams.set("path", key);

          const forgeResp = await fetch(forgeUrl, {
            headers: {
              Authorization: `Bearer ${forgeKey}`,
            },
          });

          if (!forgeResp.ok) {
            res.writeHead(502);
            res.end("Storage backend error");
            return;
          }

          const { url } = (await forgeResp.json()) as { url: string };

          res.writeHead(307, {
            Location: url,
            "Cache-Control": "no-store",
          });

          res.end();
        } catch {
          res.writeHead(502);
          res.end("Storage proxy error");
        }
      });
    },
  };
}

// =============================================================================
// CONFIG
// =============================================================================

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    vitePluginManusDebugCollector(),
    vitePluginStorageProxy(),
  ],

  resolve: {
    alias: {
      "@": path.resolve(PROJECT_ROOT, "client/src"),
      "@shared": path.resolve(PROJECT_ROOT, "shared"),
      "@assets": path.resolve(PROJECT_ROOT, "attached_assets"),
    },
  },

  envDir: PROJECT_ROOT,

  root: path.resolve(PROJECT_ROOT, "client"),

  build: {
    // ✅ FIX: standard Vercel-compatible output
    outDir: path.resolve(PROJECT_ROOT, "dist"),
    emptyOutDir: true,
  },

  server: {
    host: true,
    port: 3000,
    strictPort: false,
    allowedHosts: ["localhost", "127.0.0.1"],
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
});

