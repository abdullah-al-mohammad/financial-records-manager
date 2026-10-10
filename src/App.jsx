import { useCallback, useEffect, useRef, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminPanel from './components/AdminPanel';
import BillingManager from './components/BillingManager';
import BillReminderManager from './components/BillReminderManager';
import Dashboard from './components/Dashboard';
import ExpenseManager from './components/ExpenseManager';
import HistoryManager from './components/HistoryManager';
import Login from './components/Login';
import OtherCashManager from './components/OtherCashManager';
import ReceivableManager from './components/ReceivableManager';
import SalesManager from './components/SalesManager';
import Sidebar from './components/Sidebar';
import { api, clearSession, getCurrentSession } from './utils/api';

export default function App() {
  const [currentUser, setCurrentUser] = useState(() => getCurrentSession());
  const [activeTab, setActiveTab] = useState('dashboard');
  const [visitedTabs, setVisitedTabs] = useState(() => new Set(['dashboard']));
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [transfers, setTransfers] = useState([]);
  const [receivables, setReceivables] = useState([]);
  const [payables, setPayables] = useState([]);
  const [monthClosings, setMonthClosings] = useState([]);
  const [openingBalances, setOpeningBalances] = useState([]);
  const [otherCashRecords, setOtherCashRecords] = useState([]);

  // Edit target bridging from Expense to Sales
  const [editTarget, setEditTarget] = useState(null);

  // Loading States
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const initialLoadedRef = useRef(false);
  const pendingOperationsRef = useRef(new Set());

  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('financial_manager_theme') || 'auto';
  });

  const showToast = useCallback((msg, type = 'success') => {
    if (type === 'error') toast.error(msg);
    else if (type === 'warning') toast.warn(msg);
    else if (type === 'info') toast.info(msg);
    else toast.success(msg);
  }, []);

  // Track visited tabs to keep them mounted without remounting overhead
  useEffect(() => {
    setVisitedTabs(prev => {
      if (prev.has(activeTab)) return prev;
      const next = new Set(prev);
      next.add(activeTab);
      return next;
    });
  }, [activeTab]);

  // Theme Loader and Sync Effect
  useEffect(() => {
    localStorage.setItem('financial_manager_theme', theme);
    const root = document.documentElement;

    const applyTheme = t => {
      if (t === 'dark') {
        root.setAttribute('data-theme', 'dark');
        root.classList.remove('light');
        root.classList.add('dark');
        root.style.colorScheme = 'dark';
      } else if (t === 'light') {
        root.setAttribute('data-theme', 'light');
        root.classList.remove('dark');
        root.classList.add('light');
        root.style.colorScheme = 'light';
      } else {
        // Auto
        const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
          ? 'dark'
          : 'light';
        root.setAttribute('data-theme', systemTheme);
        root.classList.remove(systemTheme === 'dark' ? 'light' : 'dark');
        root.classList.add(systemTheme);
        root.style.colorScheme = systemTheme;
      }
    };

    applyTheme(theme);

    if (theme === 'auto') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = () => applyTheme('auto');
      media.addEventListener('change', listener);
      return () => media.removeEventListener('change', listener);
    }
  }, [theme]);

  // Check Session on Mount if not already loaded
  useEffect(() => {
    const session = getCurrentSession();
    if (session && !currentUser) {
      setCurrentUser(session);
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogout = useCallback(() => {
    clearSession();
    setCurrentUser(null);
    setRecords([]);
    setPayments([]);
    setMerchants([]);
    setTransfers([]);
    setReceivables([]);
    setPayables([]);
    setMonthClosings([]);
    setOpeningBalances([]);
    setOtherCashRecords([]);
    setVisitedTabs(new Set(['dashboard']));
    initialLoadedRef.current = false;
    setIsInitialLoading(true);
    setIsSyncing(false);
    setActiveTab('dashboard');
  }, []);

  // Fetch Database Values
  const fetchData = useCallback(async ({ forceRefresh = false } = {}) => {
    if (!currentUser) return;
    if (!initialLoadedRef.current) {
      setIsInitialLoading(true);
    } else {
      setIsSyncing(true);
    }
    try {
      // Primary path: single consolidated API call (live + mock)
      const result = await api.getDashboardData({ forceRefresh });

      setRecords(result.records || []);
      setPayments(result.payments || []);
      setMerchants(result.merchants || []);
      setTransfers(result.transfers || []);
      setReceivables(result.receivables || []);
      setPayables(result.payables || []);
      setMonthClosings(result.monthClosings || []);
      setOpeningBalances(result.openingBalances || []);
      setOtherCashRecords(result.otherCashRecords || []);
      initialLoadedRef.current = true;
    } catch (err) {
      // Fallback: if the consolidated endpoint fails (e.g. old backend
      // deployment that doesn't have getDashboardData yet), load each
      // dataset individually so the app still works.
      try {
        const [
          recordsResult,
          paymentsResult,
          merchantsResult,
          transfersResult,
          receivablesResult,
          payablesResult,
          monthClosingsResult,
          openingBalancesResult,
          otherCashRecordsResult,
        ] = await Promise.allSettled([
          api.getAllRecords({ forceRefresh }),
          api.getAllPayments({ forceRefresh }),
          api.getMerchants({ forceRefresh }),
          api.getAllTransfers({ forceRefresh }),
          api.getAllReceivables({ forceRefresh }),
          api.getAllPayables({ forceRefresh }),
          api.getAllMonthClosings({ forceRefresh }),
          api.getOpeningBalances({ forceRefresh }),
          api.getAllOtherCashRecords({ forceRefresh }),
        ]);

        if (recordsResult.status === 'fulfilled') setRecords(recordsResult.value || []);
        if (paymentsResult.status === 'fulfilled') setPayments(paymentsResult.value || []);
        if (merchantsResult.status === 'fulfilled') setMerchants(merchantsResult.value || []);
        if (transfersResult.status === 'fulfilled') setTransfers(transfersResult.value || []);
        if (receivablesResult.status === 'fulfilled') setReceivables(receivablesResult.value || []);
        if (payablesResult.status === 'fulfilled') setPayables(payablesResult.value || []);
        if (monthClosingsResult.status === 'fulfilled') setMonthClosings(monthClosingsResult.value || []);
        if (openingBalancesResult.status === 'fulfilled') setOpeningBalances(openingBalancesResult.value || []);
        if (otherCashRecordsResult.status === 'fulfilled') setOtherCashRecords(otherCashRecordsResult.value || []);

        initialLoadedRef.current = true;

        const failures = [
          recordsResult, paymentsResult, merchantsResult, transfersResult,
          receivablesResult, payablesResult, monthClosingsResult, openingBalancesResult,
          otherCashRecordsResult,
        ].filter(r => r.status === 'rejected');
        if (failures.length > 0) {
          const msgs = failures.map(r => r.reason?.message || 'Unknown error').join('; ');
          showToast(`Sync warning: ${msgs}`, 'warning');
        }
      } catch (fallbackErr) {
        showToast(`Network Sync Error: ${fallbackErr.message}`, 'error');
      }
    } finally {
      setIsInitialLoading(false);
      setIsSyncing(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Global Session Expiration Listener
  useEffect(() => {
    const handleSessionExpired = () => {
      handleLogout();
    };
    window.addEventListener('session-expired', handleSessionExpired);
    return () => window.removeEventListener('session-expired', handleSessionExpired);
  }, [handleLogout]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    const session = getCurrentSession();
    setCurrentUser(session);
    initialLoadedRef.current = false;
    setIsInitialLoading(true);
    showToast('Logged in successfully!');
  };

  // Generic operation runner with active operation deduplication
  const executeOperation = useCallback(async (opKey, operation, successMsg, errorPrefix) => {
    if (pendingOperationsRef.current.has(opKey)) return false;
    pendingOperationsRef.current.add(opKey);
    setIsSyncing(true);
    try {
      const resp = await operation();
      if (resp && resp.success !== false) {
        if (successMsg) showToast(successMsg);
        await fetchData({ forceRefresh: true });
        return true;
      }
      return false;
    } catch (err) {
      showToast(`${errorPrefix}: ${err.message}`, 'error');
      return false;
    } finally {
      pendingOperationsRef.current.delete(opKey);
      setIsSyncing(false);
    }
  }, [fetchData, showToast]);

  // Transaction Operations (CRUD)
  const handleAddRecord = async record => {
    const opKey = record?.id ? `record_create_${record.id}` : 'record_create';
    return await executeOperation(opKey, () => api.createRecord(record), 'Sales record logged successfully!', 'Creation Failed');
  };

  const handleUpdateRecord = async record => {
    return await executeOperation(`record_update_${record.id}`, () => api.updateRecord(record), 'Sales record updated!', 'Update Failed');
  };

  const handleDeleteRecord = async id => {
    if (!id) return false;
    return await executeOperation(`record_delete_${id}`, () => api.deleteRecord(id), 'Record deleted successfully.', 'Deletion Failed');
  };

  const handleDeleteAllRecords = async () => {
    return await executeOperation(
      'records_delete_all',
      () => api.deleteAllRecords(),
      'All sales records deleted.',
      'Deletion Failed'
    );
  };

  const handleAddMerchant = name => {
    const trimmed = name?.trim();
    if (!trimmed) return;
    const exists = merchants.some(m => m.toLowerCase() === trimmed.toLowerCase());
    if (exists) {
      showToast(`Merchant "${trimmed}" already exists.`, 'error');
      return;
    }
    setMerchants(prev => [...prev, trimmed].sort());
    showToast(`Merchant "${trimmed}" added to cache.`);
  };

  // Payment Operations (CRUD)
  const handleAddPayment = async payment => {
    const opKey = payment?.id ? `payment_create_${payment.id}` : 'payment_create';
    return await executeOperation(opKey, () => api.createPayment(payment), 'Merchant payout recorded!', 'Payout Logging Failed');
  };

  const handleUpdatePayment = async payment => {
    return await executeOperation(`payment_update_${payment.id}`, () => api.updatePayment(payment), 'Payout log updated!', 'Payout Update Failed');
  };

  const handleDeletePayment = async id => {
    if (!id) return false;
    return await executeOperation(`payment_delete_${id}`, () => api.deletePayment(id), 'Payout log removed.', 'Payout Deletion Failed');
  };

  // Balance Transfer Operations
  const handleAddTransfer = async transfer => {
    const opKey = transfer?.id ? `transfer_create_${transfer.id}` : 'transfer_create';
    return await executeOperation(opKey, () => api.createTransfer(transfer), 'Transfer recorded successfully!', 'Transfer Failed');
  };

  const handleDeleteTransfer = async id => {
    if (!id) return false;
    return await executeOperation(`transfer_delete_${id}`, () => api.deleteTransfer(id), 'Transfer record removed.', 'Transfer Deletion Failed');
  };

  // Receivable Operations (CRUD)
  const handleAddReceivable = async receivable => {
    const opKey = receivable?.id ? `receivable_create_${receivable.id}` : 'receivable_create';
    return await executeOperation(opKey, () => api.createReceivable(receivable), 'Receivable record logged successfully!', 'Creation Failed');
  };

  const handleUpdateReceivable = async receivable => {
    const successMsg = receivable.status === 'Received'
      ? 'Payment received and deposited to cash balance!'
      : 'Receivable record updated!';
    return await executeOperation(`receivable_update_${receivable.id}`, () => api.updateReceivable(receivable), successMsg, 'Update Failed');
  };

  const handleDeleteReceivable = async id => {
    if (!id) return false;
    return await executeOperation(`receivable_delete_${id}`, () => api.deleteReceivable(id), 'Receivable record removed.', 'Deletion Failed');
  };

  // Payable Operations (CRUD)
  const handleAddPayable = async payable => {
    const opKey = payable?.id ? `payable_create_${payable.id}` : 'payable_create';
    return await executeOperation(opKey, () => api.createPayable(payable), 'Payable record logged successfully!', 'Creation Failed');
  };

  const handleUpdatePayable = async payable => {
    const successMsg = payable.status === 'Paid'
      ? 'Payment recorded! Deducted from cash balance.'
      : 'Payable record updated!';
    return await executeOperation(`payable_update_${payable.id}`, () => api.updatePayable(payable), successMsg, 'Update Failed');
  };

  const handleDeletePayable = async id => {
    if (!id) return false;
    return await executeOperation(`payable_delete_${id}`, () => api.deletePayable(id), 'Payable record removed.', 'Deletion Failed');
  };

  // Opening Balance Operations (one record per calendar month)
  const handleSetOpeningBalance = async entry => {
    return await executeOperation(`ob_${entry.monthKey}`, () => api.setOpeningBalance(entry), 'Opening balance saved successfully!', 'Failed to save opening balance');
  };

  const handleDeleteOpeningBalance = async entry => {
    return await executeOperation(
      `ob_delete_${entry.monthKey || entry.id}`,
      () => api.deleteOpeningBalance(entry),
      'Opening balance removed successfully!',
      'Failed to remove opening balance'
    );
  };

  // Month Closing Operations
  const handleAddMonthClosing = async entry => {
    return await executeOperation(`mc_${entry.monthKey}`, () => api.createMonthClosing(entry), `${entry.month} ${entry.year} closed successfully! Carry-forward balance saved.`, 'Month closing failed');
  };

  const clearEditTarget = () => {
    setEditTarget(null);
  };

  // Other Cash Records Operations (CRUD)
  const handleAddOtherCashRecord = async record => {
    const opKey = record?.id ? `other_cash_create_${record.id}` : 'other_cash_create';
    return await executeOperation(opKey, () => api.createOtherCashRecord(record), 'Other cash record created successfully!', 'Creation Failed');
  };

  const handleUpdateOtherCashRecord = async record => {
    return await executeOperation(`other_cash_update_${record.id}`, () => api.updateOtherCashRecord(record), 'Other cash record updated!', 'Update Failed');
  };

  const handleDeleteOtherCashRecord = async id => {
    if (!id) return false;
    return await executeOperation(`other_cash_delete_${id}`, () => api.deleteOtherCashRecord(id), 'Other cash record removed.', 'Deletion Failed');
  };

  // Authentication gate
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active View tabs rendered with keep-alive visibility toggling
  const renderTabs = () => {
    const now = new Date();
    const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const currentOpening = openingBalances.find(o => o.monthKey === currentMonthKey) || null;

    return (
      <>
        {visitedTabs.has('dashboard') && (
          <div className={activeTab === 'dashboard' ? '' : 'hidden'}>
            <Dashboard
              records={records}
              payments={payments}
              transfers={transfers}
              receivables={receivables}
              payables={payables}
              otherCashRecords={otherCashRecords}
              setActiveTab={setActiveTab}
              onAddTransfer={handleAddTransfer}
              onDeleteTransfer={handleDeleteTransfer}
              monthClosings={monthClosings}
              openingBalances={openingBalances}
              currentOpeningBalance={currentOpening}
              onAddMonthClosing={handleAddMonthClosing}
              onSetOpeningBalance={handleSetOpeningBalance}
              onDeleteOpeningBalance={handleDeleteOpeningBalance}
            />
          </div>
        )}

        {visitedTabs.has('sales') && (
          <div className={activeTab === 'sales' ? '' : 'hidden'}>
            <SalesManager
              records={records}
              payments={payments}
              merchants={merchants}
              onAddRecord={handleAddRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onDeleteAllRecords={handleDeleteAllRecords}
              onAddMerchant={handleAddMerchant}
              editTarget={editTarget}
              clearEditTarget={clearEditTarget}
            />
          </div>
        )}

        {visitedTabs.has('expenses') && (
          <div className={activeTab === 'expenses' ? '' : 'hidden'}>
            <ExpenseManager
              records={records}
              payments={payments}
              merchants={merchants}
              onAddRecord={handleAddRecord}
              onUpdateRecord={handleUpdateRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddMerchant={handleAddMerchant}
            />
          </div>
        )}

        {visitedTabs.has('billing') && (
          <div className={activeTab === 'billing' ? '' : 'hidden'}>
            <BillingManager
              records={records}
              payments={payments}
              merchants={merchants}
              onAddPayment={handleAddPayment}
              onUpdatePayment={handleUpdatePayment}
              onDeletePayment={handleDeletePayment}
            />
          </div>
        )}

        {visitedTabs.has('receivables') && (
          <div className={activeTab === 'receivables' ? '' : 'hidden'}>
            <ReceivableManager
              receivables={receivables}
              onAddReceivable={handleAddReceivable}
              onUpdateReceivable={handleUpdateReceivable}
              onDeleteReceivable={handleDeleteReceivable}
              payables={payables}
              onAddPayable={handleAddPayable}
              onUpdatePayable={handleUpdatePayable}
              onDeletePayable={handleDeletePayable}
            />
          </div>
        )}

        {visitedTabs.has('otherCash') && (
          <div className={activeTab === 'otherCash' ? '' : 'hidden'}>
            <OtherCashManager
              otherCashRecords={otherCashRecords}
              onAddRecord={handleAddOtherCashRecord}
              onUpdateRecord={handleUpdateOtherCashRecord}
              onDeleteRecord={handleDeleteOtherCashRecord}
            />
          </div>
        )}

        {visitedTabs.has('history') && (
          <div className={activeTab === 'history' ? '' : 'hidden'}>
            <HistoryManager
              records={records}
              payments={payments}
              transfers={transfers}
              onDeleteTransfer={handleDeleteTransfer}
            />
          </div>
        )}

        {visitedTabs.has('admin') && (
          <div className={activeTab === 'admin' ? '' : 'hidden'}>
            <AdminPanel currentUser={currentUser} onShowToast={showToast} />
          </div>
        )}
      </>
    );
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[var(--bg-app-color)] relative">
      {/* Background Ambient Orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0" aria-hidden="true">
        <div className="absolute -top-40 -left-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 left-1/3 w-96 h-96 bg-cyan-600/5 rounded-full blur-3xl" />
      </div>

      {/* React Toastify Container */}
      <ToastContainer
        position="top-right"
        autoClose={4000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
        toastClassName="!glass-panel !border !border-slate-800/80 !text-slate-200 !text-xs !rounded-2xl !shadow-2xl"
        style={{ zIndex: 9999 }}
      />

      {/* Bill Reminder Alert popups */}
      <BillReminderManager records={records} payments={payments} />

      {/* Main Application Sidebar */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={currentUser}
        onLogout={handleLogout}
        theme={theme}
        onChangeTheme={setTheme}
      />

      {/* Core Workspace Panel */}
      <main className="flex-1 lg:pl-64 min-w-0 relative z-10">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Initial loading blocker — only displayed before initial load completes */}
          {isInitialLoading ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                Syncing Database Ledger...
              </span>
            </div>
          ) : (
            <>
              {/* Subtle background syncing pill */}
              {isSyncing && (
                <div className="fixed bottom-5 right-5 z-50 glass-panel border border-indigo-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-indigo-950/20 pointer-events-none">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    Syncing...
                  </span>
                </div>
              )}
              {renderTabs()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
