import { Calendar } from 'lucide-react';
import { formatTimestamp } from './adminLogic';

// Audit trail table body (inside the scroll container).
export default function AuditLogsTable({ rows }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
            <th className="p-3.5 whitespace-nowrap">Timestamp</th>
            <th className="p-3.5">User</th>
            <th className="p-3.5">Action</th>
            <th className="p-3.5">Log Details</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-900/40 font-mono text-[11px] text-slate-400">
          {rows.length === 0 ? (
            <tr>
              <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                No audit records matched your query.
              </td>
            </tr>
          ) : (
            rows.map(log => (
              <tr key={log.id} className="hover:bg-slate-900/10 transition-all">
                <td className="p-3.5 whitespace-nowrap text-slate-500">
                  <span className="flex items-center gap-1.5 font-sans">
                    <Calendar className="w-3.5 h-3.5 text-slate-500" />
                    {formatTimestamp(log.timestamp)}
                  </span>
                </td>
                <td className="p-3.5 font-bold text-slate-200 font-sans">{log.username}</td>
                <td className="p-3.5 whitespace-nowrap font-semibold">
                  <span
                    className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                      log.action?.includes('Create')
                        ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                        : log.action?.includes('Delete')
                          ? 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                          : log.action?.includes('Login Failed') ||
                              log.action?.includes('Blocked')
                            ? 'bg-amber-500/5 border-amber-500/10 text-amber-400 animate-pulse'
                            : 'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'
                    }`}
                  >
                    {log.action}
                  </span>
                </td>
                <td
                  className="p-3.5 max-w-sm truncate text-slate-400 font-sans"
                  title={log.details}
                >
                  {log.details}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
