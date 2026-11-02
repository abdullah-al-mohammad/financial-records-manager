import { format } from 'date-fns';
import { ArrowRightLeft, X } from 'lucide-react';
import DatePicker from 'react-datepicker';

// Modal that records a Hand Cash <-> Online Cash transfer.
export default function TransferModal({
  onClose,
  transferType,
  setTransferType,
  transferAmount,
  setTransferAmount,
  transferDate,
  setTransferDate,
  transferNote,
  setTransferNote,
  transferSubmitting,
  onSubmit,
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(6px)' }}
    >
      <div className="bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl w-full max-w-sm p-6 space-y-5 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-500 hover:text-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <ArrowRightLeft className="w-4 h-4 text-violet-400" />
            Transfer Funds
          </h2>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Move money between Hand Cash and Online Cash Balance
          </p>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Transfer Direction
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setTransferType('cash_to_online')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  transferType === 'cash_to_online'
                    ? 'bg-violet-600/20 border-violet-500/60 text-violet-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Hand Cash → Online
              </button>
              <button
                onClick={() => setTransferType('online_to_cash')}
                className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                  transferType === 'online_to_cash'
                    ? 'bg-violet-600/20 border-violet-500/60 text-violet-300'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                }`}
              >
                Online → Hand Cash
              </button>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Amount (৳)
            </label>
            <input
              type="number"
              min="1"
              value={transferAmount}
              onChange={e => setTransferAmount(e.target.value)}
              placeholder="e.g. 5000"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500 transition-colors"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">Date</label>
            <DatePicker
              selected={transferDate ? new Date(transferDate) : null}
              onChange={date => {
                if (date) {
                  setTransferDate(format(date, 'yyyy-MM-dd'));
                }
              }}
              dateFormat="MMMM d, yyyy"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500 transition-colors"
              wrapperClassName="w-full"
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-slate-400 block mb-1">
              Note (optional)
            </label>
            <input
              type="text"
              value={transferNote}
              onChange={e => setTransferNote(e.target.value)}
              placeholder="e.g. Moved for bill payment"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white outline-none focus:border-violet-500 transition-colors"
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-900 rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSubmit}
            disabled={transferSubmitting || !transferAmount || parseFloat(transferAmount) <= 0}
            className="px-5 py-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-xs font-semibold cursor-pointer transition-all"
          >
            {transferSubmitting ? 'Saving…' : 'Confirm Transfer'}
          </button>
        </div>
      </div>
    </div>
  );
}
