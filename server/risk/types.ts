
export type RiskFinding = {
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

export type RiskReport = {
  address: string;
  score: number;
  findings: RiskFinding[];
};
