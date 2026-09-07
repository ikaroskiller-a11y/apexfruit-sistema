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
    <div className="rounded-xl border border-brand-950/10 bg-white p-5 shadow-sm">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-800/70">
        {label}
      </p>
      <p className="mt-2 text-3xl font-bold text-brand-950">{value}</p>
      {hint ? <p className="mt-1 text-xs text-ink/50">{hint}</p> : null}
    </div>
  );
}
