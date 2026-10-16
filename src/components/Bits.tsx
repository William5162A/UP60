import type { ReactNode } from "react";

export function SectionTitle({ kicker, title, action }: { kicker?: string; title: string; action?: ReactNode }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="min-w-0">
        {kicker && <p className="text-xs font-bold text-primary">{kicker}</p>}
        <h2 className="mt-1 font-display text-2xl sm:text-3xl">{title}</h2>
      </div>
      {action}
    </div>
  );
}

export function ProgressRing({ pct, size = 56 }: { pct: number; size?: number }) {
  const r = (size - 8) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={`التقدم ${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="6" className="fill-none stroke-muted" />
        <circle cx={size / 2} cy={size / 2} r={r} strokeWidth="6" strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} className="fill-none stroke-accent transition-all" />
      </svg>
      <span className="num absolute inset-0 grid place-items-center text-xs font-bold">{pct}%</span>
    </div>
  );
}
