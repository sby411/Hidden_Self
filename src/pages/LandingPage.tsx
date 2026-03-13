import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Camera, Palette, MessageCircle, Waves, Users, UserPlus, Clock, Activity, Hash, Image, Eye, BarChart3, Scan } from "lucide-react";
import { maleTypes } from "@/data/sampleData";

const analysisElements = [
  { icon: Camera, label: "사진 스타일", desc: "이미지 구도·필터·무드 분석" },
  { icon: Palette, label: "색감 팔레트", desc: "피드 전체 컬러톤 추출" },
  { icon: Waves, label: "인스타 vibe", desc: "전체 피드 분위기 도출" },
  { icon: MessageCircle, label: "캡션 감성", desc: "글쓰기 스타일·어조 분석" },
  { icon: Users, label: "팔로워 구성", desc: "팔로워 성별·연령대 비율" },
  { icon: UserPlus, label: "팔로잉 관심사", desc: "팔로잉 계정 카테고리 분석" },
  { icon: Clock, label: "활동 시간대", desc: "업로드·접속 시간 패턴" },
  { icon: Activity, label: "참여율 분석", desc: "좋아요·댓글 인게이지먼트" },
  { icon: Image, label: "게시물 빈도", desc: "업로드 주기·패턴 분석" },
  { icon: Hash, label: "해시태그 분석", desc: "자주 사용하는 키워드 추출" },
  { icon: Eye, label: "스토리 패턴", desc: "스토리 사용 빈도·스타일" },
  { icon: BarChart3, label: "종합 매력 지수", desc: "12개 항목 종합 점수 산출" },
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
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
            <Scan className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">
            InstAI
          </span>
          <span className="text-[9px] font-semibold text-ai-highlight bg-ai-highlight/10 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
            Beta
          </span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center">
        {/* Hero */}
        <section className="w-full flex flex-col items-center px-5 pt-14 pb-10 relative">
          {/* Pixel grid background */}
          <div className="absolute inset-0 pixel-grid opacity-60" />
          
          <div className="w-full max-w-md text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-ai-highlight/10 border border-ai-highlight/20 px-3.5 py-1.5 text-xs font-semibold text-ai-highlight mb-6">
              <Scan className="w-3 h-3" />
              AI Instagram Scan
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground mb-3">
              내 인스타로 보는
              <br />
              <span className="gradient-ai bg-clip-text text-transparent">끌어당기는 남자 유형</span>
            </h1>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              AI가 당신의 Instagram vibe를
              <br />
              <span className="text-ai-highlight font-medium">pixel by pixel</span> 분석합니다
            </p>

            {/* Input area with glow */}
            <div className="flex flex-col gap-3 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="Enter your Instagram ID (@username)"
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai-highlight/40 focus:border-ai-highlight/30 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Scan className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <button
                onClick={handleAnalyze}
                disabled={!inputId.trim()}
                className="w-full h-12 rounded-xl gradient-ai text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] glow-accent relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Scan className="w-4 h-4" />
                  Start AI Scan
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Analysis Elements */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">이 테스트가 분석하는 요소</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">AI가 12개 항목을 다각도로 정밀 분석합니다</p>
            <div className="grid grid-cols-2 gap-2.5">
              {analysisElements.map((el) => (
                <div key={el.label} className="glass-card rounded-2xl p-3.5 flex items-center gap-3 card-hover relative">
                  <div className="w-9 h-9 rounded-xl bg-ai-highlight/10 flex items-center justify-center shrink-0">
                    <el.icon className="w-4 h-4 text-ai-highlight" />
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
                  className={`rounded-2xl p-3 text-center bg-gradient-to-br ${t.gradientClass} border border-border/30 card-hover`}
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
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 pixel-grid opacity-40" />
              <div className="relative z-10">
                <p className="text-lg font-bold text-foreground mb-2">나에게 꼬이는 남자는?</p>
                <p className="text-xs text-muted-foreground mb-5">지금 바로 확인해보세요</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full h-12 rounded-xl gradient-ai text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] glow-accent"
                >
                  Start AI Scan
                </button>
              </div>
            </div>
          </div>
        </section>

        <p className="text-[11px] text-muted-foreground pb-6">
          © 2026 InstAI · 재미로 보는 테스트입니다
        </p>
      </main>
    </div>
  );
};

export default LandingPage;
