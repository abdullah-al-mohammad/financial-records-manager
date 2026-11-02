import { X } from 'lucide-react';

const DEFAULT_PANEL_CLASS =
  'glass-panel border border-slate-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl bg-slate-950';
const DEFAULT_ICON_CLASS = 'p-2 rounded-xl bg-indigo-500/10 text-indigo-400';

// Reusable centered modal with an icon header. Section-specific components
// supply the panel/icon colours and the body (usually a form).
export default function Modal({
  open,
  onClose,
  icon: Icon,
  iconClassName = DEFAULT_ICON_CLASS,
  title,
  subtitle,
  panelClassName = DEFAULT_PANEL_CLASS,
  children,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div className={panelClassName}>
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={iconClassName}>{Icon ? <Icon className="w-4 h-4" /> : null}</div>
            <div>
              <h3 className="text-sm font-bold text-white">{title}</h3>
              <span className="text-[10px] text-slate-400">{subtitle}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
