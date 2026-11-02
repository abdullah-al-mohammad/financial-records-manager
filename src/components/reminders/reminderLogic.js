import { getDueBillReminders } from '../../utils/reminders.js';

// Due reminders with dismissed entries and already-paid merchants removed.
export const filterDueReminders = (billReminders = [], payments = [], dismissedReminders = []) => {
  const due = getDueBillReminders(billReminders);

  return due.filter(reminder => {
    // If the reminder is explicitly dismissed by the user in this session, hide it
    if (dismissedReminders.includes(reminder.id)) {
      return false;
    }

    // Double check if merchant has any payment *after* the reminder's lastPaidDate
    const merchantPayments = payments.filter(
      p =>
        String(p.merchantName).trim().toLowerCase() ===
        String(reminder.merchantName).trim().toLowerCase()
    );

    const hasNewerPayment = merchantPayments.some(p => {
      return new Date(p.date) > new Date(reminder.lastPaidDate);
    });

    return !hasNewerPayment;
  });
};
