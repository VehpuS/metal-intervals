import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MetalEarGymSidebar from "../MetalEarGymSidebar";

const allIntervals = ["Minor 2nd", "Major 2nd", "Minor 3rd"];

describe("MetalEarGymSidebar", () => {
  it("renders nothing when closed", () => {
    const { container } = render(
      <MetalEarGymSidebar
        isOpen={false}
        selectedIntervals={allIntervals}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("renders all interval buttons when open", () => {
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={allIntervals}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(screen.getByText("Minor 2nd")).toBeInTheDocument();
    expect(screen.getByText("Major 2nd")).toBeInTheDocument();
    expect(screen.getByText("Minor 3rd")).toBeInTheDocument();
  });

  it("calls onToggleInterval when an interval button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleInterval = vi.fn();
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={allIntervals}
        allIntervalNames={allIntervals}
        onToggleInterval={onToggleInterval}
        onToggleAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByText("Major 2nd"));
    expect(onToggleInterval).toHaveBeenCalledWith("Major 2nd");
  });

  it("shows 'None' button when all intervals are selected", () => {
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={allIntervals}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /deselect all/i }),
    ).toBeInTheDocument();
  });

  it("shows 'All' button when no intervals are selected", () => {
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={[]}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={vi.fn()}
        onClose={vi.fn()}
      />,
    );
    expect(
      screen.getByRole("button", { name: /select all/i }),
    ).toBeInTheDocument();
  });

  it("calls onToggleAll when the all/none button is clicked", async () => {
    const user = userEvent.setup();
    const onToggleAll = vi.fn();
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={[]}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={onToggleAll}
        onClose={vi.fn()}
      />,
    );
    await user.click(screen.getByRole("button", { name: /select all/i }));
    expect(onToggleAll).toHaveBeenCalledOnce();
  });

  it("calls onClose when the backdrop is clicked", async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(
      <MetalEarGymSidebar
        isOpen={true}
        selectedIntervals={allIntervals}
        allIntervalNames={allIntervals}
        onToggleInterval={vi.fn()}
        onToggleAll={vi.fn()}
        onClose={onClose}
      />,
    );
    // The backdrop has aria-hidden="true" – query by role is not suitable; use test id via the element
    const backdrop = document.querySelector(
      '[aria-hidden="true"]',
    ) as HTMLElement;
    await user.click(backdrop);
    expect(onClose).toHaveBeenCalledOnce();
  });
});
