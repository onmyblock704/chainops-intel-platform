export type Chain = "ETH" | "ARB" | "BASE" | "OP";

export type CrossChainEvent = {
  wallet: string;
  chain: Chain;
  type: "TRANSFER" | "SWAP" | "BRIDGE";
  value: number;
  timestamp: number;
};

export type WalletProfile = {
  wallet: string;
  totalVolume: number;
  chains: Chain[];
  activityCount: number;
  behaviorTag?: "WHALE" | "ARB BOT" | "RETAIL" | "EXCHANGE";
};

