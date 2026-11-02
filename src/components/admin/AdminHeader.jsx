import { Shield } from 'lucide-react';

// Admin page title plus the refresh-logs action.
export default function AdminHeader({ isRefreshing, onRefresh }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-500" />
          Administrative Settings
        </h1>
        <p className="text-xs text-slate-400 mt-1">
          Manage user accounts, roles, access status, and view security audit logs
        </p>
      </div>

      {/* Reload button */}
      <button
        onClick={onRefresh}
        disabled={isRefreshing}
        className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer disabled:opacity-60"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Logs'}
      </button>
    </div>
  );
}
