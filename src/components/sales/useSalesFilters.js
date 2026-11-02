import { useMemo, useState } from 'react';
import { buildVisibleRecords, filterSalesRecords } from './salesLogic';

// Owns the sales table search/filter state and derived record lists.
export default function useSalesFilters(records) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMonth, setFilterMonth] = useState('All');
  const [filterType, setFilterType] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  const visibleRecords = useMemo(() => buildVisibleRecords(records), [records]);

  const filteredRecords = useMemo(
    () => filterSalesRecords(visibleRecords, { searchTerm, filterMonth, filterType }),
    [visibleRecords, searchTerm, filterMonth, filterType]
  );

  return {
    searchTerm,
    setSearchTerm,
    filterMonth,
    setFilterMonth,
    filterType,
    setFilterType,
    showFilters,
    setShowFilters,
    visibleRecords,
    filteredRecords,
  };
}
