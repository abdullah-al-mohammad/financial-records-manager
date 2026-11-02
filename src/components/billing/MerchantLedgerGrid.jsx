import MerchantLedgerCard from './MerchantLedgerCard';

// Responsive grid of merchant ledger cards with an empty state.
export default function MerchantLedgerGrid({ filteredLedger, onViewHistory }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredLedger.length === 0 ? (
        <div className="col-span-full py-8 text-center text-xs text-slate-500">
          No merchant logs found.
        </div>
      ) : (
        filteredLedger.map(m => (
          <MerchantLedgerCard key={m.name} merchant={m} onViewHistory={onViewHistory} />
        ))
      )}
    </div>
  );
}
