import { cityLabel, type City } from "./cities";
import PrimaryButton from "../components/PrimaryButton";

interface ResultOverlayProps {
  status: "playing" | "won" | "lost";
  target: City;
  startNewRound: () => void;
}

function ResultOverlay({ status, target, startNewRound }: ResultOverlayProps) {
  if (status === "playing") {
    return null;
  }

  const targetLabel = cityLabel(target);

  return (
    <div className="absolute inset-x-3 bottom-3 z-[500] flex flex-col gap-2 rounded-2xl border border-stone-300 bg-white/95 p-3 shadow-lg shadow-black/20 backdrop-blur md:flex-row md:items-center md:justify-between dark:border-slate-700 dark:bg-slate-900/95">
      {status === "won" ? (
        <p className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
          Correct! It was <strong>{targetLabel}</strong>.
        </p>
      ) : (
        <p className="text-sm font-semibold text-rose-700 dark:text-rose-400">
          The city was <strong>{targetLabel}</strong>.
        </p>
      )}
      <PrimaryButton onClick={startNewRound}>New Round</PrimaryButton>
    </div>
  );
}

export default ResultOverlay;
