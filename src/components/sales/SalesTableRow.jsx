import { Calendar, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { isCashPayment, isTransferRecord } from './salesLogic';

// One sales record row in the sales table.
export default function SalesTableRow({ record, onEdit, onDelete }) {
  const isRecTransfer = isTransferRecord(record);
  const isCash = isCashPayment(record);

  const handleDelete = () => {
    if (!record?.id) {
      toast.error('Cannot delete: Record ID is missing');
      return;
    }
    if (window.confirm('Delete this sales record from the database?')) {
      onDelete(record.id);
    }
  };

  return (
    <tr className="text-slate-300">
      <td className="font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-indigo-400/70" />
          {new Date(record.date).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </td>
      <td className="font-bold text-white">
        {isRecTransfer ? (
          <span className="badge-pill badge-rose">{record.salesType}</span>
        ) : (
          record.merchantName || '—'
        )}
      </td>
      <td className="font-bold text-emerald-400">
        ৳{Number(record.salesAmount || 0).toLocaleString()}
      </td>
      <td className="text-slate-300">
        {isRecTransfer ? (
          '—'
        ) : (
          <>
            <span className="font-semibold text-slate-200">
              ৳{Number(record.commissionAmount || 0).toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-500 ml-1 font-mono">
              ({record.commissionPercent}%)
            </span>
          </>
        )}
      </td>
      <td className="font-bold text-indigo-400">
        {isRecTransfer ? '—' : `৳${Number(record.merchantBill || 0).toLocaleString()}`}
      </td>
      <td className="text-slate-300">
        {isRecTransfer || !record.discountPercent ? (
          '—'
        ) : (
          <>
            ৳{Number(record.discountAmount || 0).toLocaleString()}
            <span className="text-[10px] text-slate-500 ml-1 font-mono">
              ({record.discountPercent}%)
            </span>
          </>
        )}
      </td>
      <td className="text-slate-300 font-medium">
        {isRecTransfer || !record.deliveryCharge
          ? '—'
          : `৳${Number(record.deliveryCharge).toLocaleString()}`}
      </td>

      <td>
        {isRecTransfer ? (
          '—'
        ) : isCash ? (
          <span className="badge-pill badge-emerald">Cash</span>
        ) : (
          <span className="badge-pill badge-indigo">{record.digitalPaymentMethod}</span>
        )}
      </td>
      <td className="font-bold">
        {isRecTransfer ? '—' : `৳${Number(record.paidByCustomer || 0).toLocaleString()}`}
      </td>
      <td className="text-center">
        <div className="flex items-center justify-center gap-1.5">
          <button
            onClick={() => onEdit(record)}
            title="Edit Row"
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/30 transition-all cursor-pointer"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleDelete}
            title="Delete Row"
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/30 transition-all cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
