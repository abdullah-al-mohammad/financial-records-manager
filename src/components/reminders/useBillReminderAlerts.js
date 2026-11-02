import { useEffect, useMemo, useState } from 'react';
import { getStoredBillReminders } from '../../utils/reminders';
import { filterDueReminders } from './reminderLogic';
import { playReminderSound } from './reminderSound';

// Loads stored reminders, tracks dismissals and plays the alert sound.
export default function useBillReminderAlerts({ records, payments }) {
  const [billReminders, setBillReminders] = useState(() => getStoredBillReminders());
  const [dismissedReminders, setDismissedReminders] = useState([]);

  // Load reminders on mount/records update
  useEffect(() => {
    setBillReminders(getStoredBillReminders());
  }, [records, payments]);

  // Compute currently due reminders
  const dueReminders = useMemo(
    () => filterDueReminders(billReminders, payments, dismissedReminders),
    [billReminders, payments, dismissedReminders]
  );

  // Play notification sound when a new due reminder appears
  useEffect(() => {
    if (dueReminders.length > 0) {
      playReminderSound();
    }
  }, [dueReminders.length]);

  const handleDismiss = id => {
    setDismissedReminders(prev => [...prev, id]);
  };

  return {
    dueReminders,
    handleDismiss,
  };
}
