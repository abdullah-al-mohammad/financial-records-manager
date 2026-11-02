// Reusable summary/stat card used across dashboard-style sections.
// Renders two variants so existing layouts stay pixel-identical:
// - with an icon (title + icon header, large white value)
// - without an icon (plain title + coloured value)
export default function StatCard({
  title,
  value,
  icon: Icon,
  iconColor = 'text-slate-400',
  iconBg = 'bg-slate-500/10',
  valueClassName = 'text-white',
}) {
  if (!Icon) {
    return (
      <div className="glass-panel border border-slate-900 rounded-2xl p-5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <p className={`text-2xl font-bold mt-2 ${valueClassName}`}>{value}</p>
      </div>
    );
  }

  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-5 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          {title}
        </span>
        <div className={`p-2 rounded-xl ${iconBg} ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <div className="mt-4">
        <span className={`text-2xl font-bold tracking-tight ${valueClassName}`}>{value}</span>
      </div>
    </div>
  );
}
