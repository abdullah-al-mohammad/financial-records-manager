// Explanatory card shown next to the category chart.
export default function ExpenseRulesPanel({ itemizedCount }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
          Expense Entry Rules
        </h3>
        <p className="text-xs text-slate-500 leading-relaxed">
          Use the expense form to log rider salary, other expenses, and fixed costs in their own
          section. Expenses reduce your net cash balance along with merchant bill payouts.
        </p>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
        <span>Itemized expense lines:</span>
        <span className="font-bold text-white">{itemizedCount}</span>
      </div>
    </div>
  );
}
