import { useEffect, useState, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Scan, Eye, Heart, MessageCircle, TrendingUp, Shield } from "lucide-react";

const loadingSteps = [
  { text: "프로필 데이터 수집 중...", icon: Scan },
  { text: "피드 스타일 분석 중...", icon: Eye },
  { text: "매력 시그널 감지 중...", icon: Heart },
  { text: "관계 패턴 추출 중...", icon: MessageCircle },
  { text: "최종 리포트 생성 중...", icon: TrendingUp },
];

const aiInsights = [
  "너의 피드에서 반복되는 감정 패턴이 감지됐어",
  "남자들이 느끼는 첫 인상을 계산 중이야…",
  "이 결과 보고 좀 불편할 수도 있어",
  "비슷한 연애 패턴이 발견됐어…",
  "왜 특정 유형의 남자가 꼬이는지 분석 중…",
  "너도 모르게 보내고 있는 시그널이 있어",
  "데이터가 말해주는 건 꽤 직접적이야",
  "솔직히 이건 좀 충격일 수도 있어",
  "남자들이 느끼는 접근 난이도를 측정 중이야…",
  "피드 색감에서 성격 패턴을 읽는 중…",
  "비슷한 계정 10,000개와 비교 분석 중…",
  "숨겨진 매력 포인트를 발견한 것 같아",
];

const funFacts = [
  "📊 인스타 피드만으로도 연애 스타일의 73%를 예측할 수 있어요",
  "💡 프로필 사진의 각도가 첫인상의 60%를 결정해요",
  "🔍 해시태그 패턴으로 관심사의 방향성이 드러나요",
  "❤️ 좋아요 패턴은 무의식적 선호를 반영해요",
  "📸 게시물 간격이 성격의 일관성을 보여줘요",
  "✨ 필터 선택도 감성 유형의 단서가 돼요",
];

const TOTAL_BLOCKS = 20;

const LoadingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [blockProgress, setBlockProgress] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [factIndex, setFactIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const [percentText, setPercentText] = useState(0);
  const [dots, setDots] = useState("");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";
  const startTime = useRef(Date.now());

  useEffect(() => {
    // Animated dots
    const dotInterval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? "" : prev + ".");
    }, 400);

    // Steps progress - spread across ~25 seconds
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 5000);

    // Block progress - smooth fill over ~25 seconds
    const blockInterval = setInterval(() => {
      setBlockProgress((prev) => {
        if (prev < TOTAL_BLOCKS) return prev + 1;
        return prev;
      });
    }, 1300);

    // Percentage counter
    const percentInterval = setInterval(() => {
      const elapsed = Date.now() - startTime.current;
      const targetPercent = Math.min(95, Math.floor((elapsed / 28000) * 100));
      setPercentText(targetPercent);
    }, 200);

    // Rotate AI insights
    const insightInterval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % aiInsights.length);
    }, 2500);

    // Rotate fun facts
    const factInterval = setInterval(() => {
      setFactIndex((prev) => (prev + 1) % funFacts.length);
    }, 4000);

    // Show complete state at ~28 seconds
    const completeTimer = setTimeout(() => {
      setShowComplete(true);
      setPercentText(100);
      setBlockProgress(TOTAL_BLOCKS);
      setCurrentStep(loadingSteps.length - 1);
    }, 28000);

    // Navigate to result at ~30 seconds
    const timer = setTimeout(() => {
      navigate(`/result?id=${encodeURIComponent(id)}`, { replace: true });
    }, 30000);

    return () => {
      clearInterval(dotInterval);
      clearInterval(stepInterval);
      clearInterval(blockInterval);
      clearInterval(percentInterval);
      clearInterval(insightInterval);
      clearInterval(factInterval);
      clearTimeout(completeTimer);
      clearTimeout(timer);
    };
  }, [navigate, id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      <div className="absolute inset-0 pixel-grid opacity-40" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Scan icon with pulse */}
        <div className="relative w-20 h-20 mb-6 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl gradient-ai opacity-20 animate-scan-pulse" />
          <div className="absolute inset-[-4px] rounded-2xl border-2 border-ai-highlight/30 animate-ping" style={{ animationDuration: '2s' }} />
          <div className="w-14 h-14 rounded-xl gradient-ai flex items-center justify-center glow-accent">
            <Scan className="w-7 h-7 text-white animate-scan-pulse" />
          </div>
        </div>

        {/* Username being scanned */}
        <p className="text-sm font-bold text-foreground mb-1 flex items-center gap-1.5">
          <span className="text-ai-highlight">@{id}</span> 분석 중{dots}
        </p>

        {/* Percentage */}
        <p className="text-3xl font-black text-foreground mb-6 tabular-nums">
          {percentText}%
        </p>

        {/* Block progress bar */}
        <div className="w-full mb-6">
          <div className="flex gap-1 h-3 w-full">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-500"
                style={{
                  backgroundColor: i < blockProgress
                    ? `hsl(${270 + (i * 3)} 70% ${55 + (i % 3) * 5}%)`
                    : 'hsl(var(--secondary))',
                  opacity: i < blockProgress ? 1 : 0.2,
                  transform: i < blockProgress ? 'scaleY(1)' : 'scaleY(0.7)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Steps */}
        <div className="space-y-2.5 w-full mb-6">
          {loadingSteps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div
                key={step.text}
                className={`flex items-center gap-3 transition-all duration-500 ${
                  i <= currentStep
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-2"
                }`}
              >
                <div className={`w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-all ${
                  i < currentStep
                    ? "bg-ai-highlight text-white"
                    : i === currentStep
                    ? "border-2 border-ai-highlight animate-scan-pulse"
                    : "border border-border"
                }`}>
                  {i < currentStep && <Check className="w-3.5 h-3.5" />}
                  {i === currentStep && <Icon className="w-3 h-3 text-ai-highlight" />}
                </div>
                <span className={`text-sm ${
                  i === currentStep ? "font-semibold text-foreground" : 
                  i < currentStep ? "text-muted-foreground line-through" : "text-muted-foreground"
                }`}>
                  {step.text}
                </span>
              </div>
            );
          })}
        </div>

        {/* AI Insight bubble */}
        <div className="w-full rounded-xl border border-border/50 bg-secondary/30 p-4 mb-4 min-h-[60px] flex items-center justify-center">
          {showComplete ? (
            <div className="animate-in fade-in duration-500 text-center">
              <p className="text-sm font-bold text-foreground">✅ 분석 완료!</p>
              <p className="text-[11px] text-muted-foreground mt-1">결과를 정리하고 있어요...</p>
            </div>
          ) : (
            <p
              key={insightIndex}
              className="text-sm text-muted-foreground text-center animate-in fade-in slide-in-from-bottom-2 duration-500"
            >
              💬 "{aiInsights[insightIndex]}"
            </p>
          )}
        </div>

        {/* Fun fact */}
        {!showComplete && (
          <div className="w-full text-center min-h-[24px]">
            <p
              key={factIndex}
              className="text-[11px] text-muted-foreground/70 animate-in fade-in duration-700"
            >
              {funFacts[factIndex]}
            </p>
          </div>
        )}

        {/* Security badge */}
        <div className="mt-6 flex items-center gap-1.5 text-[10px] text-muted-foreground/60">
          <Shield className="w-3 h-3" />
          데이터는 분석 후 즉시 삭제됩니다
        </div>
      </div>
    </div>
  );
};

export default LoadingPage;
