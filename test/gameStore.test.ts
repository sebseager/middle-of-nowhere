import { CITIES } from "../src/lib/cities";
import {
  submitGuess,
  type GameState,
  type SubmitGuessOutput,
} from "../src/lib/gameStore";

const pickCity = (city: string, abbr: string) => {
  const result = CITIES.find(
    (candidate) => candidate.city === city && candidate.abbr === abbr,
  );
  if (!result) {
    throw new Error(`City not found: ${city}, ${abbr}`);
  }
  return result;
};

const buildPlayingState = (
  targetCity = "Phoenix",
  targetAbbr = "AZ",
): GameState => ({
  target: pickCity(targetCity, targetAbbr),
  guesses: [],
  status: "playing",
  currentZoomLevel: 0,
});

const submit = (state: GameState, input: string): SubmitGuessOutput =>
  submitGuess(state, input);

describe("gameStore submitGuess", () => {
  it("marks a correct guess as won with zero miles", () => {
    const state = buildPlayingState();

    const { state: nextState, result } = submit(state, "Phoenix, AZ");

    expect(result).toEqual({ accepted: true });
    expect(nextState.status).toBe("won");
    expect(nextState.guesses).toHaveLength(1);
    expect(nextState.guesses[0]).toMatchObject({
      input: "Phoenix, AZ",
      correct: true,
      milesAway: 0,
    });
  });

  it("rejects invalid and duplicate guesses", () => {
    const initialState = buildPlayingState();

    const invalid = submit(initialState, "Not A Real Place");
    expect(invalid.result).toEqual({ accepted: false, reason: "invalid" });

    const firstAccepted = submit(initialState, "Tucson, AZ");
    expect(firstAccepted.result).toEqual({ accepted: true });

    const duplicate = submit(firstAccepted.state, "Tucson, AZ");
    expect(duplicate.result).toEqual({ accepted: false, reason: "duplicate" });
  });

  it("loses after six incorrect guesses and forces max zoom-out", () => {
    const state = buildPlayingState("Anchorage", "AK");
    const wrongGuesses = [
      "Phoenix, AZ",
      "Tucson, AZ",
      "Mesa, AZ",
      "Scottsdale, AZ",
      "Little Rock, AR",
      "Denver, CO",
    ];

    const final = wrongGuesses.reduce(
      (currentState, guess) => submit(currentState, guess).state,
      state,
    );

    expect(final.status).toBe("lost");
    expect(final.currentZoomLevel).toBe(5);
    expect(final.guesses).toHaveLength(6);
    expect(final.guesses.every((guess) => !guess.correct)).toBe(true);
  });
});
