import type { LucideIcon } from "lucide-react";
import { Clock, ExternalLink, Scissors, Youtube } from "lucide-react";

import type { VideoType } from "./earRitualTypes";

type SongLinkMeta = {
  icon: LucideIcon;
  iconClassName: string;
  label: string;
};

const SONG_LINK_META: Record<VideoType, SongLinkMeta> = {
  none: {
    icon: Clock,
    iconClassName: "w-3.5 h-3.5 text-zinc-600",
    label: "No Valid Link",
  },
  clip: {
    icon: Scissors,
    iconClassName: "w-3.5 h-3.5 text-purple-500",
    label: "Clip",
  },
  video: {
    icon: Youtube,
    iconClassName: "w-3.5 h-3.5 text-red-500",
    label: "Full Video",
  },
  unknown: {
    icon: ExternalLink,
    iconClassName: "w-3.5 h-3.5 text-blue-500",
    label: "External Link",
  },
};

export const getSongLinkMeta = (type: VideoType): SongLinkMeta => {
  return SONG_LINK_META[type];
};
