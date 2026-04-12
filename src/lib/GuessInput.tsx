import { useEffect, useRef, useState, type FormEvent } from "react";
import CityDropdown, { type CityDropdownHandle } from "./CityDropdown";
import type { SubmitResult } from "./gameStore";

interface GuessInputProps {
  labels: string[];
  status: "playing" | "won" | "lost";
  submitGuess: (input: string) => SubmitResult;
  roundKey: string;
}

function GuessInput({
  labels,
  status,
  submitGuess,
  roundKey,
}: GuessInputProps) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const dropdownRef = useRef<CityDropdownHandle | null>(null);

  useEffect(() => {
    setValue("");
    setError("");
    dropdownRef.current?.focus();
  }, [roundKey]);

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (status !== "playing") {
      return;
    }

    const result = submitGuess(value);
    if (!result.accepted) {
      setError(
        result.reason === "duplicate"
          ? "Already guessed."
          : "Please choose a city from the list.",
      );
      return;
    }

    setError("");
    setValue("");
    dropdownRef.current?.blur();
  };

  return (
    <>
      <form className="guess-form" onSubmit={onSubmit}>
        <CityDropdown
          ref={dropdownRef}
          labels={labels}
          value={value}
          onChange={setValue}
          disabled={status !== "playing"}
        />
        <button
          className="guess-btn"
          type="submit"
          disabled={status !== "playing"}
        >
          Guess
        </button>
      </form>
      {error && <p className="input-error">{error}</p>}
    </>
  );
}

export default GuessInput;
