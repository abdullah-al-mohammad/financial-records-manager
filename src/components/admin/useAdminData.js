import { useEffect, useRef, useState } from 'react';
import { api } from '../../utils/api';

// Loads admin users + audit logs and exposes a manual refresh action.
export default function useAdminData({ onShowToast }) {
  const [users, setUsers] = useState([]);
  const [logs, setLogs] = useState([]);

  const [isRefreshing, setIsRefreshing] = useState(false); // background data refresh — data stays visible
  const hasLoadedRef = useRef(false);

  // Load Admin Data
  const loadData = async ({ silent = false } = {}) => {
    // First load: wait visibly. Subsequent refreshes: silent (data stays visible).
    if (!hasLoadedRef.current) {
      setIsRefreshing(true);
    } else if (!silent) {
      setIsRefreshing(true);
    }
    try {
      const [uData, lData] = await Promise.all([
        api.getUsers({ forceRefresh: true }),
        api.getAuditLogs({ forceRefresh: true }),
      ]);
      setUsers(uData);
      setLogs(lData);
      hasLoadedRef.current = true;
    } catch (err) {
      onShowToast(`Failed to load admin controls: ${err.message}`, 'error');
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    users,
    logs,
    isRefreshing,
    loadData,
  };
}
