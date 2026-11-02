import { useState } from 'react';
import SidebarBrand from './SidebarBrand';
import SidebarEnvironmentBadge from './SidebarEnvironmentBadge';
import SidebarMobileBar from './SidebarMobileBar';
import SidebarNav from './SidebarNav';
import SidebarUserPanel from './SidebarUserPanel';
import ThemeSelector from './ThemeSelector';
import { buildMenuItems } from './sidebarConfig';

export default function Sidebar({ activeTab, setActiveTab, user, onLogout, theme, onChangeTheme }) {
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = buildMenuItems(user);

  const handleNav = tabId => {
    setActiveTab(tabId);
    setIsOpen(false);
  };

  return (
    <>
      <SidebarMobileBar isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />

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
          <SidebarBrand />
          <SidebarNav menuItems={menuItems} activeTab={activeTab} onNavigate={handleNav} />
        </div>

        {/* User profile / Environment Info & Logout */}
        <div className="p-4 border-t border-slate-800/60 space-y-3">
          <SidebarEnvironmentBadge user={user} />
          <ThemeSelector theme={theme} onChangeTheme={onChangeTheme} />
          <SidebarUserPanel user={user} onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
}
