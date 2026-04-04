import { Link, useLocation, useNavigate } from "react-router-dom";
import { HeartHandshake, Lock, Thermometer, Shield, MessageCircleQuestion, Sparkles, ArrowLeft } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { reunionPremiumBlurCards, getReunionDummyMetrics } from "@/data/reunionDummyData";
import type { ReunionNavigateState } from "./ReunionLandingPage";

const ReunionResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReunionNavigateState | null;

  const myId = state?.myId ?? "demo_me";
  const theirId = state?.theirId ?? "demo_them";
  const lastContactLabel = state?.lastContactLabel ?? "—";
  const lastContact = state?.lastContact ?? "";

  const metrics = getReunionDummyMetrics(myId, theirId, lastContact || "default");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <div className="max-w-lg mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
              <HeartHandshake className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="text-sm font-bold tracking-tight text-foreground">재회 시그널</span>
          </div>
          <Link
            to="/attraction"
            className="text-[11px] text-muted-foreground hover:text-foreground transition-colors shrink-0"
          >
            연애 패턴 분석
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 py-8 pb-16">
        <div className="w-full max-w-md space-y-6">
          {!state && (
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-xs text-muted-foreground text-center">
              폼 없이 들어온 더미 화면입니다.{" "}
              <button type="button" className="text-primary font-semibold underline-offset-2 hover:underline" onClick={() => navigate("/reunion")}>
                /reunion에서 입력 후
              </button>{" "}
              이동하면 입력값이 반영된 더미 점수를 볼 수 있어요.
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/reunion")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            입력으로 돌아가기
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight mb-1">재회 가능성 스냅샷</h1>
            <p className="text-xs text-muted-foreground">
              @{myId} ↔ @{theirId} · 마지막 연락: {lastContactLabel}
            </p>
            <p className="text-[11px] text-muted-foreground/80 mt-2">※ 데모용 수치이며 실제 AI 분석이 아닙니다.</p>
          </div>

          <Card className="glass-card border-border/50 overflow-hidden">
            <CardHeader className="pb-2 pt-5">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base font-bold flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                  재회 가능성 점수
                </CardTitle>
                <span className="text-2xl font-black tabular-nums text-danger-highlight">{metrics.score}</span>
              </div>
            </CardHeader>
            <CardContent className="pb-5 space-y-2">
              <Progress value={metrics.score} className="h-2 bg-secondary" />
              <p className="text-[11px] text-muted-foreground">100에 가까울수록 긍정적 신호가 겹치는 편 (더미).</p>
            </CardContent>
          </Card>

          <div className="grid gap-3">
            <Card className="glass-card border-border/50">
              <CardHeader className="py-4 space-y-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Thermometer className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">현재 관계 온도차</p>
                    <p className="text-sm font-bold text-foreground mt-1">{metrics.temperatureLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{metrics.temperatureDetail}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="py-4 space-y-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <Shield className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">누가 더 방어적인지</p>
                    <p className="text-sm font-bold text-foreground mt-1">{metrics.defensiveLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{metrics.defensiveDetail}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>

            <Card className="glass-card border-border/50">
              <CardHeader className="py-4 space-y-0">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-lg bg-secondary flex items-center justify-center shrink-0">
                    <MessageCircleQuestion className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">지금 연락하면 먹힐 가능성</p>
                    <p className="text-sm font-bold text-foreground mt-1">{metrics.contactLabel}</p>
                    <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{metrics.contactDetail}</p>
                  </div>
                </div>
              </CardHeader>
            </Card>
          </div>

          <div className="space-y-3 pt-2">
            <p className="text-xs font-bold text-foreground flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[hsl(45,70%,55%)]" />
              프리미엄 심층 분석 (준비 중)
            </p>
            {reunionPremiumBlurCards.map((card) => (
              <div
                key={card.title}
                className="relative rounded-2xl border border-[hsl(45,40%,25%)]/40 bg-gradient-to-br from-[hsl(45,15%,8%)] to-[hsl(0,0%,6%)] overflow-hidden"
              >
                <div className="p-5 blur-[6px] select-none pointer-events-none opacity-70" aria-hidden>
                  <p className="text-sm font-bold text-foreground mb-2">{card.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{card.teaser}</p>
                  <p className="text-[10px] text-muted-foreground mt-3">
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed non risus.
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/55 backdrop-blur-[2px] px-4">
                  <Lock className="w-5 h-5 text-[hsl(45,70%,55%)]" />
                  <p className="text-xs font-bold text-center text-foreground">심층 리포트 잠금</p>
                  <p className="text-[10px] text-muted-foreground text-center">결제 연동 전 · UI만 표시</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ReunionResultPage;
