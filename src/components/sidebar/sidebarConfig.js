import {
  Coins,
  HandCoins,
  History,
  Landmark,
  LayoutDashboard,
  Receipt,
  ShoppingBag,
  Users,
} from 'lucide-react';

// Navigation entries visible to every signed-in user.
export const BASE_MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'sales', label: 'Sales Records', icon: ShoppingBag },
  { id: 'expenses', label: 'Expense Page', icon: Receipt },
  { id: 'billing', label: 'Merchant Billing', icon: Landmark },
  { id: 'receivables', label: 'Receivables & Payables', icon: HandCoins },
  { id: 'otherCash', label: 'Other Cash', icon: Coins },
  { id: 'history', label: 'History Archives', icon: History },
];

// Build the sidebar menu, adding admin settings for administrators.
export const buildMenuItems = user => {
  const menuItems = [...BASE_MENU_ITEMS];

  // Only show Admin Panel if user is Admin
  if (user?.role === 'Admin') {
    menuItems.push({ id: 'admin', label: 'Admin Settings', icon: Users });
  }

  return menuItems;
};
