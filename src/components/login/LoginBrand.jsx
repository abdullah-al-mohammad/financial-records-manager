import { Shield } from 'lucide-react';

// Login card heading and logo.
export default function LoginBrand() {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/20 mb-4">
        <Shield className="w-7 h-7 text-white" />
      </div>
      <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-violet-300 bg-clip-text text-transparent">
        Financial Manager
      </h1>
      <p className="text-sm text-slate-400 mt-1">
        Access secure transaction spreadsheets
      </p>
    </div>
  );
}
