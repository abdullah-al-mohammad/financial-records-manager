import Drawer from '../shared/Drawer';
import SalesCoreSection from './SalesCoreSection';
import SalesDateMerchantSection from './SalesDateMerchantSection';
import SalesPaymentSection from './SalesPaymentSection';

// Right-side drawer containing the full create/edit sales form.
export default function SalesFormDrawer({
  isOpen,
  onClose,
  onSubmit,
  form,
  handleChange,
  merchants,
  editingId,
  isSubmitting,
  showAddMerchant,
  onToggleAddMerchant,
  newMerchant,
  onNewMerchantChange,
  onAddNewMerchant,
}) {
  return (
    <Drawer
      open={isOpen}
      onClose={onClose}
      onSubmit={onSubmit}
      formId="sales-record-form"
      title={editingId ? 'Modify Sales Record' : 'Create Sales Record'}
      subtitle="Input transactional fields with auto calculations"
      overlayClassName="transition-opacity"
      panelClassName="bg-[#0a0f1d] animate-slide-in"
      contentClassName="flex-col justify-between"
      bodyClassName="flex-1 overflow-y-auto p-5 space-y-5"
      bodyStyle={{ scrollbarWidth: 'thin', scrollbarColor: '#1e293b transparent' }}
      closeButtonClassName="p-1.5 rounded-xl border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-950 transition-all cursor-pointer"
      footer={
        <>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Close Panel
          </button>

          <button
            type="submit"
            form="sales-record-form"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSubmitting ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Saving Record...</span>
              </>
            ) : editingId ? (
              'Save Modifications'
            ) : (
              'Commit Record'
            )}
          </button>
        </>
      }
    >
      <SalesDateMerchantSection
        form={form}
        handleChange={handleChange}
        merchants={merchants}
        showAddMerchant={showAddMerchant}
        onToggleAddMerchant={onToggleAddMerchant}
        newMerchant={newMerchant}
        onNewMerchantChange={onNewMerchantChange}
        onAddNewMerchant={onAddNewMerchant}
      />

      <SalesCoreSection form={form} handleChange={handleChange} />

      <SalesPaymentSection form={form} handleChange={handleChange} />
    </Drawer>
  );
}
