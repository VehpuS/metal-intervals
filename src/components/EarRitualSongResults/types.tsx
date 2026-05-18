import type { Song } from "../earRitualTypes";

export type EarRitualSongResultsProps = {
  songs: Song[];
  activeIntervalLabel: string;
  onPlayClick: (song: Song) => void;
};

export type SongCardProps = {
  song: Song;
  onPlayClick: (song: Song) => void;
};
