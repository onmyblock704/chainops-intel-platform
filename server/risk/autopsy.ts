import { analyzeABI } from "./rules";

export function buildAutopsyReport(abi: any[]) {
  const findings = analyzeABI(abi);

  const riskScore =
    100 -
    findings.reduce((acc, f) => {
      if (f.severity === "HIGH") return acc + 20;
      if (f.severity === "MEDIUM") return acc + 10;
      return acc + 3;
    }, 0);

  const summary = generateSummary(findings);

  return {
    score: Math.max(riskScore, 0),
    summary,
    findings,
  };
}

/* =========================================================
   NATURAL LANGUAGE RISK EXPLANATION ENGINE
========================================================= */

function generateSummary(findings: any[]) {
  const flags = findings.map((f) => f.title.toLowerCase());

  let narrative = "This contract shows standard behavior.";

  if (flags.some(f => f.includes("mint"))) {
    narrative +=
      " It has minting capability, meaning supply can be increased arbitrarily.";
  }

  if (flags.some(f => f.includes("blacklist"))) {
    narrative +=
      " It contains address restriction logic, allowing users to be blocked from transfers.";
  }

  if (flags.some(f => f.includes("fee") || f.includes("tax"))) {
    narrative +=
      " It includes dynamic fee logic, which can be changed by privileged roles.";
  }

  if (flags.some(f => f.includes("proxy") || f.includes("upgrade"))) {
    narrative +=
      " It is upgradeable, meaning logic can be changed after deployment.";
  }

  if (flags.some(f => f.includes("ownership"))) {
    narrative +=
      " Administrative control is centralized under a single owner or role.";
  }

  return narrative;
}


export function buildAutopsyExplanation(report: any) {
  const score = report.score;

  let summary = "";

  if (score > 80) {
    summary =
      "This contract exhibits high-risk behavior patterns typically associated with exploit-prone or malicious deployments.";
  } else if (score > 50) {
    summary =
      "This contract shows moderate risk signals including unusual permissions or suspicious logic paths.";
  } else {
    summary =
      "This contract appears relatively safe based on available heuristic analysis.";
  }

  const reasons = (report.findings || []).map((f: any) => {
    return `• ${f.title}: ${
      f.description ||
      "Potential anomaly detected in contract logic."
    }`;
  });

  return {
    summary,
    reasons,
    score,
  };
}


