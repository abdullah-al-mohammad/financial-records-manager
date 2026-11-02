import { ACCOUNT_OPTIONS } from './accountConfig';

const SELECTED_STYLES = {
  rose: {
    card: 'bg-rose-600/15 border-rose-500 text-white shadow-sm',
    dot: 'bg-rose-500',
  },
  indigo: {
    card: 'bg-indigo-600/15 border-indigo-500 text-white shadow-sm',
    dot: 'bg-indigo-500',
  },
};

// Three-way cash account picker used by the receive/pay modals.
export default function AccountSelector({ value, onChange, variant = 'indigo' }) {
  const selected = SELECTED_STYLES[variant] || SELECTED_STYLES.indigo;

  return (
    <div className="grid grid-cols-3 gap-2">
      {ACCOUNT_OPTIONS.map(acc => {
        const Icon = acc.icon;
        const isSelected = value === acc.id;
        return (
          <button
            key={acc.id}
            type="button"
            onClick={() => onChange(acc.id)}
            className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
              isSelected
                ? selected.card
                : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <Icon className={`w-4 h-4 ${acc.color}`} />
              {isSelected && <span className={`w-2 h-2 rounded-full ${selected.dot}`} />}
            </div>
            <div className="mt-2">
              <span className="font-bold text-xs block leading-tight">{acc.label}</span>
              <span className="text-[9px] text-slate-500 block mt-0.5">{acc.desc}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
