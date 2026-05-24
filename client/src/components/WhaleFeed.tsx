export function WhaleFeed({ whales }: { whales: any[] }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-[0.3em] text-[#19d7ff]">
            Whale Surveillance
          </div>

          <h3 className="mt-2 text-2xl font-black uppercase">
            Realtime Capital Flows
          </h3>
        </div>
      </div>


<div className="space-y-3">
        {whales.length === 0 && (
          <div className="rounded-2xl border border-white/10 p-4 text-sm text-white/50">
            Waiting for whale activity...
          </div>
        )}

        {whales.map((whale, index) => (
          <div
            key={`${whale.hash}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/30 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="font-semibold text-[#b7ff39]">
                ${Number(whale.valueUsd).toLocaleString()}
              </div>

                 <div
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  whale.severity === "HIGH"
                    ? "bg-red-500/20 text-red-300"
                    : whale.severity === "MEDIUM"
                    ? "bg-yellow-500/20 text-yellow-300"
                    : "bg-blue-500/20 text-blue-300"
                }`}

                    >
                {whale.severity}
              </div>
            </div>

            <div className="mt-3 text-xs text-white/50 break-all">
              {whale.hash}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
