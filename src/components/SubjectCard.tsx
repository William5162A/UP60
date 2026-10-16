import { Link } from "@tanstack/react-router";
import {
  Atom, BookOpen, Cog, Cpu, FlaskConical, Gauge, Languages, Network, PenTool, Radio, Sigma, Thermometer, Zap, Bot, Eye, Check,
  type LucideIcon,
} from "lucide-react";
import { formatPrice, SEM_NAMES, YEAR_NAMES, type Subject } from "@/lib/curriculum";
import { subjectProgress, useStore } from "@/lib/store";

const RULES: [RegExp, LucideIcon][] = [
  [/رياضيات|نمذجة|إشارة/, Sigma],
  [/لغة|اللغة/, Languages],
  [/كيمياء/, FlaskConical],
  [/فيزياء|بصريات/, Atom],
  [/برمجة|حاسوب|حواسيب|متحكمات صغرية/, Cpu],
  [/شبكات|اتصال/, Network],
  [/الاتصالات/, Radio],
  [/كهربائية|القيادة|إلكترون/, Zap],
  [/حرارية|تدفئة|طاقة/, Thermometer],
  [/قياس|حساسات|تحكم/, Gauge],
  [/رسم|تصميم/, PenTool],
  [/روبوت|ذكاء|PLC|أتمتة/, Bot],
  [/صور/, Eye],
  [/آلات|ميكانيك|إنتاج|مواد|معادن/, Cog],
];
export const iconFor = (name: string) => RULES.find(([r]) => r.test(name))?.[1] ?? BookOpen;

export function SubjectCard({ subject }: { subject: Subject }) {
  const { isPurchased, completed } = useStore();
  const owned = isPurchased(subject.id);
  const prog = owned ? subjectProgress(subject.id, completed) : null;
  const Icon = iconFor(subject.name);
  return (
    <Link
      to="/subjects/$subjectId"
      params={{ subjectId: subject.id }}
      className="group relative flex min-w-0 flex-col overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition hover:-translate-y-0.5 hover:border-ring/50"
    >
      <div className="flex items-start justify-between gap-3">
        <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-foreground transition group-hover:bg-ink group-hover:text-ink-foreground">
          <Icon className="h-5 w-5" />
        </span>
        <span className="num font-display text-4xl leading-none text-border">{String(subject.year).padStart(2, "0")}</span>
      </div>
      <h3 className="mt-4 text-lg font-bold leading-snug text-foreground">{subject.name}</h3>
      <p className="mt-1 text-xs font-semibold text-muted-foreground">
        {YEAR_NAMES[subject.year]} · {SEM_NAMES[subject.semester]}
      </p>
      <p className="mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground">{subject.description}</p>
      <div className="mt-auto pt-5">
        {prog && (
          <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-muted" aria-label={`التقدم ${prog.pct}%`}>
            <div className="h-full rounded-full bg-accent" style={{ width: `${prog.pct}%` }} />
          </div>
        )}
        <div className="flex items-center justify-between gap-2 border-t border-dashed border-border pt-4">
          {owned ? (
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-success">
              <Check className="h-4 w-4" /> مشتراة
            </span>
          ) : (
            <span className="num text-sm font-bold text-foreground">{formatPrice(subject.price)}</span>
          )}
          <span className="rounded-lg bg-ink px-3 py-1.5 text-xs font-bold text-ink-foreground">
            {owned ? "ادرس الآن" : "اشترِ المادة"}
          </span>
        </div>
      </div>
    </Link>
  );
}
