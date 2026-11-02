import { useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckCircle2, FileDown, Upload, UploadCloud } from 'lucide-react';
import Modal from '../shared/Modal';
import { buildSalesCsv, csvFileName, downloadCsv, parseSalesCsv } from '../../utils/csvUtils';

const PREVIEW_LIMIT = 5;

const EMPTY_RESULT = { records: [], errors: [], duplicates: [], totalRows: 0 };

// CSV import wizard for sales records: pick a file, preview the parsed rows and
// confirm before anything is written to the ledger.
export default function SalesCsvImportModal({
  open,
  onClose,
  existingRecords = [],
  onImport,
}) {
  const fileInputRef = useRef(null);
  const [fileName, setFileName] = useState('');
  const [result, setResult] = useState(EMPTY_RESULT);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fileError, setFileError] = useState('');

  // Start each opening with a clean slate so a previous file can't be re-imported
  // by accident.
  useEffect(() => {
    if (!open) return;
    setFileName('');
    setResult(EMPTY_RESULT);
    setFileError('');
    setIsSubmitting(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [open]);

  const handleFileChange = async event => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setFileError('');

    try {
      const text = await file.text();
      setResult(parseSalesCsv(text, { existingRecords }));
    } catch (err) {
      setResult(EMPTY_RESULT);
      setFileError(err?.message || 'Could not read that file.');
    }
  };

  const handleDownloadTemplate = () => {
    downloadCsv(csvFileName('sales-import-template'), buildSalesCsv([]));
  };

  const handleConfirm = async () => {
    if (!result.records.length || isSubmitting) return;
    if (typeof onImport !== 'function') return;
    setIsSubmitting(true);
    try {
      const success = await onImport(result.records);
      if (success !== false) onClose();
    } finally {
      setIsSubmitting(false);
    }
  };

  const previewRows = result.records.slice(0, PREVIEW_LIMIT);
  const hasParsedFile = result.totalRows > 0 || result.errors.length > 0;
  const canImport = result.records.length > 0 && !isSubmitting;

  return (
    <Modal
      open={open}
      onClose={onClose}
      icon={UploadCloud}
      iconClassName="p-2 rounded-xl bg-emerald-500/10 text-emerald-400"
      title="Import Sales CSV"
      subtitle="Upload a spreadsheet export to add records in bulk"
      panelClassName="glass-panel border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl bg-slate-950"
    >
      <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
        {/* File picker */}
        <div className="space-y-2">
          <label className="text-[11px] font-medium text-slate-300 block">CSV File</label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <label className="flex-1 flex items-center gap-2 bg-slate-950 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-xl px-3 py-2.5 cursor-pointer transition-all">
              <Upload className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs text-slate-400 truncate">
                {fileName || 'Choose a .csv file…'}
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
            <button
              type="button"
              onClick={handleDownloadTemplate}
              className="flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border border-slate-800/80 text-slate-400 hover:text-emerald-300 hover:border-emerald-500/30 hover:bg-emerald-500/10 transition-all cursor-pointer"
            >
              <FileDown className="w-3.5 h-3.5 text-emerald-400" />
              Template
            </button>
          </div>
          <p className="text-[10px] text-slate-500">
            Required columns: Date, Merchant, Sales Amount. Commission, delivery and totals are
            calculated automatically when omitted.
          </p>
        </div>

        {fileError && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{fileError}</span>
          </div>
        )}

        {/* Summary */}
        {hasParsedFile && (
          <div className="grid grid-cols-3 gap-2.5">
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Ready
              </div>
              <div className="text-lg font-bold text-emerald-400">{result.records.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Duplicates
              </div>
              <div className="text-lg font-bold text-amber-400">{result.duplicates.length}</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
              <div className="text-[10px] uppercase tracking-wider text-slate-500 font-bold">
                Errors
              </div>
              <div className="text-lg font-bold text-rose-400">{result.errors.length}</div>
            </div>
          </div>
        )}

        {/* Preview */}
        {previewRows.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-medium text-slate-300">Preview</span>
              {result.records.length > PREVIEW_LIMIT && (
                <span className="text-[10px] text-slate-500">
                  Showing first {PREVIEW_LIMIT} of {result.records.length}
                </span>
              )}
            </div>
            <div className="overflow-x-auto rounded-xl border border-slate-800">
              <table className="w-full text-left text-[11px]">
                <thead className="bg-slate-900/70 text-slate-400 uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="px-3 py-2 font-bold">Date</th>
                    <th className="px-3 py-2 font-bold">Merchant</th>
                    <th className="px-3 py-2 font-bold text-right">Sales</th>
                    <th className="px-3 py-2 font-bold text-right">Commission</th>
                    <th className="px-3 py-2 font-bold text-right">Merchant Bill</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-slate-300">
                  {previewRows.map(record => (
                    <tr key={record.id} className="hover:bg-slate-900/40">
                      <td className="px-3 py-2 whitespace-nowrap">{record.date?.slice(0, 10)}</td>
                      <td className="px-3 py-2 max-w-[140px] truncate">{record.merchantName}</td>
                      <td className="px-3 py-2 text-right">৳{record.salesAmount}</td>
                      <td className="px-3 py-2 text-right">৳{record.commissionAmount}</td>
                      <td className="px-3 py-2 text-right">৳{record.merchantBill}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Row-level errors */}
        {result.errors.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-rose-300">
              {result.errors.length} row{result.errors.length === 1 ? '' : 's'} will be skipped
            </span>
            <ul className="max-h-28 overflow-y-auto space-y-1 rounded-xl bg-rose-500/5 border border-rose-500/15 p-3">
              {result.errors.map(error => (
                <li key={`err-${error.row}`} className="text-[11px] text-rose-300/90">
                  Row {error.row}: {error.message}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Duplicate notice */}
        {result.duplicates.length > 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px]">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>
              {result.duplicates.length} row{result.duplicates.length === 1 ? '' : 's'} already
              exist or repeat in this file and will be skipped.
            </span>
          </div>
        )}

        {hasParsedFile && result.records.length === 0 && (
          <div className="flex items-start gap-2 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-slate-400 text-[11px]">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-slate-500" />
            <span>Nothing new to import from this file.</span>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-900">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold transition-all cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!canImport}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-emerald-600/20 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting
              ? 'Importing…'
              : result.records.length
                ? `Import ${result.records.length} Record${result.records.length === 1 ? '' : 's'}`
                : 'Import Records'}
          </button>
        </div>
      </div>
    </Modal>
  );
}
