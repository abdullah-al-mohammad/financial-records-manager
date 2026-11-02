import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { buildMerchantBillReport } from './billingLogic';

// Owns the merchant statement / bill-report state and print behaviour.
export default function useBillReport({ records, payments }) {
  // Selected merchant for ledger view
  const [focusedMerchant, setFocusedMerchant] = useState(null);

  // Merchant bill report (date range + print)
  const [billReportMerchant, setBillReportMerchant] = useState('');
  const [billReportStartDate, setBillReportStartDate] = useState('');
  const [billReportEndDate, setBillReportEndDate] = useState('');

  const activeReportMerchant = billReportMerchant || focusedMerchant;

  const merchantBillReportData = useMemo(
    () =>
      buildMerchantBillReport({
        records,
        payments,
        merchant: activeReportMerchant,
        startDate: billReportStartDate,
        endDate: billReportEndDate,
      }),
    [activeReportMerchant, records, payments, billReportStartDate, billReportEndDate]
  );

  const handlePrintReport = () => {
    if (!activeReportMerchant) {
      toast.error('Please select a merchant first.');
      return;
    }
    if (!billReportStartDate || !billReportEndDate) {
      toast.error('Please select both a start date and end date for the bill report.');
      return;
    }
    if (billReportStartDate > billReportEndDate) {
      toast.error('Start date cannot be after end date.');
      return;
    }

    document.body.classList.add('print-report-only');
    const cleanup = () => {
      document.body.classList.remove('print-report-only');
      window.removeEventListener('afterprint', cleanup);
    };
    window.addEventListener('afterprint', cleanup);
    window.print();
  };

  const openMerchantStatement = merchantName => {
    setBillReportMerchant(merchantName);
    setFocusedMerchant(merchantName);
  };

  const closeMerchantStatement = () => setFocusedMerchant(null);

  return {
    focusedMerchant,
    closeMerchantStatement,
    billReportMerchant,
    setBillReportMerchant,
    billReportStartDate,
    setBillReportStartDate,
    billReportEndDate,
    setBillReportEndDate,
    activeReportMerchant,
    merchantBillReportData,
    handlePrintReport,
    openMerchantStatement,
  };
}
