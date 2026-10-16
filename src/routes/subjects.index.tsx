import { createFileRoute } from "@tanstack/react-router";
import { Search, X } from "lucide-react";
import { useMemo, useState } from "react";
import { SEM_NAMES, SUBJECTS, type Semester } from "@/lib/curriculum";
import { SubjectCard } from "@/components/SubjectCard";

export const Route = createFileRoute("/subjects/")({
  head: () => ({
    meta: [
      { title: "تصفح المواد — مِداد" },
      { name: "description", content: "تصفح جميع المواد الجامعية حسب السنة والفصل وابحث عنها بسهولة." },
      { property: "og:title", content: "تصفح المواد — مِداد" },
      { property: "og:description", content: "جميع مواد الخطة الدراسية مرتبة حسب السنة والفصل." },
    ],
  }),
  component: Browse,
});

// Normalize Arabic for forgiving search (alef forms, taa marbuta, diacritics).
const norm = (t: string) =>
  t.replace(/[\u064B-\u0652]/g, "").replace(/[أإآ]/g, "ا").replace(/ة/g, "ه").replace(/ى/g, "ي").toLowerCase().trim();

function Browse() {
  const [q, setQ] = useState("");
  const [sem, setSem] = useState<Semester | null>(null);
  const list = useMemo(() => {
    const nq = norm(q);
    return SUBJECTS.filter((s) => (!sem || s.semester === sem) && (!nq || norm(s.name + " " + s.description).includes(nq))).sort(
      (a, b) => a.order - b.order,
    );
  }, [q, sem]);

  return (
    <div>
      <header className="grid gap-6 border-b border-border pb-8 lg:grid-cols-[1fr_auto] lg:items-end">
        <div>
          <p className="text-xs font-bold text-primary">الخطة الدراسية الكاملة</p>
          <h1 className="mt-1 font-display text-4xl sm:text-5xl">تصفح المواد</h1>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block sm:w-80">
            <span className="sr-only">ابحث عن مادة</span>
            <Search className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="ابحث عن مادة…"
              className="h-12 w-full rounded-xl border border-input bg-card pe-10 ps-10 text-sm outline-none focus:border-ring"
            />
            {q && (
              <button aria-label="مسح البحث" onClick={() => setQ("")} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <X className="h-4 w-4" />
              </button>
            )}
          </label>
          <div role="group" aria-label="تصفية حسب الفصل" className="grid grid-cols-2 gap-1 rounded-xl border border-border bg-card p-1">
            {([1, 2] as Semester[]).map((v) => (
              <button
                key={v}
                aria-pressed={sem === v}
                onClick={() => setSem(sem === v ? null : v)}
                className="h-10 rounded-lg px-4 text-sm font-bold text-muted-foreground transition aria-pressed:bg-ink aria-pressed:text-ink-foreground"
              >
                {SEM_NAMES[v]}
              </button>
            ))}
          </div>
        </div>
      </header>
      <p className="num mt-5 text-sm font-semibold text-muted-foreground" aria-live="polite">
        {list.length} مادة {sem ? `· ${SEM_NAMES[sem]}` : ""} · مرتبة حسب الخطة الدراسية
      </p>
      {list.length ? (
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SubjectCard key={s.id} subject={s} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-bold">لا توجد نتائج مطابقة</p>
          <p className="mt-1 text-sm text-muted-foreground">جرّب كلمة أخرى أو ألغِ تصفية الفصل.</p>
        </div>
      )}
    </div>
  );
}
