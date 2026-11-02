import { DollarSign, Receipt, ShoppingBag, TrendingDown, TrendingUp } from 'lucide-react';

// Four headline metric cards (sales, revenue, overheads, net profit).
export default function DashboardMetricCards({ stats }) {
  const cards = [
    {
      title: 'Gross Sales Volume',
      value: `৳${stats.sales.toLocaleString()}`,
      icon: ShoppingBag,
      glow: 'rgba(99, 102, 241, 0.08)',
      accent: 'border-indigo-500/25',
      text: 'text-indigo-400',
      bg: 'bg-indigo-500/10',
      subtitle: 'Total transactions registered',
    },
    {
      title: 'Total Revenue (Income)',
      value: `৳${stats.income.toLocaleString()}`,
      icon: DollarSign,
      glow: 'rgba(16, 185, 129, 0.08)',
      accent: 'border-emerald-500/25',
      text: 'text-emerald-400',
      bg: 'bg-emerald-500/10',
      subtitle: 'Commissions + Delivery charges',
    },
    {
      title: 'Aggregate Overheads',
      value: `৳${stats.expenses.toLocaleString()}`,
      icon: Receipt,
      glow: 'rgba(244, 63, 94, 0.08)',
      accent: 'border-rose-500/25',
      text: 'text-rose-400',
      bg: 'bg-rose-500/10',
      subtitle: 'Salaries, fixed & other expenses',
    },
    {
      title: 'Net Profit / Loss',
      value: `${stats.netProfit < 0 ? '-' : ''}৳${Math.abs(stats.netProfit).toLocaleString()}`,
      icon: stats.netProfit >= 0 ? TrendingUp : TrendingDown,
      glow: stats.netProfit >= 0 ? 'rgba(16, 185, 129, 0.08)' : 'rgba(244, 63, 94, 0.08)',
      accent: stats.netProfit >= 0 ? 'border-emerald-500/25' : 'border-rose-500/25',
      text: stats.netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400',
      bg: stats.netProfit >= 0 ? 'bg-emerald-500/10' : 'bg-rose-500/10',
      subtitle: 'Net income minus expenses',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c, i) => {
        const Icon = c.icon;
        return (
          <div
            key={i}
            className={`glass-panel glass-card-hover rounded-2xl p-5 border ${c.accent} relative overflow-hidden`}
            style={{ boxShadow: `0 8px 32px 0 rgba(0, 0, 0, 0.25), 0 0 16px ${c.glow}` }}
          >
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                {c.title}
              </span>
              <div className={`p-2.5 rounded-xl ${c.bg} ${c.text}`}>
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
  );
}
