export function buildSmartMoneyOverlay({
  risk,
  whales,
  crossChain,
}: any) {
  return {
    riskScore: risk.score,

    whaleExposure: whales.length,

    crossChainActivity:
      crossChain.length,

    signal:
      risk.score > 70 &&
      whales.length > 5
        ? "SMART MONEY EXIT RISK"
        : risk.score < 40 &&
          whales.length > 10
        ? "ACCUMULATION SIGNAL"
        : "NEUTRAL",

    intensity: Math.min(
      risk.score +
        whales.length * 2 +
        crossChain.length * 3,
      100
    ),
  };
}

