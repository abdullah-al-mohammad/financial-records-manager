import fatafatLogo from '../../assets/fatafat-logo.svg';

// Desktop sidebar brand block.
export default function SidebarBrand() {
  return (
    <div className="h-16 flex items-center px-5 border-b border-slate-800/60 print:border-transparent">
      <div
        className="bg-black/90 p-2 rounded-xl shadow-md border border-slate-800/80 flex items-center gap-2.5"
        style={{ WebkitPrintColorAdjust: 'exact', printColorAdjust: 'exact' }}
      >
        <img src={fatafatLogo} alt="Fatafat" className="h-6.5 w-auto" />
        <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
          Records
        </span>
      </div>
    </div>
  );
}
