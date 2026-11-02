import { Calendar, Edit2, Trash2 } from 'lucide-react';
import ExpenseCategoryBadge from './ExpenseCategoryBadge';

// One itemized expense line inside the expense sheet.
export default function ExpenseTableRow({ item, onEdit, onDelete }) {
  return (
    <tr className="hover:bg-slate-900/10 transition-all text-slate-300">
      <td className="p-4 whitespace-nowrap font-medium text-slate-400">
        <span className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-600" />
          {new Date(item.date).toLocaleString([], {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
        </span>
      </td>
      <td className="p-4 whitespace-nowrap">
        <ExpenseCategoryBadge category={item.category} />
      </td>
      <td className="p-4 font-semibold text-white">{item.name}</td>
      <td className="p-4 text-slate-400">{item.merchantName || 'General Overhead'}</td>
      <td className="p-4 font-bold text-rose-400">৳{item.amount.toLocaleString()}</td>
      <td className="p-4 text-center">
        <div className="flex items-center justify-center gap-1.5">
          {item.field !== 'discount' && (
            <button
              type="button"
              onClick={() => onEdit(item.originalRecord)}
              className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              title="Edit Expense"
            >
              <Edit2 className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDelete(item)}
            className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
            title="Delete Expense"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </td>
    </tr>
  );
}
