import { useMemo } from 'react';
import { computeNetCashBalance } from '../../utils/finance';
import {
  buildMonthKey,
  computeDashboardStats,
  computeExpensePieData,
  computeMaxMomVal,
  computeMomData,
  computePaymentTotals,
  computePendingPayables,
  computePendingReceivables,
  computePreviousMonthDues,
  computeTopMerchants,
  resolveOpeningBalanceForMonth,
} from './dashboardLogic';

// Derives every figure the dashboard needs from the raw data props.
// Keeps financial calculations out of the UI components.
export default function useDashboardData({
  records,
  payments,
  transfers = [],
  receivables = [],
  payables = [],
  otherCashRecords = [],
  monthClosings = [],
  openingBalances = [],
  currentOpeningBalance = null,
}) {
  const now = new Date();
  const currentMonthKey = buildMonthKey(now);
  const currentMonthName = now.toLocaleString('default', { month: 'long' });
  const currentYear = now.getFullYear();

  const balanceSummary = useMemo(() => {
    // Derive the opening balance that applies to the current month. If this
    // month has no opening record yet, the most recent earlier opening is
    // carried forward so the calendar rollover does not drop the amount.
    const openingForThisMonth = resolveOpeningBalanceForMonth(
      openingBalances,
      currentMonthKey,
      currentOpeningBalance
    );

    return computeNetCashBalance(
      records,
      payments || [],
      transfers || [],
      receivables || [],
      payables || [],
      openingForThisMonth,
      otherCashRecords || []
    );
  }, [
    records,
    payments,
    transfers,
    receivables,
    payables,
    openingBalances,
    currentOpeningBalance,
    otherCashRecords,
    currentMonthKey,
  ]);

  // Resolved opening balance for the current month — same lookup used by balanceSummary,
  // exposed separately so the UI formula display and card sub-labels can reference it.
  const resolvedOpeningBalance = useMemo(
    () => resolveOpeningBalanceForMonth(openingBalances, currentMonthKey, currentOpeningBalance),
    [openingBalances, currentOpeningBalance, currentMonthKey]
  );

  const paymentTotals = useMemo(
    () => computePaymentTotals(balanceSummary),
    [balanceSummary]
  );

  const stats = useMemo(
    () => computeDashboardStats(records, payments, otherCashRecords),
    [records, payments, otherCashRecords]
  );

  const pendingReceivables = useMemo(
    () => computePendingReceivables(receivables),
    [receivables]
  );

  const pendingPayables = useMemo(() => computePendingPayables(payables), [payables]);

  const momData = useMemo(() => computeMomData(records), [records]);

  const topMerchants = useMemo(() => computeTopMerchants(records), [records]);

  const previousMonthDues = useMemo(
    () => computePreviousMonthDues(records, payments),
    [records, payments]
  );

  const expensePieData = useMemo(() => computeExpensePieData(stats), [stats]);

  const maxMoMVal = useMemo(() => computeMaxMomVal(momData), [momData]);

  const sortedClosings = useMemo(
    () => [...monthClosings].sort((a, b) => b.monthKey.localeCompare(a.monthKey)),
    [monthClosings]
  );

  // Latest closing strictly before the current month — the carry-forward source
  const previousMonthClosing = useMemo(
    () => sortedClosings.find(c => c.monthKey < currentMonthKey) || null,
    [sortedClosings, currentMonthKey]
  );

  const isCurrentMonthClosed = monthClosings.some(c => c.monthKey === currentMonthKey);

  // Opening balance source label for the current month
  const openingSource = resolvedOpeningBalance
    ? resolvedOpeningBalance.source === 'carried_forward'
      ? 'carryforward'
      : 'manual'
    : null;

  return {
    currentMonthKey,
    currentMonthName,
    currentYear,
    balanceSummary,
    resolvedOpeningBalance,
    paymentTotals,
    stats,
    pendingReceivables,
    pendingPayables,
    momData,
    topMerchants,
    previousMonthDues,
    expensePieData,
    maxMoMVal,
    sortedClosings,
    previousMonthClosing,
    isCurrentMonthClosed,
    openingSource,
  };
}
