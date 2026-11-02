import ExpenseTableRow from './ExpenseTableRow';

// Itemized expense ledger table.
export default function ExpenseTable({ items, onEdit, onDelete }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
      <div className="p-4 bg-slate-900/40 border-b border-slate-900">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Expense Sheet</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
              <th className="p-4 whitespace-nowrap">Date</th>
              <th className="p-4">Category</th>
              <th className="p-4">Description</th>
              <th className="p-4">Linked Merchant</th>
              <th className="p-4">Amount</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-900/40">
            {items.length === 0 ? (
              <tr>
                <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                  No expenses recorded yet. Click &quot;New Expense&quot; to add one.
                </td>
              </tr>
            ) : (
              items.map(item => (
                <ExpenseTableRow key={item.id} item={item} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
