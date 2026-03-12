import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Heart, Camera, Palette, MessageCircle, Smile, Waves } from "lucide-react";
import { maleTypes } from "@/data/sampleData";

const analysisElements = [
  { icon: Waves, label: "인스타 vibe", desc: "전체 피드 분위기 분석" },
  { icon: Camera, label: "사진 스타일", desc: "이미지 구도와 무드" },
  { icon: Palette, label: "색감 분위기", desc: "컬러 팔레트 분석" },
  { icon: MessageCircle, label: "캡션 감성", desc: "글쓰기 스타일 분석" },
  { icon: Smile, label: "전체 이미지 톤", desc: "종합적인 톤 & 매너" },
];

const previewTypes = maleTypes.slice(0, 6);

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
      <header className="px-5 py-4 border-b border-border/40">
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-primary" fill="hsl(340 40% 72%)" />
          <span className="text-sm font-semibold tracking-tight text-foreground/80">
            끌리는 남자 유형 테스트
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full flex flex-col items-center px-5 pt-14 pb-10">
          <div className="w-full max-w-md text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-xs font-medium text-accent-foreground mb-6">
              <Sparkles className="w-3 h-3" />
              AI 인스타 분석
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight tracking-tight text-foreground mb-3">
              내 인스타로 보는
              <br />
              <span className="gradient-primary bg-clip-text text-transparent">나에게 끌리는 남자 유형</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              아이디만 입력하면
              <br />
              AI가 당신의 인스타 vibe를 분석해
              <br />
              당신에게 끌리는 남자 유형을 알려드립니다
            </p>

            <div className="flex flex-col gap-3 w-full">
              <input
                type="text"
                value={inputId}
                onChange={(e) => setInputId(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                placeholder="Instagram ID 입력"
                className="w-full h-12 rounded-xl bg-secondary border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
              />
              <button
                onClick={handleAnalyze}
                disabled={!inputId.trim()}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98]"
              >
                내 인스타 분석하기
              </button>
            </div>
          </div>
        </section>

        {/* Analysis Elements */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">이 테스트가 분석하는 요소</h2>
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

        {/* Type Preview */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">어떤 남자 유형이 나올까?</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">12가지 남자 유형 중 당신의 결과는?</p>
            <div className="grid grid-cols-3 gap-2">
              {previewTypes.map((t) => (
                <div
                  key={t.id}
                  className={`rounded-2xl p-3 text-center bg-gradient-to-br ${t.gradientClass} border border-border/30`}
                >
                  <div className="text-2xl mb-1">{t.emoji}</div>
                  <p className="text-[11px] font-bold text-foreground leading-tight">{t.title}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Second CTA */}
        <section className="w-full px-5 pb-14">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="glass-card rounded-3xl p-6">
              <p className="text-lg font-bold text-foreground mb-2">나에게 끌리는 남자는?</p>
              <p className="text-xs text-muted-foreground mb-5">지금 바로 확인해보세요</p>
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                className="w-full h-12 rounded-xl gradient-primary text-primary-foreground font-semibold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                내 인스타 분석하기
              </button>
            </div>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground pb-6">
          © 2026 끌리는 남자 유형 테스트 · 재미로 보는 테스트입니다
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
