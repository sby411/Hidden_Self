import { useSearchParams, useNavigate } from "react-router-dom";
import {
  getRandomResult,
  getAdditionalTypes,
  getWarningType,
  getAiConfidence,
  getUserVibeType,
  getVibeAnalysis,
} from "@/data/sampleData";
import {
  Share2,
  RotateCcw,
  Download,
  LinkIcon,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Heart,
  ShieldCheck,
  ArrowLeft,
  Crown,
  Sparkles,
  TrendingUp,
  HeartHandshake,
  Flame,
  Clock,
  Eye,
} from "lucide-react";
import { toast } from "sonner";
import React, { useRef, useCallback, useMemo } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";

const PremiumPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);
  const userVibe = getUserVibeType(id);
  const vibe = getVibeAnalysis(id);
  const additionalTypes = useMemo(() => getAdditionalTypes(result.id), [result.id]);
  const warningType = useMemo(() => getWarningType(result.id), [result.id]);
  const confidence = getAiConfidence(id);
  const shareCardRef = useRef<HTMLDivElement>(null);

  // Generate a deterministic "relationship duration" score
  const relationshipScore = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) % 41;
    return 38 + (Math.abs(h) % 41); // 38~78
  }, [id]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었어요! ✨");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const isSharing = React.useRef(false);
  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;
    try {
      if (navigator.share) {
        await navigator.share({
          title: "InstAI | 내 인스타로 보는 꼬이는 남자 유형",
          text: `내 인스타 vibe로 보니 나한테 꼬이는 유형은 '${result.title}'이래. 너도 해봐!`,
          url: window.location.href,
        });
        toast.success("공유창이 열렸어요");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("공유를 지원하지 않아 링크를 복사했어요");
      }
    } catch { /* user cancelled */ }
    finally { isSharing.current = false; }
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
      link.download = `꼬이는남자유형-프리미엄-${result.title}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("이미지가 저장되었어요! 📸");
    } catch {
      toast.error("이미지 저장에 실패했어요");
    }
  }, [result.title]);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50">
        <button
          onClick={() => navigate(`/result?id=${encodeURIComponent(id)}`)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          무료 결과로 돌아가기
        </button>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          @{id}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-10">
        <div className="w-full max-w-md">

          {/* Premium Badge */}
          <div className="flex justify-center mb-5">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white px-5 py-2.5 rounded-full shadow-lg">
              <Crown className="w-4 h-4" />
              <span className="text-sm font-bold tracking-wide">Premium Analysis</span>
            </div>
          </div>

          {/* AI Confidence */}
          <div className="glass-card rounded-2xl p-4 mb-5 flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-primary shrink-0" />
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                <span className="text-sm font-bold text-primary">{confidence}%</span>
              </div>
              <Progress value={confidence} className="h-2 rounded-full" />
              <p className="text-[10px] text-muted-foreground mt-1.5 leading-relaxed">
                AI는 인스타 vibe, 사진 스타일, 캡션 감성을 종합 분석하여 결과를 도출했습니다.
              </p>
            </div>
          </div>

          {/* Main Result */}
          <div className={`rounded-3xl p-7 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30 shadow-sm`}>
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-3">
              당신에게 꼬이는 남자 유형
            </p>
            <div className="text-6xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground mb-1 tracking-tight">
              {result.title}
            </h2>
            <p className="text-xs text-muted-foreground font-medium tracking-wide">
              {result.subtitle}
            </p>
          </div>

          {/* Fall Reasons */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <HeartHandshake className="w-4 h-4 text-primary" />
              이 남자가 당신에게 빠지는 이유
            </h3>
            <ul className="space-y-2.5">
              {result.fallReasons.map((reason) => (
                <li key={reason} className="text-sm text-foreground/80 flex items-start gap-2">
                  <span className="text-primary mt-0.5 shrink-0">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          </div>

          {/* Dating Pattern */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-primary" />
              연애 시작 패턴
            </h3>
            <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
              {result.datingPattern}
            </p>
          </div>

          {/* Obsession Rate */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-primary" />
              당신에게 집착할 확률
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1">
                <Progress value={result.obsessionRate} className="h-3.5 rounded-full" />
              </div>
              <span className="text-2xl font-bold text-primary">{result.obsessionRate}%</span>
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
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-primary" />
              연애 지속 가능성
            </h3>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex-1">
                <Progress value={relationshipScore} className="h-3.5 rounded-full" />
              </div>
              <span className="text-2xl font-bold text-primary">{relationshipScore}%</span>
            </div>
            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {relationshipScore >= 65
                ? "이 유형과의 관계는 안정적으로 유지될 가능성이 높습니다. 서로의 가치관이 맞을수록 장기적인 관계로 발전할 수 있어요."
                : relationshipScore >= 50
                ? "초반 매력은 강하지만 장기적 안정성은 노력이 필요합니다. 서로의 차이를 이해하려는 노력이 중요해요."
                : "이 유형과의 관계는 초반 매력은 강하지만 장기 안정성은 낮은 경우가 많습니다. 감정적 롤러코스터에 주의가 필요해요."}
            </p>
          </div>

          {/* Hidden Charm Analysis */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              <Eye className="w-4 h-4 text-primary" />
              숨겨진 매력 분석
            </h3>
            <p className="text-sm text-foreground/80 leading-[1.9]">
              당신의 인스타 vibe에는 <strong className="text-foreground">{vibe.photoMood}</strong> 분위기와{" "}
              <strong className="text-foreground">{vibe.vibeKeyword}</strong> 매력이 함께 있습니다.
              이 조합은 <strong className="text-foreground">{result.title}</strong> 타입의 남자들에게
              특히 매력적으로 작용합니다.
            </p>
            <div className="mt-3 p-3 rounded-xl bg-primary/5 border border-primary/10">
              <p className="text-[11px] text-foreground/70 leading-relaxed">
                💡 <strong className="text-foreground">AI 인사이트:</strong> {userVibe.title}인 당신은
                겉으로 드러나는 매력 외에도 내면에서 풍기는 안정감과 깊이가 있어요.
                이 숨겨진 매력이 상대방이 점점 더 빠져드는 핵심 원인입니다.
              </p>
            </div>
          </div>

          {/* Pros & Cons */}
          <div className="grid grid-cols-2 gap-3 mb-5">
            <div className="glass-card rounded-2xl p-4">
              <div className="flex items-center gap-1.5 mb-3">
                <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                <h4 className="text-xs font-semibold text-foreground">장점</h4>
              </div>
              <ul className="space-y-1.5">
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
              <ul className="space-y-1.5">
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
              <Sparkles className="w-4 h-4 text-primary" />
              추가 남자 유형 분석
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
          <div className="mb-5">
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

          {/* Share Card */}
          <div
            ref={shareCardRef}
            className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30`}
          >
            <div className="inline-flex items-center gap-1.5 bg-[hsl(45,80%,60%)]/20 rounded-full px-3 py-1 mb-3">
              <Crown className="w-3 h-3 text-[hsl(45,80%,45%)]" />
              <span className="text-[10px] font-bold text-[hsl(45,80%,35%)]">PREMIUM</span>
            </div>
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
              onClick={handleShare}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              공유
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

export default PremiumPage;
