import {
  ArrowDownLeft,
  Building2,
  CheckCircle2,
  Clock,
  Edit2,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { formatDisplayDate } from '../../utils/dates';
import { ACCOUNT_LABELS } from './accountConfig';

// A single receivable row with its receive/revert/edit/delete actions.
export default function ReceivableTableRow({ rec, onReceive, onRevert, onEdit, onDelete }) {
  const isReceived = rec.status === 'Received';
  const accConfig = ACCOUNT_LABELS[rec.receivedAccount || 'cash'] || ACCOUNT_LABELS.cash;

  return (
    <tr className="text-slate-300 group">
      {/* Person / Business Name */}
      <td>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-300 group-hover:border-indigo-500/40 transition-colors">
            <Building2 className="w-4 h-4 text-indigo-400" />
          </div>
          <div>
            <span className="font-bold text-white block text-xs">{rec.name}</span>
            {isReceived && rec.receivedDate && (
              <span className="text-[10px] text-slate-500 block">
                Received on {formatDisplayDate(rec.receivedDate)}
              </span>
            )}
          </div>
        </div>
      </td>

      {/* Amount */}
      <td className="font-bold text-sm">
        <span className={isReceived ? 'text-emerald-400' : 'text-amber-400'}>
          ৳{parseFloat(rec.amount || 0).toLocaleString()}
        </span>
      </td>

      {/* Date */}
      <td className="text-slate-400 font-medium">{formatDisplayDate(rec.date)}</td>

      {/* Note */}
      <td className="max-w-xs truncate text-slate-400">
        {rec.note || <span className="text-slate-600">—</span>}
      </td>

      {/* Payment Status */}
      <td>
        {isReceived ? (
          <span className="badge-pill badge-emerald">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Received</span>
            <span className="text-[10px] opacity-80 font-normal">({accConfig.label})</span>
          </span>
        ) : (
          <span className="badge-pill badge-amber">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            <span>Not Received</span>
          </span>
        )}
      </td>

      {/* Actions */}
      <td className="text-right">
        <div className="flex items-center justify-end gap-1.5">
          {/* Receive Button (Only if Not Received) */}
          {!isReceived ? (
            <button
              type="button"
              onClick={() => onReceive(rec)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl btn-emerald-gradient text-white font-semibold text-xs shadow-md active:scale-95 transition-all cursor-pointer"
              title="Receive money and deposit to cash balance"
            >
              <ArrowDownLeft className="w-3.5 h-3.5" />
              <span>Receive</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onRevert(rec)}
              className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/20 transition-all cursor-pointer"
              title="Revert status to Not Received"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(rec)}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-indigo-300 hover:bg-indigo-500/10 hover:border-indigo-500/20 transition-all cursor-pointer"
            title="Edit record"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(rec)}
            className="p-2 rounded-xl border border-slate-800 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
            title="Delete record"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
