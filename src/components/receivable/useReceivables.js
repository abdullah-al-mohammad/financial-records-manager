import { useMemo, useRef, useState } from 'react';
import { ACCOUNT_LABELS } from './accountConfig';
import {
  buildReceivePayload,
  buildReceivablePayload,
  buildRevertedReceivable,
  computeReceivableStats,
  emptyReceivableForm,
  emptyReceiveForm,
  filterReceivables,
  receivableFormFromRecord,
} from './receivableLogic';

// Owns all receivable-side state: filters, add/edit form, receive modal and
// the derived metric/filtered lists.
export default function useReceivables({
  receivables = [],
  onAddReceivable,
  onUpdateReceivable,
  onDeleteReceivable,
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [accountFilter, setAccountFilter] = useState('all');

  const [showAddEditModal, setShowAddEditModal] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [receivingRecord, setReceivingRecord] = useState(null);

  const [form, setForm] = useState(emptyReceivableForm());
  const [receiveForm, setReceiveForm] = useState(emptyReceiveForm());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);

  const stats = useMemo(() => computeReceivableStats(receivables), [receivables]);

  const filteredRecords = useMemo(
    () => filterReceivables(receivables, { searchQuery, statusFilter, accountFilter }),
    [receivables, searchQuery, statusFilter, accountFilter]
  );

  const handleOpenAdd = () => {
    setEditingRecord(null);
    setForm(emptyReceivableForm());
    setShowAddEditModal(true);
  };

  const handleOpenEdit = record => {
    setEditingRecord(record);
    setForm(receivableFormFromRecord(record));
    setShowAddEditModal(true);
  };

  const handleOpenReceive = record => {
    setReceivingRecord(record);
    setReceiveForm(emptyReceiveForm(record));
    setShowReceiveModal(true);
  };

  const handleSaveRecord = async e => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    if (!form.name.trim()) {
      alert('Please enter a Person or Business Name.');
      return;
    }
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount greater than 0.');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = buildReceivablePayload(form, editingRecord);
      const success = editingRecord
        ? await onUpdateReceivable(payload)
        : await onAddReceivable(payload);
      if (success !== false) {
        setShowAddEditModal(false);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleConfirmReceive = async e => {
    e.preventDefault();
    if (!receivingRecord) return;
    if (isSubmittingRef.current || isSubmitting) return;

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const success = await onUpdateReceivable(buildReceivePayload(receivingRecord, receiveForm));
      if (success !== false) {
        setShowReceiveModal(false);
        setReceivingRecord(null);
      }
    } catch (err) {
      console.error(err);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleRevertStatus = async record => {
    const confirm = window.confirm(
      `Revert payment of ৳${parseFloat(record.amount || 0).toLocaleString()} from "${record.name}" back to "Not Received"?\n\nThis will subtract the amount from your ${ACCOUNT_LABELS[record.receivedAccount || 'cash']?.label || 'cash'} balance.`
    );
    if (!confirm) return;

    try {
      await onUpdateReceivable(buildRevertedReceivable(record));
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async record => {
    if (!record?.id) return;
    const confirm = window.confirm(
      `Are you sure you want to delete receivable record for "${record.name}" (৳${parseFloat(record.amount || 0).toLocaleString()})?`
    );
    if (!confirm) return;

    try {
      await onDeleteReceivable(record.id);
    } catch (err) {
      console.error(err);
    }
  };

  return {
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    accountFilter,
    setAccountFilter,
    showAddEditModal,
    setShowAddEditModal,
    editingRecord,
    showReceiveModal,
    setShowReceiveModal,
    receivingRecord,
    form,
    setForm,
    receiveForm,
    setReceiveForm,
    isSubmitting,
    stats,
    filteredRecords,
    handleOpenAdd,
    handleOpenEdit,
    handleOpenReceive,
    handleSaveRecord,
    handleConfirmReceive,
    handleRevertStatus,
    handleDelete,
  };
}
