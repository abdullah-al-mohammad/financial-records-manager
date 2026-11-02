// Users / security logs tab switcher.
export default function AdminTabs({ activeSubTab, onTabChange, userCount, logCount }) {
  return (
    <div className="flex border-b border-slate-900 gap-6">
      <button
        onClick={() => onTabChange('users')}
        className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
          activeSubTab === 'users'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-slate-500 hover:text-slate-300'
        }`}
      >
        User Accounts ({userCount})
      </button>
      <button
        onClick={() => onTabChange('logs')}
        className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
          activeSubTab === 'logs'
            ? 'border-indigo-500 text-white'
            : 'border-transparent text-slate-500 hover:text-slate-300'
        }`}
      >
        Security Audit Logs ({logCount})
      </button>
    </div>
  );
}
