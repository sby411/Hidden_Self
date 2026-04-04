import { useSearchParams, useNavigate } from "react-router-dom";
import { getVibeAnalysis, getUserVibeType } from "@/data/sampleData";
import { Share2, RotateCcw, Download, LinkIcon, Lock, Heart, Camera, Palette, Waves, MessageCircle, AlertTriangle, Sparkles, HeartHandshake, Crown, ShieldCheck, Shield, Flame, TrendingUp, Eye, Clock, Users, UserPlus, Activity, Image, Hash, Zap, Brain, Target, Siren, Loader2, BookOpen, X, ChevronDown, BarChart3 } from "lucide-react";
import { toast } from "sonner";
import React, { useRef, useCallback, useMemo, useState, useEffect } from "react";
import { toPng } from "html-to-image";
import { Progress } from "@/components/ui/progress";
import Footer from "@/components/Footer";
import { useAiAnalysis } from "@/hooks/useAiAnalysis";
import { trackSubmissionSuccess, trackSubmissionFailed, trackPaymentSuccess } from "@/lib/trackSubmission";
import { requestPayment } from "@/lib/payment";

// ─── Inline CTA Button Component ───
const PremiumCTAButton = ({ onClick, loading, variant = "full" }: { onClick: () => void; loading: boolean; variant?: "full" | "compact" }) => (
  <button
    onClick={onClick}
    disabled={loading}
    className="w-full h-14 rounded-2xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-sm shadow-lg hover:shadow-xl transition-all active:scale-[0.98] relative overflow-hidden group disabled:opacity-70"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000" />
    <span className="relative flex items-center justify-center gap-2">
      {loading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          결제 진행중...
        </>
      ) : (
        <>
          <Crown className="w-4 h-4" />
          {variant === "full" ? "전체 분석 잠금 해제 · " : "잠금 해제 · "}
          <span className="line-through text-white/60 text-xs">9,900원</span>{" "}
          <span className="text-base font-black">4,900원</span>
        </>
      )}
    </span>
  </button>
);

// ─── Inline CTA Banner Component ───
const PremiumCTABanner = ({ onClick, loading, message, subMessage }: { onClick: () => void; loading: boolean; message: string; subMessage?: string }) => (
  <div className="my-6">
    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,20%,8%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,25%)]/40 text-center">
      <Lock className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-2" />
      <p className="text-xs font-bold text-foreground mb-1">{message}</p>
      {subMessage && <p className="text-[10px] text-muted-foreground mb-3">{subMessage}</p>}
      <PremiumCTAButton onClick={onClick} loading={loading} variant="compact" />
    </div>
  </div>
);

const ResultPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const id = searchParams.get("id") || "user";
  
  const { data: ai, loading: aiLoading, error: aiError } = useAiAnalysis(id);
  const vibe = getVibeAnalysis(id);
  const userVibe = getUserVibeType(id);

  const shareCardRef = useRef<HTMLDivElement>(null);
  const basicReportRef = useRef<HTMLDivElement>(null);
  const fullReportRef = useRef<HTMLDivElement>(null);
  const premiumRef = useRef<HTMLDivElement>(null);
  const premiumReportRef = useRef<HTMLDivElement>(null);
  const [premiumUnlocked, setPremiumUnlocked] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // Handle PortOne redirect callback (mobile REDIRECTION mode)
  useEffect(() => {
    const paymentIdParam = searchParams.get("paymentId");
    const codeParam = searchParams.get("code");

    if (paymentIdParam && !codeParam) {
      console.log("[PortOne] Redirect payment success:", paymentIdParam);
      setPremiumUnlocked(true);
      const submissionId = sessionStorage.getItem("instai_submission_id");
      if (submissionId) trackPaymentSuccess(submissionId);
      toast.success("결제가 완료되었습니다! 프리미엄 분석을 확인하세요 🎉");
      setTimeout(() => {
        premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 500);
    } else if (paymentIdParam && codeParam) {
      console.error("[PortOne] Redirect payment failed:", codeParam);
      toast.error("결제가 취소되었습니다.");
    }
  }, []);

  const socialProofCount = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 5000;
    return 1284 + (Math.abs(h) % 800);
  }, [id]);

  useEffect(() => {
    if (premiumUnlocked) {
      setShowStickyBar(false);
      return;
    }
    const handleScroll = () => {
      const scrollY = window.scrollY || document.documentElement.scrollTop;
      setShowStickyBar(scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [premiumUnlocked]);

  const premiumCharCount = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 3000;
    return 12000 + (Math.abs(h) % 3000);
  }, [id]);

  const [paymentLoading, setPaymentLoading] = useState(false);

  const handleUnlockPremium = async () => {
    if (paymentLoading) return;
    setPaymentLoading(true);
    try {
      const result = await requestPayment(id);
      if (result.success) {
        toast.success("결제가 완료되었습니다! 프리미엄 분석을 확인하세요 🎉");
        setPremiumUnlocked(true);
        const submissionId = sessionStorage.getItem("instai_submission_id");
        if (submissionId) trackPaymentSuccess(submissionId);
        setTimeout(() => {
          premiumRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 100);
      } else {
        toast.error(result.error_msg || "결제가 취소되었습니다.");
      }
    } catch (err) {
      toast.error("결제 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setPaymentLoading(false);
    }
  };

  const shareUrl = "https://insta-vibe-teller.lovable.app";

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
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
          title: "LOVE DNA | 내 인스타로 보는 꼬이는 남자 유형",
          text: ai ? `내 인스타 vibe로 보니 나한테 꼬이는 유형은 '${ai.attractedType.name}'이래. 너도 해봐!` : "내 인스타 vibe 분석 결과 확인해봐!",
          url: shareUrl,
        });
        toast.success("공유창이 열렸어요");
      } else {
        await navigator.clipboard.writeText(shareUrl);
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
        const wrapper = document.createElement("div");
        wrapper.style.cssText = `background-color:#0d0d0d;padding:24px 20px;display:inline-block;width:${node.scrollWidth + 40}px;`;
        const clone = node.cloneNode(true) as HTMLDivElement;
        clone.style.width = `${node.scrollWidth}px`;
        wrapper.appendChild(clone);
        document.body.appendChild(wrapper);
        const dataUrl = await toPng(wrapper, { cacheBust: true, pixelRatio: 2, backgroundColor: "#0d0d0d", style: { overflow: "visible" } });
        document.body.removeChild(wrapper);
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
    await downloadNodeAsImage(fullReportRef.current, `프리미엄리포트-${ai?.attractedType.name || id}.png`, "전체 리포트가 저장되었어요! 📸");
  }, [downloadNodeAsImage, ai, id]);

  const igProfile = ai?.instagramData?.profile;
  const igStats = ai?.instagramData?.stats;

  // Deterministic distribution stats from id
  const distributionStats = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 10000;
    const older = 20 + (h % 40);
    const same = 15 + ((h * 3) % 35);
    const younger = 100 - older - same;
    const extrovert = 30 + ((h * 7) % 45);
    const introvert = 100 - extrovert;
    const teto = ai?.attractionStats?.tetoPower ?? (40 + ((h * 11) % 45));
    const aegen = ai?.attractionStats?.aegenPower ?? (100 - teto);
    // locked stats
    const economic = ["상위 10%", "상위 30%", "평균 수준", "평균 이상"][h % 4];
    const dominant = 35 + ((h * 13) % 40);
    const clingy = 25 + ((h * 17) % 50);
    return { older, same, younger, extrovert, introvert, teto, aegen, economic, dominant, passive: 100 - dominant, clingy, distancing: 100 - clingy };
  }, [id, ai]);

  // Loading state
  const loadingSteps = useMemo(() => [
    { text: "인스타 데이터 수집 중...", target: 15 },
    { text: "당신의 인스타 첫인상 분석 중...", target: 35 },
    { text: "남자들이 느끼는 분위기 해석 중...", target: 55 },
    { text: "당신에게 끌리는 유형 찾는 중...", target: 70 },
    { text: "연애 패턴 분석 중...", target: 82 },
    { text: "AI가 흥미로운 패턴을 발견했습니다…", target: 90 },
    { text: "거의 다 끝났어요...", target: 96 },
  ], []);

  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [showComplete, setShowComplete] = useState(false);
  const wasLoading = React.useRef(false);

  useEffect(() => {
    if (aiLoading) {
      wasLoading.current = true;
      setShowComplete(false);
    } else if (wasLoading.current && ai) {
      wasLoading.current = false;
      setShowComplete(true);
      const submissionId = sessionStorage.getItem("instai_submission_id");
      if (submissionId) {
        trackSubmissionSuccess(submissionId, ai.attractedType?.name || "unknown");
      }
      const t = setTimeout(() => setShowComplete(false), 1200);
      return () => clearTimeout(t);
    } else if (wasLoading.current && aiError) {
      wasLoading.current = false;
      const submissionId = sessionStorage.getItem("instai_submission_id");
      if (submissionId) {
        trackSubmissionFailed(submissionId);
      }
    }
  }, [aiLoading, ai, aiError, id]);

  useEffect(() => {
    if (!aiLoading) return;
    setLoadingProgress(0);
    setLoadingStepIdx(0);
    const timings = [300, 800, 2500, 5000, 8000, 12000, 16000];
    const timeouts: ReturnType<typeof setTimeout>[] = [];
    timings.forEach((ms, i) => {
      timeouts.push(setTimeout(() => {
        setLoadingStepIdx(i);
        setLoadingProgress(loadingSteps[i].target);
      }, ms));
    });
    const interval = setInterval(() => {
      setLoadingProgress((prev) => prev >= 96 ? 96 : prev + 0.3);
    }, 200);
    return () => { timeouts.forEach(clearTimeout); clearInterval(interval); };
  }, [aiLoading, loadingSteps]);

  const teaserInsights = useMemo(() => [
    "너의 피드에서 반복되는 감정 패턴이 감지됐어...",
    "특정 유형의 남자가 너한테만 꼬이는 이유, 거의 다 찾았어...",
    "인스타 활동에서 무의식적으로 보내는 신호가 있어... 본인은 모를걸?",
    "이전 연애랑 지금 연애, 놀라울 정도로 같은 패턴이야...",
    "너한테 접근하는 남자들의 공통점이 보이기 시작했어...",
    "솔직히 말하면, 이 결과 보고 좀 불편할 수도 있어...",
  ], []);

  const [teaserIdx, setTeaserIdx] = useState(0);
  useEffect(() => {
    if (!aiLoading) return;
    const interval = setInterval(() => {
      setTeaserIdx((prev) => (prev + 1) % teaserInsights.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [aiLoading, teaserInsights]);

  // Accessibility score from AI text
  const accessibilityScore = useMemo(() => {
    let h = 0;
    for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100;
    return (1.5 + (h % 35) / 10).toFixed(1);
  }, [id]);

  const accessibilityLabel = useMemo(() => {
    const score = parseFloat(accessibilityScore);
    if (score <= 1.5) return "매우 쉬움";
    if (score <= 2.5) return "쉬움";
    if (score <= 3.5) return "보통";
    if (score <= 4.3) return "어려움";
    return "매우 어려움";
  }, [accessibilityScore]);

  if (aiLoading || showComplete) {
    const currentStep = showComplete ? { text: "결과를 정리 중입니다..." } : loadingSteps[loadingStepIdx];
    const progressPct = showComplete ? 100 : Math.min(Math.round(loadingProgress), 96);

    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-sm w-full">
          <div className={`w-16 h-16 rounded-2xl gradient-ai flex items-center justify-center mx-auto mb-6 ${showComplete ? '' : 'animate-pulse'}`}>
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-lg font-bold text-foreground mb-1">
            {showComplete ? "✅ 분석 완료되었습니다" : "AI가 분석 중이에요..."}
          </h2>
          <p className="text-sm text-muted-foreground mb-5">
            {showComplete ? "결과를 정리 중입니다..." : `@${id}의 매력 패턴을 해석하고 있어요`}
          </p>
          <div className="w-full mb-2">
            <div className="h-2.5 bg-secondary rounded-full overflow-hidden">
              <div className="h-full rounded-full gradient-primary transition-all duration-500 ease-out" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          <div className="flex justify-between items-center mb-6">
            <span className="text-xs text-muted-foreground">{currentStep.text}</span>
            <span className="text-xs font-bold text-primary">{progressPct}%</span>
          </div>
          {!showComplete ? (
            <div className="space-y-2.5 mb-8">
              {loadingSteps.slice(0, 5).map((step, i) => (
                <div key={step.text} className={`flex items-center gap-2.5 text-xs transition-all duration-300 ${i < loadingStepIdx ? 'text-primary font-medium' : i === loadingStepIdx ? 'text-foreground font-semibold' : 'text-muted-foreground/50'}`}>
                  <div className={`w-2 h-2 rounded-full transition-all duration-300 ${i < loadingStepIdx ? 'bg-primary scale-100' : i === loadingStepIdx ? 'bg-primary animate-pulse scale-125' : 'bg-muted-foreground/30'}`} />
                  {step.text.replace('...', '')}
                  {i < loadingStepIdx && <span className="text-primary">✓</span>}
                </div>
              ))}
            </div>
          ) : (
            <div className="mb-8 text-sm text-primary font-medium animate-pulse">잠시만 기다려주세요...</div>
          )}
          {!showComplete && loadingStepIdx >= 2 && (
            <div className="rounded-2xl p-4 bg-gradient-to-br from-primary/5 to-accent/5 border border-primary/15 animate-in fade-in duration-500">
              <div className="flex items-center gap-2 mb-1">
                <Sparkles className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI Insight</span>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed italic">"{teaserInsights[teaserIdx]}"</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Error state
  const isPrivateAccount = aiError === "PRIVATE_ACCOUNT";
  if (aiError || !ai) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-5">
        <div className="text-center max-w-sm">
          {isPrivateAccount ? (
            <>
              <Lock className="w-10 h-10 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">🔒 비공개 계정이에요</h2>
              <p className="text-sm text-muted-foreground mb-6">비공개 계정은 분석이 불가능해요.<br />인스타그램에서 계정을 <span className="text-foreground font-semibold">공개</span>로 전환한 후 다시 시도해주세요.</p>
            </>
          ) : (
            <>
              <AlertTriangle className="w-10 h-10 text-destructive mx-auto mb-4" />
              <h2 className="text-lg font-bold text-foreground mb-2">분석에 실패했어요</h2>
              <p className="text-sm text-muted-foreground mb-6">{aiError || "다시 시도해주세요"}</p>
            </>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={() => { sessionStorage.removeItem("instai_submission_id"); navigate(`/loading?id=${encodeURIComponent(id)}`, { replace: true }); }} className="h-11 px-6 rounded-xl bg-primary text-primary-foreground text-sm font-medium flex items-center justify-center gap-2 mx-auto">
              <RotateCcw className="w-4 h-4" />
              {isPrivateAccount ? "공개 전환 후 다시 시도" : "다시 시도"}
            </button>
            <button onClick={() => navigate("/")} className="text-sm text-muted-foreground hover:text-foreground transition-colors">처음으로 돌아가기</button>
          </div>
        </div>
      </div>
    );
  }

  // ═══════════════════════════════════════════
  // MAIN RESULT RENDER
  // ═══════════════════════════════════════════
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="px-5 py-4 flex items-center justify-between border-b border-border/50 backdrop-blur-sm bg-card/60">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">LOVE DNA</span>
        </div>
        <span className="text-xs text-ai-highlight font-medium bg-ai-highlight/10 border border-ai-highlight/20 px-2.5 py-1 rounded-full">@{id}</span>
      </header>

      <main className={`flex-1 flex flex-col items-center px-5 pt-6 ${!premiumUnlocked ? 'pb-24' : 'pb-10'}`}>
        <div className="w-full max-w-md">
          <div ref={fullReportRef}>
          <div ref={basicReportRef}>
            {/* Report Header */}
            <div className="text-center mb-6">
              <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-ai-highlight mb-1">Instagram Attraction Report</p>
              <div className="h-px w-12 mx-auto bg-ai-highlight/30" />
            </div>

            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 1: 인스타 프로필 분석 ====== */}
            {/* ═══════════════════════════════════════════ */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">01</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">인스타그램 프로필 분석</h2>
                  <p className="text-[10px] text-muted-foreground">@{id}의 계정을 AI가 스캔했습니다</p>
                </div>
              </div>

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

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-destructive/10 flex items-center justify-center"><Heart className="w-4 h-4 text-destructive" /></div>
                  <div><p className="text-[10px] text-muted-foreground">평균 좋아요</p><p className="text-base font-black text-foreground">{igStats?.avgLikes ?? 0}</p></div>
                </div>
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center"><Activity className="w-4 h-4 text-accent-foreground" /></div>
                  <div><p className="text-[10px] text-muted-foreground">참여율</p><p className="text-base font-black text-foreground">{igStats?.engagementRate ?? 0}%</p></div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><MessageCircle className="w-4 h-4 text-primary" /></div>
                  <div><p className="text-[10px] text-muted-foreground">평균 댓글</p><p className="text-base font-black text-foreground">{igStats?.avgComments ?? 0}</p></div>
                </div>
                <div className="glass-card rounded-2xl p-3.5 flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center"><BookOpen className="w-4 h-4 text-primary" /></div>
                  <div><p className="text-[10px] text-muted-foreground">하이라이트</p><p className="text-base font-black text-foreground">{igProfile?.highlightReelCount ?? 0}</p></div>
                </div>
              </div>

              {igProfile?.biography && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center gap-1"><BookOpen className="w-3 h-3" /> 바이오</h4>
                  <p className="text-sm text-foreground/80 leading-relaxed">{igProfile.biography}</p>
                </div>
              )}

              {igStats?.topHashtags && igStats.topHashtags.length > 0 && (
                <div className="glass-card rounded-2xl p-4 mb-4">
                  <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-2.5 flex items-center gap-1"><Hash className="w-3 h-3" /> 자주 사용하는 해시태그</h4>
                  <div className="flex flex-wrap gap-1.5">
                    {igStats.topHashtags.map((t) => (
                      <span key={t} className="text-[10px] bg-chip text-chip-foreground px-2 py-1 rounded-full font-medium">#{t}</span>
                    ))}
                  </div>
                </div>
              )}

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>


            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 2: 인스타 인상 (근거 기반) ====== */}
            {/* ═══════════════════════════════════════════ */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">02</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">당신의 인스타 인상</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 계정 데이터에서 읽어낸 이미지</p>
                </div>
              </div>

              <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary" />
                  남자들이 읽는 당신의 이미지
                </h3>
                <p className="text-sm text-foreground/90 leading-[1.9]">{ai.instaImpression}</p>
              </div>

              {/* Accessibility Score - condensed */}
              {ai.perceivedAccessibility && (
                <div className="relative glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-accent">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                      <Target className="w-4 h-4 text-accent-foreground" />
                      접근 난이도
                    </h3>
                    <div className="flex items-center gap-2">
                       <span className="text-[11px] font-bold text-accent-foreground bg-accent/30 px-2 py-0.5 rounded-full">{accessibilityLabel}</span>
                       <div className="flex items-center gap-1.5 bg-accent/20 rounded-full px-3 py-1">
                         <span className="text-lg font-black text-accent-foreground">{accessibilityScore}</span>
                         <span className="text-[10px] text-muted-foreground font-medium">/ 5.0</span>
                       </div>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/90 leading-[1.9]">{ai.perceivedAccessibility}</p>
                </div>
              )}

              {/* Vibe Keywords - 간략 */}
              <div className="flex flex-wrap gap-2 mb-5">
                {ai.vibeKeywords.slice(0, 5).map((kw) => (
                  <span key={kw} className="text-xs bg-primary/10 text-primary px-3 py-1.5 rounded-full font-semibold border border-primary/20">#{kw}</span>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>


            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 3: Vibe 유형 요약 (축소) ====== */}
            {/* ═══════════════════════════════════════════ */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">03</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">Vibe 유형 요약</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 감지한 전체 분위기</p>
                </div>
              </div>

              <div className={`rounded-3xl p-6 text-center mb-5 bg-gradient-to-br ${userVibe.gradientClass} border border-border/30 shadow-sm`}>
                <div className="text-4xl mb-3">{userVibe.emoji}</div>
                <h2 className="text-xl font-bold text-foreground mb-2 tracking-tight">{userVibe.title}</h2>
                <p className="text-sm text-foreground/70 leading-[1.7]">{userVibe.description.split('\n')[0]}</p>
              </div>

              <div className="grid grid-cols-2 gap-2.5 mb-5">
                {[
                  { icon: Camera, label: "사진 분위기", value: vibe.photoMood },
                  { icon: Palette, label: "색감 톤", value: vibe.colorTone },
                  { icon: Waves, label: "전체 vibe", value: vibe.vibeKeyword },
                  { icon: MessageCircle, label: "캡션 스타일", value: vibe.captionStyle },
                ].map((card) => (
                  <div key={card.label} className="glass-card rounded-2xl p-4 text-center">
                    <card.icon className="w-5 h-5 text-primary mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground mb-1">{card.label}</p>
                    <p className="text-sm font-bold text-foreground">{card.value}</p>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>


            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 4: 꼬이는 남자 유형 (핵심만) ====== */}
            {/* ═══════════════════════════════════════════ */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">04</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">당신에게 꼬이는 남자 유형</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 도출한 고유 매칭 결과</p>
                </div>
              </div>

              {/* Main Result Card */}
              <div className="relative mb-5">
                <div className="rounded-3xl p-8 text-center bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/30 shadow-lg relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full border border-foreground/5" />
                  <div className="absolute -bottom-8 -left-8 w-32 h-32 rounded-full border border-foreground/5" />
                  <div className="relative z-10">
                    <div className="inline-flex items-center gap-1.5 bg-card/50 backdrop-blur-sm rounded-full px-3 py-1 mb-4 border border-border/30">
                      <Sparkles className="w-3 h-3 text-primary" />
                      <span className="text-[10px] font-bold text-primary uppercase tracking-wider">AI가 발견한 매력 패턴</span>
                    </div>
                    <div className="text-7xl mb-4">{ai.attractedType.emoji}</div>
                    <h2 className="text-2xl font-black text-foreground mb-1 tracking-tight">{ai.attractedType.name}</h2>
                  </div>
                </div>
              </div>

              {/* Approach - 짧게만 보여줌 (feelings, earlyBehavior 제거) */}
              <div className="glass-card rounded-2xl p-5 mb-5 border-l-4 border-l-primary">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  🎯 이 유형이 당신에게 접근하는 방식
                </h3>
                <p className="text-sm text-foreground/85 leading-[1.9]">{ai.attractedType.approach}</p>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>


            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 5: 남자 유입 분포 (핵심 시각화) ====== */}
            {/* ═══════════════════════════════════════════ */}
            <div className="relative mb-8">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-8 h-8 rounded-lg gradient-ai flex items-center justify-center text-xs font-black text-white">05</div>
                <div>
                  <h2 className="text-sm font-bold text-foreground tracking-tight">남자 유입 성향 분포</h2>
                  <p className="text-[10px] text-muted-foreground">AI가 읽은 당신에게 끌리는 남자 분포</p>
                </div>
              </div>

              {/* FREE: 연상/동갑/연하 */}
              <div className="glass-card rounded-2xl p-5 mb-3">
                <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-primary" /> 당신에게 끌리는 남자 — 연령대 분포
                </h4>
                <div className="space-y-3">
                  {[
                    { label: "연상 남성", value: distributionStats.older, color: "from-[hsl(45,70%,50%)] to-[hsl(35,80%,45%)]" },
                    { label: "동갑 남성", value: distributionStats.same, color: "from-primary to-primary/80" },
                    { label: "연하 남성", value: distributionStats.younger, color: "from-accent to-accent/80" },
                  ].map((item) => (
                    <div key={item.label}>
                      <div className="flex justify-between items-center mb-1.5">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        <span className="text-sm font-black text-foreground">{item.value}%</span>
                      </div>
                      <div className="h-3 bg-secondary rounded-full overflow-hidden">
                        <div className={`h-full rounded-full bg-gradient-to-r ${item.color} transition-all`} style={{ width: `${item.value}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                {/* Blurred reason - premium */}
                {premiumUnlocked ? (
                  <div className="mt-4 rounded-xl p-3 bg-[hsl(45,20%,8%)]/60 border border-[hsl(45,40%,25%)]/30">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <Crown className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                      <span className="text-[9px] font-bold text-[hsl(45,70%,55%)] uppercase tracking-wider">Premium Insight</span>
                    </div>
                    <p className="text-[11px] text-foreground/80 leading-relaxed">당신의 계정에서 읽히는 성숙한 이미지와 안정감이 연상 남성의 접근 비율을 높이는 핵심 원인입니다. 바이오와 하이라이트 구성이 특정 연령대에게 더 강하게 어필하는 구조입니다.</p>
                  </div>
                ) : (
                  <div className="relative mt-4 rounded-xl overflow-hidden">
                    <div className="blur-[6px] select-none pointer-events-none p-3 bg-secondary/20 rounded-xl" aria-hidden="true">
                      <p className="text-[11px] text-foreground/70 leading-relaxed">당신의 계정에서 읽히는 성숙한 이미지와 안정감이 연상 남성의 접근 비율을 높이는 핵심 원인입니다. 바이오와 하이라이트 구성이 특정 연령대에게 더 강하게 어필하는 구조입니다.</p>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="flex items-center gap-1.5 bg-card/80 rounded-full px-2.5 py-1 border border-[hsl(45,40%,25%)]/40">
                        <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                        <span className="text-[9px] font-bold text-[hsl(45,70%,55%)]">왜 이런 분포가 나오는지 — 프리미엄에서 확인</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* FREE: 외향/내향 */}
              <div className="glass-card rounded-2xl p-5 mb-3">
                <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-primary" /> 당신에게 끌리는 남자 — 성향 분포
                </h4>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-xl bg-primary/5 border border-primary/10 p-3 text-center">
                    <p className="text-2xl font-black text-foreground">{distributionStats.extrovert}%</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">외향형 남성</p>
                  </div>
                  <div className="rounded-xl bg-accent/5 border border-accent/10 p-3 text-center">
                    <p className="text-2xl font-black text-foreground">{distributionStats.introvert}%</p>
                    <p className="text-[10px] text-muted-foreground font-medium mt-1">내향형 남성</p>
                  </div>
                </div>
                {/* Blurred reason - premium */}
                <div className="relative mt-4 rounded-xl overflow-hidden">
                  <div className="blur-[6px] select-none pointer-events-none p-3 bg-secondary/20 rounded-xl" aria-hidden="true">
                    <p className="text-[11px] text-foreground/70 leading-relaxed">당신의 피드 톤과 캡션 스타일이 외향적인 남성에게는 접근 가능성을, 내향적인 남성에게는 안전한 거리감을 동시에 느끼게 합니다.</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-card/80 rounded-full px-2.5 py-1 border border-[hsl(45,40%,25%)]/40">
                      <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                      <span className="text-[9px] font-bold text-[hsl(45,70%,55%)]">근거 분석 — 프리미엄에서 확인</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FREE: 테토/에겐 */}
              <div className="glass-card rounded-2xl p-5 mb-3">
                <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-primary" /> 당신에게 끌리는 남자 — 이미지 강도
                </h4>
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-foreground">테토 이미지 남성</span>
                      <span className="text-sm font-black text-primary">{distributionStats.teto}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full gradient-primary transition-all" style={{ width: `${distributionStats.teto}%` }} />
                    </div>
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-xs font-medium text-foreground">에겐 이미지 남성</span>
                      <span className="text-sm font-black text-accent-foreground">{distributionStats.aegen}%</span>
                    </div>
                    <div className="h-3 bg-secondary rounded-full overflow-hidden">
                      <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${distributionStats.aegen}%` }} />
                    </div>
                  </div>
                </div>
                {/* Blurred reason - premium */}
                <div className="relative mt-4 rounded-xl overflow-hidden">
                  <div className="blur-[6px] select-none pointer-events-none p-3 bg-secondary/20 rounded-xl" aria-hidden="true">
                    <p className="text-[11px] text-foreground/70 leading-relaxed">사진 구도와 색감, 셀카 비율에서 읽히는 이미지가 테스토스테론 우위형 남성을 자극하는 구조를 만들고 있습니다. 이 비율이 관계 패턴에 미치는 영향은 심층 분석에서 확인하세요.</p>
                  </div>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="flex items-center gap-1.5 bg-card/80 rounded-full px-2.5 py-1 border border-[hsl(45,40%,25%)]/40">
                      <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                      <span className="text-[9px] font-bold text-[hsl(45,70%,55%)]">이유 분석 — 프리미엄에서 확인</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* LOCKED: 경제력 / 주도형 / 집착형 */}
              <div className="relative rounded-2xl overflow-hidden mb-3">
                <div className="glass-card rounded-2xl p-5">
                  <h4 className="text-xs font-bold text-foreground mb-4 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)]" /> 심층 성향 분포
                    <span className="text-[9px] bg-[hsl(45,70%,55%)]/20 text-[hsl(45,70%,55%)] px-1.5 py-0.5 rounded-full font-bold">PREMIUM</span>
                  </h4>
                  <div className="space-y-3 blur-[7px] select-none pointer-events-none" aria-hidden="true">
                    {[
                      { label: "경제력 수준", value: distributionStats.economic },
                      { label: `주도형 ${distributionStats.dominant}% / 수동형 ${distributionStats.passive}%`, value: "" },
                      { label: `집착형 ${distributionStats.clingy}% / 거리두기형 ${distributionStats.distancing}%`, value: "" },
                    ].map((item) => (
                      <div key={item.label} className="flex justify-between items-center p-3 rounded-xl bg-secondary/30">
                        <span className="text-xs font-medium text-foreground">{item.label}</span>
                        {item.value && <span className="text-sm font-black text-foreground">{item.value}</span>}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center bg-card/30 backdrop-blur-[2px]">
                  <div className="flex items-center gap-1.5 bg-card/80 rounded-full px-3 py-1.5 border border-[hsl(45,40%,25%)]/40">
                    <Lock className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                    <span className="text-[10px] font-bold text-[hsl(45,70%,55%)]">프리미엄 잠금 해제 시 확인 가능</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-border to-transparent" />
            </div>


            {/* ═══════════════════════════════════════════ */}
            {/* ====== FREE SECTION 6: 핵심 한 줄 (근거 있게) ====== */}
            {/* ═══════════════════════════════════════════ */}
            {ai.harshTruth && (
              <div className="relative mb-8">
                <div className="rounded-2xl p-6 text-center bg-gradient-to-br from-destructive/10 via-card to-destructive/5 border border-destructive/20 shadow-lg">
                  <div className="inline-flex items-center gap-1.5 bg-destructive/10 rounded-full px-3 py-1 mb-4">
                    <Flame className="w-3 h-3 text-destructive" />
                    <span className="text-[10px] font-bold text-destructive uppercase tracking-wider">AI의 핵심 진단</span>
                  </div>
                  <p className="text-base font-bold text-foreground leading-[1.8] italic">
                    "{ai.harshTruth}"
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                    이 결론이 도출된 근거와 상세 분석은 아래 심층 리포트에서 확인할 수 있습니다.
                  </p>
                </div>
              </div>
            )}
          </div> {/* end basicReportRef */}


          {/* ═══════════════════════════════════════════════════════ */}
          {/* ══════ FREE → PAID BOUNDARY (최강 전환 구간) ══════ */}
          {/* ═══════════════════════════════════════════════════════ */}
          <div id="premium-section">
          {(() => {
            // ─── Build the FULL premium content (rendered for both locked/unlocked) ───
            const premiumContent = (
              <>
                {/* Premium Chapter Header */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center text-xs font-black text-white">P</div>
                  <div>
                    <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                      프리미엄 심층 분석
                      <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                        <Crown className="w-2.5 h-2.5" /> PREMIUM
                      </span>
                    </h2>
                    <p className="text-[10px] text-muted-foreground">총 {premiumCharCount.toLocaleString()}자 분량의 AI 심층 분석 리포트</p>
                  </div>
                </div>

                {/* P-0: AI Confidence */}
                <div className="rounded-2xl p-4 mb-5 flex items-center gap-3 bg-gradient-to-r from-[hsl(45,30%,12%)] to-[hsl(35,20%,8%)] border border-[hsl(45,30%,20%)]/40">
                  <ShieldCheck className="w-8 h-8 text-[hsl(45,70%,55%)] shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                      <span className="text-sm font-black text-[hsl(45,70%,55%)]">{ai.confidence}%</span>
                    </div>
                    <Progress value={ai.confidence} className="h-2 rounded-full" />
                    <p className="text-[10px] text-muted-foreground mt-1.5">총 {premiumCharCount.toLocaleString()}자 분량 · 10개 섹션 심층 분석</p>
                  </div>
                </div>

                {/* P-1: 심리 트리거 */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                    당신이 유발하는 심리 트리거
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-3">당신이 왜 특정 남성의 성향을 무의식적으로 자극하는지, 계정 데이터 기반으로 분석합니다.</p>
                  <div className="space-y-3">
                    {(ai.psychTriggers ?? []).map((trigger, i) => (
                      <div key={i} className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 border-l-4 border-l-[hsl(45,60%,45%)]">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-[hsl(45,50%,30%)]/15 flex items-center justify-center shrink-0 mt-0.5">
                            <Zap className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                          </div>
                          <p className="text-sm text-foreground/85 leading-[1.8]">{trigger}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* P-2: 결정적 순간 */}
                <div className="rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 border-l-4 border-l-[hsl(45,60%,45%)]">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                    이 남자가 당신에게 빠지는 결정적 순간
                  </h3>
                  <p className="text-sm text-foreground/80 leading-[1.9]">{ai.decisiveMoment}</p>
                </div>

                {/* P-3: 연애 패턴 */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                    당신의 연애 패턴
                  </h3>
                  <p className="text-[11px] text-muted-foreground mb-3">능력 있는 당신이 왜 연애만 시작하면 을이 되는지, 반복되는 패턴을 추적합니다.</p>
                  <div className="space-y-3">
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 border-l-4 border-l-[hsl(160,45%,40%)]">
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">🌅 시작</h4>
                      <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern?.beginning}</p>
                    </div>
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 border-l-4 border-l-[hsl(45,70%,50%)]">
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">🌤️ 중반</h4>
                      <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern?.middle}</p>
                    </div>
                    <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 border-l-4 border-l-destructive/60">
                      <h4 className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">⚡ 전환점</h4>
                      <p className="text-sm text-foreground/85 leading-[1.9]">{ai.datingPattern?.turningPoint}</p>
                    </div>
                  </div>
                </div>

                {/* P-4: 리스크 */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Siren className="w-4 h-4 text-destructive" />
                    관계에서 발생할 수 있는 리스크
                  </h3>
                  <div className="space-y-3">
                    {(ai.risks ?? []).map((risk, i) => (
                      <div key={i} className="rounded-2xl p-4 border border-destructive/15 bg-destructive/5">
                        <div className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                            <AlertTriangle className="w-3 h-3 text-destructive" />
                          </div>
                          <p className="text-sm text-foreground/85 leading-[1.8]">{risk}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* P-stats: 고급 지표 카드 */}
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(0,30%,12%)] to-card border border-[hsl(0,30%,20%)]/30 text-center">
                    <Flame className="w-5 h-5 text-destructive mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">집착 확률</p>
                    <p className="text-3xl font-black text-destructive">{ai.obsessionRate}%</p>
                    <div className="mt-2"><div className="h-1.5 bg-destructive/10 rounded-full overflow-hidden"><div className="h-full rounded-full bg-destructive" style={{ width: `${ai.obsessionRate}%` }} /></div></div>
                  </div>
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(160,15%,12%)] to-card border border-[hsl(160,15%,20%)]/30 text-center">
                    <TrendingUp className="w-5 h-5 text-[hsl(160,50%,50%)] mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">지속 가능성</p>
                    <p className="text-3xl font-black text-[hsl(160,50%,50%)]">{ai.relationshipScore}%</p>
                    <div className="mt-2"><div className="h-1.5 bg-[hsl(160,15%,15%)] rounded-full overflow-hidden"><div className="h-full rounded-full bg-[hsl(160,50%,40%)]" style={{ width: `${ai.relationshipScore}%` }} /></div></div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mb-5">
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30 text-center">
                    <Brain className="w-5 h-5 text-[hsl(45,70%,55%)] mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">감정 소모 위험도</p>
                    <p className="text-3xl font-black text-[hsl(45,70%,55%)]">{Math.min(95, Math.max(25, 100 - ai.relationshipScore + 15))}%</p>
                  </div>
                  <div className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(200,15%,12%)] to-card border border-[hsl(200,15%,20%)]/30 text-center">
                    <ShieldCheck className="w-5 h-5 text-[hsl(200,50%,55%)] mx-auto mb-2" />
                    <p className="text-[10px] text-muted-foreground font-medium mb-1">신뢰 가능성</p>
                    <p className="text-3xl font-black text-[hsl(200,50%,55%)]">{Math.min(92, Math.max(30, ai.relationshipScore + 8))}%</p>
                  </div>
                </div>

                {/* P-5: 잘 맞는 남자 vs 힘든 남자 */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                    잘 맞는 남자 vs 자주 꼬이지만 힘든 남자
                  </h3>
                  <div className="rounded-2xl p-5 mb-3 bg-gradient-to-br from-[hsl(160,15%,12%)] to-card border border-[hsl(160,15%,20%)]/30 border-l-4 border-l-[hsl(160,45%,40%)]">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      💚 잘 맞는 남자
                      {typeof ai.goodMatch === 'object' && <span className="text-xs font-medium text-[hsl(160,50%,50%)] bg-[hsl(160,50%,50%)]/10 px-2 py-0.5 rounded-full">{ai.goodMatch.type}</span>}
                    </h4>
                    {typeof ai.goodMatch === 'object' ? (
                      <div className="space-y-3">
                        <div><p className="text-[10px] font-bold text-[hsl(160,50%,50%)] uppercase tracking-wider mb-1">어떤 성향인지</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.goodMatch.personality}</p></div>
                        <div><p className="text-[10px] font-bold text-[hsl(160,50%,50%)] uppercase tracking-wider mb-1">왜 잘 맞는지</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.goodMatch.whyGoodFit}</p></div>
                        <div><p className="text-[10px] font-bold text-[hsl(160,50%,50%)] uppercase tracking-wider mb-1">이 남자가 하는 행동</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.goodMatch.behaviors}</p></div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.goodMatch}</p>
                    )}
                  </div>
                  <div className="rounded-2xl p-5 bg-gradient-to-br from-[hsl(0,20%,12%)] to-card border border-[hsl(0,20%,20%)]/30 border-l-4 border-l-destructive/50">
                    <h4 className="text-sm font-bold text-foreground mb-3 flex items-center gap-2">
                      💔 자주 꼬이지만 힘든 남자
                      {typeof ai.badMatch === 'object' && <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">{ai.badMatch.type}</span>}
                    </h4>
                    {typeof ai.badMatch === 'object' ? (
                      <div className="space-y-3">
                        <div><p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">어떤 성향인지</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.badMatch.personality}</p></div>
                        <div><p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">왜 반복적으로 끌리는지</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.badMatch.whyRepeated}</p></div>
                        <div><p className="text-[10px] font-bold text-destructive uppercase tracking-wider mb-1">실제 연애에서 생기는 문제</p><p className="text-sm text-foreground/80 leading-[1.9]">{ai.badMatch.problems}</p></div>
                      </div>
                    ) : (
                      <p className="text-sm text-foreground/80 leading-[1.9]">{ai.badMatch}</p>
                    )}
                  </div>
                </div>

                {/* P-6: Red Flags */}
                <div className="mb-5">
                  <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    절대 조심해야 할 Red Flag
                  </h3>
                  <div className="space-y-3">
                    {(ai.redFlags ?? []).map((flag, i) => {
                      const isObj = typeof flag === 'object' && flag !== null;
                      return (
                        <div key={i} className="rounded-2xl p-4 border-2 border-destructive/20 bg-destructive/5 relative overflow-hidden">
                          <div className="flex items-start gap-3">
                            <div className="w-7 h-7 rounded-full bg-destructive/10 flex items-center justify-center shrink-0 mt-0.5">
                              <span className="text-sm">{isObj ? (flag as any).emoji : '🚩'}</span>
                            </div>
                            <div className="flex-1">
                              {isObj && <p className="text-xs font-bold text-destructive mb-1">{(flag as any).label}</p>}
                              <p className="text-sm text-foreground/85 leading-[1.8]">{isObj ? (flag as any).description : String(flag)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* P-7: 행동 가이드 */}
                {ai.actionGuide && (
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                      잘 맞는 남자를 끌어들이는 행동 가이드
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: "스타일링 변화", emoji: "👗", items: ai.actionGuide.styling },
                        { title: "남자가 접근했을 때 반응", emoji: "💬", items: ai.actionGuide.responseStyle },
                        { title: "데이트 행동 전략", emoji: "💡", items: ai.actionGuide.datingBehavior },
                      ].map((section) => (
                        <div key={section.title} className="rounded-2xl p-4 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card border border-[hsl(45,30%,20%)]/30">
                          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-[hsl(45,50%,30%)]/15 flex items-center justify-center"><span className="text-[10px]">{section.emoji}</span></div>
                            {section.title}
                          </h4>
                          <div className="space-y-2">
                            {section.items.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 bg-[hsl(45,30%,15%)]/30 rounded-xl px-3 py-2.5">
                                <span className="text-[hsl(45,70%,55%)] text-xs mt-0.5">→</span>
                                <span className="text-[11px] text-foreground/80 leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* P-8: 피하는 방법 */}
                {ai.avoidGuide && (
                  <div className="mb-5">
                    <h3 className="text-sm font-bold text-foreground mb-3 flex items-center gap-1.5">
                      <Shield className="w-4 h-4 text-destructive" />
                      힘든 남자를 피하는 방법
                    </h3>
                    <div className="space-y-4">
                      {[
                        { title: "첫 만남에서 하지 말아야 할 행동", emoji: "🚫", items: ai.avoidGuide.firstMeeting, icon: <X className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />, style: "border-destructive/15 bg-destructive/5" },
                        { title: "관계 초반에서 경계해야 할 신호", emoji: "⚠️", items: ai.avoidGuide.earlyWarnings, icon: <AlertTriangle className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />, style: "border-destructive/15 bg-destructive/5" },
                        { title: "인스타에서 바꾸면 좋은 습관", emoji: "📱", items: ai.avoidGuide.instaHabits, icon: <span className="text-[hsl(45,70%,55%)] text-xs mt-0.5">✓</span>, style: "border-[hsl(45,30%,20%)]/30 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card" },
                      ].map((section) => (
                        <div key={section.title} className={`rounded-2xl p-4 border ${section.style}`}>
                          <h4 className="text-xs font-bold text-foreground mb-3 flex items-center gap-1.5">
                            <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center"><span className="text-[10px]">{section.emoji}</span></div>
                            {section.title}
                          </h4>
                          <div className="space-y-2">
                            {section.items.map((s, i) => (
                              <div key={i} className="flex items-start gap-2 bg-destructive/5 rounded-xl px-3 py-2.5">
                                {section.icon}
                                <span className="text-[11px] text-foreground/80 leading-relaxed">{s}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* End of Premium */}
                <div className="flex items-center justify-center gap-2 mb-6 text-[10px] text-muted-foreground">
                  <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                  <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                  <span>Premium 분석 끝</span>
                  <Crown className="w-3 h-3 text-[hsl(45,60%,60%)]" />
                  <div className="h-px flex-1 bg-[hsl(45,60%,80%)]/50" />
                </div>
              </>
            );

            // ─── LOCKED STATE ───
            return !premiumUnlocked ? (
              <div className="mb-8">
                {/* ═══ Conversion Boundary ═══ */}
                <div className="relative rounded-3xl p-6 mb-6 bg-gradient-to-br from-[hsl(0,0%,6%)] via-[hsl(45,10%,6%)] to-[hsl(0,0%,6%)] border border-[hsl(45,40%,20%)]/40 text-center overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
                  <div className="relative z-10">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center mx-auto mb-4 shadow-lg">
                      <Lock className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-base font-black text-foreground mb-2">여기까지는 표면 분석입니다</h3>
                    <p className="text-sm text-foreground/70 leading-[1.8] mb-1">
                      지금까지는 '보이는 이미지'만 본 결과입니다.
                    </p>
                    <p className="text-sm text-foreground/70 leading-[1.8] mb-4">
                      왜 같은 유형의 남자가 반복해서 꼬이는지,<br />
                      그리고 어떤 남자가 진짜 잘 맞는지는<br />
                      <span className="text-[hsl(45,70%,55%)] font-bold">아래 심층 분석에서 확인할 수 있습니다.</span>
                    </p>
                    <div className="flex items-center justify-center gap-2 text-[10px] text-muted-foreground mb-4">
                      <span>🔬 심리 트리거</span>
                      <span>·</span>
                      <span>📊 연애 패턴</span>
                      <span>·</span>
                      <span>🚩 Red Flag</span>
                    </div>
                    <PremiumCTAButton onClick={handleUnlockPremium} loading={paymentLoading} />
                    <p className="text-center text-[10px] text-muted-foreground mt-2">결제 후 즉시 프리미엄 분석 결과를 확인할 수 있습니다.</p>
                    <p className="text-center text-[10px] text-destructive font-bold mt-1 animate-pulse">🔥 지금만 50% 할인 중!</p>
                  </div>
                </div>

                {/* ═══ FULL Premium Content with Blur Overlay ═══ */}
                {/* Render actual content then overlay blur */}
                <div className="relative">
                  {/* Actual rendered premium content */}
                  <div className="select-none pointer-events-none" aria-hidden="true">
                    {/* Re-render premium sections with selective blur */}
                    
                    {/* Premium Header - visible */}
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center text-xs font-black text-white">P</div>
                      <div>
                        <h2 className="text-sm font-bold text-foreground tracking-tight flex items-center gap-1.5">
                          프리미엄 심층 분석
                          <span className="inline-flex items-center gap-1 bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white text-[10px] px-2 py-0.5 rounded-full font-bold">
                            <Crown className="w-2.5 h-2.5" /> PREMIUM
                          </span>
                        </h2>
                        <p className="text-[10px] text-muted-foreground">총 {premiumCharCount.toLocaleString()}자 분량의 AI 심층 분석 리포트</p>
                      </div>
                    </div>

                    {/* AI Confidence - visible title, blurred value */}
                    <div className="rounded-2xl p-4 mb-4 flex items-center gap-3 bg-gradient-to-r from-[hsl(45,30%,12%)] to-[hsl(35,20%,8%)] border border-[hsl(45,30%,20%)]/40">
                      <ShieldCheck className="w-8 h-8 text-[hsl(45,70%,55%)] shrink-0" />
                      <div className="flex-1">
                        <span className="text-xs font-semibold text-foreground">AI 분석 신뢰도</span>
                        <div className="blur-[6px] mt-1"><Progress value={ai.confidence} className="h-2 rounded-full" /></div>
                      </div>
                    </div>

                    {/* Each premium section: title visible, body blurred, with increasing content length */}
                    {[
                      { icon: <Target className="w-4 h-4 text-[hsl(45,70%,55%)]" />, title: "당신이 유발하는 심리 트리거", teaser: ai.premiumTeasers?.[0], bodyLines: 5 },
                      { icon: <HeartHandshake className="w-4 h-4 text-[hsl(45,70%,55%)]" />, title: "이 남자가 당신에게 빠지는 결정적 순간", teaser: ai.premiumTeasers?.[1], bodyLines: 4 },
                      { icon: <Clock className="w-4 h-4 text-[hsl(45,70%,55%)]" />, title: "당신의 연애 패턴", teaser: ai.premiumTeasers?.[2], bodyLines: 7 },
                      { icon: <Siren className="w-4 h-4 text-destructive" />, title: "관계에서 발생할 수 있는 리스크", teaser: ai.premiumTeasers?.[3], bodyLines: 5 },
                      { icon: <Users className="w-4 h-4 text-[hsl(45,70%,55%)]" />, title: "잘 맞는 남자 vs 자주 꼬이지만 힘든 남자", teaser: ai.premiumTeasers?.[4], bodyLines: 8 },
                      { icon: <AlertTriangle className="w-4 h-4 text-destructive" />, title: "절대 조심해야 할 Red Flag", teaser: ai.premiumTeasers?.[5], bodyLines: 5 },
                      { icon: <Sparkles className="w-4 h-4 text-[hsl(45,70%,55%)]" />, title: "잘 맞는 남자를 끌어들이는 행동 가이드", teaser: ai.premiumTeasers?.[6], bodyLines: 7 },
                      { icon: <Shield className="w-4 h-4 text-destructive" />, title: "힘든 남자를 피하는 방법", teaser: ai.premiumTeasers?.[7], bodyLines: 6 },
                    ].map((section, idx) => (
                      <div key={idx} className="rounded-2xl overflow-hidden border border-[hsl(45,30%,20%)]/30 bg-gradient-to-br from-[hsl(45,15%,10%)] to-card mb-4">
                        {/* Title - clearly visible */}
                        <div className="p-4 pb-2">
                          <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                            {section.icon}
                            {section.title}
                          </h3>
                        </div>
                        {/* Teaser sentence - visible */}
                        <div className="px-4 pb-1">
                          <p className="text-sm text-foreground/80 leading-[1.8] italic">
                            "{section.teaser ?? '이 섹션에는 당신만을 위한 심층 분석이 포함되어 있습니다...'}"
                          </p>
                        </div>
                        {/* Blurred body - LONG to show depth */}
                        <div className="px-4 pb-5 blur-[6px]">
                          {Array.from({ length: section.bodyLines }).map((_, i) => (
                            <div key={i} className={`${i > 0 ? 'mt-3' : 'mt-2'}`}>
                              <div className="rounded-xl p-3 bg-[hsl(45,15%,12%)] border border-[hsl(45,30%,18%)]/20">
                                <p className="text-sm text-foreground/50 leading-[1.8]">
                                  {i % 2 === 0 
                                    ? "당신의 인스타그램 데이터에서 발견된 패턴을 기반으로, 이 유형이 당신에게 반복적으로 끌리는 심리적 메커니즘을 분석합니다. 특히 계정의 분위기와 게시 패턴에서 무의식적으로 발신되는 신호가 핵심 요인입니다."
                                    : "이 분석은 실제 계정 활동 데이터와 AI 심리 모델을 결합하여 도출된 결과로, 단순한 성격 유형 분류를 넘어 당신만의 고유한 관계 역학을 심층적으로 해석합니다. 구체적인 행동 패턴과 감정 반응 사이클까지 포함됩니다."
                                  }
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}

                    {/* Blurred stats cards */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      {[
                        { icon: <Flame className="w-5 h-5 text-destructive" />, label: "집착 확률", color: "text-destructive", bg: "from-[hsl(0,30%,12%)]" },
                        { icon: <TrendingUp className="w-5 h-5 text-[hsl(160,50%,50%)]" />, label: "지속 가능성", color: "text-[hsl(160,50%,50%)]", bg: "from-[hsl(160,15%,12%)]" },
                        { icon: <Brain className="w-5 h-5 text-[hsl(45,70%,55%)]" />, label: "감정 소모 위험도", color: "text-[hsl(45,70%,55%)]", bg: "from-[hsl(45,15%,10%)]" },
                        { icon: <ShieldCheck className="w-5 h-5 text-[hsl(200,50%,55%)]" />, label: "신뢰 가능성", color: "text-[hsl(200,50%,55%)]", bg: "from-[hsl(200,15%,12%)]" },
                      ].map((stat) => (
                        <div key={stat.label} className={`rounded-2xl p-4 bg-gradient-to-br ${stat.bg} to-card border border-border/20 text-center`}>
                          <div className="mx-auto mb-2">{stat.icon}</div>
                          <p className="text-[10px] text-muted-foreground font-medium mb-1">{stat.label}</p>
                          <div className="blur-[7px]"><p className={`text-3xl font-black ${stat.color}`}>??%</p></div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Mid-section CTA overlay */}
                  <div className="absolute top-[40%] left-0 right-0 z-10">
                    <PremiumCTABanner onClick={handleUnlockPremium} loading={paymentLoading} message="AI가 발견한 숨겨진 연애 패턴" subMessage={`이미 ${socialProofCount.toLocaleString()}명이 확인했습니다`} />
                  </div>

                  {/* Bottom gradient fade */}
                  <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-background to-transparent z-[5]" />
                </div>

                {/* ═══ Final CTA + 상품 정보 ═══ */}
                <div className="relative z-10 mt-4">
                  {/* Lock message */}
                  <div className="flex justify-center mb-5">
                    <div className="text-center bg-card/80 backdrop-blur-md rounded-2xl p-5 border border-[hsl(45,30%,20%)]/50 shadow-xl">
                      <Lock className="w-6 h-6 text-[hsl(45,70%,55%)] mx-auto mb-2" />
                      <p className="text-xs font-bold text-foreground mb-1">{premiumCharCount.toLocaleString()}자 분량의 심층 분석이 잠겨 있습니다</p>
                      <p className="text-[10px] text-muted-foreground leading-relaxed mt-1">
                        왜 특정 남자를 반복해서 끌어들이는지,<br />
                        그리고 어떤 남자가 진짜 잘 맞는지 확인해보세요.
                      </p>
                    </div>
                  </div>

                  {/* 상품 정보 */}
                  <div className="rounded-2xl border border-border/50 bg-card/60 backdrop-blur-sm p-5 mb-4 text-left">
                    <h4 className="text-xs font-bold text-muted-foreground tracking-widest mb-3">[상품 정보]</h4>
                    <div className="space-y-2.5 text-sm text-foreground/90">
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground">상품명</span>
                        <p className="text-sm font-semibold mt-0.5">인스타 연애 패턴 심층 분석 리포트</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground">상품 설명</span>
                        <p className="text-xs leading-relaxed mt-0.5 text-foreground/80">
                          AI가 실제 인스타그램 활동 데이터를 기반으로<br />
                          당신의 연애 패턴, 끌리는 남자 유형, 관계 리스크를 분석한<br />
                          프리미엄 디지털 리포트를 제공합니다.
                        </p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground">포함 내용 (10개 섹션)</span>
                        <ul className="text-xs mt-1 space-y-0.5 text-foreground/80 list-none">
                          <li>• 당신이 유발하는 심리 트리거 분석</li>
                          <li>• 이 남자가 빠지는 결정적 순간</li>
                          <li>• 반복되는 연애 패턴 분석</li>
                          <li>• 관계 리스크 분석</li>
                          <li>• 고급 지표 (집착 확률 / 지속 가능성 / 감정 소모 / 신뢰도)</li>
                          <li>• 잘 맞는 남자 vs 힘든 남자 심층 비교</li>
                          <li>• 반드시 조심해야 할 Red Flag</li>
                          <li>• 잘 맞는 남자를 끌어들이는 행동 가이드</li>
                          <li>• 힘든 남자를 피하는 구체적 방법</li>
                          <li>• 심층 성향 분포 (경제력/주도형/집착형)</li>
                        </ul>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground">분량</span>
                        <p className="text-xs mt-0.5 text-foreground/80">약 {premiumCharCount.toLocaleString()}자 (A4 기준 약 {Math.round(premiumCharCount / 1500)}페이지)</p>
                      </div>
                      <div>
                        <span className="text-[11px] font-bold text-muted-foreground">상품 형태</span>
                        <p className="text-xs mt-0.5 text-foreground/80">디지털 콘텐츠 (결제 후 즉시 열람 가능)</p>
                      </div>
                    </div>
                  </div>

                  <PremiumCTAButton onClick={handleUnlockPremium} loading={paymentLoading} />
                  <p className="text-center text-[10px] text-muted-foreground mt-2">결제 후 즉시 프리미엄 분석 결과를 확인할 수 있습니다.</p>
                  <p className="text-center text-[10px] text-destructive font-bold mt-1 animate-pulse">🔥 지금만 50% 할인 중!</p>
                </div>
              </div>
            ) : (
              // ─── UNLOCKED STATE ───
              <div ref={premiumRef}>
                <div ref={premiumReportRef}>
                  {premiumContent}
                </div>
              </div>
            );
          })()}
          </div> {/* end premium-section */}
          </div> {/* end fullReportRef */}

          {/* ====== SHARE & ACTIONS ====== */}
          <div ref={shareCardRef} className="rounded-3xl p-6 text-center mb-5 bg-gradient-to-br from-primary/10 via-card to-accent/10 border border-border/30">
            {premiumUnlocked && (
              <div className="inline-flex items-center gap-1.5 bg-[hsl(45,60%,50%)]/15 rounded-full px-3 py-1 mb-3">
                <Crown className="w-3 h-3 text-[hsl(45,70%,55%)]" />
                <span className="text-[10px] font-bold text-[hsl(45,70%,55%)]">PREMIUM</span>
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

          <div className={`grid ${premiumUnlocked ? "grid-cols-2" : "grid-cols-3"} gap-2 mb-3`}>
            <button onClick={handleCopyLink} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"><LinkIcon className="w-4 h-4" />링크 복사</button>
            <button onClick={handleShare} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"><Share2 className="w-4 h-4" />공유</button>
            {!premiumUnlocked && (
              <button onClick={handleDownload} className="h-12 rounded-xl bg-secondary text-secondary-foreground text-xs font-medium flex flex-col items-center justify-center gap-1 active:scale-[0.96] transition-transform"><Download className="w-4 h-4" />이미지 저장</button>
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

      {/* ====== STICKY BOTTOM BAR ====== */}
      {showStickyBar && !premiumUnlocked && (
        <div className="fixed bottom-0 left-0 right-0 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="max-w-md mx-auto px-4 pb-4">
            <div className="rounded-2xl bg-gradient-to-r from-[hsl(0,0%,8%)] to-[hsl(35,15%,8%)] border border-[hsl(45,40%,25%)]/40 shadow-[0_-4px_30px_rgba(0,0,0,0.5),0_0_20px_hsl(45,70%,55%,0.1)] backdrop-blur-xl p-3.5 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-foreground truncate">숨겨진 연애 패턴 확인하기</p>
                <p className="text-[10px] text-muted-foreground truncate">이미 {socialProofCount.toLocaleString()}명이 확인했습니다</p>
              </div>
              <button
                onClick={() => {
                  const unlockBtn = document.getElementById('unlock-premium-btn');
                  if (unlockBtn) {
                    unlockBtn.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  } else {
                    // Scroll to premium section boundary
                    document.getElementById('premium-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="shrink-0 h-9 px-4 rounded-xl bg-gradient-to-r from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white font-bold text-[11px] flex items-center gap-1.5 active:scale-[0.96] transition-all shadow-md"
              >
                <Crown className="w-3 h-3" />
                4,900원
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResultPage;
