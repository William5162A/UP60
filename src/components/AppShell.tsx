import { Link } from "@tanstack/react-router";
import { BookOpen, Home, Moon, ShoppingBag, Sun, User } from "lucide-react";
import type { ReactNode } from "react";
import { BRAND } from "@/lib/brand";
import { useStore } from "@/lib/store";

const NAV = [
  { to: "/", label: "الرئيسية", icon: Home, exact: true },
  { to: "/subjects", label: "المواد", icon: BookOpen, exact: false },
  { to: "/purchases", label: "مشترياتي", icon: ShoppingBag, exact: false },
  { to: "/profile", label: "ملفي الشخصي", icon: User, exact: false },
] as const;

export function ThemeToggle() {
  const { theme, setTheme } = useStore();
  const dark = theme === "dark";
  return (
    <button
      type="button"
      onClick={() => setTheme(dark ? "light" : "dark")}
      aria-label={dark ? "التبديل إلى الوضع الفاتح" : "التبديل إلى الوضع الداكن"}
      className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-border bg-card text-foreground transition hover:bg-muted"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-30 border-b border-border/70 bg-background/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-ink-gradient font-display text-lg text-ink-foreground">
              م
            </span>
            <span className="truncate font-display text-2xl text-foreground">{BRAND}</span>
          </Link>
          <nav aria-label="التنقل الرئيسي" className="hidden items-center gap-1 rounded-full border border-border bg-card p-1 md:flex">
            {NAV.map((n) => (
              <Link
                key={n.to}
                to={n.to}
                activeOptions={{ exact: n.exact }}
                className="rounded-full px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
              >
                {n.label}
              </Link>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 pb-28 pt-6 sm:px-6 md:pb-16 md:pt-10">{children}</main>

      <nav
        aria-label="التنقل السفلي"
        className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-4 rounded-2xl border border-border bg-card/95 p-1.5 shadow-lift backdrop-blur md:hidden"
      >
        {NAV.map((n) => (
          <Link
            key={n.to}
            to={n.to}
            activeOptions={{ exact: n.exact }}
            className="group flex min-h-14 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold text-muted-foreground data-[status=active]:bg-ink data-[status=active]:text-ink-foreground"
          >
            <n.icon className="h-5 w-5" />
            <span className="truncate">{n.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
