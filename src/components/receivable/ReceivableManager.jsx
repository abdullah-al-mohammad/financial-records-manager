import { useState } from 'react';
import PayableFormModal from './PayableFormModal';
import PayableSection from './PayableSection';
import PayPayableModal from './PayPayableModal';
import ReceivableFormModal from './ReceivableFormModal';
import ReceivableHeader from './ReceivableHeader';
import ReceivableSection from './ReceivableSection';
import ReceivableTabs from './ReceivableTabs';
import ReceiveMoneyModal from './ReceiveMoneyModal';
import usePayables from './usePayables';
import useReceivables from './useReceivables';
import {
  buildPayablesCsv,
  buildReceivablesCsv,
  csvFileName,
  downloadCsv,
} from '../../utils/csvUtils';

export default function ReceivableManager({
  receivables = [],
  onAddReceivable,
  onUpdateReceivable,
  onDeleteReceivable,
  payables = [],
  onAddPayable,
  onUpdatePayable,
  onDeletePayable,
}) {
  const [activeTab, setActiveTab] = useState('receivable');

  const {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    accountFilter,
    setAccountFilter,
    showAddEditModal,
    setShowAddEditModal,
    editingRecord,
    showReceiveModal,
    setShowReceiveModal,
    receivingRecord,
    form,
    setForm,
    receiveForm,
    setReceiveForm,
    isSubmitting,
    stats,
    filteredRecords,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenReceive,
    handleSaveRecord,
    handleConfirmReceive,
    handleRevertStatus,
    handleDelete,
  } = useReceivables({ receivables, onAddReceivable, onUpdateReceivable, onDeleteReceivable });

  const {
    paySearchQuery,
    setPaySearchQuery,
    payStatusFilter,
    setPayStatusFilter,
    payAccountFilter,
    setPayAccountFilter,
    showPayAddEditModal,
    setShowPayAddEditModal,
    editingPayable,
    payForm,
    setPayForm,
    showPayModal,
    setShowPayModal,
    payingRecord,
    payModal,
    setPayModal,
    isPaySubmitting,
    payStats,
    filteredPayables,
    handleOpenPayAdd,
    handleOpenPayEdit,
    handleSavePayable,
    handleOpenPayModal,
    handleConfirmPay,
    handleRevertPayStatus,
    handleDeletePayable,
  } = usePayables({ payables, onAddPayable, onUpdatePayable, onDeletePayable });

  return (
    <div className="space-y-6">
      <ReceivableHeader
        activeTab={activeTab}
        onAddReceivable={handleOpenAdd}
        onAddPayable={handleOpenPayAdd}
        onExport={() => {
          if (activeTab === 'payable') {
            downloadCsv(csvFileName('payables'), buildPayablesCsv(filteredPayables));
          } else {
            downloadCsv(csvFileName('receivables'), buildReceivablesCsv(filteredRecords));
          }
        }}
        exportDisabled={
          activeTab === 'payable' ? filteredPayables.length === 0 : filteredRecords.length === 0
        }
      />

      <ReceivableTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        receivablePendingCount={stats.pendingCount}
        payableUnpaidCount={payStats.unpaidCount}
      />

      {activeTab === 'payable' ? (
        <PayableSection
          payStats={payStats}
          payableCount={payables.length}
          paySearchQuery={paySearchQuery}
          onSearchChange={setPaySearchQuery}
          payStatusFilter={payStatusFilter}
          onStatusChange={setPayStatusFilter}
          payAccountFilter={payAccountFilter}
          onAccountChange={setPayAccountFilter}
          filteredPayables={filteredPayables}
          onAdd={handleOpenPayAdd}
          onPay={handleOpenPayModal}
          onRevert={handleRevertPayStatus}
          onEdit={handleOpenPayEdit}
          onDelete={handleDeletePayable}
        />
      ) : (
        <ReceivableSection
          stats={stats}
          receivableCount={receivables.length}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          accountFilter={accountFilter}
          onAccountChange={setAccountFilter}
          filteredRecords={filteredRecords}
          onAdd={handleOpenAdd}
          onReceive={handleOpenReceive}
          onRevert={handleRevertStatus}
          onEdit={handleOpenEdit}
          onDelete={handleDelete}
        />
      )}

      <PayPayableModal
        open={showPayModal}
        onClose={() => setShowPayModal(false)}
        payingRecord={payingRecord}
        payModal={payModal}
        setPayModal={setPayModal}
        isPaySubmitting={isPaySubmitting}
        onSubmit={handleConfirmPay}
      />

      <PayableFormModal
        open={showPayAddEditModal}
        onClose={() => setShowPayAddEditModal(false)}
        editingPayable={editingPayable}
        payForm={payForm}
        setPayForm={setPayForm}
        isPaySubmitting={isPaySubmitting}
        onSubmit={handleSavePayable}
      />

      <ReceiveMoneyModal
        open={showReceiveModal}
        onClose={() => setShowReceiveModal(false)}
        receivingRecord={receivingRecord}
        receiveForm={receiveForm}
        setReceiveForm={setReceiveForm}
        isSubmitting={isSubmitting}
        onSubmit={handleConfirmReceive}
      />

      <ReceivableFormModal
        open={showAddEditModal}
        onClose={() => setShowAddEditModal(false)}
        editingRecord={editingRecord}
        form={form}
        setForm={setForm}
        isSubmitting={isSubmitting}
        onSubmit={handleSaveRecord}
      />
    </div>
  );
}
