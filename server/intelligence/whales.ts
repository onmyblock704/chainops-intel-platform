type WhaleAlert = {
  txHash: string;
  from: string;
  to: string;
  valueETH: number;
  valueUSD: number;
  severity: "low" | "medium" | "high" | "critical";
  timestamp: number;
  label: string;
};

export function detectWhaleTransaction(
  txHash: string,
  valueETH: number,
  ethPrice: number
): WhaleAlert | null {
  const valueUSD = valueETH * ethPrice;

  let severity: WhaleAlert["severity"] | null = null;

  // 🧠 Whale classification logic (Bloomberg-style tiers)
  if (valueUSD >= 10_000_000) severity = "critical";
  else if (valueUSD >= 5_000_000) severity = "high";
  else if (valueUSD >= 1_000_000) severity = "medium";
  else if (valueUSD >= 250_000) severity = "low";

  if (!severity) return null;

  const label =
    severity === "critical"
      ? "MEGA WHALE MOVE"
      : severity === "high"
      ? "Large Capital Flow"
      : severity === "medium"
      ? "Institutional Transfer"
      : "Whale Activity";

  return {
    txHash,
    from: `0x${Math.random().toString(16).slice(2, 10)}`,
    to: `0x${Math.random().toString(16).slice(2, 10)}`,
    valueETH,
    valueUSD,
    severity,
    timestamp: Date.now(),
    label,
  };
}