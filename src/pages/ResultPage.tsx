import { useSearchParams, useNavigate } from "react-router-dom";
import { getVibeAnalysis, getUserVibeType } from "@/data/sampleData";
import { Share2, RotateCcw, Download, LinkIcon, Lock, Heart, Camera, Palette, Waves, MessageCircle, AlertTriangle, ThumbsUp, ThumbsDown, Sparkles, HeartHandshake, Crown, ShieldCheck, Flame, TrendingUp, Eye, Clock, Users, UserPlus, Activity, Image, Hash, Zap, Brain, Target, Siren, Loader2, BookOpen } from "lucide-react";
import PremiumSections from "@/components/PremiumSections";
import { toast } from "sonner";
import React, { useRef, useCallback, useMemo, useState } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  
  // AI-generated dynamic analysis (includes real Instagram data)
  const { data: ai, loading: aiLoading, error: aiError } = useAiAnalysis(id);
  
  // Static data for vibe section (kept as-is)
  const vibe = getVibeAnalysis(id);
  const userVibe = getUserVibeType(id);

  const shareCardRef = useRef<HTMLDivElement>(null);
  const basicReportRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const premiumReportRef = useRef<HTMLDivElement>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);

  const premiumCharCount = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 3000;
    return 12000 + (Math.abs(h) % 3000);
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

  const isSharing = React.useRef(false);
  const isMobile = React.useMemo(() => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }, []);

  const handleShare = async () => {
    if (isSharing.current) return;
    isSharing.current = true;
    try {
      if (navigator.share && isMobile) {
        await navigator.share({
          title: "InstAI | 내 인스타로 보는 꼬이는 남자 유형",
          text: ai ? `내 인스타 vibe로 보니 나한테 꼬이는 유형은 '${ai.attractedType.name}'이래. 너도 해봐!` : "내 인스타 vibe 분석 결과 확인해봐!",
          url: window.location.href,
        });
        toast.success("공유창이 열렸어요");
      } else {
        await navigator.clipboard.writeText(window.location.href);
        toast.success("링크가 복사되었어요! 친구에게 공유해보세요 ✨");
      }
    } catch { /* user cancelled */ }
    finally { isSharing.current = false; }
  };

  const downloadNodeAsImage = useCallback(
    async (node: HTMLDivElement | null, filename: string, successMessage: string) => {
      if (!node) return;
      try {
        toast.info("리포트 이미지를 생성 중이에요...");
        const captureWidth = Math.max(node.offsetWidth, node.scrollWidth);
        const dataUrl = await toPng(node, {
          cacheBust: true,
          pixelRatio: 2,
          backgroundColor: "#faf9f7",
          width: captureWidth,
          style: { width: `${captureWidth}px`, minWidth: `${captureWidth}px`, maxWidth: `${captureWidth}px`, overflow: "visible", boxSizing: "border-box" },
        });
        const link = document.createElement("a");
        link.download = filename;
        link.href = dataUrl;
        link.click();
        toast.success(successMessage);
      } catch {
        toast.error("리포트 저장에 실패했어요");
      }
    },
    []
  );

  const handleDownload = useCallback(async () => {
    await downloadNodeAsImage(basicReportRef.current, `꼬이는남자유형-${ai?.attractedType.name || id}.png`, "이미지가 저장되었어요! 📸");
  }, [downloadNodeAsImage, ai, id]);

  const handleDownloadPremiumReport = useCallback(async () => {
    await downloadNodeAsImage(premiumReportRef.current, `프리미엄리포트-${ai?.attractedType.name || id}.png`, "프리미엄 리포트가 저장되었어요! 📸");
  }, [downloadNodeAsImage, ai, id]);

  // Derive Instagram display data from AI response
  const igProfile = ai?.instagramData?.profile;
  const igStats = ai?.instagramData?.stats;

  const vibeCards = [
    { icon: Camera, label: "사진 분위기", value: vibe.photoMood },
    { icon: Palette, label: "색감 톤", value: vibe.colorTone },
    { icon: Waves, label: "전체 vibe", value: vibe.vibeKeyword },
    { icon: MessageCircle, label: "캡션 스타일", value: vibe.captionStyle },
  ];

  // Loading state
  if (aiLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl gradient-ai flex items-center justify-center mx-auto mb-6 animate-pulse">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-2">AI가 분석 중이에요...</h2>
          <p className="text-sm text-muted-foreground mb-6">인스타 데이터를 불러오는 중입니다...</p>
          <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>@{id} 프로필 스캔 중</span>
          </div>
          <div className="mt-8 space-y-2">
            {["인스타 데이터 수집 중", "프로필 분위기 스캔", "심리 트리거 분석", "매력 유형 매칭"].map((step, i) => (
              <div key={step} className="flex items-center gap-2 text-xs text-muted-foreground animate-pulse" style={{ animationDelay: `${i * 0.3}s` }}>
                <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                {step}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (aiError || !ai) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-sm">
          <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
          <h2 className="text-lg font-bold text-foreground mb-2">분석에 실패했어요</h2>
          <p className="text-sm text-muted-foreground mb-6">{aiError || "다시 시도해주세요"}</p>
          <button
            onClick={() => window.location.reload()}
            className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">InstAI</span>
        </div>
        <span className="text-xs text-ai-highlight font-medium bg-ai-highlight/10 border border-ai-highlight/20 px-2.5 py-1 rounded-full">@{id}</span>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 pt-6 pb-10">
        <div className="w-full max-w-md">
          <div ref={basicReportRef}>
            {/* Report Header */}
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">Instagram Attraction Report</p>
              <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
            </div>

            {/* ====== CHAPTER 1: 인스타 프로필 분석 ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">01</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">인스타그램 프로필 분석</h2>
                  <p className="text-[10px] text-muted-foreground">@{id}의 계정을 AI가 스캔했습니다</p>
                </div>
              </div>

              {/* Profile Stats Cards */}
              <div className="grid grid-cols-3 gap-2 mb-4">
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                  <Image className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                  <p className="text-xl font-black text-foreground">{igProfile?.postsCount ?? 0}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">게시물</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                  <Users className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                  <p className="text-xl font-black text-foreground">{(igProfile?.followersCount ?? 0).toLocaleString()}</p>
                  <p className="text-[10px] text-muted-foreground font-medium">팔로워</p>
                </div>
                <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 p-3.5 text-center">
                  <UserPlus className="w-4 h-4 text-primary mx-auto mb-1.5 opacity-70" />
                  <p className="text-xl font-black text-foreground">{(igProfile?.followsCount ?? 0).toLocaleString()}</p>
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
                    <p className="text-base font-black text-foreground">{igStats?.avgLikes ?? 0}</p>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                    <Activity className="w-4 h-4 text-accent-foreground" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">참여율</p>
                    <p className="text-base font-black text-foreground">{igStats?.engagementRate ?? 0}%</p>
                  </div>
                </div>
              </div>

              {/* Additional Stats */}
              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">평균 댓글</p>
                    <p className="text-base font-black text-foreground">{igStats?.avgComments ?? 0}</p>
                  </div>
                </div>
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground">하이라이트</p>
                    <p className="text-base font-black text-foreground">{igProfile?.highlightReelCount ?? 0}</p>
                  </div>
                </div>
              </div>

              {/* Biography */}
              {igProfile?.biography && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> 바이오
                  </h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{igProfile.biography}</p>
                </div>
              )}

              {/* Top Hashtags from real data */}
              {igStats?.topHashtags && igStats.topHashtags.length > 0 && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1">
                    <Hash className="w-3 h-3" /> 자주 사용하는 해시태그
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {igStats.topHashtags.map((t) => (
                      <span key={t} className="text-[10px] bg-chip text-chip-foreground px-2 py-1 rounded-full font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* ====== CHAPTER 2: 인스타 Vibe 유형 ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">02</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">당신의 인스타 Vibe 분석</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 감지한 당신의 인스타 인상</p>
                </div>
              </div>

              {/* Insta Impression - AI generated */}
              <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  당신의 인스타 인상
                </h3>
                <p className="text-sm text-foreground/90 leading-[1.9]">{ai.instaImpression}</p>
              </div>

              {/* Vibe Keywords */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ai.vibeKeywords.map((kw) => (
                  <span key={kw} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">
                    #{kw}
                  </span>
                ))}
              </div>

              <div className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${userVibe.gradientClass} border border-border/30 shadow-sm`}>
                <div className="text-4xl mb-3">{userVibe.emoji}</div>
                <h2 className="text-xl font-bold text-foreground mb-3 tracking-tight">{userVibe.title}</h2>
                <p className="text-sm text-foreground/80 leading-[1.9] whitespace-pre-line">{userVibe.description}</p>
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

            {/* ====== CHAPTER 3: 심리 트리거 ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">03</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">당신이 유발하는 심리 트리거</h2>
                  <p className="text-[10px] text-muted-foreground">왜 특정 남자들이 당신에게 끌리는가</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {ai.psychTriggers.map((trigger, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 border-l-4 border-l-primary/60">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Target className="w-3 h-3 text-primary" />
                      </div>
                      <p className="text-sm text-foreground/85 leading-[1.8]">{trigger}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* ====== CHAPTER 4: 꼬이는 남자 유형 (CORE) ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">04</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">당신에게 꼬이는 남자 유형</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 도출한 고유 매칭 결과</p>
                </div>
              </div>

              {/* Dramatic Main Result Card */}
              <div className="relative mb-5">
                <div className="rounded-3xl p-8 text-center bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/30 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-foreground/5" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-foreground/5" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-border/30">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Generated Type</span>
                    </div>
                    <div className="text-7xl mb-4">{ai.attractedType.emoji}</div>
                    <h2 className="text-2xl font-black text-foreground mb-3 tracking-tight">{ai.attractedType.name}</h2>
                  </div>
                </div>
              </div>

              {/* Approach */}
              <div className="glass-card rounded-2xl p-5 mb-3 border-l-4 border-l-primary">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  🎯 접근 방식
                </h3>
                <p className="text-sm text-foreground/85 leading-[1.9]">{ai.attractedType.approach}</p>
              </div>

              {/* Early Behavior */}
              <div className="glass-card rounded-2xl p-5 mb-3 border-l-4 border-l-accent">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  💫 초반 행동 패턴
                </h3>
                <p className="text-sm text-foreground/85 leading-[1.9]">{ai.attractedType.earlyBehavior}</p>
              </div>

              {/* Feelings */}
              <div className="glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-destructive/60">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  💭 당신에 대한 감정
                </h3>
                <p className="text-sm text-foreground/85 leading-[1.9]">{ai.attractedType.feelings}</p>
              </div>

              {/* Attraction Stats */}
              <div className="glass-card rounded-2xl p-5 mb-5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">💓 매력 지표</h3>
                <div className="space-y-3.5">
                  {[
                    { label: "연상 끌림도", value: ai.attractionStats.olderAttraction },
                    { label: "동갑 끌림도", value: ai.attractionStats.sameAgeAttraction },
                    { label: "연하 끌림도", value: ai.attractionStats.youngerAttraction },
                    { label: "에겐력", value: ai.attractionStats.aegenPower },
                    { label: "테토력", value: ai.attractionStats.tetoPower },
                  ].map((stat) => (
                    <div key={stat.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-foreground">{stat.label}</span>
                        <span className="text-xs font-black text-primary">{stat.value}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${stat.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* ====== CHAPTER 5: 연애 패턴 ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">05</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">연애 패턴 분석</h2>
                  <p className="text-[10px] text-muted-foreground">이 남자와의 관계가 어떻게 흘러가는지</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                <div className="glass-card rounded-2xl p-5 border-l-4 border-l-[hsl(160,50%,45%)]">
                  <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">🌅 시작</h3>
                  <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern.beginning}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border-l-4 border-l-[hsl(45,70%,50%)]">
                  <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">🌤️ 중반</h3>
                  <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern.middle}</p>
                </div>
                <div className="glass-card rounded-2xl p-5 border-l-4 border-l-destructive/60">
                  <h3 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">⚡ 전환점</h3>
                  <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern.turningPoint}</p>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>

            {/* ====== CHAPTER 6: 리스크 ====== */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center text-xs font-black text-destructive">06</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">리스크 분석</h2>
                  <p className="text-[10px] text-muted-foreground">솔직하게 짚어드립니다</p>
                </div>
              </div>

              <div className="space-y-3 mb-5">
                {ai.risks.map((risk, i) => (
                  <div key={i} className="glass-card rounded-2xl p-4 border border-destructive/15">
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                        <Siren className="w-3 h-3 text-destructive" />
                      </div>
                      <p className="text-sm text-foreground/85 leading-[1.8]">{risk}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div> {/* end basicReportRef */}

          {/* ====== PREMIUM DIVIDER ====== */}
          {!premiumUnlocked ? (
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5 text-white" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">심층 분석 미리보기 🔓</h2>
                  <p className="text-[10px] text-muted-foreground">잠금 해제하고 전체 내용을 확인하세요</p>
                </div>
              </div>

              {/* Blurred preview of premium content */}
              <div className="relative mb-5 overflow-hidden rounded-2xl">
                <div className="pointer-events-none select-none" aria-hidden="true">
                  {/* AI Confidence preview */}
                  <div className="rounded-2xl p-4 mb-3 flex items-center gap-3 bg-gradient-to-r from-[hsl(45,60%,92%)] to-[hsl(35,50%,90%)] border border-[hsl(45,60%,80%)]/40">
                    <ShieldCheck className="w-8 h-8 text-[hsl(45,70%,50%)] shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                        <span className="text-sm font-black text-[hsl(45,70%,45%)]">{ai.confidence}%</span>
                      </div>
                      <Progress value={ai.confidence} className="h-2 rounded-full" />
                    </div>
                  </div>

                  {/* Premium preview cards - blurred */}
                  <div className="blur-[6px] space-y-3">
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                      <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                        <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                        이 남자가 당신에게 빠지는 결정적 순간
                      </h3>
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.decisiveMoment}</p>
                    </div>

                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                      <h3 className="text-sm font-bold text-foreground mb-3">💔 관계에서 무너지는 포인트</h3>
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.breakPoint}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(0,60%,95%)] to-card border border-[hsl(0,40%,85%)]/30 text-center">
                        <Flame className="w-5 h-5 text-destructive mx-auto mb-2" />
                        <p className="text-[10px] text-muted-foreground font-medium mb-1">집착 확률</p>
                        <p className="text-3xl font-black text-destructive">{ai.obsessionRate}%</p>
                      </div>
                      <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(160,30%,95%)] to-card border border-[hsl(160,30%,85%)]/30 text-center">
                        <TrendingUp className="w-5 h-5 text-[hsl(160,50%,40%)] mx-auto mb-2" />
                        <p className="text-[10px] text-muted-foreground font-medium mb-1">지속 가능성</p>
                        <p className="text-3xl font-black text-[hsl(160,50%,40%)]">{ai.relationshipScore}%</p>
                      </div>
                    </div>

                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                      <h3 className="text-sm font-bold text-foreground mb-3">💚 진짜 잘 맞는 남자 유형</h3>
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.perfectMatch}</p>
                    </div>

                    <div className="rounded-2xl p-5 bg-gradient-to-br from-destructive/5 to-card border border-destructive/15 border-l-4 border-l-destructive/50">
                      <h3 className="text-sm font-bold text-foreground mb-3">🚫 절대 피해야 할 유형</h3>
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.avoidType}</p>
                    </div>
                  </div>
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background pointer-events-none" style={{ top: '30%' }} />
                
                {/* CTA overlay */}
                <div className="absolute inset-0 flex items-center justify-center" style={{ top: '20%' }}>
                  <div className="text-center bg-card/80 backdrop-blur-md rounded-2xl p-5 border border-[hsl(45,60%,80%)]/50 shadow-xl mx-6">
                    <Lock className="w-6 h-6 text-[hsl(45,70%,50%)] mx-auto mb-2" />
                    <p className="text-xs font-bold text-foreground mb-1">{premiumCharCount.toLocaleString()}자 분량의 심층 분석이 잠겨있어요</p>
                    <p className="text-[10px] text-muted-foreground">아래 버튼으로 전체 결과를 확인하세요</p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleUnlockPremium}
                className="w-full h-14 rounded-2xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] relative overflow-hidden group"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
                <span className="relative flex items-center justify-center gap-2">
                  <Crown className="w-4 h-4" />
                  전체 분석 잠금 해제 ·{" "}
                  <span className="line-through text-white/60 text-xs">9,900원</span>{" "}
                  <span className="text-base font-black">4,900원</span>
                </span>
              </button>
              <p className="text-center text-[10px] text-destructive font-bold mt-2 animate-pulse">🔥 지금만 50% 할인 중!</p>
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
                      <span className="text-sm font-black text-[hsl(45,70%,45%)]">{ai.confidence}%</span>
                    </div>
                    <Progress value={ai.confidence} className="h-2 rounded-full" />
                  </div>
                </div>

                {/* Decisive Moment */}
                <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,50%)]" />
                    이 남자가 당신에게 빠지는 결정적 순간
                  </h3>
                  <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.decisiveMoment}</p>
                </div>

                {/* Break Point */}
                <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30 border-l-4 border-l-[hsl(45,70%,55%)]">
                  <h3 className="text-sm font-bold text-foreground mb-3">💔 관계에서 무너지는 포인트</h3>
                  <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.breakPoint}</p>
                </div>

                {/* Obsession & Relationship */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(0,60%,95%)] to-card border border-[hsl(0,40%,85%)]/30 text-center">
                    <Flame className="w-5 h-5 text-destructive mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">집착 확률</p>
                    <p className="text-3xl font-black text-destructive">{ai.obsessionRate}%</p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-destructive/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-destructive" style={{ width: `${ai.obsessionRate}%` }} />
                      </div>
                    </div>
                  </div>
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(160,30%,95%)] to-card border border-[hsl(160,30%,85%)]/30 text-center">
                    <TrendingUp className="w-5 h-5 text-[hsl(160,50%,40%)] mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">지속 가능성</p>
                    <p className="text-3xl font-black text-[hsl(160,50%,40%)]">{ai.relationshipScore}%</p>
                    <div className="mt-2">
                      <div className="h-1.5 bg-[hsl(160,30%,90%)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[hsl(160,50%,45%)]" style={{ width: `${ai.relationshipScore}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Perfect Match */}
                <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(160,30%,95%)] to-card border border-[hsl(160,30%,85%)]/30 border-l-4 border-l-[hsl(160,50%,45%)]">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    💚 당신에게 진짜 잘 맞는 남자 유형
                  </h3>
                  <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.perfectMatch}</p>
                </div>

                {/* Avoid Type */}
                <div className="rounded-2xl p-5 mb-5 border-2 border-destructive/20 bg-destructive/5 relative overflow-hidden">
                  <div className="absolute top-2 right-3 text-[10px] font-black text-destructive/40 uppercase tracking-widest">⚠ WARNING</div>
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5 mt-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    절대 피해야 할 유형
                  </h3>
                  <p className="text-sm text-foreground/80 leading-[1.9]">{ai.premiumPreview.avoidType}</p>
                </div>

                {/* Existing premium sections */}
                <PremiumSections id={id} resultTitle={ai.attractedType.name} />

                {/* End of Premium */}
                <div className="flex items-center justify-center gap-2 mb-6 text-[10px] text-muted-foreground">
                  <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                  <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                  <span>Premium 분석 끝</span>
                  <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                  <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                </div>
              </div>
            </div>
          )}

          {/* ====== SHARE & ACTIONS ====== */}
          <div
            ref={shareCardRef}
            className="rounded-3xl p-6 text-center mb-5 bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/30"
          >
            {premiumUnlocked && (
              <div className="inline-flex items-center gap-1.5 bg-[hsl(45,80%,60%)]/20 rounded-full px-3 py-1 mb-3">
                <Crown className="w-3 h-3 text-[hsl(45,80%,45%)]" />
                <span className="text-[10px] font-bold text-[hsl(45,80%,35%)]">PREMIUM</span>
              </div>
            )}
            <p className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground font-medium mb-1">내 인스타로 본</p>
            <p className="text-[11px] text-muted-foreground mb-4">나에게 꼬이는 남자 유형</p>
            <div className="text-5xl mb-3">{ai.attractedType.emoji}</div>
            <h3 className="text-2xl font-bold text-foreground mb-4 tracking-tight">{ai.attractedType.name}</h3>
            <div onClick={() => navigate("/")} className="inline-flex items-center gap-1 bg-card/60 backdrop-blur-sm rounded-full px-4 py-2 border border-border/30 cursor-pointer hover:bg-card/80 transition-colors">
              <span className="text-xs font-semibold text-foreground">다시 테스트하기 →</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className={`grid ${premiumUnlocked ? "grid-cols-2" : "grid-cols-3"} gap-2 mb-3`}>
            <button onClick={handleCopyLink} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform">
              <LinkIcon className="w-4 h-4" />링크 복사
            </button>
            <button onClick={handleShare} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform">
              <Share2 className="w-4 h-4" />공유
            </button>
            {!premiumUnlocked && (
              <button onClick={handleDownload} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform">
                <Download className="w-4 h-4" />이미지 저장
              </button>
            )}
          </div>
          {premiumUnlocked && (
            <button onClick={handleDownloadPremiumReport} className="w-full h-12 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-sm font-bold flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-3 shadow-md">
              <Download className="w-4 h-4" />프리미엄 리포트 이미지 저장
            </button>
          )}
          <button onClick={() => navigate("/")} className="w-full h-11 rounded-xl bg-secondary text-secondary-foreground text-sm font-medium flex items-center justify-center gap-2 active:scale-[0.97] transition-transform mb-10">
            <RotateCcw className="w-4 h-4" />다시 테스트하기
          </button>

          <Footer />
        </div>
      </main>
    </div>
  );
};

export default ResultPage;
