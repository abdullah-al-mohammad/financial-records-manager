import { Coins, Plus } from 'lucide-react';
import PayableTableRow from './PayableTableRow';

// Payable ledger table with its empty state.
export default function PayableTable({
  records,
  paySearchQuery,
  payStatusFilter,
  payAccountFilter,
  onAdd,
  onPay,
  onRevert,
  onEdit,
  onDelete,
}) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {records.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Coins className="w-6 h-6 text-rose-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No payable records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {paySearchQuery || payStatusFilter !== 'all' || payAccountFilter !== 'all'
              ? 'Try adjusting your search or filter settings.'
              : 'Add a supplier or individual you owe money to.'}
          </p>
          {!paySearchQuery && payStatusFilter === 'all' && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 btn-rose-gradient text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Payable
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Supplier / Person</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Note</th>
                <th>Payment Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(pay => (
                <PayableTableRow
                  key={pay.id}
                  pay={pay}
                  onPay={onPay}
                  onRevert={onRevert}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
