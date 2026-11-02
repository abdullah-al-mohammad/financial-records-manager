// System-wide financial overview table (gross sales, commission, bills, etc.).
export default function DashboardOverviewTable({ stats }) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div className="p-4.5 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-indigo-500" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
            System Financial Overview
          </h2>
        </div>
        <span className="badge-pill badge-indigo">Live Summary</span>
      </div>
      <div className="overflow-x-auto">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Gross Sales</th>
              <th>Commission</th>
              <th>Merchant Bills</th>
              <th>Deliv. Charges</th>
              <th>Customer Paid</th>
              <th>Total Expenses</th>
            </tr>
          </thead>
          <tbody>
            <tr className="text-center">
              <td className="font-bold text-white text-sm">
                ৳{Math.round(stats.sales).toLocaleString()}
              </td>
              <td className="font-bold text-indigo-400 text-sm">
                ৳{Math.round(stats.commission).toLocaleString()}
              </td>
              <td className="font-bold text-rose-400 text-sm">
                ৳{Math.round(stats.merchantBills).toLocaleString()}
              </td>
              <td className="font-bold text-cyan-400 text-sm">
                ৳{Math.round(stats.delivery).toLocaleString()}
              </td>
              <td className="font-bold text-emerald-300 text-sm">
                ৳{Math.round(stats.customerPaid).toLocaleString()}
              </td>
              <td className="font-bold text-rose-400 text-sm">
                ৳{Math.round(stats.expenses).toLocaleString()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
