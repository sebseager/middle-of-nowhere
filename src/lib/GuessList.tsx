import type { GuessResult } from "./gameStore";

interface GuessListProps {
  guesses: GuessResult[];
}

const slots = [0, 1, 2, 3, 4, 5];

function getDistanceClass(guess: GuessResult): string {
  if (guess.correct) {
    return "slot-correct";
  }

  return guess.milesAway < 1000 ? "slot-near" : "slot-far";
}

function GuessList({ guesses }: GuessListProps) {
  return (
    <div className="guess-slots" aria-label="Guess history">
      {slots.map((slot) => {
        const guess = guesses[slot];

        if (!guess) {
          return (
            <div key={slot} className="slot slot-empty">
              &nbsp;
            </div>
          );
        }

        return (
          <div key={slot} className="slot-group">
            <div className={`slot ${getDistanceClass(guess)}`}>
              <span>{guess.input}</span>
            </div>
            <div className="distance-box">
              {guess.input} is {guess.milesAway} miles away
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default GuessList;
