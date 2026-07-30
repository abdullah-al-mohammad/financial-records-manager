import { ArrowRightLeft, Calendar, FileSpreadsheet, History, Layers, Trash2 } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { getMonthFromDate } from '../utils/dates';

const MONTHS_ORDER = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export default function HistoryManager({ records, payments, transfers = [], onDeleteTransfer }) {
  const [selectedMonth, setSelectedMonth] = useState('');



  // Extract all unique months present in data
  const availableMonths = useMemo(() => {
    const months = new Set();
    records.forEach(r => {
      if (r.month) months.add(r.month);
      else if (r.date) {
        const monthName = getMonthFromDate(r.date);
        if (monthName) months.add(monthName);
      }
    });

    payments.forEach(p => {
      const monthName = getMonthFromDate(p.date);
      if (monthName) months.add(monthName);
    });

    transfers.forEach(t => {
      const monthName = getMonthFromDate(t.date);
      if (monthName) months.add(monthName);
    });

    return Array.from(months).sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b));
  }, [records, payments, transfers]);

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  // Compile monthly performance logs for all available months
  const monthlyMetricsSummary = useMemo(() => {
    const summaries = {};

    records.forEach(r => {
      const month = r.month || getMonthFromDate(r.date);
      if (!month) return;
      if (!summaries[month]) {
        summaries[month] = {
          month,
          sales: 0,
          billed: 0,
          commission: 0,
          delivery: 0,
          expenses: 0,
          income: 0,
          profit: 0,
        };
      }
      summaries[month].sales += parseFloat(r.salesAmount) || 0;
      summaries[month].commission += parseFloat(r.commissionAmount) || 0;
      summaries[month].delivery += parseFloat(r.deliveryCharge) || 0;
      summaries[month].billed += parseFloat(r.merchantBill) || 0;
      summaries[month].expenses +=
        (parseFloat(r.riderSalary) || 0) +
        (parseFloat(r.otherExpense) || 0) +
        (parseFloat(r.fixedExpense) || 0);
    });

    // Compute derived metrics and store them back
    Object.keys(summaries).forEach(m => {
      const s = summaries[m];
      s.income = s.commission + s.delivery;
      s.profit = s.income - s.expenses;
    });

    return Object.values(summaries).sort(
      (a, b) => MONTHS_ORDER.indexOf(a.month) - MONTHS_ORDER.indexOf(b.month)
    );
  }, [records]);

  // Data for selected month
  const targetMonthData = useMemo(() => {
    if (!selectedMonth) return null;

    const filteredRecords = records.filter(r => {
      if (r.month) return r.month === selectedMonth;
      if (!r.date) return false;
      return getMonthFromDate(r.date) === selectedMonth;
    });

    const filteredPayments = payments.filter(p => {
      if (!p.date) return false;
      return getMonthFromDate(p.date) === selectedMonth;
    });

    // Calculate metrics
    let sales = 0;
    let commission = 0;
    let delivery = 0;
    let riderSalary = 0;
    let otherExpense = 0;
    let fixedExpense = 0;

    filteredRecords.forEach(r => {
      sales += parseFloat(r.salesAmount) || 0;
      commission += parseFloat(r.commissionAmount) || 0;
      delivery += parseFloat(r.deliveryCharge) || 0;
      riderSalary += parseFloat(r.riderSalary) || 0;
      otherExpense += parseFloat(r.otherExpense) || 0;
      fixedExpense += parseFloat(r.fixedExpense) || 0;
    });

    const expenses = riderSalary + otherExpense + fixedExpense;
    const income = commission + delivery;
    const profit = income - expenses;

    const filteredTransfers = transfers.filter(t => {
      if (!t.date) return false;
      return getMonthFromDate(t.date) === selectedMonth;
    });

    return {
      records: filteredRecords,
      payments: filteredPayments,
      transfers: filteredTransfers,
      sales,
      commission,
      delivery,
      expenses,
      income,
      profit,
    };
  }, [records, payments, transfers, selectedMonth]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <History className="w-5 h-5 text-indigo-500" />
            History &amp; Archive Explorer
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Browse audit books and performance logs of completed cycles
          </p>
        </div>

        {/* Month Dropdown */}
        {availableMonths.length > 0 && (
          <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
            <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5" />
              Target Archive:
            </span>
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white font-bold outline-none focus:border-indigo-500"
            >
              {availableMonths.map(m => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {availableMonths.length === 0 ? (
        <div className="glass-panel border border-slate-900 rounded-2xl p-8 text-center text-slate-500">
          No records or payments have been logged yet. Check back once you have entered
          transactions.
        </div>
      ) : (
        <>
          {/* Target Month Metrics */}
          {targetMonthData && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="glass-panel border border-slate-900 rounded-2xl p-5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                  Month Sales Volume
                </span>
                <span className="text-xl font-extrabold text-white block mt-1">
                  ৳{targetMonthData.sales.toLocaleString()}
                </span>
              </div>

              <div className="glass-panel border border-slate-900 rounded-2xl p-5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                  Month Net Revenue
                </span>
                <span className="text-xl font-extrabold text-indigo-400 block mt-1">
                  ৳{targetMonthData.income.toLocaleString()}
                </span>
              </div>

              <div className="glass-panel border border-slate-900 rounded-2xl p-5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                  Month Cost Overheads
                </span>
                <span className="text-xl font-extrabold text-rose-400 block mt-1">
                  ৳{targetMonthData.expenses.toLocaleString()}
                </span>
              </div>

              <div className="glass-panel border border-slate-900 rounded-2xl p-5">
                <span className="text-[10px] font-bold text-slate-500 uppercase block tracking-wider">
                  Month Profit / Loss
                </span>
                <span
                  className={`text-xl font-extrabold block mt-1 ${targetMonthData.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                >
                  ৳{targetMonthData.profit.toLocaleString()}
                </span>
              </div>
            </div>
          )}

          {/* Month-over-Month Comparative Grid */}
          <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <Layers className="w-4 h-4 text-slate-500" />
              Month-over-Month Ledger Performance
            </h3>

            <div className="overflow-x-auto rounded-xl border border-slate-900/60">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950 text-slate-400 font-bold border-b border-slate-900">
                    <th className="p-3">Audit Cycle Month</th>
                    <th className="p-3">Sales Volume</th>
                    <th className="p-3">Net Revenue (Income)</th>
                    <th className="p-3">Overhead Expenses</th>
                    <th className="p-3">Net Margin</th>
                    <th className="p-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 text-slate-300">
                  {monthlyMetricsSummary.map(m => (
                    <tr
                      key={m.month}
                      className={`hover:bg-slate-900/10 cursor-pointer transition-all ${
                        selectedMonth === m.month ? 'bg-indigo-600/5 text-white font-medium' : ''
                      }`}
                      onClick={() => setSelectedMonth(m.month)}
                    >
                      <td className="p-3 font-bold">{m.month}</td>
                      <td className="p-3">৳{m.sales.toLocaleString()}</td>
                      <td className="p-3 text-indigo-400 font-semibold">
                        ৳{m.income.toLocaleString()}
                      </td>
                      <td className="p-3 text-rose-400/90">৳{m.expenses.toLocaleString()}</td>
                      <td
                        className={`p-3 font-bold ${m.profit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}
                      >
                        ৳{m.profit.toLocaleString()}
                      </td>
                      <td className="p-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase border ${
                            m.profit >= 0
                              ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/5 border-rose-500/10 text-rose-400'
                          }`}
                        >
                          {m.profit >= 0 ? 'Profit' : 'Loss'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Historical Logs List for Selected Month */}
          {targetMonthData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Sales Records Grid */}
              <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  {selectedMonth} Sales Records Archive
                </h3>

                <div className="max-h-80 overflow-y-auto border border-slate-900 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Merchant</th>
                        <th className="p-2.5">Sales</th>
                        <th className="p-2.5">Type</th>
                        <th className="p-2.5">Bill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-300">
                      {targetMonthData.records.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-slate-600">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        targetMonthData.records.map((r, i) => (
                          <tr key={r.id || i} className="hover:bg-slate-900/10">
                            <td className="p-2.5 text-slate-500">
                              {new Date(r.date).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-2.5 font-semibold">{r.merchantName}</td>
                            <td className="p-2.5 text-emerald-400">
                              ৳{Number(r.salesAmount || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-slate-500">{r.salesType}</td>
                            <td className="p-2.5 font-bold text-indigo-400">
                              ৳{Number(r.merchantBill || 0).toLocaleString()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments Grid */}
              <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-slate-500" />
                  {selectedMonth} Payouts Archive
                </h3>

                <div className="max-h-80 overflow-y-auto border border-slate-900 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Merchant Name</th>
                        <th className="p-2.5">Amount Paid</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-300">
                      {targetMonthData.payments.length === 0 ? (
                        <tr>
                          <td colSpan="4" className="p-4 text-center text-slate-600">
                            No payouts logged.
                          </td>
                        </tr>
                      ) : (
                        targetMonthData.payments.map((p, i) => (
                          <tr key={p.id || i} className="hover:bg-slate-900/10">
                            <td className="p-2.5 text-slate-500">
                              {new Date(p.date).toLocaleString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </td>
                            <td className="p-2.5 font-semibold">{p.merchantName}</td>
                            <td className="p-2.5 font-bold text-emerald-400">
                              ৳{Number(p.paidAmount || 0).toLocaleString()}
                            </td>
                            <td className="p-2.5 text-slate-500 italic max-w-xs truncate">
                              {p.notes || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>





              {/* Balance Transfers Grid */}
              <div className="glass-panel border border-violet-500/10 rounded-2xl p-5 space-y-4 lg:col-span-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-violet-400/80 flex items-center gap-2">
                  <ArrowRightLeft className="w-4 h-4" />
                  {selectedMonth} Balance Transfers
                </h3>

                <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0 font-bold">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Direction</th>
                        <th className="p-2.5">Amount</th>
                        <th className="p-2.5">Note</th>
                        {onDeleteTransfer && <th className="p-2.5 text-center">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/40 text-slate-300">
                      {targetMonthData.transfers.length === 0 ? (
                        <tr>
                          <td colSpan={onDeleteTransfer ? 5 : 4} className="p-4 text-center text-slate-600">
                            No balance transfers in this month.
                          </td>
                        </tr>
                      ) : (
                        targetMonthData.transfers.map((t, i) => {
                          const isC2O = t.type === 'cash_to_online' || !t.type;
                          return (
                            <tr key={t.id || i} className="hover:bg-violet-900/5">
                              <td className="p-2.5 text-slate-500">
                                {new Date(t.date + 'T00:00:00').toLocaleDateString([], {
                                  year: 'numeric',
                                  month: 'short',
                                  day: 'numeric',
                                })}
                              </td>
                              <td className="p-2.5">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${isC2O ? 'bg-violet-500/10 text-violet-400' : 'bg-cyan-500/10 text-cyan-400'}`}>
                                  {isC2O ? 'Cash → Online' : 'Online → Cash'}
                                </span>
                              </td>
                              <td className="p-2.5 font-bold text-violet-400">
                                ৳{Number(t.amount || 0).toLocaleString()}
                              </td>
                              <td className="p-2.5 text-slate-500 italic max-w-xs truncate">
                                {t.note || '—'}
                              </td>
                              {onDeleteTransfer && (
                                <td className="p-2.5 text-center">
                                  <button
                                    onClick={() => onDeleteTransfer(t.id)}
                                    className="p-1 rounded-lg hover:bg-rose-500/10 text-slate-600 hover:text-rose-400 transition-all cursor-pointer"
                                    title="Remove transfer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </td>
                              )}
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {targetMonthData.transfers.length > 0 && (
                  <div className="flex items-center justify-between pt-2 border-t border-slate-900">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month Total Transferred</span>
                    <span className="text-sm font-extrabold text-violet-400">
                      ৳{targetMonthData.transfers.reduce((s, t) => s + (parseFloat(t.amount) || 0), 0).toLocaleString()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
