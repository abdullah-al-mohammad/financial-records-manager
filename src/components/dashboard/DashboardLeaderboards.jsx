import PreviousMonthDuesCard from './PreviousMonthDuesCard';
import RecentRecordsCard from './RecentRecordsCard';
import TopMerchantsCard from './TopMerchantsCard';

// Bottom summaries row: top merchants, prior dues and recent records.
export default function DashboardLeaderboards({
  topMerchants,
  stats,
  previousMonthDues,
  records,
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <TopMerchantsCard topMerchants={topMerchants} stats={stats} />
      <PreviousMonthDuesCard previousMonthDues={previousMonthDues} />
      <RecentRecordsCard records={records} />
    </div>
  );
}
