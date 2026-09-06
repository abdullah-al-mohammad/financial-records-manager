import {
  Database,
  HandCoins,
  History,
  Landmark,
  LayoutDashboard,
  LogOut,
  Menu,
  Monitor,
  Moon,
  Receipt,
  ShieldAlert,
  ShoppingBag,
  Sun,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import fatafatLogo from '../assets/fatafat-logo.svg';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, theme, onChangeTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Records', icon: ShoppingBag },
    { id: 'expenses', label: 'Expense Page', icon: Receipt },
    { id: 'billing', label: 'Merchant Billing', icon: Landmark },
    { id: 'receivables', label: 'Receivables & Payables', icon: HandCoins },
    { id: 'history', label: 'History Archives', icon: History },
  ];

  // Only show Admin Panel if user is Admin
  if (user?.role === 'Admin') {
    menuItems.push({ id: 'admin', label: 'Admin Settings', icon: Users });
  }

  const handleNav = tabId => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-sidebar-color)] border-b border-slate-905 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div 
            className="bg-black p-1.5 rounded-lg shadow-sm border border-slate-800"
            style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
          >
            <img src={fatafatLogo} alt="Fatafat" className="h-6 w-auto" />
          </div>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
        >
          {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[var(--bg-sidebar-color)] border-r border-slate-800/60 backdrop-blur-xl flex flex-col justify-between
        transform lg:transform-none transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}
      >
        <div>
          {/* Sidebar Brand Logo */}
          <div className="h-16 flex items-center px-5 border-b border-slate-800/60 print:border-transparent">
            <div 
              className="bg-black/90 p-2 rounded-xl shadow-md border border-slate-800/80 flex items-center gap-2.5"
              style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
            >
              <img src={fatafatLogo} alt="Fatafat" className="h-6.5 w-auto" />
              <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
                Records
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 group relative
                    ${
                      isActive
                        ? 'bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 ring-1 ring-white/15'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }
                  `}
                >
                  <Icon
                    className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-indigo-400'}`}
                  />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile / Environment Info & Logout */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          {/* Environment Status Badge */}
          <div className="p-2.5 glass-panel rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.isLive ? (
                <>
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">
                    Live Sync
                  </span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    Demo Mode
                  </span>
                </>
              )}
            </div>
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-sm shadow-emerald-500/50" />
          </div>

          {/* Theme Selector Option */}
          <div className="p-2.5 glass-panel rounded-xl space-y-2">
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">
              Interface Style
            </span>
            <div className="grid grid-cols-3 gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800/80">
              <button
                type="button"
                onClick={() => onChangeTheme('light')}
                title="Light Mode"
                className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="text-[8px] font-bold mt-0.5">Light</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTheme('dark')}
                title="Dark Mode"
                className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="text-[8px] font-bold mt-0.5">Dark</span>
              </button>

              <button
                type="button"
                onClick={() => onChangeTheme('auto')}
                title="Auto Detect"
                className={`flex flex-col items-center justify-center py-1.5 rounded-md transition-all cursor-pointer ${
                  theme === 'auto'
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="text-[8px] font-bold mt-0.5">Auto</span>
              </button>
            </div>
          </div>

          {/* User Details */}
          <div className="flex items-center justify-between gap-3 px-1 pt-1">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-bold text-xs shadow-md shadow-indigo-600/20 shrink-0">
                {(user?.username || 'U').slice(0, 1).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <span className="font-bold text-xs text-white block truncate">{user?.username}</span>
                <span className="text-[10px] text-slate-400 block truncate">{user?.role} Account</span>
              </div>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end your session?')) {
                  onLogout();
                }
              }}
              title="Logout Session"
              className="p-2 rounded-xl border border-slate-800/80 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 hover:border-rose-500/20 transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
