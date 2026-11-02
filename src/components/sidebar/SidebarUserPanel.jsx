import { LogOut } from 'lucide-react';

// Signed-in user summary and logout button.
export default function SidebarUserPanel({ user, onLogout }) {
  return (
    <div className="flex items-center justify-between gap-3 px-1 pt-1">
      <div className="flex items-center gap-2.5 overflow-hidden">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0">
          {(user?.username || 'U').slice(0, 1).toUpperCase()}
        </div>
        <div className="overflow-hidden">
          <span className="font-bold text-xs text-white block truncate">{user?.username}</span>
          <span className="text-[10px] text-slate-400 block truncate">{user?.role} Account</span>
        </div>
      </div>
      <button
        onClick={() => {
          if (window.confirm('Are you sure you want to end your session?')) {
            onLogout();
          }
        }}
        title="Logout Session"
        className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
      >
        <LogOut className="w-4 h-4" />
      </button>
    </div>
  );
}
