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

export function computeNetCashBalance(records, payments, transfers = [], receivables = [], payables = []) {
  let onlineCollected = 0;
  let cashCollected = 0;
  let otherCashCollected = 0;
  let onlineExpenses = 0;
  let cashExpenses = 0;
  let otherCashExpenses = 0;

  records.forEach(r => {
    const customerPayment = parseFloat(r.paidByCustomer || r.salesAmount) || 0;
    const purchaseCost = parseFloat(r.salesAmount) || 0;

    const rawSource = String(r.paymentSource || '').toLowerCase().trim();
    const hasExplicitFunding = rawSource !== '';
    const sourceBucket =
      getPaymentBucket(rawSource) === 'online' ? 'online'
      : (rawSource === 'other_cash' || rawSource === 'other cash') ? 'other_cash'
      : 'cash';
    const customerBucket = getPaymentBucket(r.digitalPaymentMethod || '');

    // 1. Customer Payment (Income collected)
    if (customerBucket === 'online') {
      onlineCollected += customerPayment;
    } else {
      cashCollected += customerPayment;
    }

    // 2. Order Purchase Cost
    const isGenericOnline = String(r.digitalPaymentMethod || '').toLowerCase().trim() === 'online';
    if (customerBucket === 'online' && purchaseCost > 0 && hasExplicitFunding && !isGenericOnline) {
      if (sourceBucket === 'online') {
        onlineExpenses += purchaseCost;
      } else if (sourceBucket === 'other_cash') {
        otherCashExpenses += purchaseCost;
      } else {
        cashExpenses += purchaseCost;
      }
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

  // Process Receivables (Money I Will Receive)
  let receivablesCollectedCash = 0;
  let receivablesCollectedOnline = 0;
  let receivablesCollectedOtherCash = 0;

  receivables.forEach(rec => {
    const isReceived = rec.status === 'Received' || rec.paymentStatus === 'Received';
    if (!isReceived) {
      // Not yet received — deduct from Hand Cash to reflect outstanding money owed to you
      const pendingAmt = parseFloat(rec.amount) || 0;
      if (pendingAmt > 0) cashExpenses += pendingAmt;
      return;
    }

    const amt = parseFloat(rec.amount) || 0;
    if (amt <= 0) return;

    // Received: money has arrived in the designated account.
    const targetAccount = String(rec.receivedAccount || rec.paymentMethod || 'cash').toLowerCase().trim();
    if (targetAccount === 'other_cash' || targetAccount === 'other cash') {
      otherCashCollected += amt;
      receivablesCollectedOtherCash += amt;
    } else if (getPaymentBucket(targetAccount) === 'online' || targetAccount === 'online') {
      onlineCollected += amt;
      receivablesCollectedOnline += amt;
    } else {
      // cash account
      // When status changes from Not Received to Received,
      // the previous cashExpenses deduction disappears,
      // which already increases cash by the receivable amount.
    }
  });

  // Process Payables (Money I Will Pay / Money I Owe)
  let payablesPaidCash = 0;
  let payablesPaidOnline = 0;
  let payablesPaidOtherCash = 0;

  payables.forEach(pay => {
    const isPaid = pay.status === 'Paid' || pay.paymentStatus === 'Paid';
    if (!isPaid) return;

    const amt = parseFloat(pay.amount) || 0;
    if (amt <= 0) return;

    const targetAccount = String(pay.paidAccount || pay.paymentMethod || 'cash').toLowerCase().trim();
    if (targetAccount === 'other_cash' || targetAccount === 'other cash') {
      otherCashExpenses += amt;
      payablesPaidOtherCash += amt;
    } else if (getPaymentBucket(targetAccount) === 'online' || targetAccount === 'online') {
      onlineExpenses += amt;
      payablesPaidOnline += amt;
    } else {
      cashExpenses += amt;
      payablesPaidCash += amt;
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
    receivablesCollectedCash,
    receivablesCollectedOnline,
    receivablesCollectedOtherCash,
    totalReceivablesCollected: receivablesCollectedCash + receivablesCollectedOnline + receivablesCollectedOtherCash,
    payablesPaidCash,
    payablesPaidOnline,
    payablesPaidOtherCash,
    totalPayablesPaid: payablesPaidCash + payablesPaidOnline + payablesPaidOtherCash,
  };
}
