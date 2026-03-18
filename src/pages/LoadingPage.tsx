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

const TOTAL_PIXELS = 20;

const LoadingPage = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [pixelProgress, setPixelProgress] = useState(0);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const id = searchParams.get("id") || "";

  // Insert tracking row on mount (fire-and-forget, doesn't block navigation)
  useEffect(() => {
    if (!id) return;
    trackSubmissionStart(id).then((rowId) => {
      if (rowId) {
        sessionStorage.setItem("instai_submission_id", rowId);
      }
    });
  }, [id]);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => {
        if (prev < loadingSteps.length - 1) return prev + 1;
        return prev;
      });
    }, 550);

    const pixelInterval = setInterval(() => {
      setPixelProgress((prev) => {
        if (prev < TOTAL_PIXELS) return prev + 1;
        return prev;
      });
    }, 140);

    const timer = setTimeout(() => {
      navigate(`/result?id=${encodeURIComponent(id)}`, { replace: true });
    }, 3200);

    return () => {
      clearInterval(stepInterval);
      clearInterval(pixelInterval);
      clearTimeout(timer);
    };
  }, [navigate, id]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 relative">
      {/* Pixel grid bg */}
      <div className="absolute inset-0 pixel-grid opacity-40" />

      <div className="relative z-10 flex flex-col items-center w-full max-w-sm">
        {/* Scan icon with glow */}
        <div className="relative w-16 h-16 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-2xl gradient-ai opacity-20 animate-scan-pulse" />
          <div className="w-12 h-12 rounded-xl gradient-ai flex items-center justify-center glow-accent">
            <Scan className="w-6 h-6 text-white animate-scan-pulse" />
          </div>
        </div>

        {/* Pixel progress bar */}
        <div className="w-full mb-8">
          <div className="flex gap-[3px] h-3 w-full">
            {Array.from({ length: TOTAL_PIXELS }).map((_, i) => (
              <div
                key={i}
                className="flex-1 rounded-sm transition-all duration-200"
                style={{
                  backgroundColor: i < pixelProgress
                    ? `hsl(${270 + (i * 2)} 70% ${55 + (i % 3) * 5}%)`
                    : 'hsl(var(--secondary))',
                  opacity: i < pixelProgress ? 1 : 0.4,
                }}
              />
            ))}
          </div>
          <p className="text-[10px] text-muted-foreground text-center mt-2 font-medium tabular-nums">
            {Math.round((pixelProgress / TOTAL_PIXELS) * 100)}% scanned
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

        <p className="text-[11px] text-muted-foreground mt-12 flex items-center gap-1.5">
          <Scan className="w-3 h-3 text-ai-highlight" />
          Scanning @{id}
        </p>
      </div>
    </div>
  );
};

export default LoadingPage;
