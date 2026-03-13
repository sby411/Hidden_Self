import { useSearchParams, useNavigate } from "react-router-dom";
import { getRandomResult, getVibeAnalysis, getAdditionalTypes, getWarningType, getUserVibeType, getAiConfidence, getInstaProfile } from "@/data/sampleData";
import { Share2, RotateCcw, Download, LinkIcon, Lock, Heart, Camera, Palette, Waves, MessageCircle, AlertTriangle, ThumbsUp, ThumbsDown, Sparkles, HeartHandshake, Crown, ShieldCheck, Flame, TrendingUp, Eye, Clock, Users, UserPlus, Activity, Image, Hash, Zap } from "lucide-react";
import PremiumSections from "@/components/PremiumSections";
import { toast } from "sonner";
import { useRef, useCallback, useMemo, useState } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";

const lockedItems = [
  "AI 분석 신뢰도",
  "이 남자가 당신에게 빠지는 이유",
  "연애 시작 패턴",
  "집착 확률 & 지속 가능성",
  "숨겨진 매력 분석",
  "추가 남자 유형 심층 분석",
  "조심해야 할 남자 유형",
  "연애 진행 시뮬레이션",
  "관심 행동 패턴 분석",
  "연애 궁합 분석",
  "연애 성공 전략",
  "연애 리스크 분석",
  "끌리는 남자 유형 TOP5",
  "인스타 vibe 매력 분석",
  "연애 시나리오 예측",
  "위험 유형 분석",
];

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  const result = getRandomResult(id);
  const vibe = getVibeAnalysis(id);
  const userVibe = getUserVibeType(id);
  const insta = getInstaProfile(id);
  const additionalTypes = useMemo(() => getAdditionalTypes(result.id), [result.id]);
  const warningType = useMemo(() => getWarningType(result.id), [result.id]);
  const confidence = getAiConfidence(id);
  const shareCardRef = useRef<HTMLDivElement>(null);
  const basicReportRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const premiumReportRef = useRef<HTMLDivElement>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const relationshipScore = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 17 + id.charCodeAt(i)) % 41;
    return 38 + (Math.abs(h) % 41);
  }, [id]);

  const handleUnlockPremium = () => {
    setPremiumUnlocked(true);
    setTimeout(() => {
      premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success("링크가 복사되었어요! 친구에게 공유해보세요 ✨");
    } catch {
      toast.error("링크 복사에 실패했어요");
    }
  };

  const handleShareSNS = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `나에게 꼬이는 남자 유형: ${result.title}`,
          text: `내 인스타로 분석한 꼬이는 남자 유형은 "${result.title}" 이래! 너도 해봐 ✨`,
          url: window.location.href,
        });
      } catch { /* cancelled */ }
    } else {
      handleCopyLink();
    }
  };

  const handleDownload = useCallback(async () => {
    if (!shareCardRef.current) return;
    try {
      const dataUrl = await toPng(shareCardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#faf9f7",
      });
      const link = document.createElement("a");
      link.download = `꼬이는남자유형-${result.title}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("이미지가 저장되었어요! 📸");
    } catch {
      toast.error("이미지 저장에 실패했어요");
    }
  }, [result.title]);

  const handleDownloadPremiumReport = useCallback(async () => {
    if (!premiumReportRef.current) return;
    try {
      toast.info("리포트 이미지를 생성 중이에요...");
      const dataUrl = await toPng(premiumReportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: "#faf9f7",
        style: { padding: "20px" },
      });
      const link = document.createElement("a");
      link.download = `프리미엄리포트-${result.title}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("프리미엄 리포트가 저장되었어요! 📸");
    } catch {
      toast.error("리포트 저장에 실패했어요");
    }
  }, [result.title]);

  const vibeCards = [
    { icon: Camera, label: "사진 분위기", value: vibe.photoMood },
    { icon: Palette, label: "색감 톤", value: vibe.colorTone },
    { icon: Waves, label: "전체 vibe", value: vibe.vibeKeyword },
    { icon: MessageCircle, label: "캡션 스타일", value: vibe.captionStyle },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50">
        <div className="flex items-center gap-1.5">
          <Heart className="w-4 h-4 text-primary" fill="hsl(340 40% 72%)" />
          <span className="text-sm font-semibold tracking-tight text-foreground/80">
            꼬이는 남자 유형 테스트
          </span>
        </div>
        <span className="text-xs text-muted-foreground bg-secondary px-2.5 py-1 rounded-full">
          @{id}
        </span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-10">
        <div className="w-full max-w-md">

          {/* ====== CHAPTER 1: 인스타 프로필 분석 ====== */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">01</div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">인스타그램 프로필 분석</h2>
                <p className="text-[10px] text-muted-foreground">@{id}의 계정을 AI가 스캔했습니다</p>
              </div>
            </div>

            {/* Profile Stats Cards */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                <Image className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                <p className="text-xl font-black text-foreground">{insta.posts}</p>
                <p className="text-[10px] text-muted-foreground font-medium">게시물</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                <Users className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                <p className="text-xl font-black text-foreground">{insta.followers.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-medium">팔로워</p>
              </div>
              <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                <UserPlus className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                <p className="text-xl font-black text-foreground">{insta.following.toLocaleString()}</p>
                <p className="text-[10px] text-muted-foreground font-medium">팔로잉</p>
              </div>
            </div>

            {/* Engagement Stats */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center">
                  <Heart className="w-4 h-4 text-destructive" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">평균 좋아요</p>
                  <p className="text-base font-black text-foreground">{insta.avgLikes}</p>
                </div>
              </div>
              <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                  <Activity className="w-4 h-4 text-accent-foreground" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">참여율</p>
                  <p className="text-base font-black text-foreground">{insta.engagementRate}%</p>
                </div>
              </div>
            </div>

            {/* Follower Breakdown */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-primary" />
                팔로워 구성 분석
              </h3>
              <div className="space-y-2.5">
                {insta.followerBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                        <span>{item.emoji}</span> {item.label}
                      </span>
                      <span className="text-[11px] font-bold text-primary">{item.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary/60 to-primary transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Following Breakdown */}
            <div className="glass-card rounded-2xl p-5 mb-4">
              <h3 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5 text-primary" />
                팔로잉 관심사 분석
              </h3>
              <div className="space-y-2.5">
                {insta.followingBreakdown.map((item) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] text-foreground/80 flex items-center gap-1.5">
                        <span>{item.emoji}</span> {item.label}
                      </span>
                      <span className="text-[11px] font-bold text-accent-foreground">{item.percent}%</span>
                    </div>
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-accent to-accent-foreground/30 transition-all"
                        style={{ width: `${item.percent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interests & Activity */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="glass-card rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Hash className="w-3 h-3" /> 관심 키워드
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {insta.topInterests.map((t) => (
                    <span key={t} className="text-[10px] bg-chip text-chip-foreground px-2 py-1 rounded-full font-medium">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
              <div className="glass-card rounded-2xl p-4">
                <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                  <Zap className="w-3 h-3" /> 활동 패턴
                </h4>
                <p className="text-xs font-semibold text-foreground mb-1">{insta.activeTime}</p>
                <p className="text-[10px] text-muted-foreground leading-relaxed">주로 이 시간대에 피드 업로드 & 활동이 감지됨</p>
              </div>
            </div>

            {/* Chapter divider */}
            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* ====== CHAPTER 2: 인스타 Vibe 유형 ====== */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">02</div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">당신의 인스타 Vibe 유형</h2>
                <p className="text-[10px] text-muted-foreground">피드 분석 기반 성격 유형 도출</p>
              </div>
            </div>

            <div className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${userVibe.gradientClass} border border-border/30 shadow-sm`}>
              <div className="text-4xl mb-3">{userVibe.emoji}</div>
              <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">
                {userVibe.title}
              </h2>
              <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                {userVibe.description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2.5 mb-5">
              {vibeCards.map((card) => (
                <div key={card.label} className="glass-card rounded-2xl p-4 text-center">
                  <card.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground mb-1">{card.label}</p>
                  <p className="text-sm font-bold text-foreground">{card.value}</p>
                </div>
              ))}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* ====== CHAPTER 3: 꼬이는 남자 유형 ====== */}
          <div className="relative mb-8">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-black text-primary">03</div>
              <div>
                <h2 className="text-sm font-bold text-foreground tracking-tight">당신에게 꼬이는 남자 유형</h2>
                <p className="text-[10px] text-muted-foreground">AI가 도출한 최종 매칭 결과</p>
              </div>
            </div>

            {/* Dramatic Main Result Card */}
            <div className="relative mb-5">
              <div className={`rounded-3xl p-8 text-center bg-gradient-to-br ${result.gradientClass} border border-border/30 shadow-lg relative overflow-hidden`}>
                {/* Decorative rings */}
                <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-foreground/5" />
                <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-foreground/5" />
                
                <div className="relative z-10">
                  <div className="inline-flex items-center gap-1.5 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-border/30">
                    <Sparkles className="w-3 h-3 text-primary" />
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">Best Match</span>
                  </div>
                  <div className="text-7xl mb-4">{result.emoji}</div>
                  <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">
                    {result.title}
                  </h2>
                  <p className="text-xs text-muted-foreground font-medium tracking-wide mb-5">
                    {result.subtitle}
                  </p>
                  <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                    {result.description}
                  </p>
                </div>
              </div>
            </div>

            {/* AI Summary - Dossier style */}
            <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-primary" />
                AI 분석 요약
              </h3>
              <p className="text-sm text-foreground/80 leading-[1.9]">
                {result.aiSummary}
              </p>
            </div>

            {/* Attraction Stats - More dramatic */}
            <div className="glass-card rounded-2xl p-5 mb-5">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                💓 매력 지표
              </h3>
              <div className="space-y-3.5">
                {result.attractionStats.map((stat) => (
                  <div key={stat.label}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-foreground">{stat.label}</span>
                      <span className="text-xs font-black text-primary">{stat.value}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full gradient-primary transition-all"
                        style={{ width: `${stat.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why & Pattern - Side by side magazine feel */}
            <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary/50">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                💫 왜 이런 남자가 꼬이는지
              </h3>
              <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                {result.whyAttracted}
              </p>
            </div>

            <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-accent-foreground/30">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                💕 이 남자의 연애 패턴
              </h3>
              <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                {result.datingPattern}
              </p>
            </div>

            {/* Pros & Cons - More visual */}
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="rounded-2xl p-4 bg-primary/5 border border-primary/10">
                <div className="flex items-center gap-1.5 mb-3">
                  <ThumbsUp className="w-3.5 h-3.5 text-primary" />
                  <h4 className="text-xs font-bold text-foreground">장점</h4>
                </div>
                <ul className="space-y-2">
                  {result.pros.map((p) => (
                    <li key={p} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-primary mt-0.5">•</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl p-4 bg-destructive/5 border border-destructive/10">
                <div className="flex items-center gap-1.5 mb-3">
                  <ThumbsDown className="w-3.5 h-3.5 text-destructive" />
                  <h4 className="text-xs font-bold text-foreground">단점</h4>
                </div>
                <ul className="space-y-2">
                  {result.cons.map((c) => (
                    <li key={c} className="text-[11px] text-foreground/80 flex items-start gap-1.5">
                      <span className="text-destructive mt-0.5">•</span>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Additional Types */}
            <div className="mb-5">
              <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                💕 추가로 꼬이는 남자 유형
              </h3>
              <div className="space-y-2.5">
                {additionalTypes.map((t, i) => (
                  <div
                    key={t.id}
                    className={`rounded-2xl p-4 flex items-center gap-3.5 bg-gradient-to-br ${t.gradientClass} border border-border/30 shadow-sm`}
                  >
                    <div className="w-8 h-8 rounded-full bg-card/50 flex items-center justify-center text-[10px] font-black text-muted-foreground shrink-0">
                      #{i + 2}
                    </div>
                    <div className="text-3xl shrink-0">{t.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed line-clamp-2">
                        {t.oneLiner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>



            <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          {/* ====== PREMIUM DIVIDER ====== */}
          {!premiumUnlocked ? (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">심층 분석 잠금 🔒</h2>
                  <p className="text-[10px] text-muted-foreground">프리미엄 전용 콘텐츠</p>
                </div>
              </div>

              {/* Locked cards with blur */}
              <div className="relative mb-5">
                <div className="space-y-2.5">
                  {lockedItems.map((item) => (
                    <div
                      key={item}
                      className="glass-card rounded-2xl p-4 flex items-center justify-between border border-[hsl(45,60%,80%)]/30"
                    >
                      <span className="text-sm text-foreground/40 blur-[1px]">{item}</span>
                      <Lock className="w-4 h-4 text-[hsl(45,60%,60%)] shrink-0" />
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={handleUnlockPremium}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  전체 분석 잠금 해제 · 4,900원
                </span>
              </button>
            </div>
          ) : (
            /* ====== PREMIUM CONTENT (Unlocked) ====== */
            <div ref={premiumRef}>
              <div ref={premiumReportRef}>
              {/* Premium Chapter Header */}
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center text-xs font-black text-white">P</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                    심층 분석
                    <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                      <Crown className="w-2.5 h-2.5" /> PREMIUM
                    </span>
                  </h2>
                  <p className="text-[10px] text-muted-foreground">AI가 더 깊이 파고든 분석 결과</p>
                </div>
              </div>

              {/* AI Confidence */}
              <div className="rounded-2xl p-4 mb-5 flex items-center gap-3 bg-gradient-to-r from-[hsl(45,60%,92%)] to-[hsl(35,50%,90%)] border border-[hsl(45,60%,80%)]/40">
                <ShieldCheck className="w-8 h-8 text-[hsl(45,70%,50%)] shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                    <span className="text-sm font-black text-[hsl(45,70%,45%)]">{confidence}%</span>
                  </div>
                  <Progress value={confidence} className="h-2 rounded-full" />
                </div>
              </div>

              {/* Fall Reasons */}
              <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  이 남자가 당신에게 빠지는 이유
                </h3>
                <ul className="space-y-2.5">
                  {result.fallReasons.map((reason) => (
                    <li key={reason} className="text-sm text-foreground/80 flex items-start gap-2">
                      <span className="text-[hsl(45,70%,50%)] mt-0.5 shrink-0">◆</span>
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dating Start Pattern */}
              <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  연애 시작 패턴
                </h3>
                <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">
                  {result.datingPattern}
                </p>
              </div>

              {/* Obsession & Relationship - Side by side dramatic */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(0,60%,95%)] to-card border border-[hsl(0,40%,85%)]/30 text-center">
                  <Flame className="w-5 h-5 text-destructive mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">집착 확률</p>
                  <p className="text-3xl font-black text-destructive">{result.obsessionRate}%</p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-destructive/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-destructive" style={{ width: `${result.obsessionRate}%` }} />
                    </div>
                  </div>
                </div>
                <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(160,30%,95%)] to-card border border-[hsl(160,30%,85%)]/30 text-center">
                  <TrendingUp className="w-5 h-5 text-[hsl(160,50%,40%)] mx-auto mb-2" />
                  <p className="text-[10px] text-muted-foreground font-medium mb-1">지속 가능성</p>
                  <p className="text-3xl font-black text-[hsl(160,50%,40%)]">{relationshipScore}%</p>
                  <div className="mt-2">
                    <div className="h-1.5 bg-[hsl(160,30%,90%)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-[hsl(160,50%,45%)]" style={{ width: `${relationshipScore}%` }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Obsession detail text */}
              <div className="glass-card rounded-2xl p-4 mb-5 border border-[hsl(45,60%,80%)]/30">
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  {result.obsessionRate >= 80
                    ? "🔥 이 유형은 한번 빠지면 강하게 집착하는 경향이 있습니다. 당신에 대한 관심이 빠르게 깊어질 수 있어요."
                    : result.obsessionRate >= 60
                    ? "💛 적당한 수준의 집착을 보이며, 관심은 있지만 적절한 거리를 유지하려 합니다."
                    : "💨 이 유형은 자유를 중시하여 과도한 집착은 보이지 않지만, 관심이 있을 때는 확실하게 표현합니다."}
                </p>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-2">
                  {relationshipScore >= 65
                    ? "📈 이 유형과의 관계는 안정적으로 유지될 가능성이 높습니다."
                    : relationshipScore >= 50
                    ? "📊 초반 매력은 강하지만 장기적 안정성은 노력이 필요합니다."
                    : "📉 초반 매력은 강하지만 장기 안정성은 낮은 경우가 많습니다."}
                </p>
              </div>

              {/* Hidden Charm */}
              <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  숨겨진 매력 분석
                </h3>
                <p className="text-sm text-foreground/80 leading-[1.9]">
                  당신의 인스타 vibe에는 <strong className="text-foreground">{vibe.photoMood}</strong> 분위기와{" "}
                  <strong className="text-foreground">{vibe.vibeKeyword}</strong> 매력이 함께 있습니다.
                  이 조합은 <strong className="text-foreground">{result.title}</strong> 타입의 남자들에게
                  특히 매력적으로 작용합니다.
                </p>
                <div className="mt-3 p-3 rounded-xl bg-[hsl(45,60%,90%)]/50 border border-[hsl(45,60%,80%)]/30">
                  <p className="text-[11px] text-foreground/70 leading-relaxed">
                    💡 <strong className="text-foreground">AI 인사이트:</strong> {userVibe.title}인 당신은
                    겉으로 드러나는 매력 외에도 내면에서 풍기는 안정감과 깊이가 있어요.
                    이 숨겨진 매력이 상대방이 점점 더 빠져드는 핵심 원인입니다.
                  </p>
                </div>
              </div>

              {/* Premium Additional Types */}
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                  추가 남자 유형 심층 분석
                </h3>
                <div className="space-y-2.5">
                  {additionalTypes.map((t) => (
                    <div
                      key={t.id}
                      className={`rounded-2xl p-4 border border-[hsl(45,60%,80%)]/30 bg-gradient-to-br ${t.gradientClass} shadow-sm`}
                    >
                      <div className="flex items-center gap-3.5 mb-2">
                        <div className="text-3xl shrink-0">{t.emoji}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-foreground">{t.title}</h4>
                          <p className="text-[11px] text-muted-foreground leading-relaxed">
                            {t.oneLiner}
                          </p>
                        </div>
                      </div>
                      <p className="text-[11px] text-foreground/70 leading-relaxed pl-[3.25rem]">
                        {t.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Warning Type - Premium */}
              <div className="mb-5">
                <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-destructive" />
                  당신이 조심해야 할 남자 유형
                </h3>
                <div className="rounded-2xl p-5 border-2 border-destructive/20 bg-destructive/5 relative overflow-hidden">
                  <div className="absolute top-2 right-3 text-[10px] font-black text-destructive/40 uppercase tracking-widest">⚠ WARNING</div>
                  <div className="flex items-center gap-3.5 mt-2">
                    <div className="text-3xl shrink-0">{warningType.emoji}</div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-semibold text-foreground">{warningType.title}</h4>
                      <p className="text-[11px] text-muted-foreground leading-relaxed mt-1">
                        {warningType.oneLiner}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {warningType.cons.map((c) => (
                          <span
                            key={c}
                            className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full font-medium"
                          >
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <PremiumSections id={id} resultTitle={result.title} />

              {/* End of Premium */}
              <div className="flex items-center justify-center gap-2 mb-6 text-[10px] text-muted-foreground">
                <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                <span>Premium 분석 끝</span>
                <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
              </div>
              </div> {/* end premiumReportRef */}
            </div>
          )}

          {/* ====== SHARE & ACTIONS ====== */}

          {/* Share Card */}
          <div
            ref={shareCardRef}
            className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${result.gradientClass} border border-border/30`}
          >
            {premiumUnlocked && (
              <div className="inline-flex items-center gap-1.5 bg-[hsl(45,80%,60%)]/20 rounded-full px-3 py-1 mb-3">
                <Crown className="w-3 h-3 text-[hsl(45,80%,45%)]" />
                <span className="text-[10px] font-bold text-[hsl(45,80%,35%)]">PREMIUM</span>
              </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">
              내 인스타로 본
            </p>
            <p className="text-[11px] text-muted-foreground mb-4">나에게 꼬이는 남자 유형</p>
            <div className="text-5xl mb-3">{result.emoji}</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">
              {result.title}
            </h3>
            <div onClick={() => navigate("/")} className="inline-flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30 cursor-pointer hover:bg-card/80 transition-colors">
              <span className="text-xs font-semibold text-foreground">다시 테스트하기 →</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`grid ${premiumUnlocked ? "grid-cols-2" : "grid-cols-3"} gap-2 mb-3`}>
            <button
              onClick={handleCopyLink}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <LinkIcon className="w-4 h-4" />
              링크 복사
            </button>
            <button
              onClick={handleShareSNS}
              className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
            >
              <Share2 className="w-4 h-4" />
              SNS 공유
            </button>
            {!premiumUnlocked && (
              <button
                onClick={handleDownload}
                className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"
              >
                <Download className="w-4 h-4" />
                이미지 저장
              </button>
            )}
          </div>
          {premiumUnlocked && (
            <button
              onClick={handleDownloadPremiumReport}
              className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-3 shadow-md"
            >
              <Download className="w-4 h-4" />
              프리미엄 리포트 이미지 저장
            </button>
          )}
          <button
            onClick={() => navigate("/")}
            className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-10"
          >
            <RotateCcw className="w-4 h-4" />
            다시 테스트하기
          </button>

          <p className="text-[11px] text-muted-foreground text-center">
            © 2026 꼬이는 남자 유형 테스트 · 재미로 보는 테스트입니다
          </p>
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
