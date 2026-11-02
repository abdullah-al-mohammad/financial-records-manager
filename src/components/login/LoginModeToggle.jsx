import { Database, Play } from 'lucide-react';

// Demo sandbox vs Google Sheets mode toggle.
export default function LoginModeToggle({ live, onChangeMode }) {
  return (
    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 border border-slate-800 rounded-xl mb-6">
      <button
        type="button"
        onClick={() => onChangeMode(false)}
        className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          !live
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Play className="w-3.5 h-3.5" />
        Demo Sandbox
      </button>
      <button
        type="button"
        onClick={() => onChangeMode(true)}
        className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
          live
            ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
            : 'text-slate-400 hover:text-slate-200'
        }`}
      >
        <Database className="w-3.5 h-3.5" />
        Google Sheets
      </button>
    </div>
  );
}
