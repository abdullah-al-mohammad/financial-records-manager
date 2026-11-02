import { useEffect, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { MONTH_NAMES } from '../../utils/dates';
import {
  buildSalesPayload,
  computeDerived,
  defaultSalesForm,
  formFromRecord,
} from './salesLogic';

// Owns the sales form state and the create/edit/delete submit lifecycle.
export default function useSalesForm({
  onAddRecord,
  onUpdateRecord,
  onAddMerchant,
  editTarget,
  clearEditTarget,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(defaultSalesForm);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');

  const handleOpenEdit = record => {
    setForm(formFromRecord(record));
    setEditingId(record.id);
    setIsOpen(true);
  };

  useEffect(() => {
    if (editTarget) {
      handleOpenEdit(editTarget);
      if (clearEditTarget) clearEditTarget();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editTarget]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };

      // Auto-set month when date changes (datetime-local includes time)
      if (name === 'date' && value) {
        const d = new Date(value);
        updated.month = MONTH_NAMES[d.getMonth()] || prev.month;
      }

      if (name === 'digitalPaymentMethod' && value === 'online') {
        updated.paymentSource = '';
      }

      const derived = computeDerived(updated);
      return { ...updated, ...derived };
    });
  };

  const handleOpenNew = () => {
    setForm({
      ...defaultSalesForm,
      date: new Date().toISOString().slice(0, 10),
      month: MONTH_NAMES[new Date().getMonth()],
    });
    setEditingId(null);
    setIsOpen(true);
  };

  const closeForm = () => setIsOpen(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    setIsSubmitting(true);

    if (!editingId && form.salesAmount && form.salesAmount !== '' && !form.merchantName) {
      toast.error('Merchant name is required for sales records');
      isSubmittingRef.current = false;
      setIsSubmitting(false);
      return;
    }

    const payload = buildSalesPayload(form, editingId);

    try {
      let success;
      if (editingId) {
        success = await onUpdateRecord(payload);
      } else {
        success = await onAddRecord(payload);
      }
      if (success !== false) {
        setIsOpen(false);
        setForm(defaultSalesForm);
        setEditingId(null);
      }
    } catch (err) {
      toast.error(err.message || 'Failed to save sales record');
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAddNewMerchant = () => {
    const name = newMerchant.trim();
    if (name) {
      onAddMerchant(name);
      setForm(prev => ({ ...prev, merchantName: name }));
      setNewMerchant('');
      setShowAddMerchant(false);
    }
  };

  return {
    isOpen,
    form,
    editingId,
    isSubmitting,
    showAddMerchant,
    newMerchant,
    setNewMerchant,
    handleChange,
    handleOpenNew,
    handleOpenEdit,
    handleSubmit,
    handleAddNewMerchant,
    toggleAddMerchant: () => setShowAddMerchant(prev => !prev),
    closeForm,
  };
}
