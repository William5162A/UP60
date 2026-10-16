import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, BookCheck, ClipboardList, Layers, TrendingUp } from "lucide-react";
import { FEATURED_ID, recommend, SEM_NAMES, subjectById, YEAR_NAMES } from "@/lib/curriculum";
import { subjectProgress, useStore } from "@/lib/store";
import { SubjectCard } from "@/components/SubjectCard";
import { ProgressRing, SectionTitle } from "@/components/Bits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "الرئيسية — مِداد" },
      { name: "description", content: "تابع دراستك وتقدمك في موادك الجامعية مع مِداد." },
      { property: "og:title", content: "مِداد — رحلتك نحو التفوق" },
      { property: "og:description", content: "منصة عربية لتنظيم المواد الجامعية والدروس وأسئلة الدورات." },
    ],
  }),
  component: Home,
});

function Home() {
  const s = useStore();
  const owned = new Set(s.purchased);
  const continuing = s.purchased
    .map((id) => ({ sub: subjectById(id)!, p: subjectProgress(id, s.completed) }))
    .filter((x) => x.sub && x.p);
  const recs = recommend(s.year, s.semester, owned);
  const firstName = s.studentName.split(" ")[0];
  const stats = [
    { label: "المواد المشتراة", value: s.purchased.length, icon: Layers, to: "/purchases" as const },
    { label: "دروس مكتملة", value: `${s.totals.lessonsDone}/${s.totals.lessonsTotal}`, icon: BookCheck, to: "/subjects/$subjectId" as const, sub: "lessons" },
    { label: "نسبة التقدم", value: `${s.totals.progress}%`, icon: TrendingUp, to: "/profile" as const },
    { label: "أسئلة دورات", value: s.totals.examQuestions, icon: ClipboardList, to: "/subjects/$subjectId" as const, sub: "exams" },
  ];

  return (
    <div className="space-y-12">
      <section className="relative grid gap-4 lg:grid-cols-[1.35fr_1fr]">
        <div className="motif relative overflow-hidden rounded-3xl bg-ink-gradient p-7 text-ink-foreground sm:p-10">
          <p className="text-sm font-semibold text-ink-muted">
            {YEAR_NAMES[s.year]} · {SEM_NAMES[s.semester]}
          </p>
          <h1 className="mt-3 font-display text-4xl leading-tight sm:text-5xl">أهلًا بعودتك، {firstName}</h1>
          <p className="mt-3 max-w-md text-base leading-relaxed text-ink-muted">رحلتك نحو التفوق تبدأ بخطوة صغيرة اليوم.</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              to={continuing[0] ? "/subjects/$subjectId" : "/subjects"}
              params={{ subjectId: continuing[0]?.sub.id ?? FEATURED_ID }}
              className="inline-flex items-center gap-2 rounded-xl bg-accent px-5 py-3 text-sm font-bold text-accent-foreground transition hover:brightness-105"
            >
              {continuing[0] ? "تابع الدراسة" : "تصفح المواد"} <ArrowLeft className="h-4 w-4" />
            </Link>
            <Link to="/purchases" className="inline-flex items-center rounded-xl border border-ink-muted/30 px-5 py-3 text-sm font-bold">
              موادي
            </Link>
          </div>
          <span aria-hidden className="pointer-events-none absolute -bottom-10 -left-4 font-display text-[11rem] leading-none text-ink-foreground/5">
            مِداد
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {stats.map((st, i) => (
            <Link
              key={st.label}
              to={st.to}
              params={{ subjectId: FEATURED_ID }}
              search={st.sub ? { tab: st.sub } : undefined}
              className={`group flex min-w-0 flex-col justify-between rounded-2xl border border-border p-4 shadow-soft transition hover:-translate-y-0.5 sm:p-5 ${i === 0 ? "bg-accent text-accent-foreground" : "bg-card"}`}
            >
              <st.icon className="h-5 w-5 opacity-70" />
              <div className="mt-6">
                <div className="num font-display text-3xl sm:text-4xl">{st.value}</div>
                <div className={`mt-1 text-xs font-semibold sm:text-sm ${i === 0 ? "" : "text-muted-foreground"}`}>{st.label}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {continuing.length > 0 && (
        <section>
          <SectionTitle kicker="من حيث توقفت" title="تابع الدراسة" />
          <div className="mt-5 grid gap-3">
            {continuing.map(({ sub, p }) => (
              <Link
                key={sub.id}
                to="/subjects/$subjectId"
                params={{ subjectId: sub.id }}
                className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-4 rounded-2xl border border-border bg-card p-4 shadow-soft sm:grid-cols-[auto_minmax(0,1fr)_auto] sm:p-5"
              >
                <ProgressRing pct={p!.pct} />
                <div className="min-w-0">
                  <h3 className="truncate text-lg font-bold">{sub.name}</h3>
                  <p className="mt-0.5 truncate text-sm text-muted-foreground">
                    {p!.next ? `الدرس التالي: ${p!.next.title}` : "أكملت جميع الدروس"} · {p!.done} من {p!.total}
                  </p>
                </div>
                <span className="col-span-2 inline-flex items-center justify-center gap-2 rounded-xl bg-ink px-4 py-2.5 text-sm font-bold text-ink-foreground sm:col-span-1">
                  متابعة <ArrowLeft className="h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section>
        <SectionTitle
          kicker={`مقترحة حسب ${YEAR_NAMES[s.year]} · ${SEM_NAMES[s.semester]}`}
          title="مواد قد تحتاجها"
          action={<Link to="/profile" className="text-sm font-bold text-primary">تغيير الفصل</Link>}
        />
        {recs.length ? (
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {recs.map((r) => <SubjectCard key={r.id} subject={r} />)}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl border border-dashed border-border p-8 text-center text-muted-foreground">
            اشتريت جميع مواد فصلك والفصول السابقة. أحسنت!
          </p>
        )}
      </section>
    </div>
  );
}

