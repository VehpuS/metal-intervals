import { Music } from "lucide-react";

import type { MetalEarGymSongResultsProps } from "./types";

export function EmptyResults({
  activeIntervalLabel,
}: Pick<MetalEarGymSongResultsProps, "activeIntervalLabel">) {
  return (
    <div className="flex flex-col items-center justify-center py-24 md:py-48 text-center bg-zinc-900/10 rounded-[3rem] border border-white/5 border-dashed">
      <div className="w-32 h-32 rounded-[3rem] bg-zinc-900 flex items-center justify-center mb-8 border border-zinc-800 shadow-2xl -rotate-6">
        <Music className="w-12 h-12 text-zinc-700 rotate-6" />
      </div>
      <h4 className="text-3xl font-black text-white mb-3 uppercase tracking-tighter italic">
        Void Detected
      </h4>
      <p className="text-zinc-500 max-w-sm text-sm font-medium leading-relaxed uppercase tracking-widest">
        No matches for{" "}
        <span className="text-red-600 font-black">"{activeIntervalLabel}"</span>
        .
      </p>
    </div>
  );
}
