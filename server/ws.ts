import WebSocket, {
  WebSocketServer,
} from "ws";

let ethSocket: WebSocket | null =
  null;

/* =========================================================
   TYPES
========================================================= */

type BroadcastPayload = {
  type: string;
  data: any;
};

/* =========================================================
   BROADCAST HELPER
========================================================= */

function broadcast(
  wss: WebSocketServer,
  payload: BroadcastPayload
) {
  const message =
    JSON.stringify(payload);

  wss.clients.forEach((client) => {
    if (
      client.readyState ===
      WebSocket.OPEN
    ) {
      client.send(message);
    }
  });
}

/* =========================================================
   MOCK GENERATORS
========================================================= */

function generateRiskFeedEvent() {
  const scores = [
    21, 34, 49, 58, 67, 72, 81, 93,
  ];

  return {
    message:
      "Live contract scan processed",

    score:
      scores[
        Math.floor(
          Math.random() *
            scores.length
        )
      ],

    timestamp: Date.now(),
  };
}

function generateSmartMoneySignal() {
  const signals = [
    "ACCUMULATION SIGNAL",
    "SMART MONEY EXIT",
    "WHALE ROTATION",
    "HIGH RISK FLOW",
  ];

  return {
    signal:
      signals[
        Math.floor(
          Math.random() *
            signals.length
        )
      ],

    riskScore:
      Math.floor(
        Math.random() * 100
      ),

    whaleExposure:
      Math.floor(
        Math.random() * 25
      ),

    crossChainActivity:
      Math.floor(
        Math.random() * 15
      ),

    intensity:
      Math.floor(
        Math.random() * 100
      ),
  };
}

function generateCrossChainData() {
  return {
    wallets: [
      {
        wallet:
          "0x8f2a91bc8d12",
        totalVolume: 2400000,
        chains: [
          "Ethereum",
          "Arbitrum",
          "Base",
        ],
        activityCount: 14,
        behaviorTag:
          "WHALE",
      },

      {
        wallet:
          "0x4aa91f992bc1",
        totalVolume: 860000,
        chains: [
          "Optimism",
          "Ethereum",
        ],
        activityCount: 7,
        behaviorTag:
          "ARB BOT",
      },

      {
        wallet:
          "0x91bc2ffab882",
        totalVolume: 420000,
        chains: [
          "Base",
          "Polygon",
        ],
        activityCount: 11,
        behaviorTag:
          "RETAIL",
      },
    ],
  };
}

/* =========================================================
   CREATE WS SERVER
========================================================= */

export function createWebSocketServer(
  server: any
) {
  const wss = new WebSocketServer({
    server,
    path: "/ws",
  });

  const ALCHEMY_WS_URL =
    process.env.ALCHEMY_WS_URL;

  console.log(
    "⚡ ChainOps WebSocket server running"
  );

  console.log(
    "⚡ WS ready on ws://localhost:3000/ws"
  );

  /* =====================================================
     FRONTEND CONNECTIONS
  ===================================================== */

  wss.on("connection", () => {
    console.log(
      "🟢 Frontend connected"
    );
  });

  /* =====================================================
     LIVE RISK FEED (PHASE 2F)
  ===================================================== */

  setInterval(() => {
    broadcast(wss, {
      type: "RISK_FEED_EVENT",

      data:
        generateRiskFeedEvent(),
    });
  }, 4000);

  /* =====================================================
     SMART MONEY OVERLAY (PHASE 2E)
  ===================================================== */

  setInterval(() => {
    broadcast(wss, {
      type:
        "SMART_MONEY_UPDATE",

      data:
        generateSmartMoneySignal(),
    });
  }, 6000);

  /* =====================================================
     CROSS-CHAIN TIMELINE
  ===================================================== */

  setInterval(() => {
    broadcast(wss, {
      type:
        "CROSSCHAIN_UPDATE",

      data:
        generateCrossChainData(),
    });
  }, 7000);

  /* =====================================================
     ENV CHECK
  ===================================================== */

  if (!ALCHEMY_WS_URL) {
    console.log(
      "❌ Missing ALCHEMY_WS_URL"
    );

    console.log(
      "⚠️ Ethereum WS disabled"
    );

    return;
  }

  /* =====================================================
     ETHEREUM CONNECTION
  ===================================================== */

  console.log(
    "🌐 Connecting to Ethereum WebSocket..."
  );

  ethSocket = new WebSocket(
    ALCHEMY_WS_URL
  );

  ethSocket.on("open", () => {
    console.log(
      "✅ Connected to Ethereum WS"
    );

    ethSocket?.send(
      JSON.stringify({
        jsonrpc: "2.0",

        id: 1,

        method:
          "eth_subscribe",

        params: [
          "newPendingTransactions",
        ],
      })
    );
  });

  /* =====================================================
     LIVE MEMPOOL STREAM
  ===================================================== */

  ethSocket.on(
    "message",
    (data: Buffer) => {
      try {
        const parsed = JSON.parse(
          data.toString()
        );

        if (
          parsed.method ===
          "eth_subscription"
        ) {
          const hash =
            parsed.params.result;

          broadcast(wss, {
            type:
              "PENDING_TX",

            data: {
              hash,
            },
          });
        }
      } catch (err) {
        console.error(
          "WS Parse Error:",
          err
        );
      }
    }
  );

  /* =====================================================
     ETHEREUM ERRORS
  ===================================================== */

  ethSocket.on("error", (err) => {
    console.error(
      "Ethereum WS Error:",
      err
    );
  });

  ethSocket.on("close", () => {
    console.log(
      "⚠ Ethereum WS disconnected"
    );
  });

  /* =====================================================
     SERVER ERRORS
  ===================================================== */

  wss.on("error", (err) => {
    console.error(
      "WebSocket Server Error:",
      err
    );
  });
}





