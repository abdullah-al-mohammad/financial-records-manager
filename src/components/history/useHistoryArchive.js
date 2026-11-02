import { useEffect, useMemo, useState } from 'react';
import {
  buildMonthlyMetricsSummary,
  buildTargetMonthData,
  collectAvailableMonths,
} from './historyLogic';

// Owns archive month selection and the derived monthly/target-month data.
export default function useHistoryArchive({ records, payments, transfers = [] }) {
  const [selectedMonth, setSelectedMonth] = useState('');

  const availableMonths = useMemo(
    () => collectAvailableMonths(records, payments, transfers),
    [records, payments, transfers]
  );

  useEffect(() => {
    if (!selectedMonth && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[availableMonths.length - 1]);
    }
  }, [availableMonths, selectedMonth]);

  const monthlyMetricsSummary = useMemo(() => buildMonthlyMetricsSummary(records), [records]);

  const targetMonthData = useMemo(
    () => buildTargetMonthData({ records, payments, transfers, selectedMonth }),
    [records, payments, transfers, selectedMonth]
  );

  return {
    selectedMonth,
    setSelectedMonth,
    availableMonths,
    monthlyMetricsSummary,
    targetMonthData,
  };
}
