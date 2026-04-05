import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Lock,
  Unlock,
  Heart,
  ChevronRight,
  BookOpen,
  Crown,
  Sparkles,
  Scale,
  Radar,
  Image,
} from "lucide-react";
import Footer from "@/components/Footer";
import {
  clampBreakupToPast,
  getMonthsSinceBreakup,
  getReunionFullReport,
  parseReunionDemoParam,
} from "@/data/reunionDummyData";
import type { ReunionPremiumTeaser, ReunionScoringMerge } from "@/data/reunionDummyData";
import {
  buildMockSignalsFromInput,
  calculateBreakupAdjustment,
  calculateContactLeanPercent,
  calculateDisplayScores,
  calculateReunionScore,
  decideReunionCase,
} from "@/lib/reunionScoring";
import type { ReunionNavigateState } from "./ReunionLandingPage";

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StatScore({ label, value, sub }: { label: string; value: number; sub: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
      <p className="text-[10px] text-muted-foreground font-medium mb-1">{label}</p>
      <p className="text-xl font-black text-foreground tabular-nums">{value}</p>
      <p className="text-[10px] text-muted-foreground font-medium mt-1 leading-snug px-0.5">{sub}</p>
      <div className="mt-2.5 h-2.5 w-full rounded-full bg-secondary overflow-hidden">
        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

/** Attraction ResultPage와 동일한 섹션 타이틀 리듬 (번호 배지 + 제목 + 보조) */
function ReunionSectionHeader({
  id,
  step,
  eyebrow,
  title,
  subtitle,
}: {
  id?: string;
  step: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
}) {
  const inner = (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white shrink-0">
        {step}
      </div>
      <div className="min-w-0 pt-0.5">
        {eyebrow ? (
          <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-1">{eyebrow}</p>
        ) : null}
        <h2 className="text-sm font-bold text-foreground tracking-tight">{title}</h2>
        {subtitle ? <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">{subtitle}</p> : null}
      </div>
    </div>
  );
  if (id) {
    return (
      <div id={id} className="scroll-mt-28 mb-5">
        {inner}
      </div>
    );
  }
  return <div className="mb-5">{inner}</div>;
}

function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />;
}

function PremiumTeaserCard({ card, unlocked }: { card: ReunionPremiumTeaser; unlocked: boolean }) {
  const p = card.contactVsWaitPercent;
  const w = card.waitRangeShort;
  const np = card.newPersonWeightPercent;
  return (
    <div className="glass-card rounded-2xl border border-[hsl(45,40%,25%)]/35 overflow-hidden">
      <div className="p-5 space-y-4">
        <h3 className="text-sm font-bold text-foreground leading-snug pr-2">{card.title}</h3>

        {p != null && (
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>기다림 쪽</span>
              <span>연락 쪽</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex bg-secondary">
              <div
                className="h-full bg-muted-foreground/20 transition-all"
                style={{ width: `${100 - p}%` }}
              />
              <div
                className="h-full bg-gradient-to-r from-primary to-[hsl(45,65%,48%)] transition-all"
                style={{ width: `${p}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">
              연락 쪽 기울기 <span className="font-black text-foreground tabular-nums">{p}%</span>
            </p>
          </div>
        )}

        {p == null && w != null && (
          <div className="rounded-xl border border-primary/25 bg-primary/5 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">권장 관망 구간</p>
            <p className="text-xl font-black text-foreground tabular-nums tracking-tight">{w}</p>
          </div>
        )}

        {p == null && w == null && card.tonePreview && (
          <div>
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">먹히는 톤 예시</p>
            <p className="text-sm text-foreground font-mono leading-relaxed bg-secondary/30 rounded-xl px-3 py-3 border border-border/40">
              {card.tonePreview}
            </p>
          </div>
        )}

        {p == null && w == null && !card.tonePreview && np != null && (
          <div className="rounded-xl border border-border/50 bg-secondary/20 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">새 인물 시그널 가중치</p>
            <p className="text-xl font-black text-foreground tabular-nums">{np}%</p>
          </div>
        )}

        {card.visibleSummary ? (
          <p className="text-sm text-foreground/90 leading-[1.8] font-medium">{card.visibleSummary}</p>
        ) : null}

        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/15">
          <div
            className={`p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line ${
              unlocked ? "" : "blur-[5px] select-none pointer-events-none"
            }`}
            aria-hidden={!unlocked}
          >
            {card.lockedBody}
          </div>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/25 backdrop-blur-[1px] px-3">
              <div className="flex items-center gap-1.5 rounded-full bg-card/95 border border-[hsl(45,40%,28%)]/50 px-3 py-2 shadow-sm">
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
  const [searchParams] = useSearchParams();
  const state = location.state as ReunionNavigateState | null;

  const myId = state?.myId ?? "demo_me";
  const theirId = state?.theirId ?? "demo_them";
  const breakupYear = state?.breakupYear ?? DEMO_BREAKUP.year;
  const breakupMonth = state?.breakupMonth ?? DEMO_BREAKUP.month;
  const demoCase = parseReunionDemoParam(searchParams.get("demo"));

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  const scoringMerge = useMemo((): ReunionScoringMerge | null => {
    if (demoCase) return null;
    const { year, month } = clampBreakupToPast(breakupYear, breakupMonth);
    const monthsSince = getMonthsSinceBreakup(year, month);
    const signals = buildMockSignalsFromInput(myId, theirId, monthsSince);
    const breakupAdjustment = calculateBreakupAdjustment(monthsSince);
    const finalScore = calculateReunionScore(signals, breakupAdjustment);
    const effectiveCase = decideReunionCase(signals, monthsSince, finalScore);
    const naiveBand =
      finalScore <= 3 ? "closed" : finalScore <= 6 ? "mixed" : "open-candidate";
    return {
      case: effectiveCase,
      scores: calculateDisplayScores(signals, finalScore, monthsSince),
      contactLeanPercent: calculateContactLeanPercent(signals, finalScore),
      debug: {
        signals,
        finalScore,
        breakupAdjustment,
        breakupMonths: monthsSince,
        naiveBand,
        effectiveCase,
      },
    };
  }, [demoCase, myId, theirId, breakupYear, breakupMonth]);

  const report = useMemo(
    () =>
      getReunionFullReport(
        myId,
        theirId,
        breakupYear,
        breakupMonth,
        undefined,
        demoCase,
        scoringMerge,
      ),
    [myId, theirId, breakupYear, breakupMonth, demoCase, scoringMerge],
  );
  const {
    scores,
    premiumGateCta,
    premiumTeasers,
    meta,
    decisionHint,
    signalSnapshot,
    freeCore,
  } = report;

  const contactLean = decisionHint.contactLeanPercent;
  const decisionSectionKicker =
    contactLean <= 42
      ? "한 줄 판정 · 지금은 연락 미루는 쪽"
      : contactLean >= 58
        ? "한 줄 판정 · 짧은 틈은 있음(조건부)"
        : "한 줄 판정 · 무거우면 안 됨, 가볍면 얇은 여지";
  const decisionSectionTitle =
    contactLean <= 42
      ? "지금 먼저 연락하면 닫힐 가능성이 큼"
      : contactLean >= 58
        ? "지금은 짧은 접점이면 얇은 여지"
        : "무거운 연락은 비추, 얇은 여지만 있다";
  const decisionGaugeVerdict =
    contactLean <= 42
      ? "→ 해석: 지금 당장 적극 연락은 비추다. 기다림·자극 줄이기가 우선이다."
      : contactLean >= 58
        ? "→ 해석: 무거운 연락은 비추다. 짧고 가벼운 한 줄이면 아주 얇은 틈만 있다."
        : "→ 해석: 무겁게 연락하면 비추다. 완전 막힘은 아니어도 여지는 얇다.";

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
          <span className="text-xs text-ai-highlight font-medium bg-ai-highlight/10 border border-ai-highlight/20 px-2.5 py-1 rounded-full truncate">
            @{myId}
          </span>
        </div>
      </header>

      <main className={`flex-1 flex flex-col items-center px-5 pt-6 ${premiumUnlocked ? "pb-24" : "pb-32"}`}>
        <div className="w-full max-w-md">
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">
              Instagram Reunion Report
            </p>
            <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
          </div>

          <h1 className="text-xl font-bold text-foreground text-center leading-tight mb-1">{report.summaryTitle}</h1>
          <p className="text-sm text-muted-foreground text-center mb-6 leading-relaxed">
            @{myId} · @{theirId} · 이별 {meta.breakupLabel} · 헤어진 지{" "}
            <span className="text-foreground font-semibold">{meta.monthsSinceLabel}</span>
          </p>

          <div className="grid grid-cols-3 gap-2 mb-5">
            <StatScore label="재회 가능성" value={scores.reunionPossibility} sub="종합" />
            <StatScore label="상대 개방도" value={scores.theirReunionOpenness} sub="상대" />
            <StatScore label="연락 적합도" value={scores.contactTimingFit} sub="톤·타이밍" />
          </div>

          <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-primary" />
              한 줄 요약
            </h3>
            <p className="text-sm text-foreground/90 leading-[1.9]">{report.summaryLine}</p>
          </div>

          <div className="glass-card rounded-2xl p-5 mb-8">
            <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-primary" />
              목차
            </h4>
            <div className="flex flex-wrap gap-2">
              {report.toc.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToId(item.id)}
                  className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20 hover:bg-primary/15 transition-colors"
                >
                  {item.label}
                  <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                </button>
              ))}
            </div>
          </div>

          <SectionDivider />

          {/* 지금 판단 — 전면 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-decision"
              step="01"
              eyebrow={decisionSectionKicker}
              title={decisionSectionTitle}
              subtitle="공개 프로필 신호만으로 본 연락 vs 기다림 방향입니다."
            />
            <div className="glass-card rounded-2xl p-5 border border-primary/15">
              <p className="text-sm font-bold text-foreground leading-[1.85] mb-5">{decisionHint.headline}</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>기다릴 쪽</span>
                  <span>연락 쪽</span>
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden flex bg-secondary">
                  <div
                    className="h-full bg-muted-foreground/20"
                    style={{ width: `${100 - decisionHint.contactLeanPercent}%` }}
                  />
                  <div
                    className="h-full bg-gradient-to-r from-primary to-[hsl(45,60%,45%)]"
                    style={{ width: `${decisionHint.contactLeanPercent}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground pt-1">
                  지금 손 내밀면 ‘먹힐’ 쪽 기울기{" "}
                  <span className="font-black text-foreground tabular-nums">{decisionHint.contactLeanPercent}%</span>
                </p>
                <p className="text-xs text-center text-foreground font-semibold leading-relaxed px-0.5">
                  {decisionGaugeVerdict}
                </p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-4 mt-5">
                {decisionHint.hintLine}
              </p>
            </div>
          </section>

          <SectionDivider />

          {/* 왜 이렇게 읽히는가 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-scores"
              step="02"
              title="왜 이렇게 읽히는가"
              subtitle="지금 들어가면 불리한 점과, 판을 바꾸는 변수입니다."
            />
            <div className="space-y-3">
              <div className="glass-card rounded-2xl p-5">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Radar className="w-4 h-4 text-primary" />
                  지금 먼저 들어가면 불리한 이유
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{freeCore.whyAmbiguous}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Scale className="w-4 h-4 text-primary" />
                  지금 관계를 바꾸는 변수
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{freeCore.keyVariable}</p>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* 인스타 신호 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-snapshot"
              step="03"
              title="인스타에 남은 관계 흔적"
              subtitle="두 계정에서 읽힌 신호를 압축했습니다."
            />
            <div className="space-y-3">
              <div className="glass-card rounded-2xl p-5 bg-primary/5 border border-primary/10">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                  지금 가장 크게 걸린 축
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.conflictLine}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-primary" />
                  네 인스타에서 보이는 것
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.youLine}</p>
              </div>
              <div className="glass-card rounded-2xl p-5">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Image className="w-4 h-4 text-primary opacity-80" />
                  상대 인스타에서 보이는 선
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.themLine}</p>
              </div>
            </div>
            <div className="glass-card rounded-2xl p-5 mt-4 border-l-4 border-l-[hsl(45,40%,35%)] bg-gradient-to-br from-[hsl(45,12%,10%)] to-card">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Heart className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                무료로 본 판정, 여기까지
              </h4>
              <p className="text-sm text-foreground/90 leading-[1.9]">{report.finalRecommendation}</p>
            </div>
          </section>

          <SectionDivider />

          {/* 심층 */}
          <div id="reunion-premium" className="scroll-mt-28 space-y-5 pt-2">
            <ReunionSectionHeader
              step="04"
              title="심층 리포트"
              subtitle="연락·기다림·속마음·첫 문장·타이밍·무의식 신호를 이어서 봅니다."
            />
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[hsl(45,20%,8%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,25%)]/40 text-center shadow-lg">
              {premiumUnlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-3" />
                  <p className="text-base font-black text-foreground mb-2 leading-tight">심층 분석이 열렸습니다</p>
                  <p className="text-sm text-muted-foreground leading-[1.8] px-1">
                    아래 카드 본문·예시가 모두 선명하게 보입니다.
                  </p>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-3" />
                  <p className="text-base font-black text-foreground mb-2 leading-tight">{premiumGateCta.title}</p>
                  <p className="text-sm text-muted-foreground mb-5 leading-[1.8] px-1 whitespace-pre-line">
                    {premiumGateCta.body}
                  </p>
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
                  <p className="text-xs text-muted-foreground mt-3 leading-relaxed px-1">{premiumGateCta.ctaAuxiliary}</p>
                  <p className="text-xs text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    <span className="line-through tabular-nums opacity-80">{premiumGateCta.stickyListPrice}</span>
                    <span className="font-black text-[hsl(45,72%,58%)] tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                    <span className="text-[10px]">{premiumGateCta.stickySaleNote}</span>
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-5 leading-relaxed border-t border-border/30 pt-4">
                    {premiumGateCta.footnote}
                  </p>
                </>
              )}
            </div>

            <div className="flex items-start gap-2">
              {premiumUnlocked ? (
                <Unlock className="w-4 h-4 text-[hsl(45,70%,55%)] shrink-0 mt-0.5" />
              ) : (
                <Lock className="w-4 h-4 text-[hsl(45,70%,55%)] shrink-0 mt-0.5" />
              )}
              <div>
                <p className="text-xs font-bold text-foreground leading-snug">
                  {premiumUnlocked ? "심층 카드 전체 열람" : "심층 카드 · 일부 공개"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {premiumUnlocked
                    ? "전체 문단이 선명하게 보입니다."
                    : "카드마다 공개된 한 요소만 선명합니다. 나머지는 잠금 해제 후 확인할 수 있습니다."}
                </p>
              </div>
            </div>

            <div id="reunion-premium-cards" className="space-y-4 scroll-mt-28 pb-4">
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
