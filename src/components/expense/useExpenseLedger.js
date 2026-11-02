import { useMemo } from 'react';
import { computeNetCashBalance, sumExpensesFromRecords } from '../../utils/finance';
import { buildItemizedExpenses } from './expenseLogic';

// Derives all expense-section figures from the raw records/payments.
// Keeps financial calculations out of the UI components.
export default function useExpenseLedger(records, payments) {
  const cashBalance = useMemo(() => computeNetCashBalance(records, payments), [records, payments]);
  const stats = useMemo(() => sumExpensesFromRecords(records), [records]);
  const itemizedExpenses = useMemo(() => buildItemizedExpenses(records), [records]);

  const maxBarVal = Math.max(stats.riders, stats.fixed, stats.variable, stats.discounts || 0, 100);

  return { cashBalance, stats, itemizedExpenses, maxBarVal };
}
