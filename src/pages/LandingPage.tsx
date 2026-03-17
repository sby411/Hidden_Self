import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Camera, Palette, MessageCircle, Waves, Users, UserPlus, Clock, Activity, Hash, Image, Eye, BarChart3, Scan, Heart, ArrowRight } from "lucide-react";

const analysisElements = [
  { icon: Camera, label: "사진 스타일", desc: "당신이 보여주는 분위기 매력" },
  { icon: Palette, label: "색감 팔레트", desc: "당신의 감성 vibe" },
  { icon: Waves, label: "인스타 vibe", desc: "전체 피드에서 풍기는 연애 에너지" },
  { icon: MessageCircle, label: "캡션 감성", desc: "당신의 감정 표현 스타일" },
  { icon: Users, label: "팔로워 구성", desc: "어떤 사람들이 끌리는지" },
  { icon: UserPlus, label: "팔로잉 관심사", desc: "당신의 연애 취향 단서" },
  { icon: Clock, label: "활동 시간대", desc: "당신의 라이프스타일 패턴" },
  { icon: Activity, label: "참여율 분석", desc: "당신의 인기도와 반응" },
  { icon: Image, label: "게시물 빈도", desc: "당신의 관심도와 에너지" },
  { icon: Hash, label: "해시태그 분석", desc: "당신의 취향과 관심사" },
  { icon: Eye, label: "스토리 패턴", desc: "당신의 일상 매력" },
  { icon: BarChart3, label: "종합 매력 지수", desc: "당신의 인스타 매력도" },
];

const typePreviewCards = [
  { emoji: "⚡", title: "도파민 회피형 인기남", desc: "강렬한 설렘을 주지만 쉽게 잡히지 않는 도파민 타입", gradient: "from-[hsl(280,25%,92%)] to-[hsl(300,20%,87%)]" },
  { emoji: "💼", title: "능력있는 불안형 연상남", desc: "능력은 있지만 내면에 불안을 가진 연상 타입", gradient: "from-[hsl(45,45%,91%)] to-[hsl(35,40%,86%)]" },
  { emoji: "🐶", title: "집착형 연하 인싸남", desc: "한번 빠지면 끝까지 직진하는 에너지 넘치는 연하", gradient: "from-[hsl(30,50%,92%)] to-[hsl(20,45%,87%)]" },
  { emoji: "🧊", title: "감정차단 회피형 냉미남", desc: "겉은 차갑지만 내면에 깊은 감정을 숨긴 타입", gradient: "from-[hsl(210,18%,92%)] to-[hsl(220,15%,87%)]" },
  { emoji: "🎨", title: "감성 과몰입 예술남", desc: "감성에 깊이 빠져드는 예술적 영혼의 타입", gradient: "from-[hsl(340,30%,92%)] to-[hsl(320,25%,87%)]" },
  { emoji: "🧠", title: "똑똑한 아싸 안정남", desc: "지적 매력과 안정감을 가진 조용한 타입", gradient: "from-[hsl(160,20%,92%)] to-[hsl(180,18%,87%)]" },
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
          <div className="absolute inset-0 pixel-grid opacity-60" />

          <div className="w-full max-w-md text-center relative z-10">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-ai-highlight/10 border border-ai-highlight/20 px-3.5 py-1.5 text-xs font-semibold text-ai-highlight mb-6">
              <Heart className="w-3 h-3" />
              AI 연애 유형 분석
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground mb-3">
              내 인스타그램으로 분석하는
              <br />
              <span className="bg-gradient-to-r from-ai-highlight to-accent bg-clip-text text-transparent">나에게 꼬이는 남자 유형</span>
            </h1>
            <p className="text-base font-bold text-foreground mb-2">
              왜 항상 이런 남자만 꼬일까? 🤔
            </p>
            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              AI가 당신의 인스타그램의 여러 요소들을 분석해
              <br />
              어떤 남자 유형이 당신에게 끌리는지 알려드립니다.
            </p>

            {/* Input area */}
            <div className="flex flex-col gap-3 w-full">
              <div className="relative">
                <input
                  type="text"
                  value={inputId}
                  onChange={(e) => setInputId(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
                  placeholder="내 인스타 아이디 입력 (@username)"
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ai-highlight/40 focus:border-ai-highlight/30 transition-all"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <Scan className="w-4 h-4 text-muted-foreground" />
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground text-center">
                🔒 비공개 계정은 분석이 불가능해요. 잠시 공개로 전환 후 진행해주세요.
              </p>
              <button
                onClick={handleAnalyze}
                disabled={!inputId.trim()}
                className="w-full h-12 rounded-xl gradient-ai text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] glow-accent relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  내 인스타 분석 시작하기
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Analysis Elements */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">AI가 당신의 인스타에서 읽어내는 연애 vibe</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">AI가 12개 항목을 다각도로 분석합니다</p>
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
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">어떤 남자 유형이 나올까? 💘</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">AI가 당신의 인스타 vibe를 분석해 당신에게 끌리는 남자 유형을 알려드립니다.</p>
            <div className="flex flex-col gap-2.5">
              {typePreviewCards.map((t) => (
                <div
                  key={t.title}
                  className={`rounded-2xl p-4 bg-gradient-to-br ${t.gradient} border border-border/30 card-hover flex items-start gap-3`}
                >
                  <div className="text-2xl shrink-0">{t.emoji}</div>
                  <div>
                    <p className="text-sm font-bold text-foreground leading-tight">{t.title}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sample Result */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">실제 분석 결과 예시 🔍</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">이런 식으로 분석 결과가 나와요</p>
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden">
              <div className="absolute inset-0 pixel-grid opacity-30" />
              <div className="relative z-10">
                <p className="text-xs text-muted-foreground mb-1">@username 분석 결과</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🔥</span>
                  <p className="text-base font-extrabold text-foreground">도파민 회피형 인기남</p>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  당신의 인스타 vibe는 감성적인 사진과 신비로운 분위기가 강합니다.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed mt-2">
                  이런 vibe는 자극적인 매력을 가진 남자들에게 특히 강하게 어필합니다.
                </p>
                <div className="flex items-center gap-1 mt-4 text-ai-highlight text-xs font-semibold">
                  <span>자세한 분석 보기</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="w-full px-5 pb-14">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden">
              <div className="absolute inset-0 pixel-grid opacity-40" />
              <div className="relative z-10">
                <p className="text-lg font-bold text-foreground mb-2">나에게 꼬이는 남자는? 💕</p>
                <p className="text-xs text-muted-foreground mb-5">지금 바로 확인해보세요</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full h-12 rounded-xl gradient-ai text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] glow-accent"
                >
                  지금 내 인스타 연애 분석하기
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
