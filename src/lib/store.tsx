import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { FEATURED_ID, type Semester, type Year } from "./curriculum";
import { CONTENT } from "./ee-content";

export interface Attempt {
  answers: Record<string, number>;
  submitted: boolean;
}

interface State {
  studentName: string;
  purchased: string[];
  completed: string[];
  year: Year;
  semester: Semester;
  theme: "light" | "dark";
  attempts: Record<string, Attempt>;
}

// Sample student state (illustrative).
const DEFAULT: State = {
  studentName: "ليان الأحمد",
  purchased: [FEATURED_ID, "y1s1-06", "y1s1-05"],
  completed: ["ee-l01", "ee-l02", "ee-l03"],
  year: 1,
  semester: 2,
  theme: "light",
  attempts: {},
};

const KEY = "midad-state-v1";

interface Ctx extends State {
  ready: boolean;
  isPurchased: (id: string) => boolean;
  purchase: (id: string) => void;
  toggleLesson: (lessonId: string) => void;
  setYear: (y: Year) => void;
  setSemester: (s: Semester) => void;
  setTheme: (t: "light" | "dark") => void;
  setAnswer: (key: string, qid: string, idx: number) => void;
  submitAttempt: (key: string) => void;
  totals: { lessonsDone: number; lessonsTotal: number; progress: number; examQuestions: number };
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setState({ ...DEFAULT, ...JSON.parse(raw) });
    } catch {
      /* ignore corrupt storage */
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(KEY, JSON.stringify(state));
    document.documentElement.classList.toggle("dark", state.theme === "dark");
  }, [state, ready]);

  const update = useCallback((fn: (s: State) => State) => setState(fn), []);

  const value = useMemo<Ctx>(() => {
    const owned = new Set(state.purchased);
    let lessonsDone = 0;
    let lessonsTotal = 0;
    let examQuestions = 0;
    for (const id of state.purchased) {
      const c = CONTENT[id];
      if (!c) continue;
      lessonsTotal += c.lessons.length;
      lessonsDone += c.lessons.filter((l) => state.completed.includes(l.id)).length;
      examQuestions += c.exam.length;
    }
    return {
      ...state,
      ready,
      isPurchased: (id) => owned.has(id),
      purchase: (id) => update((s) => (s.purchased.includes(id) ? s : { ...s, purchased: [...s.purchased, id] })),
      toggleLesson: (lid) =>
        update((s) => ({
          ...s,
          completed: s.completed.includes(lid) ? s.completed.filter((x) => x !== lid) : [...s.completed, lid],
        })),
      setYear: (year) => update((s) => ({ ...s, year })),
      setSemester: (semester) => update((s) => ({ ...s, semester })),
      setTheme: (theme) => update((s) => ({ ...s, theme })),
      setAnswer: (key, qid, idx) =>
        update((s) => {
          const a = s.attempts[key] ?? { answers: {}, submitted: false };
          if (a.submitted) return s;
          return { ...s, attempts: { ...s.attempts, [key]: { ...a, answers: { ...a.answers, [qid]: idx } } } };
        }),
      submitAttempt: (key) =>
        update((s) => {
          const a = s.attempts[key] ?? { answers: {}, submitted: false };
          return { ...s, attempts: { ...s.attempts, [key]: { ...a, submitted: true } } };
        }),
      totals: {
        lessonsDone,
        lessonsTotal,
        progress: lessonsTotal ? Math.round((lessonsDone / lessonsTotal) * 100) : 0,
        examQuestions,
      },
    };
  }, [state, ready, update]);

  return <StoreCtx.Provider value={value}>{children}</StoreCtx.Provider>;
}

export function useStore() {
  const c = useContext(StoreCtx);
  if (!c) throw new Error("useStore must be used inside StoreProvider");
  return c;
}

export function subjectProgress(subjectId: string, completed: string[]) {
  const lessons = CONTENT[subjectId]?.lessons ?? [];
  if (!lessons.length) return null;
  const done = lessons.filter((l) => completed.includes(l.id)).length;
  const next = lessons.find((l) => !completed.includes(l.id));
  return { done, total: lessons.length, pct: Math.round((done / lessons.length) * 100), next };
}
