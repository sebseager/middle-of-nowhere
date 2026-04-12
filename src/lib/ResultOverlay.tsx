import type { City } from "./cities";

interface ResultOverlayProps {
  status: "playing" | "won" | "lost";
  target: City;
  startNewRound: () => void;
}

function ResultOverlay({ status, target, startNewRound }: ResultOverlayProps) {
  if (status === "playing") {
    return null;
  }

  return (
    <div
      className={`result-overlay ${status === "won" ? "result-win" : "result-loss"}`}
    >
      {status === "won" ? (
        <p>
          Correct! It was{" "}
          <strong>
            {target.city}, {target.state}
          </strong>
          .
        </p>
      ) : (
        <p>
          The city was{" "}
          <strong>
            {target.city}, {target.state}
          </strong>
          .
        </p>
      )}
      <button className="new-round-btn" onClick={startNewRound}>
        New Round
      </button>
    </div>
  );
}

export default ResultOverlay;
