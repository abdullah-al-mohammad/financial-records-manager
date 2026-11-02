// Month-over-month sales vs expenses column chart.
export default function MomChart({ momData, maxMoMVal }) {
  return (
    <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">
        Sales vs Expenses MoM Volume
      </h3>
      {momData.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-xs text-slate-500">
          No historical data available. Create records to view chart.
        </div>
      ) : (
        <div className="w-full overflow-hidden">
          <svg className="w-full h-64" viewBox="0 0 500 240">
            {/* Horizontal grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
              const y = 20 + p * 160;
              const val = Math.round(maxMoMVal * (1 - p));
              return (
                <g key={idx} className="opacity-30">
                  <line
                    x1="45"
                    y1={y}
                    x2="480"
                    y2={y}
                    stroke="#334155"
                    strokeWidth="0.5"
                    strokeDasharray="3 3"
                  />
                  <text
                    x="35"
                    y={y + 4}
                    textAnchor="end"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="500"
                  >
                    {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
                  </text>
                </g>
              );
            })}

            {/* Draw Columns */}
            {momData.map((d, idx) => {
              const step = 430 / momData.length;
              const xBase = 55 + idx * step;

              const salesHeight = (d.sales / maxMoMVal) * 160;
              const salesY = 180 - salesHeight;

              const expensesHeight = (d.expenses / maxMoMVal) * 160;
              const expensesY = 180 - expensesHeight;

              return (
                <g key={idx}>
                  {/* Sales Column (Indigo) */}
                  <rect
                    x={xBase + 10}
                    y={salesY}
                    width="18"
                    height={Math.max(salesHeight, 2)}
                    rx="3"
                    fill="url(#indigoGrad)"
                    className="transition-all duration-300 hover:opacity-90"
                  />
                  {/* Expenses Column (Rose) */}
                  <rect
                    x={xBase + 32}
                    y={expensesY}
                    width="18"
                    height={Math.max(expensesHeight, 2)}
                    rx="3"
                    fill="url(#roseGrad)"
                    className="transition-all duration-300 hover:opacity-90"
                  />
                  {/* X Label */}
                  <text
                    x={xBase + 30}
                    y="205"
                    textAnchor="middle"
                    fill="#94a3b8"
                    fontSize="9"
                    fontWeight="600"
                  >
                    {d.month}
                  </text>
                </g>
              );
            })}

            {/* Legend */}
            <g transform="translate(180, 225)" fontSize="9" fontWeight="600">
              <circle cx="10" cy="5" r="4" fill="#6366f1" />
              <text x="20" y="8" fill="#94a3b8">
                Sales Volume
              </text>

              <circle cx="95" cy="5" r="4" fill="#f43f5e" />
              <text x="105" y="8" fill="#94a3b8">
                Expenses
              </text>
            </g>

            {/* SVG Gradients */}
            <defs>
              <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#4f46e5" />
              </linearGradient>
              <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#e11d48" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      )}
    </div>
  );
}
