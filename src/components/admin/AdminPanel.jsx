import { useState } from 'react';
import AdminHeader from './AdminHeader';
import AdminTabs from './AdminTabs';
import AuditLogsPanel from './AuditLogsPanel';
import UserAccountsPanel from './UserAccountsPanel';
import useAdminData from './useAdminData';
import useAdminUsers from './useAdminUsers';
import useAuditLogs from './useAuditLogs';

export default function AdminPanel({ currentUser, onShowToast }) {
  const [activeSubTab, setActiveSubTab] = useState('users');

  const { users, logs, isRefreshing, loadData } = useAdminData({ onShowToast });

  const userForm = useAdminUsers({ currentUser, onShowToast, loadData });

  const {
    logSearch,
    handleSearchChange,
    logPage,
    setLogPage,
    filteredLogs,
    paginatedLogs,
    totalLogPages,
  } = useAuditLogs(logs);

  return (
    <div className="space-y-6">
      <AdminHeader isRefreshing={isRefreshing} onRefresh={() => loadData()} />

      <AdminTabs
        activeSubTab={activeSubTab}
        onTabChange={setActiveSubTab}
        userCount={users.length}
        logCount={logs.length}
      />

      {/* USER ACCOUNTS PANEL */}
      {activeSubTab === 'users' && (
        <UserAccountsPanel
          currentUser={currentUser}
          users={users}
          showAddForm={userForm.showAddForm}
          onToggleAddForm={userForm.toggleAddForm}
          userForm={{
            username: userForm.username,
            setUsername: userForm.setUsername,
            password: userForm.password,
            setPassword: userForm.setPassword,
            role: userForm.role,
            setRole: userForm.setRole,
            status: userForm.status,
            setStatus: userForm.setStatus,
            editingUsername: userForm.editingUsername,
            isSubmitting: userForm.isSubmitting,
            onSubmit: userForm.handleUserSubmit,
            onCancel: userForm.cancelEdit,
          }}
          onEditUser={userForm.startEditUser}
          onDeleteUser={userForm.handleDeleteUser}
        />
      )}

      {/* SECURITY AUDIT LOGS PANEL */}
      {activeSubTab === 'logs' && (
        <AuditLogsPanel
          logSearch={logSearch}
          onSearchChange={handleSearchChange}
          logPage={logPage}
          setLogPage={setLogPage}
          filteredLogs={filteredLogs}
          paginatedLogs={paginatedLogs}
          totalLogPages={totalLogPages}
        />
      )}
    </div>
  );
}
