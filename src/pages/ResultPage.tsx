import { useSearchParams, useNavigate } from "react-router-dom";
import { getRandomResult, getVibeAnalysis, getAdditionalTypes, getWarningType, getUserVibeType, getAiConfidence } from "@/data/sampleData";
import { Share2, RotateCcw, Download, LinkIcon, Lock, Heart, Camera, Palette, Waves, MessageCircle, AlertTriangle, ThumbsUp, ThumbsDown, Sparkles, HeartHandshake, Crown, ShieldCheck, Flame, TrendingUp, Eye, Clock } from "lucide-react";
import { toast } from "sonner";
import { useRef, useCallback, useMemo, useState } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";

const lockedItems = [
  "이 남자가 당신에게 빠지는 이유",
  "연애 시작 패턴",
  "당신에게 집착할 확률",
  "연애 지속 가능성",
  "숨겨진 매력 분석",
  "추가 남자 유형 분석",
];

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);
  const vibe = getVibeAnalysis(id);
  const userVibe = getUserVibeType(id);
  const additionalTypes = useMemo(() => getAdditionalTypes(result.id), [result.id]);
  const warningType = useMemo(() => getWarningType(result.id), [result.id]);
  const confidence = getAiConfidence(id);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const relationshipScore = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) % 41;
    return 38 + (Math.abs(h) % 41);
  }, [id]);

  const handleUnlockPremium = () => {
    setPremiumUnlocked(true);
    setTimeout(() => {
      premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었어요! 친구에게 공유해보세요 ✨");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const handleShareSNS = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `나에게 꼬이는 남자 유형: ${result.title}`,
          text: `내 인스타로 분석한 꼬이는 남자 유형은 "${result.title}" 이래! 너도 해봐 ✨`,
          url: window.location.href,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = useCallback(async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#faf9f7",
      });
      const link = document.createElement("a");
      link.download = `꼬이는남자유형-${result.title}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("이미지가 저장되었어요! 📸");
    } catch {
      toast.error("이미지 저장에 실패했어요");
    }
  }, [result.title]);

  const vibeCards = [
    { icon: Camera, label: "사진 분위기", value: vibe.photoMood },
    { icon: Palette, label: "색감 톤", value: vibe.colorTone },
    { icon: Waves, label: "전체 vibe", value: vibe.vibeKeyword },
    { icon: MessageCircle, label: "캡션 스타일", value: vibe.captionStyle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-primary" fill="hsl(340 40% 72%)" />
          <span className="text-sm font-semibold tracking-tight text-foreground/80">
            꼬이는 남자 유형 테스트
          </span>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          @{id}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-10">
        <div className="w-full max-w-md">

          {/* ====== BASIC SECTION ====== */}

          {/* 1. User Vibe Type */}
          <div className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${userVibe.gradientClass} border border-border/30 shadow-sm`}>
            <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-3">
              당신의 인스타 vibe 유형
            </p>
            <div className="text-4xl mb-3">{userVibe.emoji}</div>
            <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">
              {userVibe.title}
            </h2>
            <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
              {userVibe.description}
            </p>
          </div>

          {/* 2. AI Vibe Analysis Cards */}
          <div className="mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              🔍 AI가 분석한 당신의 인스타 vibe
            </h3>
            <div className="grid grid-cols-2 gap-2.5">
              {vibeCards.map((card) => (
                <div key={card.label} className="glass-card rounded-2xl p-4 text-center">
                  <card.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-sm font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* 3. Main Result */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium text-center mb-4">
            당신에게 꼬이는 남자 유형
          </p>

          <div className={`rounded-3xl p-8 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30 shadow-sm`}>
            <div className="text-7xl mb-4">{result.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
              {result.title}
            </h2>
            <p className="text-xs text-muted-foreground font-medium tracking-wide mb-5">
              {result.subtitle}
            </p>
            <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
              {result.description}
            </p>
          </div>

          {/* AI Summary */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-primary" />
              AI 분석 요약
            </h3>
            <p className="text-sm text-foreground/80 leading-[1.9]">
              {result.aiSummary}
            </p>
          </div>

          {/* Attraction Stats */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              💓 매력 지표
            </h3>
            <div className="space-y-3.5">
              {result.attractionStats.map((stat) => (
                <div key={stat.label}>
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-xs font-medium text-foreground">{stat.label}</span>
                    <span className="text-xs font-bold text-primary">{stat.value}%</span>
                  </div>
                  <Progress value={stat.value} className="h-2.5 rounded-full" />
                </div>
              ))}
            </div>
          </div>

          {/* Why This Type */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              💫 왜 이런 남자가 꼬이는지
            </h3>
            <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
              {result.whyAttracted}
            </p>
          </div>

          {/* Dating Pattern */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              💕 이 남자의 연애 패턴
            </h3>
            <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
              {result.datingPattern}
            </p>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground">장점</h4>
              </div>
              <ul className="space-y-2">
                {result.pros.map((p) => (
                  <li key={p} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                    <span className="text-primary mt-0.5">•</span>
                    {p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <ThumbsDown className="w-3.5 h-3.5 text-muted-foreground" />
                <h4 className="text-xs font-semibold text-foreground">단점</h4>
              </div>
              <ul className="space-y-2">
                {result.cons.map((c) => (
                  <li key={c} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                    <span className="text-muted-foreground mt-0.5">•</span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Additional Types */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              💕 추가로 꼬이는 남자 유형
            </h3>
            <div className="space-y-2.5">
              {additionalTypes.map((t) => (
                <div
                  key={t.id}
                  className={`glass-card rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-br ${t.gradientClass}`}
                >
                  <div className="text-3xl shrink-0">{t.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                      {t.oneLiner}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Type */}
          <div className="mb-8">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              당신이 조심해야 할 남자 유형
            </h3>
            <div className="rounded-2xl p-5 border-2 border-destructive/20 bg-destructive/5">
              <div className="flex items-center gap-3.5">
                <div className="text-3xl shrink-0">{warningType.emoji}</div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-semibold text-foreground">{warningType.title}</h4>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                    {warningType.oneLiner}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {warningType.cons.map((c) => (
                      <span
                        key={c}
                        className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ====== PREMIUM DIVIDER ====== */}
          {!premiumUnlocked ? (
            <div className="mb-8">
              {/* Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-dashed border-[hsl(45,60%,70%)]" />
                </div>
                <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white px-4 py-2 rounded-full shadow-lg">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">PREMIUM</span>
                </div>
              </div>

              {/* Locked cards */}
              <div className="space-y-2.5 mb-4">
                {lockedItems.map((item) => (
                  <div
                    key={item}
                    className="glass-card rounded-2xl p-4 flex items-center justify-between opacity-60"
                  >
                    <span className="text-sm text-foreground/50">{item}</span>
                    <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                  </div>
                ))}
              </div>

              <button
                onClick={handleUnlockPremium}
                className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-semibold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98]"
              >
                🔓 전체 분석 보기 · 4,900원
              </button>
            </div>
          ) : (
            /* ====== PREMIUM CONTENT (Unlocked) ====== */
            <div ref={premiumRef}>
              {/* Premium Divider */}
              <div className="relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t-2 border-[hsl(45,60%,70%)]" />
                </div>
                <div className="relative inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white px-4 py-2 rounded-full shadow-lg">
                  <Crown className="w-3.5 h-3.5" />
                  <span className="text-xs font-bold tracking-wide">PREMIUM ANALYSIS</span>
                </div>
              </div>

              {/* AI Confidence */}
              <div className="glass-card rounded-2xl p-4 mb-5 flex items-center gap-3 border border-[hsl(45,60%,80%)]/40">
                <ShieldCheck className="w-8 h-8 text-[hsl(45,70%,50%)] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                    <span className="text-sm font-bold text-[hsl(45,70%,45%)]">{confidence}%</span>
                  </div>
                  <Progress value={confidence} className="h-2 rounded-full" />
                  <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                    AI는 인스타 vibe, 사진 스타일, 캡션 감성을 종합 분석하여 결과를 도출했습니다.
                  </p>
                </div>
              </div>

              {/* Fall Reasons */}
              <div className="glass-card rounded-2xl p-5 mb-5 border border-[hsl(45,60%,80%)]/30">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  이 남자가 당신에게 빠지는 이유
                </h3>
                <ul className="space-y-2.5">
                  {result.fallReasons.map((reason) => (
                    <li key={reason} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-[hsl(45,70%,50%)] mt-0.5 shrink-0">•</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dating Start Pattern */}
              <div className="glass-card rounded-2xl p-5 mb-5 border border-[hsl(45,60%,80%)]/30">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  연애 시작 패턴
                </h3>
                <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                  {result.datingPattern}
                </p>
              </div>

              {/* Obsession Rate */}
              <div className="glass-card rounded-2xl p-5 mb-5 border border-[hsl(45,60%,80%)]/30">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  당신에게 집착할 확률
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <Progress value={result.obsessionRate} className="h-3.5 rounded-full" />
                  </div>
                  <span className="text-2xl font-bold text-[hsl(45,70%,45%)]">{result.obsessionRate}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {result.obsessionRate >= 80
                    ? "이 유형은 한번 빠지면 강하게 집착하는 경향이 있습니다. 당신에 대한 관심이 빠르게 깊어질 수 있어요."
                    : result.obsessionRate >= 60
                    ? "적당한 수준의 집착을 보이며, 관심은 있지만 적절한 거리를 유지하려 합니다."
                    : "이 유형은 자유를 중시하여 과도한 집착은 보이지 않지만, 관심이 있을 때는 확실하게 표현합니다."}
                </p>
              </div>

              {/* Relationship Duration */}
              <div className="glass-card rounded-2xl p-5 mb-5 border border-[hsl(45,60%,80%)]/30">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  연애 지속 가능성
                </h3>
                <div className="flex items-center gap-3 mb-2">
                  <div className="flex-1">
                    <Progress value={relationshipScore} className="h-3.5 rounded-full" />
                  </div>
                  <span className="text-2xl font-bold text-[hsl(45,70%,45%)]">{relationshipScore}%</span>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {relationshipScore >= 65
                    ? "이 유형과의 관계는 안정적으로 유지될 가능성이 높습니다. 서로의 가치관이 맞을수록 장기적인 관계로 발전할 수 있어요."
                    : relationshipScore >= 50
                    ? "초반 매력은 강하지만 장기적 안정성은 노력이 필요합니다. 서로의 차이를 이해하려는 노력이 중요해요."
                    : "초반 매력은 강하지만 장기 안정성은 낮은 경우가 많습니다. 감정적 롤러코스터에 주의가 필요해요."}
                </p>
              </div>

              {/* Hidden Charm */}
              <div className="glass-card rounded-2xl p-5 mb-5 border border-[hsl(45,60%,80%)]/30">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  숨겨진 매력 분석
                </h3>
                <p className="text-sm text-foreground/80 leading-[1.9]">
                  당신의 인스타 vibe에는 <strong className="text-foreground">{vibe.photoMood}</strong> 분위기와{" "}
                  <strong className="text-foreground">{vibe.vibeKeyword}</strong> 매력이 함께 있습니다.
                  이 조합은 <strong className="text-foreground">{result.title}</strong> 타입의 남자들에게
                  특히 매력적으로 작용합니다.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-[hsl(45,60%,90%)]/50 border border-[hsl(45,60%,80%)]/30">
                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    💡 <strong className="text-foreground">AI 인사이트:</strong> {userVibe.title}인 당신은
                    겉으로 드러나는 매력 외에도 내면에서 풍기는 안정감과 깊이가 있어요.
                    이 숨겨진 매력이 상대방이 점점 더 빠져드는 핵심 원인입니다.
                  </p>
                </div>
              </div>

              {/* Premium Additional Types */}
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  추가 남자 유형 심층 분석
                </h3>
                <div className="space-y-2.5">
                  {additionalTypes.map((t) => (
                    <div
                      key={t.id}
                      className={`glass-card rounded-2xl p-4 border border-[hsl(45,60%,80%)]/30 bg-gradient-to-br ${t.gradientClass}`}
                    >
                      <div className="flex items-center gap-3.5 mb-2">
                        <div className="text-3xl shrink-0">{t.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {t.oneLiner}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground/70 leading-relaxed pl-[3.25rem]">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* End of Premium */}
              <div className="flex items-center justify-center gap-2 mb-6 text-[10px] text-muted-foreground">
                <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                <span>Premium 분석 끝</span>
                <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
              </div>
            </div>
          )}

          {/* ====== SHARE & ACTIONS ====== */}

          {/* Share Card */}
          <div
            ref={shareCardRef}
            className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30`}
          >
            {premiumUnlocked && (
              <div className="inline-flex items-center gap-1.5 bg-[hsl(45,80%,60%)]/20 rounded-full px-3 py-1 mb-3">
                <Crown className="w-3 h-3 text-[hsl(45,80%,45%)]" />
                <span className="text-[10px] font-bold text-[hsl(45,80%,35%)]">PREMIUM</span>
              </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
              내 인스타로 본
            </p>
            <p className="text-[11px] text-muted-foreground mb-4">나에게 꼬이는 남자 유형</p>
            <div className="text-5xl mb-3">{result.emoji}</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
              {result.title}
            </h3>
            <div className="inline-flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30">
              <span className="text-xs font-semibold text-foreground">나도 테스트하기 →</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <button
              onClick={handleCopyLink}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <LinkIcon className="w-4 h-4" />
              링크 복사
            </button>
            <button
              onClick={handleShareSNS}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              SNS 공유
            </button>
            <button
              onClick={handleDownload}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <Download className="w-4 h-4" />
              이미지 저장
            </button>
          </div>
          <button
            onClick={() => navigate("/")}
            className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-10"
          >
            <RotateCcw className="w-4 h-4" />
            다시 테스트하기
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            © 2026 꼬이는 남자 유형 테스트 · 재미로 보는 테스트입니다
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
