import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BarChart3, Crown } from "lucide-react";

const featureCards = [
  {
    icon: Sparkles,
    title: "인스타 vibe 분석",
    description: "피드 이미지, 색감, 캡션을 종합 분석해요",
  },
  {
    icon: BarChart3,
    title: "추구미 / 실제미 리포트",
    description: "당신의 추구하는 이미지와 실제 이미지를 비교해요",
  },
  {
    icon: Crown,
    title: "프리미엄 상세 결과",
    description: "연예인 비교, 발전 전략까지 상세 분석을 제공해요",
  },
];

const LandingPage = () => {
  const [inputId, setInputId] = useState("");
  const navigate = useNavigate();

  const handleAnalyze = () => {
    const cleanId = inputId.replace("@", "").trim();
    if (!cleanId) return;
    navigate(`/loading?id=${encodeURIComponent(cleanId)}`);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4">
        <span className="text-sm font-semibold tracking-tight text-foreground/80">
          AI 인스타 분석
        </span>
      </header>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center px-5 pt-12 pb-8">
        <div className="w-full max-w-md text-center">
          <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-6">
            <Sparkles className="w-3 h-3" />
            AI 기반 분석
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground mb-3">
            AI가 분석한
            <br />
            당신의 인스타{" "}
            <span className="gradient-primary bg-clip-text text-transparent">추구미</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
            아이디만 입력하면
            <br />
            당신의 인스타 vibe를 분석해드려요
          </p>

          {/* Input */}
          <div className="flex flex-col gap-3 w-full">
            <input
              type="text"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
              placeholder="@instagram_id"
              className="w-full h-12 rounded-xl bg-secondary border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            />
            <button
              onClick={handleAnalyze}
              disabled={!inputId.trim()}
              className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
            >
              내 추구미 분석하기
            </button>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="w-full max-w-md mt-14 space-y-3">
          {featureCards.map((card) => (
            <div
              key={card.title}
              className="glass-card rounded-2xl p-4 flex items-start gap-3.5"
            >
              <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                <card.icon className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground mb-0.5">
                  {card.title}
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {card.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        <p className="text-[11px] text-muted-foreground mt-10">
          © 2026 AI 인스타 분석 · 재미로 보는 테스트입니다
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
