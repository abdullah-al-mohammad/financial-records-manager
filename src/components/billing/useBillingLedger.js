import { useMemo, useState } from 'react';
import {
  MONTHS,
  buildBillingLedger,
  computeAggregateTotals,
  filterLedgerBySearch,
} from './billingLogic';

// Owns the billing cycle selection, carry-forward flag, search and the
// derived per-merchant ledger plus aggregate totals.
export default function useBillingLedger({ records, payments, merchants }) {
  const [selectedMonth, setSelectedMonth] = useState(MONTHS[new Date().getMonth()]);
  const [carryForward, setCarryForward] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const billingLedger = useMemo(
    () => buildBillingLedger({ records, payments, merchants, selectedMonth, carryForward }),
    [records, payments, merchants, selectedMonth, carryForward]
  );

  const filteredLedger = useMemo(
    () => filterLedgerBySearch(billingLedger, searchTerm),
    [billingLedger, searchTerm]
  );

  const aggregateTotals = useMemo(
    () => computeAggregateTotals(filteredLedger, payments, selectedMonth),
    [filteredLedger, payments, selectedMonth]
  );

  return {
    selectedMonth,
    setSelectedMonth,
    carryForward,
    setCarryForward,
    searchTerm,
    setSearchTerm,
    billingLedger,
    filteredLedger,
    aggregateTotals,
  };
}
