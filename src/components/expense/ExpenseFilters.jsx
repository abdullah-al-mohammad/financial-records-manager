import SearchField from '../shared/SearchField';

// Search + category filter bar for the expense sheet.
export default function ExpenseFilters({
  searchTerm,
  onSearchChange,
  filterCategory,
  onCategoryChange,
}) {
  return (
    <div className="glass-panel border border-slate-900 rounded-2xl p-4 flex flex-col sm:flex-row gap-3">
      <SearchField
        value={searchTerm}
        onChange={onSearchChange}
        placeholder="Search items by name or merchant..."
      />
      <div className="flex items-center gap-2 min-w-45">
        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Category
        </span>
        <select
          value={filterCategory}
          onChange={e => onCategoryChange(e.target.value)}
          className="flex-1 bg-slate-950/80 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-white outline-none"
        >
          <option value="All">All Categories</option>
          <option value="Rider Wages">Rider Salary</option>
          <option value="Fixed Cost">Fixed Costs</option>
          <option value="Variable Overhead">Other Expenses</option>
          <option value="Sales Discount">Sales Discounts</option>
        </select>
      </div>
    </div>
  );
}
