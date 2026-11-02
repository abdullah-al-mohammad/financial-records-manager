import SalesPaymentEffects from './SalesPaymentEffects';

// Drawer section 3: customer payment method, funding source, live accounting
// effects and the customer grand total.
export default function SalesPaymentSection({ form, handleChange }) {
  return (
    <div className="rounded-2xl border border-emerald-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-emerald-950/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold">
          3
        </span>
        <h3 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
          Payment Method
        </h3>
      </div>

      <div className="group">
        <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-emerald-400 transition-colors">
          Customer Payment Method
        </label>
        <select
          name="digitalPaymentMethod"
          value={form.digitalPaymentMethod}
          onChange={handleChange}
          className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
        >
          <option value="">Cash / Physical Collection</option>
          <optgroup label="── Online Payment Methods ──">
            <option value="online">Online Payment (No Cash Deduction)</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
            <option value="rocket">Rocket</option>
          </optgroup>
        </select>
      </div>

      {['bkash', 'nagad', 'rocket'].includes(
        String(form.digitalPaymentMethod || '').toLowerCase()
      ) && (
        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-emerald-400 transition-colors">
            Order Funded By
            <span className="ml-1.5 text-slate-600 normal-case font-normal text-[9px]">
              (where was the purchase money from?)
            </span>
          </label>
          <select
            name="paymentSource"
            value={form.paymentSource || 'cash'}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="cash">Hand Cash (order bought using physical cash)</option>
            <option value="online">Online Balance (order bought using online funds)</option>
            <option value="other_cash">Other Cash (loan / asset sale etc.)</option>
          </select>
        </div>
      )}

      <SalesPaymentEffects form={form} />

      <div className="relative overflow-hidden rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-950/50 to-slate-950/80 p-4 flex items-center justify-between shadow-lg">
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: 'radial-gradient(circle at 20% 50%, #10b981 0%, transparent 60%)',
          }}
        />
        <div className="relative">
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Customer Grand Total
          </p>
          <p className="text-[9px] text-slate-600 mt-0.5">Sales + Delivery − Discount</p>
        </div>
        <span className="relative text-xl font-black text-emerald-400 tabular-nums tracking-tight">
          ৳{form.paidByCustomer}
        </span>
      </div>
    </div>
  );
}
