import { Edit2, Trash2 } from 'lucide-react';

// A single other-cash record row.
export default function OtherCashRow({ record, onEdit, onDelete }) {
  return (
    <tr>
      <td className="font-mono text-xs">{record.date}</td>
      <td className="font-semibold text-white">{record.source}</td>
      <td>
        <span className={`badge-pill text-[10px] ${record.type === 'Income' ? 'badge-emerald' : 'badge-rose'}`}>
          {record.type}
        </span>
      </td>
      <td className={`font-bold font-mono ${record.type === 'Income' ? 'text-emerald-400' : 'text-rose-400'}`}>
        ৳{parseFloat(record.amount || 0).toLocaleString()}
      </td>
      <td className="text-slate-400 text-xs">{record.description || '—'}</td>
      <td>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(record)}
            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 hover:bg-indigo-500/20 transition-colors cursor-pointer"
            title="Edit"
          >
            <Edit2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onDelete(record.id)}
            className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 transition-colors cursor-pointer"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </td>
    </tr>
  );
}
