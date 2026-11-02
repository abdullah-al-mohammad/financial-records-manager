import ExpenseCategoryChart from './ExpenseCategoryChart';
import ExpenseFilters from './ExpenseFilters';
import ExpenseFormDrawer from './ExpenseFormDrawer';
import ExpenseHeader from './ExpenseHeader';
import ExpenseRulesPanel from './ExpenseRulesPanel';
import ExpenseSummaryCards from './ExpenseSummaryCards';
import ExpenseTable from './ExpenseTable';
import { buildRecordAfterItemRemoval, hasRemainingExpenses } from './expenseLogic';
import useExpenseFilters from './useExpenseFilters';
import useExpenseForm from './useExpenseForm';
import useExpenseLedger from './useExpenseLedger';
import { buildExpensesCsv, csvFileName, downloadCsv } from '../../utils/csvUtils';

export default function ExpenseManager({
  records,
  payments,
  merchants,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
  onAddMerchant,
}) {
  const { cashBalance, stats, itemizedExpenses, maxBarVal } = useExpenseLedger(records, payments);

  const { searchTerm, setSearchTerm, filterCategory, setFilterCategory, filteredItems } =
    useExpenseFilters(itemizedExpenses);

  const {
    form,
    isOpen,
    editingRecord,
    isSubmitting,
    showAddMerchant,
    newMerchant,
    setNewMerchant,
    setShowAddMerchant,
    handleChange,
    handleOpenNew,
    handleOpenEdit,
    handleSubmit,
    handleAddNewMerchant,
    closeForm,
  } = useExpenseForm({ onAddRecord, onUpdateRecord, onAddMerchant });

  const handleDeleteItem = async item => {
    if (!item?.originalRecord?.id) return;
    const record = item.originalRecord;
    const hasSales = (parseFloat(record.salesAmount) || 0) > 0;
    const otherExpensesRemaining = hasRemainingExpenses(record, item.field);

    if (!hasSales && !otherExpensesRemaining) {
      if (window.confirm('Delete this expense entry permanently?')) {
        await onDeleteRecord(record.id);
      }
      return;
    }

    const confirmMsg = hasSales
      ? 'Remove this expense line from the linked sales record?'
      : 'Remove this expense line? Other expenses on this record will be preserved.';
    if (!window.confirm(confirmMsg)) return;

    await onUpdateRecord(buildRecordAfterItemRemoval(record, item.field));
  };

  return (
    <div className="space-y-6">
      <ExpenseHeader
        onNewExpense={handleOpenNew}
        onExport={() => downloadCsv(csvFileName('expenses'), buildExpensesCsv(filteredItems))}
        exportDisabled={filteredItems.length === 0}
      />

      <ExpenseSummaryCards cashBalance={cashBalance} stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ExpenseCategoryChart stats={stats} maxBarVal={maxBarVal} />
        <ExpenseRulesPanel itemizedCount={itemizedExpenses.length} />
      </div>

      <ExpenseFilters
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        filterCategory={filterCategory}
        onCategoryChange={setFilterCategory}
      />

      <ExpenseTable items={filteredItems} onEdit={handleOpenEdit} onDelete={handleDeleteItem} />

      <ExpenseFormDrawer
        isOpen={isOpen}
        onClose={closeForm}
        onSubmit={handleSubmit}
        form={form}
        handleChange={handleChange}
        merchants={merchants}
        editingRecord={editingRecord}
        isSubmitting={isSubmitting}
        showAddMerchant={showAddMerchant}
        onToggleAddMerchant={() => setShowAddMerchant(!showAddMerchant)}
        newMerchant={newMerchant}
        onNewMerchantChange={setNewMerchant}
        onAddNewMerchant={handleAddNewMerchant}
      />
    </div>
  );
}
