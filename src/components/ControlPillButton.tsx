interface ControlPillButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
}

function ControlPillButton({
  children,
  className = "",
  ...rest
}: ControlPillButtonProps) {
  return (
    <button
      type="button"
      className={`inline-flex h-8 items-center justify-center rounded-full border border-stone-300 bg-white px-2 text-xs font-semibold text-slate-800 transition hover:border-stone-400 hover:bg-stone-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-slate-600 dark:hover:bg-slate-700 ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default ControlPillButton;
