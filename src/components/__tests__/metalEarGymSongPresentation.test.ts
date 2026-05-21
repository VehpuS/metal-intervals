import { describe, expect, it } from "vitest";
import { getSongLinkMeta } from "../metalEarGymSongPresentation";

describe("getSongLinkMeta", () => {
  it("returns label 'No Valid Link' for type none", () => {
    expect(getSongLinkMeta("none").label).toBe("No Valid Link");
  });

  it("returns label 'Clip' for type clip", () => {
    expect(getSongLinkMeta("clip").label).toBe("Clip");
  });

  it("returns label 'Full Video' for type video", () => {
    expect(getSongLinkMeta("video").label).toBe("Full Video");
  });

  it("returns label 'External Link' for type unknown", () => {
    expect(getSongLinkMeta("unknown").label).toBe("External Link");
  });

  it("returns an icon component for every type", () => {
    const types = ["none", "clip", "video", "unknown"] as const;
    for (const type of types) {
      expect(getSongLinkMeta(type).icon).toBeDefined();
    }
  });

  it("returns an iconClassName string for every type", () => {
    const types = ["none", "clip", "video", "unknown"] as const;
    for (const type of types) {
      expect(typeof getSongLinkMeta(type).iconClassName).toBe("string");
    }
  });
});
