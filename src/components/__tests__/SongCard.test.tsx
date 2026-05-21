import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { SongCard } from "../MetalEarGymSongResults/SongCard";
import type { Song } from "../metalEarGymTypes";

const baseSong: Song = {
  id: "song-1",
  interval: "Minor 2nd",
  direction: "Ascending",
  song: "Walk - Pantera",
  part: "Riff",
  link: "https://www.youtube.com/watch?v=abc123",
  type: "video",
};

describe("SongCard", () => {
  it("renders the song title", () => {
    render(<SongCard song={baseSong} onPlayClick={vi.fn()} />);
    expect(
      screen.getByRole("heading", { name: /walk - pantera/i }),
    ).toBeInTheDocument();
  });

  it("renders the part badge", () => {
    render(<SongCard song={baseSong} onPlayClick={vi.fn()} />);
    expect(screen.getByText("Riff")).toBeInTheDocument();
  });

  it("renders the interval label", () => {
    render(<SongCard song={baseSong} onPlayClick={vi.fn()} />);
    expect(screen.getByText(/interval: minor 2nd/i)).toBeInTheDocument();
  });

  it("calls onPlayClick when play button is clicked", async () => {
    const user = userEvent.setup();
    const onPlayClick = vi.fn();
    render(<SongCard song={baseSong} onPlayClick={onPlayClick} />);
    await user.click(screen.getByTitle("Play"));
    expect(onPlayClick).toHaveBeenCalledWith(baseSong);
  });

  it("play button is disabled when song has no link", () => {
    const noLinkSong: Song = { ...baseSong, link: "", type: "none" };
    render(<SongCard song={noLinkSong} onPlayClick={vi.fn()} />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not call onPlayClick when disabled button is clicked", async () => {
    const user = userEvent.setup();
    const onPlayClick = vi.fn();
    const noLinkSong: Song = { ...baseSong, link: "", type: "none" };
    render(<SongCard song={noLinkSong} onPlayClick={onPlayClick} />);
    await user.click(screen.getByRole("button"));
    expect(onPlayClick).not.toHaveBeenCalled();
  });

  it("shows ascending direction indicator for ascending songs", () => {
    render(
      <SongCard
        song={{ ...baseSong, direction: "Ascending" }}
        onPlayClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Asce")).toBeInTheDocument();
  });

  it("shows descending direction indicator for descending songs", () => {
    render(
      <SongCard
        song={{ ...baseSong, direction: "Descending" }}
        onPlayClick={vi.fn()}
      />,
    );
    expect(screen.getByText("Desc")).toBeInTheDocument();
  });
});
