import { Menu, X } from 'lucide-react';
import fatafatLogo from '../../assets/fatafat-logo.svg';

// Mobile-only top bar with menu toggle.
export default function SidebarMobileBar({ isOpen, onToggle }) {
  return (
    <div className="lg:hidden flex items-center justify-between px-4 py-3 bg-[var(--bg-sidebar-color)] border-b border-slate-800 sticky top-0 z-40">
      <div className="flex items-center gap-2">
        <div
          className="bg-black p-1.5 rounded-lg shadow-sm border border-slate-800"
          style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
        >
          <img src={fatafatLogo} alt="Fatafat" className="h-6 w-auto" />
        </div>
      </div>
      <button
        onClick={onToggle}
        className="p-1.5 rounded-lg border border-slate-800 text-slate-400 hover:text-white"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>
    </div>
  );
}
