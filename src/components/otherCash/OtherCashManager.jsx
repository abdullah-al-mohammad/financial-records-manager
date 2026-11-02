import OtherCashFilters from './OtherCashFilters';
import OtherCashFormModal from './OtherCashFormModal';
import OtherCashHeader from './OtherCashHeader';
import OtherCashSummaryCards from './OtherCashSummaryCards';
import OtherCashTable from './OtherCashTable';
import useOtherCashRecords from './useOtherCashRecords';
import { buildOtherCashCsv, csvFileName, downloadCsv } from '../../utils/csvUtils';

export default function OtherCashManager({
  otherCashRecords,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}) {
  const {
    isOpen,
    form,
    setForm,
    editingId,
    isSubmitting,
    searchTerm,
    setSearchTerm,
    filterMonth,
    setFilterMonth,
    filterType,
    setFilterType,
    handleOpenNew,
    handleOpenEdit,
    closeForm,
    handleSubmit,
    handleDelete,
    filteredRecords,
    summary,
  } = useOtherCashRecords({
    otherCashRecords,
    onAddRecord,
    onUpdateRecord,
    onDeleteRecord,
  });

  return (
    <div className="space-y-6 pb-10">
      <OtherCashHeader
        onOpenNew={handleOpenNew}
        onExport={() =>
          downloadCsv(csvFileName('other-cash-records'), buildOtherCashCsv(filteredRecords))
        }
        exportDisabled={filteredRecords.length === 0}
      />

      <OtherCashSummaryCards summary={summary} />

      <OtherCashFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterMonth={filterMonth}
        onMonthChange={setFilterMonth}
        filterType={filterType}
        onTypeChange={setFilterType}
      />

      <OtherCashTable records={filteredRecords} onEdit={handleOpenEdit} onDelete={handleDelete} />

      <OtherCashFormModal
        isOpen={isOpen}
        form={form}
        setForm={setForm}
        editingId={editingId}
        isSubmitting={isSubmitting}
        onSubmit={handleSubmit}
        onClose={closeForm}
      />
    </div>
  );
}
