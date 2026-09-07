export function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[10px] border border-border bg-card p-4 md:p-5 shadow-sm dark:shadow-none">
      <p className="text-xs leading-4 font-semibold uppercase tracking-[0.04em] text-fg-muted">
        {label}
      </p>
      <p className="mt-2 text-[32px] leading-[36px] font-semibold tabular-nums text-fg">
        {value}
      </p>
      {hint ? <p className="mt-1 text-xs text-fg-muted">{hint}</p> : null}
    </div>
  );
}
