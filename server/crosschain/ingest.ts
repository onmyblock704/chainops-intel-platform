import { CrossChainEvent } from "./types";

/**
 * Normalizes raw RPC / indexer events into a unified format
 */
export function normalizeEvent(raw: any, chain: any): CrossChainEvent | null {
  if (!raw?.from || !raw?.to) return null;

  return {
    wallet: raw.from,
    chain,
    type: inferType(raw),
    value: Number(raw.value || 0),
    timestamp: Date.now(),
  };
}

function inferType(tx: any): "TRANSFER" | "SWAP" | "BRIDGE" {
  if (tx.input && tx.input !== "0x") return "SWAP";
  return "TRANSFER";
}

