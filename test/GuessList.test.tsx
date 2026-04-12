import { render, screen } from "@testing-library/react";
import GuessList from "../src/lib/GuessList";

describe("GuessList", () => {
  it("renders six slots and guess distance content", () => {
    render(
      <GuessList
        guesses={[
          { input: "Phoenix, AZ", correct: false, milesAway: 1200 },
          { input: "Tucson, AZ", correct: true, milesAway: 0 },
        ]}
      />,
    );

    expect(screen.getByLabelText("Guess history")).toBeInTheDocument();
    expect(
      screen.getByText("Phoenix, AZ is 1200 miles away"),
    ).toBeInTheDocument();
    expect(screen.getByText("Tucson, AZ is 0 miles away")).toBeInTheDocument();
  });
});
