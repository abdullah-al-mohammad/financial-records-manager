import { useState, useEffect, useMemo } from 'react';
import { getStoredBillReminders, getDueBillReminders } from '../utils/reminders';
import { Volume2, X } from 'lucide-react';

export default function BillReminderManager({ records, payments }) {
  const [billReminders, setBillReminders] = useState(() => getStoredBillReminders());
  const [dismissedReminders, setDismissedReminders] = useState([]);

  // Load reminders on mount/records update
  useEffect(() => {
    setBillReminders(getStoredBillReminders());
  }, [records, payments]);

  // Compute currently due reminders
  const dueReminders = useMemo(() => {
    const due = getDueBillReminders(billReminders);
    // Filter out reminders that have already been paid (where payment date > reminder lastPaidDate)
    return due.filter(reminder => {
      // If the reminder is explicitly dismissed by the user in this session, hide it
      if (dismissedReminders.includes(reminder.id)) {
        return false;
      }
      
      // Double check if merchant has any payment *after* the reminder's lastPaidDate
      const merchantPayments = payments.filter(p => 
        String(p.merchantName).trim().toLowerCase() === String(reminder.merchantName).trim().toLowerCase()
      );
      
      const hasNewerPayment = merchantPayments.some(p => {
        return new Date(p.date) > new Date(reminder.lastPaidDate);
      });

      return !hasNewerPayment;
    });
  }, [billReminders, payments, dismissedReminders]);

  // Play notification sound when a new due reminder appears
  useEffect(() => {
    if (dueReminders.length > 0) {
      playReminderSound();
    }
  }, [dueReminders.length]);

  const playReminderSound = () => {
    try {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play a friendly notice double-beep
      const playBeep = (time, pitch) => {
        const osc = audioContext.createOscillator();
        const gain = audioContext.createGain();
        osc.connect(gain);
        gain.connect(audioContext.destination);
        osc.type = 'sine';
        osc.frequency.value = pitch;
        gain.gain.setValueAtTime(0, time);
        gain.gain.linearRampToValueAtTime(0.3, time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.3);
        osc.start(time);
        osc.stop(time + 0.3);
      };

      const now = audioContext.currentTime;
      playBeep(now, 587.33); // D5
      playBeep(now + 0.15, 880); // A5
    } catch (e) {
      console.warn('Audio Context failed to initialize', e);
    }
  };

  const handleDismiss = (id) => {
    setDismissedReminders(prev => [...prev, id]);
  };

  if (dueReminders.length === 0) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50 flex flex-col gap-3 max-w-sm w-full">
      {dueReminders.map(reminder => (
        <div 
          key={reminder.id}
          className="glass-panel border-l-4 border-l-amber-500 border border-slate-800 bg-slate-900/95 backdrop-blur p-4 rounded-xl shadow-2xl flex items-start justify-between gap-3 animate-slide-in"
        >
          <div className="flex items-start gap-3">
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500 flex-shrink-0">
              <Volume2 className="w-4 h-4 animate-bounce" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-white">Merchant Bill Reminder</h4>
              <p className="text-xs text-slate-300 mt-1">
                {reminder.merchantName} bill is due.
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">
                Last paid: {new Date(reminder.lastPaidDate).toLocaleDateString()}
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDismiss(reminder.id)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-white transition-all cursor-pointer"
            title="Dismiss Reminder"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
}
