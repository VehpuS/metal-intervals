import type { Song } from "../metalEarGymTypes";

export type MetalEarGymSongResultsProps = {
  songs: Song[];
  activeIntervalLabel: string;
  onPlayClick: (song: Song) => void;
};

export type SongCardProps = {
  song: Song;
  onPlayClick: (song: Song) => void;
};
