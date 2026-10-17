import { createFileRoute, Link, notFound, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Check, ChevronLeft, Lock, ShieldCheck } from "lucide-react";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { formatPrice, SEM_NAMES, subjectById, YEAR_NAMES } from "@/lib/curriculum";
import { contentFor, sortSessions, type Lesson, type Question } from "@/lib/ee-content";
import { subjectProgress, useStore } from "@/lib/store";
import { iconFor } from "@/components/SubjectCard";
import { ProgressRing } from "@/components/Bits";
import { ModeSwitch, Pills, QuestionSet, type Mode } from "@/components/QuestionSet";

type Tab = "lessons" | "exams" | "practice";
const TABS: { id: Tab; label: string }[] = [
  { id: "lessons", label: "شرح المادة" },
  { id: "exams", label: "أسئلة الدورات" },
  { id: "practice", label: "أسئلة لم ترد في الدورات" },
];

export const Route = createFileRoute("/subjects/$subjectId")({
  validateSearch: (s: Record<string, unknown>): { tab?: Tab | undefined } => {
    const t = s["tab"];
    return { tab: t === "exams" || t === "practice" || t === "lessons" ? t : undefined };
  },
  loader: ({ params }) => {
    const subject = subjectById(params.subjectId);
    if (!subject) throw notFound();
    return { subject };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.subject.name} — مِداد` },
          { name: "description", content: loaderData.subject.description },
          { property: "og:title", content: `${loaderData.subject.name} — مِداد` },
          { property: "og:description", content: loaderData.subject.description },
        ]
      : [{ title: "المادة غير متاحة — مِداد" }, { name: "robots", content: "noindex" }],
  }),
  component: SubjectPage,
});

function SubjectPage() {
  const { subject } = Route.useLoaderData();
  const { tab = "lessons" } = Route.useSearch();
  const navigate = useNavigate({ from: Route.fullPath });
  const s = useStore();
  const owned = s.isPurchased(subject.id);
  const content = contentFor(subject.id);
  const prog = subjectProgress(subject.id, s.completed);
  const [mode, setMode] = useState<Mode>("exam");
  const [buying, setBuying] = useState(false);
  const Icon = iconFor(subject.name);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const setTab = (t: Tab) => navigate({ search: { tab: t }, replace: true, resetScroll: false });
  const onTabKey = (e: KeyboardEvent, i: number) => {
    const dir = e.key === "ArrowLeft" ? 1 : e.key === "ArrowRight" ? -1 : 0; // RTL: left = next
    if (!dir) return;
    const n = (i + dir + TABS.length) % TABS.length;
    setTab(TABS[n]!.id);
    tabRefs.current[n]?.focus();
  };

  return (
    <div>
      <Link to="/subjects" className="inline-flex items-center gap-1.5 text-sm font-semibold text-muted-foreground hover:text-foreground">
        <ArrowRight className="h-4 w-4" /> المواد
      </Link>

      <header className="motif mt-4 grid gap-6 overflow-hidden rounded-3xl bg-ink-gradient p-6 text-ink-foreground sm:p-9 lg:grid-cols-[1fr_auto] lg:items-end">
        <div className="min-w-0">
          <div className="flex items-center gap-3">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent text-accent-foreground"><Icon className="h-6 w-6" /></span>
            <p className="text-sm font-semibold text-ink-muted">{YEAR_NAMES[subject.year]} · {SEM_NAMES[subject.semester]}</p>
          </div>
          <h1 className="mt-5 font-display text-3xl leading-tight sm:text-5xl">{subject.name}</h1>
          <p className="mt-3 max-w-xl leading-relaxed text-ink-muted">{subject.description}</p>
        </div>
        <div className="flex items-center gap-4">
          {owned ? (
            <>
              {prog && <ProgressRing pct={prog.pct} size={68} />}
              <div>
                <p className="inline-flex items-center gap-1.5 text-sm font-bold text-accent"><ShieldCheck className="h-4 w-4" /> مادة مشتراة</p>
                {prog && <p className="num mt-1 text-sm text-ink-muted">{prog.done} من {prog.total} دروس مكتملة</p>}
              </div>
            </>
          ) : (
            <div className="w-full sm:w-auto">
              <p className="num font-display text-3xl">{formatPrice(subject.price)}</p>
              <button onClick={() => setBuying(true)} className="mt-3 w-full rounded-xl bg-accent px-6 py-3 text-sm font-bold text-accent-foreground sm:w-auto">
                اشترِ المادة
              </button>
            </div>
          )}
        </div>
      </header>

      <div role="tablist" aria-label="أقسام المادة" className="mt-8 grid grid-cols-3 border-b border-border">
        {TABS.map((t, i) => (
          <button key={t.id} ref={(el) => { tabRefs.current[i] = el; }} role="tab" id={`tab-${t.id}`}
            aria-selected={tab === t.id} aria-controls="tabpanel" tabIndex={tab === t.id ? 0 : -1}
            onClick={() => setTab(t.id)} onKeyDown={(e) => onTabKey(e, i)}
            className="-mb-px border-b-2 border-transparent px-2 py-3 text-xs font-bold text-muted-foreground transition aria-selected:border-primary aria-selected:text-foreground sm:text-base">
            {t.label}
          </button>
        ))}
      </div>

      <section role="tabpanel" id="tabpanel" aria-labelledby={`tab-${tab}`} className="mt-6">
        {!owned ? (
          <LockedPanel price={subject.price} onBuy={() => setBuying(true)} />
        ) : tab === "lessons" ? (
          <Lessons lessons={content.lessons} />
        ) : tab === "exams" ? (
          <Exams subjectId={subject.id} mode={mode} setMode={setMode} />
        ) : (
          <Practice subjectId={subject.id} questions={content.practice} mode={mode} setMode={setMode} />
        )}
      </section>

      {buying && (
        <div role="dialog" aria-modal="true" aria-labelledby="buy-title" className="fixed inset-0 z-50 grid place-items-center bg-foreground/40 p-4">
          <div className="w-full max-w-sm rounded-2xl bg-popover p-6 text-popover-foreground shadow-lift">
            <h3 id="buy-title" className="text-lg font-bold">شراء «{subject.name}»</h3>
            <p className="num mt-2 text-sm text-muted-foreground">السعر: {formatPrice(subject.price)}</p>
            <p className="mt-3 rounded-lg bg-warning-soft p-3 text-xs leading-relaxed">هذه عملية شراء تجريبية لأغراض العرض فقط. لا يتم تحصيل أي مبلغ ولا تُطلب بيانات مالية.</p>
            <div className="mt-6 grid grid-cols-2 gap-2">
              <button autoFocus onClick={() => setBuying(false)} className="rounded-xl border border-border py-2.5 text-sm font-bold">إلغاء</button>
              <button onClick={() => { s.purchase(subject.id); setBuying(false); }} className="rounded-xl bg-ink py-2.5 text-sm font-bold text-ink-foreground">تأكيد الشراء</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LockedPanel({ price, onBuy }: { price: number; onBuy: () => void }) {
  return (
    <div className="rounded-2xl border border-dashed border-border p-10 text-center">
      <Lock className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-4 text-lg font-bold">هذا المحتوى مقفل</p>
      <p className="mt-1 text-sm text-muted-foreground">اشترِ المادة لفتح الدروس وأسئلة الدورات والأسئلة التدريبية.</p>
      <button onClick={onBuy} className="num mt-5 rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground">اشترِ بـ {formatPrice(price)}</button>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-2xl border border-dashed border-border p-10 text-center text-muted-foreground">{text}</p>;
}

function Lessons({ lessons }: { lessons: Lesson[] }) {
  const { completed, toggleLesson } = useStore();
  const [activeId, setActiveId] = useState(() => lessons.find((l) => !completed.includes(l.id))?.id ?? lessons[0]?.id);
  if (!lessons.length) return <Empty text="سيُضاف محتوى هذه المادة قريبًا." />;
  const idx = Math.max(0, lessons.findIndex((l) => l.id === activeId));
  const l = lessons[idx]!;
  const done = completed.includes(l.id);
  return (
    <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
      <ol className="flex gap-2 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible">
        {lessons.map((x, i) => {
          const d = completed.includes(x.id);
          return (
            <li key={x.id} className="shrink-0 lg:shrink">
              <button onClick={() => setActiveId(x.id)} aria-current={x.id === l.id}
                className="flex w-56 items-center gap-3 rounded-xl border border-transparent p-2.5 text-start text-sm font-semibold text-muted-foreground aria-[current=true]:border-border aria-[current=true]:bg-card aria-[current=true]:text-foreground lg:w-full">
                <span className={`num grid h-7 w-7 shrink-0 place-items-center rounded-full text-xs ${d ? "bg-success text-primary-foreground" : "bg-muted"}`}>
                  {d ? <Check className="h-3.5 w-3.5" /> : i + 1}
                </span>
                <span className="min-w-0 truncate">{x.title}</span>
              </button>
            </li>
          );
        })}
      </ol>

      <article className="min-w-0 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-9">
        <p className="num text-xs font-bold text-primary">الدرس {idx + 1} من {lessons.length}</p>
        <h2 className="mt-2 font-display text-3xl">{l.title}</h2>
        <div className="mt-6 rounded-2xl bg-surface p-5">
          <h3 className="text-sm font-bold">أهداف الدرس</h3>
          <ul className="mt-2 list-disc space-y-1 ps-5 text-sm leading-relaxed text-muted-foreground">
            {l.objectives.map((o) => <li key={o}>{o}</li>)}
          </ul>
        </div>
        <div className="mt-8 max-w-prose space-y-6">
          {l.sections.map((sec) => (
            <section key={sec.heading}>
              <h3 className="text-xl font-bold">{sec.heading}</h3>
              <p className="mt-2 leading-loose text-foreground/85">{sec.body}</p>
            </section>
          ))}
        </div>
        <div className="mt-8">
          <h3 className="text-sm font-bold text-muted-foreground">العلاقات والتعاريف</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {l.equations.map((e, i) => (
              <figure key={i} className="rounded-xl border-s-4 border-accent bg-surface px-4 py-3">
                {e.label && <figcaption className="text-xs font-semibold text-muted-foreground">{e.label}</figcaption>}
                <p className="equation mt-1 text-end text-lg">{e.expr}</p>
                {e.note && <p className="mt-1 text-xs text-muted-foreground">{e.note}</p>}
              </figure>
            ))}
          </div>
        </div>
        {l.example && (
          <div className="mt-8 rounded-2xl border border-border p-5">
            <h3 className="text-sm font-bold text-primary">مثال محلول</h3>
            <p className="mt-2 leading-relaxed">{l.example.problem}</p>
            <div className="mt-3 space-y-1 rounded-xl bg-surface p-4">
              {l.example.solution.map((s, i) => <p key={i} className="equation text-end">{s}</p>)}
            </div>
          </div>
        )}
        <div className="mt-8 rounded-2xl bg-secondary p-5 text-secondary-foreground">
          <h3 className="text-sm font-bold">الخلاصة</h3>
          <p className="mt-1 leading-relaxed">{l.summary}</p>
        </div>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-6">
          <button onClick={() => toggleLesson(l.id)} aria-pressed={done}
            className={`inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-bold ${done ? "border border-success bg-success-soft text-success" : "bg-ink text-ink-foreground"}`}>
            <Check className="h-4 w-4" /> {done ? "مكتمل — إلغاء الإكمال" : "تحديد كمكتمل"}
          </button>
          {idx < lessons.length - 1 && (
            <button onClick={() => setActiveId(lessons[idx + 1]!.id)} className="inline-flex items-center gap-1 text-sm font-bold text-primary">
              الدرس التالي <ChevronLeft className="h-4 w-4" />
            </button>
          )}
        </div>
      </article>
    </div>
  );
}

const categoriesOf = (qs: Question[]) => {
  const map = new Map<string, number>();
  qs.forEach((q) => map.set(q.category, (map.get(q.category) ?? 0) + 1));
  return [...map].map(([id, count]) => ({ id, label: id, count }));
};

function Exams({ subjectId, mode, setMode }: { subjectId: string; mode: Mode; setMode: (m: Mode) => void }) {
  const content = contentFor(subjectId);
  const sessions = useMemo(() => sortSessions(content.sessions), [content.sessions]);
  const [scope, setScope] = useState<string | null>(null); // null = session cards, "all", or session id
  const [category, setCategory] = useState("all");
  if (!content.exam.length) return <Empty text="لا توجد أسئلة دورات متاحة لهذه المادة بعد." />;

  if (scope === null) {
    return (
      <div>
        <p className="mb-4 rounded-xl bg-warning-soft p-3 text-xs leading-relaxed">الدورات والأسئلة المعروضة نماذج تجريبية للتوضيح، وليست أسئلة امتحانية رسمية موثقة.</p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <button onClick={() => { setScope("all"); setCategory("all"); }}
            className="motif flex flex-col justify-between rounded-2xl bg-ink-gradient p-5 text-start text-ink-foreground">
            <span className="font-display text-2xl">كل الدورات</span>
            <span className="num mt-6 text-sm text-ink-muted">{content.exam.length} سؤالًا من {sessions.length} دورات</span>
          </button>
          {sessions.map((se) => (
            <button key={se.id} onClick={() => { setScope(se.id); setCategory("all"); }}
              className="rounded-2xl border border-border bg-card p-5 text-start shadow-soft transition hover:border-ring/50">
              <span className="text-xs font-bold text-primary">{se.termLabel} · تجريبية</span>
              <span className="mt-1 block text-lg font-bold">{se.name}</span>
              <span className="num mt-4 flex justify-between text-sm text-muted-foreground">
                <span>{se.academicYear}</span>
                <span>{content.exam.filter((q) => q.sessionId === se.id).length} أسئلة</span>
              </span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const scoped = scope === "all" ? content.exam : content.exam.filter((q) => q.sessionId === scope);
  const cats = categoriesOf(scoped);
  const shown = category === "all" ? scoped : scoped.filter((q) => q.category === category);
  const se = sessions.find((x) => x.id === scope);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <button onClick={() => setScope(null)} className="inline-flex items-center gap-1 text-sm font-semibold text-muted-foreground hover:text-foreground">
            <ArrowRight className="h-4 w-4" /> كل الجلسات
          </button>
          <h3 className="mt-1 text-xl font-bold">{se ? `${se.name} ${se.academicYear}` : "كل الدورات"}</h3>
        </div>
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>
      <Pills label="تصنيف الأسئلة" value={category} onChange={setCategory}
        items={[{ id: "all", label: se ? "كل أسئلة هذه الدورة" : "كل الأسئلة", count: scoped.length }, ...cats]} />
      <QuestionSet key={`${scope}:${category}`} questions={shown} mode={mode} sessions={sessions} attemptKey={`${subjectId}:exam:${scope}:${category}`} />
    </div>
  );
}

function Practice({ subjectId, questions, mode, setMode }: { subjectId: string; questions: Question[]; mode: Mode; setMode: (m: Mode) => void }) {
  const [category, setCategory] = useState("all");
  if (!questions.length) return <Empty text="لا توجد أسئلة تدريبية لهذه المادة بعد." />;
  const shown = category === "all" ? questions : questions.filter((q) => q.category === category);
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="max-w-md text-sm text-muted-foreground">أسئلة تدريبية إضافية لم ترد في الدورات، للتمرين وتثبيت المفاهيم.</p>
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>
      <Pills label="تصنيف الأسئلة" value={category} onChange={setCategory} items={[{ id: "all", label: "كل الأسئلة", count: questions.length }, ...categoriesOf(questions)]} />
      <QuestionSet key={category} questions={shown} mode={mode} sessions={[]} attemptKey={`${subjectId}:practice:${category}`} />
    </div>
  );
}
