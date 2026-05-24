import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { createServer } from "http";

import { createWebSocketServer } from "./ws";

import { scanContract } from "./risk/scanner";

import { buildAutopsyExplanation } from "./risk/autopsy";

import { buildSmartMoneyOverlay } from "./risk/overlay";

/* =========================================================
   APP SETUP
========================================================= */

const app = express();

const server = createServer(app);

app.use(express.json());

/* =========================================================
   HEALTH CHECK
========================================================= */

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    timestamp: Date.now(),
  });
});

/* =========================================================
   SMART CONTRACT RISK SCANNER
========================================================= */

app.post(
  "/api/risk/:address",
  async (req, res) => {
    try {
      const { address } =
        req.params;

      const result =
        await scanContract(
          address
        );

      res.json(result);
    } catch (err) {
      console.error(
        "Risk scan failed:",
        err
      );

      res.status(500).json({
        error:
          "Risk scan failed",
      });
    }
  }
);

/* =========================================================
   CONTRACT AUTOPSY ENGINE
========================================================= */

app.post(
  "/api/risk/autopsy/:address",
  async (req, res) => {
    try {
      const { address } =
        req.params;

      const report =
        await scanContract(
          address
        );

      const autopsy =
        buildAutopsyExplanation(
          report
        );

      res.json(autopsy);
    } catch (err) {
      console.error(
        "Autopsy failed:",
        err
      );

      res.status(500).json({
        error:
          "Autopsy failed",
      });
    }
  }
);

/* =========================================================
   SMART MONEY OVERLAY
========================================================= */

app.get(
  "/api/intelligence/smart-money",
  async (_req, res) => {
    try {
      const overlay =
        buildSmartMoneyOverlay({
          risk: {
            score: 72,
          },

          whales: [
            1,
            2,
            3,
            4,
            5,
            6,
          ],

          crossChain: [
            1,
            2,
            3,
          ],
        });

      res.json(overlay);
    } catch (err) {
      console.error(
        "Smart money overlay failed:",
        err
      );

      res.status(500).json({
        error:
          "Overlay failed",
      });
    }
  }
);

/* =========================================================
   WEBSOCKET ENGINE
========================================================= */

createWebSocketServer(server);

/* =========================================================
   SERVER START
========================================================= */

const PORT =
  Number(process.env.PORT) ||
  3000;

server.listen(PORT, () => {
  console.log(
    `🚀 Running on http://localhost:${PORT}`
  );

  console.log(
    `⚡ WS ready on ws://localhost:${PORT}/ws`
  );
});

/* =========================================================
   SERVER ERRORS
========================================================= */

server.on("error", (err: any) => {
  if (
    err.code === "EADDRINUSE"
  ) {
    console.error(
      `❌ Port ${PORT} already in use`
    );

    process.exit(1);
  }

  console.error(
    "Server error:",
    err
  );
});

/* =========================================================
   CLEAN SHUTDOWN
========================================================= */

process.on("SIGINT", () => {
  console.log(
    "🛑 Shutting down..."
  );

  server.close();

  process.exit(0);
});

