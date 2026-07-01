const REMINDER_STORAGE_KEY = 'merchant-bill-reminders';

export const getStoredBillReminders = () => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const value = window.localStorage.getItem(REMINDER_STORAGE_KEY);
    if (!value) {
      return [];
    }

    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to read bill reminders', error);
    return [];
  }
};

export const saveBillReminders = reminders => {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.localStorage.setItem(REMINDER_STORAGE_KEY, JSON.stringify(reminders));
  } catch (error) {
    console.warn('Unable to save bill reminders', error);
  }
};

export const getDueBillReminders = (reminders = [], today = new Date()) => {
  const referenceDate = new Date(today);
  referenceDate.setHours(0, 0, 0, 0);

  return (reminders || []).filter(reminder => {
    if (!reminder?.nextDueDate) {
      return false;
    }

    const dueDate = new Date(reminder.nextDueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate <= referenceDate;
  });
};

export const upsertBillReminder = (reminders = [], merchantName, paidDate) => {
  const normalizedMerchant = merchantName?.trim();
  if (!normalizedMerchant || !paidDate) {
    return reminders;
  }

  const nextDueDate = getReminderNextDueDate(paidDate);
  const filtered = (reminders || []).filter(
    reminder => reminder.merchantName !== normalizedMerchant
  );
  return [
    ...filtered,
    {
      id: `${normalizedMerchant.toLowerCase()}-${paidDate}`,
      merchantName: normalizedMerchant,
      lastPaidDate: paidDate,
      nextDueDate,
      createdAt: new Date().toISOString(),
    },
  ];
};

export const getReminderNextDueDate = paidDate => {
  const date = new Date(paidDate);
  if (Number.isNaN(date.getTime())) {
    return paidDate;
  }

  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + 7);
  return nextDate.toISOString().slice(0, 10);
};
