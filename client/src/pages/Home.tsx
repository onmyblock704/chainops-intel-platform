"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  Activity,
  Command,
  Hexagon,
  Layers3,
  Radar,
  Shield,
  Coins,
  Search,
  X,
} from "lucide-react";

/* =========================================================
   TYPES
========================================================= */

type Tx = {
  hash: string;
};

type StablecoinEngine = {
  reserveRatio: number;
  peg: number;
  mintQueue: number;
  burnPressure: number;
};

type LiquidityZone = {
  region: string;
  intensity: number;
};

type WalletProfile = {
  wallet: string;
  totalVolume: number;
  chains: string[];
  activityCount: number;
  behaviorTag?: string;
};

/* =========================================================
   COMMANDS
========================================================= */

const COMMANDS = [
  {
    id: "scan-whales",
    label: "Scan Whale Activity",
    icon: Activity,
  },

  {
    id: "stablecoin-engine",
    label: "Open Stablecoin Engine",
    icon: Coins,
  },

  {
    id: "liquidity-heatmap",
    label: "Toggle Liquidity Heatmap",
    icon: Layers3,
  },

  {
    id: "mempool-radar",
    label: "Open Mempool Radar",
    icon: Radar,
  },

  {
    id: "risk-engine",
    label: "Run Risk Simulation",
    icon: Shield,
  },
];

export default function Home() {
  /* =========================================================
     CORE STATE
  ========================================================= */

  const [wsConnected, setWsConnected] =
    useState(false);

  const [paletteOpen, setPaletteOpen] =
    useState(false);

  const [query, setQuery] =
    useState("");

  const [mempool, setMempool] =
    useState<Tx[]>([]);

  const [crossChainData, setCrossChainData] =
    useState<WalletProfile[]>([]);

  /* =========================================================
     RISK ENGINE STATE
  ========================================================= */

  const [contractAddress, setContractAddress] =
    useState("");

  const [scanResult, setScanResult] =
    useState<any>(null);

  const [autopsy, setAutopsy] =
    useState<any>(null);

  const [smartMoney, setSmartMoney] =
    useState<any>(null);

  const [riskFeed, setRiskFeed] =
    useState<any[]>([]);

  const [scanning, setScanning] =
    useState(false);

  /* =========================================================
     STABLECOIN ENGINE
  ========================================================= */

  const [stablecoin, setStablecoin] =
    useState<StablecoinEngine>({
      reserveRatio: 142.6,
      peg: 1.0002,
      mintQueue: 18,
      burnPressure: 22,
    });

  /* =========================================================
     LIQUIDITY
  ========================================================= */

  const [liquidity] = useState<
    LiquidityZone[]
  >([
    {
      region: "ETH",
      intensity: 78,
    },

    {
      region: "ARB",
      intensity: 61,
    },

    {
      region: "BASE",
      intensity: 92,
    },

    {
      region: "OP",
      intensity: 44,
    },
  ]);

  const socketRef =
    useRef<WebSocket | null>(null);

  /* =========================================================
     WEBSOCKET
  ========================================================= */

  useEffect(() => {
    const ws = new WebSocket(
      import.meta.env.VITE_WS_URL ||
        "ws://localhost:3000/ws"
    );

    socketRef.current = ws;

    ws.onopen = () => {
      setWsConnected(true);
    };

    ws.onclose = () => {
      setWsConnected(false);
    };

    ws.onmessage = (e) => {
      try {
        const msg = JSON.parse(e.data);

        /* ===============================
           MEMPOOL
        =============================== */

        if (
          msg.type === "PENDING_TX"
        ) {
          setMempool((prev) =>
            [
              {
                hash:
                  msg.data.hash,
              },

              ...prev,
            ].slice(0, 10)
          );
        }

        /* ===============================
           STABLECOIN ENGINE
        =============================== */

        if (
          msg.type ===
          "STABLECOIN_ENGINE"
        ) {
          setStablecoin(
            msg.data
          );
        }

        /* ===============================
           CROSS-CHAIN
        =============================== */

        if (
          msg.type ===
          "CROSSCHAIN_UPDATE"
        ) {
          setCrossChainData(
            msg.data.wallets || []
          );
        }

        /* ===============================
           LIVE RISK FEED
        =============================== */

        if (
          msg.type ===
          "RISK_FEED_EVENT"
        ) {
          setRiskFeed((prev) =>
            [
              msg.data,
              ...prev,
            ].slice(0, 8)
          );
        }

        /* ===============================
           SMART MONEY
        =============================== */

        if (
          msg.type ===
          "SMART_MONEY_UPDATE"
        ) {
          setSmartMoney(
            msg.data
          );
        }
      } catch (err) {
        console.error(err);
      }
    };

    return () => ws.close();
  }, []);

  /* =========================================================
     COMMAND PALETTE
  ========================================================= */

  useEffect(() => {
    function onKeyDown(
      e: KeyboardEvent
    ) {
      const cmdk =
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k";

      if (cmdk) {
        e.preventDefault();

        setPaletteOpen(
          (o) => !o
        );
      }

      if (e.key === "Escape") {
        setPaletteOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      onKeyDown
    );

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
  }, []);

  /* =========================================================
     FILTER COMMANDS
  ========================================================= */

  const filteredCommands =
    useMemo(() => {
      return COMMANDS.filter(
        (cmd) =>
          cmd.label
            .toLowerCase()
            .includes(
              query.toLowerCase()
            )
      );
    }, [query]);

  /* =========================================================
     EXECUTE COMMAND
  ========================================================= */

  function executeCommand(
    action: string
  ) {
    console.log(
      "COMMAND:",
      action
    );

    setPaletteOpen(false);
  }

  /* =========================================================
     CONTRACT SCAN
  ========================================================= */

  async function runScan() {
    if (!contractAddress) return;

    setScanning(true);

    try {
      /* ===============================
         MAIN SCAN
      =============================== */

      const res = await fetch(
        `http://localhost:3000/api/risk/${contractAddress}`,
        {
          method: "POST",
        }
      );

      const data =
        await res.json();

      setScanResult(data);

      /* ===============================
         AUTOPSY
      =============================== */

      const res2 =
        await fetch(
          `http://localhost:3000/api/risk/autopsy/${contractAddress}`,
          {
            method: "POST",
          }
        );

      const data2 =
        await res2.json();

      setAutopsy(data2);
    } catch (err) {
      console.error(err);
    } finally {
      setScanning(false);
    }
  }

  /* =========================================================
     UI
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#050706] text-white font-mono">

      {/* =====================================================
          TOP STATUS BAR
      ===================================================== */}

      <div className="fixed top-0 left-0 right-0 z-50 border-b border-white/10 bg-black/90">

        <div className="flex justify-between px-4 py-2 text-[11px] uppercase tracking-widest">

          <div className="flex gap-6 text-white/60">

            <span className="text-[#19d7ff]">
              TX FLOW: {mempool.length}
            </span>

            <span className="text-[#b7ff39]">
              SYSTEM ACTIVE
            </span>

            <span className="text-[#f6a700]">
              PEG STABLE
            </span>

          </div>

          <div
            className={
              wsConnected
                ? "text-[#b7ff39]"
                : "text-red-500"
            }
          >
            {wsConnected
              ? "LIVE"
              : "OFFLINE"}
          </div>

        </div>
      </div>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fixed top-9 left-0 right-0 z-40 border-b border-white/10 bg-black/80">

        <div className="flex h-14 items-center justify-between px-4">

          <div className="flex items-center gap-3">

            <Hexagon className="text-[#b7ff39]" />

            <div className="uppercase tracking-widest text-sm">
              CHAINOPS CONTROL
            </div>

          </div>

          <button
            onClick={() =>
              setPaletteOpen(true)
            }
            className="flex items-center gap-2 border border-white/10 bg-black/60 px-3 py-1 text-[10px]"
          >
            <Command size={12} />
            Command
          </button>

        </div>
      </header>

      {/* =====================================================
          MAIN GRID
      ===================================================== */}

      <main className="pt-32 px-4">

        <div className="grid grid-cols-12 gap-2">

          {/* =================================================
              LEFT COLUMN
          ================================================= */}

          <div className="col-span-3 space-y-3">

            {/* MEMPOOL */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="mb-2 text-[10px] uppercase text-[#19d7ff]">
                Mempool Stream
              </div>

              <div className="space-y-1">

                {mempool.map((tx, i) => (
                  <div
                    key={i}
                    className="text-[10px] text-[#19d7ff]"
                  >
                    {tx.hash.slice(0, 16)}
                    ...
                  </div>
                ))}

              </div>
            </div>

            {/* RISK SCANNER */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="mb-3 text-[10px] uppercase text-red-400">
                Smart Contract Scanner
              </div>

              <div className="flex gap-2">

                <input
                  value={
                    contractAddress
                  }
                  onChange={(e) =>
                    setContractAddress(
                      e.target.value
                    )
                  }
                  placeholder="0x contract"
                  className="flex-1 border border-white/10 bg-black px-2 py-1 text-[10px] outline-none"
                />

                <button
                  onClick={runScan}
                  disabled={scanning}
                  className="border border-red-500/30 px-2 py-1 text-[10px]"
                >
                  {scanning
                    ? "..."
                    : "Scan"}
                </button>

              </div>

              {/* SCAN RESULTS */}

              {scanResult && (
                <div className="mt-3 space-y-2">

                  <div className="border border-white/10 p-2">

                    <div className="text-[10px] text-white/40">
                      Risk Score
                    </div>

                    <div className="mt-1 text-xl text-white">
                      {
                        scanResult.score
                      }
                    </div>

                  </div>

                </div>
              )}

              {/* AUTOPSY */}

              {autopsy && (
                <div className="mt-3 border border-white/10 p-2">

                  <div className="text-[10px] uppercase text-red-400">
                    Contract Autopsy
                  </div>

                  <div className="mt-2 text-[10px] text-white/70">
                    {
                      autopsy.summary
                    }
                  </div>

                  <div className="mt-2 space-y-1">

                    {autopsy.reasons?.map(
                      (
                        r: string,
                        i: number
                      ) => (
                        <div
                          key={i}
                          className="text-[9px] text-white/50"
                        >
                          {r}
                        </div>
                      )
                    )}

                  </div>
                </div>
              )}

            </div>
          </div>

          {/* =================================================
              CENTER COLUMN
          ================================================= */}

          <div className="col-span-6 space-y-3">

            {/* STABLECOIN ENGINE */}

            <div className="border border-white/10 bg-black/70 p-4">

              <div className="mb-4 text-[11px] uppercase text-[#b7ff39]">
                Stablecoin Engine
              </div>

              <div className="grid grid-cols-4 gap-2 text-sm">

                <div className="border border-white/10 p-3">
                  {stablecoin.reserveRatio}%
                </div>

                <div className="border border-white/10 p-3">
                  {stablecoin.peg}
                </div>

                <div className="border border-white/10 p-3">
                  {stablecoin.mintQueue}
                </div>

                <div className="border border-white/10 p-3">
                  {stablecoin.burnPressure}
                </div>

              </div>
            </div>

            {/* SMART MONEY */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="text-[10px] uppercase text-[#b7ff39]">
                Smart Money Overlay
              </div>

              {smartMoney && (
                <>

                  <div className="mt-2 text-sm">
                    {
                      smartMoney.signal
                    }
                  </div>

                  <div className="mt-1 text-[10px] text-white/40">
                    Risk: {
                      smartMoney.riskScore
                    }
                    {" | "}
                    Whales: {
                      smartMoney.whaleExposure
                    }
                  </div>

                  <div className="mt-2 h-1 bg-white/5">

                    <div
                      className="h-1 bg-[#19d7ff]"
                      style={{
                        width: `${smartMoney.intensity}%`,
                      }}
                    />

                  </div>

                </>
              )}

            </div>

            {/* LIQUIDITY */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="mb-3 text-[10px] uppercase text-white/40">
                Liquidity Heatmap
              </div>

              <div className="grid grid-cols-4 gap-2">

                {liquidity.map(
                  (zone) => (
                    <div
                      key={
                        zone.region
                      }
                      className="border border-white/10 p-3"
                    >
                      <div className="text-[10px] text-white/40">
                        {
                          zone.region
                        }
                      </div>

                      <div className="mt-2 h-2 bg-white/5">

                        <div
                          className="h-2 bg-[#b7ff39]"
                          style={{
                            width: `${zone.intensity}%`,
                          }}
                        />

                      </div>

                    </div>
                  )
                )}

              </div>
            </div>

          </div>

          {/* =================================================
              RIGHT COLUMN
          ================================================= */}

          <div className="col-span-3 space-y-3">

            {/* CROSS-CHAIN */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="mb-2 text-[10px] uppercase text-[#19d7ff]">
                Cross-Chain Timeline
              </div>

              <div className="space-y-2">

                {crossChainData.map(
                  (wallet, i) => (
                    <div
                      key={i}
                      className="border border-white/10 p-2 text-[10px]"
                    >
                      <div>
                        {wallet.wallet.slice(
                          0,
                          8
                        )}
                        ...
                      </div>

                      <div className="mt-1 text-white/40">
                        {
                          wallet.behaviorTag
                        }
                      </div>
                    </div>
                  )
                )}

              </div>
            </div>

            {/* LIVE RISK FEED */}

            <div className="border border-white/10 bg-black/60 p-3">

              <div className="mb-2 text-[10px] uppercase text-red-400">
                Live Risk Feed
              </div>

              <div className="space-y-2">

                {riskFeed.map(
                  (event, i) => (
                    <div
                      key={i}
                      className="border border-white/10 p-2"
                    >
                      <div className="text-[10px]">
                        {
                          event.message
                        }
                      </div>

                      <div className="mt-1 text-[9px] text-white/40">
                        Score: {
                          event.score
                        }
                      </div>
                    </div>
                  )
                )}

              </div>
            </div>

          </div>

        </div>
      </main>

      {/* =====================================================
          COMMAND PALETTE
      ===================================================== */}

      {paletteOpen && (
        <div className="fixed inset-0 z-50 bg-black/80">

          <div className="mx-auto mt-24 max-w-2xl border border-white/10 bg-black">

            <div className="flex items-center border-b border-white/10 p-3">

              <Search
                size={14}
                className="text-[#b7ff39]"
              />

              <input
                value={query}
                onChange={(e) =>
                  setQuery(
                    e.target.value
                  )
                }
                placeholder="Search commands..."
                className="ml-3 w-full bg-transparent text-sm outline-none"
              />

              <button
                onClick={() =>
                  setPaletteOpen(false)
                }
              >
                <X size={14} />
              </button>

            </div>

            {filteredCommands.map(
              (cmd) => (
                <button
                  key={cmd.id}
                  onClick={() =>
                    executeCommand(
                      cmd.id
                    )
                  }
                  className="w-full border-b border-white/5 p-4 text-left hover:bg-white/5"
                >
                  {cmd.label}
                </button>
              )
            )}

          </div>
        </div>
      )}

    </div>
  );
}





