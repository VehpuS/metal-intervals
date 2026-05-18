import { EmptyResults } from "./EmptyResults";
import { SongCard } from "./SongCard";
import type { MetalEarGymSongResultsProps } from "./types";

export default function MetalEarGymSongResults({
  songs,
  activeIntervalLabel,
  onPlayClick,
}: MetalEarGymSongResultsProps) {
  return (
    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar pb-32">
      <div className="max-w-5xl mx-auto space-y-4">
        {songs.length > 0 ? (
          songs.map((song) => (
            <SongCard key={song.id} song={song} onPlayClick={onPlayClick} />
          ))
        ) : (
          <EmptyResults activeIntervalLabel={activeIntervalLabel} />
        )}
      </div>
    </div>
  );
}
