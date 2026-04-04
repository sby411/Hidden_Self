import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Scan, ArrowRight, Flame, HeartHandshake } from "lucide-react";
import Footer from "@/components/Footer";
import { Label } from "@/components/ui/label";
import { clampBreakupToPast } from "@/data/reunionDummyData";

const START_YEAR = 2019;

export type ReunionNavigateState = {
  myId: string;
  theirId: string;
  breakupYear: number;
  breakupMonth: number;
  breakupLabel: string;
};

const ReunionLandingPage = () => {
  const now = useMemo(() => new Date(), []);
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  const years = useMemo(
    () => Array.from({ length: currentYear - START_YEAR + 1 }, (_, i) => START_YEAR + i).reverse(),
    [currentYear],
  );

  const [myId, setMyId] = useState("");
  const [theirId, setTheirId] = useState("");
  const [breakupYear, setBreakupYear] = useState<number>(currentYear);
  const [breakupMonth, setBreakupMonth] = useState<number>(currentMonth);

  const maxMonthForYear = (y: number) => (y < currentYear ? 12 : currentMonth);

  const monthOptions = useMemo(() => {
    const max = maxMonthForYear(breakupYear);
    return Array.from({ length: max }, (_, i) => i + 1);
  }, [breakupYear, currentYear, currentMonth]);

  useEffect(() => {
    const max = maxMonthForYear(breakupYear);
    if (breakupMonth > max) setBreakupMonth(max);
  }, [breakupYear, breakupMonth, currentYear, currentMonth]);

  const navigate = useNavigate();

  const breakupLabel = useMemo(() => `${breakupYear}년 ${breakupMonth}월`, [breakupYear, breakupMonth]);

  const handleSubmit = () => {
    const cleanMine = myId.replace("@", "").trim();
    const cleanTheirs = theirId.replace("@", "").trim();
    if (!cleanMine || !cleanTheirs) return;
    const { year, month } = clampBreakupToPast(breakupYear, breakupMonth, new Date());
    const label = `${year}년 ${month}월`;
    const state: ReunionNavigateState = {
      myId: cleanMine,
      theirId: cleanTheirs,
      breakupYear: year,
      breakupMonth: month,
      breakupLabel: label,
    };
    navigate("/reunion/result", { state });
  };

  const canSubmit = myId.replace("@", "").trim() && theirId.replace("@", "").trim();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <Link
          to="/"
          className="flex flex-col gap-0.5 w-fit rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
              <Scan className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">LOVE DNA</span>
          </div>
          <span className="text-[10px] text-muted-foreground pl-8 font-medium">재회 시그널 리포트</span>
        </Link>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="w-full flex flex-col items-center px-5 pt-12 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 pixel-grid opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(0_70%_50%/0.03)]" />

          <div className="w-full max-w-md text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground mb-5">
              <HeartHandshake className="w-3 h-3 text-primary" />
              두 계정 · 공개 프로필 시그널
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground mb-4">
              헤어진 지금,
              <br />
              <span className="text-danger-highlight">연락해도 될까?</span>
            </h1>

            <div className="space-y-1.5 mb-5">
              <p className="text-sm font-bold text-foreground">
                내 계정과 상대 계정을 <span className="text-danger-highlight">각각 읽고</span>, 그다음 관계를 봅니다.
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed">
                특히 상대의 관계 개방도와 재접촉 여지를 신호로 정리합니다. 사주·타로가 아닌{" "}
                <span className="font-semibold text-foreground">인스타그램 기반 분석</span>입니다.
              </p>
            </div>

            <div className="flex flex-col gap-3 w-full text-left">
              <div className="space-y-2">
                <Label htmlFor="reunion-my-id" className="text-xs font-semibold text-foreground">
                  내 인스타 아이디
                </Label>
                <div className="relative">
                  <input
                    id="reunion-my-id"
                    type="text"
                    value={myId}
                    onChange={(e) => setMyId(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                    placeholder="내 인스타 아이디 입력 (@username)"
                    className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/30 transition-all"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <Scan className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reunion-their-id" className="text-xs font-semibold text-foreground">
                  상대 인스타 아이디
                </Label>
                <input
                  id="reunion-their-id"
                  type="text"
                  value={theirId}
                  onChange={(e) => setTheirId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && canSubmit && handleSubmit()}
                  placeholder="상대 인스타 아이디 (@username)"
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/30 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-semibold text-foreground">이별 시기 (연·월)</Label>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  리포트에서 &quot;헤어진 지 ○개월&quot; 맥락으로 쓰입니다. 오늘 이후 날짜는 선택할 수 없습니다.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <select
                    aria-label="이별 연도"
                    value={breakupYear}
                    onChange={(e) => setBreakupYear(Number(e.target.value))}
                    className="w-full h-12 rounded-xl bg-card border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/30 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center",
                    }}
                  >
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}년
                      </option>
                    ))}
                  </select>
                  <select
                    aria-label="이별 월"
                    value={breakupMonth}
                    onChange={(e) => setBreakupMonth(Number(e.target.value))}
                    className="w-full h-12 rounded-xl bg-card border border-border px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/30 transition-all appearance-none cursor-pointer"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "right 10px center",
                    }}
                  >
                    {monthOptions.map((m) => (
                      <option key={m} value={m}>
                        {m}월
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <p className="text-[11px] text-muted-foreground text-center leading-relaxed pt-1">
                인스타그램 공개 프로필 시그널을 바탕으로 관계 개방성과 재접촉 가능성을 해석합니다.
              </p>

              <p className="text-[11px] text-muted-foreground text-center">
                🔒 비공개 계정은 분석이 어려워요. 잠시 공개로 전환 후 진행해 주세요.
              </p>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 rounded-xl gradient-danger text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] glow-danger relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4" />
                  재회 가능성 리포트 받기
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReunionLandingPage;
