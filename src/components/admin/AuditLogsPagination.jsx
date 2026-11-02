import { ChevronLeft, ChevronRight } from 'lucide-react';

// Footer pager for the audit log table.
export default function AuditLogsPagination({
  logPage,
  totalLogPages,
  totalEntries,
  onPrevPage,
  onNextPage,
}) {
  return (
    <div className="p-4 bg-slate-900/20 border-t border-slate-900 flex items-center justify-between">
      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
        Page {logPage} of {totalLogPages} ({totalEntries} entries)
      </span>

      <div className="flex items-center gap-1.5">
        <button
          onClick={onPrevPage}
          disabled={logPage === 1}
          className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <button
          onClick={onNextPage}
          disabled={logPage === totalLogPages}
          className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
