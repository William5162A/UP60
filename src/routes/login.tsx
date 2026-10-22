import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import {
  ArrowLeft,
  BookOpen,
  Eye,
  EyeOff,
  GraduationCap,
  LockKeyhole,
  Mail,
  ShieldCheck,
} from "lucide-react";
import { ThemeToggle } from "@/components/AppShell";
import { useStore } from "@/lib/store";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "تسجيل الدخول — مِداد" },
      {
        name: "description",
        content: "سجّل دخولك إلى منصة مِداد التعليمية.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { login, isLoggedIn, ready } = useStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (ready && isLoggedIn) {
      navigate({ to: "/" });
    }
  }, [ready, isLoggedIn, navigate]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const normalizedEmail = email.trim();

    if (!normalizedEmail || !password.trim()) {
      setError("يرجى إدخال البريد الإلكتروني وكلمة المرور.");
      return;
    }

    // تسجيل دخول تجريبي: لا يوجد تحقق حقيقي من الحساب.
    const name = normalizedEmail.split("@")[0] || "طالب";

    login(name, normalizedEmail);
    navigate({ to: "/" });
  }

  return (
    <main
      dir="rtl"
      className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4 py-8 sm:px-6"
    >
      {/* الخلفية الزخرفية */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-28 -top-28 h-80 w-80 rounded-full bg-accent/10 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-primary/10 blur-3xl"
      />

      {/* زر تغيير المظهر */}
      <div className="absolute left-4 top-4 z-10 sm:left-6 sm:top-6">
        <ThemeToggle />
      </div>

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-border bg-card shadow-lift lg:grid-cols-2">
        {/* الجانب التعريفي */}
        <section className="motif relative hidden overflow-hidden bg-ink-gradient p-10 text-ink-foreground lg:flex lg:flex-col lg:justify-between xl:p-12">
          <div>
            <Link to="/login" className="inline-flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-accent text-accent-foreground">
                <BookOpen className="h-6 w-6" />
              </span>
              <span className="font-display text-3xl">مِداد</span>
            </Link>

            <div className="mt-20">
              <span className="inline-flex items-center gap-2 rounded-full border border-ink-muted/25 px-3 py-1.5 text-xs font-semibold text-ink-muted">
                <GraduationCap className="h-4 w-4" />
                منصتك الجامعية
              </span>

              <h1 className="mt-6 font-display text-4xl leading-[1.6] xl:text-5xl">
                كل ما تحتاجه
                <br />
                لرحلتك الجامعية
                <br />
                في مكان واحد.
              </h1>

              <p className="mt-5 max-w-sm text-sm leading-8 text-ink-muted">
                نظّم موادك، وتابع دروسك، واستعد لامتحاناتك باستخدام محتوى تعليمي مصمم لمساعدتك على
                التقدم بثقة.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 border-t border-ink-muted/20 pt-5 text-sm text-ink-muted">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <span>مساحة تعليمية تجمع موادك ودروسك في مكان واحد.</span>
          </div>

          <span
            aria-hidden="true"
            className="pointer-events-none absolute -bottom-12 -left-4 font-display text-[12rem] leading-none text-ink-foreground/4"
          >
            مِداد
          </span>
        </section>

        {/* نموذج تسجيل الدخول */}
        <section className="flex min-w-0 flex-col justify-center p-6 sm:p-10 lg:p-12">
          <div className="mb-8 lg:hidden">
            <Link to="/login" className="inline-flex items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-ink-gradient font-display text-xl text-ink-foreground">
                م
              </span>
              <span className="font-display text-2xl text-foreground">مِداد</span>
            </Link>
          </div>

          <div className="mb-8">
            <div className="mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15 text-accent">
              <GraduationCap className="h-7 w-7" />
            </div>

            <p className="text-sm font-semibold text-accent">مرحبًا بك في مِداد</p>

            <h2 className="mt-2 font-display text-3xl text-foreground sm:text-4xl">تسجيل الدخول</h2>

            <p className="mt-3 text-sm leading-7 text-muted-foreground">
              أدخل أي بريد إلكتروني وكلمة مرور للانتقال إلى المنصة.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-foreground">
                البريد الإلكتروني
              </label>

              <div className="relative">
                <Mail
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="email"
                  name="email"
                  type="text"
                  autoComplete="username"
                  inputMode="email"
                  dir="ltr"
                  placeholder="أدخل أي اسم أو بريد إلكتروني"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background pr-12 pl-4 text-left text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  required
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                كلمة المرور
              </label>

              <div className="relative">
                <LockKeyhole
                  aria-hidden="true"
                  className="pointer-events-none absolute right-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
                />

                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="أدخل أي كلمة مرور"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="h-12 w-full rounded-xl border border-border bg-background px-12 text-right text-sm text-foreground outline-none transition placeholder:text-muted-foreground/60 focus:border-accent focus:ring-4 focus:ring-accent/10"
                  required
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((value) => !value)}
                  aria-label={showPassword ? "إخفاء كلمة المرور" : "إظهار كلمة المرور"}
                  className="absolute left-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-lg text-muted-foreground transition hover:bg-muted hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
              >
                {error}
              </div>
            )}

            <button
              type="submit"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-ink px-5 text-sm font-bold text-ink-foreground shadow-soft transition hover:brightness-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-accent/30"
            >
              دخول إلى المنصة
              <ArrowLeft className="h-4 w-4" />
            </button>
          </form>

          <div className="my-7 flex items-center gap-3">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground">منصة مِداد التعليمية</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <p className="text-center text-xs leading-6 text-muted-foreground">
            تسجيل تجريبي — لا تحتاج إلى حساب حقيقي.
          </p>
        </section>
      </div>
    </main>
  );
}
