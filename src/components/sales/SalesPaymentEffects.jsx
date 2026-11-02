// Live accounting-effect indicator shown while a payment method is selected.
export default function SalesPaymentEffects({ form }) {
  if (!form.digitalPaymentMethod) return null;

  const method = String(form.digitalPaymentMethod || '').toLowerCase();
  const isOnlineMethod = ['bkash', 'nagad', 'rocket'].includes(method);
  const source = form.paymentSource || 'cash';

  if (method === 'online') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Online Balance INCREASES by ৳{form.paidByCustomer || 0} (No purchase cost deduction)
      </div>
    );
  }

  if (isOnlineMethod && source === 'cash') {
    return (
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
          Hand Cash DECREASES by ৳{form.salesAmount || 0} (purchase cost)
        </div>
        <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Online Balance INCREASES by ৳{form.paidByCustomer || 0} (customer paid)
        </div>
      </div>
    );
  }

  if (isOnlineMethod && source === 'online') {
    return (
      <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
        Online Balance: ৳{form.paidByCustomer || 0} added, ৳{form.salesAmount || 0} deducted
      </div>
    );
  }

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
      Hand Cash: ৳{form.paidByCustomer || 0} added, ৳{form.salesAmount || 0} deducted
    </div>
  );
}
