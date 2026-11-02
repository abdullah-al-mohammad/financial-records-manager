import { HandCoins, Plus } from 'lucide-react';
import ReceivableTableRow from './ReceivableTableRow';

// Receivable ledger table with its empty state.
export default function ReceivableTable({
  records,
  searchQuery,
  statusFilter,
  accountFilter,
  onAdd,
  onReceive,
  onRevert,
  onEdit,
  onDelete,
}) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      {records.length === 0 ? (
        <div className="text-center py-16 px-4 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <HandCoins className="w-6 h-6 text-indigo-400" />
          </div>
          <h3 className="text-sm font-semibold text-slate-300">No receivable records found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery || statusFilter !== 'all' || accountFilter !== 'all'
              ? 'Try adjusting your search or filter settings.'
              : 'Start by adding a person or business from whom you expect to receive money.'}
          </p>
          {!searchQuery && statusFilter === 'all' && (
            <button
              type="button"
              onClick={onAdd}
              className="inline-flex items-center gap-1.5 px-4 py-2 btn-emerald-gradient text-white rounded-xl text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Receivable
            </button>
          )}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="modern-table">
            <thead>
              <tr>
                <th>Person / Business Name</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Note</th>
                <th>Payment Status</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {records.map(rec => (
                <ReceivableTableRow
                  key={rec.id}
                  rec={rec}
                  onReceive={onReceive}
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
