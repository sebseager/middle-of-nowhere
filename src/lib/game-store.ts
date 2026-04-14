import type { City } from "./cities";
import { ALL_CITIES, cityLabel } from "./cities";

export const ZOOM_STEPS = [16, 14, 12, 10, 8, 6] as const;

export interface GuessResult {
  input: string;
  cityKey?: string;
  correct: boolean;
  milesAway: number;
  lat: number;
  lng: number;
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

export const normalizeInput = (value: string): string =>
  value.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

const toCityKey = (city: City): string =>
  `${normalizeInput(city.city)}|${normalizeInput(city.abbr)}`;

// Build an index for the full city list (used for guess validation).
// We index ALL cities so any valid city name is accepted regardless of filter.
const cityIndex = new Map<string, number>();
ALL_CITIES.forEach((city: City, index: number) => {
  cityIndex.set(normalizeInput(cityLabel(city)), index);
  cityIndex.set(normalizeInput(`${city.city}, ${city.abbr}`), index);
  cityIndex.set(normalizeInput(`${city.city}, ${city.state}`), index);
  cityIndex.set(normalizeInput(`${city.city}, ${city.country}`), index);
});

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

export const createInitialState = (cities: City[]): GameState => ({
  target: cities[Math.floor(Math.random() * cities.length)],
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

  const guessedCity = ALL_CITIES[cityIdx];
  const guessedCityKey = toCityKey(guessedCity);

  const alreadyGuessed = state.guesses.some(
    (guess: GuessResult) =>
      guess.cityKey === guessedCityKey ||
      normalizeInput(guess.input) === normalizeInput(cityLabel(guessedCity)) ||
      normalizeInput(guess.input) ===
        normalizeInput(`${guessedCity.city}, ${guessedCity.abbr}`),
  );
  if (alreadyGuessed) {
    return {
      state,
      result: { accepted: false, reason: "duplicate" },
    };
  }

  const inputLabel = cityLabel(guessedCity);
  const correct =
    guessedCity.city === state.target.city &&
    guessedCity.abbr === state.target.abbr;
  const milesAway = correct ? 0 : distanceMiles(guessedCity, state.target);

  const nextGuesses = [
    ...state.guesses,
    {
      input: inputLabel,
      cityKey: guessedCityKey,
      correct,
      milesAway,
      lat: guessedCity.lat,
      lng: guessedCity.lng,
    },
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
