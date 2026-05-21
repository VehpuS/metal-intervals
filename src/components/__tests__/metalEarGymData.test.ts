import { describe, expect, it } from "vitest";
import { parseMetalEarGymData } from "../metalEarGymData";

describe("parseMetalEarGymData", () => {
  it("returns empty array for empty input", () => {
    expect(parseMetalEarGymData([])).toEqual([]);
  });

  it("skips the header row", () => {
    const data = [["Interval", "Direction", "Song", "Part", "Link"]];
    expect(parseMetalEarGymData(data)).toEqual([]);
  });

  it("skips rows with no song name", () => {
    const data = [["Minor 2nd", "Ascending", "", "", ""]];
    expect(parseMetalEarGymData(data)).toEqual([]);
  });

  it("skips entirely empty rows", () => {
    const data = [
      ["", "", "", "", ""],
      ["Major 2nd", "Ascending", "Walk - Pantera", "Riff", ""],
    ];
    const result = parseMetalEarGymData(data);
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Major 2nd");
  });

  it("groups songs by interval", () => {
    const data = [
      ["Minor 2nd", "Ascending", "Song A", "Intro", ""],
      ["", "", "Song B", "Verse", ""],
      ["Major 2nd", "Descending", "Song C", "", ""],
    ];
    const result = parseMetalEarGymData(data);
    expect(result).toHaveLength(2);
    expect(result[0].name).toBe("Minor 2nd");
    expect(result[0].songs).toHaveLength(2);
    expect(result[1].name).toBe("Major 2nd");
    expect(result[1].songs).toHaveLength(1);
  });

  it("carries forward interval name across blank interval cells", () => {
    const data = [
      ["Minor 2nd", "Ascending", "Song A", "", ""],
      ["", "", "Song B", "", ""],
    ];
    const result = parseMetalEarGymData(data);
    expect(result[0].songs[0].interval).toBe("Minor 2nd");
    expect(result[0].songs[1].interval).toBe("Minor 2nd");
  });

  it("carries forward direction name across blank direction cells", () => {
    const data = [
      ["Minor 2nd", "Ascending", "Song A", "", ""],
      ["", "", "Song B", "", ""],
    ];
    const result = parseMetalEarGymData(data);
    expect(result[0].songs[1].direction).toBe("Ascending");
  });

  it("accepts RowWrapper format", () => {
    const data = [{ row: ["Minor 2nd", "Ascending", "Song A", "Riff", ""] }];
    const result = parseMetalEarGymData(data);
    expect(result[0].songs[0].song).toBe("Song A");
  });

  describe("YouTube URL parsing", () => {
    it("assigns type 'video' for standard youtube.com watch URL", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
        ],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("video");
    });

    it("assigns type 'video' for youtu.be short link", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          "https://youtu.be/dQw4w9WgXcQ",
        ],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("video");
    });

    it("assigns type 'video' for youtube Shorts URL", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          "https://www.youtube.com/shorts/abc123",
        ],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("video");
    });

    it("assigns type 'clip' for youtube clip URL with ?clip= param", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          "https://www.youtube.com/watch?v=abc&clip=Ugkx1",
        ],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("clip");
    });

    it("assigns type 'clip' for /clip/ path URL", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          "https://www.youtube.com/clip/Ugkx1abc",
        ],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("clip");
    });

    it("assigns type 'unknown' for non-youtube absolute URL", () => {
      const data = [
        ["Minor 2nd", "Ascending", "Song A", "", "https://vimeo.com/123456"],
      ];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("unknown");
    });

    it("assigns type 'none' for empty link", () => {
      const data = [["Minor 2nd", "Ascending", "Song A", "", ""]];
      expect(parseMetalEarGymData(data)[0].songs[0].type).toBe("none");
    });

    it("parses =HYPERLINK() formula and extracts URL", () => {
      const data = [
        [
          "Minor 2nd",
          "Ascending",
          "Song A",
          "",
          '=HYPERLINK("https://youtu.be/abc123", "Song A")',
        ],
      ];
      const song = parseMetalEarGymData(data)[0].songs[0];
      expect(song.type).toBe("video");
      expect(song.link).toBe("https://youtu.be/abc123");
    });

    it("generates YouTube search URL for bare song title", () => {
      const data = [
        ["Minor 2nd", "Ascending", "Walk - Pantera", "", "Walk - Pantera"],
      ];
      const song = parseMetalEarGymData(data)[0].songs[0];
      expect(song.type).toBe("unknown");
      expect(song.link).toContain("youtube.com/results?search_query=");
    });
  });

  describe("song fields", () => {
    it("generates a unique id per song", () => {
      const data = [
        ["Minor 2nd", "Ascending", "Song A", "", ""],
        ["", "", "Song B", "", ""],
      ];
      const songs = parseMetalEarGymData(data)[0].songs;
      expect(songs[0].id).not.toBe(songs[1].id);
    });

    it("stores part field", () => {
      const data = [["Minor 2nd", "Ascending", "Song A", "Intro Riff", ""]];
      expect(parseMetalEarGymData(data)[0].songs[0].part).toBe("Intro Riff");
    });

    it("stores empty string when no part", () => {
      const data = [["Minor 2nd", "Ascending", "Song A", "", ""]];
      expect(parseMetalEarGymData(data)[0].songs[0].part).toBe("");
    });
  });
});
