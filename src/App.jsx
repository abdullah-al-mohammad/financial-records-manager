import { useCallback, useEffect, useState } from 'react';
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
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
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

  // States
  const [loading, setLoading] = useState(false);
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('financial_manager_theme') || 'auto';
  });

  const showToast = useCallback((msg, type = 'success') => {
    if (type === 'error') toast.error(msg);
    else if (type === 'warning') toast.warn(msg);
    else if (type === 'info') toast.info(msg);
    else toast.success(msg);
  }, []);

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

  // Check Session on Mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

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

    setActiveTab('dashboard');
  }, []);

  // Fetch Database Values
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      // Primary path: single consolidated API call (live + mock)
      const result = await api.getDashboardData();

      setRecords(result.records);
      setPayments(result.payments);
      setMerchants(result.merchants);
      setTransfers(result.transfers);
      setReceivables(result.receivables);
      setPayables(result.payables);
      setMonthClosings(result.monthClosings);
      setOpeningBalances(result.openingBalances);
      setOtherCashRecords(result.otherCashRecords);
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
          api.getAllRecords(),
          api.getAllPayments(),
          api.getMerchants(),
          api.getAllTransfers(),
          api.getAllReceivables(),
          api.getAllPayables(),
          api.getAllMonthClosings(),
          api.getOpeningBalances(),
          api.getAllOtherCashRecords(),
        ]);

        if (recordsResult.status === 'fulfilled') setRecords(recordsResult.value);
        if (paymentsResult.status === 'fulfilled') setPayments(paymentsResult.value);
        if (merchantsResult.status === 'fulfilled') setMerchants(merchantsResult.value);
        if (transfersResult.status === 'fulfilled') setTransfers(transfersResult.value);
        if (receivablesResult.status === 'fulfilled') setReceivables(receivablesResult.value);
        if (payablesResult.status === 'fulfilled') setPayables(payablesResult.value);
        if (monthClosingsResult.status === 'fulfilled') setMonthClosings(monthClosingsResult.value);
        if (openingBalancesResult.status === 'fulfilled') setOpeningBalances(openingBalancesResult.value);
        if (otherCashRecordsResult.status === 'fulfilled') setOtherCashRecords(otherCashRecordsResult.value);

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
      setLoading(false);
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
    showToast('Logged in successfully!');
  };

  // Transaction Operations (CRUD)
  const handleAddRecord = async record => {
    setLoading(true);
    try {
      const resp = await api.createRecord(record);
      if (resp.success) {
        showToast('Sales record logged successfully!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Creation Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRecord = async record => {
    setLoading(true);
    try {
      const resp = await api.updateRecord(record);
      if (resp.success) {
        showToast('Sales record updated!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Update Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRecord = async id => {
    setLoading(true);
    try {
      const resp = await api.deleteRecord(id);
      if (resp.success) {
        showToast('Record deleted successfully.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
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
    setLoading(true);
    try {
      const resp = await api.createPayment(payment);
      if (resp.success) {
        showToast('Merchant payout recorded!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Payout Logging Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayment = async payment => {
    setLoading(true);
    try {
      const resp = await api.updatePayment(payment);
      if (resp.success) {
        showToast('Payout log updated!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Payout Update Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = async id => {
    setLoading(true);
    try {
      const resp = await api.deletePayment(id);
      if (resp.success) {
        showToast('Payout log removed.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Payout Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Balance Transfer Operations
  const handleAddTransfer = async transfer => {
    setLoading(true);
    try {
      const resp = await api.createTransfer(transfer);
      if (resp.success) {
        showToast('Transfer recorded successfully!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Transfer Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTransfer = async id => {
    setLoading(true);
    try {
      const resp = await api.deleteTransfer(id);
      if (resp.success) {
        showToast('Transfer record removed.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Transfer Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Receivable Operations (CRUD)
  const handleAddReceivable = async receivable => {
    setLoading(true);
    try {
      const resp = await api.createReceivable(receivable);
      if (resp.success) {
        showToast('Receivable record logged successfully!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Creation Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateReceivable = async receivable => {
    setLoading(true);
    try {
      const resp = await api.updateReceivable(receivable);
      if (resp.success) {
        if (receivable.status === 'Received') {
          showToast(`Payment received and deposited to cash balance!`);
        } else {
          showToast('Receivable record updated!');
        }
        await fetchData();
      }
    } catch (err) {
      showToast(`Update Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReceivable = async id => {
    setLoading(true);
    try {
      const resp = await api.deleteReceivable(id);
      if (resp.success) {
        showToast('Receivable record removed.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Payable Operations (CRUD)
  const handleAddPayable = async payable => {
    setLoading(true);
    try {
      const resp = await api.createPayable(payable);
      if (resp.success) {
        showToast('Payable record logged successfully!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Creation Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePayable = async payable => {
    setLoading(true);
    try {
      const resp = await api.updatePayable(payable);
      if (resp.success) {
        if (payable.status === 'Paid') {
          showToast(`Payment recorded! Deducted from cash balance.`);
        } else {
          showToast('Payable record updated!');
        }
        await fetchData();
      }
    } catch (err) {
      showToast(`Update Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayable = async id => {
    setLoading(true);
    try {
      const resp = await api.deletePayable(id);
      if (resp.success) {
        showToast('Payable record removed.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Opening Balance Operations (one record per calendar month)
  const handleSetOpeningBalance = async entry => {
    setLoading(true);
    try {
      await api.setOpeningBalance(entry);
      showToast('Opening balance saved successfully!');
      await fetchData();
    } catch (err) {
      showToast(`Failed to save opening balance: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Month Closing Operations
  const handleAddMonthClosing = async entry => {
    setLoading(true);
    try {
      const resp = await api.createMonthClosing(entry);
      if (resp.success) {
        showToast(`${entry.month} ${entry.year} closed successfully! Carry-forward balance saved.`);
        await fetchData();
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Bridge navigation from Expense logs to Sales drawer edit (legacy — no longer used)
  const clearEditTarget = () => {
    setEditTarget(null);
  };

  // Other Cash Records Operations (CRUD)
  const handleAddOtherCashRecord = async record => {
    setLoading(true);
    try {
      const resp = await api.createOtherCashRecord(record);
      if (resp.success) {
        showToast('Other cash record created successfully!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Creation Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateOtherCashRecord = async record => {
    setLoading(true);
    try {
      const resp = await api.updateOtherCashRecord(record);
      if (resp.success) {
        showToast('Other cash record updated!');
        await fetchData();
      }
    } catch (err) {
      showToast(`Update Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOtherCashRecord = async id => {
    setLoading(true);
    try {
      const resp = await api.deleteOtherCashRecord(id);
      if (resp.success) {
        showToast('Other cash record removed.');
        await fetchData();
      }
    } catch (err) {
      showToast(`Deletion Failed: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  // Authentication gate
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active View router
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard': {
        const now = new Date();
        const currentMonthKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
        const currentOpening = openingBalances.find(o => o.monthKey === currentMonthKey) || null;

        return (
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
          />
        );
      }
      case 'sales':
        return (
          <SalesManager
            records={records}
            payments={payments}
            merchants={merchants}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onAddMerchant={handleAddMerchant}
            editTarget={editTarget}
            clearEditTarget={clearEditTarget}
          />
        );
      case 'expenses':
        return (
          <ExpenseManager
            records={records}
            payments={payments}
            merchants={merchants}
            onAddRecord={handleAddRecord}
            onUpdateRecord={handleUpdateRecord}
            onDeleteRecord={handleDeleteRecord}
            onAddMerchant={handleAddMerchant}
          />
        );
      case 'billing':
        return (
          <BillingManager
            records={records}
            payments={payments}
            merchants={merchants}
            onAddPayment={handleAddPayment}
            onUpdatePayment={handleUpdatePayment}
            onDeletePayment={handleDeletePayment}
          />
        );
      case 'receivables':
        return (
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
        );
      case 'otherCash':
        return (
          <OtherCashManager
            otherCashRecords={otherCashRecords}
            onAddRecord={handleAddOtherCashRecord}
            onUpdateRecord={handleUpdateOtherCashRecord}
            onDeleteRecord={handleDeleteOtherCashRecord}
          />
        );
      case 'history':
        return (
          <HistoryManager
            records={records}
            payments={payments}
            transfers={transfers}
            onDeleteTransfer={handleDeleteTransfer}
          />
        );
      case 'admin':
        return <AdminPanel currentUser={currentUser} onShowToast={showToast} />;
      default:
        return <div className="text-center py-20 text-slate-400">View component not found.</div>;
    }
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
          {/* Refresh overlay blocker */}
          {loading && records.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">
                Syncing Database Ledger...
              </span>
            </div>
          ) : (
            <>
              {loading && (
                <div className="fixed bottom-5 right-5 z-50 glass-panel border border-indigo-500/30 px-4 py-2 rounded-2xl flex items-center gap-2.5 shadow-xl shadow-indigo-950/20">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[11px] font-bold text-indigo-300 uppercase tracking-wider">
                    Syncing...
                  </span>
                </div>
              )}
              {renderActiveTab()}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
