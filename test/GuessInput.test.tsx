import { fireEvent, render, screen } from "@testing-library/react";
import GuessInput from "../src/lib/GuessInput";

describe("GuessInput", () => {
  it("submits via callback and clears input on success", () => {
    const submitGuess = jest.fn(() => ({ accepted: true as const }));

    render(
      <GuessInput
        labels={["Phoenix, AZ", "Tucson, AZ"]}
        status="playing"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    const input = screen.getByRole("combobox");
    const button = screen.getByRole("button", { name: "Guess" });

    fireEvent.change(input, { target: { value: "Phoenix, AZ" } });
    fireEvent.click(button);

    expect(submitGuess).toHaveBeenCalledWith("Phoenix, AZ");
    expect(input).toHaveValue("");
    expect(screen.queryByText("Already guessed.")).not.toBeInTheDocument();
  });

  it("shows duplicate error and keeps value", () => {
    const submitGuess = jest.fn(() => ({
      accepted: false as const,
      reason: "duplicate" as const,
    }));

    render(
      <GuessInput
        labels={["Phoenix, AZ"]}
        status="playing"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    const input = screen.getByRole("combobox");

    fireEvent.change(input, { target: { value: "Phoenix, AZ" } });
    fireEvent.submit(
      screen
        .getByRole("button", { name: "Guess" })
        .closest("form") as HTMLFormElement,
    );

    expect(screen.getByText("Already guessed.")).toBeInTheDocument();
    expect(input).toHaveValue("Phoenix, AZ");
  });

  it("disables controls when game is not playing", () => {
    const submitGuess = jest.fn(() => ({ accepted: true as const }));

    render(
      <GuessInput
        labels={["Phoenix, AZ"]}
        status="won"
        submitGuess={submitGuess}
        roundKey="round-1"
      />,
    );

    expect(screen.getByRole("combobox")).toBeDisabled();
    expect(screen.getByRole("button", { name: "Guess" })).toBeDisabled();
  });
});
