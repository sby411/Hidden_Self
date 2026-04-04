import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { HeartHandshake, Scan, ArrowRight } from "lucide-react";
import Footer from "@/components/Footer";
import { Label } from "@/components/ui/label";

const LAST_CONTACT_OPTIONS = [
  { value: "within_week", label: "일주일 이내" },
  { value: "2_4_weeks", label: "2~4주 전" },
  { value: "1_3_months", label: "1~3개월 전" },
  { value: "over_3_months", label: "3개월 이상" },
] as const;

export type ReunionNavigateState = {
  myId: string;
  theirId: string;
  lastContact: string;
  lastContactLabel: string;
};

const ReunionLandingPage = () => {
  const [myId, setMyId] = useState("");
  const [theirId, setTheirId] = useState("");
  const [lastContact, setLastContact] = useState<string>(LAST_CONTACT_OPTIONS[0].value);
  const navigate = useNavigate();

  const handleSubmit = () => {
    const cleanMine = myId.replace("@", "").trim();
    const cleanTheirs = theirId.replace("@", "").trim();
    if (!cleanMine || !cleanTheirs) return;
    const opt = LAST_CONTACT_OPTIONS.find((o) => o.value === lastContact);
    const state: ReunionNavigateState = {
      myId: cleanMine,
      theirId: cleanTheirs,
      lastContact,
      lastContactLabel: opt?.label ?? lastContact,
    };
    navigate("/reunion/result", { state });
  };

  const canSubmit = myId.replace("@", "").trim() && theirId.replace("@", "").trim();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">재회 시그널</span>
          </div>
          <Link
            to="/attraction"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            연애 패턴 분석
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        <section className="w-full flex flex-col items-center px-5 pt-12 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 pixel-grid opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(280_30%_50%/0.04)]" />

          <div className="w-full max-w-md relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border/60 px-3.5 py-1.5 text-xs font-semibold text-muted-foreground mb-5">
              <Scan className="w-3 h-3 text-primary" />
              UI 프리뷰 · 실제 분석·결제는 다음 단계에서 연동
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground mb-3">
              헤어진 사이,
              <br />
              <span className="text-danger-highlight">지금 연락해도 될까?</span>
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed mb-8">
              두 계정의 관계 온도와 방어 성향, 연락 타이밍 감을 한눈에 정리하는{" "}
              <span className="font-semibold text-foreground">재회 가능성 리포트</span>입니다. (현재는 더미 결과만
              표시됩니다.)
            </p>

            <div className="flex flex-col gap-5 w-full">
              <div className="space-y-2">
                <Label htmlFor="reunion-my-id" className="text-xs font-semibold text-foreground">
                  내 인스타 아이디
                </Label>
                <input
                  id="reunion-my-id"
                  type="text"
                  value={myId}
                  onChange={(e) => setMyId(e.target.value)}
                  placeholder="@username"
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
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
                  placeholder="@username"
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="reunion-last" className="text-xs font-semibold text-foreground">
                  마지막 연락 시점
                </Label>
                <select
                  id="reunion-last"
                  value={lastContact}
                  onChange={(e) => setLastContact(e.target.value)}
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/30 transition-all appearance-none cursor-pointer"
                  style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`, backgroundRepeat: "no-repeat", backgroundPosition: "right 12px center" }}
                >
                  {LAST_CONTACT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              <button
                type="button"
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 rounded-xl gradient-danger text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] glow-danger relative overflow-hidden group mt-1"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  재회 가능성 분석하기
                  <ArrowRight className="w-4 h-4" />
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
