import { useState } from 'react';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Receipt, 
  Landmark, 
  History, 
  Users, 
  LogOut, 
  Menu, 
  X, 
  ShieldAlert, 
  Database,
  ShieldCheck
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'sales', label: 'Sales Records', icon: ShoppingBag },
    { id: 'expenses', label: 'Expense Page', icon: Receipt },
    { id: 'billing', label: 'Merchant Billing', icon: Landmark },
    { id: 'history', label: 'History Archives', icon: History },
  ];

  // Only show Admin Panel if user is Admin
  if (user?.role === 'Admin') {
    menuItems.push({ id: 'admin', label: 'Admin Settings', icon: Users });
  }

  const handleNav = (tabId) => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[#0a0f1d] border-b border-slate-900 sticky top-0 z-40">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-gradient-to-tr from-indigo-500 to-violet-600 shadow shadow-indigo-500/20">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-sm tracking-wide text-white">Financial Manager</span>
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
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#0a0f1d] border-r border-slate-900/80 flex flex-col justify-between
        transform lg:transform-none transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div>
          {/* Sidebar Brand Logo */}
          <div className="h-16 flex items-center gap-3 px-6 border-b border-slate-900">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/25">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-sm text-white tracking-wide block">Financial Records</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wider uppercase block">Spreadsheet Core</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  className={`
                    w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200
                    ${isActive 
                      ? 'bg-gradient-to-r from-indigo-600/90 to-violet-600/90 text-white shadow-lg shadow-indigo-600/15' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/40'
                    }
                  `}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User profile / Environment Info & Logout */}
        <div className="p-4 border-t border-slate-900 space-y-3">
          {/* Environment Status Badge */}
          <div className="p-3 bg-slate-900/40 rounded-xl border border-slate-900/50 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {user?.isLive ? (
                <>
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Live Sync</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">Demo Mode</span>
                </>
              )}
            </div>
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
          </div>

          {/* User Details */}
          <div className="flex items-center justify-between gap-3 px-2">
            <div className="overflow-hidden">
              <span className="font-bold text-xs text-white block truncate">{user?.username}</span>
              <span className="text-[10px] text-slate-500 block">{user?.role} Account</span>
            </div>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to end your session?')) {
                  onLogout();
                }
              }}
              title="Logout Session"
              className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
