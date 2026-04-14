import { render, screen } from "@testing-library/react";
import GuessList from "../src/lib/GuessList";

describe("GuessList", () => {
  it("renders six slots and inline distance content", () => {
    render(
      <GuessList
        distanceUnit="mi"
        guesses={[
          {
            input: "Phoenix, Arizona",
            correct: false,
            milesAway: 1200,
            lat: 33.4484,
            lng: -112.074,
          },
          {
            input: "Tucson, Arizona",
            correct: true,
            milesAway: 0,
            lat: 32.2226,
            lng: -110.9747,
          },
        ]}
      />,
    );

    expect(screen.getByLabelText("Guess history")).toBeInTheDocument();
    expect(screen.getByText("Phoenix, Arizona (1200 mi)")).toBeInTheDocument();
    expect(screen.getByText("Tucson, Arizona")).toBeInTheDocument();
  });
});
