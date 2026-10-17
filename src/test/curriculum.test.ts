import { describe, expect, it } from "vitest";
import { recommend, SUBJECTS } from "@/lib/curriculum";

describe("curriculum", () => {
  it("has unique ids", () => {
    expect(new Set(SUBJECTS.map((s) => s.id)).size).toBe(SUBJECTS.length);
  });
  it("keeps البرمجة 2 as two entries in different semesters", () => {
    const p = SUBJECTS.filter((s) => s.name === "البرمجة 2");
    expect(p.map((s) => `${s.year}-${s.semester}`)).toEqual(["1-2", "2-1"]);
  });
  it("places أسس الهندسة الكهربائية once in Y1 S2", () => {
    const e = SUBJECTS.filter((s) => s.name === "أسس الهندسة الكهربائية");
    expect(e).toHaveLength(1);
    expect([e[0]!.year, e[0]!.semester]).toEqual([1, 2]);
  });
  it("recommends current then earlier semesters, never future, excluding purchased", () => {
    const r = recommend(3, 1, new Set(["y3s1-01"]));
    const order = [...new Set(r.map((s) => `${s.year}-${s.semester}`))];
    expect(order).toEqual(["3-1", "2-2", "2-1", "1-2", "1-1"]);
    expect(r.some((s) => s.id === "y3s1-01")).toBe(false);
  });
});
