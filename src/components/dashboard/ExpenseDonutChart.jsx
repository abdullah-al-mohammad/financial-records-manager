// Expense distribution donut chart with per-category legend.
export default function ExpenseDonutChart({ expensePieData, stats }) {
  // Render SVG Pie/Donut segment paths
  const renderDonutPaths = () => {
    let cumulativeAngle = 0;
    const radius = 60;
    const cx = 80;
    const cy = 80;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;
    const totalExpenses =
      stats.riderSalaries +
      stats.fixedExpenses +
      stats.otherExpenses +
      (stats.discountExpenses || 0);

    return expensePieData.map((item, index) => {
      const angle = (item.value / totalExpenses) * 360;
      const strokeDashArray = `${(item.value / totalExpenses) * circumference} ${circumference}`;
      const strokeDashOffset = -(cumulativeAngle / 360) * circumference;
      cumulativeAngle += angle;

      return (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDashArray}
          strokeDashoffset={strokeDashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-500 hover:opacity-80 cursor-pointer"
          title={`${item.name}: ${item.percentage.toFixed(1)}%`}
        />
      );
    });
  };

  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
        Expense Distribution
      </h3>
      {expensePieData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-500">
          No expenses recorded yet.
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center">
          <svg className="w-40 h-40" viewBox="0 0 160 160">
            {renderDonutPaths()}
            <circle cx="80" cy="80" r="46" fill="#0b101e" />
            <text x="80" y="77" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">
              TOTAL
            </text>
            <text x="80" y="93" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
              ৳
              {(stats.riderSalaries + stats.fixedExpenses + stats.otherExpenses).toLocaleString()}
            </text>
          </svg>

          <div className="mt-6 w-full space-y-2 text-xs">
            {expensePieData.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-400 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-white">
                  ৳{item.value.toLocaleString()} ({item.percentage.toFixed(0)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
