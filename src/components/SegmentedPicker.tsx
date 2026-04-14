interface SegmentedPickerProps<T extends string> {
  options: { label: string; value: T }[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
}

function SegmentedPicker<T extends string>({
  options,
  value,
  onChange,
  size = "md",
}: SegmentedPickerProps<T>) {
  const sizeClasses =
    size === "sm"
      ? { container: "h-8", item: "px-3 text-[11px]" }
      : { container: "h-9", item: "px-4 text-xs" };

  return (
    <div
      className={`inline-flex ${sizeClasses.container} rounded-full border border-stone-300 bg-white dark:border-slate-700 dark:bg-slate-800`}
      role="radiogroup"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`h-full ${sizeClasses.item} font-semibold transition-colors first:rounded-l-full last:rounded-r-full ${
              selected
                ? "bg-rose-600 text-white"
                : "text-slate-600 hover:bg-stone-100 dark:text-slate-300 dark:hover:bg-slate-700"
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

export default SegmentedPicker;
