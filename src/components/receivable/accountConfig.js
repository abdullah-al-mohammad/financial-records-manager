import { CreditCard, PiggyBank, Wallet } from 'lucide-react';

// Account metadata used by table status badges and revert confirmations.
export const ACCOUNT_LABELS = {
  cash: {
    label: 'Hand Cash',
    icon: PiggyBank,
    color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
  },
  online: {
    label: 'Online Cash',
    icon: CreditCard,
    color: 'text-violet-400 bg-violet-500/10 border-violet-500/20',
  },
  other_cash: {
    label: 'Other Cash',
    icon: Wallet,
    color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20',
  },
};

// Account choices rendered by the receive / pay confirmation modals.
export const ACCOUNT_OPTIONS = [
  {
    id: 'cash',
    label: 'Hand Cash',
    desc: 'Physical Cash',
    icon: PiggyBank,
    color: 'text-amber-400',
  },
  {
    id: 'online',
    label: 'Online Cash',
    desc: 'bKash / Bank',
    icon: CreditCard,
    color: 'text-violet-400',
  },
  {
    id: 'other_cash',
    label: 'Other Cash',
    desc: 'Extra Reserve',
    icon: Wallet,
    color: 'text-emerald-400',
  },
];
