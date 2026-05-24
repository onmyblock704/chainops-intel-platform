import { JsonRpcProvider, Contract } from "ethers";
import { analyzeABI } from "./rules";
import { RiskReport } from "./types";

const provider = new JsonRpcProvider(process.env.RPC_ENDPOINT);

const ABI = [
  "function owner() view returns (address)",
  "function admin() view returns (address)",
  "function mint(address,uint256)",
  "function burn(uint256)",
  "function pause()",
  "function blacklist(address)",
  "function setFee(uint256)",
  "function setTax(uint256)",
  "function upgradeTo(address)",
  "function implementation() view returns (address)",
];

export async function scanContract(address: string): Promise<RiskReport> {
  const contract = new Contract(address, ABI, provider);

  const findings = analyzeABI(ABI);

  let score = 100;

  for (const f of findings) {
    switch (f.severity) {
      case "HIGH":
        score -= 20;
        break;
      case "MEDIUM":
        score -= 10;
        break;
      case "LOW":
        score -= 3;
        break;
    }
  }

  return {
    address,
    score: Math.max(score, 0),
    findings,
  };
}


