import { CrossChainEvent, WalletProfile } from "./types";

export function correlateWalletActivity(
  events: CrossChainEvent[]
): WalletProfile[] {
  const map = new Map<string, CrossChainEvent[]>();

  /* =========================================================
     GROUP BY WALLET
  ========================================================= */

  for (const e of events) {
    if (!map.has(e.wallet)) {
      map.set(e.wallet, []);
    }

    map.get(e.wallet)!.push(e);
  }

  /* =========================================================
     BUILD PROFILES
  ========================================================= */

  return Array.from(map.entries()).map(
    ([wallet, evts]) => {
      const totalVolume = evts.reduce(
        (sum, e) => sum + e.value,
        0
      );

      const chains = Array.from(
        new Set(evts.map((e) => e.chain))
      );

      const activityCount = evts.length;

      return {
        wallet,
        totalVolume,
        chains,
        activityCount,
        behaviorTag: classify(evts, totalVolume),
      };
    }
  );
}

/* =========================================================
   SIMPLE BEHAVIOR CLASSIFIER (PHASE 2 MVP)
========================================================= */

function classify(
  events: CrossChainEvent[],
  volume: number
): WalletProfile["behaviorTag"] {
  const chainCount = new Set(
    events.map((e) => e.chain)
  ).size;

  if (volume > 1_000_000) return "WHALE";

  if (chainCount >= 3 && volume > 100_000)
    return "ARB BOT";

  if (volume < 10_000) return "RETAIL";

  return "EXCHANGE";
}

