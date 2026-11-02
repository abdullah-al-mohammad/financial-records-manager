import { Search } from 'lucide-react';

const DEFAULT_CONTAINER_CLASS = 'relative flex-1';
const DEFAULT_ICON_CLASS = 'absolute left-3.5 top-2.5 w-4 h-4 text-slate-500';
const DEFAULT_INPUT_CLASS =
  'w-full bg-slate-950/80 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-3.5 py-2 text-xs text-white placeholder-slate-600 outline-none transition-all';

// Reusable search input with the standard leading search icon.
export default function SearchField({
  value,
  onChange,
  placeholder = 'Search...',
  containerClassName = DEFAULT_CONTAINER_CLASS,
  iconClassName = DEFAULT_ICON_CLASS,
  inputClassName = DEFAULT_INPUT_CLASS,
}) {
  return (
    <div className={containerClassName}>
      <Search className={iconClassName} />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className={inputClassName}
      />
    </div>
  );
}
