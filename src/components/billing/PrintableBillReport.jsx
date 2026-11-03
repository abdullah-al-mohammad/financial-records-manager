import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import fatafatLogo from '../../assets/fatafat-logo.svg';
import { formatOrderDate, formatOrderDetails, getRecordMerchantBill } from './billingLogic';

// Full header on Page 1
function ReportPageHeader({ activeReportMerchant, billReportStartDate, billReportEndDate }) {
  return (
    <div
      className="flex justify-between items-start border-b-2 border-slate-300 pb-3 mb-3.5"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="flex flex-col gap-2">
        <div
          className="bg-black inline-flex p-2 rounded-xl shadow-sm self-start"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <img src={fatafatLogo} alt="Fatafat" className="h-6 w-auto" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-tight">
            Merchant Statement of Accounts
          </h1>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Generated: {new Date().toLocaleDateString('en-GB')}
          </p>
        </div>
      </div>
      <div className="text-right">
        <h2 className="text-sm font-bold text-slate-900">{activeReportMerchant}</h2>
        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">
          Period: {billReportStartDate ? formatOrderDate(billReportStartDate) : 'All History'} to{' '}
          {billReportEndDate ? formatOrderDate(billReportEndDate) : 'Present'}
        </p>
      </div>
    </div>
  );
}

// Compact header on Page 2 and subsequent pages
function ContinuationHeader({ activeReportMerchant, billReportStartDate, billReportEndDate, pageNumber, totalPages }) {
  return (
    <div
      className="flex justify-between items-center border-b-2 border-slate-300 pb-2 mb-3 text-xs"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="flex items-center gap-2">
        <div
          className="bg-black inline-flex p-1.5 rounded-lg shadow-sm"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <img src={fatafatLogo} alt="Fatafat" className="h-4 w-auto" />
        </div>
        <div>
          <h2 className="text-xs font-bold text-slate-800 tracking-tight">
            Merchant Statement of Accounts <span className="text-slate-500 font-normal">(Contd.)</span>
          </h2>
          <p className="text-[9px] text-slate-500 font-medium">
            {activeReportMerchant}
          </p>
        </div>
      </div>
      <div className="text-right text-[10px] text-slate-600 font-medium">
        <span>Period: {billReportStartDate ? formatOrderDate(billReportStartDate) : 'All'} &ndash; {billReportEndDate ? formatOrderDate(billReportEndDate) : 'Present'}</span>
        <span className="ml-2 font-bold text-slate-800">(Page {pageNumber} of {totalPages})</span>
      </div>
    </div>
  );
}

// Footer on every page: displays "P.T.O." on intermediate pages, suppressed on final page
function PrintPageFooter({ pageNumber, totalPages, merchantName }) {
  const isLast = pageNumber === totalPages;
  return (
    <div
      className="print-page-footer flex justify-between items-center border-t border-slate-300 pt-2 text-[10px] text-slate-500 mt-auto"
      style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
    >
      <div className="flex items-center gap-2">
        <span className="font-semibold text-slate-700">
          Page {pageNumber} of {totalPages}
        </span>
        <span>&bull;</span>
        <span className="font-medium text-slate-600">{merchantName || 'Merchant Statement'}</span>
      </div>
      <div>
        {!isLast ? (
          <span
            className="font-bold text-slate-900 tracking-wider inline-flex items-center gap-1.5 uppercase px-2.5 py-0.5 rounded border border-slate-400"
            style={{
              backgroundColor: '#f1f5f9',
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
            }}
          >
            P.T.O. (Please Turn Over) &rarr;
          </span>
        ) : (
          <span className="text-slate-400 font-medium italic">
            &mdash; End of Statement &mdash;
          </span>
        )}
      </div>
    </div>
  );
}

// Orders table component
function OrdersTable({ orders, hasOrdersHeader, hasOrdersTotal, totalBillAmount }) {
  if (orders.length === 0 && !hasOrdersTotal) return null;

  return (
    <div className="space-y-1 mb-2.5">
      {hasOrdersHeader && (
        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Merchant Bill Orders
        </h3>
      )}
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr
            className="border-b border-slate-300 font-bold text-slate-700 bg-slate-100"
            style={{
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              backgroundColor: '#f1f5f9',
            }}
          >
            <th className="py-1 px-2.5 text-center w-8">#</th>
            <th className="py-1 px-2.5">Order Date</th>
            <th className="py-1 px-2.5">Order Details</th>
            <th className="py-1 px-2.5 text-right">Amount</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {orders.map(r => (
            <tr key={r.id || r.globalIndex}>
              <td className="py-1 px-2.5 text-center text-slate-400 font-medium">
                {r.globalIndex + 1}
              </td>
              <td className="py-1 px-2.5 whitespace-nowrap">{formatOrderDate(r.date)}</td>
              <td className="py-1 px-2.5 text-slate-700">{formatOrderDetails(r)}</td>
              <td className="py-1 px-2.5 text-right font-bold text-slate-800 whitespace-nowrap">
                ৳{getRecordMerchantBill(r).toLocaleString()}
              </td>
            </tr>
          ))}
        </tbody>
        {hasOrdersTotal && (
          <tfoot>
            <tr
              className="border-t-2 border-slate-300 font-bold text-slate-800"
              style={{
                backgroundColor: '#f8fafc',
                WebkitPrintColorAdjust: 'exact',
                printColorAdjust: 'exact',
              }}
            >
              <td className="py-1 px-2.5" colSpan="3">
                Total Bill Amount
              </td>
              <td className="py-1 px-2.5 text-right text-slate-900 font-bold whitespace-nowrap">
                ৳{(totalBillAmount || 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}

// Payouts table component
function PayoutsTable({ payments, hasPayoutsHeader }) {
  return (
    <div className="space-y-1 mb-2.5">
      {hasPayoutsHeader && (
        <h3 className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">
          Payouts Ledger
        </h3>
      )}
      <table className="w-full text-left text-xs border-collapse">
        <thead>
          <tr
            className="border-b border-slate-300 font-bold text-slate-700 bg-slate-100"
            style={{
              WebkitPrintColorAdjust: 'exact',
              printColorAdjust: 'exact',
              backgroundColor: '#f1f5f9',
            }}
          >
            <th className="py-1 px-2.5">Date Paid</th>
            <th className="py-1 px-2.5">Amount Paid</th>
            <th className="py-1 px-2.5">Notes / Reference</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200">
          {payments.length === 0 ? (
            <tr>
              <td colSpan="3" className="py-2.5 px-2.5 text-center text-slate-500 italic text-[11px]">
                No payouts recorded in this period.
              </td>
            </tr>
          ) : (
            payments.map((p, idx) => (
              <tr key={p.id || idx}>
                <td className="py-1 px-2.5 whitespace-nowrap">
                  {p.date ? p.date.slice(0, 10) : '—'}
                </td>
                <td className="py-1 px-2.5 font-bold text-emerald-700 whitespace-nowrap">
                  ৳{Number(p.paidAmount || 0).toLocaleString()}
                </td>
                <td className="py-1 px-2.5 text-slate-600 italic">{p.notes || '—'}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

// Summary Totals & Signatures Block
function StatementSummaryBlock({ totals }) {
  return (
    <div className="grid grid-cols-2 gap-6 border-t border-slate-300 pt-3 mt-1.5 mb-1">
      {/* Signatures */}
      <div className="flex flex-col justify-end">
        <div className="flex gap-6 mt-4">
          <div className="flex-1 border-t border-slate-400 text-center pt-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Merchant Signature
            </span>
          </div>
          <div className="flex-1 border-t border-slate-400 text-center pt-1">
            <span className="text-[9px] uppercase font-bold text-slate-500 tracking-wider">
              Accounts Department
            </span>
          </div>
        </div>
      </div>

      {/* Totals Box */}
      <div
        className="rounded-xl p-2.5 text-xs border border-slate-200"
        style={{
          backgroundColor: '#f8fafc',
          WebkitPrintColorAdjust: 'exact',
          printColorAdjust: 'exact',
        }}
      >
        <div className="flex justify-between text-slate-600 mb-1 text-[11px]">
          <span>Total Bill Amount:</span>
          <span className="font-semibold text-slate-900">
            ৳{(totals?.commissionBill || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between text-slate-600 mb-1 text-[11px]">
          <span>Total Paid:</span>
          <span className="font-semibold text-emerald-700">
            ৳{(totals?.paid || 0).toLocaleString()}
          </span>
        </div>
        <div className="flex justify-between font-bold text-slate-900 pt-1 mt-1 border-t border-slate-300 text-xs">
          <span>Outstanding Period Balance:</span>
          <span
            style={{
              color: (totals?.ending || 0) > 0 ? '#be123c' : '#047857',
            }}
          >
            ৳{(totals?.ending || 0).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
}

// Height estimator per order row based on description length
function estimateOrderHeight(record) {
  const details = formatOrderDetails(record);
  if (details.length > 90) return 46;
  if (details.length > 45) return 36;
  return 24;
}

// Height estimator per payout row based on notes length
function estimatePayoutHeight(payment) {
  const notes = payment.notes || '';
  if (notes.length > 50) return 36;
  return 24;
}

/**
 * High-density natural flow pagination engine:
 * Packs content continuously into each A4 page without leaving empty gaps.
 * Payouts and summary immediately use whatever space remains on the current page.
 */
function paginateBillReport({ records = [], payments = [] }) {
  // A4 printable height at 96 DPI: 1123px - 106px margins (14mm top + 14mm bottom) = 1017px
  const PAGE_HEIGHT = 1017;
  const PAGE_1_HEADER = 105;
  const PAGE_N_HEADER = 48;
  const FOOTER_HEIGHT = 30;

  const ORDERS_SECTION_HEADER = 20;
  const ORDERS_TABLE_THEAD = 26;
  const ORDERS_TOTAL_ROW = 26;
  const PAYOUTS_SECTION_HEADER = 20;
  const PAYOUTS_TABLE_THEAD = 26;
  const SUMMARY_BLOCK_HEIGHT = 145;
  const SECTION_SPACING = 12;

  // Check if everything fits on a single page:
  let singlePageHeight = PAGE_1_HEADER + FOOTER_HEIGHT;

  singlePageHeight += ORDERS_SECTION_HEADER + ORDERS_TABLE_THEAD;
  if (records.length === 0) {
    singlePageHeight += 28;
  } else {
    records.forEach(r => {
      singlePageHeight += estimateOrderHeight(r);
    });
    singlePageHeight += ORDERS_TOTAL_ROW;
  }

  singlePageHeight += SECTION_SPACING + PAYOUTS_SECTION_HEADER + PAYOUTS_TABLE_THEAD;
  if (payments.length === 0) {
    singlePageHeight += 28;
  } else {
    payments.forEach(p => {
      singlePageHeight += estimatePayoutHeight(p);
    });
  }

  singlePageHeight += SECTION_SPACING + SUMMARY_BLOCK_HEIGHT;

  // Single page fit:
  if (singlePageHeight <= PAGE_HEIGHT) {
    return [
      {
        pageNumber: 1,
        orders: records.map((r, i) => ({ ...r, globalIndex: i })),
        hasOrdersHeader: true,
        hasOrdersTotal: records.length > 0,
        showPayouts: true,
        hasPayoutsHeader: true,
        payments: payments.map((p, i) => ({ ...p, globalIndex: i })),
        showSummary: true,
      },
    ];
  }

  // Multi-page distribution:
  const pages = [];
  let remainingOrders = records.map((r, i) => ({ ...r, globalIndex: i }));
  let remainingPayments = payments.map((p, i) => ({ ...p, globalIndex: i }));
  let ordersTotalPlaced = records.length === 0;
  let payoutsStarted = false;
  let payoutsFinished = payments.length === 0;
  let summaryPlaced = false;

  let pageNum = 1;

  while (!summaryPlaced) {
    const isFirstPage = pageNum === 1;
    const headerHeight = isFirstPage ? PAGE_1_HEADER : PAGE_N_HEADER;
    const maxUsable = PAGE_HEIGHT - headerHeight - FOOTER_HEIGHT;
    let currentHeight = 0;

    const page = {
      pageNumber: pageNum,
      orders: [],
      hasOrdersHeader: false,
      hasOrdersTotal: false,
      showPayouts: false,
      hasPayoutsHeader: false,
      payments: [],
      showSummary: false,
    };

    // A. Fill Orders
    if (remainingOrders.length > 0) {
      page.hasOrdersHeader = true;
      currentHeight += ORDERS_SECTION_HEADER + ORDERS_TABLE_THEAD;

      while (remainingOrders.length > 0) {
        const nextOrder = remainingOrders[0];
        const nextOrderH = estimateOrderHeight(nextOrder);
        const isLastOrder = remainingOrders.length === 1;
        const totalRowCost = isLastOrder ? ORDERS_TOTAL_ROW : 0;

        if (currentHeight + nextOrderH + totalRowCost <= maxUsable) {
          page.orders.push(nextOrder);
          remainingOrders.shift();
          currentHeight += nextOrderH;

          if (isLastOrder) {
            page.hasOrdersTotal = true;
            ordersTotalPlaced = true;
            currentHeight += ORDERS_TOTAL_ROW;
          }
        } else {
          break;
        }
      }
    } else if (!ordersTotalPlaced && records.length > 0) {
      if (currentHeight + ORDERS_TOTAL_ROW <= maxUsable) {
        page.hasOrdersTotal = true;
        ordersTotalPlaced = true;
        currentHeight += ORDERS_TOTAL_ROW;
      }
    }

    // B. Continue immediately with Payouts in remaining space on current page
    if (remainingOrders.length === 0 && !payoutsFinished) {
      const payoutsHeaderCost = !payoutsStarted
        ? (SECTION_SPACING + PAYOUTS_SECTION_HEADER + PAYOUTS_TABLE_THEAD)
        : PAYOUTS_TABLE_THEAD;

      const minPayoutNeed = payoutsHeaderCost + (remainingPayments.length > 0 ? estimatePayoutHeight(remainingPayments[0]) : 28);

      if (currentHeight + minPayoutNeed <= maxUsable) {
        page.showPayouts = true;
        page.hasPayoutsHeader = true;
        payoutsStarted = true;
        currentHeight += payoutsHeaderCost;

        if (remainingPayments.length === 0) {
          currentHeight += 28;
          payoutsFinished = true;
        } else {
          while (remainingPayments.length > 0) {
            const nextP = remainingPayments[0];
            const nextPH = estimatePayoutHeight(nextP);

            if (currentHeight + nextPH <= maxUsable) {
              page.payments.push(nextP);
              remainingPayments.shift();
              currentHeight += nextPH;
            } else {
              break;
            }
          }
          if (remainingPayments.length === 0) {
            payoutsFinished = true;
          }
        }
      }
    }

    // C. Continue immediately with Summary if payouts are done and space remains
    if (remainingOrders.length === 0 && payoutsFinished && !summaryPlaced) {
      const neededForSummary = SECTION_SPACING + SUMMARY_BLOCK_HEIGHT;
      if (currentHeight + neededForSummary <= maxUsable) {
        page.showSummary = true;
        summaryPlaced = true;
        currentHeight += neededForSummary;
      }
    }

    pages.push(page);
    pageNum++;
    if (pageNum > 25) break; // Guard against infinite loop
  }

  return pages;
}

export default function PrintableBillReport({
  activeReportMerchant,
  merchantBillReportData,
  billReportStartDate,
  billReportEndDate,
}) {
  const records = merchantBillReportData?.records ?? [];
  const payments = merchantBillReportData?.payments ?? [];
  const totals = merchantBillReportData?.totals ?? {};

  // Compute pages dynamically based on available A4 space
  const pages = useMemo(
    () => paginateBillReport({ records, payments, totals }),
    [records, payments, totals]
  );
  const totalPages = pages.length;

  return createPortal(
    <div className="printable-report-area" style={{ display: 'none' }}>
      {pages.map((page, index) => {
        const isFirst = index === 0;
        return (
          <div key={page.pageNumber} className="print-page">
            <div className="print-page-body">
              {isFirst ? (
                <ReportPageHeader
                  activeReportMerchant={activeReportMerchant}
                  billReportStartDate={billReportStartDate}
                  billReportEndDate={billReportEndDate}
                />
              ) : (
                <ContinuationHeader
                  activeReportMerchant={activeReportMerchant}
                  billReportStartDate={billReportStartDate}
                  billReportEndDate={billReportEndDate}
                  pageNumber={page.pageNumber}
                  totalPages={totalPages}
                />
              )}

              {/* Orders Table */}
              {(page.orders.length > 0 || page.hasOrdersTotal) && (
                <OrdersTable
                  orders={page.orders}
                  hasOrdersHeader={page.hasOrdersHeader}
                  hasOrdersTotal={page.hasOrdersTotal}
                  totalBillAmount={totals?.commissionBill || 0}
                />
              )}

              {/* Payouts Table */}
              {page.showPayouts && (
                <PayoutsTable
                  payments={page.payments}
                  hasPayoutsHeader={page.hasPayoutsHeader}
                />
              )}

              {/* Summary and Signatures Block */}
              {page.showSummary && (
                <StatementSummaryBlock totals={totals} />
              )}
            </div>

            {/* Page Footer: displays "P.T.O." on intermediate pages, suppressed on final page */}
            <PrintPageFooter
              pageNumber={page.pageNumber}
              totalPages={totalPages}
              merchantName={activeReportMerchant}
            />
          </div>
        );
      })}
    </div>,
    document.body
  );
}
