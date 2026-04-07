import { useEffect, useMemo, useState, type ReactNode } from "react";
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
  Users,
  Loader2,
} from "lucide-react";
import Footer from "@/components/Footer";
import {
  clampBreakupToPast,
  getMonthsSinceBreakup,
  getReunionFullReport,
  parseReunionDemoParam,
} from "@/data/reunionDummyData";
import type {
  ReunionDemoCase,
  ReunionFullReport,
  ReunionPremiumTeaser,
  ReunionScoringMerge,
} from "@/data/reunionDummyData";
import {
  buildMockSignalsFromInput,
  calculateBreakupAdjustment,
  calculateContactLeanPercent,
  calculateDisplayScores,
  calculateReunionScore,
  computeTheirReachOutFirst,
  decideReunionCase,
  scoreReunionFromRich,
} from "@/lib/reunionScoring";
import {
  fetchReunionPairWithAnalysis,
  type ReunionAccountAiAnalysis,
} from "@/lib/reunionInstagram";
import { buildFallbackReunionRichSignals, buildReunionRichSignals } from "@/lib/reunionSignals";
import type { ReunionRichSignals } from "@/lib/reunionSignals";
import { buildReunionNarrative, mergeReunionNarrativeIntoReport } from "@/lib/reunionNarrative";
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

/** 섹션 타이틀: 단계 배지 + 제목 + 보조 */
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

/** 무료 구간에서 본문만 블러 + 잠금 배지 */
function ReunionBlurGate({
  active,
  children,
  className = "",
  minHeightClass = "min-h-[4.5rem]",
}: {
  active: boolean;
  children: React.ReactNode;
  className?: string;
  minHeightClass?: string;
}) {
  if (!active) return <div className={className}>{children}</div>;
  return (
    <div className={`relative overflow-hidden rounded-xl ${className} ${minHeightClass}`}>
      <div className="blur-[5px] select-none pointer-events-none opacity-[0.55]">{children}</div>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 bg-card/60 backdrop-blur-[2px] px-3">
        <Lock className="w-4 h-4 text-[hsl(45,70%,55%)] shrink-0" aria-hidden />
        <span className="text-[9px] font-black text-[hsl(45,70%,52%)] text-center leading-tight">
          유료 열람
        </span>
      </div>
    </div>
  );
}

function ReunionAccountAiSection({
  label,
  analysis,
}: {
  label: string;
  analysis: ReunionAccountAiAnalysis | null;
}) {
  if (!analysis) return null;

  const isMine = label.includes("내 계정");

  return (
    <div className="mt-4 space-y-3">
      {/* 유형 카드 */}
      <div className="rounded-xl border border-ai-highlight/25 bg-ai-highlight/5 p-4">
        <p className="text-[10px] font-bold text-ai-highlight uppercase tracking-wider mb-3">
          {isMine ? "나는 어떤 타입인가" : "상대는 어떤 타입인가"}
        </p>
        <p className="text-lg font-bold text-foreground leading-tight mb-1">
          {analysis.accountType ?? "분석 중"}
        </p>
        <p className="text-sm text-foreground/70 mb-3">{analysis.impression}</p>
        <div className="flex flex-wrap gap-1.5">
          {analysis.keywords.map((k, i) => (
            <span
              key={`${i}-${k}`}
              className="text-[11px] font-medium px-2.5 py-1 rounded-full bg-ai-highlight/15 border border-ai-highlight/30 text-ai-highlight"
            >
              {k}
            </span>
          ))}
        </div>
      </div>

      {/* 상대 눈엔 어떻게 보이는지 / 지금 심리 상태 */}
      <div className="rounded-xl border border-border bg-card/50 p-4 space-y-3">
        <div>
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            {isMine ? "상대 눈엔 어떻게 보여" : "지금 심리 상태"}
          </p>
          <p className="text-sm text-foreground/80 leading-[1.75]">
            {analysis.psychologyNow}
          </p>
        </div>
        <div className="border-t border-border/50 pt-3">
          <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1.5">
            {isMine ? "지금 내 피드가 주는 신호" : "상대가 반응하는 조건"}
          </p>
          <p className="text-sm text-foreground/80 leading-[1.75]">
            {analysis.approachContext}
          </p>
        </div>
      </div>
    </div>
  );
}

function ReunionTeaserLockCard({
  title,
  teaser,
  body,
  unlocked,
}: {
  title: string;
  teaser: string;
  body: string;
  unlocked: boolean;
}) {
  return (
    <div className="glass-card rounded-2xl border border-[hsl(45,40%,25%)]/35 overflow-hidden">
      <div className="p-5 space-y-3">
        <h3 className="text-sm font-bold text-foreground leading-snug pr-2">{title}</h3>
        <p className="text-sm text-foreground/90 leading-[1.75]">{teaser}</p>
        <div className="relative rounded-xl overflow-hidden border border-border/50 bg-secondary/15">
          <div
            className={`p-4 text-xs leading-relaxed text-muted-foreground whitespace-pre-line ${
              unlocked ? "" : "blur-[5px] select-none pointer-events-none"
            }`}
            aria-hidden={!unlocked}
          >
            {body}
          </div>
          {!unlocked && (
            <div className="absolute inset-0 flex items-center justify-center bg-card/25 backdrop-blur-[1px] px-3">
              <div className="flex items-center gap-1.5 rounded-full bg-card/95 border border-[hsl(45,40%,28%)]/50 px-3 py-2 shadow-sm">
                <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)] shrink-0" />
                <span className="text-[9px] font-bold text-[hsl(45,70%,52%)] leading-tight text-center">
                  심층 해석 잠금
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PremiumTeaserCard({
  card,
  unlocked,
  resolvedCase,
  fullBleedLock = false,
}: {
  card: ReunionPremiumTeaser;
  unlocked: boolean;
  resolvedCase: ReunionDemoCase;
  /** true면 미열람 시 카드 전체 잠금(무료 구간 미리보기 없음) */
  fullBleedLock?: boolean;
}) {
  const p = card.contactVsWaitPercent;
  const w = card.waitRangeShort;
  const np = card.newPersonWeightPercent;
  const meta = reunionPremiumMetaForKey(card.key);

  const tagRow = (
    <div className="flex flex-wrap gap-1.5">
      {meta.tags.map((tag) => (
        <span
          key={tag}
          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9px] font-black tracking-tight border ${REUNION_GOLD_BG} ${REUNION_GOLD}`}
        >
          {tag}
        </span>
      ))}
    </div>
  );

  const headerBlock = (
    <div className="flex items-start gap-3 border-b border-[hsl(45,40%,25%)]/30 pb-4">
      <span className="text-[2rem] leading-none shrink-0 select-none" aria-hidden>
        {meta.emoji}
      </span>
      <div className="min-w-0 flex-1">
        {unlocked ? (
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Crown className="w-3.5 h-3.5 text-[hsl(45,70%,55%)] shrink-0" />
            <span className="text-[9px] font-bold text-[hsl(45,70%,55%)] uppercase tracking-wider">
              Premium Insight
            </span>
            <span className="text-[9px] font-black bg-[hsl(45,70%,55%)]/20 text-[hsl(45,70%,55%)] px-2 py-0.5 rounded-full border border-[hsl(45,40%,30%)]/40">
              UNLOCKED
            </span>
          </div>
        ) : (
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)] shrink-0" />
            <span className="text-[9px] font-bold text-[hsl(45,70%,55%)] uppercase tracking-wider">Premium</span>
          </div>
        )}
        <h3 className="text-sm font-black text-foreground leading-snug pr-1">{card.title}</h3>
      </div>
    </div>
  );

  if (fullBleedLock && !unlocked) {
    return (
      <div
        className={`rounded-2xl overflow-hidden relative min-h-[120px] mb-6 ${REUNION_PREMIUM_CARD_SHELL_LOCKED}`}
      >
        <div className="p-5 space-y-3">
          {tagRow}
          <div className="flex items-start gap-3 opacity-40">
            <span className="text-[2rem] leading-none shrink-0">{meta.emoji}</span>
            <h3 className="text-sm font-black text-foreground leading-snug pt-1">{card.title}</h3>
          </div>
        </div>
        <div className="absolute inset-0 flex items-center justify-center bg-card/55 backdrop-blur-[3px] px-3">
          <div className="flex items-center gap-2 rounded-full bg-card/95 border border-[hsl(45,40%,28%)]/50 px-3 py-2 shadow-sm">
            <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)] shrink-0" />
            <span className="text-[9px] font-black text-[hsl(45,70%,52%)] leading-tight">심층 유료 · 열면 전부 선명</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl overflow-hidden mb-6 ${unlocked ? REUNION_PREMIUM_CARD_SHELL_UNLOCKED : REUNION_PREMIUM_CARD_SHELL_LOCKED}`}
    >
      <div className="p-5 space-y-4">
        {tagRow}
        {headerBlock}

        {p != null && (
          <div className="space-y-2 rounded-xl border border-[hsl(45,30%,22%)]/40 bg-[hsl(45,12%,10%)]/50 p-3">
            <div className="flex justify-between text-xs font-medium text-muted-foreground">
              <span>기다리기</span>
              <span>연락하기</span>
            </div>
            <div className="h-3 w-full rounded-full overflow-hidden flex border border-[hsl(45,40%,25%)]/35">
              <div
                className={p >= 50 ? REUNION_LEAN_BAR_MUTED : REUNION_LEAN_BAR_VIBRANT}
                style={{ width: `${100 - p}%` }}
              />
              <div
                className={p >= 50 ? REUNION_LEAN_BAR_VIBRANT : REUNION_LEAN_BAR_MUTED}
                style={{ width: `${p}%` }}
              />
            </div>
            <p className="text-xs text-center text-muted-foreground">{formatReunionLeanComparison(p)}</p>
            <p className="text-xs text-center text-foreground font-semibold leading-relaxed px-0.5">
              {REUNION_LEAN_HINT_BY_CASE[resolvedCase]}
            </p>
          </div>
        )}

        {p == null && w != null && (
          <div className="rounded-xl border border-[hsl(45,40%,28%)]/45 bg-[hsl(45,18%,10%)]/70 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">권장 관망 구간</p>
            <p className="text-xl font-black text-[hsl(45,72%,58%)] tabular-nums tracking-tight">{w}</p>
          </div>
        )}

        {p == null && w == null && card.tonePreview && (
          <div className="rounded-xl border border-[hsl(45,30%,22%)]/40 bg-[hsl(45,12%,10%)]/50 p-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-2">먹히는 톤 예시</p>
            <p className="text-sm text-foreground font-mono leading-relaxed rounded-lg px-3 py-3 border border-[hsl(45,40%,25%)]/25 bg-secondary/20">
              {card.tonePreview}
            </p>
          </div>
        )}

        {p == null && w == null && !card.tonePreview && np != null && (
          <div className="rounded-xl border border-[hsl(45,40%,28%)]/45 bg-[hsl(45,18%,10%)]/70 px-4 py-3">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">
              새 인물 시그널 가중치
            </p>
            <p className="text-xl font-black text-[hsl(45,72%,58%)] tabular-nums">{np}%</p>
          </div>
        )}

        {card.visibleSummary ? (
          <p className="text-sm text-foreground/90 leading-[1.8] font-semibold border-l-2 border-[hsl(45,70%,55%)]/50 pl-3">
            {card.visibleSummary}
          </p>
        ) : null}

        <div className="pt-1 border-t border-[hsl(45,40%,25%)]/25">
          <ReunionPremiumBodyPoints raw={card.lockedBody} unlocked={unlocked} />
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

  const myId = state?.myId ?? searchParams.get("myId") ?? "demo_me";
  const theirId = state?.theirId ?? searchParams.get("targetId") ?? "demo_them";
  const breakupYear = state?.breakupYear ?? DEMO_BREAKUP.year;
  const breakupMonth = state?.breakupMonth ?? DEMO_BREAKUP.month;
  const demoCase = parseReunionDemoParam(searchParams.get("demo"));

  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pipelineReport, setPipelineReport] = useState<ReunionFullReport | null>(null);
  const [pipelineCase, setPipelineCase] = useState<ReunionDemoCase | null>(null);
  const [igFetchLoading, setIgFetchLoading] = useState(() => demoCase == null);
  const [igFetchError, setIgFetchError] = useState(false);
  const [pairAi, setPairAi] = useState<{
    my: ReunionAccountAiAnalysis | null;
    their: ReunionAccountAiAnalysis | null;
    fromCache: boolean;
  } | null>(null);
  const [pipelineRichSignals, setPipelineRichSignals] = useState<ReunionRichSignals | null>(null);

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

  useEffect(() => {
    if (demoCase) {
      setPipelineReport(null);
      setPipelineCase(null);
      setPairAi(null);
      setPipelineRichSignals(null);
      setIgFetchError(false);
      setIgFetchLoading(false);
      return;
    }

    let cancelled = false;
    setIgFetchLoading(true);
    setIgFetchError(false);
    setPairAi(null);
    setPipelineRichSignals(null);

    (async () => {
      try {
        const pairRes = await fetchReunionPairWithAnalysis(myId, theirId);
        if (cancelled) return;
        if (!pairRes.ok) {
          setPipelineReport(null);
          setPipelineCase(null);
          setPairAi(null);
          setPipelineRichSignals(null);
          setIgFetchError(true);
          return;
        }

        const { year, month } = clampBreakupToPast(breakupYear, breakupMonth);
        const monthsSince = getMonthsSinceBreakup(year, month);
        const rich = buildReunionRichSignals(pairRes.my, pairRes.their, monthsSince, {
          myPrivatePenalty: Boolean(pairRes.myPrivateWarning || pairRes.my.profile.isPrivate),
          theirPrivatePenalty: Boolean(pairRes.theirPrivateWarning || pairRes.their.profile.isPrivate),
        });
        const scored = scoreReunionFromRich(rich);
        const narrative = buildReunionNarrative(
          rich,
          scored.case,
          scored.displayScores,
          myId,
          theirId,
        );
        const base = getReunionFullReport(myId, theirId, breakupYear, breakupMonth, new Date(), null, {
          case: scored.case,
          scores: scored.displayScores,
          contactLeanPercent: scored.contactLeanPercent,
        });
        const merged = mergeReunionNarrativeIntoReport(base, narrative, {
          contactLeanPercent: scored.contactLeanPercent,
          scores: scored.displayScores,
        });
        setPipelineReport(merged);
        setPipelineCase(scored.case);
        setPipelineRichSignals(rich);
        setPairAi({
          my: pairRes.myAi,
          their: pairRes.theirAi,
          fromCache: pairRes.fromCache,
        });
        setIgFetchError(false);
      } catch {
        if (!cancelled) {
          setPipelineReport(null);
          setPipelineCase(null);
          setPairAi(null);
          setPipelineRichSignals(null);
          setIgFetchError(true);
        }
      } finally {
        if (!cancelled) setIgFetchLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [demoCase, myId, theirId, breakupYear, breakupMonth]);

  const fallbackReport = useMemo(
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

  const report = pipelineReport ?? fallbackReport;

  const richSignalsForUi = useMemo(() => {
    if (pipelineRichSignals) return pipelineRichSignals;
    const { year, month } = clampBreakupToPast(breakupYear, breakupMonth);
    const m = getMonthsSinceBreakup(year, month);
    return buildFallbackReunionRichSignals(myId, theirId, m);
  }, [pipelineRichSignals, myId, theirId, breakupYear, breakupMonth]);

  const reachOutForecast = useMemo(() => computeTheirReachOutFirst(richSignalsForUi), [richSignalsForUi]);

  const {
    scores,
    premiumGateCta,
    premiumTeasers,
    meta,
    decisionHint,
    signalSnapshot,
    freeCore,
    reunionJourney,
    myProfileSignals,
    theirProfileSignals,
  } = report;

  /** demo > 파이프라인 > 해시 scoring */
  const resolvedCase: ReunionDemoCase = demoCase ?? pipelineCase ?? scoringMerge?.case ?? "mixed";
  const caseSource: "demo" | "pipeline" | "scoring" = demoCase
    ? "demo"
    : pipelineReport
      ? "pipeline"
      : "scoring";
  const showIgLoading = !demoCase && igFetchLoading && !pipelineReport && !igFetchError;
  const { kicker: decisionSectionKicker, title: decisionSectionTitle } =
    REUNION_DECISION_SECTION_BY_CASE[resolvedCase];

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

  useEffect(() => {
    console.log("[REUNION]", {
      source: caseSource,
      effectiveCase: resolvedCase,
      displayScores: scores,
      contactLeanPercent: decisionHint.contactLeanPercent,
    });
  }, [caseSource, resolvedCase, scores, decisionHint.contactLeanPercent]);

  if (showIgLoading) {
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
        </header>
        <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
          <div className="w-full max-w-sm mx-auto">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
                </svg>
              </div>
              <h2 className="text-foreground text-xl font-bold mb-1">신호 분석 중이에요...</h2>
              <p className="text-muted-foreground text-sm">두 계정의 흐름을 읽고 있어요</p>
            </div>
            <div className="mb-6">
              <div className="flex justify-between text-xs text-muted-foreground mb-2">
                <span>분석 중...</span>
                <span className="text-primary font-medium">잠시만요</span>
              </div>
              <div className="w-full bg-muted rounded-full h-1.5">
                <div className="bg-primary h-1.5 rounded-full animate-pulse" style={{width: "75%"}}></div>
              </div>
            </div>
            <div className="space-y-3 mb-8">
              {["인스타 공개 데이터 수집 중", "내 계정 톤·리듬 분석 중", "상대 계정 시그널 해석 중", "둘 사이 관계 패턴 분석 중", "재회 가능성 계산 중"].map((step, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center flex-shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                  </div>
                  <span className="text-foreground/80 text-sm">{step}</span>
                </div>
              ))}
            </div>
            <div className="bg-card border border-border rounded-2xl p-4">
              <p className="text-primary text-xs font-semibold tracking-wider mb-2">✦ SIGNAL INSIGHT</p>
              <p className="text-foreground/70 text-sm italic">"공개 피드에 남은 흔적이 생각보다 많은 걸 말하고 있어..."</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

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
          {igFetchError && !demoCase && !pipelineReport ? (
            <div
              role="status"
              className="mb-4 rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-foreground/90 leading-relaxed"
            >
              인스타 스크랩에 실패했습니다. 아래는 해시 기반 추정 모드입니다. Edge 함수·API 키를 확인하거나 잠시 후 다시 시도해 주세요.
            </div>
          ) : null}
          {pipelineReport && pairAi?.fromCache ? (
            <p className="mb-3 text-[10px] text-muted-foreground text-center leading-relaxed px-1">
              동일 계정 조합은 최근 72시간 안에 분석된 결과를 재사용합니다. (스크랩·AI 호출 절감)
            </p>
          ) : null}
          <div className="text-center mb-6">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">
              Instagram Reunion Report
            </p>
            <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
          </div>

          <h1 className="text-xl font-bold text-foreground text-center leading-tight mb-1">{report.summaryTitle}</h1>
          <ReunionBlurGate active={!premiumUnlocked} className="mb-3" minHeightClass="min-h-[2.75rem]">
            <p className="text-xs sm:text-sm text-muted-foreground text-center leading-relaxed px-1">
              공개 피드에 남은 신호만으로 지금 둘 사이가 어디쯤인지 읽어냈습니다.
            </p>
          </ReunionBlurGate>
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

          <ReunionBlurGate active={!premiumUnlocked} className="mb-8" minHeightClass="min-h-[5.5rem]">
            <div className="glass-card rounded-2xl p-5">
              <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-primary" />
                어디부터 볼까
              </h4>
              <div className="flex flex-wrap gap-2">
                {report.toc.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToId(item.id)}
                    className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20 hover:bg-primary/15 transition-colors"
                  >
                    {REUNION_TOC_LABEL_BY_ID[item.id] ?? item.label}
                    <ChevronRight className="w-3.5 h-3.5 opacity-70" />
                  </button>
                ))}
              </div>
            </div>
          </ReunionBlurGate>

          <SectionDivider />

          {/* 02 내 계정 톤 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-my-type"
              step="2"
              title="내 계정 톤"
              subtitle="네 피드가 상대한테 지금 어떻게 읽히는지."
            />
            <div className="glass-card rounded-2xl p-5 border border-primary/10 mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                한 줄 요약
              </p>
              <p className="text-base font-black text-foreground leading-snug mb-3">{reunionJourney.myTypeName}</p>
              <p className="text-sm text-foreground/90 leading-[1.9] mb-4">{reunionJourney.myTypeLead}</p>
              <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[14rem]">
                <div className="space-y-4">
                  <ReunionAccountAiSection label="내 계정이 상대한테 어떻게 읽히고 있나" analysis={pairAi?.my ?? null} />
                  <div className="space-y-2">
                    <div className="rounded-xl border border-border/50 bg-secondary/15 p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">흔적</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{reunionJourney.myTypeSubcards[0]}</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-secondary/15 p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">접점</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{reunionJourney.myTypeSubcards[1]}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{myProfileSignals.observedFrom}</p>
                </div>
              </ReunionBlurGate>
            </div>
            <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[10rem]" className="mt-3">
              <ReunionTeaserLockCard
                title={premiumTeasers[7]?.title ?? "내가 먼저 망치는 패턴"}
                teaser="지금 네 쪽에서 제일 위험한 건 감정 그 자체보다, 감정이 새는 방식입니다."
                body={premiumTeasers[7]?.lockedBody ?? ""}
                unlocked={premiumUnlocked}
              />
            </ReunionBlurGate>
          </section>

          <SectionDivider />

          {/* 03 상대 계정 톤 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-their-type"
              step="3"
              title="상대 계정 톤"
              subtitle="상대 계정이 지금 어디쯤 와 있는지."
            />
            <div className="glass-card rounded-2xl p-5 border border-primary/10 mb-3">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                한 줄 요약
              </p>
              <p className="text-base font-black text-foreground leading-snug mb-3">{reunionJourney.theirTypeName}</p>
              <p className="text-sm text-foreground/90 leading-[1.9] mb-4">{reunionJourney.theirTypeLead}</p>
              <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[14rem]">
                <div className="space-y-4">
                  <ReunionAccountAiSection label="상대 계정에서 읽히는 것들" analysis={pairAi?.their ?? null} />
                  <div className="space-y-2">
                    <div className="rounded-xl border border-border/50 bg-secondary/15 p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">경계</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{reunionJourney.theirTypeSubcards[0]}</p>
                    </div>
                    <div className="rounded-xl border border-border/50 bg-secondary/15 p-4">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide mb-1">재회 쪽 온도</p>
                      <p className="text-sm text-foreground/90 leading-relaxed">{reunionJourney.theirTypeSubcards[1]}</p>
                    </div>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-relaxed">{theirProfileSignals.observedFrom}</p>
                </div>
              </ReunionBlurGate>
            </div>
            <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[10rem]" className="mt-3">
              <ReunionTeaserLockCard
                title={premiumTeasers[6]?.title ?? "상대가 안 오는데 흔적은 남기는 이유"}
                teaser="모르는 게 아니라, 알아서 피하는 걸 수도 있습니다. 상대가 지금 진짜 피하는 게 너인지, 상황인지, 감정인지 아래에서 갈립니다."
                body={premiumTeasers[6]?.lockedBody ?? ""}
                unlocked={premiumUnlocked}
              />
            </ReunionBlurGate>
          </section>

          <SectionDivider />

          {/* 04 둘이 엮이는 방식 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-combo"
              step="4"
              title="둘이 엮이는 방식"
              subtitle="둘 사이에서 계속 반복되는 패턴의 정체."
            />
            <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[16rem]">
              <div className="glass-card rounded-2xl p-5 bg-primary/5 border border-primary/15 mb-3">
                <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" />
                  이 관계가 꼬이는 방식
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9] whitespace-pre-line">{reunionJourney.comboCardBody}</p>
              </div>
              <ReunionTeaserLockCard
                title="둘이 다시 이어질 수 있는 조건"
                teaser={reunionJourney.lockTeaserComboConditions}
                body={reunionJourney.lockBodyComboConditions}
                unlocked={premiumUnlocked}
              />
            </ReunionBlurGate>
          </section>

          <SectionDivider />

          {/* 05 연락해? 말아? */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-decision"
              step="5"
              eyebrow={decisionSectionKicker}
              title="연락해? 말아?"
              subtitle="연락했을 때 반응이 올지, 아니면 완전히 차단각인지."
            />
            <p className="text-sm font-bold text-foreground leading-snug mb-4 px-0.5">{decisionSectionTitle}</p>
            <div className="glass-card rounded-2xl p-5 border border-primary/15">
              <ReunionBlurGate active={!premiumUnlocked} className="mb-5" minHeightClass="min-h-[3.5rem]">
                <p className="text-sm font-bold text-foreground leading-[1.85]">{decisionHint.headline}</p>
              </ReunionBlurGate>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-medium text-muted-foreground">
                  <span>기다리기</span>
                  <span>연락하기</span>
                </div>
                <div className="h-3 w-full rounded-full overflow-hidden flex border border-border/40">
                  <div
                    className={
                      decisionHint.contactLeanPercent >= 50
                        ? REUNION_LEAN_BAR_MUTED
                        : REUNION_LEAN_BAR_VIBRANT
                    }
                    style={{ width: `${100 - decisionHint.contactLeanPercent}%` }}
                  />
                  <div
                    className={
                      decisionHint.contactLeanPercent >= 50
                        ? REUNION_LEAN_BAR_VIBRANT
                        : REUNION_LEAN_BAR_MUTED
                    }
                    style={{ width: `${decisionHint.contactLeanPercent}%` }}
                  />
                </div>
                <p className="text-xs text-center text-muted-foreground pt-1">
                  {formatReunionLeanComparison(decisionHint.contactLeanPercent)}
                </p>
              </div>
              <ReunionBlurGate active={!premiumUnlocked} className="mt-3" minHeightClass="min-h-[4rem]">
                <div className="space-y-3">
                  <p className="text-xs text-center text-foreground font-semibold leading-relaxed px-0.5">
                    {REUNION_LEAN_HINT_BY_CASE[resolvedCase]}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed border-t border-border/50 pt-4">
                    {decisionHint.hintLine}
                  </p>
                </div>
              </ReunionBlurGate>
            </div>

            <div id="reunion-reachout" className="scroll-mt-28 mt-6 mb-2">
              <ReunionSectionHeader
                step="6"
                title="상대가 먼저 쐬줄까"
                subtitle="내가 아무것도 안 해도 상대가 먼저 연락할까."
              />
              <div className="glass-card rounded-2xl p-5 border border-primary/15">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                  먼저 올 추정치
                </p>
                <p className="text-4xl font-black text-foreground tabular-nums tracking-tight mb-1">
                  {reachOutForecast.percent}
                  <span className="text-2xl align-top">%</span>
                </p>
                <ReunionBlurGate active={!premiumUnlocked} className="mt-4" minHeightClass="min-h-[11rem]">
                  <div className="text-sm text-foreground/90 leading-relaxed space-y-3">
                    <p className="font-semibold text-foreground">{reachOutForecast.rationaleLine}</p>
                    <p>
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wide block mb-1">
                        예상 시점
                      </span>
                      {reachOutForecast.timingBand}
                    </p>
                    <p>
                      <span className="text-muted-foreground text-[10px] uppercase tracking-wide block mb-1">
                        올 거면 이런 방식
                      </span>
                      {reachOutForecast.channelPrimary}
                    </p>
                    <p className="text-muted-foreground">{reachOutForecast.channelSecondary}</p>
                    <p className="text-xs text-foreground font-semibold border-t border-border/40 pt-3 leading-snug">
                      {reachOutForecast.punchLine}
                    </p>
                  </div>
                </ReunionBlurGate>
              </div>
            </div>

            <div className="space-y-4 mt-4">
              {premiumTeasers[0] ? (
                <PremiumTeaserCard
                  card={premiumTeasers[0]}
                  unlocked={premiumUnlocked}
                  resolvedCase={resolvedCase}
                  fullBleedLock={!premiumUnlocked}
                />
              ) : null}
              {premiumTeasers[1] ? (
                <PremiumTeaserCard
                  card={premiumTeasers[1]}
                  unlocked={premiumUnlocked}
                  resolvedCase={resolvedCase}
                  fullBleedLock={!premiumUnlocked}
                />
              ) : null}
            </div>
          </section>

          <SectionDivider />

          {/* 07 왜 이렇게 된 거야 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-scores"
              step="7"
              title="왜 이렇게 된 거야"
              subtitle="지금 이 판을 뒤집을 수 있는 변수가 뭔지."
            />
            <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[18rem]">
              <div className="space-y-3">
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Radar className="w-4 h-4 text-primary" />
                    지금 들이대면 왜 불리한지
                  </h4>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{freeCore.whyAmbiguous}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-primary" />
                    판 바꾸는 변수
                  </h4>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{freeCore.keyVariable}</p>
                </div>
              </div>
              <div className="mt-4">
                <ReunionTeaserLockCard
                  title="왜 같은 연락도 어떤 날은 먹히고 어떤 날은 막히는지"
                  teaser={reunionJourney.lockTeaserWhyVaries}
                  body={reunionJourney.lockBodyWhyVaries}
                  unlocked={premiumUnlocked}
                />
              </div>
            </ReunionBlurGate>
          </section>

          <SectionDivider />

          {/* 08 피드에 남은 신호 */}
          <section className="relative mb-8 pt-8">
            <ReunionSectionHeader
              id="reunion-snapshot"
              step="8"
              title="피드에 남은 신호"
              subtitle="두 계정에 남은 흔적이 말하는 것들."
            />
            <ReunionBlurGate active={!premiumUnlocked} minHeightClass="min-h-[22rem]">
              <div className="space-y-3">
                <div className="glass-card rounded-2xl p-5 bg-primary/5 border border-primary/10">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                    지금 제일 크게 걸린 축
                  </h4>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.conflictLine}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-primary" />
                    내 피드에서 보이는 것
                  </h4>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.youLine}</p>
                </div>
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                    <Image className="w-4 h-4 text-primary opacity-80" />
                    상대 피드에서 보이는 선
                  </h4>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{signalSnapshot.themLine}</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-5 mt-4 border-l-4 border-l-[hsl(45,40%,35%)] bg-gradient-to-br from-[hsl(45,12%,10%)] to-card">
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Heart className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                  무료로 본 판, 여기까지
                </h4>
                <p className="text-sm text-foreground/90 leading-[1.9]">{report.finalRecommendation}</p>
              </div>
              <div className="space-y-4 mt-4">
                {premiumTeasers[4] ? (
                  <PremiumTeaserCard
                    card={premiumTeasers[4]}
                    unlocked={premiumUnlocked}
                    resolvedCase={resolvedCase}
                    fullBleedLock={!premiumUnlocked}
                  />
                ) : null}
                {premiumTeasers[5] ? (
                  <PremiumTeaserCard
                    card={premiumTeasers[5]}
                    unlocked={premiumUnlocked}
                    resolvedCase={resolvedCase}
                    fullBleedLock={!premiumUnlocked}
                  />
                ) : null}
              </div>
            </ReunionBlurGate>
          </section>

          <SectionDivider />

          {/* 09 속내 분석 */}
          <div id="reunion-premium" className="scroll-mt-28 space-y-5 pt-2">
            <ReunionSectionHeader
              step="9"
              title="속내 분석"
              subtitle="첫 문장부터 답장 확률까지. 아래서 확인."
            />
            <div className="rounded-2xl p-4 mb-1 flex items-center gap-3 bg-gradient-to-r from-[hsl(45,30%,12%)] to-[hsl(35,20%,8%)] border border-[hsl(45,30%,20%)]/40">
              <Crown className="w-8 h-8 text-[hsl(45,70%,55%)] shrink-0" />
              <div className="min-w-0">
                <p className="text-xs font-black text-foreground leading-snug">심층 분석 전체</p>
                <p className="text-[10px] text-muted-foreground mt-1 leading-relaxed">
                  
                </p>
              </div>
            </div>
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[hsl(45,20%,8%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,25%)]/40 text-center shadow-lg">
              {premiumUnlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-3" />
                  <p className="text-base font-black text-foreground mb-2 leading-tight">속내 분석 열림</p>
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
                  {premiumUnlocked ? "속내 카드 전부 열림" : "속내 카드 · 일부만 공개"}
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                  {premiumUnlocked
                    ? "전체 문단이 선명하게 보입니다."
                    : "일부만 공개된 상태입니다. 심층 분석에서 전부 나옵니다."}
                </p>
              </div>
            </div>

            <div id="reunion-premium-cards" className="space-y-4 scroll-mt-28 pb-4">
              {premiumTeasers.slice(2).map((card) => (
                <PremiumTeaserCard
                  key={card.key}
                  card={card}
                  unlocked={premiumUnlocked}
                  resolvedCase={resolvedCase}
                  fullBleedLock={!premiumUnlocked}
                />
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
