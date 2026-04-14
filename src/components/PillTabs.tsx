interface PillTabsProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}

function PillTabs<T extends string>({
  options,
  value,
  onChange,
  className = "",
}: PillTabsProps<T>) {
  return (
    <div className={`items-center gap-1 ${className}`} role="radiogroup">
      {options.map((opt) => {
        const selected = opt.value === value;

        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`rounded-full px-3.5 py-1 text-xs font-semibold transition ${
              selected
                ? "bg-rose-600 text-white"
                : "text-slate-500 hover:bg-stone-200 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default PillTabs;
