import SalesTableRow from './SalesTableRow';

// Sales records table.
export default function SalesTable({ records, onEdit, onDelete }) {
  return (
    <div className="glass-panel border border-slate-800/80 rounded-2xl overflow-hidden shadow-2xl">
      <div className="overflow-x-auto">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Merchant</th>
              <th>Sales Amt</th>
              <th>Com. Amt</th>
              <th>Bill Amount</th>
              <th>Discount</th>
              <th>Delivery</th>
              <th>Payment Method</th>
              <th>Paid by Cust</th>
              <th className="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {records.length === 0 ? (
              <tr>
                <td colSpan="10" className="p-10 text-center text-slate-500 font-medium">
                  No transactions found matching the parameters.
                </td>
              </tr>
            ) : (
              records.map(record => (
                <SalesTableRow
                  key={record.id}
                  record={record}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
