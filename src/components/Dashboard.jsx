import { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  ShoppingBag,
  Receipt,
  Landmark,
  DollarSign,
  PiggyBank,
  Activity,
  PlusCircle,
  CreditCard,
  Printer
} from 'lucide-react';

export default function Dashboard({ records, payments, setActiveTab }) {
  const MONTHS_ORDER = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const paymentTotals = useMemo(() => {
    let totalPaid = 0;
    let online = 0;
    let onlineRecords = [];

    const onlineMethods = [
      'bkash',
      'nagad',
      'rocket',
      'upay',
      'sslcommerz',
      'card',
      'mobile banking',
      'online',
    ];

    records.forEach(r => {
      const amount = Number(r.paidByCustomer) || 0;
      totalPaid += amount;
      const method = String(r.digitalPaymentMethod || r.paymentMethod || '')
        .trim()
        .toLowerCase();
      
      const isOnline = onlineMethods.includes(method);
      if (isOnline) {
        online += amount;
        onlineRecords.push(r);
      }
    });
    const cash = totalPaid - online;
    return { online, cash, onlineRecords };
  }, [records]);

  // Aggregate stats across all records
  const stats = useMemo(() => {
    let sales = 0;
    let commission = 0;
    let delivery = 0;
    let otherCash = 0;
    let riderSalaries = 0;
    let otherExpenses = 0;
    let fixedExpenses = 0;

    records.forEach(r => {
      sales += parseFloat(r.salesAmount) || 0;
      commission += parseFloat(r.commissionAmount) || 0;
      delivery += parseFloat(r.deliveryCharge) || 0;
      otherCash += parseFloat(r.otherCashAmount) || 0;
      riderSalaries += parseFloat(r.riderSalary) || 0;
      otherExpenses += parseFloat(r.otherExpense) || 0;
      fixedExpenses += parseFloat(r.fixedExpense) || 0;
    });

    const income = commission + delivery;
    const expenses = riderSalaries + otherExpenses + fixedExpenses;
    const netProfit = income - expenses;

    // Merchant balances
    const merchantTotals = {};
    records.forEach(r => {
      if (!r.merchantName) return;
      if (!merchantTotals[r.merchantName]) {
        merchantTotals[r.merchantName] = { billed: 0, paid: 0 };
      }
      merchantTotals[r.merchantName].billed += parseFloat(r.merchantBill) || 0;
    });

    payments.forEach(p => {
      if (!p.merchantName) return;
      if (!merchantTotals[p.merchantName]) {
        merchantTotals[p.merchantName] = { billed: 0, paid: 0 };
      }
      merchantTotals[p.merchantName].paid += parseFloat(p.paidAmount) || 0;
    });

    let totalDues = 0;
    Object.values(merchantTotals).forEach(m => {
      const balance = m.billed - m.paid;
      if (balance > 0) totalDues += balance;
    });

    return {
      sales,
      commission,
      delivery,
      income,
      otherCash,
      expenses,
      netProfit,
      totalDues,
      riderSalaries,
      otherExpenses,
      fixedExpenses,
      merchantTotals
    };
  }, [records, payments]);

  // MoM Aggregation (Last 5 active months)
  const momData = useMemo(() => {
    const monthsMap = {};
    records.forEach(r => {
      if (!r.month) return;
      if (!monthsMap[r.month]) {
        monthsMap[r.month] = { sales: 0, expenses: 0, income: 0 };
      }
      monthsMap[r.month].sales += parseFloat(r.salesAmount) || 0;
      monthsMap[r.month].income += (parseFloat(r.commissionAmount) || 0) + (parseFloat(r.deliveryCharge) || 0);
      monthsMap[r.month].expenses += (parseFloat(r.riderSalary) || 0) + (parseFloat(r.otherExpense) || 0) + (parseFloat(r.fixedExpense) || 0);
    });

    // Sort based on calendar order
    return Object.keys(monthsMap)
      .sort((a, b) => MONTHS_ORDER.indexOf(a) - MONTHS_ORDER.indexOf(b))
      .slice(-5)
      .map(month => ({
        month,
        sales: monthsMap[month].sales,
        expenses: monthsMap[month].expenses,
        income: monthsMap[month].income
      }));
  }, [records]);

  // Top Merchants Leaderboard
  const topMerchants = useMemo(() => {
    const merchants = {};
    records.forEach(r => {
      if (!r.merchantName) return;
      merchants[r.merchantName] = (merchants[r.merchantName] || 0) + (parseFloat(r.salesAmount) || 0);
    });
    return Object.entries(merchants)
      .map(([name, sales]) => ({ name, sales }))
      .sort((a, b) => b.sales - a.sales)
      .slice(0, 5);
  }, [records]);

  // Outstanding dues prior to the current month (previous month outstanding dues)
  const previousMonthDues = useMemo(() => {
    const currentMonthIdx = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const MONTHS = [
      'January', 'February', 'March', 'April', 'May', 'June', 
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const merchantPriorDues = {};

    records.forEach(r => {
      if (!r.merchantName) return;
      
      let isPrior = false;
      if (r.date) {
        const d = new Date(r.date.includes('T') ? r.date : r.date + 'T00:00:00');
        isPrior = d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() < currentMonthIdx);
      } else if (r.month) {
        const idx = MONTHS.indexOf(r.month);
        isPrior = idx !== -1 && idx < currentMonthIdx;
      }
      
      if (isPrior) {
        if (!merchantPriorDues[r.merchantName]) {
          merchantPriorDues[r.merchantName] = { billed: 0, paid: 0 };
        }
        merchantPriorDues[r.merchantName].billed += parseFloat(r.merchantBill) || 0;
      }
    });

    payments.forEach(p => {
      if (!p.merchantName) return;
      
      let isPrior = false;
      if (p.date) {
        const d = new Date(p.date.includes('T') ? p.date : p.date + 'T00:00:00');
        isPrior = d.getFullYear() < currentYear || (d.getFullYear() === currentYear && d.getMonth() < currentMonthIdx);
      }
      
      if (isPrior) {
        if (!merchantPriorDues[p.merchantName]) {
          merchantPriorDues[p.merchantName] = { billed: 0, paid: 0 };
        }
        merchantPriorDues[p.merchantName].paid += parseFloat(p.paidAmount) || 0;
      }
    });

    return Object.entries(merchantPriorDues)
      .map(([name, data]) => ({
        name,
        due: data.billed - data.paid
      }))
      .filter(m => m.due > 0)
      .sort((a, b) => b.due - a.due);
  }, [records, payments]);

  // Expense breakdown calculations for Donut chart SVG
  const expensePieData = useMemo(() => {
    const total = stats.riderSalaries + stats.fixedExpenses + stats.otherExpenses;
    if (total === 0) return [];

    return [
      { name: 'Rider Salaries', value: stats.riderSalaries, color: '#f43f5e', percentage: (stats.riderSalaries / total) * 100 },
      { name: 'Fixed Expenses', value: stats.fixedExpenses, color: '#eab308', percentage: (stats.fixedExpenses / total) * 100 },
      { name: 'Other Expenses', value: stats.otherExpenses, color: '#a855f7', percentage: (stats.otherExpenses / total) * 100 }
    ].filter(item => item.value > 0);
  }, [stats]);

  // Render SVG Pie/Donut segment paths
  const renderDonutPaths = () => {
    let cumulativeAngle = 0;
    const radius = 60;
    const cx = 80;
    const cy = 80;
    const strokeWidth = 22;
    const circumference = 2 * Math.PI * radius;

    return expensePieData.map((item, index) => {
      const angle = (item.value / (stats.riderSalaries + stats.fixedExpenses + stats.otherExpenses)) * 360;
      const strokeDashArray = `${(item.value / (stats.riderSalaries + stats.fixedExpenses + stats.otherExpenses)) * circumference} ${circumference}`;
      const strokeDashOffset = - (cumulativeAngle / 360) * circumference;
      cumulativeAngle += angle;

      return (
        <circle
          key={index}
          cx={cx}
          cy={cy}
          r={radius}
          fill="none"
          stroke={item.color}
          strokeWidth={strokeWidth}
          strokeDasharray={strokeDashArray}
          strokeDashoffset={strokeDashOffset}
          transform={`rotate(-90 ${cx} ${cy})`}
          className="transition-all duration-500 hover:opacity-80 cursor-pointer"
          title={`${item.name}: ${item.percentage.toFixed(1)}%`}
        />
      );
    });
  };

  // Safe max calculation for MoM chart scaling
  const maxMoMVal = useMemo(() => {
    const values = momData.flatMap(d => [d.sales, d.expenses]);
    return values.length > 0 ? Math.max(...values) * 1.15 : 10000;
  }, [momData]);

  return (
    <div className="space-y-8 pb-10">
      {/* Page Title */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-indigo-500" />
            Financial Dashboard
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time analytics and overall ledger statistics
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('sales')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/10 transition-all cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            Add Record
          </button>
          <button
            onClick={() => setActiveTab('billing')}
            className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 hover:border-slate-700 active:scale-[0.98] text-slate-300 px-3.5 py-2 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
          >
            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
            Record Payment
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-md transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            Print Page
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            title: 'Gross Sales Volume',
            value: `৳${stats.sales.toLocaleString()}`,
            icon: ShoppingBag,
            glow: 'rgba(99, 102, 241, 0.05)',
            accent: 'border-indigo-500/20',
            text: 'text-indigo-400',
            bg: 'bg-indigo-500/10',
            subtitle: 'Total transactions registered'
          },
          {
            title: 'Total Revenue (Income)',
            value: `৳${stats.income.toLocaleString()}`,
            icon: DollarSign,
            glow: 'rgba(16, 185, 129, 0.05)',
            accent: 'border-emerald-500/20',
            text: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            subtitle: 'Commissions + Delivery charges'
          },
          {
            title: 'Aggregate Overheads',
            value: `৳${stats.expenses.toLocaleString()}`,
            icon: Receipt,
            glow: 'rgba(244, 63, 94, 0.05)',
            accent: 'border-rose-500/20',
            text: 'text-rose-400',
            bg: 'bg-rose-500/10',
            subtitle: 'Salaries, fixed & other expenses'
          },
          {
            title: 'Net Profit / Loss',
            value: `${stats.netProfit < 0 ? '-' : ''}৳${Math.abs(stats.netProfit).toLocaleString()}`,
            icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
            glow: stats.netProfit >= 0 ? 'rgba(16, 185, 129, 0.05)' : 'rgba(244, 63, 94, 0.05)',
            accent: stats.netProfit >= 0 ? 'border-emerald-500/20' : 'border-rose-500/20',
            text: stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
            bg: stats.netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
            subtitle: 'Net income minus expenses'
          }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div 
              key={i} 
              className={`glass-panel rounded-2xl p-5 border ${c.accent} relative overflow-hidden transition-all duration-300 hover:border-slate-700`}
              style={{ boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.2), 0 0 16px ${c.glow}` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.text}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{c.value}</span>
                <span className="text-[10px] text-slate-500 block mt-1">{c.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extra Cards Row (Dues and Other Cash) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel border border-rose-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Merchant Unpaid Bills</span>
              <span className="text-xl font-bold text-white tracking-tight block mt-1">৳{stats.totalDues.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('billing')}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            Clear Dues
          </button>
        </div>

        <div className="glass-panel border border-indigo-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-indigo-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Other Cash Collected</span>
              <span className="text-xl font-bold text-white tracking-tight block mt-1">৳{stats.otherCash.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('sales')}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 py-1.5 px-3 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer"
          >
            View Cash sources
          </button>
        </div>
      </div>

      {/* Extra Cards Row (Online vs Cash Payments) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="glass-panel border border-indigo-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-indigo-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-indigo-500/10 text-indigo-400">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Online Payments Received ({paymentTotals.onlineRecords.length})</span>
              <span className="text-xl font-bold text-white tracking-tight block mt-1">৳{paymentTotals.online.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('sales')}
            className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 py-1.5 px-3 rounded-lg bg-indigo-500/5 hover:bg-indigo-500/10 transition-all cursor-pointer"
          >
            View Details
          </button>
        </div>
        <div className="glass-panel border border-rose-500/15 rounded-2xl p-5 flex items-center justify-between shadow-lg shadow-rose-500/5">
          <div className="flex items-center gap-4">
            <div className="p-3.5 rounded-2xl bg-rose-500/10 text-rose-400">
              <PiggyBank className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Cash in Hand</span>
              <span className="text-xl font-bold text-white tracking-tight block mt-1">৳{paymentTotals.cash.toLocaleString()}</span>
            </div>
          </div>
          <button 
            onClick={() => setActiveTab('sales')}
            className="text-[11px] font-bold text-rose-400 hover:text-rose-300 py-1.5 px-3 rounded-lg bg-rose-500/5 hover:bg-rose-500/10 transition-all cursor-pointer"
          >
            View Details
          </button>
        </div>
      </div>

      {/* SVG Charts Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Month-over-Month Column Chart */}
        <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Sales vs Expenses MoM Volume</h3>
          {momData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No historical data available. Create records to view chart.
            </div>
          ) : (
            <div className="w-full overflow-hidden">
              <svg className="w-full h-64" viewBox="0 0 500 240">
                {/* Horizontal grid lines */}
                {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
                  const y = 20 + p * 160;
                  const val = Math.round(maxMoMVal * (1 - p));
                  return (
                    <g key={idx} className="opacity-30">
                      <line x1="45" y1={y} x2="480" y2={y} stroke="#334155" strokeWidth="0.5" strokeDasharray="3 3" />
                      <text x="35" y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="9" fontWeight="500">
                        {val >= 1000 ? `${(val/1000).toFixed(0)}k` : val}
                      </text>
                    </g>
                  );
                })}

                {/* Draw Columns */}
                {momData.map((d, idx) => {
                  const step = 430 / momData.length;
                  const xBase = 55 + idx * step;
                  
                  const salesHeight = (d.sales / maxMoMVal) * 160;
                  const salesY = 180 - salesHeight;
                  
                  const expensesHeight = (d.expenses / maxMoMVal) * 160;
                  const expensesY = 180 - expensesHeight;

                  return (
                    <g key={idx}>
                      {/* Sales Column (Indigo) */}
                      <rect
                        x={xBase + 10}
                        y={salesY}
                        width="18"
                        height={Math.max(salesHeight, 2)}
                        rx="3"
                        fill="url(#indigoGrad)"
                        className="transition-all duration-300 hover:opacity-90"
                      />
                      {/* Expenses Column (Rose) */}
                      <rect
                        x={xBase + 32}
                        y={expensesY}
                        width="18"
                        height={Math.max(expensesHeight, 2)}
                        rx="3"
                        fill="url(#roseGrad)"
                        className="transition-all duration-300 hover:opacity-90"
                      />
                      {/* X Label */}
                      <text
                        x={xBase + 30}
                        y="205"
                        textAnchor="middle"
                        fill="#94a3b8"
                        fontSize="9"
                        fontWeight="600"
                      >
                        {d.month}
                      </text>
                    </g>
                  );
                })}

                {/* Legend */}
                <g transform="translate(180, 225)" fontSize="9" fontWeight="600">
                  <circle cx="10" cy="5" r="4" fill="#6366f1" />
                  <text x="20" y="8" fill="#94a3b8">Sales Volume</text>
                  
                  <circle cx="95" cy="5" r="4" fill="#f43f5e" />
                  <text x="105" y="8" fill="#94a3b8">Expenses</text>
                </g>

                {/* SVG Gradients */}
                <defs>
                  <linearGradient id="indigoGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#8b5cf6" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </linearGradient>
                  <linearGradient id="roseGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f43f5e" />
                    <stop offset="100%" stopColor="#e11d48" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
          )}
        </div>

        {/* Expense breakdown chart (Donut) */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Expense Distribution</h3>
          {expensePieData.length === 0 ? (
            <div className="h-64 flex items-center justify-center text-xs text-slate-500">
              No expenses recorded yet.
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <svg className="w-40 h-40" viewBox="0 0 160 160">
                {renderDonutPaths()}
                <circle cx="80" cy="80" r="46" fill="#0b101e" />
                <text x="80" y="77" textAnchor="middle" fill="#94a3b8" fontSize="8" fontWeight="bold">TOTAL</text>
                <text x="80" y="93" textAnchor="middle" fill="#ffffff" fontSize="11" fontWeight="bold">
                  ৳{(stats.riderSalaries + stats.fixedExpenses + stats.otherExpenses).toLocaleString()}
                </text>
              </svg>

              <div className="mt-6 w-full space-y-2 text-xs">
                {expensePieData.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-slate-400 font-medium">{item.name}</span>
                    </div>
                    <span className="font-bold text-white">৳{item.value.toLocaleString()} ({item.percentage.toFixed(0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Leaderboards and summaries */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Merchants Leaderboard */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Top Merchants by Volume</h3>
          {topMerchants.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No merchants registered yet.
            </div>
          ) : (
            <div className="space-y-4">
              {topMerchants.map((m, idx) => {
                const percentage = stats.sales > 0 ? (m.sales / stats.sales) * 100 : 0;
                return (
                  <div key={m.name} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-500">#{idx + 1}</span>
                        <span className="font-semibold text-slate-200">{m.name}</span>
                      </div>
                      <span className="font-bold text-indigo-400">৳{m.sales.toLocaleString()}</span>
                    </div>
                    <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 rounded-full"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Previous Month Outstanding Dues */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Prior Month Dues</span>
              <span className="text-[10px] text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded-lg border border-rose-500/20 uppercase tracking-widest">
                Due
              </span>
            </h3>
            {previousMonthDues.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                All previous dues settled.
              </div>
            ) : (
              <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
                {previousMonthDues.map((m) => (
                  <div key={m.name} className="flex justify-between items-center text-xs py-1.5 border-b border-slate-900/60 last:border-b-0">
                    <span className="font-semibold text-slate-200">{m.name}</span>
                    <span className="font-bold text-rose-400">৳{m.due.toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="pt-3 border-t border-slate-900 mt-4 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block">Total Outstanding Prior</span>
            <span className="text-sm font-extrabold text-rose-400 block">
              ৳{previousMonthDues.reduce((sum, m) => sum + m.due, 0).toLocaleString()}
            </span>
          </div>
        </div>

        {/* Latest Audit / System Logs preview */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">Recent Records Added</h3>
          {records.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-500">
              No recent entries found.
            </div>
          ) : (
            <div className="divide-y divide-slate-900/60 max-h-48 overflow-y-auto pr-1">
              {records.slice(-4).reverse().map((r, i) => (
                <div key={r.id || i} className="py-2.5 flex items-center justify-between text-xs first:pt-0 last:pb-0">
                  <div>
                    <span className="font-bold text-slate-200 block">{r.merchantName || 'Generic Transaction'}</span>
                    <span className="text-[10px] text-slate-500">{new Date(r.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} — {r.salesType}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-emerald-400 block">৳{Number(r.salesAmount || 0).toLocaleString()}</span>
                    <span className="text-[10px] text-slate-500">Com. ৳{Number(r.commissionAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
