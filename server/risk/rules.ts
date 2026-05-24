import { Interface } from "ethers";
import { RiskFinding } from "./types";

export function analyzeABI(abi: any[]): RiskFinding[] {
  const findings: RiskFinding[] = [];

  const iface = new Interface(abi);

  const fragments = iface.fragments.map(
    (f: any) => f.name?.toLowerCase()
  );

  const has = (name: string) =>
    fragments.some((f) => f?.includes(name));

  /* =========================================================
     CORE ADMIN CONTROL
  ========================================================= */

  if (has("owner") || has("admin")) {
    findings.push({
      title: "Centralized admin control surface detected",
      severity: "HIGH",
    });
  }

  if (has("transferownership") || has("setowner")) {
    findings.push({
      title: "Ownership transfer capability",
      severity: "MEDIUM",
    });
  }

  /* =========================================================
     MINT / SUPPLY MANIPULATION
  ========================================================= */

  if (has("mint")) {
    findings.push({
      title: "Token minting capability detected",
      severity: "HIGH",
    });
  }

  if (has("burn")) {
    findings.push({
      title: "Token burn logic present",
      severity: "LOW",
    });
  }

  /* =========================================================
     PAUSABLE / BLACKLIST
  ========================================================= */

  if (has("pause")) {
    findings.push({
      title: "Emergency pause functionality",
      severity: "MEDIUM",
    });
  }

  if (has("blacklist") || has("block")) {
    findings.push({
      title: "Address restriction mechanism detected",
      severity: "HIGH",
    });
  }

  /* =========================================================
     TAX / FEE MANIPULATION (VERY IMPORTANT IN DEFI)
  ========================================================= */

  if (has("tax") || has("fee") || has("setfee")) {
    findings.push({
      title: "Dynamic fee/tax system detected",
      severity: "HIGH",
    });
  }

  /* =========================================================
     ROUTER / LIQUIDITY CONTROL
  ========================================================= */

  if (has("router") || has("liquidity")) {
    findings.push({
      title: "Liquidity routing control surface",
      severity: "MEDIUM",
    });
  }

  /* =========================================================
     PROXY / UPGRADEABILITY SIGNALS
  ========================================================= */

  if (has("proxy") || has("implementation") || has("upgrade")) {
    findings.push({
      title: "Upgradeable / proxy pattern detected",
      severity: "MEDIUM",
    });
  }

  /* =========================================================
     HONEYPOT SIGNALS (HEURISTIC)
  ========================================================= */

  if (has("transfer") && has("blacklist")) {
    findings.push({
      title: "Potential honeypot pattern (transfer restriction + blacklist)",
      severity: "HIGH",
    });
  }

  return findings;
}




