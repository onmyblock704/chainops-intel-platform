export type CrossChainEvent = {
  wallet: string;
  chain: "ETH" | "ARB" | "BASE" | "OP";
  type: "TRANSFER" | "SWAP" | "BRIDGE";
  value: number;
  timestamp: number;
};

export function correlateWalletActivity(events: CrossChainEvent[]) {
  const map = new Map<string, CrossChainEvent[]>();

  for (const e of events) {
    if (!map.has(e.wallet)) {
      map.set(e.wallet, []);
    }

    map.get(e.wallet)!.push(e);
  }

  return Array.from(map.entries()).map(([wallet, events]) => {
    const totalVolume = events.reduce(
      (sum, e) => sum + e.value,
      0
    );

    const chains = new Set(events.map(e => e.chain));

    return {
      wallet,
      totalVolume,
      chains: Array.from(chains),
      activityCount: events.length,
    };
  });
}
