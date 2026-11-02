import { SALES_TYPES } from './salesLogic';

// Drawer section 2: sales amount, type, commission, discount and delivery.
export default function SalesCoreSection({ form, handleChange }) {
  return (
    <div className="rounded-2xl border border-violet-500/10 bg-gradient-to-br from-slate-900/80 to-slate-950/90 p-4 space-y-4 shadow-lg shadow-violet-950/10">
      <div className="flex items-center gap-2 mb-1">
        <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-500/20 text-violet-300 text-[10px] font-bold">
          2
        </span>
        <h3 className="text-[10px] font-bold text-violet-400 uppercase tracking-widest">
          Sales Transaction Core
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
            Sales Amount (৳)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
              ৳
            </span>
            <input
              type="number"
              name="salesAmount"
              value={form.salesAmount}
              onChange={handleChange}
              placeholder="0.00"
              className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
            />
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
            Sales Type
          </label>
          <select
            name="salesType"
            value={form.salesType}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
          >
            {SALES_TYPES.map(t => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
            Com. %
          </label>
          <select
            name="commissionPercent"
            value={form.commissionPercent}
            onChange={handleChange}
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 cursor-pointer"
          >
            <option value="15">15%</option>
            <option value="10">10%</option>
            <option value="5">5%</option>
            <option value="0">0%</option>
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
            Com. Amount
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={`৳${form.commissionAmount}`}
              className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
              AUTO
            </span>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
            Merchant Bill
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={`৳${form.merchantBill}`}
              className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
              title="Sales - Commission"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
              AUTO
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
            Disc. %
          </label>
          <input
            type="number"
            name="discountPercent"
            value={form.discountPercent}
            onChange={handleChange}
            placeholder="0"
            className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl px-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
          />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-slate-600 uppercase tracking-widest mb-1.5">
            Disc. Amount
          </label>
          <div className="relative">
            <input
              type="text"
              readOnly
              value={`৳${form.discountAmount}`}
              className="w-full bg-slate-900/60 border border-slate-800/80 text-slate-500 rounded-xl px-3 py-2.5 text-xs font-mono select-none cursor-not-allowed"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[8px] text-slate-700 font-bold tracking-wider">
              AUTO
            </span>
          </div>
        </div>

        <div className="group">
          <label className="block text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-1.5 group-focus-within:text-violet-400 transition-colors">
            Delivery Fee
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold pointer-events-none">
              ৳
            </span>
            <input
              type="number"
              name="deliveryCharge"
              value={form.deliveryCharge}
              onChange={handleChange}
              placeholder="0"
              className="w-full bg-slate-950/70 border border-slate-700/60 hover:border-slate-600 focus:border-violet-500 focus:ring-2 focus:ring-violet-500/20 rounded-xl pl-7 pr-3 py-2.5 text-xs text-white outline-none transition-all duration-200 font-mono"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
