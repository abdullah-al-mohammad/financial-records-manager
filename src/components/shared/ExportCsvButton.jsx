import { Download } from 'lucide-react';

// Small secondary action used by the ledger pages to download their current
// rows as a CSV file.
export default function ExportCsvButton({
  onClick,
  disabled = false,
  label = 'Export CSV',
  title = 'Download the current rows as a CSV file',
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border border-slate-800/80 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download className="w-3.5 h-3.5 text-emerald-400" />
      {label}
    </button>
  );
}
