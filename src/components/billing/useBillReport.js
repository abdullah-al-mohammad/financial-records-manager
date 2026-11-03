import { useMemo, useState } from 'react';
import { toast } from 'react-toastify';
import { buildMerchantBillReport } from './billingLogic';
import { downloadReportPdf } from './pdfExport';

// Owns the merchant statement / bill-report state, print behaviour, and PDF download.
export default function useBillReport({ records, payments }) {
  // Selected merchant for ledger view
  const [focusedMerchant, setFocusedMerchant] = useState(null);

  // Merchant bill report (date range + print/download)
  const [billReportMerchant, setBillReportMerchant] = useState('');
  const [billReportStartDate, setBillReportStartDate] = useState('');
  const [billReportEndDate, setBillReportEndDate] = useState('');
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);

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

  const handleDownloadPdf = async () => {
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

    setIsDownloadingPdf(true);
    const toastId = toast.loading('Generating A4 PDF report, please wait...');

    try {
      await downloadReportPdf({
        merchantName: activeReportMerchant,
        startDate: billReportStartDate,
        endDate: billReportEndDate,
      });

      toast.update(toastId, {
        render: 'PDF downloaded successfully!',
        type: 'success',
        isLoading: false,
        autoClose: 3500,
      });
    } catch (err) {
      console.error('[pdfExport] Failed to generate PDF:', err);
      toast.update(toastId, {
        render: `PDF generation failed: ${err.message || 'Unknown error'}`,
        type: 'error',
        isLoading: false,
        autoClose: 4000,
      });
    } finally {
      setIsDownloadingPdf(false);
    }
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
    handleDownloadPdf,
    isDownloadingPdf,
    openMerchantStatement,
  };
}
