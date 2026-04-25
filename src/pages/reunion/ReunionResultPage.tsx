import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link, useLocation, useSearchParams } from "react-router-dom";
import {
  Lock,
  Unlock,
  Heart,
  Crown,
  Sparkles,
  Users,
  Check,
  X,
  Copy,
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
  fetchReunionPremiumCards,
  PREMIUM_CARD_KEY_MAP,
  type ReunionAccountAiAnalysis,
  type ReunionPremiumCards,
  type ReunionScrapeBundle,
  type FirstMessageData,
} from "@/lib/reunionInstagram";
import { buildFallbackReunionRichSignals, buildReunionRichSignals } from "@/lib/reunionSignals";
import type { ReunionRichSignals } from "@/lib/reunionSignals";
import { buildReunionNarrative, mergeReunionNarrativeIntoReport } from "@/lib/reunionNarrative";
import type { ReunionNavigateState } from "./ReunionLandingPage";

/* ── helpers ─────────────────────────────────────────────── */

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function SectionDivider() {
  return <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent my-4" />;
}

function SectionBadge({ step }: { step: string }) {
  return (
    <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white shrink-0">
      {step.padStart(2, "0")}
    </div>
  );
}

function BlurGate({
  locked,
  children,
  className = "",
  hint = "심층 분석에서 확인",
}: {
  locked: boolean;
  children: React.ReactNode;
  className?: string;
  hint?: string;
}) {
  if (!locked) return <div className={className}>{children}</div>;
  return (
    <div className={`relative overflow-hidden rounded-xl ${className}`}>
      <div className="blur-[6px] select-none pointer-events-none opacity-60" aria-hidden>
        {children}
      </div>
      <div className="absolute inset-0 flex items-center justify-center bg-card/50 backdrop-blur-[2px]">
        <div className="flex items-center gap-1.5 rounded-full bg-card/90 border border-[hsl(45,40%,28%)]/50 px-3 py-1.5 shadow-sm">
          <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
          <span className="text-[9px] font-bold text-[hsl(45,70%,52%)]">{hint}</span>
        </div>
      </div>
    </div>
  );
}

/** 하트 5개 척도 */
function HeartScale({ score }: { score: number }) {
  const filled = score >= 71 ? 5 : score >= 51 ? 4 : score >= 31 ? 3 : score >= 16 ? 2 : 1;
  return (
    <div className="flex gap-1">
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} className="text-lg">
          {i < filled ? "❤️" : "🤍"}
        </span>
      ))}
    </div>
  );
}

function reunionRecommendLabel(score: number, dynamicLine?: string) {
  const fallback =
    score >= 71 ? "지금이 타이밍이다. 방법만 잘 고르면 된다"
    : score >= 51 ? "여지는 있다. 단, 방법을 골라야 한다"
    : score >= 31 ? "반반이다. 잘못 건들면 끝장날 수 있다"
    : "솔직히 재회는 추천하지 않는다";
  const tag = score >= 71 ? "추천" : score >= 51 ? "가능" : score >= 31 ? "중립" : "비추";
  const color = score >= 71 ? "text-green-400" : score >= 51 ? "text-primary" : score >= 31 ? "text-amber-400" : "text-red-400";
  return { tag, color, line: dynamicLine || fallback };
}

/** 도발 따옴표 훅 */
function HookQuote({ text }: { text: string }) {
  return (
    <p className="text-sm italic text-foreground/70 leading-relaxed border-l-2 border-primary/40 pl-3">
      "{text}"
    </p>
  );
}

/* ── loading screen with animated progress ───────────────── */

const LOADING_STEPS = [
  "인스타 공개 데이터 수집 중",
  "내 계정 톤·리듬 분석 중",
  "상대 계정 시그널 해석 중",
  "둘 사이 관계 패턴 분석 중",
  "재회 가능성 계산 중",
];

function ReunionLoadingScreen() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    let raf: number;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      // Phase 1: 0→85% in 15s (cubic ease-out)
      // Phase 2: 85→99% in next 25s (very slow crawl)
      let value: number;
      if (elapsed < 15_000) {
        const t = elapsed / 15_000;
        value = (1 - (1 - t) ** 3) * 85;
      } else {
        const t2 = Math.min((elapsed - 15_000) / 25_000, 1);
        value = 85 + t2 * 14; // 85→99
      }
      setProgress(Math.round(Math.min(value, 99)));
      if (value < 99) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const activeStep = Math.min(Math.floor(progress / 20), LOADING_STEPS.length - 1);

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
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">HiddenSelf</span>
            <span className="text-[9px] text-muted-foreground font-medium truncate">재회 시그널 리포트</span>
          </div>
        </Link>
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-5 py-16">
        <div className="w-full max-w-sm mx-auto">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-primary flex items-center justify-center mb-5 shadow-lg shadow-primary/30">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
            <h2 className="text-foreground text-xl font-bold mb-1">신호 분석 중이에요...</h2>
            <p className="text-muted-foreground text-sm">두 계정의 흐름을 읽고 있어요</p>
          </div>

          {/* animated progress */}
          <div className="mb-6">
            <div className="flex justify-between items-baseline text-xs mb-2">
              <span className="text-muted-foreground">{progress >= 95 ? "리포트 생성 중..." : "분석 중..."}</span>
              <span className="text-primary font-black tabular-nums text-sm">{progress}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full rounded-full gradient-primary transition-[width] duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* step indicators */}
          <div className="space-y-3 mb-8">
            {LOADING_STEPS.map((step, i) => {
              const done = i < activeStep;
              const active = i === activeStep;
              return (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 border ${done ? "bg-primary border-primary" : active ? "bg-primary/20 border-primary/60" : "bg-secondary/30 border-border/40"}`}>
                    {done ? (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    ) : active ? (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30" />
                    )}
                  </div>
                  <span className={`text-sm ${done ? "text-foreground/50 line-through" : active ? "text-foreground font-medium" : "text-foreground/40"}`}>
                    {step}
                  </span>
                </div>
              );
            })}
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

/* ── lean bar helpers ────────────────────────────────────── */

function formatReunionLeanComparison(contactLeanPercent: number): string {
  const c = contactLeanPercent;
  if (c >= 55) return "연락 쪽 무게가 더 실림";
  if (c <= 45) return "기다림 쪽 무게가 더 실림";
  return "거의 중앙—한쪽으로 크게 기울지 않음";
}

const REUNION_LEAN_HINT_BY_CASE: Record<ReunionDemoCase, string> = {
  closed: "지금 네가 먼저 길게 쓰면 읽씹·닫힘 쪽으로 간다.",
  mixed: "무거우면 망하고 짧게만 가야 산다.",
  open: "틈은 있는데 길게 못 박으면 그날로 끝이다.",
};

const LEAN_BAR_MUTED =
  "h-full bg-gradient-to-r from-[hsl(48,36%,24%)] to-[hsl(42,26%,16%)] transition-all";
const LEAN_BAR_VIBRANT =
  "h-full bg-gradient-to-r from-primary to-[hsl(45,65%,48%)] transition-all";

/* ── premium card helpers ────────────────────────────────── */

const PREMIUM_CARD_META: Record<string, { emoji: string; tags: string[] }> = {
  "wait-until": { emoji: "⏳", tags: ["⏰ 타이밍", "🔥 관망 각"] },
  "tone-reply": { emoji: "🎙️", tags: ["💬 톤", "☠️ 망하는 말"] },
  "first-message": { emoji: "✉️", tags: ["💬 첫 문장", "📌 한 줄만"] },
  "reply-style": { emoji: "📬", tags: ["📊 답장 확률", "🧊 피할 톤"] },
  "new-person": { emoji: "🧲", tags: ["🆕 새 인물", "⚖️ 가중치"] },
  misunderstanding: { emoji: "☠️", tags: ["⚠️ 오해 포인트", "🩸 찔림 주의"] },
  "their-trace": { emoji: "🔍", tags: ["👁 흔적", "🚪 안 오는 이유"] },
  "my-destroy": { emoji: "🧨", tags: ["💥 자추 패턴", "⛔ 손대면 망"] },
};

function stripCornerBrackets(text: string): string {
  return text.replace(/【[^】]*】\s*/g, "").trim();
}

function splitLockedBodyToPoints(raw: string): string[] {
  const t = stripCornerBrackets(raw);
  if (!t) return [];
  let chunks = t
    .split(/\n\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (chunks.length === 1 && chunks[0].includes("\n")) {
    const lines = chunks[0]
      .split(/\n/)
      .map((s) => s.trim())
      .filter((s) => s.length > 12);
    if (lines.length >= 2) chunks = lines;
  }
  if (chunks.length >= 2) return chunks.slice(0, 5);
  const one = chunks[0] ?? t;
  const bySentence = one.split(/(?<=[.!?。])\s+/).filter((s) => s.trim().length > 8);
  if (bySentence.length >= 2) return bySentence.slice(0, 4).map((s) => s.trim());
  if (one.length > 220) {
    const mid = Math.floor(one.length / 2);
    const cut = one.lastIndexOf(" ", mid);
    if (cut > 40) return [one.slice(0, cut).trim(), one.slice(cut).trim()];
  }
  return [one];
}

function HighlightedText({ text, className }: { text: string; className?: string }) {
  const out: ReactNode[] = [];
  let last = 0;
  let mi = 0;
  const rx = /(\d+(?:~\d+)?%?|\d+~\d+주|\d+주|\d+개월|\d+대\b)/g;
  let m: RegExpExecArray | null;
  while ((m = rx.exec(text)) !== null) {
    if (m.index > last) out.push(<span key={`t-${mi++}`}>{text.slice(last, m.index)}</span>);
    out.push(
      <strong key={`n-${mi++}`} className="font-black text-[hsl(45,72%,58%)] tabular-nums">
        {m[0]}
      </strong>,
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) out.push(<span key={`t-${mi++}`}>{text.slice(last)}</span>);
  return <span className={className}>{out}</span>;
}

/* ── compact premium card (locked) ───────────────────────── */

const PREMIUM_HOOKS: Record<string, string> = {
  "wait-until": "지금 연락하면 읽씹 각? 아니면 답장 각?",
  "tone-reply": "처음 뭐라고 보내야 안 튕겨?",
  "first-message": "처음 뭐라고 보내야 안 튕겨?",
  "reply-style": "지금 상대가 너 생각하고 있을까?",
  "new-person": "이 조건 맞으면 상대가 먼저 연락 온다",
  misunderstanding: "네가 제일 자주 하는 실수는 이거야",
  "their-trace": "지금 상대가 너 생각하고 있을까?",
  "my-destroy": "네가 제일 자주 하는 실수는 이거야",
};

function CompactPremiumCard({
  card,
  unlocked,
}: {
  card: ReunionPremiumTeaser;
  unlocked: boolean;
}) {
  const meta = PREMIUM_CARD_META[card.key] ?? { emoji: "📌", tags: ["💎 심층"] };
  const hook = PREMIUM_HOOKS[card.key] ?? card.visibleSummary;
  const points = splitLockedBodyToPoints(card.lockedBody);
  const firstMsgData = card.key === "first-message" ? parseFirstMessageData(card.lockedBody) : null;

  if (!unlocked) {
    return (
      <div className="rounded-2xl border border-[hsl(45,40%,25%)]/35 bg-card/40 p-4 max-h-32 overflow-hidden relative">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl leading-none">{meta.emoji}</span>
          <h4 className="text-xs font-black text-foreground leading-snug flex-1">{card.title}</h4>
        </div>
        <p className="text-[11px] text-foreground/60 leading-relaxed mb-2">{hook}</p>
        <div className="absolute inset-x-0 bottom-0 h-14 bg-gradient-to-t from-card/95 to-transparent flex items-end justify-center pb-2">
          <div className="flex items-center gap-1 rounded-full bg-card/90 border border-[hsl(45,40%,28%)]/50 px-2.5 py-1">
            <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
            <span className="text-[9px] font-bold text-[hsl(45,70%,52%)]">잠금</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border-2 border-[hsl(45,50%,40%)]/50 shadow-[0_0_18px_hsl(45,50%,40%,0.12)] bg-gradient-to-br from-[hsl(45,20%,8%)] to-card p-4">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-xl leading-none">{meta.emoji}</span>
        <h4 className="text-xs font-black text-foreground leading-snug flex-1">{card.title}</h4>
        <span className="text-[9px] font-black bg-[hsl(45,70%,55%)]/20 text-[hsl(45,70%,55%)] px-2 py-0.5 rounded-full border border-[hsl(45,40%,30%)]/40">
          UNLOCKED
        </span>
      </div>
      <div className="flex flex-wrap gap-1 mb-3">
        {meta.tags.map((tag) => (
          <span
            key={tag}
            className="text-[9px] font-black px-2 py-0.5 rounded-full bg-[hsl(45,70%,55%)]/15 border border-[hsl(45,40%,28%)]/45 text-[hsl(45,70%,55%)]"
          >
            {tag}
          </span>
        ))}
      </div>

      {/* firstMessage: structured card */}
      {firstMsgData ? (
        <FirstMessageCard data={firstMsgData} />
      ) : (
        <>
          {card.visibleSummary ? (
            <p className="text-xs text-foreground/90 leading-relaxed font-semibold border-l-2 border-[hsl(45,70%,55%)]/50 pl-2.5 mb-3">
              {card.visibleSummary}
            </p>
          ) : null}
          <div className="space-y-2">
            {points.map((para, i) => (
              <div key={i} className="rounded-lg p-2.5 border border-[hsl(45,30%,20%)]/35 bg-[hsl(45,15%,12%)]/55">
                <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide mb-1">포인트 {i + 1}</p>
                <p className="text-[11px] leading-relaxed text-foreground/80">
                  <HighlightedText text={para} />
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── firstMessage structured card ────────────────────────── */

function parseFirstMessageData(raw: string): FirstMessageData | null {
  if (!raw) return null;
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj.recommendedMessage === "string") return obj as FirstMessageData;
  } catch { /* not JSON, plain text fallback */ }
  return null;
}

function FirstMessageCard({ data }: { data: FirstMessageData }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(data.recommendedMessage);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { /* clipboard failed */ }
  };

  return (
    <div className="space-y-4">
      {/* 말풍선 미리보기 */}
      <div className="flex justify-end">
        <div className="relative max-w-[85%]">
          <div
            className="rounded-2xl rounded-tr-sm px-4 py-3 bg-[hsl(45,50%,50%)] text-[hsl(45,10%,10%)] shadow-md cursor-pointer active:scale-[0.98] transition-transform"
            onClick={handleCopy}
          >
            <p className="text-sm font-bold leading-relaxed">{data.recommendedMessage}</p>
          </div>
          <button
            onClick={handleCopy}
            className="mt-1.5 flex items-center gap-1 text-[10px] text-muted-foreground hover:text-foreground transition-colors ml-auto"
          >
            {copied ? (
              <><Check className="w-3 h-3 text-green-400" /><span className="text-green-400">복사됨</span></>
            ) : (
              <><Copy className="w-3 h-3" /><span>탭해서 복사</span></>
            )}
          </button>
        </div>
      </div>

      {/* 왜 이 메시지인가 */}
      {data.messageReasons.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">💡 왜 이 메시지인가</p>
          <div className="space-y-1.5">
            {data.messageReasons.map((reason, i) => (
              <div key={i} className="flex items-start gap-2">
                <Check className="w-3.5 h-3.5 text-green-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-foreground/80 leading-relaxed">{reason}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 절대 보내지 마 */}
      {data.avoidMessages.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">⚠️ 절대 보내지 마</p>
          <div className="space-y-1.5">
            {data.avoidMessages.map((msg, i) => (
              <div key={i} className="flex items-start gap-2 opacity-60">
                <X className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
                <p className="text-[11px] text-foreground/60 leading-relaxed line-through decoration-red-400/40">{msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── main page ───────────────────────────────────────────── */

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
  const [premiumLoading, setPremiumLoading] = useState(false);
  const [premiumCards, setPremiumCards] = useState<ReunionPremiumCards | null>(null);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [pipelineReport, setPipelineReport] = useState<ReunionFullReport | null>(null);
  const [pipelineCase, setPipelineCase] = useState<ReunionDemoCase | null>(null);
  const [igFetchLoading, setIgFetchLoading] = useState(() => demoCase == null);
  const [igFetchError, setIgFetchError] = useState(false);
  const [pairAi, setPairAi] = useState<{
    my: ReunionAccountAiAnalysis | null;
    their: ReunionAccountAiAnalysis | null;
    myPersonaLine: string;
    partnerPersonaLine: string;
    compatibilityType: string;
    compatibilityDesc: string;
    myYearning: number;
    partnerYearning: number;
    reunionComment: string;
    summaryLine: string;
    theirFirstMoveComment: string;
    tensionAxis: string;
    relationshipLoop: string;
    brutalTruth: string;
    loveStyle: { my: string[]; their: string[] };
    recommendLabel: string;
    recommendReasons: Array<{ title: string; body: string }>;
    fromCache: boolean;
  } | null>(null);
  const [pipelineRichSignals, setPipelineRichSignals] = useState<ReunionRichSignals | null>(null);
  const [pairRawData, setPairRawData] = useState<{
    my: ReunionScrapeBundle;
    their: ReunionScrapeBundle;
  } | null>(null);

  /* ── scoring ── */
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

  /* ── IG pipeline ── */
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
        const pairRes = await fetchReunionPairWithAnalysis(myId, theirId, 24, breakupYear, breakupMonth);
        if (cancelled) return;
        if (!pairRes.ok) {
          setPipelineReport(null);
          setPipelineCase(null);
          setPairAi(null);
          setPipelineRichSignals(null);
          setIgFetchError(true);
          return;
        }

        setPairRawData({ my: pairRes.my, their: pairRes.their });
        const { year, month } = clampBreakupToPast(breakupYear, breakupMonth);
        const monthsSince = getMonthsSinceBreakup(year, month);
        const rich = buildReunionRichSignals(pairRes.my, pairRes.their, monthsSince, {
          myPrivatePenalty: Boolean(pairRes.myPrivateWarning || pairRes.my.profile.isPrivate),
          theirPrivatePenalty: Boolean(pairRes.theirPrivateWarning || pairRes.their.profile.isPrivate),
        });
        // AI tensionAxis가 있으면 signals 덮어쓰기
        if (pairRes.tensionAxis) {
          rich.pairSignals.tensionAxis = pairRes.tensionAxis;
        }
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
        // persona가 있으면 reunionJourney 타이틀도 덮어쓰기
        if (pairRes.myPersonaLine) {
          merged.reunionJourney.myTypeName = pairRes.myPersonaLine;
        }
        if (pairRes.partnerPersonaLine) {
          merged.reunionJourney.theirTypeName = pairRes.partnerPersonaLine;
        }
        setPipelineReport(merged);
        setPipelineCase(scored.case);
        setPipelineRichSignals(rich);
        setPairAi({
          my: pairRes.myAi,
          their: pairRes.theirAi,
          myPersonaLine: pairRes.myPersonaLine,
          partnerPersonaLine: pairRes.partnerPersonaLine,
          compatibilityType: pairRes.compatibilityType,
          compatibilityDesc: pairRes.compatibilityDesc,
          myYearning: pairRes.myYearning,
          partnerYearning: pairRes.partnerYearning,
          reunionComment: pairRes.reunionComment,
          summaryLine: pairRes.summaryLine,
          theirFirstMoveComment: pairRes.theirFirstMoveComment,
          tensionAxis: pairRes.tensionAxis,
          relationshipLoop: pairRes.relationshipLoop,
          brutalTruth: pairRes.brutalTruth,
          loveStyle: pairRes.loveStyle,
          recommendLabel: pairRes.recommendLabel,
          recommendReasons: pairRes.recommendReasons,
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
    reunionJourney,
  } = report;

  const displayPremiumTeasers = useMemo(() => {
    if (!premiumCards) return premiumTeasers;
    return premiumTeasers.map((card) => {
      const field = PREMIUM_CARD_KEY_MAP[card.key];
      const aiBody = field ? premiumCards[field] : "";
      if (aiBody) return { ...card, lockedBody: aiBody };
      return card;
    });
  }, [premiumTeasers, premiumCards]);

  const resolvedCase: ReunionDemoCase = demoCase ?? pipelineCase ?? scoringMerge?.case ?? "mixed";
  const caseSource: "demo" | "pipeline" | "scoring" = demoCase
    ? "demo"
    : pipelineReport
      ? "pipeline"
      : "scoring";
  const showIgLoading = !demoCase && igFetchLoading && !pipelineReport && !igFetchError;

  const handlePremiumUnlock = async () => {
    if (premiumLoading) return;

    // demo 모드이거나 raw data 없으면 바로 언락 (하드코딩 fallback)
    if (demoCase || !pairRawData || !pairAi) {
      setPremiumUnlocked(true);
      requestAnimationFrame(() => scrollToId("reunion-premium-cards"));
      return;
    }

    setPremiumLoading(true);
    try {
      console.log("[PREMIUM] calling fetchReunionPremiumCards, pairRawData:", !!pairRawData, "pairAi:", !!pairAi);
      const res = await fetchReunionPremiumCards({
        my: pairRawData.my,
        their: pairRawData.their,
        myAi: pairAi.my,
        theirAi: pairAi.their,
        compatibility: {
          compatibilityType: pairAi.compatibilityType,
          compatibilityDesc: pairAi.compatibilityDesc,
          myYearning: pairAi.myYearning,
          partnerYearning: pairAi.partnerYearning,
          reunionComment: pairAi.reunionComment,
          summaryLine: pairAi.summaryLine,
          theirFirstMoveComment: pairAi.theirFirstMoveComment,
        },
        breakupYear,
        breakupMonth,
      });
      console.log("[PREMIUM] result:", JSON.stringify(res).substring(0, 500));
      if (res.ok) {
        console.log("[PREMIUM] AI cards loaded successfully");
        setPremiumCards(res.cards);
      }
    } catch (err) {
      console.error("[PREMIUM] error:", err);
      // 실패해도 기존 하드코딩 카드로 fallback
    } finally {
      setPremiumLoading(false);
      setPremiumUnlocked(true);
      requestAnimationFrame(() => scrollToId("reunion-premium-cards"));
    }
  };

  useEffect(() => {
    if (premiumUnlocked) {
      setShowStickyBar(false);
      return;
    }
    const onScroll = () => setShowStickyBar((window.scrollY || document.documentElement.scrollTop) > 600);
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
    console.log("[REUNION pairAi]", pairAi);
    console.log("[REUNION myPersonaLine]", pairAi?.myPersonaLine);
    console.log("[REUNION partnerPersonaLine]", pairAi?.partnerPersonaLine);
  }, [caseSource, resolvedCase, scores, decisionHint.contactLeanPercent, pairAi]);

  const recommend = reunionRecommendLabel(scores.reunionPossibility, pairAi?.recommendLabel || undefined);

  /* ── loading screen ── */
  if (showIgLoading) {
    return <ReunionLoadingScreen />;
  }

  /* ════════════════════════════════════════════════════════
     MAIN RESULT
     ════════════════════════════════════════════════════════ */
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/60">
        <Link
          to="/"
          className="flex items-center gap-2 min-w-0 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center shrink-0">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-bold tracking-tight text-foreground leading-tight">HiddenSelf</span>
            <span className="text-[9px] text-muted-foreground font-medium truncate">재회 시그널 리포트</span>
          </div>
        </Link>
        <span className="text-xs text-ai-highlight font-medium bg-ai-highlight/10 border border-ai-highlight/20 px-2.5 py-1 rounded-full truncate max-w-[45%]">
          @{myId}
        </span>
      </header>

      <main className={`flex-1 flex flex-col items-center px-5 pt-6 ${premiumUnlocked ? "pb-24" : "pb-32"}`}>
        <div className="w-full max-w-md space-y-6">

          {/* error banner */}
          {igFetchError && !demoCase && !pipelineReport ? (
            <div className="rounded-xl border border-amber-500/35 bg-amber-500/10 px-4 py-3 text-xs text-foreground/90 leading-relaxed">
              인스타 스크랩에 실패했습니다. 아래는 해시 기반 추정 모드입니다.
            </div>
          ) : null}

          {/* cache notice */}
          {pipelineReport && pairAi?.fromCache ? (
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              동일 조합은 72h 내 캐시를 재사용합니다.
            </p>
          ) : null}

          {/* eyebrow */}
          <div className="text-center">
            <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">
              Instagram Reunion Report
            </p>
            <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
          </div>

          {/* meta badges */}
          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px]">
            <span className="px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground font-medium">
              @{myId}
            </span>
            <span className="text-muted-foreground">×</span>
            <span className="px-2.5 py-1 rounded-full bg-secondary border border-border/50 text-muted-foreground font-medium">
              @{theirId}
            </span>
            <span className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
              헤어진 지 {meta.monthsSinceLabel}
            </span>
          </div>

          {/* ──────────────── 섹션 1: 재회 가능성 히어로 ──────────────── */}
          <section id="reunion-hero" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="1" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">재회 가능성</h2>
                <p className="text-[10px] text-muted-foreground">Reunion Possibility</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border border-primary/15">
              {/* 큰 숫자 히어로 */}
              <p className="text-6xl font-black text-foreground tabular-nums tracking-tighter leading-none mb-1">
                {scores.reunionPossibility}
                <span className="text-3xl align-top text-primary">%</span>
              </p>
              {/* 원형 게이지 바 */}
              <div className="w-full max-w-[200px] mx-auto mt-4 mb-4">
                <div className="h-3 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-700"
                    style={{ width: `${scores.reunionPossibility}%` }}
                  />
                </div>
              </div>
              <HookQuote text={pairAi?.summaryLine || report.summaryLine} />
            </div>
          </section>

          <SectionDivider />

          {/* ──────────────── 섹션 2: 재회 추천도 ──────────────── */}
          <section id="reunion-recommend" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="2" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">재회 추천도</h2>
                <p className="text-[10px] text-muted-foreground">Recommendation</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
              <div className="flex items-center justify-between mb-3">
                <HeartScale score={scores.reunionPossibility} />
                <span className={`text-xs font-black px-3 py-1 rounded-full border ${recommend.color} bg-current/10`}>
                  {recommend.tag}
                </span>
              </div>
              <p className="text-sm font-bold text-foreground/90 leading-relaxed">
                {recommend.line}
              </p>

              {/* 추천 근거 (유료) — BlurGate 통합 */}
              {pairAi?.recommendReasons && pairAi.recommendReasons.length > 0 ? (
                <BlurGate locked={!premiumUnlocked} hint="판단 근거는 심층 분석에서">
                  <div className="mt-4 pt-4 border-t border-border/30">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-3">판단 근거</p>
                    <div className="space-y-2">
                      {pairAi.recommendReasons.map((reason, i) => (
                        <div key={i} className="rounded-lg p-2.5 border border-[hsl(45,30%,20%)]/35 bg-[hsl(45,15%,12%)]/55">
                          <p className="text-[9px] font-bold text-[hsl(45,70%,55%)] uppercase tracking-wide mb-1">
                            근거 {i + 1} · {reason.title}
                          </p>
                          <p className="text-[11px] leading-relaxed text-foreground/80">
                            <HighlightedText text={reason.body} />
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                </BlurGate>
              ) : null}
            </div>

            {/* 궁합 유형 카드 */}
            {pairAi?.compatibilityType ? (
              <div className="mt-3 rounded-2xl p-5 bg-gradient-to-br from-[hsl(280,20%,12%)] to-[hsl(260,15%,8%)] border border-[hsl(280,30%,25%)]/40">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl leading-none">💫</span>
                  <p className="text-base font-black text-foreground leading-snug">{pairAi.compatibilityType}</p>
                </div>
                {pairAi.compatibilityDesc ? (
                  <p className="text-sm text-foreground/70 leading-relaxed">{pairAi.compatibilityDesc}</p>
                ) : null}
              </div>
            ) : null}

            {/* 연애 체질 비교 */}
            {pairAi?.loveStyle && (pairAi.loveStyle.my.length > 0 || pairAi.loveStyle.their.length > 0) ? (
              <div className="mt-3 glass-card rounded-2xl p-5">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">연애 체질 비교</p>
                <div className="flex items-start gap-3">
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-primary uppercase tracking-wider mb-2">나</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {pairAi.loveStyle.my.map((tag, i) => (
                        <span key={`my-ls-${i}`} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                  <span className="text-muted-foreground font-black text-sm pt-5 shrink-0">vs</span>
                  <div className="flex-1 text-center">
                    <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">상대</p>
                    <div className="flex flex-wrap justify-center gap-1.5">
                      {pairAi.loveStyle.their.map((tag, i) => (
                        <span key={`their-ls-${i}`} className="text-xs bg-secondary/60 text-muted-foreground px-3 py-1.5 rounded-full font-semibold border border-border/50">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* 반복되는 악순환 */}
            {pairAi?.relationshipLoop ? (
              <div className="mt-3 glass-card rounded-2xl p-5 border-l-4 border-l-accent">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg leading-none">🔄</span>
                  <p className="text-xs font-bold text-foreground">반복되는 악순환</p>
                </div>
                <p className="text-sm text-foreground/90 leading-relaxed">{pairAi.relationshipLoop}</p>
              </div>
            ) : null}

            {/* 진짜 문제 */}
            {pairAi?.brutalTruth ? (
              <div className="mt-3 glass-card rounded-2xl p-5 border-l-4 border-l-destructive bg-destructive/5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-lg leading-none">💣</span>
                  <p className="text-xs font-bold text-foreground">이 관계의 진짜 문제</p>
                </div>
                <p className="text-sm font-semibold text-foreground leading-relaxed">{pairAi.brutalTruth}</p>
              </div>
            ) : null}
          </section>

          <SectionDivider />

          {/* ──────────────── 섹션 3: 나 / 상대 타입 카드 ──────────────── */}
          <section id="reunion-types" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="3" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">나 vs 상대 타입</h2>
                <p className="text-[10px] text-muted-foreground">Type Analysis</p>
              </div>
            </div>

            {/* 내 타입 */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary mb-3">
              <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider mb-2">나는 어떤 타입인가</p>
              {pairAi?.myPersonaLine ? (
                <p className="text-base font-black text-foreground leading-snug mb-3">
                  {pairAi.myPersonaLine}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3 animate-pulse">분석 중...</p>
              )}
              {pairAi?.my ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pairAi.my.keywords.map((k, i) => (
                    <span
                      key={`my-${i}`}
                      className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : null}
              {/* 미련 수치 */}
              <div className="rounded-xl bg-red-500/5 border border-red-500/15 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-red-400 uppercase tracking-wider">미련 수치</p>
                  <p className="text-xl font-black text-red-400 tabular-nums">{pairAi?.myYearning ?? 65}</p>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-red-500 to-red-400 transition-all duration-700"
                    style={{ width: `${pairAi?.myYearning ?? 65}%` }}
                  />
                </div>
              </div>
            </div>

            {/* 상대 타입 */}
            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-accent mb-3">
              <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2">상대는 어떤 타입인가</p>
              {pairAi?.partnerPersonaLine ? (
                <p className="text-base font-black text-foreground leading-snug mb-3">
                  {pairAi.partnerPersonaLine}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground mb-3 animate-pulse">분석 중...</p>
              )}
              {pairAi?.their ? (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {pairAi.their.keywords.map((k, i) => (
                    <span
                      key={`their-${i}`}
                      className="text-xs bg-secondary/60 text-muted-foreground px-3 py-1.5 rounded-full font-semibold border border-border/50"
                    >
                      {k}
                    </span>
                  ))}
                </div>
              ) : null}
              {/* 미련 수치 */}
              <div className="rounded-xl bg-secondary/30 border border-border/30 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">미련 수치</p>
                  <p className="text-xl font-black text-muted-foreground tabular-nums">{pairAi?.partnerYearning ?? 35}</p>
                </div>
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-zinc-500 to-zinc-400 transition-all duration-700"
                    style={{ width: `${pairAi?.partnerYearning ?? 35}%` }}
                  />
                </div>
              </div>
            </div>
          </section>

          <SectionDivider />

          {/* ──────────────── 섹션 4: 둘 사이 구조 ──────────────── */}
          <section id="reunion-combo" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="4" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">둘 사이 구조</h2>
                <p className="text-[10px] text-muted-foreground">Relationship Structure</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-4 h-4 text-primary" />
                <p className="text-xs font-bold text-foreground">반복되는 패턴</p>
              </div>
              <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                {reunionJourney.comboCardBody.split("\n")[0]}
              </p>
              <BlurGate locked={!premiumUnlocked}>
                <div className="space-y-2 text-sm text-foreground/80 leading-relaxed">
                  {reunionJourney.comboCardBody.split("\n").slice(1).filter(Boolean).map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                  <p className="font-semibold text-foreground/90">{reunionJourney.lockTeaserComboConditions}</p>
                </div>
              </BlurGate>
            </div>
          </section>

          <SectionDivider />

          {/* ──────────────── 섹션 5: 상대 먼저 연락할 확률 ──────────────── */}
          <section id="reunion-reachout" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="5" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">상대가 먼저 연락할 확률</h2>
                <p className="text-[10px] text-muted-foreground">Their First Move</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6 text-center border-l-4 border-l-accent">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                먼저 연락 올 가능성
              </p>
              <p className="text-5xl font-black text-foreground tabular-nums tracking-tighter leading-none mb-1">
                {reachOutForecast.percent}
                <span className="text-2xl align-top text-primary">%</span>
              </p>
              <div className="w-full max-w-[180px] mx-auto mt-3 mb-4">
                <div className="h-2.5 w-full rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full rounded-full gradient-primary transition-all duration-700"
                    style={{ width: `${reachOutForecast.percent}%` }}
                  />
                </div>
              </div>
              <BlurGate locked={!premiumUnlocked} hint="시점·방식은 심층 분석에서">
                <div className="space-y-2 text-xs text-foreground/70 leading-relaxed">
                  {pairAi?.theirFirstMoveComment ? (
                    <p className="font-semibold text-foreground/80">{pairAi.theirFirstMoveComment}</p>
                  ) : (
                    <>
                      <p><span className="text-muted-foreground text-[10px] uppercase tracking-wide">예상 시점:</span> {reachOutForecast.timingBand}</p>
                      <p><span className="text-muted-foreground text-[10px] uppercase tracking-wide">예상 방식:</span> {reachOutForecast.channelPrimary}</p>
                      <p className="font-semibold text-foreground/80">{reachOutForecast.punchLine}</p>
                    </>
                  )}
                </div>
              </BlurGate>
            </div>
          </section>

          <SectionDivider />

          {/* ──────────────── 섹션 6: 먼저 연락할지 말지 ──────────────── */}
          <section id="reunion-decision" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <SectionBadge step="6" />
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">먼저 연락할지 말지</h2>
                <p className="text-[10px] text-muted-foreground">Contact Decision</p>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-5 border-l-4 border-l-primary">
              {/* 게이지 바 */}
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  <span>기다리기</span>
                  <span>연락하기</span>
                </div>
                <div className="relative h-4 w-full rounded-full overflow-hidden flex border border-border/40">
                  <div
                    className={decisionHint.contactLeanPercent >= 50 ? LEAN_BAR_MUTED : LEAN_BAR_VIBRANT}
                    style={{ width: `${100 - decisionHint.contactLeanPercent}%` }}
                  />
                  <div
                    className={decisionHint.contactLeanPercent >= 50 ? LEAN_BAR_VIBRANT : LEAN_BAR_MUTED}
                    style={{ width: `${decisionHint.contactLeanPercent}%` }}
                  />
                </div>
                <p className="text-[10px] text-center text-muted-foreground/70">
                  {formatReunionLeanComparison(decisionHint.contactLeanPercent)}
                </p>
              </div>

              <p className="text-sm text-foreground/90 leading-relaxed mb-3">
                {pairAi?.reunionComment || REUNION_LEAN_HINT_BY_CASE[resolvedCase]}
              </p>

              <BlurGate locked={!premiumUnlocked} hint="판단 근거는 심층 분석에서">
                <div className="space-y-2">
                  <p className="text-sm text-foreground/80 leading-relaxed">{decisionHint.headline}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{decisionHint.hintLine}</p>
                </div>
              </BlurGate>
            </div>
          </section>

          <SectionDivider />

          {/* ──────────────── 유료 섹션 ──────────────── */}
          <section id="reunion-premium" className="scroll-mt-28">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center text-xs font-black text-white shrink-0">P</div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">속내 분석</h2>
                <p className="text-[10px] text-muted-foreground">Premium Deep Analysis</p>
              </div>
              <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold ml-auto">
                <Crown className="w-2.5 h-2.5" /> PREMIUM
              </span>
            </div>

            {/* CTA */}
            <div className="rounded-2xl p-6 bg-gradient-to-br from-[hsl(45,20%,8%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,25%)]/40 text-center mb-5">
              {premiumUnlocked ? (
                <>
                  <Unlock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-3" />
                  <p className="text-base font-black text-foreground mb-2">속내 분석 열림</p>
                  <p className="text-sm text-muted-foreground">아래 카드가 모두 선명하게 보입니다.</p>
                </>
              ) : (
                <>
                  <Lock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-3" />
                  <p className="text-base font-black text-foreground mb-2">{premiumGateCta.title}</p>
                  <p className="text-sm text-muted-foreground mb-5 leading-[1.8] whitespace-pre-line">
                    {premiumGateCta.body}
                  </p>
                  <button
                    id="reunion-unlock-premium-btn"
                    type="button"
                    onClick={handlePremiumUnlock}
                    disabled={premiumLoading}
                    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] relative overflow-hidden group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                    <span className="relative flex items-center justify-center gap-2">
                      {premiumLoading ? (
                        <>
                          <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          분석 생성 중...
                        </>
                      ) : (
                        <>
                          <Crown className="w-4 h-4" />
                          {premiumGateCta.ctaPrimary}
                        </>
                      )}
                    </span>
                  </button>
                  <p className="text-xs text-muted-foreground mt-3 flex flex-wrap items-center justify-center gap-x-2 gap-y-0.5">
                    <span className="line-through tabular-nums opacity-80">{premiumGateCta.stickyListPrice}</span>
                    <span className="font-black text-[hsl(45,72%,58%)] tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                    <span className="text-[10px]">{premiumGateCta.stickySaleNote}</span>
                  </p>
                </>
              )}
            </div>

            {/* premium cards grid */}
            <div id="reunion-premium-cards" className="scroll-mt-28 space-y-3">
              {displayPremiumTeasers.filter((c) => c.key !== "their-trace").map((card) => (
                <CompactPremiumCard key={card.key} card={card} unlocked={premiumUnlocked} />
              ))}
            </div>
          </section>

        </div>
      </main>

      <Footer />

      {/* sticky bottom bar */}
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
                  disabled={premiumLoading}
                  className="shrink-0 h-10 px-3 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-[10px] flex flex-col items-center justify-center gap-0.5 leading-tight active:scale-[0.96] transition-all shadow-md min-w-[4.75rem] disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {premiumLoading ? (
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Crown className="w-3 h-3 shrink-0" />
                      <span className="tabular-nums">{premiumGateCta.stickyPriceLabel}</span>
                    </>
                  )}
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
