import axios from "axios";


export type WhaleTransaction = {
  hash: string;
  valueUsd: number;
  from: string;
  to: string;
  asset: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
  timestamp: number;
};

export type ChainTelemetry = {
  blockNumber: number;
  gasPrice: string;
  txCount: number;
  ethPrice: string;
  pendingTx: number;
  networkLoad: number;
  timestamp: number;
};


const WHALE_THRESHOLD = 100000;

export function detectWhaleTransaction(
  txHash: string,
  valueEth: number,
  ethPrice: number
): WhaleTransaction | null {
  const valueUsd = valueEth * ethPrice;

  if (valueUsd < WHALE_THRESHOLD) {
    return null;
  }

  let severity: "LOW" | "MEDIUM" | "HIGH" = "LOW";

  if (valueUsd > 1000000) {
    severity = "HIGH";
  } else if (valueUsd > 250000) {
    severity = "MEDIUM";
  }

  return {
    hash: txHash,
    valueUsd,
    from: "Unknown",
    to: "Unknown",
    asset: "ETH",
    severity,
    timestamp: Date.now(),
  };
}


export async function fetchEthPrice(): Promise<string> {
  try {
    const response = await axios.get(
      "https://api.coinbase.com/v2/prices/ETH-USD/spot"
    );

    return Number(response.data.data.amount).toFixed(2);
  } catch {
    return "0.00";
  }
}


export function createTelemetryPayload(
  blockNumber: number,
  gasPrice: string,
  txCount: number,
  ethPrice: string,
  pendingTx: number
): ChainTelemetry {
  return {
    blockNumber,
    gasPrice,
    txCount,
    ethPrice,
    pendingTx,
    networkLoad: Math.min(100, pendingTx / 150),
    timestamp: Date.now(),
  };
}