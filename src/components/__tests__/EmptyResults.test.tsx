import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { EmptyResults } from "../MetalEarGymSongResults/EmptyResults";

describe("EmptyResults", () => {
  it("renders the 'Void Detected' heading", () => {
    render(<EmptyResults activeIntervalLabel="Minor 2nd" />);
    expect(
      screen.getByRole("heading", { name: /void detected/i }),
    ).toBeInTheDocument();
  });

  it("shows the active interval label in the message", () => {
    render(<EmptyResults activeIntervalLabel="Minor 2nd" />);
    expect(screen.getByText(/"Minor 2nd"/)).toBeInTheDocument();
  });
});
