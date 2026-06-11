import { useState, useEffect, useCallback } from 'react';
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import SalesManager from './components/SalesManager';
import ExpenseManager from './components/ExpenseManager';
import BillingManager from './components/BillingManager';
import HistoryManager from './components/HistoryManager';
import AdminPanel from './components/AdminPanel';
import { api, getCurrentSession, clearSession } from './utils/api';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [records, setRecords] = useState([]);
  const [payments, setPayments] = useState([]);
  const [merchants, setMerchants] = useState([]);
  
  // Edit target bridging from Expense to Sales
  const [editTarget, setEditTarget] = useState(null);

  // States
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = useCallback((msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 4000);
  }, []);

  // Check Session on Mount
  useEffect(() => {
    const session = getCurrentSession();
    if (session) {
      setCurrentUser(session);
    }
  }, []);

  // Fetch Database Values
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const [recordsList, paymentsList, merchantsList] = await Promise.all([
        api.getAllRecords(),
        api.getAllPayments(),
        api.getMerchants()
      ]);
      setRecords(recordsList);
      setPayments(paymentsList);
      setMerchants(merchantsList);
    } catch (err) {
      showToast(`Network Sync Error: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  }, [currentUser, showToast]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, fetchData]);

  // Auth Handlers
  const handleLoginSuccess = () => {
    const session = getCurrentSession();
    setCurrentUser(session);
    showToast('Logged in successfully!');
  };

  const handleLogout = () => {
    clearSession();
    setCurrentUser(null);
    setRecords([]);
    setPayments([]);
    setMerchants([]);
    setActiveTab('dashboard');
  };

  // Transaction Operations (CRUD)
  const handleAddRecord = async (record) => {
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

  const handleUpdateRecord = async (record) => {
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

  const handleDeleteRecord = async (id) => {
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

  const handleAddMerchant = (name) => {
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
  const handleAddPayment = async (payment) => {
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

  const handleUpdatePayment = async (payment) => {
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

  const handleDeletePayment = async (id) => {
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

  // Bridge navigation from Expense logs to Sales drawer edit
  const handleEditFromExpense = (record) => {
    setEditTarget(record);
    setActiveTab('sales');
  };

  const clearEditTarget = () => {
    setEditTarget(null);
  };

  // Authentication gate
  if (!currentUser) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  // Active View router
  const renderActiveTab = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard 
            records={records} 
            payments={payments} 
            setActiveTab={setActiveTab} 
          />
        );
      case 'sales':
        return (
          <SalesManager
            records={records}
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
            onEditRecord={handleEditFromExpense} 
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
      case 'history':
        return (
          <HistoryManager 
            records={records} 
            payments={payments} 
          />
        );
      case 'admin':
        return (
          <AdminPanel 
            currentUser={currentUser} 
            onShowToast={showToast} 
          />
        );
      default:
        return (
          <div className="text-center py-20 text-slate-400">
            View component not found.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-[#060913]">
      {/* Toast Alert Box */}
      {toast && (
        <div
          className={`fixed top-4 right-4 z-50 flex items-start gap-2.5 px-4.5 py-3 rounded-2xl border text-xs shadow-2xl animate-fade-in ${
            toast.type === 'error'
              ? 'bg-rose-950/80 border-rose-500/20 text-rose-300'
              : 'bg-emerald-950/80 border-emerald-500/20 text-emerald-300'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <div>
            <span className="font-bold block uppercase text-[9px] tracking-wider mb-0.5">
              {toast.type === 'error' ? 'Notice Alert' : 'System Sync'}
            </span>
            <span>{toast.msg}</span>
          </div>
        </div>
      )}

      {/* Main Application Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        user={currentUser} 
        onLogout={handleLogout} 
      />

      {/* Core Workspace Panel */}
      <main className="flex-1 lg:pl-64 min-w-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          {/* Refresh overlay blocker */}
          {loading && records.length === 0 ? (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
              <span className="w-8 h-8 border-3 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin" />
              <span className="text-xs text-slate-500 font-bold uppercase tracking-wider animate-pulse">Syncing Database Ledger...</span>
            </div>
          ) : (
            <>
              {loading && (
                <div className="fixed bottom-4 right-4 z-50 bg-slate-900 border border-slate-800 px-3.5 py-2 rounded-xl flex items-center gap-2 shadow-lg">
                  <span className="w-3.5 h-3.5 border-2 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Syncing...</span>
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
