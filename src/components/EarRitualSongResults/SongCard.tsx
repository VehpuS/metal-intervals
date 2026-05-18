import { ArrowDownRight, ArrowUpRight, Play, Volume2 } from "lucide-react";

import { getSongLinkMeta } from "../earRitualSongPresentation";
import type { SongCardProps } from "./types";

export function SongCard({ song, onPlayClick }: SongCardProps) {
  const isAscending = song.direction === "Ascending";
  const hasLink = song.type !== "none";
  const { icon: LinkIcon, iconClassName, label } = getSongLinkMeta(song.type);

  return (
    <div className="group relative bg-[#0a0a0a] hover:bg-[#0e0e0e] border border-white/5 hover:border-white/10 rounded-[2rem] p-7 transition-all flex items-center gap-10">
      <div
        className={`w-16 h-16 rounded-2xl flex flex-col items-center justify-center shrink-0 border transition-all ${
          isAscending
            ? "bg-emerald-600/5 border-emerald-600/10 text-emerald-500 group-hover:bg-emerald-600/10"
            : "bg-orange-600/5 border-orange-600/10 text-orange-500 group-hover:bg-orange-600/10"
        }`}
      >
        {isAscending ? (
          <ArrowUpRight className="w-7 h-7 mb-0.5" />
        ) : (
          <ArrowDownRight className="w-7 h-7 mb-0.5" />
        )}
        <span className="text-[8px] font-black uppercase tracking-tighter opacity-70 leading-none">
          {song.direction.slice(0, 4)}
        </span>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-4 mb-3 flex-wrap">
          <h3 className="text-2xl font-black text-zinc-100 tracking-tighter group-hover:text-white transition-colors uppercase italic leading-none">
            {song.song}
          </h3>
          {song.part && (
            <span className="text-[9px] font-black uppercase tracking-[0.2em] bg-zinc-900 text-zinc-500 px-3 py-1.5 rounded-xl border border-zinc-800">
              {song.part}
            </span>
          )}
        </div>

        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <LinkIcon className={iconClassName} />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 group-hover:text-zinc-400 transition-colors">
              {label}
            </span>
          </div>
          <div className="w-1 h-1 rounded-full bg-zinc-800" />
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-600">
            <Volume2 className="w-3.5 h-3.5 opacity-40" />
            <span>Interval: {song.interval}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => onPlayClick(song)}
          disabled={!hasLink}
          title={hasLink ? "Play" : undefined}
          className={`group/play w-16 h-16 rounded-3xl flex items-center justify-center transition-all relative overflow-hidden shadow-2xl ${
            hasLink
              ? "bg-white text-black cursor-pointer hover:scale-110 active:scale-95"
              : "bg-zinc-900 text-zinc-800 cursor-not-allowed border border-zinc-800"
          }`}
        >
          {hasLink && (
            <div className="absolute inset-0 bg-red-600 translate-y-full group-hover/play:translate-y-0 transition-transform duration-300" />
          )}
          <Play
            className={`w-8 h-8 fill-current relative z-10 transition-colors ${hasLink ? "group-hover/play:text-white" : ""}`}
          />
        </button>
      </div>
    </div>
  );
}
