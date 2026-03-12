import { useSearchParams, useNavigate } from "react-router-dom";
import { getRandomResult, premiumFeatures } from "@/data/sampleData";
import { Lock, Share2, RotateCcw } from "lucide-react";
import { toast } from "sonner";

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었어요! 친구에게 공유해보세요 ✨");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const handleRetry = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-foreground/80">
          AI 인스타 분석
        </span>
        <span className="text-xs text-muted-foreground">@{id}</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pb-10">
        <div className="w-full max-w-md">
          {/* Result Card */}
          <div className="glass-card rounded-3xl p-6 text-center mb-4">
            <p className="text-xs text-muted-foreground mb-1">당신의 추구미</p>
            <div className="text-4xl mb-3">{result.emoji}</div>
            <h2 className="text-2xl font-bold text-foreground mb-1">
              {result.title}
            </h2>
            <p className="text-xs text-muted-foreground font-medium mb-5">
              {result.subtitle}
            </p>
            <p className="text-sm text-foreground/80 leading-relaxed whitespace-pre-line mb-6">
              {result.description}
            </p>

            {/* Vibe Code Chips */}
            <div className="flex flex-wrap justify-center gap-2">
              {result.vibeCodes.map((code) => (
                <span
                  key={code}
                  className="px-3.5 py-1.5 rounded-full bg-chip text-chip-foreground text-xs font-medium"
                >
                  #{code}
                </span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2.5 mb-8">
            <button
              onClick={handleShare}
              className="flex-1 h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              공유하기
            </button>
            <button
              onClick={handleRetry}
              className="flex-1 h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
            >
              <RotateCcw className="w-4 h-4" />
              다시 분석하기
            </button>
          </div>

          {/* Premium Section */}
          <div className="mb-4">
            <h3 className="text-sm font-semibold text-foreground mb-3">
              🔒 프리미엄 상세 분석
            </h3>
            <div className="space-y-2.5">
              {premiumFeatures.map((feature) => (
                <div
                  key={feature.title}
                  className="glass-card rounded-2xl p-4 flex items-center gap-3 opacity-70"
                >
                  <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center shrink-0">
                    <Lock className="w-4 h-4 text-muted-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-semibold text-foreground">
                      {feature.title}
                    </h4>
                    <p className="text-[11px] text-muted-foreground truncate">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Premium CTA */}
          <button className="w-full h-12 rounded-xl gradient-premium text-premium-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]">
            전체 프리미엄 리포트 보기 · 4,900원
          </button>

          <p className="text-[11px] text-muted-foreground text-center mt-6">
            © 2026 AI 인스타 분석 · 재미로 보는 테스트입니다
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
