import { useSearchParams, useNavigate } from "react-router-dom";
import { getRandomResult, getVibeAnalysis } from "@/data/sampleData";
import { Share2, RotateCcw, Download, LinkIcon, Lock, Heart, Camera, Palette, Waves, MessageCircle } from "lucide-react";
import { toast } from "sonner";
import { useRef, useCallback } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";

const lockedItems = [
  "이 남자 유형의 진짜 속마음",
  "당신에게 빠지는 이유",
  "연애 시작 패턴",
  "장점 & 단점 분석",
  "당신에게 집착할 확률",
  "추가로 끌리는 남자 유형 3개",
  "당신이 조심해야 할 남자 유형",
];

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);
  const vibe = getVibeAnalysis(id);
  const shareCardRef = useRef<HTMLDivElement>(null);

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
    { icon: Waves, label: "인스타 vibe", value: vibe.vibeKeyword },
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

          {/* Section label */}
          <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium text-center mb-5">
            당신에게 꼬이는 남자 유형
          </p>

          {/* Main Result Card */}
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

          {/* Vibe Analysis Cards */}
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

          {/* Premium Locked Section */}
          <div className="mb-5">
            <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
              🔒 프리미엄 상세 분석
            </h3>
            <div className="space-y-2.5">
              {lockedItems.map((item) => (
                <div
                  key={item}
                  className="glass-card rounded-2xl p-4 flex items-center justify-between"
                >
                  <span className="text-sm text-foreground/60">{item}</span>
                  <Lock className="w-4 h-4 text-muted-foreground shrink-0" />
                </div>
              ))}
            </div>

            <button
              onClick={() =>
                navigate(`/premium?id=${encodeURIComponent(id)}`)
              }
              className="w-full h-12 rounded-xl gradient-premium text-foreground font-semibold text-sm mt-4 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
            >
              전체 분석 보기 · 4,900원
            </button>
          </div>

          {/* Share Card (for download) */}
          <div
            ref={shareCardRef}
            className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30`}
          >
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
