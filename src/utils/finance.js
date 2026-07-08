const getPaymentBucket = value => {
  const normalized = String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();

  if (!normalized) return 'cash';

  const hasOnlineMarker =
    normalized === 'online' ||
    ['bkash', 'nagad', 'rocket', 'upay', 'card', 'bank', 'ssl', 'internet', 'mobile banking'].some(
      k => normalized.includes(k)
    );

  return hasOnlineMarker ? 'online' : 'cash';
};

export function sumExpensesFromRecords(records) {
  let riders = 0;
  let variable = 0;
  let fixed = 0;

  records.forEach(r => {
    riders += parseFloat(r.riderSalary) || 0;
    variable += parseFloat(r.otherExpense) || 0;
    fixed += parseFloat(r.fixedExpense) || 0;
  });

  return { riders, variable, fixed, total: riders + variable + fixed };
}

export function sumMerchantPayouts(payments) {
  return payments.reduce((sum, p) => sum + (parseFloat(p.paidAmount) || 0), 0);
}

export function computeNetCashBalance(records, payments) {
  let onlineCollected = 0;
  let cashCollected = 0;
  let otherCashCollected = 0;
  let onlineExpenses = 0;
  let cashExpenses = 0;
  let otherCashExpenses = 0;

  records.forEach(r => {
    // 1. Incomes
    const amount = parseFloat(r.paidByCustomer || r.salesAmount) || 0;
    const bucket = getPaymentBucket(r.digitalPaymentMethod || r.paymentSource || '');

    if (bucket === 'online') {
      onlineCollected += amount;
    } else {
      cashCollected += amount;
    }

    // Add other cash amount separately to Other Cash collected total
    const otherAmt = parseFloat(r.otherCashAmount) || 0;
    otherCashCollected += otherAmt;

    // 2. Expenses
    const expenseSource = String(r.paymentSource || r.digitalPaymentMethod || '').trim().toLowerCase();
    const expenseAmount =
      (parseFloat(r.riderSalary) || 0) +
      (parseFloat(r.otherExpense) || 0) +
      (parseFloat(r.fixedExpense) || 0);

    if (expenseAmount > 0) {
      if (expenseSource === 'other cash' || expenseSource === 'other_cash') {
        otherCashExpenses += expenseAmount;
      } else if (getPaymentBucket(expenseSource) === 'online') {
        onlineExpenses += expenseAmount;
      } else {
        cashExpenses += expenseAmount;
      }
    }
  });

  const expenses = sumExpensesFromRecords(records);
  const merchantPayouts = sumMerchantPayouts(payments);

  // Other Cash Balance calculation
  const otherCashBalance = otherCashCollected - otherCashExpenses;
  
  // Hand Cash Balance and Online Cash Balance
  const onlineBalance = onlineCollected - onlineExpenses;
  const cashBalance = cashCollected - cashExpenses - merchantPayouts;
  const netRemaining = onlineBalance + cashBalance + otherCashBalance;

  return {
    grossCash: cashCollected,
    onlineCollected,
    cashCollected,
    otherCashCollected,
    onlineExpenses,
    cashExpenses,
    otherCashExpenses,
    onlineBalance,
    cashBalance,
    otherCashBalance,
    expenses,
    merchantPayouts,
    netRemaining,
  };
}
