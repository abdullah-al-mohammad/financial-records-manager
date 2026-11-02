import {
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';
import { ACCOUNT_LABELS } from './accountConfig';

// A single payable row with its pay/revert/edit/delete actions.
export default function PayableTableRow({ pay, onPay, onRevert, onEdit, onDelete }) {
  const isPaid = pay.status === 'Paid';
  const accConfig = ACCOUNT_LABELS[pay.paidAccount || 'cash'] || ACCOUNT_LABELS.cash;

  return (
    <tr className="text-slate-300 group">
      {/* Supplier / Person Name */}
      <td>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center group-hover:border-rose-500/40 transition-colors">
            <Building2 className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <span className="font-bold text-white block text-xs">{pay.name}</span>
            {/* Paid হলে কোন তারিখে pay করা হয়েছে তা দেখানো */}
            {isPaid && pay.paidDate && (
              <span className="text-[10px] text-slate-500 block">
                Paid on {formatDisplayDate(pay.paidDate)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Amount: paid হলে emerald (সবুজ), unpaid হলে rose (লাল) */}
      <td className="font-bold text-sm">
        <span className={isPaid ? 'text-emerald-400' : 'text-rose-400'}>
          ৳{parseFloat(pay.amount || 0).toLocaleString()}
        </span>
      </td>

      {/* Date */}
      <td className="text-slate-400 font-medium">{formatDisplayDate(pay.date)}</td>

      {/* Note */}
      <td className="max-w-xs truncate text-slate-400">
        {pay.note || <span className="text-slate-600">—</span>}
      </td>

      {/* Payment Status Badge */}
      <td>
        {isPaid ? (
          <span className="badge-pill badge-emerald">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Paid</span>
            <span className="text-[10px] opacity-80 font-normal">({accConfig.label})</span>
          </span>
        ) : (
          <span className="badge-pill badge-rose">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Unpaid</span>
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* PAID BUTTON: শুধু Unpaid record-এ দেখাবে */}
          {!isPaid ? (
            <button
              type="button"
              id={`btn-pay-${pay.id}`}
              onClick={() => onPay(pay)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-rose-gradient text-white font-semibold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              title="Mark as paid and deduct from cash balance"
            >
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>Pay Now</span>
            </button>
          ) : (
            // Paid হলে revert বাটন দেখাবে
            <button
              type="button"
              onClick={() => onRevert(pay)}
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
              title="Revert status to Unpaid"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(pay)}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
            title="Edit payable record"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(pay)}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
            title="Delete payable record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
