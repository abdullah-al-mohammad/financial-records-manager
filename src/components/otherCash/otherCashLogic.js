// Calendar months used by the other-cash date picker and filters.
export const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const DEFAULT_FORM = {
  date: new Date().toISOString().slice(0, 10),
  month: MONTHS[new Date().getMonth()],
  source: '',
  amount: '',
  description: '',
  type: 'Income', // Income or Expense
};

// Fresh form values seeded with today's date and month.
export const createNewForm = () => ({
  ...DEFAULT_FORM,
  date: new Date().toISOString().slice(0, 10),
  month: MONTHS[new Date().getMonth()],
});

// Filter other cash rows by search text, month and type.
export const filterOtherCashRecords = (
  records = [],
  { searchTerm = '', filterMonth = 'All', filterType = 'All' } = {}
) => {
  return records.filter(r => {
    const matchSearch =
      (r.source?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (r.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchMonth = filterMonth === 'All' || r.month === filterMonth;
    const matchType = filterType === 'All' || r.type === filterType;
    return matchSearch && matchMonth && matchType;
  });
};

// Totals for the currently filtered records.
export const summarizeOtherCashRecords = (records = []) => {
  let totalIncome = 0;
  let totalExpense = 0;
  records.forEach(r => {
    const amt = parseFloat(r.amount) || 0;
    if (r.type === 'Income') {
      totalIncome += amt;
    } else {
      totalExpense += amt;
    }
  });
  return {
    totalIncome,
    totalExpense,
    netBalance: totalIncome - totalExpense,
  };
};

// Build the record payload submitted to the API.
export const buildOtherCashPayload = (form, { id, editingId }) => ({
  id,
  date: form.date,
  month: form.month,
  source: form.source,
  amount: String(form.amount),
  description: form.description || '',
  type: form.type,
  createdAt: editingId && form.createdAt ? form.createdAt : new Date().toISOString(),
});
