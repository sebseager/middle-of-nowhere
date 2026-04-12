import type { City } from "./cities";
import { CITIES } from "./cities";

export const ZOOM_STEPS = [12, 10, 8, 7, 6, 4] as const;

export interface GuessResult {
  input: string;
  correct: boolean;
  milesAway: number;
}

export interface GameState {
  target: City;
  guesses: GuessResult[];
  status: "playing" | "won" | "lost";
  currentZoomLevel: number;
}

export interface SubmitResult {
  accepted: boolean;
  reason?: "invalid" | "duplicate";
}

export interface SubmitGuessOutput {
  state: GameState;
  result: SubmitResult;
}

const cityIndex = new Map<string, number>();

export const normalizeInput = (value: string): string =>
  value.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

CITIES.forEach((city: City, index: number) => {
  cityIndex.set(normalizeInput(`${city.city}, ${city.abbr}`), index);
  cityIndex.set(normalizeInput(`${city.city}, ${city.state}`), index);
});

const randomCity = (): City =>
  CITIES[Math.floor(Math.random() * CITIES.length)];

const EARTH_RADIUS_MI = 3958.8;

const toRadians = (degrees: number): number => (degrees * Math.PI) / 180;

export const distanceMiles = (from: City, to: City): number => {
  const dLat = toRadians(to.lat - from.lat);
  const dLng = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);

  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(dLng / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(EARTH_RADIUS_MI * c);
};

export const createInitialState = (): GameState => ({
  target: randomCity(),
  guesses: [],
  status: "playing",
  currentZoomLevel: 0,
});

export const submitGuess = (
  state: GameState,
  input: string,
): SubmitGuessOutput => {
  const value = input.trim();
  if (!value) {
    return {
      state,
      result: { accepted: false, reason: "invalid" },
    };
  }

  const normalizedInput = normalizeInput(value);
  const cityIdx = cityIndex.get(normalizedInput);
  if (cityIdx === undefined) {
    return {
      state,
      result: { accepted: false, reason: "invalid" },
    };
  }

  if (state.status !== "playing") {
    return {
      state,
      result: { accepted: false, reason: "invalid" },
    };
  }

  const alreadyGuessed = state.guesses.some(
    (guess: GuessResult) => normalizeInput(guess.input) === normalizedInput,
  );
  if (alreadyGuessed) {
    return {
      state,
      result: { accepted: false, reason: "duplicate" },
    };
  }

  const guessedCity = CITIES[cityIdx];
  const inputLabel = `${guessedCity.city}, ${guessedCity.abbr}`;
  const correct =
    guessedCity.city === state.target.city &&
    guessedCity.abbr === state.target.abbr;
  const milesAway = correct ? 0 : distanceMiles(guessedCity, state.target);

  const nextGuesses = [
    ...state.guesses,
    { input: inputLabel, correct, milesAway },
  ];

  let status: GameState["status"] = state.status;
  let currentZoomLevel = state.currentZoomLevel;

  if (correct) {
    status = "won";
  } else if (nextGuesses.length >= 6) {
    status = "lost";
    currentZoomLevel = 5;
  } else {
    currentZoomLevel = Math.min(state.currentZoomLevel + 1, 5);
  }

  return {
    state: {
      ...state,
      guesses: nextGuesses,
      status,
      currentZoomLevel,
    },
    result: { accepted: true },
  };
};
