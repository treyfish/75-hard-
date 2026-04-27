interface Props {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (next: boolean) => void;
  icon?: React.ReactNode;
}

export default function ChecklistItem({ label, description, checked, onChange, icon }: Props) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={[
        'card w-full text-left flex items-center gap-3 sm:gap-4 px-4 py-3.5 transition',
        checked ? 'bg-success/10 border-success/40' : 'hover:bg-ink-600/70',
      ].join(' ')}
      aria-pressed={checked}
    >
      <span
        className={[
          'flex-none w-7 h-7 rounded-md grid place-items-center border transition',
          checked
            ? 'bg-success/90 border-success text-ink-900'
            : 'bg-ink-800 border-white/15 text-transparent',
        ].join(' ')}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      </span>
      <span className="flex-1 min-w-0">
        <span className="block font-medium text-parchment leading-tight">{label}</span>
        {description && (
          <span className="block text-xs text-parchment/55 mt-0.5">{description}</span>
        )}
      </span>
      {icon && <span className="text-parchment/40">{icon}</span>}
    </button>
  );
}
