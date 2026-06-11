import { useState } from 'react';
import { Shield, Database, Eye, EyeOff, Key, User, Play } from 'lucide-react';
import { api, isLiveMode, setLiveMode, getScriptUrl, setScriptUrl, saveSession } from '../utils/api';

export default function Login({ onLoginSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [live, setLive] = useState(isLiveMode());
  const [url, setUrl] = useState(getScriptUrl());
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setError('Username and password are required');
      return;
    }

    if (live && !url.trim()) {
      setError('Please provide a Google Apps Script Web App URL for Live Mode');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      // Save configuration options
      setLiveMode(live);
      if (live) setScriptUrl(url);

      // Perform API authentication
      const data = await api.login(username.trim(), password);
      
      // Store session data
      saveSession({
        username: data.username,
        role: data.role,
        sessionToken: data.sessionToken,
        isLive: live
      });

      setSuccess('Logged in successfully!');
      setTimeout(() => {
        onLoginSuccess();
      }, 800);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden bg-[#060913]">
      {/* Decorative Blur Spheres */}
      <div className="absolute top-1/4 left-1/4 w-80 h-80 bg-indigo-600/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md glass-panel-glow rounded-2xl overflow-hidden p-8 z-10 transition-all duration-300">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 mb-4">
            <Shield className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
            Financial Manager
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Access secure transaction spreadsheets
          </p>
        </div>

        {/* Live / Demo Mode Toggle */}
        <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 border border-slate-800 rounded-xl mb-6">
          <button
            type="button"
            onClick={() => setLive(false)}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              !live
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Play className="w-3.5 h-3.5" />
            Demo Sandbox
          </button>
          <button
            type="button"
            onClick={() => setLive(true)}
            className={`py-2 px-3 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
              live
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Google Sheets
          </button>
        </div>

        {error && (
          <div className="p-3.5 mb-6 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 animate-pulse">
            <span className="font-bold">Error:</span> {error}
          </div>
        )}

        {success && (
          <div className="p-3.5 mb-6 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {live && (
            <div className="space-y-1">
              <label className="block text-xs font-medium text-slate-400">
                Google Apps Script Web App URL
              </label>
              <input
                type="url"
                required={live}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
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
                onChange={(e) => setUsername(e.target.value)}
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
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-10 py-2.5 text-xs text-white placeholder-slate-600 outline-none transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
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

        <div className="mt-8 text-center text-[10px] text-slate-500 border-t border-slate-900 pt-4">
          {!live ? (
            <p>
              Sandbox Credentials: <span className="font-semibold text-slate-400">admin</span> / <span className="font-semibold text-slate-400">admin123</span>
            </p>
          ) : (
            <p>
              Protected by SHA-256 and custom HMAC signature handshakes.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
