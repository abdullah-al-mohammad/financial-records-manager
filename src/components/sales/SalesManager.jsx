import { useState } from 'react';
import SalesCsvImportModal from './SalesCsvImportModal';
import SalesFilters from './SalesFilters';
import SalesFormDrawer from './SalesFormDrawer';
import SalesHeader from './SalesHeader';
import SalesTable from './SalesTable';
import { countSalesRecords } from './salesLogic';
import useSalesFilters from './useSalesFilters';
import useSalesForm from './useSalesForm';
import { buildSalesCsv, csvFileName, downloadCsv } from '../../utils/csvUtils';

export default function SalesManager({
  records,
  payments,
  merchants,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onDeleteAllRecords,
  onAddMerchant,
  onImportRecords,
  editTarget,
  clearEditTarget,
}) {
  const [isCsvOpen, setIsCsvOpen] = useState(false);

  const {
    searchTerm,
    setSearchTerm,
    filterMonth,
    setFilterMonth,
    filterType,
    setFilterType,
    showFilters,
    setShowFilters,
    filteredRecords,
  } = useSalesFilters(records);

  const {
    isOpen,
    form,
    editingId,
    isSubmitting,
    showAddMerchant,
    newMerchant,
    setNewMerchant,
    handleChange,
    handleOpenNew,
    handleOpenEdit,
    handleSubmit,
    handleAddNewMerchant,
    toggleAddMerchant,
    closeForm,
  } = useSalesForm({ onAddRecord, onUpdateRecord, onAddMerchant, editTarget, clearEditTarget });

  const handleDeleteAll = async () => {
    const totalRecords = countSalesRecords(records);
    if (!totalRecords) return;
    const confirmed = window.confirm(
      `Delete ALL ${totalRecords} sales ${totalRecords === 1 ? 'record' : 'records'} permanently? This cannot be undone.`
    );
    if (!confirmed) return;
    await onDeleteAllRecords();
  };

  const handleExport = () => {
    downloadCsv(csvFileName('sales-records'), buildSalesCsv(filteredRecords));
  };

  return (
    <div className="space-y-6">
      <SalesHeader
        entryCount={filteredRecords.length}
        showFilters={showFilters}
        onToggleFilters={() => setShowFilters(!showFilters)}
        onDeleteAll={handleDeleteAll}
        onNewEntry={handleOpenNew}
        onImport={() => setIsCsvOpen(true)}
        onExport={handleExport}
        exportDisabled={filteredRecords.length === 0}
      />

      {(showFilters || searchTerm) && (
        <SalesFilters
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          filterMonth={filterMonth}
          onMonthChange={setFilterMonth}
          filterType={filterType}
          onTypeChange={setFilterType}
        />
      )}

      <SalesTable records={filteredRecords} onEdit={handleOpenEdit} onDelete={onDeleteRecord} />

      <SalesFormDrawer
        isOpen={isOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        form={form}
        handleChange={handleChange}
        merchants={merchants}
        editingId={editingId}
        isSubmitting={isSubmitting}
        showAddMerchant={showAddMerchant}
        onToggleAddMerchant={toggleAddMerchant}
        newMerchant={newMerchant}
        onNewMerchantChange={setNewMerchant}
        onAddNewMerchant={handleAddNewMerchant}
      />

      <SalesCsvImportModal
        open={isCsvOpen}
        onClose={() => setIsCsvOpen(false)}
        existingRecords={records}
        onImport={onImportRecords}
      />
    </div>
  );
}
