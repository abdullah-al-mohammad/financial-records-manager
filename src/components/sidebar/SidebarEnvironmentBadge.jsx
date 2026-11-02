import { Database, ShieldAlert } from 'lucide-react';

// Live-sync vs demo-mode status badge.
export default function SidebarEnvironmentBadge({ user }) {
  return (
    <div className="p-2.5 glass-panel rounded-xl flex items-center justify-between">
      <div className="flex items-center gap-2">
        {user?.isLive ? (
          <>
            <Database className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
              Live Sync
            </span>
          </>
        ) : (
          <>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
              Demo Mode
            </span>
          </>
        )}
      </div>
      <span className={`w-2 h-2 rounded-full animate-pulse shadow-sm ${user?.isLive ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-amber-500 shadow-amber-500/50'}`} />
    </div>
  );
}
