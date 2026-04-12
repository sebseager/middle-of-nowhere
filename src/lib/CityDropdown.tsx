import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
} from "react";

interface CityDropdownProps {
  labels: string[];
  value: string;
  disabled: boolean;
  placeholder?: string;
  onChange: (value: string) => void;
}

export interface CityDropdownHandle {
  focus: () => void;
  blur: () => void;
}

const CityDropdown = forwardRef<CityDropdownHandle, CityDropdownProps>(
  (
    {
      labels,
      value,
      disabled,
      onChange,
      placeholder = "Guess a city, e.g. Albany, NY",
    },
    ref,
  ) => {
    const [open, setOpen] = useState(false);
    const [highlightIndex, setHighlightIndex] = useState(-1);
    const inputRef = useRef<HTMLInputElement | null>(null);

    const filtered = useMemo(() => {
      const query = value.trim().toLowerCase();
      if (!query) {
        return [];
      }
      return labels
        .filter((label) => label.toLowerCase().includes(query))
        .slice(0, 8);
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

    return (
      <div className="dropdown-wrap">
        <input
          ref={inputRef}
          value={value}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.trim() && filtered.length > 0) {
              setOpen(true);
            }
          }}
          onBlur={() => {
            setTimeout(() => {
              setOpen(false);
            }, 150);
          }}
          className="dropdown-input"
          type="text"
          placeholder={placeholder}
          disabled={disabled}
          autoComplete="off"
          role="combobox"
          aria-controls="city-listbox"
          aria-expanded={open && filtered.length > 0}
          aria-autocomplete="list"
        />
        {open && filtered.length > 0 && (
          <div className="dropdown-list" role="listbox" id="city-listbox">
            {filtered.map((label, index) => (
              <button
                key={label}
                className={`dropdown-item ${index === highlightIndex ? "highlighted" : ""}`.trim()}
                type="button"
                role="option"
                aria-selected={index === highlightIndex}
                onMouseDown={(event) => {
                  event.preventDefault();
                  selectLabel(label);
                }}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  },
);

CityDropdown.displayName = "CityDropdown";

export default CityDropdown;
