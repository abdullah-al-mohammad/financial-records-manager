import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { generateUniqueId } from '../../utils/api';
import { upsertBillReminder } from '../../utils/reminders';

// Owns the merchant payout form: add, edit and reset behaviour.
export default function usePayoutForm({ onAddPayment, onUpdatePayment, setBillReminders }) {
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().slice(0, 10));
  const [selectedMerchant, setSelectedMerchant] = useState('');
  const [paidAmount, setPaidAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [editingPaymentId, setEditingPaymentId] = useState(null);

  // Submission guard — prevents duplicate payout submissions on rapid clicks
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const cancelEditPayment = () => {
    setEditingPaymentId(null);
    setPaidAmount('');
    setNotes('');
  };

  const handlePaymentSubmit = async e => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return; // Prevent duplicate submissions
    if (!selectedMerchant || !paidAmount) {
      toast.error('Merchant and payment amount are required');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = {
        id: editingPaymentId || generateUniqueId('pay'),
        date: paymentDate,
        merchantName: selectedMerchant,
        paidAmount: String(paidAmount),
        notes: notes.trim(),
      };

      let success = false;
      if (editingPaymentId) {
        success = await onUpdatePayment(payload);
      } else {
        success = await onAddPayment(payload);
      }

      if (success !== false) {
        setBillReminders(current => upsertBillReminder(current, selectedMerchant, payload.date));

        // Reset Form
        setPaidAmount('');
        setNotes('');
        setEditingPaymentId(null);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const startEditPayment = p => {
    setEditingPaymentId(p.id);
    setPaymentDate(p.date);
    setSelectedMerchant(p.merchantName);
    setPaidAmount(p.paidAmount);
    setNotes(p.notes || '');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return {
    paymentDate,
    setPaymentDate,
    selectedMerchant,
    setSelectedMerchant,
    paidAmount,
    setPaidAmount,
    notes,
    setNotes,
    editingPaymentId,
    isSubmitting,
    handlePaymentSubmit,
    startEditPayment,
    cancelEditPayment,
  };
}
