import { Edit2, Shield, Trash2 } from 'lucide-react';

// A single user account card with role, status and actions.
export default function UserCard({ user, isSelf, onEdit, onDelete }) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
          {user.username}
          {isSelf && (
            <span className="text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">
              You
            </span>
          )}
        </span>
        <span
          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
            user.status === 'Active'
              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
              : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
          }`}
        >
          {user.status}
        </span>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
        <Shield className="w-4 h-4 text-indigo-400" />
        Role privilege: <span className="text-white font-bold">{user.role}</span>
      </div>

      <div className="pt-3 border-t border-slate-900/60 flex items-center justify-end gap-1.5">
        <button
          onClick={() => onEdit(user)}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
        >
          <Edit2 className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onDelete(user.username)}
          disabled={isSelf}
          className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-500 hover:text-rose-400 disabled:hover:text-slate-500 transition-all disabled:opacity-30 cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
