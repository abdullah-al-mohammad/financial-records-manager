import ExpenseDonutChart from './ExpenseDonutChart';
import MomChart from './MomChart';

// Charts row: MoM volume columns + expense distribution donut.
export default function DashboardCharts({ momData, maxMoMVal, stats, expensePieData }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <MomChart momData={momData} maxMoMVal={maxMoMVal} />
      <ExpenseDonutChart expensePieData={expensePieData} stats={stats} />
    </div>
  );
}
