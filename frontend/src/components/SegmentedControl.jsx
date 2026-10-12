"use client";

export default function SegmentedControl({ options = [], selected, onChange }) {
  return (
    <div className="h-12 bg-surface-muted rounded-full p-1 flex items-center gap-1 w-full select-none">
      {options.map((opt) => {
        const isSelected = opt.value === selected;
        const Icon = opt.icon;
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value)}
            className={`flex-1 h-full rounded-full font-small-medium text-small flex items-center justify-center gap-2 transition-all active:scale-[0.98] ${
              isSelected
                ? "bg-accent-600 text-surface shadow-sm font-semibold"
                : "text-ink-600 hover:text-ink-900 hover:bg-surface/50"
            }`}
          >
            {Icon && <Icon size={18} />}
            <span>{opt.label}</span>
          </button>
        );
      })}
    </div>
  );
}
