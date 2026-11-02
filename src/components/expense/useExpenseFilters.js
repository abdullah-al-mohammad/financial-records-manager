import { useMemo, useState } from 'react';

// Search + category filtering for the itemized expense ledger.
export default function useExpenseFilters(itemizedExpenses) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('All');

  const filteredItems = useMemo(() => {
    return itemizedExpenses.filter(item => {
      const matchSearch =
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.merchantName && item.merchantName.toLowerCase().includes(searchTerm.toLowerCase()));
      const matchCat = filterCategory === 'All' || item.category === filterCategory;
      return matchSearch && matchCat;
    });
  }, [itemizedExpenses, searchTerm, filterCategory]);

  return {
    searchTerm,
    setSearchTerm,
    filterCategory,
    setFilterCategory,
    filteredItems,
  };
}
