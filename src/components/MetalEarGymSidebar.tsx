import { Check, ChevronLeft, Disc } from "lucide-react";

type MetalEarGymSidebarProps = {
  isOpen: boolean;
  selectedIntervals: string[];
  allIntervalNames: string[];
  onToggleInterval: (interval: string) => void;
  onToggleAll: () => void;
  onClose: () => void;
};

export default function MetalEarGymSidebar({
  isOpen,
  selectedIntervals,
  allIntervalNames,
  onToggleInterval,
  onToggleAll,
  onClose,
}: MetalEarGymSidebarProps) {
  if (!isOpen) {
    return null;
  }

  const areAllIntervalsSelected =
    selectedIntervals.length === allIntervalNames.length;

  return (
    <>
      {/* Mobile backdrop — tapping closes the sidebar */}
      <div
        className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className="fixed inset-y-0 left-0 md:relative md:inset-auto w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0 z-50 md:z-20">
        <div className="px-5 pb-1 pt-5 md:p-8 md:pb-1">
          <div className="mb-1 flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-600 shadow-lg shadow-red-900/20 rotate-3">
                <Disc className="h-7 w-7 animate-spin-slow text-white" />
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-xl font-black italic leading-none tracking-tighter uppercase">
                  Metal Ear Gym
                </h1>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-zinc-500">
                  Metal Training
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              aria-label="Hide interval drawer"
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/40 text-zinc-300 transition-colors hover:border-zinc-700 hover:text-white md:hidden"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 custom-scrollbar">
          <div className="mb-3 flex items-center justify-between px-4">
            <div className="flex items-center gap-2 opacity-40">
              <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                Select Interval
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="mx-2 h-px flex-1 bg-zinc-800" />
              <button
                onClick={onToggleAll}
                aria-label={
                  areAllIntervalsSelected
                    ? "Deselect all intervals"
                    : "Select all intervals"
                }
                className="text-[9px] font-black uppercase tracking-widest text-zinc-600 transition-colors hover:text-zinc-400"
              >
                {areAllIntervalsSelected ? "None" : "All"}
              </button>
            </div>
          </div>
          {allIntervalNames.map((interval) => {
            const isSelected = selectedIntervals.includes(interval);

            return (
              <button
                key={interval}
                onClick={() => onToggleInterval(interval)}
                className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-between group border ${
                  isSelected
                    ? "bg-zinc-900 text-white border-zinc-700 shadow-2xl"
                    : "text-zinc-500 hover:bg-white/5 border-transparent hover:text-zinc-200"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${isSelected ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "bg-transparent"}`}
                  />
                  <span className="uppercase tracking-widest">{interval}</span>
                </div>
                <Check
                  className={`w-4 h-4 transition-all ${isSelected ? "opacity-100 text-red-500" : "opacity-0"}`}
                />
              </button>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
