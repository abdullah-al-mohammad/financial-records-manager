import { useState, useMemo, useEffect } from 'react';
import { 
  Landmark, 
  Plus, 
  Calendar, 
  FileText, 
  History, 
  CornerDownRight, 
  Search, 
  ToggleLeft, 
  ToggleRight,
  TrendingUp,
  TrendingDown,
  Trash2,
  Edit2,
  Printer
} from 'lucide-react';

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June', 
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function BillingManager({ 
  records, 
  payments, 
  merchants, 
  onAddPayment, 
  onUpdatePayment, 
  onDeletePayment 
}) {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [carryForward, setCarryForward] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Payment Form State
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  // Selected merchant for ledger view
  const [focusedMerchant, setFocusedMerchant] = useState(null);

  // Statement Date Range Filtering State
  const [reportStartDate, setReportStartDate] = useState('');
  const [reportEndDate, setReportEndDate] = useState('');

  // Clear date filters when opening a new statement drawer
  useEffect(() => {
    if (focusedMerchant) {
      setReportStartDate('');
      setReportEndDate('');
    }
  }, [focusedMerchant]);

  // Period filtered statement data
  const filteredReportData = useMemo(() => {
    if (!focusedMerchant) return { records: [], payments: [], totals: { sales: 0, billed: 0, paid: 0, ending: 0 } };

    const allRecords = records
      .filter(r => r.merchantName === focusedMerchant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const allPayments = payments
      .filter(p => p.merchantName === focusedMerchant)
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const filteredRecords = allRecords.filter(r => {
      if (!r.date) return false;
      const d = r.date.slice(0, 10);
      if (reportStartDate && d < reportStartDate) return false;
      if (reportEndDate && d > reportEndDate) return false;
      return true;
    });

    const filteredPayments = allPayments.filter(p => {
      if (!p.date) return false;
      const d = p.date.slice(0, 10);
      if (reportStartDate && d < reportStartDate) return false;
      if (reportEndDate && d > reportEndDate) return false;
      return true;
    });

    let sales = 0;
    let billed = 0;
    let paid = 0;

    filteredRecords.forEach(r => {
      sales += parseFloat(r.salesAmount) || 0;
      billed += parseFloat(r.merchantBill) || 0;
    });

    filteredPayments.forEach(p => {
      paid += parseFloat(p.paidAmount) || 0;
    });

    const ending = billed - paid;

    return {
      records: filteredRecords,
      payments: filteredPayments,
      totals: { sales, billed, paid, ending }
    };
  }, [focusedMerchant, records, payments, reportStartDate, reportEndDate]);

  // Handler to print the report exclusively
  const handlePrintReport = () => {
    document.body.classList.add('print-report-only');
    window.print();
    document.body.classList.remove('print-report-only');
  };

  // Parse month index of a YYYY-MM-DD date
  const getMonthName = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr + 'T00:00:00');
    return MONTHS[d.getMonth()];
  };

  const isPriorMonth = (dateStr, targetMonth) => {
    if (!dateStr) return false;
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    const dMonthIdx = d.getMonth();
    const targetIdx = MONTHS.indexOf(targetMonth);
    return dMonthIdx < targetIdx;
  };

  const isCurrentMonth = (dateStr, targetMonth) => {
    if (!dateStr) return false;
    const d = new Date(dateStr.includes('T') ? dateStr : dateStr + 'T00:00:00');
    return MONTHS[d.getMonth()] === targetMonth;
  };

  // Compile ledger stats per merchant based on selected month & carry-forward flag
  const billingLedger = useMemo(() => {
    const ledger = {};

    merchants.forEach(name => {
      ledger[name] = {
        name,
        priorBilled: 0,
        priorPaid: 0,
        currentBilled: 0,
        currentPaid: 0,
      };
    });

    // Aggregate Billed
    records.forEach(r => {
      if (!r.merchantName) return;
      if (!ledger[r.merchantName]) {
        ledger[r.merchantName] = {
          name: r.merchantName,
          priorBilled: 0,
          priorPaid: 0,
          currentBilled: 0,
          currentPaid: 0,
        };
      }
      const bill = parseFloat(r.merchantBill) || 0;
      
      const recordMonth = r.month || getMonthName(r.date);
      const targetIdx = MONTHS.indexOf(selectedMonth);
      const recordIdx = MONTHS.indexOf(recordMonth);

      if (recordIdx !== -1) {
        if (recordIdx < targetIdx) {
          ledger[r.merchantName].priorBilled += bill;
        } else if (recordIdx === targetIdx) {
          ledger[r.merchantName].currentBilled += bill;
        }
      }
    });

    // Aggregate Paid
    payments.forEach(p => {
      if (!p.merchantName) return;
      if (!ledger[p.merchantName]) {
        ledger[p.merchantName] = {
          name: p.merchantName,
          priorBilled: 0,
          priorPaid: 0,
          currentBilled: 0,
          currentPaid: 0,
        };
      }
      const paid = parseFloat(p.paidAmount) || 0;

      const paymentMonth = getMonthName(p.date);
      const targetIdx = MONTHS.indexOf(selectedMonth);
      const paymentIdx = MONTHS.indexOf(paymentMonth);

      if (paymentIdx !== -1) {
        if (paymentIdx < targetIdx) {
          ledger[p.merchantName].priorPaid += paid;
        } else if (paymentIdx === targetIdx) {
          ledger[p.merchantName].currentPaid += paid;
        }
      }
    });

    // Map to array and compute balances
    return Object.values(ledger).map(m => {
      const priorDue = m.priorBilled - m.priorPaid;
      const startingBalance = carryForward ? priorDue : 0;
      const endingBalance = startingBalance + m.currentBilled - m.currentPaid;

      return {
        ...m,
        startingBalance,
        totalBilled: m.currentBilled,
        totalPaid: m.currentPaid,
        endingBalance
      };
    });
  }, [records, payments, merchants, selectedMonth, carryForward]);

  // Filter merchant list by search
  const filteredLedger = useMemo(() => {
    return billingLedger.filter(m => m.name.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [billingLedger, searchTerm]);

  // Total metrics of outstanding ledger
  const aggregateTotals = useMemo(() => {
    let starting = 0;
    let billed = 0;
    let paid = 0;
    let ending = 0;

    filteredLedger.forEach(m => {
      starting += m.startingBalance;
      billed += m.totalBilled;
      paid += m.totalPaid;
      ending += m.endingBalance;
    });

    return { starting, billed, paid, ending };
  }, [filteredLedger]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    if (!selectedMerchant || !paidAmount) {
      alert('Merchant and payment amount are required');
      return;
    }

    const payload = {
      id: editingPaymentId || 'p' + Date.now(),
      date: paymentDate,
      merchantName: selectedMerchant,
      paidAmount: String(paidAmount),
      notes: notes.trim()
    };

    if (editingPaymentId) {
      await onUpdatePayment(payload);
    } else {
      await onAddPayment(payload);
    }

    // Reset Form
    setPaidAmount('');
    setNotes('');
    setEditingPaymentId(null);
  };

  const startEditPayment = (p) => {
    setEditingPaymentId(p.id);
    setPaymentDate(p.date);
    setSelectedMerchant(p.merchantName);
    setPaidAmount(p.paidAmount);
    setNotes(p.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Details for specific merchant history ledger
  const focusedMerchantData = useMemo(() => {
    if (!focusedMerchant) return null;
    const mRecords = records.filter(r => r.merchantName === focusedMerchant).sort((a, b) => new Date(a.date) - new Date(b.date));
    const mPayments = payments.filter(p => p.merchantName === focusedMerchant).sort((a, b) => new Date(a.date) - new Date(b.date));
    return { records: mRecords, payments: mPayments };
  }, [focusedMerchant, records, payments]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white">Merchant Billing Ledger</h1>
          <p className="text-xs text-slate-400 mt-1">
            Track payouts due, record payouts, and carry forward balances
          </p>
        </div>

        {/* Global Cycle Selectors */}
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-2 rounded-2xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Billing Month:
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs text-white outline-none font-semibold focus:border-indigo-500"
          >
            {MONTHS.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Grid: Payment Entry Form & Dues Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Payment Recorder */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {editingPaymentId ? 'Modify Payment' : 'Record Payout'}
            </h3>
            <p className="text-[10px] text-slate-500 mt-0.5">
              Submit merchant billing cleared transactions
            </p>
          </div>

          <form onSubmit={handlePaymentSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">Date Paid</label>
              <input
                type="date"
                required
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">Select Merchant</label>
              <select
                required
                value={selectedMerchant}
                onChange={(e) => setSelectedMerchant(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
              >
                <option value="">Choose Merchant</option>
                {merchants.map(m => (
                  <option key={m} value={m}>{m}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">Amount Transferred (৳)</label>
              <input
                type="number"
                required
                placeholder="e.g. 15000"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-medium text-slate-400">Notes (optional)</label>
              <input
                type="text"
                placeholder="e.g. Bank transfer reference"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer text-center"
              >
                {editingPaymentId ? 'Update Log' : 'Log Payout'}
              </button>
              {editingPaymentId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingPaymentId(null);
                    setPaidAmount('');
                    setNotes('');
                  }}
                  className="px-3 border border-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Ledger Dues Metrics Card */}
        <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Left side: Metrics */}
            <div className="flex-1 flex flex-col justify-between space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Cycle Overview Balances</h3>
                  <p className="text-[10px] text-slate-500 mt-0.5">Summary of dues and transfers for {selectedMonth}</p>
                </div>
                
                {/* Carry Forward Toggle */}
                <button
                  onClick={() => setCarryForward(!carryForward)}
                  className="flex items-center gap-2 text-xs text-slate-400 font-semibold hover:text-white cursor-pointer"
                >
                  {carryForward ? (
                    <>
                      <ToggleRight className="w-6 h-6 text-indigo-500" />
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Prior Dues Linked</span>
                    </>
                  ) : (
                    <>
                      <ToggleLeft className="w-6 h-6 text-slate-500" />
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Month Isolation</span>
                    </>
                  )}
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Starting Dues</span>
                  <span className="text-lg font-extrabold text-slate-300 block mt-1">৳{aggregateTotals.starting.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Billed this Month</span>
                  <span className="text-lg font-extrabold text-indigo-400 block mt-1">৳{aggregateTotals.billed.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block tracking-wider">Paid this Month</span>
                  <span className="text-lg font-extrabold text-emerald-400 block mt-1">৳{aggregateTotals.paid.toLocaleString()}</span>
                </div>

                <div className="p-4 bg-slate-950/60 border border-slate-900 rounded-xl shadow-inner shadow-rose-500/5">
                  <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Ending Balance</span>
                  <span className="text-lg font-extrabold text-rose-400 block mt-1">৳{aggregateTotals.ending.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 bg-slate-950/40 p-3 rounded-xl border border-slate-900">
                {carryForward ? (
                  <span className="flex items-start gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                    Dues carry-forward is active. The Ending Balance includes unpaid bills accumulated from all preceding months.
                  </span>
                ) : (
                  <span className="flex items-start gap-1.5">
                    <CornerDownRight className="w-4 h-4 text-slate-600 flex-shrink-0" />
                    Isolated month calculations. Showing outstanding bills and payments generated strictly during {selectedMonth}.
                  </span>
                )}
              </div>
            </div>

            {/* Right side: Previous Month's Outstanding Dues Summary */}
            <div className="w-full lg:w-64 bg-slate-950/40 border border-slate-900/60 rounded-xl p-4 flex flex-col justify-between min-h-[220px]">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Prior Dues By Merchant</span>
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                </div>
                <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                  {billingLedger.filter(m => m.startingBalance > 0).length === 0 ? (
                    <div className="text-[10px] text-slate-500 italic py-2">
                      No outstanding prior dues.
                    </div>
                  ) : (
                    billingLedger.filter(m => m.startingBalance > 0).map(m => (
                      <div key={m.name} className="flex justify-between items-center text-[10px] py-1 border-b border-slate-900/40 last:border-b-0">
                        <span className="font-medium text-slate-300 truncate max-w-[120px]">{m.name}</span>
                        <span className="font-bold text-rose-400">৳{m.startingBalance.toLocaleString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
              <div className="pt-2 border-t border-slate-900 mt-2 flex items-center justify-between text-[10px]">
                <span className="text-slate-500 font-medium">Prior Total</span>
                <span className="font-bold text-rose-400">৳{aggregateTotals.starting.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search merchant records..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none"
          />
        </div>
      </div>

      {/* Ledger Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredLedger.length === 0 ? (
          <div className="col-span-full py-8 text-center text-xs text-slate-500">
            No merchant logs found.
          </div>
        ) : (
          filteredLedger.map((m) => (
            <div 
              key={m.name} 
              className="glass-panel border border-slate-900 hover:border-slate-800 rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                <span className="font-bold text-white tracking-wide truncate pr-2">{m.name}</span>
                <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
                  m.endingBalance > 0 ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' : 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400'
                }`}>
                  {m.endingBalance > 0 ? 'Due' : 'Settled'}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-500">
                <div>
                  <span className="block font-medium">Prior Due</span>
                  <span className="block font-bold text-slate-300 mt-0.5">৳{m.startingBalance.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block font-medium">Billed</span>
                  <span className="block font-bold text-indigo-400 mt-0.5">৳{m.totalBilled.toLocaleString()}</span>
                </div>
                <div>
                  <span className="block font-medium">Paid</span>
                  <span className="block font-bold text-emerald-400 mt-0.5">৳{m.totalPaid.toLocaleString()}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-900 flex items-center justify-between">
                <div>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Balance Outstanding</span>
                  <span className={`text-base font-extrabold block mt-0.5 ${m.endingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    ৳{m.endingBalance.toLocaleString()}
                  </span>
                </div>

                <button
                  onClick={() => setFocusedMerchant(m.name)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-850 hover:border-slate-700 text-slate-300 rounded-xl text-[10px] font-bold transition-all cursor-pointer"
                >
                  View History
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Recent Payments Log */}
      <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl mt-8">
        <div className="p-4 bg-slate-900/40 border-b border-slate-900">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Payments Log</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 text-slate-400 font-bold border-b border-slate-900">
                <th className="p-4">Date</th>
                <th className="p-4">Merchant Name</th>
                <th className="p-4">Paid Amount</th>
                <th className="p-4">Notes</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {payments.length === 0 ? (
                <tr>
                  <td colSpan="5" className="p-8 text-center text-slate-500">
                    No payouts logged yet.
                  </td>
                </tr>
              ) : (
                payments.slice(-8).reverse().map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/10 transition-all text-slate-300">
                    <td className="p-4 whitespace-nowrap text-slate-400">{new Date(p.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                    <td className="p-4 font-bold text-white">{p.merchantName}</td>
                    <td className="p-4 font-semibold text-emerald-400">৳{Number(p.paidAmount).toLocaleString()}</td>
                    <td className="p-4 text-slate-500 italic max-w-xs truncate">{p.notes || '—'}</td>
                    <td className="p-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <button
                          onClick={() => startEditPayment(p)}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm('Delete this payout log permanently?')) {
                              onDeletePayment(p.id);
                            }
                          }}
                          className="p-1.5 rounded-lg border border-slate-800 text-slate-500 hover:text-rose-400 transition-all cursor-pointer"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Individual Merchant History Slide-Over Dialog */}
      {focusedMerchant && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
          <div 
            onClick={() => setFocusedMerchant(null)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          <div className="relative w-full max-w-2xl bg-[#0a0f1d] border-l border-slate-900 h-full shadow-2xl flex flex-col justify-between z-10 animate-slide-in">
            {/* Header */}
            <div className="p-5 border-b border-slate-900 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-500" />
                  {focusedMerchant} Statement
                </h2>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Itemized sales and payments audit trail
                </p>
              </div>
              <button 
                onClick={() => setFocusedMerchant(null)}
                className="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
              >
                Close
              </button>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Merchant Date Range Filter Options */}
              <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4.5 space-y-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statement Date Range</span>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">From Date</label>
                    <input
                      type="date"
                      value={reportStartDate}
                      onChange={(e) => setReportStartDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wide">To Date</label>
                    <input
                      type="date"
                      value={reportEndDate}
                      onChange={(e) => setReportEndDate(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
                {(reportStartDate || reportEndDate) && (
                  <button
                    onClick={() => {
                      setReportStartDate('');
                      setReportEndDate('');
                    }}
                    className="text-[10px] font-bold text-indigo-400 hover:text-indigo-300 underline block cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>

              {/* Period Performance Metrics Card */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Billed in Period</span>
                  <span className="text-sm font-extrabold text-indigo-400 block mt-1">৳{filteredReportData.totals.billed.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Paid in Period</span>
                  <span className="text-sm font-extrabold text-emerald-400 block mt-1">৳{filteredReportData.totals.paid.toLocaleString()}</span>
                </div>
                <div className="p-3 bg-slate-950/40 border border-slate-900 rounded-xl text-center">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block">Outstanding</span>
                  <span className={`text-sm font-extrabold block mt-1 ${filteredReportData.totals.ending > 0 ? 'text-rose-450 text-rose-400' : 'text-emerald-400'}`}>
                    ৳{filteredReportData.totals.ending.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Sales Records */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest border-b border-slate-900 pb-1">
                  Billed Invoices (Sales)
                </h3>
                <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Month</th>
                        <th className="p-2.5">Sales</th>
                        <th className="p-2.5">Commission</th>
                        <th className="p-2.5">Invoice Bill</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {filteredReportData?.records.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="p-4 text-center text-slate-650 text-slate-500">No invoices logged.</td>
                        </tr>
                      ) : (
                        filteredReportData?.records.map((r) => (
                          <tr key={r.id}>
                            <td className="p-2.5">{r.date ? r.date.slice(0, 10) : '—'}</td>
                            <td className="p-2.5 text-slate-500">{r.month}</td>
                            <td className="p-2.5 font-medium text-slate-400">৳{Number(r.salesAmount).toLocaleString()}</td>
                            <td className="p-2.5 text-slate-500">৳{Number(r.commissionAmount).toLocaleString()}</td>
                            <td className="p-2.5 font-bold text-indigo-400">৳{Number(r.merchantBill).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Payments History */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest border-b border-slate-900 pb-1">
                  Payouts Ledger
                </h3>
                <div className="max-h-60 overflow-y-auto border border-slate-900 rounded-xl">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950 text-slate-400 sticky top-0">
                      <tr>
                        <th className="p-2.5">Date</th>
                        <th className="p-2.5">Amount Paid</th>
                        <th className="p-2.5">Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-900/60 text-slate-300">
                      {filteredReportData?.payments.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="p-4 text-center text-slate-650 text-slate-500">No payments logged.</td>
                        </tr>
                      ) : (
                        filteredReportData?.payments.map((p) => (
                          <tr key={p.id}>
                            <td className="p-2.5">{p.date ? p.date.slice(0, 10) : '—'}</td>
                            <td className="p-2.5 font-bold text-emerald-400">৳{Number(p.paidAmount).toLocaleString()}</td>
                            <td className="p-2.5 text-slate-500 italic truncate max-w-xs">{p.notes || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-900 bg-slate-950/40 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={handlePrintReport}
                className="px-4 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white rounded-xl text-xs font-semibold cursor-pointer flex items-center gap-1.5 transition-all"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Statement
              </button>
              <button
                type="button"
                onClick={() => setFocusedMerchant(null)}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Close Statement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Printable Report Area */}
      <div className="printable-report-area hidden bg-white text-black p-8 font-sans w-full max-w-4xl mx-auto">
        <div className="flex justify-between items-center border-b-2 border-slate-300 pb-4 mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">Merchant Statement of Accounts</h1>
            <p className="text-[10px] text-slate-500 mt-1">Generated: {new Date().toLocaleDateString('en-GB')}</p>
          </div>
          <div className="text-right">
            <h2 className="text-base font-bold text-slate-900">{focusedMerchant}</h2>
            <p className="text-[10px] text-slate-500 mt-1 font-medium">
              Period: {reportStartDate ? new Date(reportStartDate).toLocaleDateString('en-GB') : 'All History'} to {reportEndDate ? new Date(reportEndDate).toLocaleDateString('en-GB') : 'Present'}
            </p>
          </div>
        </div>

        {/* Invoice Sales Table */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Billed Invoices (Sales)</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100/80 font-bold text-slate-700">
                <th className="py-2 px-3">Order Date</th>
                <th className="py-2 px-3">Order Details</th>
                <th className="py-2 px-3 text-right">Sales Amount</th>
                <th className="py-2 px-3 text-right">Commission</th>
                <th className="py-2 px-3 text-right">Merchant Bill</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReportData?.records.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-4 px-3 text-center text-slate-500 italic">No sales recorded in this period.</td>
                </tr>
              ) : (
                filteredReportData?.records.map((r) => (
                  <tr key={r.id}>
                    <td className="py-2 px-3">{r.date ? r.date.slice(0, 10) : '—'}</td>
                    <td className="py-2 px-3 text-slate-650">
                      <span className="font-semibold text-slate-800">{r.salesType}</span>
                      {r.digitalPaymentMethod && <span className="text-[10px] text-slate-500 ml-1">({r.digitalPaymentMethod})</span>}
                      {r.riderName && <span className="text-[10px] text-slate-500 block">Rider: {r.riderName}</span>}
                      {r.expenseDescription && <span className="text-[10px] text-slate-500 block italic">Note: {r.expenseDescription}</span>}
                    </td>
                    <td className="py-2 px-3 text-right">৳{Number(r.salesAmount || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right text-slate-500">৳{Number(r.commissionAmount || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 text-right font-bold text-slate-800">৳{Number(r.merchantBill || 0).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Payments Table */}
        <div className="space-y-3 mb-8">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Payouts Ledger</h3>
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-300 bg-slate-100/80 font-bold text-slate-700">
                <th className="py-2 px-3">Date Paid</th>
                <th className="py-2 px-3">Amount Paid</th>
                <th className="py-2 px-3">Notes / Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredReportData?.payments.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-4 px-3 text-center text-slate-500 italic">No payouts recorded in this period.</td>
                </tr>
              ) : (
                filteredReportData?.payments.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2 px-3">{p.date ? p.date.slice(0, 10) : '—'}</td>
                    <td className="py-2 px-3 font-bold text-emerald-700">৳{Number(p.paidAmount || 0).toLocaleString()}</td>
                    <td className="py-2 px-3 text-slate-650 italic">{p.notes || '—'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Period Summary & Signature Lines */}
        <div className="grid grid-cols-2 gap-8 border-t border-slate-300 pt-6 mt-8">
          {/* Signatures */}
          <div className="flex flex-col justify-end space-y-12">
            <div className="flex gap-12">
              <div className="flex-1 border-t border-slate-400 text-center pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Merchant Signature</span>
              </div>
              <div className="flex-1 border-t border-slate-400 text-center pt-2">
                <span className="text-[10px] uppercase font-bold text-slate-500">Accounts Department</span>
              </div>
            </div>
          </div>
          {/* Totals */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 border border-slate-200">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Billed:</span>
              <span className="font-semibold">৳{filteredReportData?.totals.billed.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-xs text-slate-600">
              <span>Total Paid:</span>
              <span className="font-semibold text-emerald-700">৳{filteredReportData?.totals.paid.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-slate-300 pt-2 font-bold text-slate-900">
              <span>Outstanding Period Balance:</span>
              <span className={filteredReportData?.totals.ending > 0 ? 'text-rose-700' : 'text-emerald-700'}>
                ৳{filteredReportData?.totals.ending.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
