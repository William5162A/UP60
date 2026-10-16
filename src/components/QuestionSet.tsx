import { Check, CircleHelp, Lock, X } from "lucide-react";
import { useState } from "react";
import type { ExamSession, Question } from "@/lib/ee-content";
import { useStore } from "@/lib/store";

export type Mode = "exam" | "review";

export function ModeSwitch({ mode, onChange }: { mode: Mode; onChange: (m: Mode) => void }) {
  return (
    <div role="radiogroup" aria-label="وضع العرض" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-surface p-1">
      {([["exam", "وضع الاختبار"], ["review", "عرض الإجابات والحلول"]] as const).map(([m, label]) => (
        <button key={m} role="radio" aria-checked={mode === m} onClick={() => onChange(m)}
          className="min-h-10 rounded-lg px-3 text-xs font-bold text-muted-foreground aria-checked:bg-ink aria-checked:text-ink-foreground sm:text-sm">
          {label}
        </button>
      ))}
    </div>
  );
}

export function Pills<T extends string>({ items, value, onChange, label }: { items: { id: T; label: string; count?: number }[]; value: T; onChange: (v: T) => void; label: string }) {
  return (
    <div role="radiogroup" aria-label={label} className="flex flex-wrap gap-2">
      {items.map((it) => (
        <button key={it.id} role="radio" aria-checked={value === it.id} onClick={() => onChange(it.id)}
          className="rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-semibold text-muted-foreground aria-checked:border-primary aria-checked:bg-secondary aria-checked:text-secondary-foreground">
          {it.label}{it.count !== undefined && <span className="num ms-1.5 opacity-60">{it.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Renders a list of questions under exam or review rules. attemptKey identifies a single exam attempt. */
export function QuestionSet({ questions, mode, attemptKey, sessions }: { questions: Question[]; mode: Mode; attemptKey: string; sessions: ExamSession[] }) {
  const { attempts, setAnswer, submitAttempt } = useStore();
  const attempt = attempts[attemptKey] ?? { answers: {}, submitted: false };
  const [confirming, setConfirming] = useState(false);
  const examLocked = mode === "exam" && attempt.submitted;
  const reveal = mode === "review" || examLocked;

  const graded = questions.filter((q) => q.correct !== null);
  const score = graded.filter((q) => attempt.answers[q.id] === q.correct).length;
  const answeredCount = questions.filter((q) => attempt.answers[q.id] !== undefined).length;

  if (!questions.length) return <p className="rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">لا توجد أسئلة في هذا التصنيف.</p>;

  return (
    <div className="space-y-4">
      {examLocked && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-ink-gradient p-5 text-ink-foreground">
          <div>
            <p className="text-sm text-ink-muted">نتيجتك في هذه المحاولة</p>
            <p className="num font-display text-3xl">{score} / {graded.length}</p>
          </div>
          <span className="inline-flex items-center gap-1.5 text-sm text-ink-muted"><Lock className="h-4 w-4" /> المحاولة مقفلة ولا يمكن إعادتها</span>
        </div>
      )}
      {questions.map((q, i) => {
        const picked = mode === "exam" ? attempt.answers[q.id] : undefined;
        const session = sessions.find((s) => s.id === q.sessionId);
        return (
          <article key={q.id} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted-foreground">
              <span className="num rounded-md bg-muted px-2 py-0.5">س{i + 1}</span>
              <span>{q.category}</span>
              {session ? <span>· {session.name} {session.academicYear} (تجريبية)</span> : <span>· سؤال تدريبي</span>}
            </div>
            <h4 className="mt-3 text-base font-bold leading-relaxed">{q.text}</h4>
            <div className="mt-4 grid gap-2 sm:grid-cols-2">
              {q.options.map((opt, idx) => {
                const isCorrect = reveal && q.correct === idx;
                const isWrongPick = reveal && q.correct !== null && picked === idx && idx !== q.correct;
                const isPicked = picked === idx;
                const tone = isCorrect
                  ? "border-success bg-success-soft"
                  : isWrongPick
                    ? "border-destructive bg-destructive-soft"
                    : isPicked
                      ? "border-primary bg-secondary"
                      : "border-border hover:bg-muted";
                return (
                  <button key={idx} type="button" disabled={mode === "review" || examLocked}
                    aria-pressed={isPicked}
                    onClick={() => setAnswer(attemptKey, q.id, idx)}
                    className={`flex min-h-12 items-center justify-between gap-3 rounded-xl border px-4 py-2.5 text-start text-sm font-semibold transition disabled:cursor-default ${tone}`}>
                    <span>{opt}</span>
                    {isCorrect && <span className="inline-flex shrink-0 items-center gap-1 text-xs text-success"><Check className="h-4 w-4" />الصحيحة</span>}
                    {isWrongPick && <span className="inline-flex shrink-0 items-center gap-1 text-xs text-destructive"><X className="h-4 w-4" />إجابتك</span>}
                    {!reveal && isPicked && <span className="shrink-0 text-xs text-primary">اخترتها</span>}
                  </button>
                );
              })}
            </div>
            {reveal && (
              <div className="mt-4 rounded-xl bg-surface p-4 text-sm leading-relaxed">
                {q.correct === null ? (
                  <p className="inline-flex items-center gap-2 text-warning"><CircleHelp className="h-4 w-4" />الإجابة الصحيحة غير متوفرة لهذا السؤال.</p>
                ) : q.explanation ? (
                  <p><span className="font-bold">الشرح: </span>{q.explanation}</p>
                ) : (
                  <p className="text-muted-foreground">لا يتوفر شرح لهذا السؤال.</p>
                )}
              </div>
            )}
          </article>
        );
      })}

      {mode === "exam" && !examLocked && (
        <div className="sticky bottom-24 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border bg-card/95 p-4 shadow-lift backdrop-blur md:bottom-4">
          <p className="num text-sm font-semibold text-muted-foreground">أجبت عن {answeredCount} من {questions.length}</p>
          <button onClick={() => setConfirming(true)} disabled={answeredCount === 0}
            className="rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground disabled:opacity-40">
            تسليم الإجابات
          </button>
        </div>
      )}

      {confirming && (
        <div role="dialog" aria-modal="true" aria-labelledby="confirm-title" className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4"
          onKeyDown={(e) => e.key === "Escape" && setConfirming(false)}>
          <div className="w-full max-w-sm rounded-2xl bg-popover p-6 text-popover-foreground shadow-lift">
            <h3 id="confirm-title" className="text-lg font-bold">تأكيد التسليم</h3>
            <p className="num mt-2 text-sm leading-relaxed text-muted-foreground">
              أجبت عن {answeredCount} من {questions.length} سؤالًا. بعد التسليم تُقفل المحاولة ولا يمكن تعديلها أو إعادتها.
            </p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button autoFocus onClick={() => setConfirming(false)} className="rounded-xl border border-border py-2.5 text-sm font-bold">تراجع</button>
              <button onClick={() => { submitAttempt(attemptKey); setConfirming(false); }} className="rounded-xl bg-ink py-2.5 text-sm font-bold text-ink-foreground">تسليم نهائي</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
