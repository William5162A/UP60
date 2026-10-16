import { createFileRoute, Link } from "@tanstack/react-router";
import { SUBJECTS } from "@/lib/curriculum";
import { useStore } from "@/lib/store";
import { SubjectCard } from "@/components/SubjectCard";

export const Route = createFileRoute("/purchases")({
  head: () => ({
    meta: [
      { title: "مشترياتي — مِداد" },
      { name: "description", content: "المواد التي اشتريتها وتقدمك فيها." },
      { property: "og:title", content: "مشترياتي — مِداد" },
      { property: "og:description", content: "جميع موادك المفتوحة في مكان واحد." },
    ],
  }),
  component: Purchases,
});

function Purchases() {
  const { purchased } = useStore();
  const list = SUBJECTS.filter((s) => purchased.includes(s.id));
  return (
    <div>
      <header className="border-b border-border pb-8">
        <p className="text-xs font-bold text-primary">مكتبتك</p>
        <h1 className="mt-1 font-display text-4xl sm:text-5xl">مشترياتي</h1>
        <p className="num mt-2 text-sm text-muted-foreground">{list.length} مادة مفتوحة</p>
      </header>
      {list.length ? (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => <SubjectCard key={s.id} subject={s} />)}
        </div>
      ) : (
        <div className="mt-8 rounded-2xl border border-dashed border-border p-12 text-center">
          <p className="text-lg font-bold">لم تشترِ أي مادة بعد</p>
          <Link to="/subjects" className="mt-4 inline-flex rounded-xl bg-ink px-5 py-2.5 text-sm font-bold text-ink-foreground">تصفح المواد</Link>
        </div>
      )}
    </div>
  );
}
