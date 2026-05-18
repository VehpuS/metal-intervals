import type {
  EarRitualRow,
  IntervalGroup,
  ParsedVideo,
  SheetRow,
} from "./earRitualTypes";

const MIN_SONG_TITLE_LENGTH = 6;
const MAX_SONG_TITLE_LENGTH = 120;
const SONG_TITLE_SEARCH_PATTERN = /^(?=.*[a-z])(?=.*\s)[-a-z0-9 !&.,:+]+$/i;
const LEADING_QUOTE_PATTERN = /^["']/;
const TRAILING_QUOTE_PATTERN = /["']$/;
const HYPERLINK_FORMULA_PATTERN = /^=HYPERLINK\(\s*"([^"]+)"\s*[,;]/i;
const ABSOLUTE_URL_PATTERN = /^https?:\/\//i;
const YOUTUBE_URL_PATTERN = /^(www\.)?youtube\.com\//i;
const SHORT_YOUTUBE_URL_PATTERN = /^youtu\.be\//i;

const DEFAULT_INTERVAL_NAME = "Unknown Interval";
const DEFAULT_DIRECTION_NAME = "Unknown";
const SHEET_HEADER_LABEL = "Interval";
const SHORTS_PATH_PREFIX = "/shorts/";
const EMBED_PATH_PREFIX = "/embed/";
const CLIP_PATH_PREFIX = "/clip/";

const isSearchableSongTitle = (value: string): boolean => {
  return (
    value.length >= MIN_SONG_TITLE_LENGTH &&
    value.length <= MAX_SONG_TITLE_LENGTH &&
    SONG_TITLE_SEARCH_PATTERN.test(value)
  );
};

const toRows = (data: EarRitualRow[]): SheetRow[] => {
  return data.map((entry) =>
    Array.isArray(entry) ? entry : (entry.row ?? []),
  );
};

const normalizeSheetUrl = (value?: string): string => {
  if (!value || typeof value !== "string") return "";

  const trimmedValue = value.trim();
  if (!trimmedValue) return "";

  const unquotedValue = trimmedValue
    .replace(LEADING_QUOTE_PATTERN, "")
    .replace(TRAILING_QUOTE_PATTERN, "")
    .trim();

  const hyperlinkMatch = unquotedValue.match(HYPERLINK_FORMULA_PATTERN);
  if (hyperlinkMatch?.[1]) return hyperlinkMatch[1].trim();

  if (ABSOLUTE_URL_PATTERN.test(unquotedValue)) return unquotedValue;

  if (YOUTUBE_URL_PATTERN.test(unquotedValue)) {
    return `https://${unquotedValue}`;
  }

  if (SHORT_YOUTUBE_URL_PATTERN.test(unquotedValue)) {
    return `https://${unquotedValue}`;
  }

  if (isSearchableSongTitle(unquotedValue)) {
    return `https://www.youtube.com/results?search_query=${encodeURIComponent(unquotedValue)}`;
  }

  return "";
};

const parseYouTubeUrl = (url?: string): ParsedVideo => {
  const normalizedUrl = normalizeSheetUrl(url);
  if (!normalizedUrl) {
    return { type: "none", originalUrl: "" };
  }

  try {
    const urlObj = new URL(normalizedUrl);

    let videoId = "";
    let clipId = urlObj.searchParams.get("clip") ?? "";

    if (urlObj.hostname.includes("youtube.com")) {
      if (urlObj.pathname.startsWith(SHORTS_PATH_PREFIX)) {
        videoId = urlObj.pathname
          .slice(SHORTS_PATH_PREFIX.length)
          .split("/")[0];
      } else if (urlObj.pathname.startsWith(EMBED_PATH_PREFIX)) {
        videoId = urlObj.pathname.slice(EMBED_PATH_PREFIX.length).split("/")[0];
      } else if (urlObj.pathname.startsWith(CLIP_PATH_PREFIX)) {
        clipId = urlObj.pathname.slice(CLIP_PATH_PREFIX.length).split("/")[0];
      } else {
        videoId = urlObj.searchParams.get("v") ?? "";
      }
    } else if (urlObj.hostname.includes("youtu.be")) {
      videoId = urlObj.pathname.slice(1).split("/")[0];
    }

    if (videoId || clipId) {
      return { type: clipId ? "clip" : "video", originalUrl: normalizedUrl };
    }

    return { type: "unknown", originalUrl: normalizedUrl };
  } catch {
    return { type: "none", originalUrl: normalizedUrl };
  }
};

export const parseEarRitualData = (data: EarRitualRow[]): IntervalGroup[] => {
  const result: IntervalGroup[] = [];
  let lastInterval = DEFAULT_INTERVAL_NAME;
  let lastDirection = DEFAULT_DIRECTION_NAME;

  toRows(data).forEach((row, index) => {
    if (!Array.isArray(row) || row.length === 0 || row.every((cell) => !cell)) {
      return;
    }

    if (index === 0 && row[0] === SHEET_HEADER_LABEL) {
      return;
    }

    const intervalName = row[0];
    const directionName = row[1];
    const songName = row[2];
    const part = row[3];
    const link = row[4];

    if (intervalName && intervalName.trim() !== "") {
      lastInterval = intervalName;
    }

    if (directionName && directionName.trim() !== "") {
      lastDirection = directionName;
    }

    if (!songName || songName.trim() === "") {
      return;
    }

    let intervalGroup = result.find((group) => group.name === lastInterval);
    if (!intervalGroup) {
      intervalGroup = { name: lastInterval, songs: [] };
      result.push(intervalGroup);
    }

    const { type, originalUrl } = parseYouTubeUrl(link);

    intervalGroup.songs.push({
      id: `song-${index}`,
      interval: lastInterval,
      direction: lastDirection || DEFAULT_DIRECTION_NAME,
      song: songName,
      part: part || "",
      link: originalUrl,
      type,
    });
  });

  return result;
};
