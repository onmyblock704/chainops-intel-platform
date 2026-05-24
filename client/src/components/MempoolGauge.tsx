export function MempoolGauge({
  pendingTx,
  networkLoad,
}: {
  pendingTx: number;
  networkLoad: number;
}) {

   return (
    <div className="rounded-3xl border border-white/10 bg-white/3 p-6">
      <div className="text-xs uppercase tracking-[0.3em] text-[#f6a700]">
        Mempool Pressure
      </div>

        <h3 className="mt-2 text-2xl font-black uppercase">
        Network Congestion
      </h3> 

        <div className="mt-6">
        <div className="flex items-center justify-between text-sm text-white/50">
          <span>Pending Transactions</span>
          <span>{pendingTx}</span>
        </div>

          <div className="mt-3 h-4 overflow-hidden rounded-full bg-white/10">
          <div
            className="h-full rounded-full bg-[#f6a700] transition-all duration-500"
            style={{ width: `${networkLoad}%` }}
          />
        </div>

        <div className="mt-3 text-right text-sm text-white/60">
          {networkLoad.toFixed(0)}% utilization
        </div>
      </div>
    </div>
  );
}