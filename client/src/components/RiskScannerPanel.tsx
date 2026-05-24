"use client";

import { useState } from "react";

type Finding = {
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH";
};

type Report = {
  address: string;
  score: number;
  findings: Finding[];
};

export default function RiskScannerPanel() {
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<Report | null>(null);

  async function scanContract() {
    if (!address) return;

    setLoading(true);

    try {
      const res = await fetch(
        `http://localhost:3000/api/risk/${address}`
      );

      const data = await res.json();
      setReport(data);
    } finally {
      setLoading(false);
    }
  }

  function riskLabel(score: number) {
    if (score >= 80)
      return { label: "LOW RISK", color: "text-[#b7ff39]" };

    if (score >= 50)
      return { label: "MEDIUM RISK", color: "text-yellow-400" };

    return { label: "HIGH RISK", color: "text-red-500" };
  }

  function severityCount(type: string) {
    if (!report) return 0;
    return report.findings.filter(f => f.severity === type).length;
  }

  return (
    <div className="border border-white/10 bg-black/70 p-4">

      {/* =====================================================
          HEADER
      ===================================================== */}

      <div className="mb-3 flex items-center justify-between">
        <div className="text-[10px] uppercase tracking-widest text-[#ff6868]">
          Risk Intelligence Engine
        </div>

        <div className="text-[10px] text-white/30">
          PHASE 1D LIVE
        </div>
      </div>

      {/* =====================================================
          INPUT
      ===================================================== */}

      <div className="flex gap-2">
        <input
          value={address}
          onChange={(e) => setAddress(e.target.value)}
          placeholder="0x contract address"
          className="flex-1 border border-white/10 bg-black px-3 py-2 text-sm outline-none focus:border-[#ff6868]"
        />

        <button
          onClick={scanContract}
          disabled={loading}
          className="border border-[#ff6868]/30 px-4 py-2 text-xs uppercase tracking-widest text-[#ff6868] hover:bg-[#ff6868]/10"
        >
          {loading ? "Scanning..." : "Scan"}
        </button>
      </div>

      {/* =====================================================
          RESULTS
      ===================================================== */}

      {report && (
        <div className="mt-5 space-y-4">

          {/* =================================================
              RISK DIAL (VISUAL CORE)
          ================================================= */}

          <div className="relative flex flex-col items-center justify-center border border-white/10 p-4">

            <div className="text-[10px] uppercase tracking-widest text-white/40">
              Risk Score
            </div>

            <div className="mt-2 text-6xl font-bold text-white">
              {report.score}
            </div>

            <div className={`mt-2 text-xs uppercase tracking-widest ${riskLabel(report.score).color}`}>
              {riskLabel(report.score).label}
            </div>

            <div className="mt-3 h-2 w-full bg-white/5">
              <div
                className="h-2 bg-linear-to-r from-green-400 via-yellow-400 to-red-500"
                style={{ width: `${100 - report.score}%` }}
              />
            </div>
          </div>

          {/* =================================================
              ATTACK SURFACE TAGS
          ================================================= */}

          <div className="border border-white/10 p-3">
            <div className="mb-2 text-[10px] uppercase tracking-widest text-white/40">
              Attack Surface
            </div>

            <div className="flex flex-wrap gap-2">
              {report.findings.map((f, i) => (
                <span
                  key={i}
                  className={`text-[10px] border px-2 py-1 uppercase tracking-widest ${
                    f.severity === "HIGH"
                      ? "border-red-500 text-red-500"
                      : f.severity === "MEDIUM"
                      ? "border-yellow-400 text-yellow-400"
                      : "border-[#19d7ff] text-[#19d7ff]"
                  }`}
                >
                  {f.title}
                </span>
              ))}
            </div>
          </div>

          {/* =================================================
              SEVERITY BREAKDOWN
          ================================================= */}

          <div className="grid grid-cols-3 gap-2 text-center">

            <div className="border border-red-500/20 p-2">
              <div className="text-[10px] text-red-400">HIGH</div>
              <div className="text-lg text-red-500">
                {severityCount("HIGH")}
              </div>
            </div>

            <div className="border border-yellow-400/20 p-2">
              <div className="text-[10px] text-yellow-400">MED</div>
              <div className="text-lg text-yellow-400">
                {severityCount("MEDIUM")}
              </div>
            </div>

            <div className="border border-[#19d7ff]/20 p-2">
              <div className="text-[10px] text-[#19d7ff]">LOW</div>
              <div className="text-lg text-[#19d7ff]">
                {severityCount("LOW")}
              </div>
            </div>

          </div>

          {/* =================================================
              LIVE PULSE INDICATOR
          ================================================= */}

          <div className="flex items-center gap-2 text-[10px] text-white/40">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#ff6868]" />
            LIVE ANALYSIS ENGINE ACTIVE
          </div>

        </div>
      )}
    </div>
  );
}

