import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  Shield, 
  ShieldAlert, 
  Trash2, 
  Edit2, 
  UserPlus, 
  FileText, 
  Search, 
  Calendar,
  AlertTriangle,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { api } from '../utils/api';

export default function AdminPanel({ currentUser, onShowToast }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);
  const [activeSubTab, setActiveSubTab] = useState('users');

  // Form States
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [status, setStatus] = useState('Active');
  const [editingUsername, setEditingUsername] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Search & Pagination States
  const [logSearch, setLogSearch] = useState('');
  const [logPage, setLogPage] = useState(1);
  const logsPerPage = 15;

  const [loading, setLoading] = useState(false);

  // Load Admin Data
  const loadData = async () => {
    setLoading(true);
    try {
      const [uData, lData] = await Promise.all([
        api.getUsers(),
        api.getAuditLogs()
      ]);
      setUsers(uData);
      setLogs(lData);
    } catch (err) {
      onShowToast(`Failed to load admin controls: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUserSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || (!editingUsername && !password)) {
      onShowToast('Username and password are required', 'error');
      return;
    }

    setLoading(true);
    try {
      if (editingUsername) {
        // Edit Existing User
        const payload = {
          username: editingUsername,
          role,
          status,
          ...(password ? { password } : {}) // Only update password if entered
        };
        await api.updateUser(payload);
        onShowToast(`User account "${editingUsername}" updated!`);
      } else {
        // Create New User
        await api.createUser({
          username: username.trim(),
          password,
          role,
          status
        });
        onShowToast(`User account "${username.trim()}" created!`);
      }

      // Reset form
      setUsername('');
      setPassword('');
      setRole('User');
      setStatus('Active');
      setEditingUsername(null);
      setShowAddForm(false);
      
      // Reload lists
      await loadData();
    } catch (err) {
      onShowToast(err.message || 'Failed to save user', 'error');
    } finally {
      setLoading(false);
    }
  };

  const startEditUser = (user) => {
    setEditingUsername(user.username);
    setUsername(user.username);
    setPassword('');
    setRole(user.role);
    setStatus(user.status);
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteUser = async (targetUser) => {
    if (targetUser.toLowerCase() === currentUser.username.toLowerCase()) {
      onShowToast('Safety lock: You cannot delete your own admin account.', 'error');
      return;
    }

    if (!window.confirm(`Delete user account "${targetUser}" permanently from database?`)) return;

    setLoading(true);
    try {
      await api.deleteUser(targetUser);
      onShowToast(`User "${targetUser}" deleted successfully.`);
      await loadData();
    } catch (err) {
      onShowToast(err.message || 'Delete failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Filter logs by search queries
  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const query = logSearch.toLowerCase();
      return (
        log.username?.toLowerCase().includes(query) ||
        log.action?.toLowerCase().includes(query) ||
        log.details?.toLowerCase().includes(query) ||
        log.timestamp?.includes(query)
      );
    });
  }, [logs, logSearch]);

  // Paginated logs
  const paginatedLogs = useMemo(() => {
    const startIndex = (logPage - 1) * logsPerPage;
    return filteredLogs.slice(startIndex, startIndex + logsPerPage);
  }, [filteredLogs, logPage]);

  const totalLogPages = Math.ceil(filteredLogs.length / logsPerPage) || 1;

  // Format Date ISO
  const formatTimestamp = (isoStr) => {
    if (!isoStr) return '—';
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', { 
        day: '2-digit', 
        month: 'short', 
        year: 'numeric' 
      }) + ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return isoStr;
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-indigo-500" />
            Administrative Settings
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage user accounts, roles, access status, and view security audit logs
          </p>
        </div>

        {/* Reload button */}
        <button
          onClick={loadData}
          disabled={loading}
          className="bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 px-3.5 py-1.5 rounded-xl text-xs font-semibold shadow-sm transition-all cursor-pointer"
        >
          {loading ? 'Refreshing...' : 'Refresh Logs'}
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-900 gap-6">
        <button
          onClick={() => setActiveSubTab('users')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'users'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          User Accounts ({users.length})
        </button>
        <button
          onClick={() => setActiveSubTab('logs')}
          className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all border-b-2 cursor-pointer ${
            activeSubTab === 'logs'
              ? 'border-indigo-500 text-white'
              : 'border-transparent text-slate-500 hover:text-slate-350'
          }`}
        >
          Security Audit Logs ({logs.length})
        </button>
      </div>

      {/* USER ACCOUNTS PANEL */}
      {activeSubTab === 'users' && (
        <div className="space-y-6">
          <div className="flex justify-end">
            <button
              onClick={() => {
                setShowAddForm(!showAddForm);
                setEditingUsername(null);
                setUsername('');
                setPassword('');
                setRole('User');
                setStatus('Active');
              }}
              className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showAddForm ? 'Hide Form' : 'Register New User'}
            </button>
          </div>

          {/* User Form Drawer/Box */}
          {showAddForm && (
            <div className="glass-panel border border-slate-900 rounded-2xl p-5 max-w-xl">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {editingUsername ? `Modify account: ${editingUsername}` : 'Register User'}
                </h3>
                <p className="text-[10px] text-slate-500 mt-0.5">
                  Allocate roles and configure system access privileges
                </p>
              </div>

              <form onSubmit={handleUserSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400">Username</label>
                  <input
                    type="text"
                    required
                    disabled={!!editingUsername}
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="e.g. jason_smith"
                    className="w-full bg-slate-950 disabled:bg-slate-900/60 border border-slate-850 disabled:border-slate-800 disabled:text-slate-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400">
                    {editingUsername ? 'Update Password (leave blank to keep current)' : 'Password'}
                  </label>
                  <input
                    type="password"
                    required={!editingUsername}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400">System Role</label>
                  <select
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="User">Standard User</option>
                    <option value="Admin">Administrator</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-medium text-slate-400">Access Status</label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    disabled={editingUsername?.toLowerCase() === currentUser.username.toLowerCase()}
                    className="w-full bg-slate-950 disabled:bg-slate-900/60 border border-slate-850 disabled:border-slate-800 disabled:text-slate-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
                  >
                    <option value="Active">Active / Access Granted</option>
                    <option value="Suspended">Suspended / Revoke Access</option>
                  </select>
                </div>

                <div className="col-span-full pt-2 flex items-center justify-end gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddForm(false);
                      setEditingUsername(null);
                    }}
                    className="px-4 py-2 border border-slate-850 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
                  >
                    {editingUsername ? 'Commit Changes' : 'Register Account'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Users List Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map((u) => {
              const isSelf = u.username.toLowerCase() === currentUser.username.toLowerCase();
              return (
                <div key={u.username} className="glass-panel border border-slate-900 rounded-2xl p-5 flex flex-col justify-between space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white tracking-wide flex items-center gap-1.5">
                      {u.username}
                      {isSelf && <span className="text-[9px] font-bold bg-slate-900 border border-slate-800 text-slate-400 px-1.5 py-0.5 rounded-md uppercase tracking-wider">You</span>}
                    </span>
                    <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold border uppercase tracking-wider ${
                      u.status === 'Active' ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' : 'bg-rose-500/5 border-rose-500/10 text-rose-450'
                    }`}>
                      {u.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    Role privilege: <span className="text-white font-bold">{u.role}</span>
                  </div>

                  <div className="pt-3 border-t border-slate-900/60 flex items-center justify-end gap-1.5">
                    <button
                      onClick={() => startEditUser(u)}
                      className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white transition-all cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteUser(u.username)}
                      disabled={isSelf}
                      className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-500 hover:text-rose-400 disabled:hover:text-slate-500 transition-all disabled:opacity-30 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECURITY AUDIT LOGS PANEL */}
      {activeSubTab === 'logs' && (
        <div className="space-y-4">
          {/* Filters */}
          <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search audit trail by user, action, details..."
                value={logSearch}
                onChange={(e) => {
                  setLogSearch(e.target.value);
                  setLogPage(1); // Reset page to 1
                }}
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all"
              />
            </div>
          </div>

          {/* Logs Table */}
          <div className="glass-panel border border-slate-900 rounded-2xl overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/60 border-b border-slate-900 text-slate-400 font-bold">
                    <th className="p-3.5 whitespace-nowrap">Timestamp</th>
                    <th className="p-3.5">User</th>
                    <th className="p-3.5">Action</th>
                    <th className="p-3.5">Log Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900/40 font-mono text-[11px] text-slate-350">
                  {paginatedLogs.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="p-8 text-center text-slate-500 font-medium">
                        No audit records matched your query.
                      </td>
                    </tr>
                  ) : (
                    paginatedLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-900/10 transition-all">
                        <td className="p-3.5 whitespace-nowrap text-slate-500">
                          <span className="flex items-center gap-1.5 font-sans">
                            <Calendar className="w-3.5 h-3.5 text-slate-650" />
                            {formatTimestamp(log.timestamp)}
                          </span>
                        </td>
                        <td className="p-3.5 font-bold text-slate-200 font-sans">{log.username}</td>
                        <td className="p-3.5 whitespace-nowrap font-semibold">
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase tracking-wider border ${
                            log.action?.includes('Create') ? 'bg-emerald-500/5 border-emerald-500/10 text-emerald-400' :
                            log.action?.includes('Delete') ? 'bg-rose-500/5 border-rose-500/10 text-rose-400' :
                            log.action?.includes('Login Failed') || log.action?.includes('Blocked') ? 'bg-amber-500/5 border-amber-500/10 text-amber-400 animate-pulse' :
                            'bg-indigo-500/5 border-indigo-500/10 text-indigo-400'
                          }`}>
                            {log.action}
                          </span>
                        </td>
                        <td className="p-3.5 max-w-sm truncate text-slate-400 font-sans" title={log.details}>{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalLogPages > 1 && (
              <div className="p-4 bg-slate-900/20 border-t border-slate-900 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">
                  Page {logPage} of {totalLogPages} ({filteredLogs.length} entries)
                </span>
                
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLogPage(prev => Math.max(prev - 1, 1))}
                    disabled={logPage === 1}
                    className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setLogPage(prev => Math.min(prev + 1, totalLogPages))}
                    disabled={logPage === totalLogPages}
                    className="p-1.5 rounded-lg border border-slate-800 disabled:border-slate-900 text-slate-400 hover:text-white disabled:opacity-30 disabled:pointer-events-none transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
