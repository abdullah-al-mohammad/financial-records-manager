import { X } from 'lucide-react';

const DEFAULT_CLOSE_BUTTON_CLASS =
  'p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer';

// Reusable right-side slide-over panel.
// Pass `onSubmit` to wrap the body in a form (scrollable area) or omit it for
// a plain body. Class-name props let each section keep its existing styling.
export default function Drawer({
  open,
  onClose,
  title,
  subtitle,
  children,
  footer,
  onSubmit,
  formId,
  widthClassName = 'max-w-lg',
  overlayClassName = '',
  panelClassName = 'bg-(--drawer-bg)',
  contentClassName = 'flex-col',
  bodyClassName = 'flex-1 overflow-y-auto p-6 space-y-6',
  bodyStyle,
  closeButtonClassName = DEFAULT_CLOSE_BUTTON_CLASS,
}) {
  if (!open) return null;

  const body = onSubmit ? (
    <form id={formId} onSubmit={onSubmit} className={bodyClassName} style={bodyStyle}>
      {children}
    </form>
  ) : (
    <div className={bodyClassName} style={bodyStyle}>
      {children}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      <div
        onClick={onClose}
        className={`absolute inset-0 bg-black/60 backdrop-blur-sm ${overlayClassName}`}
      />
      <div
        className={`relative w-full ${widthClassName} border-l border-slate-900 h-full shadow-2xl flex z-10 ${contentClassName} ${panelClassName}`}
      >
        <div className="p-5 border-b border-slate-900 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">{title}</h2>
            {subtitle && <p className="text-[10px] text-slate-400 mt-0.5">{subtitle}</p>}
          </div>
          <button type="button" onClick={onClose} className={closeButtonClassName}>
            <X className="w-4 h-4" />
          </button>
        </div>

        {body}

        {footer && (
          <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-end gap-2.5">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
