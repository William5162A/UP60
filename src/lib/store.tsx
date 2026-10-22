import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { FEATURED_ID, type Semester, type Year } from "./curriculum";
import { CONTENT } from "./ee-content";

export interface Attempt {
  answers: Record<string, number>;
  submitted: boolean;
}

interface State {
  studentName: string;
  studentEmail: string;
  isLoggedIn: boolean;
  purchased: string[];
  completed: string[];
  year: Year;
  semester: Semester;
  theme: "light" | "dark";
  attempts: Record<string, Attempt>;
}

// Sample student state (illustrative).
const DEFAULT: State = {
  studentName: "وليم عربش",
  studentEmail: "",
  isLoggedIn: false,
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
  resetAttempt: (key: string) => void;
  login: (name: string, email: string) => void;
  logout: () => void;
  totals: {
    lessonsDone: number;
    lessonsTotal: number;
    progress: number;
    examQuestions: number;
  };
}

const StoreCtx = createContext<Ctx | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<State>(DEFAULT);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);

      if (raw) {
        setState({ ...DEFAULT, ...JSON.parse(raw) });
      }
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
      const content = CONTENT[id];

      if (!content) continue;

      lessonsTotal += content.lessons.length;

      lessonsDone += content.lessons.filter((lesson) => state.completed.includes(lesson.id)).length;

      examQuestions += content.exam.length;
    }

    return {
      ...state,
      ready,

      login: (name, email) =>
        update((s) => ({
          ...s,
          isLoggedIn: true,
          studentName: name,
          studentEmail: email,
        })),

      logout: () =>
        update((s) => ({
          ...s,
          isLoggedIn: false,
        })),

      isPurchased: (id) => owned.has(id),

      purchase: (id) =>
        update((s) => (s.purchased.includes(id) ? s : { ...s, purchased: [...s.purchased, id] })),

      toggleLesson: (lessonId) =>
        update((s) => ({
          ...s,
          completed: s.completed.includes(lessonId)
            ? s.completed.filter((id) => id !== lessonId)
            : [...s.completed, lessonId],
        })),

      setYear: (year) => update((s) => ({ ...s, year })),

      setSemester: (semester) => update((s) => ({ ...s, semester })),

      setTheme: (theme) => update((s) => ({ ...s, theme })),

      setAnswer: (key, questionId, index) =>
        update((s) => {
          const attempt = s.attempts[key] ?? {
            answers: {},
            submitted: false,
          };

          if (attempt.submitted) return s;
          return {
            ...s,
            attempts: {
              ...s.attempts,
              [key]: {
                ...attempt,
                answers: {
                  ...attempt.answers,
                  [questionId]: index,
                },
              },
            },
          };
        }),

      submitAttempt: (key) =>
        update((s) => {
          const attempt = s.attempts[key] ?? {
            answers: {},
            submitted: false,
          };

          return {
            ...s,
            attempts: {
              ...s.attempts,
              [key]: {
                ...attempt,
                submitted: true,
              },
            },
          };
        }),

      resetAttempt: (key) =>
        update((s) => {
          const attempts = { ...s.attempts };
          delete attempts[key];

          return { ...s, attempts };
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
  const context = useContext(StoreCtx);

  if (!context) {
    throw new Error("useStore must be used inside StoreProvider");
  }

  return context;
}

export function subjectProgress(subjectId: string, completed: string[]) {
  const lessons = CONTENT[subjectId]?.lessons ?? [];

  if (!lessons.length) return null;

  const done = lessons.filter((lesson) => completed.includes(lesson.id)).length;

  const next = lessons.find((lesson) => !completed.includes(lesson.id));

  return {
    done,
    total: lessons.length,
    pct: Math.round((done / lessons.length) * 100),
    next,
  };
}
