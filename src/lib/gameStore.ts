import { get, writable } from "svelte/store";
import type { City } from "./cities";
import { CITIES } from "./cities";

export const ZOOM_STEPS = [12, 10, 8, 7, 6, 4] as const;

export interface GuessResult {
  input: string;
  correct: boolean;
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

const cityIndex = new Map<string, number>();

const normalize = (value: string): string =>
  value.toLowerCase().replace(/\./g, "").replace(/\s+/g, " ").trim();

CITIES.forEach((city: City, index: number) => {
  cityIndex.set(normalize(`${city.city}, ${city.abbr}`), index);
  cityIndex.set(normalize(`${city.city}, ${city.state}`), index);
});

const randomCity = (): City =>
  CITIES[Math.floor(Math.random() * CITIES.length)];

const createInitialState = (): GameState => ({
  target: randomCity(),
  guesses: [],
  status: "playing",
  currentZoomLevel: 0,
});

function createGameStore() {
  const store = writable<GameState>(createInitialState());

  const startNewRound = () => {
    store.set(createInitialState());
  };

  const submitGuess = (input: string): SubmitResult => {
    const value = input.trim();
    if (!value) {
      return { accepted: false, reason: "invalid" };
    }

    const normalizedInput = normalize(value);
    const cityIdx = cityIndex.get(normalizedInput);
    if (cityIdx === undefined) {
      return { accepted: false, reason: "invalid" };
    }

    const state = get(store);
    if (state.status !== "playing") {
      return { accepted: false, reason: "invalid" };
    }

    const alreadyGuessed = state.guesses.some(
      (g: GuessResult) => normalize(g.input) === normalizedInput,
    );
    if (alreadyGuessed) {
      return { accepted: false, reason: "duplicate" };
    }

    const guessedCity = CITIES[cityIdx];
    const inputLabel = `${guessedCity.city}, ${guessedCity.abbr}`;
    const correct =
      guessedCity.city === state.target.city &&
      guessedCity.abbr === state.target.abbr;

    const nextGuesses = [...state.guesses, { input: inputLabel, correct }];

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

    store.set({
      ...state,
      guesses: nextGuesses,
      status,
      currentZoomLevel,
    });

    return { accepted: true };
  };

  return {
    subscribe: store.subscribe,
    startNewRound,
    submitGuess,
  };
}

export const gameStore = createGameStore();
