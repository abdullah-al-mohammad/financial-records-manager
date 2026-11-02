import OtherCashRow from './OtherCashRow';

// Other-cash records table with empty state.
export default function OtherCashTable({ records, onEdit, onDelete }) {
  return (
    <div className="glass-panel border border-slate-800 rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Source</th>
              <th>Type</th>
              <th>Amount</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center text-slate-500 py-8">
                  No other cash records found. Click "Add Other Cash" to create one.
                </td>
              </tr>
            ) : (
              records.map(rec => (
                <OtherCashRow key={rec.id} record={rec} onEdit={onEdit} onDelete={onDelete} />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
