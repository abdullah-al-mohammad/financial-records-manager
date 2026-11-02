// Sidebar navigation links.
export default function SidebarNav({ menuItems, activeTab, onNavigate }) {
  return (
    <nav className="p-3.5 space-y-1.5">
      {menuItems.map(item => {
        const Icon = item.icon;
        const isActive = activeTab === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
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
  );
}
