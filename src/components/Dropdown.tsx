import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface DropdownProps {
  labels: string[];
  value: string;
  disabled: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export interface DropdownHandle {
  focus: () => void;
  blur: () => void;
}

const Dropdown = forwardRef<DropdownHandle, DropdownProps>(
  (
    {
      labels,
      value,
      disabled,
      onChange,
      placeholder = "Guess a city, e.g. Rome, Italy",
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const filtered = useMemo(() => {
      const query = value.trim().toLowerCase();
      if (query.length < 3) {
        return [];
      }
      return labels.filter((label) => label.toLowerCase().includes(query));
    }, [labels, value]);

    useEffect(() => {
      setHighlightIndex(-1);
    }, [filtered]);

    useImperativeHandle(ref, () => ({
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }));

    const selectLabel = (label: string) => {
      onChange(label);
      setOpen(false);
      setHighlightIndex(-1);
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (!open && filtered.length > 0) {
          setOpen(true);
          setHighlightIndex(0);
          return;
        }
        if (open) {
          setHighlightIndex((prev) => Math.min(prev + 1, filtered.length - 1));
        }
        return;
      }

      if (event.key === "ArrowUp") {
        event.preventDefault();
        if (open) {
          setHighlightIndex((prev) => Math.max(prev - 1, 0));
        }
        return;
      }

      if (
        event.key === "Enter" &&
        open &&
        highlightIndex >= 0 &&
        highlightIndex < filtered.length
      ) {
        event.preventDefault();
        event.stopPropagation();
        selectLabel(filtered[highlightIndex]);
        return;
      }

      if (event.key === "Escape") {
        setOpen(false);
        setHighlightIndex(-1);
      }
    };

    const showDropdown = open && filtered.length > 0;

    return (
      <div className="relative flex-1">
        <input
          ref={inputRef}
          type="text"
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={showDropdown}
          aria-controls="city-listbox"
          aria-activedescendant={
            highlightIndex >= 0 ? `city-option-${highlightIndex}` : undefined
          }
          value={value}
          placeholder={placeholder}
          disabled={disabled}
          name="city-guess"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          data-form-type="other"
          data-1p-ignore="true"
          data-lpignore="true"
          data-bwignore="true"
          className="w-full rounded-xl border border-stone-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-stone-400 focus:border-rose-400 focus:ring-2 focus:ring-rose-200 disabled:cursor-not-allowed disabled:bg-stone-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-rose-500 dark:focus:ring-rose-900 dark:disabled:bg-slate-900"
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onFocus={() => {
            if (filtered.length > 0) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => setOpen(false), 120);
          }}
          onKeyDown={handleKeyDown}
        />
        {showDropdown && (
          <ul
            id="city-listbox"
            role="listbox"
            className="absolute left-0 right-0 top-full z-50 mt-1 max-h-48 overflow-auto rounded-xl border border-stone-200 bg-white shadow-lg dark:border-slate-700 dark:bg-slate-800"
          >
            {filtered.map((label, index) => (
              <li
                key={label}
                id={`city-option-${index}`}
                role="option"
                aria-selected={highlightIndex === index}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  highlightIndex === index
                    ? "bg-rose-50 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300"
                    : "text-slate-700 dark:text-slate-200"
                }`}
                onMouseDown={() => selectLabel(label)}
                onMouseEnter={() => setHighlightIndex(index)}
              >
                {label}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  },
);

Dropdown.displayName = "Dropdown";

export default Dropdown;
