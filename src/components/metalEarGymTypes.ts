export type SheetRow = string[];

export type RowWrapper = {
  row?: SheetRow;
};

export type MetalEarGymRow = SheetRow | RowWrapper;

export type VideoType = "none" | "clip" | "video" | "unknown";

export type Song = {
  id: string;
  interval: string;
  direction: string;
  song: string;
  part: string;
  link: string;
  type: VideoType;
};

export type IntervalGroup = {
  name: string;
  songs: Song[];
};

export type ParsedVideo = {
  type: VideoType;
  originalUrl: string;
};

export type MetalEarGymAppProps = {
  data: MetalEarGymRow[];
};
