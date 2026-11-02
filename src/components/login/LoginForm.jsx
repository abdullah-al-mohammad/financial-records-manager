import { Eye, EyeOff, Key, User } from 'lucide-react';

// Credential form with optional live-mode URL field.
export default function LoginForm({
  live,
  url,
  onUrlChange,
  username,
  onUsernameChange,
  password,
  onPasswordChange,
  showPassword,
  onTogglePassword,
  loading,
  onSubmit,
}) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {live && (
        <div className="space-y-1">
          <label className="block text-xs font-medium text-slate-400">
            Google Apps Script Web App URL
          </label>
          <input
            type="url"
            required={live}
            value={url}
            onChange={e => onUrlChange(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>
      )}

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-400">
          Username
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <User className="w-4 h-4" />
          </div>
          <input
            type="text"
            required
            value={username}
            onChange={e => onUsernameChange(e.target.value)}
            placeholder="e.g. admin"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="block text-xs font-medium text-slate-400">
          Password
        </label>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Key className="w-4 h-4" />
          </div>
          <input
            type={showPassword ? 'text' : 'password'}
            required
            value={password}
            onChange={e => onPasswordChange(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
          />
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-500 hover:text-slate-300"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 active:scale-[0.98] text-white py-2.5 rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? (
          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
        ) : (
          'Authenticate Session'
        )}
      </button>
    </form>
  );
}
