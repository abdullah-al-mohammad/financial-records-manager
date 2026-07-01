// OverheadExpenses component - expense form fields used in the dedicated Expense section
const OverheadExpenses = ({ form, handleChange }) => {
  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <label className="text-[11px] font-medium text-slate-400">Payment Source</label>
        <select
          name="paymentSource"
          value={form.paymentSource || 'cash'}
          onChange={handleChange}
          className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
        >
          <option value="online">Online</option>
          <option value="cash">Cash</option>
        </select>
      </div>
      {/* Header is rendered in SalesManager */}
      {/* Rider Details */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Rider Name</label>
          <input
            type="text"
            name="riderName"
            value={form.riderName}
            onChange={handleChange}
            placeholder="e.g. Fahim"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Rider Wages (৳)</label>
          <input
            type="number"
            name="riderSalary"
            value={form.riderSalary}
            onChange={handleChange}
            placeholder="e.g. 500"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Variable Expenses */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Variable Expense Details</label>
          <input
            type="text"
            name="otherExpenseName"
            value={form.otherExpenseName}
            onChange={handleChange}
            placeholder="e.g. Fuel / Icepacks"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Variable Expense (৳)</label>
          <input
            type="number"
            name="otherExpense"
            value={form.otherExpense}
            onChange={handleChange}
            placeholder="e.g. 350"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Expense Description</label>
          <input
            type="text"
            name="expenseDescription"
            value={form.expenseDescription}
            onChange={handleChange}
            placeholder="e.g. Fuel Cost – 500 BDT (Yasin)"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
      </div>

      {/* Fixed Expenses */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Fixed Expense Type</label>
          <input
            type="text"
            name="fixedExpenseName"
            value={form.fixedExpenseName}
            onChange={handleChange}
            placeholder="e.g. Internet / Rent"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
        <div className="space-y-1">
          <label className="text-[11px] font-medium text-slate-400">Fixed Expense (৳)</label>
          <input
            type="number"
            name="fixedExpense"
            value={form.fixedExpense}
            onChange={handleChange}
            placeholder="e.g. 1200"
            className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-white outline-none"
          />
        </div>
      </div>
    </div>
  );
};

export default OverheadExpenses;
