// Horizontal bar comparison of the four expense categories.
export default function ExpenseCategoryChart({ stats, maxBarVal }) {
  const categories = [
    { name: 'Rider Salary', value: stats.riders, color: 'bg-rose-500' },
    { name: 'Fixed Costs', value: stats.fixed, color: 'bg-amber-500' },
    { name: 'Other Expenses', value: stats.variable, color: 'bg-violet-500' },
    { name: 'Sales Discounts', value: stats.discounts || 0, color: 'bg-emerald-500' },
  ];

  return (
    <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
        Category Cost Comparisons
      </h3>
      {stats.total === 0 ? (
        <div className="h-44 flex items-center justify-center text-xs text-slate-500">
          No expense cost data available.
        </div>
      ) : (
        <div className="space-y-4">
          {categories.filter(cat => cat.value > 0).map((cat, idx) => {
            const percent = (cat.value / maxBarVal) * 100;
            return (
              <div key={idx} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300">{cat.name}</span>
                  <span className="font-bold text-white">৳{cat.value.toLocaleString()}</span>
                </div>
                <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                  <div
                    className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                    style={{ width: `${percent}%` }}
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
