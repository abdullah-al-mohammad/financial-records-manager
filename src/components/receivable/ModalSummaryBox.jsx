// Name + amount summary block shared by the receive/pay confirmation modals.
export default function ModalSummaryBox({
  nameLabel,
  name,
  amountLabel,
  amount,
  amountClassName,
  note,
}) {
  return (
    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{nameLabel}</span>
        <span className="font-bold text-white">{name}</span>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">{amountLabel}</span>
        <span className={`font-bold text-base ${amountClassName}`}>{amount}</span>
      </div>
      {note && (
        <div className="pt-2 border-t border-slate-800/60 text-[11px] text-slate-400">
          <span className="text-slate-500">Note: </span>
          {note}
        </div>
      )}
    </div>
  );
}
