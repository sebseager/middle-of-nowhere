import { fireEvent, render, screen } from "@testing-library/react";
import { CITIES } from "../src/lib/cities";
import ResultOverlay from "../src/lib/ResultOverlay";

const target = CITIES[0];

describe("ResultOverlay", () => {
  it("is hidden while playing", () => {
    render(
      <ResultOverlay
        status="playing"
        target={target}
        startNewRound={jest.fn()}
      />,
    );

    expect(screen.queryByText("New Round")).not.toBeInTheDocument();
  });

  it("shows winner state and can start a new round", () => {
    const startNewRound = jest.fn();

    render(
      <ResultOverlay
        status="won"
        target={target}
        startNewRound={startNewRound}
      />,
    );

    expect(
      screen.getByText(
        (_, element) =>
          element?.textContent ===
          `Correct! It was ${target.city}, ${target.state}.`,
      ),
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "New Round" }));
    expect(startNewRound).toHaveBeenCalledTimes(1);
  });
});
