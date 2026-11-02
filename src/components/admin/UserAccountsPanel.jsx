import { UserPlus } from 'lucide-react';
import UserForm from './UserForm';
import UsersGrid from './UsersGrid';

// User accounts tab: add-form toggle, optional form and the users grid.
export default function UserAccountsPanel({
  currentUser,
  users,
  showAddForm,
  onToggleAddForm,
  userForm,
  onEditUser,
  onDeleteUser,
}) {
  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <button
          onClick={onToggleAddForm}
          className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3.5 py-2 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 active:scale-[0.98] transition-all cursor-pointer"
        >
          <UserPlus className="w-3.5 h-3.5" />
          {showAddForm ? 'Hide Form' : 'Register New User'}
        </button>
      </div>

      {/* User Form Drawer/Box */}
      {showAddForm && (
        <UserForm
          currentUser={currentUser}
          username={userForm.username}
          setUsername={userForm.setUsername}
          password={userForm.password}
          setPassword={userForm.setPassword}
          role={userForm.role}
          setRole={userForm.setRole}
          status={userForm.status}
          setStatus={userForm.setStatus}
          editingUsername={userForm.editingUsername}
          isSubmitting={userForm.isSubmitting}
          onSubmit={userForm.onSubmit}
          onCancel={userForm.onCancel}
        />
      )}

      {/* Users List Grid */}
      <UsersGrid
        users={users}
        currentUser={currentUser}
        onEdit={onEditUser}
        onDelete={onDeleteUser}
      />
    </div>
  );
}
