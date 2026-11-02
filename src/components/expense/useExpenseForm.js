import { useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { getMonthFromDate } from '../../utils/dates';
import {
  buildExpensePayload,
  emptyExpenseForm,
  formFromRecord,
  hasAnyExpense,
} from './expenseLogic';

// Owns the expense form state and submit lifecycle (open/edit/close/save).
export default function useExpenseForm({ onAddRecord, onUpdateRecord, onAddMerchant }) {
  const [form, setForm] = useState(emptyExpenseForm());
  const [isOpen, setIsOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [showAddMerchant, setShowAddMerchant] = useState(false);
  const [newMerchant, setNewMerchant] = useState('');

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => {
      const updated = { ...prev, [name]: value };
      if (name === 'date' && value) {
        updated.month = getMonthFromDate(value) || prev.month;
      }
      return updated;
    });
  };

  const handleOpenNew = () => {
    setForm(emptyExpenseForm());
    setEditingRecord(null);
    setIsOpen(true);
  };

  const handleOpenEdit = record => {
    setForm(formFromRecord(record));
    setEditingRecord(record);
    setIsOpen(true);
  };

  const closeForm = () => setIsOpen(false);

  const handleSubmit = async e => {
    if (e?.preventDefault) e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;
    if (!hasAnyExpense(form)) {
      toast.error('Enter at least one expense amount (rider wage, variable, or fixed).');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);
    try {
      const payload = buildExpensePayload(form, editingRecord?.id, editingRecord);
      let success = false;
      if (editingRecord?.id) {
        success = await onUpdateRecord(payload);
      } else {
        success = await onAddRecord(payload);
      }
      if (success !== false) {
        setIsOpen(false);
        setForm(emptyExpenseForm());
        setEditingRecord(null);
      }
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleAddNewMerchant = () => {
    const name = newMerchant.trim();
    if (name && onAddMerchant) {
      onAddMerchant(name);
      setForm(prev => ({ ...prev, merchantName: name }));
      setNewMerchant('');
      setShowAddMerchant(false);
    }
  };

  return {
    form,
    isOpen,
    editingRecord,
    isSubmitting,
    showAddMerchant,
    newMerchant,
    setNewMerchant,
    setShowAddMerchant,
    handleChange,
    handleOpenNew,
    handleOpenEdit,
    handleSubmit,
    handleAddNewMerchant,
    closeForm,
  };
}
