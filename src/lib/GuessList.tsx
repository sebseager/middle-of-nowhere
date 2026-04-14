import { COLOR_PALETTE } from "./color-palette";
import type { GuessResult } from "./game-store";

interface GuessListProps {
  guesses: GuessResult[];
  distanceUnit: "mi" | "km";
}

const slots = [0, 1, 2, 3, 4, 5];

function getCircleColor(guess: GuessResult): string {
  if (guess.correct) {
    return COLOR_PALETTE.correctGuessGreen;
  }

  return guess.milesAway < 1000
    ? COLOR_PALETTE.nearGuessOrange
    : COLOR_PALETTE.farGuessRed;
}

const formatDistance = (miles: number, unit: "mi" | "km"): number =>
  unit === "mi" ? miles : Math.round(miles * 1.60934);

function GuessList({ guesses, distanceUnit }: GuessListProps) {
  return (
    <div
      className="w-full overflow-hidden rounded-2xl border border-stone-300 bg-white/85 dark:border-slate-700 dark:bg-slate-900/70"
      aria-label="Guess history"
    >
      <ol className="divide-y divide-stone-200 dark:divide-slate-700">
        {slots.map((slot) => {
          const guess = guesses[slot];
          const slotNumber = slot + 1;

          if (!guess) {
            return (
              <li
                key={slot}
                className="flex min-h-12 items-center gap-3 px-3 py-2"
              >
                <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-stone-300 text-xs font-bold text-stone-500 dark:border-slate-600 dark:text-slate-400">
                  {slotNumber}
                </span>
                <span className="text-sm font-semibold text-stone-400 dark:text-slate-500">
                  ---
                </span>
              </li>
            );
          }

          const rowText = guess.correct
            ? guess.input
            : `${guess.input} (${formatDistance(guess.milesAway, distanceUnit)} ${distanceUnit})`;
          const circleColor = getCircleColor(guess);

          return (
            <li
              key={slot}
              className="flex min-h-12 min-w-0 items-center gap-3 px-3 py-2"
            >
              <span
                className="inline-flex h-6 w-6 items-center justify-center rounded-full border text-xs font-bold text-white"
                style={{
                  backgroundColor: circleColor,
                  borderColor: circleColor,
                }}
              >
                {slotNumber}
              </span>
              <span className="min-w-0 break-words text-sm font-semibold text-slate-800 dark:text-slate-100">
                {rowText}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export default GuessList;
