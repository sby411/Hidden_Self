import { Link } from "react-router-dom";
import { Scan, HeartHandshake, ArrowRight, Sparkles } from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const ServiceHubPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <div className="w-6 h-6 rounded-md gradient-ai flex items-center justify-center">
            <Scan className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-sm font-bold tracking-tight text-foreground">HiddenSelf</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center px-5 py-12 sm:py-16 relative overflow-hidden">
        <div className="absolute inset-0 pixel-grid opacity-50 pointer-events-none" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[hsl(355_70%_50%/0.04)] pointer-events-none" />

        <div className="w-full max-w-3xl relative z-10">
          <div className="text-center mb-10 sm:mb-14">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary/80 border border-border/60 px-3.5 py-1.5 text-xs font-medium text-muted-foreground mb-5">
              <Sparkles className="w-3 h-3 text-primary" />
              서비스 선택
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-foreground mb-4">
              HiddenSelf
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground font-medium max-w-xl mx-auto leading-relaxed">
              인스타그램 기반 연애 분석 리포트 서비스
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground/90 max-w-md mx-auto mt-3 leading-relaxed">
              인스타그램 데이터를 바탕으로 당신의 관계 패턴과 감정 흐름을 분석합니다.
            </p>
          </div>

          <div className="grid gap-4 sm:gap-5 sm:grid-cols-2">
            <Card className="glass-card border-border/50 card-hover flex flex-col h-full">
              <CardHeader className="pb-3 pt-6">
                <div className="w-10 h-10 rounded-xl gradient-danger flex items-center justify-center mb-3">
                  <Scan className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold leading-snug text-foreground">
                  나한테 꼬이는 남자 유형 분석
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  내 인스타그램 계정을 기반으로 어떤 남자 유형이 반복해서 끌리는지 분석합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-6 mt-auto">
                <Link
                  to="/attraction"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl gradient-danger text-white font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-[0.98] glow-danger"
                >
                  분석 시작하기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>

            <Card className="glass-card border-border/50 card-hover flex flex-col h-full">
              <CardHeader className="pb-3 pt-6">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(280,50%,45%)] to-[hsl(340,60%,40%)] flex items-center justify-center mb-3">
                  <HeartHandshake className="w-5 h-5 text-white" />
                </div>
                <CardTitle className="text-lg font-bold leading-snug text-foreground">
                  나와 그 사람의 재회 가능성 분석
                </CardTitle>
                <CardDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                  내 계정과 상대 계정을 기반으로 재접촉 가능성, 감정 온도차, 다시 이어질 수 있는 타이밍을 분석합니다.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0 pb-6 mt-auto">
                <Link
                  to="/reunion"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-secondary border border-border text-foreground font-bold text-sm hover:bg-muted/80 transition-all active:scale-[0.98]"
                >
                  재회 가능성 보기
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServiceHubPage;
