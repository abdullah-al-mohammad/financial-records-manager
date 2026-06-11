import { useState, useMemo } from 'react';
import { 
  DollarSign, 
  UserCheck, 
  Settings, 
  AlertOctagon,
  Search,
  Calendar,
  Layers,
  ArrowUpRight
} from 'lucide-react';

export default function ExpenseManager({ records, onEditRecord }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  // Compute stats
  const stats = useMemo(() => {
    let riders = 0;
    let variables = 0;
    let fixed = 0;
    let count = 0;

    records.forEach(r => {
      const rs = parseFloat(r.riderSalary) || 0;
      const oe = parseFloat(r.otherExpense) || 0;
      const fe = parseFloat(r.fixedExpense) || 0;

      riders += rs;
      variables += oe;
      fixed += fe;

      if (rs > 0 || oe > 0 || fe > 0) count++;
    });

    const total = riders + variables + fixed;

    return { total, riders, variables, fixed, count };
  }, [records]);

  // Extract individual itemized expenses
  const itemizedExpenses = useMemo(() => {
    const list = [];

    records.forEach(r => {
      const rs = parseFloat(r.riderSalary) || 0;
      const oe = parseFloat(r.otherExpense) || 0;
      const fe = parseFloat(r.fixedExpense) || 0;

      if (rs > 0) {
        list.push({
          id: `${r.id}_rider`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Rider Wages',
          name: r.riderName ? `Rider Wages: ${r.riderName}` : 'Rider Wages',
          amount: rs,
          originalRecord: r
        });
      }

      if (oe > 0) {
        list.push({
          id: `${r.id}_other`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Variable Overhead',
          name: r.otherExpenseName || 'Variable Expense',
          amount: oe,
          originalRecord: r
        });
      }

      if (fe > 0) {
        list.push({
          id: `${r.id}_fixed`,
          date: r.date,
          month: r.month,
          merchantName: r.merchantName,
          category: 'Fixed Cost',
          name: r.fixedExpenseName || 'Fixed Cost',
          amount: fe,
          originalRecord: r
        });
      }
    });

    return list.sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [records]);

  // Filter itemized list
  const filteredItems = useMemo(() => {
    return itemizedExpenses.filter(item => {
      const matchSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          (item.merchantName && item.merchantName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = filterCategory === 'All' || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [itemizedExpenses, searchTerm, filterCategory]);

  // Max value for comparative SVG column graph
  const maxBarVal = Math.max(stats.riders, stats.fixed, stats.variables, 100);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-white">Expense Ledger</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review itemized operations costs, courier wages, and fixed overheads
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: 'Total Operational Costs', value: `৳${stats.total.toLocaleString()}`, icon: DollarSign, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { title: 'Courier Wages', value: `৳${stats.riders.toLocaleString()}`, icon: UserCheck, color: 'text-rose-400', bg: 'bg-rose-500/10' },
          { title: 'Fixed Costs', value: `৳${stats.fixed.toLocaleString()}`, icon: Settings, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { title: 'Variable Overheads', value: `৳${stats.variables.toLocaleString()}`, icon: AlertOctagon, color: 'text-purple-400', bg: 'bg-purple-500/10' }
        ].map((c, i) => {
          const Icon = c.icon;
          return (
            <div key={i} className="glass-panel border border-slate-900 rounded-2xl p-5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{c.title}</span>
                <div className={`p-2 rounded-xl ${c.bg} ${c.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-2xl font-bold text-white tracking-tight">{c.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Middle Grid: Comparative Chart and Quick Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Comparative SVG Bar Graph */}
        <div className="lg:col-span-2 glass-panel border border-slate-900 rounded-2xl p-5">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-6">Category Cost Comparisons</h3>
          {stats.total === 0 ? (
            <div className="h-44 flex items-center justify-center text-xs text-slate-500">
              No expense cost data available.
            </div>
          ) : (
            <div className="space-y-4">
              {[
                { name: 'Rider Wages', value: stats.riders, color: 'bg-rose-500' },
                { name: 'Fixed Costs', value: stats.fixed, color: 'bg-amber-500' },
                { name: 'Variable Overheads', value: stats.variables, color: 'bg-purple-500' }
              ].map((cat, idx) => {
                const percent = (cat.value / maxBarVal) * 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-300">{cat.name}</span>
                      <span className="font-bold text-white">৳{cat.value.toLocaleString()}</span>
                    </div>
                    <div className="h-3 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-900">
                      <div 
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Expense Info Panel */}
        <div className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">Cost Auditing Rules</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Expenses are recorded inline within sales transaction logs. To create a standalone expense entry, record a transaction with the Sales amount left empty or set to 0.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-900 flex items-center justify-between text-xs text-slate-400">
            <span>Aggregated Sheets Rows:</span>
            <span className="font-bold text-white">{stats.count} records</span>
          </div>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search items by name or merchant..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>

        <div className="flex items-center gap-2 min-w-[180px]">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Category</span>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
          >
            <option value="All">All Categories</option>
            <option value="Rider Wages">Rider Wages</option>
            <option value="Fixed Cost">Fixed Costs</option>
            <option value="Variable Overhead">Variable Overheads</option>
          </select>
        </div>
      </div>

      {/* Itemized Grid Table */}
      <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
                <th className="p-4 whitespace-nowrap">Date</th>
                <th className="p-4">Category</th>
                <th className="p-4">Description</th>
                <th className="p-4">Linked Merchant</th>
                <th className="p-4">Amount</th>
                <th className="p-4 text-center">Reference</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-900/40">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-8 text-center text-slate-500 font-medium">
                    No itemized expenses found.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-900/10 transition-all text-slate-300">
                    <td className="p-4 whitespace-nowrap font-medium text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-600" />
                        {new Date(item.date).toLocaleString([], { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </td>
                    <td className="p-4 whitespace-nowrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
                        item.category === 'Rider Wages' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                        item.category === 'Fixed Cost' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                        'bg-purple-500/10 border-purple-500/20 text-purple-400'
                      }`}>
                        {item.category}
                      </span>
                    </td>
                    <td className="p-4 font-semibold text-white">{item.name}</td>
                    <td className="p-4 text-slate-400">{item.merchantName || 'Generic Office Overhead'}</td>
                    <td className="p-4 font-bold text-rose-400">৳{item.amount.toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button
                        onClick={() => onEditRecord(item.originalRecord)}
                        className="inline-flex items-center gap-1.5 py-1 px-2.5 rounded-lg border border-slate-800 text-[10px] font-bold text-slate-400 hover:text-white hover:bg-slate-900 transition-all cursor-pointer"
                      >
                        Edit Record
                        <ArrowUpRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
