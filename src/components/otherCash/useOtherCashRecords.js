import { useMemo, useRef, useState } from 'react';
import { toast } from 'react-toastify';
import { generateUniqueId } from '../../utils/api';
import { sortRecordsByDateDesc } from '../../utils/dates';
import {
  DEFAULT_FORM,
  buildOtherCashPayload,
  createNewForm,
  filterOtherCashRecords,
  summarizeOtherCashRecords,
} from './otherCashLogic';

// Owns the other-cash form, CRUD submission and filter state.
export default function useOtherCashRecords({
  otherCashRecords,
  onAddRecord,
  onUpdateRecord,
  onDeleteRecord,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [editingId, setEditingId] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isSubmittingRef = useRef(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterType, setFilterType] = useState('All');

  const handleOpenNew = () => {
    setForm(createNewForm());
    setEditingId(null);
    setIsOpen(true);
  };

  const handleOpenEdit = rec => {
    setForm({
      date: rec.date,
      month: rec.month,
      source: rec.source || '',
      amount: rec.amount || '',
      description: rec.description || '',
      type: rec.type || 'Income',
    });
    setEditingId(rec.id);
    setIsOpen(true);
  };

  const closeForm = () => {
    setIsOpen(false);
    setForm(DEFAULT_FORM);
    setEditingId(null);
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (isSubmittingRef.current || isSubmitting) return;

    if (!form.source || !form.amount) {
      toast.error('Source and Amount are required');
      return;
    }

    isSubmittingRef.current = true;
    setIsSubmitting(true);

    const payload = buildOtherCashPayload(form, {
      id: editingId || generateUniqueId('oc'),
      editingId,
    });

    try {
      let success = false;
      if (editingId) {
        success = await onUpdateRecord(payload);
      } else {
        success = await onAddRecord(payload);
      }
      if (success !== false) {
        setIsOpen(false);
        setForm(DEFAULT_FORM);
        setEditingId(null);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      isSubmittingRef.current = false;
      setIsSubmitting(false);
    }
  };

  const handleDelete = async id => {
    if (!id) return;
    if (!window.confirm('Delete this Other Cash record? This cannot be undone.')) return;
    try {
      await onDeleteRecord(id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const sortedRecords = useMemo(
    () => sortRecordsByDateDesc(otherCashRecords || []),
    [otherCashRecords]
  );

  const filteredRecords = useMemo(
    () => filterOtherCashRecords(sortedRecords, { searchTerm, filterMonth, filterType }),
    [sortedRecords, searchTerm, filterMonth, filterType]
  );

  const summary = useMemo(() => summarizeOtherCashRecords(filteredRecords), [filteredRecords]);

  return {
    isOpen,
    form,
    setForm,
    editingId,
    isSubmitting,
    searchTerm,
    setSearchTerm,
    filterMonth,
    setFilterMonth,
    filterType,
    setFilterType,
    handleOpenNew,
    handleOpenEdit,
    closeForm,
    handleSubmit,
    handleDelete,
    filteredRecords,
    summary,
  };
}
