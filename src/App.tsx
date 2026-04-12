import { useCallback, useState } from "react";
import GuessInput from "./lib/GuessInput";
import GuessList from "./lib/GuessList";
import Map from "./lib/Map";
import ResultOverlay from "./lib/ResultOverlay";
import { CITY_LABELS } from "./lib/cities";
import {
  ZOOM_STEPS,
  createInitialState,
  submitGuess,
  type SubmitResult,
} from "./lib/gameStore";

function App() {
  const [game, setGame] = useState(createInitialState);
  const [roundCounter, setRoundCounter] = useState(0);

  const startNewRound = useCallback(() => {
    setGame(createInitialState());
    setRoundCounter((prev) => prev + 1);
  }, []);

  const handleSubmitGuess = useCallback((input: string): SubmitResult => {
    let submitResult: SubmitResult = { accepted: false, reason: "invalid" };

    setGame((prev) => {
      const { state, result } = submitGuess(prev, input);
      submitResult = result;
      return state;
    });

    return submitResult;
  }, []);

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>MIDDLE OF NOWHERE</h1>
        <p>Guess the mystery U.S. city in 6 tries.</p>
      </header>

      <main className="game-area">
        <GuessList guesses={game.guesses} />
        <GuessInput
          labels={CITY_LABELS}
          status={game.status}
          submitGuess={handleSubmitGuess}
          roundKey={`${game.target.city}-${game.target.abbr}-${roundCounter}`}
        />
        <div className="map-wrap">
          <Map
            target={game.target}
            minZoom={ZOOM_STEPS[game.currentZoomLevel]}
            showResult={game.status !== "playing"}
            resultLabel={`${game.target.city}, ${game.target.abbr}`}
          />
          <ResultOverlay
            status={game.status}
            target={game.target}
            startNewRound={startNewRound}
          />
        </div>
      </main>
    </div>
  );
}

export default App;
