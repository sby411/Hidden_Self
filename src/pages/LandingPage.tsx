import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, BarChart3, Crown, Camera, Palette, MessageCircle, User, Waves } from "lucide-react";
import { sampleResults } from "@/data/sampleData";

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

const analysisElements = [
  { icon: Camera, label: "사진 스타일", desc: "피드 이미지의 구도와 분위기" },
  { icon: Palette, label: "색감 톤", desc: "전체 피드의 컬러 팔레트" },
  { icon: MessageCircle, label: "캡션 언어", desc: "글쓰기 스타일과 어휘 분석" },
  { icon: User, label: "포즈 스타일", desc: "자주 등장하는 포즈 패턴" },
  { icon: Waves, label: "인스타 vibe", desc: "종합적인 분위기와 무드" },
];

const exampleResults = sampleResults.slice(0, 6);

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
      <header className="px-5 py-4 border-b border-border/40">
        <span className="text-sm font-semibold tracking-tight text-foreground/80">
          AI 인스타 분석
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* ===== Hero ===== */}
        <section className="w-full flex flex-col items-center px-5 pt-14 pb-10">
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
        </section>

        {/* ===== Feature Cards ===== */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto space-y-3">
            {featureCards.map((card) => (
              <div
                key={card.title}
                className="glass-card rounded-2xl p-4 flex items-start gap-3.5"
              >
                <div className="w-10 h-10 rounded-xl bg-accent flex items-center justify-center shrink-0">
                  <card.icon className="w-5 h-5 text-accent-foreground" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-0.5">{card.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ===== Analysis Elements ===== */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">이런 요소들을 분석해요</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">AI가 당신의 인스타를 다각도로 분석합니다</p>
            <div className="grid grid-cols-2 gap-2.5">
              {analysisElements.map((el) => (
                <div key={el.label} className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent/70 flex items-center justify-center shrink-0">
                    <el.icon className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">{el.label}</p>
                    <p className="text-[10px] text-muted-foreground leading-snug">{el.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Result Examples ===== */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">추구미 유형 미리보기</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">12가지 추구미 중 당신은 어떤 타입일까요?</p>
            <div className="grid grid-cols-3 gap-2">
              {exampleResults.map((r) => (
                <div
                  key={r.id}
                  className={`rounded-2xl p-3 text-center bg-gradient-to-br ${r.gradientClass} border border-border/30`}
                >
                  <div className="text-2xl mb-1">{r.emoji}</div>
                  <p className="text-xs font-bold text-foreground leading-tight">{r.title}</p>
                  <p className="text-[9px] text-muted-foreground mt-0.5">{r.vibeCodes.join(" · ")}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ===== Second CTA ===== */}
        <section className="w-full px-5 pb-14">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="glass-card rounded-3xl p-6">
              <p className="text-lg font-bold text-foreground mb-2">나의 인스타 vibe는?</p>
              <p className="text-xs text-muted-foreground mb-5">지금 바로 확인해보세요</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                내 인스타 vibe 알아보기
              </button>
            </div>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground pb-6">
          © 2026 AI 인스타 분석 · 재미로 보는 테스트입니다
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
