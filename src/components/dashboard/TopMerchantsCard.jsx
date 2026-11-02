// Top merchants ranked by sales volume.
export default function TopMerchantsCard({ topMerchants, stats }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Top Merchants by Volume
      </h3>
      {topMerchants.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">No merchants registered yet.</div>
      ) : (
        <div className="space-y-4">
          {topMerchants.map((m, idx) => {
            const percentage = stats.sales > 0 ? (m.sales / stats.sales) * 100 : 0;
            return (
              <div key={m.name} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-500">#{idx + 1}</span>
                    <span className="font-semibold text-slate-200">{m.name}</span>
                  </div>
                  <span className="font-bold text-indigo-400">৳{m.sales.toLocaleString()}</span>
                </div>
                <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-linear-to-r from-indigo-500 to-violet-600 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
