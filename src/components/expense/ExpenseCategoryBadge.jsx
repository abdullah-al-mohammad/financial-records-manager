const CATEGORY_STYLES = {
  'Rider Wages': 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  'Fixed Cost': 'bg-amber-500/10 border-amber-500/20 text-amber-400',
  'Sales Discount': 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  'Variable Overhead': 'bg-violet-500/10 border-violet-500/20 text-violet-400',
};

const CATEGORY_LABELS = {
  'Rider Wages': 'Rider Salary',
  'Variable Overhead': 'Other Expenses',
};

// Coloured category pill used inside the expense table.
export default function ExpenseCategoryBadge({ category }) {
  return (
    <span
      className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold border uppercase tracking-wider ${
        CATEGORY_STYLES[category] || CATEGORY_STYLES['Variable Overhead']
      }`}
    >
      {CATEGORY_LABELS[category] || category}
    </span>
  );
}
