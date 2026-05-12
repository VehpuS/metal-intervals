import {
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Clock,
  Disc,
  ExternalLink,
  Flame,
  Maximize2,
  Music,
  Play,
  Scissors,
  Search,
  Volume2,
  X,
  Youtube,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type SheetRow = string[];

type RowWrapper = {
  row?: SheetRow;
};

type VideoType = "none" | "clip" | "video" | "unknown";

type Song = {
  id: string;
  interval: string;
  direction: string;
  song: string;
  part: string;
  link: string;
  embedUrl: string | null;
  type: VideoType;
};

type IntervalGroup = {
  name: string;
  songs: Song[];
};

type ParsedVideo = {
  type: VideoType;
  embedUrl: string | null;
  originalUrl: string;
};

type EarRitualAppProps = {
  data: Array<SheetRow | RowWrapper>;
};

const MIN_SONG_TITLE_LENGTH = 6;
const MAX_SONG_TITLE_LENGTH = 120;
const SONG_TITLE_SEARCH_PATTERN = /^(?=.*[a-z])(?=.*\s)[-a-z0-9 !&.,:+]+$/i;

const isSearchableSongTitle = (value: string): boolean => {
  return (
    value.length >= MIN_SONG_TITLE_LENGTH &&
    value.length <= MAX_SONG_TITLE_LENGTH &&
    SONG_TITLE_SEARCH_PATTERN.test(value)
  );
};

export default function EarRitualApp({ data }: EarRitualAppProps) {
  const [selectedIntervals, setSelectedIntervals] = useState<string[]>([]);
  const [intervalsInitialized, setIntervalsInitialized] = useState(false);
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);
  const [isIntervalDrawerOpen, setIsIntervalDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeVideo, setActiveVideo] = useState<Song | null>(null);

  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  });

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  const normalizeSheetUrl = (value?: string): string => {
    if (!value || typeof value !== "string") return "";

    const trimmedValue = value.trim();
    if (!trimmedValue) return "";

    const unquotedValue = trimmedValue
      .replace(/^["']/, "")
      .replace(/["']$/, "")
      .trim();

    const hyperlinkMatch = unquotedValue.match(
      /^=HYPERLINK\(\s*"([^"]+)"\s*[,;]/i,
    );
    if (hyperlinkMatch?.[1]) return hyperlinkMatch[1].trim();

    if (/^https?:\/\//i.test(unquotedValue)) return unquotedValue;

    if (/^(www\.)?youtube\.com\//i.test(unquotedValue)) {
      return `https://${unquotedValue}`;
    }

    if (/^youtu\.be\//i.test(unquotedValue)) return `https://${unquotedValue}`;

    if (isSearchableSongTitle(unquotedValue)) {
      return `https://www.youtube.com/results?search_query=${encodeURIComponent(unquotedValue)}`;
    }

    return "";
  };

  const parseYouTubeUrl = (url?: string): ParsedVideo => {
    const normalizedUrl = normalizeSheetUrl(url);
    if (!normalizedUrl) {
      return { type: "none", embedUrl: null, originalUrl: "" };
    }

    try {
      const urlObj = new URL(normalizedUrl);

      // 1. Handle Clips (YouTube blocks iframe embedding for pure /clip/ routes)
      if (urlObj.pathname.includes("/clip/")) {
        return { type: "clip", embedUrl: null, originalUrl: normalizedUrl };
      }

      // 2. Handle Standard Videos & Shorts
      let videoId = "";
      if (urlObj.hostname.includes("youtube.com")) {
        if (urlObj.pathname.startsWith("/shorts/")) {
          videoId = urlObj.pathname.split("/shorts/")[1];
        } else {
          videoId = urlObj.searchParams.get("v") ?? "";
        }
      } else if (urlObj.hostname.includes("youtu.be")) {
        videoId = urlObj.pathname.slice(1);
      }

      if (videoId) {
        let embedUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

        // Extract timestamp if present
        const t =
          urlObj.searchParams.get("t") ||
          urlObj.searchParams.get("time_continue");
        if (t) {
          const seconds = parseInt(t.replace("s", ""), 10);
        if (!isNaN(seconds)) {
          embedUrl += `&start=${seconds}`;
        }
      }
        return { type: "video", embedUrl, originalUrl: normalizedUrl };
      }

      return { type: "unknown", embedUrl: null, originalUrl: normalizedUrl };
    } catch {
      return { type: "none", embedUrl: null, originalUrl: normalizedUrl };
    }
  };

  const processedData = useMemo<IntervalGroup[]>(() => {
    const result: IntervalGroup[] = [];
    let lastInterval = "Unknown Interval";
    let lastDirection = "Unknown";

    const rows = data.map((entry) =>
      Array.isArray(entry) ? entry : entry.row ?? [],
    );

    rows.forEach((row, index) => {
      if (!Array.isArray(row) || row.length === 0 || row.every((c) => !c))
        return;
      if (index === 0 && row[0] === "Interval") return; // Skip header

      const intervalName = row[0];
      const directionName = row[1];
      const songName = row[2];
      const part = row[3];
      const link = row[4];

      if (intervalName && intervalName.trim() !== "") lastInterval = intervalName;
      if (directionName && directionName.trim() !== "") {
        lastDirection = directionName;
      }

      if (songName && songName.trim() !== "") {
        let intervalGroup = result.find((g) => g.name === lastInterval);
        if (!intervalGroup) {
          intervalGroup = { name: lastInterval, songs: [] };
          result.push(intervalGroup);
        }

        const { type, embedUrl, originalUrl } = parseYouTubeUrl(link);

        intervalGroup.songs.push({
          id: `song-${index}`,
          interval: lastInterval,
          direction: lastDirection || "Unknown",
          song: songName,
          part: part || "",
          link: originalUrl,
          embedUrl,
          type,
        });
      }
    });
    return result;
  }, [data]);

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
    const songs = processedData
      .filter((g) => selectedIntervals.includes(g.name))
      .flatMap((g) => g.songs);
    return songs.filter(
      (s) =>
        s.song.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.part.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [processedData, selectedIntervals, searchTerm]);

  const handlePlayClick = (item: Song) => {
    if (item.embedUrl && isDesktop) {
      setActiveVideo(item);
    } else if (item.link) {
      window.open(item.link, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-100 font-sans selection:bg-red-600 selection:text-white overflow-hidden">
      {/* LEFT SIDEBAR: INTERVALS */}
      {isLeftDrawerOpen && (
        <aside className="w-80 border-r border-white/5 bg-[#080808] flex flex-col shrink-0 z-20">
          <div className="p-8 pb-4">
            <div className="flex items-center gap-3 mb-8">
              <div className="w-12 h-12 bg-red-600 flex items-center justify-center rounded-2xl shadow-lg shadow-red-900/20 rotate-3">
                <Disc className="w-7 h-7 text-white animate-spin-slow" />
              </div>
              <div>
                <h1 className="text-xl font-black italic tracking-tighter uppercase leading-none">
                  Ear Ritual
                </h1>
                <p className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase mt-1">
                  Metal Training
                </p>
              </div>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto px-4 py-4 space-y-1.5 custom-scrollbar">
            <div className="px-4 mb-3 flex items-center justify-between">
              <button
                onClick={() => setIsIntervalDrawerOpen((o) => !o)}
                aria-label="Toggle interval selection"
                aria-expanded={isIntervalDrawerOpen}
                className="flex items-center gap-2 opacity-40 hover:opacity-70 transition-opacity"
              >
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${isIntervalDrawerOpen ? "" : "-rotate-90"}`}
                />
                <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                  Select Interval
                </span>
              </button>
              <div className="flex items-center gap-3">
                <div className="h-[1px] flex-1 mx-2 bg-zinc-800" />
                <button
                  onClick={() =>
                    setSelectedIntervals(
                      selectedIntervals.length === allIntervalNames.length
                        ? []
                        : allIntervalNames,
                    )
                  }
                  aria-label={
                    selectedIntervals.length === allIntervalNames.length
                      ? "Deselect all intervals"
                      : "Select all intervals"
                  }
                  className="text-[9px] font-black uppercase tracking-widest text-zinc-600 hover:text-zinc-400 transition-colors"
                >
                  {selectedIntervals.length === allIntervalNames.length
                    ? "None"
                    : "All"}
                </button>
              </div>
            </div>
            {isIntervalDrawerOpen &&
              allIntervalNames.map((interval) => (
                <button
                  key={interval}
                  onClick={() => toggleInterval(interval)}
                  className={`w-full text-left px-5 py-4 rounded-2xl text-xs font-black transition-all flex items-center justify-between group border ${
                    selectedIntervals.includes(interval)
                      ? "bg-zinc-900 text-white border-zinc-700 shadow-2xl"
                      : "text-zinc-500 hover:bg-white/5 border-transparent hover:text-zinc-200"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-1.5 h-1.5 rounded-full ${selectedIntervals.includes(interval) ? "bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]" : "bg-transparent"}`}
                    />
                    <span className="uppercase tracking-widest">{interval}</span>
                  </div>
                  <Check
                    className={`w-4 h-4 transition-all ${selectedIntervals.includes(interval) ? "opacity-100 text-red-500" : "opacity-0"}`}
                  />
                </button>
              ))}
          </nav>

          <div className="p-6 bg-black border-t border-white/5">
            <div className="flex items-center gap-4 p-4 bg-zinc-900/40 rounded-2xl border border-zinc-800/50">
              <div className="w-10 h-10 bg-red-600/10 rounded-xl flex items-center justify-center">
                <Flame className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-300">
                  Pro Library
                </p>
                <p className="text-[9px] text-zinc-500 font-bold uppercase mt-0.5">
                  Read-Only Mode
                </p>
              </div>
            </div>
          </div>
        </aside>
      )}

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col bg-[#050505] relative overflow-hidden">
        {/* TOP BAR */}
        <header className="h-24 border-b border-white/5 flex items-center justify-between px-10 bg-[#050505]/80 backdrop-blur-2xl z-10 shrink-0">
          <div className="flex items-center gap-12 flex-1">
            <button
              onClick={() => setIsLeftDrawerOpen((open) => !open)}
              aria-label={isLeftDrawerOpen ? "Hide interval drawer" : "Show interval drawer"}
              aria-expanded={isLeftDrawerOpen}
              className="w-12 h-12 rounded-2xl border border-zinc-800 bg-zinc-900/40 flex items-center justify-center text-zinc-300 hover:text-white hover:border-zinc-700 transition-colors shrink-0"
            >
              {isLeftDrawerOpen ? (
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
                  {filteredSongs.length} Active Riffs
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

        {/* LIST SECTION */}
        <div className="flex-1 overflow-y-auto p-10 custom-scrollbar pb-32">
          <div className="max-w-5xl mx-auto space-y-4">
            {filteredSongs.length > 0 ? (
              filteredSongs.map((item) => (
                <div
                  key={item.id}
                  className={`group relative bg-[#0a0a0a] hover:bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-[2rem] p-7 transition-all flex items-center gap-10 ${activeVideo?.id === item.id ? "ring-2 ring-red-600/40 bg-[#0f0a0a]" : ""}`}
                >
                  {/* Direction Indicator */}
                  <div
                    className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all ${
                      item.direction === "Ascending"
                        ? "bg-emerald-600/5 border-emerald-600/10 text-emerald-500 group-hover:bg-emerald-600/10"
                        : "bg-orange-600/5 border-orange-600/10 text-orange-500 group-hover:bg-orange-600/10"
                    }`}
                  >
                    {item.direction === "Ascending" ? (
                      <ArrowUpRight className="w-7 h-7 mb-0.5" />
                    ) : (
                      <ArrowDownRight className="w-7 h-7 mb-0.5" />
                    )}
                    <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none">
                      {item.direction.slice(0, 4)}
                    </span>
                  </div>

                  {/* Metadata */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-4 mb-3 flex-wrap">
                      <h3 className="text-2xl font-black text-zinc-100 tracking-tighter group-hover:text-white transition-colors uppercase italic leading-none">
                        {item.song}
                      </h3>
                      {item.part && (
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-zinc-900 text-zinc-500 px-3 py-1.5 rounded-xl border border-zinc-800">
                          {item.part}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2">
                        {item.type === "clip" ? (
                          <Scissors className="w-3.5 h-3.5 text-purple-500" />
                        ) : item.type === "video" ? (
                          <Youtube className="w-3.5 h-3.5 text-red-500" />
                        ) : item.type === "unknown" ? (
                          <ExternalLink className="w-3.5 h-3.5 text-blue-500" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-zinc-600" />
                        )}
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
                          {item.type === "clip"
                            ? "External Clip"
                            : item.type === "video"
                              ? "Full Video"
                              : item.type === "unknown"
                                ? "External Link"
                                : "No Valid Link"}
                        </span>
                      </div>
                      <div className="w-1 h-1 rounded-full bg-zinc-800" />
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                        <Volume2 className="w-3.5 h-3.5 opacity-40" />
                        <span>Interval: {item.interval}</span>
                      </div>
                    </div>
                  </div>

                  {/* Desktop Actions */}
                  <div className="flex items-center gap-4">
                    <button
                      onClick={() => handlePlayClick(item)}
                      disabled={item.type === "none"}
                      title={item.type !== "none" ? "Play" : undefined}
                      className={`group/play w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-all relative overflow-hidden shadow-2xl ${
                        item.type !== "none"
                          ? "bg-white text-black hover:scale-110 active:scale-95"
                          : "bg-zinc-900 text-zinc-800 cursor-not-allowed border border-zinc-800"
                      }`}
                    >
                      {item.type !== "none" && (
                        <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/play:translate-y-0 transition-transform duration-300" />
                      )}
                      <Play
                          className={`w-8 h-8 fill-current relative z-10 transition-colors ${item.type !== "none" ? "group-hover/play:text-white" : ""}`}
                        />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-48 text-center bg-zinc-900/10 rounded-[3rem] border border-white/5 border-dashed">
                <div className="w-32 h-32 rounded-[3rem] bg-zinc-900 flex items-center justify-center mb-8 border border-zinc-800 shadow-2xl -rotate-6">
                  <Music className="w-12 h-12 text-zinc-700 rotate-6" />
                </div>
                <h4 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">
                  Void Detected
                </h4>
                <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-widest">
                  No artifacts match the ritual search for{" "}
                  <span className="text-red-600 font-black">
                    "{activeIntervalLabel}"
                  </span>
                  .
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* FLOATING MINI-PLAYER */}
      {activeVideo && (
        <div className="fixed bottom-8 right-8 w-[400px] bg-[#0c0c0c] border border-white/10 rounded-[2rem] shadow-[0_30px_100px_-10px_rgba(0,0,0,0.8)] overflow-hidden animate-in slide-in-from-bottom-10 duration-500 z-50">
          <div className="aspect-video bg-black relative group/player">
            {activeVideo.embedUrl ? (
              <iframe
                width="100%"
                height="100%"
                src={activeVideo.embedUrl}
                title="YouTube player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-zinc-600 bg-zinc-950">
                <Youtube className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-widest">
                  Unable to load media
                </p>
              </div>
            )}

            {/* Top Bar Overlay */}
            <div className="absolute top-0 inset-x-0 p-4 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between opacity-0 group-hover/player:opacity-100 transition-opacity">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest text-white drop-shadow-md">
                  Playing Riff
                </span>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center text-white hover:bg-red-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="p-6 bg-[#0c0c0c]">
            <div className="flex items-center justify-between mb-4">
              <div className="min-w-0 flex-1">
                <h4 className="text-lg font-black text-white uppercase italic tracking-tighter truncate leading-none mb-1">
                  {activeVideo.song}
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">
                    {activeVideo.part || "Reference Riff"}
                  </span>
                  <div className="w-1 h-1 rounded-full bg-zinc-800" />
                  <span className="text-[9px] font-black uppercase tracking-widest text-red-600">
                    {activeVideo.type} Mode
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.open(activeVideo.link, "_blank")}
                  className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-all"
                  title="Open in YouTube"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-4 border-t border-white/5">
              <div className="flex-1 h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                <div className="h-full bg-red-600 w-1/3 rounded-full" />
              </div>
              <span className="text-[10px] font-black text-zinc-600 font-mono">
                LIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Decorative background text */}
      <div className="fixed bottom-[-40px] right-[-40px] pointer-events-none select-none opacity-[0.03] z-0">
        <h1 className="text-[25vw] font-black leading-none tracking-tighter italic">
          RIFFS
        </h1>
      </div>

      <style>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 15s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #111;
          border-radius: 20px;
          border: 2px solid transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #222;
        }
      `}</style>
    </div>
  );
}
