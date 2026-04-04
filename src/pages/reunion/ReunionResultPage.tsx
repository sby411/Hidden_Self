import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  Lock,
  Unlock,
  Heart,
  ChevronRight,
  BookOpen,
  Crown,
  Sparkles,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getReunionFullReport } from "@/data/reunionDummyData";
import type { ReunionPremiumTeaser } from "@/data/reunionDummyData";
import type { ReunionNavigateState } from "./ReunionLandingPage";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StatScore({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
      <p className="text-[10px] text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-2xl sm:text-3xl font-black text-foreground tabular-nums">{value}</p>
      <p className="text-[9px] text-muted-foreground mt-1.5 leading-snug px-0.5">{sub}</p>
      <div className="mt-2">
        <Progress value={value} className="h-1 rounded-full bg-secondary" />
      </div>
    </div>
  );
}

function SectionLabel({ id, title, kicker }: { id: string; title: string; kicker?: string }) {
  return (
    <div id={id} className="scroll-mt-28 mb-4">
      {kicker && (
        <p className="text-[9px] font-bold uppercase tracking-wider text-ai-highlight/90 mb-1">{kicker}</p>
      )}
      <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
    </div>
  );
}

function PremiumTeaserCard({ card, unlocked }: { card: ReunionPremiumTeaser; unlocked: boolean }) {
  const p = card.contactVsWaitPercent;
  const w = card.waitRangeShort;
  const np = card.newPersonWeightPercent;
  return (
    <div className="rounded-2xl border border-[hsl(45,40%,25%)]/35 bg-card/50 overflow-hidden">
      <div className="p-4 space-y-3">
        <h3 className="text-sm font-bold text-foreground leading-snug pr-6">{card.title}</h3>

        {p != null && (
          <div className="space-y-1.5">
            <div className="flex justify-between text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
              <span>기다림 쪽</span>
              <span>연락 쪽</span>
            </div>
            <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-secondary/80">
              <div
                className="h-full bg-muted-foreground/25 transition-all"
                style={{ width: `${100 - p}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-primary/70 to-[hsl(45,65%,48%)] transition-all"
                style={{ width: `${p}%` }}
              />
            </div>
            <p className="text-[10px] text-center text-muted-foreground">
              연락 쪽 기울기 <span className="font-bold text-foreground tabular-nums">{p}%</span>
            </p>
          </div>
        )}

        {p == null && w != null && (
          <div className="rounded-lg border border-primary/25 bg-primary/5 px-3 py-2.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">권장 관망 구간</p>
            <p className="text-lg font-black text-foreground tabular-nums tracking-tight">{w}</p>
          </div>
        )}

        {p == null && w == null && card.tonePreview && (
          <div>
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1.5">먹히는 톤 예시</p>
            <p className="text-[12px] text-foreground font-mono leading-relaxed bg-secondary/30 rounded-lg px-2.5 py-2.5 border border-border/40">
              {card.tonePreview}
            </p>
          </div>
        )}

        {p == null && w == null && !card.tonePreview && np != null && (
          <div className="rounded-lg border border-border/50 bg-secondary/20 px-3 py-2.5">
            <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-0.5">새 인물 시그널 가중치</p>
            <p className="text-lg font-black text-foreground tabular-nums">{np}%</p>
          </div>
        )}

        {card.visibleSummary ? (
          <p className="text-xs text-foreground leading-snug font-medium">{card.visibleSummary}</p>
        ) : null}

        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/15">
          <div
            className={`p-3 text-[11px] leading-relaxed text-muted-foreground whitespace-pre-line ${
              unlocked ? "" : "blur-[5px] select-none pointer-events-none"
            }`}
            aria-hidden={!unlocked}
          >
            {card.lockedBody}
          </div>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/25 backdrop-blur-[1px] px-3">
              <div className="flex items-center gap-1.5 rounded-full bg-card/95 border border-[hsl(45,40%,28%)]/50 px-3 py-1.5 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)] shrink-0" />
                <span className="text-[9px] font-bold text-[hsl(45,70%,52%)] leading-tight text-center">
                  핵심 해석 · 문장 예시 잠금
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const DEMO_BREAKUP = { year: 2025, month: 9 } as const;

const ReunionResultPage = () => {
  const location = useLocation();
  const state = location.state as ReunionNavigateState | null;

  const myId = state?.myId ?? "demo_me";
  const theirId = state?.theirId ?? "demo_them";
  const breakupYear = state?.breakupYear ?? DEMO_BREAKUP.year;
  const breakupMonth = state?.breakupMonth ?? DEMO_BREAKUP.month;

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const report = getReunionFullReport(myId, theirId, breakupYear, breakupMonth);
  const {
    scores,
    premiumGateCta,
    premiumTeasers,
    meta,
    decisionHint,
    signalSnapshot,
    freeCore,
  } = report;

  const handlePremiumUnlock = () => {
    setPremiumUnlocked(true);
    requestAnimationFrame(() => scrollToId("reunion-premium-cards"));
  };

  useEffect(() => {
    if (premiumUnlocked) {
      setShowStickyBar(false);
      return;
    }
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      setShowStickyBar(y > 600);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [premiumUnlocked]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/60">
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">LOVE DNA</span>
            <span className="text-[9px] text-muted-foreground font-medium truncate">재회 시그널 리포트</span>
          </div>
        </Link>
        <div className="flex items-center gap-1.5 shrink-0 max-w-[45%]">
          <span className="text-[10px] text-ai-highlight font-medium bg-ai-highlight/10 border border-ai-highlight/20 px-2 py-1 rounded-full truncate">
            @{myId}
          </span>
        </div>
      </header>

      <main className={`flex-1 flex flex-col items-center px-5 pt-6 ${premiumUnlocked ? "pb-24" : "pb-32"}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-5">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">
              Instagram Reunion Report
            </p>
            <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
          </div>

          <h1 className="text-xl font-extrabold text-foreground text-center leading-tight mb-1">{report.summaryTitle}</h1>
          <p className="text-[11px] text-muted-foreground text-center mb-5">
            @{myId} · @{theirId} · 이별 {meta.breakupLabel} · 헤어진 지{" "}
            <span className="text-foreground font-semibold">{meta.monthsSinceLabel}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mb-4">
            <StatScore label="재회 가능성" value={scores.reunionPossibility} sub="종합" />
            <StatScore label="상대 개방도" value={scores.theirReunionOpenness} sub="상대" />
            <StatScore label="연락 적합도" value={scores.contactTimingFit} sub="톤·타이밍" />
          </div>

          <Card className="glass-card border-border/50 border-l-4 border-l-primary/40 mb-3">
            <CardContent className="pt-3.5 pb-3.5">
              <p className="text-sm text-foreground leading-snug font-semibold">{report.summaryLine}</p>
            </CardContent>
          </Card>

          <div className="rounded-2xl border border-border/40 bg-card/50 p-3 mb-6">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" />
              목차
            </p>
            <div className="flex flex-wrap gap-2">
              {report.toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToId(item.id)}
                  className="inline-flex items-center gap-0.5 rounded-full border border-border/60 bg-background/80 px-2.5 py-1 text-[10px] font-medium text-foreground hover:border-primary/40 hover:bg-card transition-colors"
                >
                  {item.label}
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </button>
              ))}
            </div>
          </div>

          <Separator className="mb-6 bg-border/60" />

          {/* 지금 판단 — 전면 */}
          <section className="mb-8">
            <SectionLabel
              id="reunion-decision"
              kicker="지금 연락하면 먹히는지"
              title="움직이면 열릴까, 더 닫힐까"
            />
            <Card className="glass-card border-primary/20 bg-gradient-to-br from-card to-secondary/10">
              <CardHeader className="py-4 px-4 space-y-3">
                <p className="text-sm font-bold text-foreground leading-snug">{decisionHint.headline}</p>
                <div className="space-y-1.5">
                  <div className="flex justify-between text-[9px] font-semibold text-muted-foreground uppercase tracking-wide">
                    <span>기다릴 쪽</span>
                    <span>연락 쪽</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full overflow-hidden flex bg-secondary/80">
                    <div
                      className="h-full bg-muted-foreground/20"
                      style={{ width: `${100 - decisionHint.contactLeanPercent}%` }}
                    />
                    <div
                      className="h-full bg-gradient-to-r from-primary/60 to-[hsl(45,60%,45%)]"
                      style={{ width: `${decisionHint.contactLeanPercent}%` }}
                    />
                  </div>
                  <p className="text-[10px] text-center text-muted-foreground">
                    지금 손 내밀면 ‘먹힐’ 쪽 기울기{" "}
                    <span className="font-bold text-foreground tabular-nums">{decisionHint.contactLeanPercent}%</span>
                  </p>
                </div>
                <p className="text-[11px] text-muted-foreground leading-snug border-t border-border/40 pt-3">{decisionHint.hintLine}</p>
              </CardHeader>
            </Card>
          </section>

          <Separator className="mb-6 bg-border/60" />

          {/* 점수·변수 */}
          <section className="mb-8">
            <SectionLabel id="reunion-scores" title="왜 아직도 애매하게 남아 있는가" />
            <div className="space-y-2.5">
              <Card className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-wide">숫자가 말을 아끼는 이유</CardTitle>
                  <p className="text-sm text-foreground leading-snug">{freeCore.whyAmbiguous}</p>
                </CardHeader>
              </Card>
              <Card className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[10px] font-bold text-primary uppercase tracking-wide">지금 승부 가르는 한 줄</CardTitle>
                  <p className="text-sm text-foreground leading-snug">{freeCore.keyVariable}</p>
                </CardHeader>
              </Card>
            </div>
          </section>

          <Separator className="mb-6 bg-border/60" />

          {/* 신호 스냅샷 */}
          <section className="mb-8">
            <SectionLabel id="reunion-snapshot" title="인스타에 남은 관계 흔적" />
            <div className="space-y-2">
              <Card className="glass-card border-border/50 bg-secondary/10">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[10px] text-muted-foreground uppercase tracking-wide">둘 사이에 걸린 축</CardTitle>
                  <p className="text-sm text-foreground leading-snug">{signalSnapshot.conflictLine}</p>
                </CardHeader>
              </Card>
              <Card className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[10px] text-muted-foreground uppercase tracking-wide">네 쪽이 드러내는 것</CardTitle>
                  <p className="text-sm text-foreground leading-snug">{signalSnapshot.youLine}</p>
                </CardHeader>
              </Card>
              <Card className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[10px] text-muted-foreground uppercase tracking-wide">상대가 지금 지키는 선</CardTitle>
                  <p className="text-sm text-foreground leading-snug">{signalSnapshot.themLine}</p>
                </CardHeader>
              </Card>
            </div>
            <Card className="glass-card border-[hsl(45,35%,28%)]/35 bg-gradient-to-br from-[hsl(45,10%,8%)] to-card mt-3">
              <CardHeader className="py-3 px-4">
                <CardTitle className="text-[10px] font-bold text-foreground flex items-center gap-2">
                  <Heart className="w-3.5 h-3.5 text-[hsl(45,70%,55%)]" />
                  무료 판독, 여기까지
                </CardTitle>
                <p className="text-sm text-foreground/95 leading-snug mt-1.5">{report.finalRecommendation}</p>
              </CardHeader>
            </Card>
          </section>

          {/* 심층 */}
          <div id="reunion-premium" className="scroll-mt-28 space-y-4 pt-2">
            <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,20%,8%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,25%)]/40 text-center">
              {premiumUnlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground mb-1 leading-snug">심층 전체 열람 (테스트)</p>
                  <p className="text-[11px] text-muted-foreground leading-snug px-1">아래 카드 본문·예시가 모두 선명하게 보입니다.</p>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-2" />
                  <p className="text-sm font-bold text-foreground mb-1 leading-snug">{premiumGateCta.title}</p>
                  <p className="text-[11px] text-muted-foreground mb-4 leading-snug px-1">{premiumGateCta.body}</p>
                  <button
                    id="reunion-unlock-premium-btn"
                    type="button"
                    onClick={handlePremiumUnlock}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] relative overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-2">
                      <Crown className="w-4 h-4" />
                      {premiumGateCta.ctaPrimary}
                    </span>
                  </button>
                  <p className="text-[10px] text-muted-foreground mt-2.5 leading-snug px-1">{premiumGateCta.ctaAuxiliary}</p>
                  <p className="text-[10px] text-muted-foreground mt-2.5 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    <span className="line-through tabular-nums">{premiumGateCta.stickyListPrice}</span>
                    <span className="font-bold text-[hsl(45,72%,58%)] tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                    <span className="text-[9px]">{premiumGateCta.stickySaleNote}</span>
                  </p>
                  <p className="text-[9px] text-muted-foreground mt-4 leading-snug border-t border-border/30 pt-3">{premiumGateCta.footnote}</p>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {premiumUnlocked ? <Unlock className="w-4 h-4 text-[hsl(45,70%,55%)]" /> : <Lock className="w-4 h-4 text-[hsl(45,70%,55%)]" />}
              <p className="text-sm font-bold text-foreground">{premiumUnlocked ? "심층 리포트" : "심층 리포트 · 일부 공개"}</p>
            </div>
            <p className="text-[10px] text-muted-foreground leading-snug -mt-1">
              {premiumUnlocked
                ? "전체 문단이 열렸습니다."
                : "카드마다 공개 1요소만 선명. 나머지 본문은 블러."}
            </p>

            <div id="reunion-premium-cards" className="space-y-3 scroll-mt-28 pb-4">
              {premiumTeasers.slice(0, 4).map((card) => (
                <PremiumTeaserCard key={card.key} card={card} unlocked={premiumUnlocked} />
              ))}
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {showStickyBar && !premiumUnlocked && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto px-4 pb-4">
            <div className="rounded-2xl bg-gradient-to-r from-[hsl(0,0%,8%)] to-[hsl(35,15%,8%)] border border-[hsl(45,40%,25%)]/40 shadow-[0_-4px_30px_rgba(0,0,0,0.5),0_0_20px_hsl(45,70%,55%,0.1)] backdrop-blur-xl p-3.5">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-foreground leading-tight line-clamp-2">{premiumGateCta.stickyHeadline}</p>
                  <p className="text-[10px] text-muted-foreground truncate mt-0.5">{premiumGateCta.stickySubline}</p>
                  <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0 mt-1">
                    <span className="text-[10px] text-muted-foreground line-through tabular-nums">{premiumGateCta.stickyListPrice}</span>
                    <span className="text-[11px] font-bold text-[hsl(45,72%,58%)] tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                    <span className="text-[9px] text-muted-foreground">{premiumGateCta.stickySaleNote}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handlePremiumUnlock}
                  className="shrink-0 h-10 px-3 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-[10px] flex flex-col items-center justify-center gap-0.5 leading-tight active:scale-[0.96] transition-all shadow-md min-w-[4.75rem]"
                >
                  <Crown className="w-3 h-3 shrink-0" />
                  <span className="tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReunionResultPage;
