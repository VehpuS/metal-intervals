import { ChevronLeft, ChevronRight, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import MetalEarGymSidebar from "./MetalEarGymSidebar";
import MetalEarGymSongResults from "./MetalEarGymSongResults";
import { parseMetalEarGymData } from "./metalEarGymData";
import type { MetalEarGymAppProps, Song } from "./metalEarGymTypes";

export default function MetalEarGymApp({ data }: MetalEarGymAppProps) {
  const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);
  const [intervalsInitialized, setIntervalsInitialized] = useState(false);
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const processedData = useMemo(() => parseMetalEarGymData(data), [data]);

  const allIntervalNames = useMemo(
    () => processedData.map((i) => i.name),
    [processedData],
  );

  useEffect(() => {
    if (!intervalsInitialized && allIntervalNames.length > 0) {
      setSelectedIntervals(allIntervalNames);
      setIntervalsInitialized(true);
    }
  }, [allIntervalNames, intervalsInitialized]);

  const activeIntervalLabel =
    selectedIntervals.length === 0
      ? "No Intervals"
      : selectedIntervals.length === allIntervalNames.length
        ? "All Intervals"
        : selectedIntervals.length === 1
          ? selectedIntervals[0]
          : `${selectedIntervals.length} Intervals`;

  const toggleInterval = (interval: string) => {
    setSelectedIntervals((prev) =>
      prev.includes(interval)
        ? prev.filter((i) => i !== interval)
        : [...prev, interval],
    );
  };

  const filteredSongs = useMemo(() => {
    const normalizedSearchTerm = searchTerm.toLowerCase();
    const songs = processedData
      .filter((g) => selectedIntervals.includes(g.name))
      .flatMap((g) => g.songs);

    return songs.filter(
      (song) =>
        song.song.toLowerCase().includes(normalizedSearchTerm) ||
        song.part.toLowerCase().includes(normalizedSearchTerm),
    );
  }, [processedData, selectedIntervals, searchTerm]);

  const handleToggleAllIntervals = () => {
    setSelectedIntervals((currentIntervals) =>
      currentIntervals.length === allIntervalNames.length
        ? []
        : allIntervalNames,
    );
  };

  const handlePlayClick = (item: Song) => {
    if (item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-red-600 selection:text-white overflow-hidden">
      <MetalEarGymSidebar
        isOpen={isLeftSidebarOpen}
        selectedIntervals={selectedIntervals}
        allIntervalNames={allIntervalNames}
        onToggleInterval={toggleInterval}
        onToggleAll={handleToggleAllIntervals}
      />

      <main className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-2xl z-10 shrink-0">
          <div className="flex items-center gap-12 flex-1">
            <button
              onClick={() => setIsLeftSidebarOpen((open) => !open)}
              aria-label={
                isLeftSidebarOpen
                  ? "Hide interval drawer"
                  : "Show interval drawer"
              }
              aria-expanded={isLeftSidebarOpen}
              className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shrink-0"
            >
              {isLeftSidebarOpen ? (
                <ChevronLeft className="w-5 h-5" />
              ) : (
                <ChevronRight className="w-5 h-5" />
              )}
            </button>
            <div className="flex flex-col">
              <h2 className="text-4xl font-black tracking-tighter text-white uppercase italic leading-none">
                {activeIntervalLabel || "Loading..."}
              </h2>
              <div className="flex items-center gap-2 mt-2">
                <div className="h-1 w-8 bg-red-600 rounded-full" />
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.3em]">
                  {filteredSongs.length} Active Examples
                </span>
              </div>
            </div>

            <div className="relative w-full max-w-sm group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-red-600 transition-colors" />
              <input
                type="text"
                placeholder="Search songs or artists..."
                className="w-full bg-zinc-900/30 border border-zinc-800/50 rounded-2xl py-3.5 pl-12 pr-4 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-red-600/20 transition-all placeholder:text-zinc-700 focus:bg-black focus:border-zinc-700 uppercase tracking-widest"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </header>
        <MetalEarGymSongResults
          songs={filteredSongs}
          activeIntervalLabel={activeIntervalLabel}
          onPlayClick={handlePlayClick}
        />
      </main>

      <div className="fixed bottom-[-40px] right-[-40px] pointer-events-none select-none opacity-[0.03] z-0">
        <h1 className="text-[25vw] font-black leading-none tracking-tighter italic">
          RIFFS
        </h1>
      </div>
    </div>
  );
}
