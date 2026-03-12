import { useSearchParams, useNavigate } from "react-router-dom";
import { getRandomResult, premiumFeatures } from "@/data/sampleData";
import { Lock, Share2, RotateCcw, Download, LinkIcon } from "lucide-react";
import { toast } from "sonner";
import { useRef } from "react";

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);
  const resultCardRef = useRef<HTMLDivElement>(null);

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
          title: `나의 추구미: ${result.title}`,
          text: `AI가 분석한 나의 인스타 추구미는 "${result.title}" 이에요! 당신도 확인해보세요 ✨`,
          url: window.location.href,
        });
      } catch {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = () => {
    toast.success("결과 이미지 저장 기능은 곧 제공될 예정이에요 📸");
  };

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50">
        <span className="text-sm font-semibold tracking-tight text-foreground/80">
          AI 인스타 분석
        </span>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          @{id}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-10">
        <div className="w-full max-w-md">

          {/* Main Result Card */}
          <div
            ref={resultCardRef}
            className={`rounded-3xl p-7 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30 shadow-sm`}
          >
            <p className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium mb-4">
              당신의 추구미
            </p>
            <div className="text-5xl mb-4">{result.emoji}</div>
            <h2 className="text-3xl font-bold text-foreground mb-1.5 tracking-tight">
              {result.title}
            </h2>
            <p className="text-xs text-muted-foreground font-medium tracking-wide mb-6">
              {result.subtitle}
            </p>

            {/* Vibe Code Chips */}
            <div className="flex flex-wrap justify-center gap-2 mb-6">
              {result.vibeCodes.map((code) => (
                <span
                  key={code}
                  className="px-4 py-2 rounded-full bg-card/70 backdrop-blur-sm text-chip-foreground text-xs font-semibold border border-border/40 shadow-sm"
                >
                  {code}
                </span>
              ))}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              {result.stats.map((stat) => (
                <div key={stat.label} className="bg-card/60 backdrop-blur-sm rounded-2xl py-3 px-2 border border-border/30">
                  <p className="text-[10px] text-muted-foreground mb-0.5">{stat.label}</p>
                  <p className="text-sm font-bold text-foreground">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Description Card */}
          <div className="glass-card rounded-2xl p-5 mb-5">
            <p className="text-sm text-foreground/90 leading-[1.8] whitespace-pre-line mb-4">
              {result.description}
            </p>
            <div className="w-10 h-px bg-border mx-auto mb-4" />
            <p className="text-[13px] text-muted-foreground leading-[1.9]">
              {result.detailParagraph}
            </p>
          </div>

          {/* Share & Action Buttons */}
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
            onClick={handleRetry}
            className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-8"
          >
            <RotateCcw className="w-4 h-4" />
            다시 분석하기
          </button>

          {/* Premium Section */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-5 h-5 rounded-full bg-accent flex items-center justify-center">
                <Lock className="w-3 h-3 text-accent-foreground" />
              </div>
              <h3 className="text-sm font-bold text-foreground">프리미엄 상세 분석</h3>
            </div>
            <div className="space-y-2.5">
              {premiumFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3.5 relative overflow-hidden"
                >
                  {/* Blur overlay */}
                  <div className="absolute inset-0 bg-card/40 backdrop-blur-[2px] z-10 rounded-2xl" />

                  <div className="w-10 h-10 rounded-xl bg-accent/60 flex items-center justify-center shrink-0 relative z-0">
                    <span className="text-lg">{feature.emoji}</span>
                  </div>
                  <div className="flex-1 min-w-0 relative z-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>

                  {/* Lock badge */}
                  <div className="absolute top-3 right-3 z-20">
                    <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="w-3 h-3 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium CTA */}
          <button className="w-full h-14 rounded-2xl gradient-premium text-premium-foreground font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] mb-2">
            전체 프리미엄 리포트 보기 · ₩4,900
          </button>
          <p className="text-[10px] text-muted-foreground text-center mb-8">
            결제 후 즉시 전체 결과를 확인할 수 있어요
          </p>

          <p className="text-[11px] text-muted-foreground text-center">
            © 2026 AI 인스타 분석 · 재미로 보는 테스트입니다
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
