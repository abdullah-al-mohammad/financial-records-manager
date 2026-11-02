import { useRef, useState } from 'react';
import { generateUniqueId } from '../../utils/api';
import { normalizeMonthKey } from './dashboardLogic';

// Owns the transfer, month-closing and opening-balance modal state and actions.
export default function useDashboardModals({
  currentMonthKey,
  currentMonthName,
  currentYear,
  paymentTotals,
  resolvedOpeningBalance,
  previousMonthClosing,
  onAddTransfer,
  onAddMonthClosing,
  onSetOpeningBalance,
  onDeleteOpeningBalance,
}) {
  // Transfer modal state
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferType, setTransferType] = useState('cash_to_online');
  const [transferAmount, setTransferAmount] = useState('');
  const [transferDate, setTransferDate] = useState(new Date().toISOString().slice(0, 10));
  const [transferNote, setTransferNote] = useState('');
  const [transferSubmitting, setTransferSubmitting] = useState(false);
  const transferSubmittingRef = useRef(false);

  // Month Closing modal state
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [closeSubmitting, setCloseSubmitting] = useState(false);
  const closeSubmittingRef = useRef(false);
  const [showClosingHistory, setShowClosingHistory] = useState(false);

  // Opening Balance modal state (one record per calendar month)
  const [showOpeningModal, setShowOpeningModal] = useState(false);
  const [obHand, setObHand] = useState('');
  const [obOnline, setObOnline] = useState('');
  const [obOther, setObOther] = useState('');
  const [obSource, setObSource] = useState('manual');
  const [obFromMonthKey, setObFromMonthKey] = useState(null);
  const [obSubmitting, setObSubmitting] = useState(false);
  const obSubmittingRef = useRef(false);
  const [showOpeningHistory, setShowOpeningHistory] = useState(false);

  const openOpeningModal = () => {
    setObSource(resolvedOpeningBalance?.source || 'manual');
    setObFromMonthKey(resolvedOpeningBalance?.fromMonthKey || null);
    setObHand(resolvedOpeningBalance?.handCash ?? '');
    setObOnline(resolvedOpeningBalance?.onlineCash ?? '');
    setObOther(resolvedOpeningBalance?.otherCash ?? '');
    setShowOpeningModal(true);
  };

  const handleCarryForward = () => {
    if (!previousMonthClosing) return;
    setObHand(previousMonthClosing.handCash ?? '');
    setObOnline(previousMonthClosing.onlineCash ?? '');
    setObOther(previousMonthClosing.otherCash ?? '');
    setObSource('carried_forward');
    setObFromMonthKey(previousMonthClosing.monthKey);
    setShowOpeningModal(true);
  };

  const handleSaveOpeningBalance = async () => {
    if (obSubmittingRef.current || obSubmitting) return;
    const handCash = parseFloat(obHand) || 0;
    const onlineCash = parseFloat(obOnline) || 0;
    const otherCash = parseFloat(obOther) || 0;
    obSubmittingRef.current = true;
    setObSubmitting(true);
    try {
      const success = await onSetOpeningBalance({
        monthKey: currentMonthKey,
        month: currentMonthName,
        year: currentYear,
        handCash,
        onlineCash,
        otherCash,
        totalCash: handCash + onlineCash + otherCash,
        source: obSource,
        fromMonthKey: obFromMonthKey || null,
      });
      if (success !== false) {
        setShowOpeningModal(false);
      }
    } finally {
      obSubmittingRef.current = false;
      setObSubmitting(false);
    }
  };

  const handleRemoveOpeningBalance = async () => {
    if (!resolvedOpeningBalance) return;
    // Never delete another month's opening record when it is only being reused
    // as this month's carried-forward opening balance.
    const resolvedMonthKey = normalizeMonthKey(resolvedOpeningBalance.monthKey);
    if (resolvedMonthKey && resolvedMonthKey !== currentMonthKey) return;
    if (obSubmittingRef.current || obSubmitting) return;
    if (
      !window.confirm(
        `Remove this month's opening balance? Cash balances will be recalculated without the opening amount. This cannot be undone.`
      )
    )
      return;
    obSubmittingRef.current = true;
    setObSubmitting(true);
    try {
      const success = await onDeleteOpeningBalance({
        id: resolvedOpeningBalance.id,
        monthKey: resolvedOpeningBalance.monthKey || currentMonthKey,
      });
      if (success !== false) {
        setShowOpeningModal(false);
      }
    } finally {
      obSubmittingRef.current = false;
      setObSubmitting(false);
    }
  };

  const handleCloseMonth = async () => {
    if (closeSubmittingRef.current || closeSubmitting) return;
    closeSubmittingRef.current = true;
    setCloseSubmitting(true);
    try {
      const success = await onAddMonthClosing({
        month: currentMonthName,
        year: currentYear,
        monthKey: currentMonthKey,
        handCash: paymentTotals.cash,
        onlineCash: paymentTotals.online,
        otherCash: paymentTotals.otherCash,
        totalCash: paymentTotals.totalCash,
      });
      if (success !== false) {
        setShowCloseModal(false);
      }
    } finally {
      closeSubmittingRef.current = false;
      setCloseSubmitting(false);
    }
  };

  const handleTransferSubmit = async () => {
    if (transferSubmittingRef.current || transferSubmitting) return;
    if (!transferAmount || parseFloat(transferAmount) <= 0) return;
    transferSubmittingRef.current = true;
    setTransferSubmitting(true);
    try {
      const success = await onAddTransfer({
        id: generateUniqueId('tr'),
        type: transferType,
        amount: String(parseFloat(transferAmount)),
        date: transferDate,
        note: transferNote,
      });
      if (success !== false) {
        setTransferAmount('');
        setTransferNote('');
        setShowTransferModal(false);
      }
    } finally {
      transferSubmittingRef.current = false;
      setTransferSubmitting(false);
    }
  };

  return {
    showTransferModal,
    setShowTransferModal,
    transferType,
    setTransferType,
    transferAmount,
    setTransferAmount,
    transferDate,
    setTransferDate,
    transferNote,
    setTransferNote,
    transferSubmitting,
    handleTransferSubmit,
    showCloseModal,
    setShowCloseModal,
    closeSubmitting,
    handleCloseMonth,
    showClosingHistory,
    setShowClosingHistory,
    showOpeningModal,
    setShowOpeningModal,
    obHand,
    setObHand,
    obOnline,
    setObOnline,
    obOther,
    setObOther,
    obSource,
    setObSource,
    obFromMonthKey,
    setObFromMonthKey,
    obSubmitting,
    showOpeningHistory,
    setShowOpeningHistory,
    openOpeningModal,
    handleCarryForward,
    handleSaveOpeningBalance,
    handleRemoveOpeningBalance,
  };
}
