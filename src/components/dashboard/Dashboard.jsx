import CashSummarySection from './CashSummarySection';
import DashboardCharts from './DashboardCharts';
import DashboardExtraCards from './DashboardExtraCards';
import DashboardHeader from './DashboardHeader';
import DashboardLeaderboards from './DashboardLeaderboards';
import DashboardMetricCards from './DashboardMetricCards';
import DashboardOverviewTable from './DashboardOverviewTable';
import MonthClosingModal from './MonthClosingModal';
import OpeningBalanceModal from './OpeningBalanceModal';
import TransferModal from './TransferModal';
import useDashboardData from './useDashboardData';
import useDashboardModals from './useDashboardModals';

export default function Dashboard({
  records,
  payments,
  transfers = [],
  receivables = [],
  payables = [],
  otherCashRecords = [],
  setActiveTab,
  onAddTransfer,
  onDeleteTransfer,
  monthClosings = [],
  openingBalances = [],
  currentOpeningBalance = null,
  onAddMonthClosing,
  onSetOpeningBalance,
  onDeleteOpeningBalance,
}) {
  const {
    currentMonthKey,
    currentMonthName,
    currentYear,
    resolvedOpeningBalance,
    paymentTotals,
    stats,
    pendingReceivables,
    pendingPayables,
    momData,
    topMerchants,
    previousMonthDues,
    expensePieData,
    maxMoMVal,
    sortedClosings,
    previousMonthClosing,
    isCurrentMonthClosed,
    openingSource,
  } = useDashboardData({
    records,
    payments,
    transfers,
    receivables,
    payables,
    otherCashRecords,
    monthClosings,
    openingBalances,
    currentOpeningBalance,
  });

  const {
    showTransferModal,
    setShowTransferModal,
    transferType,
    setTransferType,
    transferAmount,
    setTransferAmount,
    transferDate,
    setTransferDate,
    transferNote,
    setTransferNote,
    transferSubmitting,
    handleTransferSubmit,
    showCloseModal,
    setShowCloseModal,
    closeSubmitting,
    handleCloseMonth,
    showClosingHistory,
    setShowClosingHistory,
    showOpeningModal,
    setShowOpeningModal,
    obHand,
    setObHand,
    obOnline,
    setObOnline,
    obOther,
    setObOther,
    obSource,
    obFromMonthKey,
    obSubmitting,
    showOpeningHistory,
    setShowOpeningHistory,
    openOpeningModal,
    handleCarryForward,
    handleSaveOpeningBalance,
    handleRemoveOpeningBalance,
  } = useDashboardModals({
    currentMonthKey,
    currentMonthName,
    currentYear,
    paymentTotals,
    resolvedOpeningBalance,
    previousMonthClosing,
    onAddTransfer,
    onAddMonthClosing,
    onSetOpeningBalance,
    onDeleteOpeningBalance,
  });

  const openTransferModal = () => setShowTransferModal(true);

  return (
    <>
      <div className="space-y-8 pb-10">
        <DashboardHeader setActiveTab={setActiveTab} onOpenTransfer={openTransferModal} />

        <DashboardOverviewTable stats={stats} />

        <DashboardMetricCards stats={stats} />

        <DashboardExtraCards
          stats={stats}
          pendingReceivables={pendingReceivables}
          pendingPayables={pendingPayables}
          setActiveTab={setActiveTab}
        />

        <CashSummarySection
          paymentTotals={paymentTotals}
          resolvedOpeningBalance={resolvedOpeningBalance}
          previousMonthClosing={previousMonthClosing}
          openingSource={openingSource}
          currentMonthName={currentMonthName}
          currentYear={currentYear}
          currentMonthKey={currentMonthKey}
          isCurrentMonthClosed={isCurrentMonthClosed}
          monthClosings={monthClosings}
          sortedClosings={sortedClosings}
          openingBalances={openingBalances}
          showClosingHistory={showClosingHistory}
          showOpeningHistory={showOpeningHistory}
          onToggleClosingHistory={() => setShowClosingHistory(v => !v)}
          onToggleOpeningHistory={() => setShowOpeningHistory(v => !v)}
          onOpenOpeningModal={openOpeningModal}
          onOpenCloseModal={() => setShowCloseModal(true)}
          onOpenTransfer={openTransferModal}
          onRemoveOpeningBalance={handleRemoveOpeningBalance}
          onCarryForward={handleCarryForward}
          setActiveTab={setActiveTab}
        />

        {showCloseModal && (
          <MonthClosingModal
            onClose={() => setShowCloseModal(false)}
            onConfirm={handleCloseMonth}
            closeSubmitting={closeSubmitting}
            currentMonthName={currentMonthName}
            currentYear={currentYear}
            paymentTotals={paymentTotals}
          />
        )}

        {showOpeningModal && (
          <OpeningBalanceModal
            onClose={() => setShowOpeningModal(false)}
            currentMonthName={currentMonthName}
            currentYear={currentYear}
            obSource={obSource}
            obFromMonthKey={obFromMonthKey}
            previousMonthClosing={previousMonthClosing}
            onCarryForward={handleCarryForward}
            obHand={obHand}
            setObHand={setObHand}
            obOnline={obOnline}
            setObOnline={setObOnline}
            obOther={obOther}
            setObOther={setObOther}
            onSave={handleSaveOpeningBalance}
            obSubmitting={obSubmitting}
          />
        )}

        <DashboardCharts
          momData={momData}
          maxMoMVal={maxMoMVal}
          stats={stats}
          expensePieData={expensePieData}
        />

        <DashboardLeaderboards
          topMerchants={topMerchants}
          stats={stats}
          previousMonthDues={previousMonthDues}
          records={records}
        />
      </div>

      {showTransferModal && (
        <TransferModal
          onClose={() => setShowTransferModal(false)}
          transferType={transferType}
          setTransferType={setTransferType}
          transferAmount={transferAmount}
          setTransferAmount={setTransferAmount}
          transferDate={transferDate}
          setTransferDate={setTransferDate}
          transferNote={transferNote}
          setTransferNote={setTransferNote}
          transferSubmitting={transferSubmitting}
          onSubmit={handleTransferSubmit}
        />
      )}
    </>
  );
}
