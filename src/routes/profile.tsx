import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { LogOut } from "lucide-react";
import { SEM_NAMES, YEAR_NAMES, type Semester, type Year } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { ProgressRing } from "@/components/Bits";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "ملفي الشخصي — مِداد" },
      { name: "description", content: "معلوماتك وسنتك الدراسية وتقدمك العام." },
      { property: "og:title", content: "ملفي الشخصي — مِداد" },
      { property: "og:description", content: "إعدادات السنة والفصل والمظهر." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const s = useStore();
  const navigate = useNavigate();

  function handleLogout() {
    s.logout();
    navigate({ to: "/login" });
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8">
      {/* القسم الرئيسي للبروفايل */}
      <section className="rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8 text-center">
        <div className="mx-auto grid h-20 w-20 place-items-center rounded-full bg-accent/15 text-accent font-display text-3xl">
          {s.studentName[0]}
        </div>
        <h1 className="mt-5 font-display text-3xl">{s.studentName}</h1>
        <p className="mt-1 text-sm text-ink-muted">طالبة هندسة ميكاترونيك · بيانات تجريبية</p>

        <div className="mt-8 grid grid-cols-3 gap-3 border-t border-ink-muted/20 pt-6 text-center">
          <div>
            <div className="num font-display text-3xl">{s.purchased.length}</div>
            <div className="text-xs text-ink-muted">مادة مشتراة</div>
          </div>
          <div>
            <div className="num font-display text-3xl">{s.totals.lessonsDone}</div>
            <div className="text-xs text-ink-muted">درس مكتمل</div>
          </div>
          <div className="grid place-items-center">
            <ProgressRing pct={s.totals.progress} size={52} />
            <div className="mt-1 text-xs text-ink-muted">التقدم</div>
          </div>
        </div>
      </section>

      {/* قسم الإعدادات (السنة، الفصل، المظهر، وتسجيل الخروج) */}
      <section className="space-y-6 rounded-3xl border border-border bg-card p-6 shadow-soft sm:p-8">
        <div>
          <h2 className="text-lg font-bold">السنة الدراسية</h2>
          <p className="text-sm text-muted-foreground">
            تُبنى المواد المقترحة على سنتك وفصلك الحاليين.
          </p>
          <div
            role="radiogroup"
            aria-label="السنة الدراسية"
            className="mt-4 grid grid-cols-5 gap-2"
          >
            {([1, 2, 3, 4, 5] as Year[]).map((y) => (
              <button
                key={y}
                role="radio"
                aria-checked={s.year === y}
                onClick={() => s.setYear(y)}
                className="h-12 rounded-xl border border-border text-sm font-bold aria-checked:border-ink aria-checked:bg-ink aria-checked:text-ink-foreground transition-colors"
              >
                <span className="sr-only">{YEAR_NAMES[y]}</span>
                <span aria-hidden className="num">
                  {y}
                </span>
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm font-semibold">{YEAR_NAMES[s.year]}</p>
        </div>

        <div>
          <h2 className="text-lg font-bold">الفصل الدراسي</h2>
          <div role="radiogroup" aria-label="الفصل الدراسي" className="mt-4 grid grid-cols-2 gap-2">
            {([1, 2] as Semester[]).map((v) => (
              <button
                key={v}
                role="radio"
                aria-checked={s.semester === v}
                onClick={() => s.setSemester(v)}
                className="h-12 rounded-xl border border-border text-sm font-bold aria-checked:border-ink aria-checked:bg-ink aria-checked:text-ink-foreground transition-colors"
              >
                {SEM_NAMES[v]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-bold">المظهر</h2>
          <div role="radiogroup" aria-label="المظهر" className="mt-4 grid grid-cols-2 gap-2">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                role="radio"
                aria-checked={s.theme === t}
                onClick={() => s.setTheme(t)}
                className="h-12 rounded-xl border border-border text-sm font-bold aria-checked:border-ink aria-checked:bg-ink aria-checked:text-ink-foreground transition-colors"
              >
                {t === "light" ? "فاتح" : "داكن"}
              </button>
            ))}
          </div>
        </div>

        <div className="border-t border-border pt-6">
          <button
            type="button"
            onClick={handleLogout}
            className="flex min-h-12 w-full items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 font-bold text-destructive transition-colors hover:bg-destructive/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-destructive"
          >
            <LogOut size={18} />
            <span>تسجيل الخروج</span>
          </button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            يمكنك تسجيل الدخول مجددًا باستخدام بيانات تجريبية.
          </p>
        </div>
      </section>
    </div>
  );
}
