import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Check, Scan } from "lucide-react";

const loadingSteps = [
  "Scanning profile data...",
  "Analyzing image style...",
  "Detecting Instagram vibe...",
  "Analyzing engagement pattern...",
  "Evaluating attraction signals...",
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
];

const TOTAL_BLOCKS = 10;

const LoadingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [blockProgress, setBlockProgress] = useState(0);
  const [insightIndex, setInsightIndex] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    const blockInterval = setInterval(() => {
      setBlockProgress((prev) => {
        if (prev < TOTAL_BLOCKS) return prev + 1;
        return prev;
      });
    }, 280);

    const insightInterval = setInterval(() => {
      setInsightIndex((prev) => (prev + 1) % aiInsights.length);
    }, 1800);

    const completeTimer = setTimeout(() => {
      setShowComplete(true);
    }, 2800);

    const timer = setTimeout(() => {
      navigate(`/result?id=${encodeURIComponent(id)}`, { replace: true });
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(blockInterval);
      clearInterval(insightInterval);
      clearTimeout(completeTimer);
      clearTimeout(timer);
    };
  }, [navigate, id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      <div className="absolute inset-0 pixel-grid opacity-40" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Scan icon */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl gradient-ai opacity-20 animate-scan-pulse" />
          <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center glow-accent">
            <Scan className="w-6 h-6 text-white animate-scan-pulse" />
          </div>
        </div>

        {/* Block progress bar */}
        <div className="w-full mb-8">
          <div className="flex gap-1.5 h-4 w-full">
            {Array.from({ length: TOTAL_BLOCKS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-300"
                style={{
                  backgroundColor: i < blockProgress
                    ? `hsl(${270 + (i * 4)} 70% ${55 + (i % 3) * 5}%)`
                    : 'hsl(var(--secondary))',
                  opacity: i < blockProgress ? 1 : 0.3,
                }}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium">
            분석 진행 중...
          </p>
        </div>

        {/* Steps */}
        <div className="space-y-3 w-full">
          {loadingSteps.map((step, i) => (
            <div
              key={step}
              className={`flex items-center gap-3 transition-all duration-500 ${
                i <= currentStep
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-2"
              }`}
            >
              <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all ${
                i < currentStep
                  ? "bg-ai-highlight text-white"
                  : i === currentStep
                  ? "border-2 border-ai-highlight animate-scan-pulse"
                  : "border border-border"
              }`}>
                {i < currentStep && <Check className="w-3 h-3" />}
                {i === currentStep && <div className="w-1.5 h-1.5 rounded-full bg-ai-highlight" />}
              </div>
              <span className={`text-sm ${
                i === currentStep ? "font-semibold text-foreground" : "text-muted-foreground"
              }`}>
                {step}
              </span>
            </div>
          ))}
        </div>

        {/* AI Insight */}
        <div className="mt-8 w-full text-center min-h-[40px]">
          {showComplete ? (
            <div className="animate-in fade-in duration-500">
              <p className="text-sm font-bold text-foreground">✅ 분석 완료되었습니다</p>
              <p className="text-[11px] text-muted-foreground mt-0.5">결과를 정리 중입니다...</p>
            </div>
          ) : (
            <p
              key={insightIndex}
              className="text-xs text-muted-foreground italic animate-in fade-in duration-500"
            >
              "{aiInsights[insightIndex]}"
            </p>
          )}
        </div>

        <p className="text-[11px] text-muted-foreground mt-8 flex items-center gap-1.5">
          <Scan className="w-3 h-3 text-ai-highlight" />
          Scanning @{id}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
