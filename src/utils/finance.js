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

export function computeNetCashBalance(records, payments, transfers = []) {
  let onlineCollected = 0;
  let cashCollected = 0;
  let otherCashCollected = 0;
  let onlineExpenses = 0;
  let cashExpenses = 0;
  let otherCashExpenses = 0;

  records.forEach(r => {
    const customerPayment = parseFloat(r.paidByCustomer || r.salesAmount) || 0;
    const purchaseCost = parseFloat(r.salesAmount) || 0;

    const rawSource = String(r.paymentSource || 'cash').toLowerCase().trim();
    const sourceBucket = rawSource === 'online' ? 'online' : (rawSource === 'other_cash' || rawSource === 'other cash') ? 'other_cash' : 'cash';
    const customerBucket = getPaymentBucket(r.digitalPaymentMethod || '');

    // 1. Customer Payment (Income collected)
    if (customerBucket === 'online') {
      onlineCollected += customerPayment;
    } else {
      cashCollected += customerPayment;
    }

    // 2. Order Purchase Cost (Money spent by business to buy the order)
    if (sourceBucket === 'online') {
      onlineExpenses += purchaseCost;
    } else if (sourceBucket === 'other_cash') {
      otherCashExpenses += purchaseCost;
    } else {
      cashExpenses += purchaseCost;
    }

    otherCashCollected += parseFloat(r.otherCashAmount) || 0;

    // 3. Operational expenses (rider salary, variable, fixed)
    const expenseAmount =
      (parseFloat(r.riderSalary) || 0) +
      (parseFloat(r.otherExpense) || 0) +
      (parseFloat(r.fixedExpense) || 0);

    if (expenseAmount > 0) {
      if (sourceBucket === 'other_cash') {
        otherCashExpenses += expenseAmount;
      } else if (sourceBucket === 'online') {
        onlineExpenses += expenseAmount;
      } else {
        cashExpenses += expenseAmount;
      }
    }
  });

  const expenses = sumExpensesFromRecords(records);
  const merchantPayouts = sumMerchantPayouts(payments);

  // Process balance transfers (Cash ↔ Online)
  let cashToOnline = 0;
  let onlineToCash = 0;

  transfers.forEach(t => {
    const amt = parseFloat(t.amount) || 0;
    if (t.type === 'online_to_cash') {
      onlineToCash += amt;
    } else {
      // Default: cash_to_online
      cashToOnline += amt;
    }
  });

  const otherCashBalance = otherCashCollected - otherCashExpenses;

  const cashBalance =
    cashCollected -
    cashExpenses -
    merchantPayouts -
    cashToOnline +
    onlineToCash;

  const onlineBalance =
    onlineCollected -
    onlineExpenses +
    cashToOnline -
    onlineToCash;

  const netRemaining = onlineBalance + cashBalance + otherCashBalance;

  return {
    grossCash: cashCollected + onlineCollected,
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
