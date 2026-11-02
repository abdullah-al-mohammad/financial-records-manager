// Register / edit user form used by the user accounts panel.
export default function UserForm({
  currentUser,
  username,
  setUsername,
  password,
  setPassword,
  role,
  setRole,
  status,
  setStatus,
  editingUsername,
  isSubmitting,
  onSubmit,
  onCancel,
}) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 max-w-xl">
      <div>
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {editingUsername ? `Modify account: ${editingUsername}` : 'Register User'}
        </h3>
        <p className="text-[10px] text-slate-500 mt-0.5">
          Allocate roles and configure system access privileges
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">Username</label>
          <input
            type="text"
            required
            disabled={!!editingUsername}
            value={username}
            onChange={e => setUsername(e.target.value)}
            placeholder="e.g. jason_smith"
            className="w-full bg-slate-950 disabled:bg-slate-900/60 border border-slate-800 disabled:border-slate-800 disabled:text-slate-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
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
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">System Role</label>
          <select
            value={role}
            onChange={e => setRole(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="User">Standard User</option>
            <option value="Admin">Administrator</option>
          </select>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-medium text-slate-400">Access Status</label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value)}
            disabled={editingUsername?.toLowerCase() === currentUser.username.toLowerCase()}
            className="w-full bg-slate-950 disabled:bg-slate-900/60 border border-slate-800 disabled:border-slate-800 disabled:text-slate-500 rounded-xl px-3.5 py-2 text-xs text-white outline-none focus:border-indigo-500"
          >
            <option value="Active">Active / Access Granted</option>
            <option value="Suspended">Suspended / Revoke Access</option>
          </select>
        </div>

        <div className="col-span-full pt-2 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/10 transition-all cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : editingUsername ? 'Commit Changes' : 'Register Account'}
          </button>
        </div>
      </form>
    </div>
  );
}
