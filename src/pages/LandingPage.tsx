import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Camera, Palette, MessageCircle, Waves, Users, UserPlus, Clock, Activity, Hash, Image, Eye, BarChart3, Scan, Heart, ArrowRight, AlertTriangle, Flame, ShieldAlert, Target } from "lucide-react";
import Footer from "@/components/Footer";

const analysisElements = [
  { icon: Camera, label: "당신이 풍기는 위험한 분위기", desc: "사진에서 읽히는 당신의 무의식적 신호", danger: true },
  { icon: Palette, label: "당신의 감성이 유발하는 착각", desc: "색감과 필터가 만드는 거짓 인상" },
  { icon: Waves, label: "피드에서 새어나오는 연애 에너지", desc: "당신도 모르게 흘리는 연애 시그널" },
  { icon: MessageCircle, label: "남자들이 오해하는 신호", desc: "캡션 속에 숨겨진 감정 패턴", danger: true },
  { icon: Users, label: "어떤 남자들이 당신을 노리는지", desc: "팔로워 구성이 말해주는 불편한 진실" },
  { icon: UserPlus, label: "당신의 취향이 만든 함정", desc: "팔로잉 패턴으로 보이는 연애 블라인드 스팟" },
  { icon: Clock, label: "활동 시간이 드러내는 외로움", desc: "접속 패턴이 말해주는 감정 상태" },
  { icon: Activity, label: "당신이 얼마나 쉽게 읽히는지", desc: "참여율이 보여주는 당신의 취약점", danger: true },
  { icon: Image, label: "게시물 빈도가 말하는 결핍", desc: "올리는 빈도에 숨겨진 심리 상태" },
  { icon: Hash, label: "해시태그가 폭로하는 욕망", desc: "무의식적으로 드러내는 관심사" },
  { icon: Eye, label: "스토리에서 읽히는 본심", desc: "24시간 안에 드러나는 진짜 감정" },
  { icon: BarChart3, label: "종합 위험도 지수", desc: "당신의 연애 패턴 리스크 종합 분석", danger: true },
];

const typePreviewCards = [
  { emoji: "⚡", title: "도파민 회피형 인기남", desc: "읽씹하면서 스토리는 다 봐. 관심 있는 척 안 하면서 너 동선은 다 파악 중. 이런 남자한테 맨날 끌리잖아.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(280,20%,12%)]" },
  { emoji: "🔥", title: "집착형 연하 인싸남", desc: "한번 빠지면 끝까지 직진하는 에너지. 매일 연락, 모든 거 챙기고, 항상 먼저 다가와. 근데 그게 나중엔 숨이 막혀.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(30,20%,12%)]" },
  { emoji: "🧊", title: "감정차단 회피형 냉미남", desc: "잘해주다 갑자기 차가워지는 남자. 너 지금 \"내가 뭘 잘못했지\" 생각하고 있지? 그게 함정이야.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(210,12%,12%)]" },
  { emoji: "👑", title: "자기애 과잉 인기남", desc: "모든 여사친한테 다정한 남자. 너한테만 특별한 줄 알았지? 카톡 프사 바꾸면 10분 안에 답장하는 여자 3명 더 있음.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(45,20%,12%)]" },
  { emoji: "💼", title: "능력있는 불안형 연상남", desc: "\"나 원래 연애 잘 안 해\"라고 말하는 남자. 연애를 안 하는 게 아니라 책임을 안 지는 거야. 근데 너 이미 빠졌잖아.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(35,15%,12%)]" },
  { emoji: "🎨", title: "감성 과몰입 예술남", desc: "전여친 얘기를 자연스럽게 꺼내는 남자. \"걔랑은 달라\" 이 말 듣고 감동받았지? 그거 모든 여자한테 하는 말이야.", gradient: "from-[hsl(0,0%,10%)] to-[hsl(300,15%,12%)]" },
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
        <section className="w-full flex flex-col items-center px-5 pt-14 pb-10 relative overflow-hidden">
          <div className="absolute inset-0 pixel-grid opacity-60" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(0_70%_50%/0.03)]" />

          <div className="w-full max-w-md text-center relative z-10">
            {/* Warning badge */}
            <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 border border-destructive/20 px-3.5 py-1.5 text-xs font-semibold text-destructive mb-6">
              <AlertTriangle className="w-3 h-3" />
              ⚠️ 불편할 수 있는 결과가 포함됩니다
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold leading-tight tracking-tight text-foreground mb-4">
              왜 나한테는 항상
              <br />
              <span className="text-danger-highlight">똥차만 꼬일까?</span>
            </h1>

            {/* Provocative sub-hooks */}
            <div className="space-y-1.5 mb-5">
              <p className="text-sm font-bold text-foreground">
                이건 운이 아니라 <span className="text-danger-highlight">패턴</span>이야.
              </p>
              <p className="text-xs text-muted-foreground">
                남자가 이상한 게 아니라, <span className="font-semibold text-foreground">너의 특정한 요소</span>가 그런 남자들을 끌어당기는 거야.
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-8 leading-relaxed">
              인스타그램 분석을 통해, 당신이 어떤 남자를 끌어들이는지
              <br />
              <span className="font-semibold text-foreground">생각보다 적나라하게</span> 보여드립니다.
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
                  className="w-full h-12 rounded-xl bg-card border border-border px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-destructive/40 focus:border-destructive/30 transition-all"
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
                className="w-full h-12 rounded-xl gradient-danger text-white font-bold text-sm shadow-md hover:shadow-lg transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-[0.98] glow-danger relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                <span className="relative flex items-center justify-center gap-2">
                  <Flame className="w-4 h-4" />
                  내 연애 패턴 까발리기
                </span>
              </button>
            </div>

            {/* Aggressive hook text */}
            <div className="mt-6 space-y-1">
              <p className="text-[11px] text-muted-foreground italic">
                "너 문제 없는 거 맞아?"
              </p>
              <p className="text-[11px] text-muted-foreground italic">
                "이번에도 또 같은 유형 만날 가능성 높음"
              </p>
            </div>
          </div>
        </section>

        {/* Warning Banner */}
        <section className="w-full px-5 pb-6">
          <div className="w-full max-w-md mx-auto">
            <div className="rounded-2xl p-4 bg-destructive/5 border border-destructive/15 glow-danger-subtle">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-foreground mb-1">⚠️ 너 연애, 생각보다 읽히고 있음</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">
                    왜 항상 결말이 똑같은지 생각해본 적 있어?
                    <br />
                    끌리는 게 아니라, <span className="font-semibold text-foreground">끌어당기고 있는 거야.</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Analysis Elements */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">🔍 AI가 당신의 인스타에서 <span className="text-danger-highlight">읽어내는 것들</span></h2>
            <p className="text-xs text-muted-foreground text-center mb-5">당신이 모르는 사이, 이미 다 보이고 있어요</p>
            <div className="grid grid-cols-2 gap-2.5">
              {analysisElements.map((el) => (
                <div key={el.label} className={`glass-card rounded-2xl p-3.5 flex items-center gap-3 card-hover relative ${el.danger ? 'border-destructive/20 glow-danger-subtle' : ''}`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${el.danger ? 'bg-destructive/10' : 'bg-ai-highlight/10'}`}>
                    <el.icon className={`w-4 h-4 ${el.danger ? 'text-destructive' : 'text-ai-highlight'}`} />
                  </div>
                  <div>
                    <p className={`text-xs font-semibold ${el.danger ? 'text-danger-highlight' : 'text-foreground'}`}>{el.label}</p>
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
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">🔥 너한테만 꼬이는 유형, 이미 정해져 있어</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">너한테만 하남자가 몰리는 이유, 이미 보입니다.</p>
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

        {/* Sample Result - Provocative with blur teaser */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-lg font-bold text-foreground mb-1 text-center">📊 실제 분석 결과 예시</h2>
            <p className="text-xs text-muted-foreground text-center mb-5">이 정도로 <span className="font-semibold text-foreground">적나라하게</span> 나와요</p>
            
            {/* Result card 1 - fully visible */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden border-destructive/10 mb-3">
              <div className="absolute inset-0 pixel-grid opacity-30" />
              <div className="relative z-10">
                <p className="text-[11px] text-muted-foreground mb-2">@s_yeon*** 분석 결과</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⚡</span>
                  <div>
                    <p className="text-base font-extrabold text-foreground">도파민 회피형 인기남</p>
                    <p className="text-[11px] text-destructive font-semibold">집착 확률 62% · 관계 지속력 낮음</p>
                  </div>
                </div>
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  너의 피드에서 반복되는 <span className="font-semibold text-danger-highlight">감성적이고 몽환적인 색감</span>이 감정적 자극을 찾는 남자들을 끌어당기고 있어.
                </p>
                <p className="text-sm text-secondary-foreground leading-relaxed mt-2">
                  특히 스토리에 올리는 <span className="font-semibold text-danger-highlight">새벽 감성 포스팅</span>이 "이 여자 외로운가?" 라는 신호로 읽히고 있음.
                </p>
              </div>
            </div>

            {/* Result card 2 - partially blurred */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden border-destructive/10 mb-3">
              <div className="absolute inset-0 pixel-grid opacity-30" />
              <div className="relative z-10">
                <p className="text-[11px] text-muted-foreground mb-2">@min.j*** 분석 결과</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🧊</span>
                  <div>
                    <p className="text-base font-extrabold text-foreground">감정차단 회피형 냉미남</p>
                    <p className="text-[11px] text-destructive font-semibold">집착 확률 70% · 푸시풀 위험도 높음</p>
                  </div>
                </div>
                <p className="text-sm text-secondary-foreground leading-relaxed">
                  프로필 사진 없이 하이라이트만 6개 — 이건 <span className="font-semibold text-danger-highlight">"나한테 관심 가져봐"</span> 시그널이야.
                </p>
                <div className="mt-3 relative">
                  <div className="blur-[6px] select-none pointer-events-none">
                    <p className="text-sm text-secondary-foreground leading-relaxed">
                      너의 캡션 패턴에서 감지된 핵심 심리 트리거는 "무심한 듯 시크한 말투"인데, 이게 회피형 남자의 정복욕을 자극하는 핵심 요소로...
                    </p>
                    <p className="text-sm text-secondary-foreground leading-relaxed mt-2">
                      팔로워 대비 팔로잉 비율이 만들어내는 "쉽게 안 넘어오는 여자" 이미지가 냉미남에게는...
                    </p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-bold text-destructive bg-background/80 px-3 py-1.5 rounded-full border border-destructive/30">
                      🔒 전체 분석은 테스트 후 확인
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Result card 3 - heavily blurred with CTA */}
            <div className="glass-card rounded-2xl p-5 relative overflow-hidden border-destructive/10">
              <div className="absolute inset-0 pixel-grid opacity-30" />
              <div className="relative z-10">
                <p className="text-[11px] text-muted-foreground mb-2">@hyun_a*** 분석 결과</p>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">👑</span>
                  <div>
                    <p className="text-base font-extrabold text-foreground">자기애 과잉 인기남</p>
                    <p className="text-[11px] text-destructive font-semibold">위험도 ???</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="blur-[8px] select-none pointer-events-none">
                    <p className="text-sm text-secondary-foreground leading-relaxed">
                      당신의 피드에서 가장 많은 좋아요를 받는 사진 유형이 "얼굴 클로즈업"인데, 이 패턴은 자기애형 남자에게...
                    </p>
                    <p className="text-sm text-secondary-foreground leading-relaxed mt-2">
                      해시태그 사용 빈도와 셀피 비율로 계산한 "픽미 지수"가 상위 12%로 측정되었으며...
                    </p>
                    <div className="flex gap-2 mt-3">
                      <div className="bg-destructive/10 rounded-lg px-3 py-2 flex-1">
                        <p className="text-xs text-muted-foreground">연상 끌림도</p>
                        <p className="text-lg font-bold text-foreground">87%</p>
                      </div>
                      <div className="bg-destructive/10 rounded-lg px-3 py-2 flex-1">
                        <p className="text-xs text-muted-foreground">테토력</p>
                        <p className="text-lg font-bold text-foreground">91%</p>
                      </div>
                    </div>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button
                      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                      className="text-sm font-bold text-white bg-destructive/90 hover:bg-destructive px-5 py-2.5 rounded-full border border-destructive/50 shadow-lg transition-all active:scale-95"
                    >
                      🔥 내 결과 확인하기
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ====== 실제 후기 섹션 ====== */}
        <section className="w-full px-5 pb-10">
          <div className="w-full max-w-md mx-auto">
            <h2 className="text-xl font-extrabold text-foreground mb-1">실제 사용 후기</h2>
            <p className="text-xs text-muted-foreground mb-6">분석 받은 사람들의 솔직한 반응</p>

            <div className="flex flex-col gap-4">
              {[
                {
                  emoji: "👍",
                  title: "생각보다 내 상황이랑 너무 맞아서 놀람",
                  body: "처음엔 그냥 심심해서 해봤는데 읽다 보니까 약간 소름이었어요.\n제가 왜 항상 비슷한 스타일의 남자만 만나는지 설명해주는데…\n지금까지 연애했던 사람들 하나씩 떠오르더라고요.\n특히 \"접근 방식\" 부분이 제 경험이랑 거의 똑같아서 좀 놀랐습니다.",
                },
                {
                  emoji: "😳",
                  title: "이거 읽다가 잠깐 멈춤",
                  body: "왜 항상 애매하게 밀당하는 남자만 꼬이는지 궁금했는데\n여기서 \"관찰형 남자들이 접근할 확률이 높다\" 이런 식으로 분석해주더라고요.\n진짜 맞는말이라 순간 벙쩌서 멈췄어요.",
                },
                {
                  emoji: "🤯",
                  title: "내 연애 패턴 그대로 적혀있음",
                  body: "연애할 때마다 초반엔 되게 관심 보이다가\n나중에 갑자기 거리 두는 사람들만 만나서 늘 이유가 궁금했는데\n\"이런 유형의 계정은 도전 욕구 있는 남자를 끌어들인다\"는 설명 보고\n약간 납득돼서 웃겼어요.\n팩폭인데 이상하게 기분 나쁘진 않네요.",
                },
                {
                  emoji: "👀",
                  title: "친구랑 같이 해봤는데",
                  body: "제가 먼저 해보고 친구한테도 링크 보내서 같이 했는데\n둘 다 결과가 완전 다르게 나와서 신기했어요.\n친구는 DM 많이 받는 타입으로 나오고 저는 \"접근 난이도 높은 타입\"이라는데\n실제로도 그런 편이라서 AI가 이런 걸 어떻게 보지 싶긴 했어요.",
                },
                {
                  emoji: "🙂",
                  title: "이런 거 보통 재미로만 하는데",
                  body: "생각보다 현실적인 얘기가 많아서 좀 신기했어요.\n특히 \"어떤 남자가 끌리는지\"보다\n\"왜 그런 남자가 접근하는지\" 설명해주는 부분이 괜찮았어요.\n연애 고민 있을 때 한 번쯤 읽어볼 만한 느낌.",
                },
              ].map((review, i) => (
                <div key={i} className="glass-card rounded-2xl p-4 border-border/30">
                  <p className="text-sm font-bold text-foreground mb-2">
                    {review.emoji} {review.title}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                    {review.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="w-full px-5 pb-14">
          <div className="w-full max-w-md mx-auto text-center">
            <div className="glass-card rounded-3xl p-6 relative overflow-hidden border-destructive/15 glow-danger-subtle">
              <div className="absolute inset-0 pixel-grid opacity-40" />
              <div className="relative z-10">
                <p className="text-lg font-bold text-foreground mb-1">아직도 모르겠어? 🔥</p>
                <p className="text-xs text-muted-foreground mb-1">왜 항상 결말이 똑같은지</p>
                <p className="text-xs font-semibold text-danger-highlight mb-5">지금 확인 안 하면, 또 반복될걸.</p>
                <button
                  onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
                  className="w-full h-12 rounded-xl gradient-danger text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] glow-danger"
                >
                  🔥 내 연애 패턴 분석하기
                </button>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </div>
  );
};

export default LandingPage;
