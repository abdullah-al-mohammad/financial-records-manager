// Preview of the four most recently added sales records.
export default function RecentRecordsCard({ records }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Recent Records Added
      </h3>
      {records.length === 0 ? (
        <div className="py-6 text-center text-xs text-slate-500">No recent entries found.</div>
      ) : (
        <div className="divide-y divide-slate-900/60 max-h-48 overflow-y-auto pr-1">
          {records
            .slice(-4)
            .reverse()
            .map((r, i) => (
              <div
                key={r.id || i}
                className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0"
              >
                <div>
                  <span className="font-bold text-slate-200 block">
                    {r.merchantName || 'Generic Transaction'}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {new Date(r.date).toLocaleString([], {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}{' '}
                    — {r.salesType}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-emerald-400 block">
                    ৳{Number(r.salesAmount || 0).toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Com. ৳{Number(r.commissionAmount || 0).toLocaleString()}
                  </span>
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
