import BillReportPanel from './BillReportPanel';
import BillingHeader from './BillingHeader';
import CycleOverview from './CycleOverview';
import DueReminderAlert from './DueReminderAlert';
import LedgerSearchBar from './LedgerSearchBar';
import MerchantLedgerGrid from './MerchantLedgerGrid';
import MerchantStatementDrawer from './MerchantStatementDrawer';
import PayoutForm from './PayoutForm';
import PrintableBillReport from './PrintableBillReport';
import RecentPaymentsLog from './RecentPaymentsLog';
import useBillReminders from './useBillReminders';
import useBillReport from './useBillReport';
import useBillingLedger from './useBillingLedger';
import usePayoutForm from './usePayoutForm';

export default function BillingManager({
  records,
  payments,
  merchants,
  onAddPayment,
  onUpdatePayment,
  onDeletePayment,
}) {
  const {
    focusedMerchant,
    closeMerchantStatement,
    billReportMerchant,
    setBillReportMerchant,
    billReportStartDate,
    setBillReportStartDate,
    billReportEndDate,
    setBillReportEndDate,
    activeReportMerchant,
    merchantBillReportData,
    handlePrintReport,
    openMerchantStatement,
  } = useBillReport({ records, payments });

  const { setBillReminders, dueBillReminders } = useBillReminders();

  const {
    paymentDate,
    setPaymentDate,
    selectedMerchant,
    setSelectedMerchant,
    paidAmount,
    setPaidAmount,
    notes,
    setNotes,
    editingPaymentId,
    isSubmitting,
    handlePaymentSubmit,
    startEditPayment,
    cancelEditPayment,
  } = usePayoutForm({ onAddPayment, onUpdatePayment, setBillReminders });

  const {
    selectedMonth,
    setSelectedMonth,
    carryForward,
    setCarryForward,
    searchTerm,
    setSearchTerm,
    billingLedger,
    filteredLedger,
    aggregateTotals,
  } = useBillingLedger({ records, payments, merchants });

  return (
    <div className="space-y-6">
      <BillingHeader selectedMonth={selectedMonth} onMonthChange={setSelectedMonth} />

      <DueReminderAlert dueBillReminders={dueBillReminders} />

      <BillReportPanel
        merchants={merchants}
        billReportMerchant={billReportMerchant}
        setBillReportMerchant={setBillReportMerchant}
        billReportStartDate={billReportStartDate}
        setBillReportStartDate={setBillReportStartDate}
        billReportEndDate={billReportEndDate}
        setBillReportEndDate={setBillReportEndDate}
        activeReportMerchant={activeReportMerchant}
        merchantBillReportData={merchantBillReportData}
        onPrint={handlePrintReport}
      />

      {/* Grid: Payment Entry Form & Dues Overview Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <PayoutForm
          paymentDate={paymentDate}
          setPaymentDate={setPaymentDate}
          merchants={merchants}
          selectedMerchant={selectedMerchant}
          setSelectedMerchant={setSelectedMerchant}
          paidAmount={paidAmount}
          setPaidAmount={setPaidAmount}
          notes={notes}
          setNotes={setNotes}
          editingPaymentId={editingPaymentId}
          isSubmitting={isSubmitting}
          onSubmit={handlePaymentSubmit}
          onCancelEdit={cancelEditPayment}
        />

        <CycleOverview
          selectedMonth={selectedMonth}
          carryForward={carryForward}
          setCarryForward={setCarryForward}
          aggregateTotals={aggregateTotals}
          billingLedger={billingLedger}
        />
      </div>

      <LedgerSearchBar searchTerm={searchTerm} onSearchChange={setSearchTerm} />

      <MerchantLedgerGrid filteredLedger={filteredLedger} onViewHistory={openMerchantStatement} />

      <RecentPaymentsLog
        payments={payments}
        onEditPayment={startEditPayment}
        onDeletePayment={onDeletePayment}
      />

      <MerchantStatementDrawer
        focusedMerchant={focusedMerchant}
        onClose={closeMerchantStatement}
        merchantBillReportData={merchantBillReportData}
        billReportStartDate={billReportStartDate}
        setBillReportStartDate={setBillReportStartDate}
        billReportEndDate={billReportEndDate}
        setBillReportEndDate={setBillReportEndDate}
        onPrint={handlePrintReport}
      />

      <PrintableBillReport
        activeReportMerchant={activeReportMerchant}
        merchantBillReportData={merchantBillReportData}
        billReportStartDate={billReportStartDate}
        billReportEndDate={billReportEndDate}
      />
    </div>
  );
}
