// Error and success banners for the login card.
export default function LoginAlerts({ error, success }) {
  return (
    <>
      {error && (
        <div className="p-3.5 mb-6 text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2.5 animate-pulse">
          <span className="font-bold">Error:</span> {error}
        </div>
      )}

      {success && (
        <div className="p-3.5 mb-6 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
          {success}
        </div>
      )}
    </>
  );
}
