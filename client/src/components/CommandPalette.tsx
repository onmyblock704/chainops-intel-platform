"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Command,
  Search,
  Activity,
  Coins,
  Radar,
  Shield,
  Layers3,
  X,
} from "lucide-react";

type Props = {
  onAction?: (action: string) => void;
};

const COMMANDS = [
  {
    id: "scan-whales",
    label: "Scan Whale Activity",
    icon: Activity,
  },
  {
    id: "stablecoin-engine",
    label: "Open Stablecoin Engine",
    icon: Coins,
  },
  {
    id: "liquidity-heatmap",
    label: "Toggle Liquidity Heatmap",
    icon: Layers3,
  },
  {
    id: "mempool-radar",
    label: "Open Mempool Radar",
    icon: Radar,
  },
  {
    id: "risk-engine",
    label: "Run Risk Simulation",
    icon: Shield,
  },
];

export function CommandPalette({
  onAction,
}: Props) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");

  /* =========================================================
     KEYBOARD SHORTCUTS
  ========================================================= */

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const cmdk =
        (e.metaKey || e.ctrlKey) &&
        e.key.toLowerCase() === "k";

      if (cmdk) {
        e.preventDefault();
        setOpen((o) => !o);
      }

      if (e.key === "/") {
        const active =
          document.activeElement?.tagName;

        if (
          active !== "INPUT" &&
          active !== "TEXTAREA"
        ) {
          e.preventDefault();
          setOpen(true);
        }
      }

      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () =>
      window.removeEventListener(
        "keydown",
        onKeyDown
      );
  }, []);

  /* =========================================================
     FILTER
  ========================================================= */

  const filtered = useMemo(() => {
    return COMMANDS.filter((cmd) =>
      cmd.label
        .toLowerCase()
        .includes(query.toLowerCase())
    );
  }, [query]);

  /* =========================================================
     EXECUTE
  ========================================================= */

  function execute(action: string) {
    onAction?.(action);
    setOpen(false);
    setQuery("");
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-100 bg-black/70 backdrop-blur-sm">

      {/* CONTAINER */}
      <div className="mx-auto mt-28 w-full max-w-2xl border border-white/10 bg-[#050706] shadow-2xl">

        {/* HEADER */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">

          <Command
            size={16}
            className="text-[#b7ff39]"
          />

          <input
            autoFocus
            value={query}
            onChange={(e) =>
              setQuery(e.target.value)
            }
            placeholder="Search commands..."
            className="w-full bg-transparent text-sm outline-none placeholder:text-white/30"
          />

          <button
            onClick={() => setOpen(false)}
            className="text-white/40 hover:text-white"
          >
            <X size={16} />
          </button>
        </div>

        {/* COMMANDS */}
        <div className="max-h-105 overflow-y-auto">

          {filtered.length === 0 && (
            <div className="p-4 text-sm text-white/40">
              No commands found.
            </div>
          )}

          {filtered.map((cmd) => {
            const Icon = cmd.icon;

            return (
              <button
                key={cmd.id}
                onClick={() =>
                  execute(cmd.id)
                }
                className="flex w-full items-center justify-between border-b border-white/5 px-4 py-4 text-left transition hover:bg-white/5"
              >
                <div className="flex items-center gap-3">

                  <Icon
                    size={16}
                    className="text-[#b7ff39]"
                  />

                  <span className="text-sm">
                    {cmd.label}
                  </span>

                </div>

                <div className="text-[10px] uppercase tracking-widest text-white/30">
                  run
                </div>
              </button>
            );
          })}
        </div>

        {/* FOOTER */}
        <div className="flex items-center justify-between border-t border-white/10 px-4 py-2 text-[10px] uppercase tracking-widest text-white/30">
          <div>⌘K / CTRL+K</div>
          <div>ChainOps Command Layer</div>
        </div>
      </div>
    </div>
  );
}