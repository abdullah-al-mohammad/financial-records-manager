import { Monitor, Moon, Sun } from 'lucide-react';

const THEME_OPTIONS = [
  { value: 'light', label: 'Light', title: 'Light Mode', icon: Sun },
  { value: 'dark', label: 'Dark', title: 'Dark Mode', icon: Moon },
  { value: 'auto', label: 'Auto', title: 'Auto Detect', icon: Monitor },
];

// Interface style selector (light / dark / auto).
export default function ThemeSelector({ theme, onChangeTheme }) {
  return (
    <div className="p-2.5 glass-panel rounded-xl space-y-2">
      <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
        Interface Style
      </span>
      <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
        {THEME_OPTIONS.map(({ value, label, title, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => onChangeTheme(value)}
            title={title}
            className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all cursor-pointer ${
              theme === value
                ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span className="text-[8px] font-bold mt-0.5">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
