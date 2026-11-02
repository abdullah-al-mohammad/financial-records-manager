import { AlertOctagon, DollarSign, Settings, UserCheck } from 'lucide-react';
import StatCard from '../shared/StatCard';

// Total-expenses card + the four expense category metric cards.
export default function ExpenseSummaryCards({ cashBalance, stats }) {
  const categoryCards = [
    {
      title: 'Total Operational Costs',
      value: `৳${stats.total.toLocaleString()}`,
      icon: DollarSign,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Rider Salary',
      value: `৳${stats.riders.toLocaleString()}`,
      icon: UserCheck,
      color: 'text-rose-400',
      bg: 'bg-rose-500/10',
    },
    {
      title: 'Fixed Costs',
      value: `৳${stats.fixed.toLocaleString()}`,
      icon: Settings,
      color: 'text-amber-400',
      bg: 'bg-amber-500/10',
    },
    {
      title: 'Other Expenses',
      value: `৳${stats.variable.toLocaleString()}`,
      icon: AlertOctagon,
      color: 'text-violet-400',
      bg: 'bg-violet-500/10',
    },
  ];

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Expenses"
          value={`৳${cashBalance.expenses.total.toLocaleString()}`}
          valueClassName="text-rose-400"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoryCards.map((card, index) => (
          <StatCard
            key={index}
            title={card.title}
            value={card.value}
            icon={card.icon}
            iconColor={card.color}
            iconBg={card.bg}
          />
        ))}
      </div>
    </>
  );
}
