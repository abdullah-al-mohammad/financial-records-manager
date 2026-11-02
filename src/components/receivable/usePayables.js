import { useMemo, useRef, useState } from 'react';
import { ACCOUNT_LABELS } from './accountConfig';
import {
  buildPayablePayload,
  buildPayPayload,
  buildRevertedPayable,
  computePayableStats,
  emptyPayableForm,
  emptyPayModal,
  filterPayables,
  payableFormFromRecord,
} from './receivableLogic';

// Owns all payable-side state: filters, add/edit form, pay confirmation modal
// and the derived metric/filtered lists.
export default function usePayables({
  payables = [],
  onAddPayable,
  onUpdatePayable,
  onDeletePayable,
}) {
  const [paySearchQuery, setPaySearchQuery] = useState('');
  const [payStatusFilter, setPayStatusFilter] = useState('all');
  const [payAccountFilter, setPayAccountFilter] = useState('all');

  const [showPayAddEditModal, setShowPayAddEditModal] = useState(false);
  const [editingPayable, setEditingPayable] = useState(null);
  const [payForm, setPayForm] = useState(emptyPayableForm());

  const [showPayModal, setShowPayModal] = useState(false);
  const [payingRecord, setPayingRecord] = useState(null);
  const [payModal, setPayModal] = useState(emptyPayModal());

  const [isPaySubmitting, setIsPaySubmitting] = useState(false);
  const isPaySubmittingRef = useRef(false);

  const payStats = useMemo(() => computePayableStats(payables), [payables]);

  const filteredPayables = useMemo(
    () => filterPayables(payables, { paySearchQuery, payStatusFilter, payAccountFilter }),
    [payables, paySearchQuery, payStatusFilter, payAccountFilter]
  );

  const handleOpenPayAdd = () => {
    setEditingPayable(null);
    setPayForm(emptyPayableForm());
    setShowPayAddEditModal(true);
  };

  const handleOpenPayEdit = payable => {
    setEditingPayable(payable);
    setPayForm(payableFormFromRecord(payable));
    setShowPayAddEditModal(true);
  };

  const handleSavePayable = async e => {
    e.preventDefault();
    if (isPaySubmittingRef.current || isPaySubmitting) return;
    if (!payForm.name.trim()) {
      alert('Please enter a Person or Business Name.');
      return;
    }
    const amt = parseFloat(payForm.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    isPaySubmittingRef.current = true;
    setIsPaySubmitting(true);
    try {
      const payload = buildPayablePayload(payForm, editingPayable);
      const success = editingPayable
        ? await onUpdatePayable(payload)
        : await onAddPayable(payload);
      if (success !== false) {
        setShowPayAddEditModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isPaySubmittingRef.current = false;
      setIsPaySubmitting(false);
    }
  };

  const handleOpenPayModal = payable => {
    if (payable.status === 'Paid') return;
    setPayingRecord(payable);
    setPayModal(emptyPayModal(payable));
    setShowPayModal(true);
  };

  const handleConfirmPay = async e => {
    e.preventDefault();
    if (!payingRecord) return;

    if (payingRecord.status === 'Paid') {
      setShowPayModal(false);
      return;
    }

    isPaySubmittingRef.current = true;
    setIsPaySubmitting(true);
    try {
      const success = await onUpdatePayable(buildPayPayload(payingRecord, payModal));
      if (success !== false) {
        setShowPayModal(false);
        setPayingRecord(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isPaySubmittingRef.current = false;
      setIsPaySubmitting(false);
    }
  };

  const handleRevertPayStatus = async payable => {
    const confirmed = window.confirm(
      `"${payable.name}"-এর ৳${parseFloat(payable.amount || 0).toLocaleString()} payment টাকে "Unpaid"-এ ফেরত নিবেন?\n\nএটি আপনার ${ACCOUNT_LABELS[payable.paidAccount || 'cash']?.label || 'cash'} balance-এ টাকা ফেরত যোগ করবে।`
    );
    if (!confirmed) return;

    try {
      await onUpdatePayable(buildRevertedPayable(payable));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeletePayable = async payable => {
    if (!payable?.id) return;
    const confirmed = window.confirm(
      `"${payable.name}" (৳${parseFloat(payable.amount || 0).toLocaleString()})-এর payable record মুছে ফেলবেন?`
    );
    if (!confirmed) return;

    try {
      await onDeletePayable(payable.id);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    paySearchQuery,
    setPaySearchQuery,
    payStatusFilter,
    setPayStatusFilter,
    payAccountFilter,
    setPayAccountFilter,
    showPayAddEditModal,
    setShowPayAddEditModal,
    editingPayable,
    payForm,
    setPayForm,
    showPayModal,
    setShowPayModal,
    payingRecord,
    payModal,
    setPayModal,
    isPaySubmitting,
    payStats,
    filteredPayables,
    handleOpenPayAdd,
    handleOpenPayEdit,
    handleSavePayable,
    handleOpenPayModal,
    handleConfirmPay,
    handleRevertPayStatus,
    handleDeletePayable,
  };
}
