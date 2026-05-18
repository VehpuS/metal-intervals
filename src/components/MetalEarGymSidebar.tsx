import { Check, Disc } from "lucide-react";

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
      <div className="p-8 pb-1">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-2xl shadow-lg shadow-red-900/20 rotate-3">
            <Disc className="w-7 h-7 text-white animate-spin-slow" />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
              Metal Ear Gym
            </h1>
            <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">
              Metal Training
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-2 py-2 space-y-1.5 custom-scrollbar">
        <div className="px-4 mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2 opacity-40">
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              Select Interval
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="h-[1px] flex-1 mx-2 bg-zinc-800" />
            <button
              onClick={onToggleAll}
              aria-label={
                areAllIntervalsSelected
                  ? "Deselect all intervals"
                  : "Select all intervals"
              }
              className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
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
