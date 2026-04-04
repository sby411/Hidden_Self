import type { ElementType } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  HeartHandshake,
  Lock,
  Sparkles,
  ArrowLeft,
  User,
  UserCircle,
  Scan,
  Brain,
  Heart,
  Scale,
  Compass,
  ListChecks,
} from "lucide-react";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getReunionFullReport } from "@/data/reunionDummyData";
import type { ReunionNavigateState } from "./ReunionLandingPage";

function ScoreBlock({
  label,
  value,
  hint,
}: {
  label: string;
  value: number;
  hint: string;
}) {
  return (
    <div className="rounded-xl border border-border/50 bg-card/60 p-3 space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</span>
        <span className="text-lg font-black tabular-nums text-foreground">{value}</span>
      </div>
      <Progress value={value} className="h-1.5 bg-secondary" />
      <p className="text-[10px] text-muted-foreground leading-snug">{hint}</p>
    </div>
  );
}

function SectionTitle({ icon: Icon, children }: { icon: ElementType; children: React.ReactNode }) {
  return (
    <h2 className="text-sm font-bold text-foreground flex items-center gap-2 mt-10 first:mt-0 mb-3">
      <Icon className="w-4 h-4 text-primary shrink-0" />
      {children}
    </h2>
  );
}

function SignalNote({ text }: { text: string }) {
  return (
    <p className="text-[10px] text-muted-foreground/90 leading-relaxed border-l-2 border-primary/30 pl-2.5 py-0.5 mb-3">
      <span className="font-semibold text-muted-foreground">참고한 표면 신호: </span>
      {text}
    </p>
  );
}

const ReunionResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as ReunionNavigateState | null;

  const myId = state?.myId ?? "demo_me";
  const theirId = state?.theirId ?? "demo_them";
  const lastContactLabel = state?.lastContactLabel ?? "—";
  const lastContact = state?.lastContact ?? "";

  const report = getReunionFullReport(myId, theirId, lastContact || "default");
  const { scores, myProfileSignals, theirProfileSignals, theirFocus, synthesis, actionGuide, premiumLocked } = report;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="px-5 py-4 border-b border-border/40 backdrop-blur-sm bg-card/60">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
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

      <main className="flex-1 flex flex-col items-center px-5 py-8 pb-20">
        <div className="w-full max-w-2xl">
          {!state && (
            <div className="rounded-xl border border-border/60 bg-secondary/40 px-4 py-3 text-xs text-muted-foreground text-center mb-6">
              폼 없이 들어온 더미 화면입니다.{" "}
              <button
                type="button"
                className="text-primary font-semibold underline-offset-2 hover:underline"
                onClick={() => navigate("/reunion")}
              >
                /reunion에서 입력 후
              </button>{" "}
              이동하면 입력 조합에 따라 더미 해석이 바뀝니다.
            </div>
          )}

          <button
            type="button"
            onClick={() => navigate("/reunion")}
            className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors mb-6"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            입력으로 돌아가기
          </button>

          {/* 1. 상단 요약 */}
          <div className="space-y-4 mb-2">
            <div>
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-1">
                인스타그램 신호 기반 · 관계 리포트
              </p>
              <h1 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">{report.summaryTitle}</h1>
              <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                @{myId} · @{theirId} · 마지막 연락: {lastContactLabel}
              </p>
            </div>

            <Card className="glass-card border-border/50 border-l-4 border-l-primary/50">
              <CardContent className="pt-5 pb-5">
                <p className="text-sm text-foreground leading-relaxed font-medium">{report.summaryLine}</p>
                <p className="text-[10px] text-muted-foreground mt-3 leading-relaxed">
                  타로·운세가 아니라, 공개 프로필에서 보이는 <span className="text-foreground/90">톤·리듬·노출 패턴</span>
                  을 바탕으로 한 <span className="font-semibold text-foreground">가능성 해석</span>입니다. 단정적 사실이나
                  확정 판정이 아닙니다.
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <ScoreBlock
                label="재회 가능성"
                value={scores.reunionPossibility}
                hint="두 계정 신호를 합친 종합 구간 (높을수록 여지)"
              />
              <ScoreBlock
                label="상대 재회 개방도"
                value={scores.theirReunionOpenness}
                hint="상대 계정에서 읽힌 열림·방어의 균형"
              />
              <ScoreBlock
                label="지금 연락 적합도"
                value={scores.contactTimingFit}
                hint="말투·타이밍 리스크를 감안한 적합도"
              />
            </div>

            <p className="text-[10px] text-muted-foreground/80 text-center">
              ※ 데모 데이터입니다. 실제 크롤링·AI 분석 연동 시 같은 필드에 결과가 채워집니다.
            </p>
          </div>

          <Separator className="my-8 bg-border/60" />

          {/* 2A. 내 계정 */}
          <SectionTitle icon={User}>내 계정 분석 (@{myId})</SectionTitle>
          <SignalNote text={myProfileSignals.observedFrom} />
          <div className="space-y-3">
            {[
              { k: "현재 감정 상태 시그널", v: myProfileSignals.emotionalState },
              { k: "관계에 대한 개방성", v: myProfileSignals.relationshipOpenness },
              { k: "미련·정리 상태로 읽히는 부분", v: myProfileSignals.lingeringAttachment },
              { k: "연락을 시도할 가능성이 높은 타입인지", v: myProfileSignals.contactInitiationTendency },
            ].map((row) => (
              <Card key={row.k} className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    {row.k}
                  </CardTitle>
                  <p className="text-sm text-foreground leading-relaxed font-normal">{row.v}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* 2B. 상대 계정 */}
          <SectionTitle icon={UserCircle}>상대 계정 분석 (@{theirId})</SectionTitle>
          <SignalNote text={theirProfileSignals.observedFrom} />
          <div className="space-y-3">
            {[
              { k: "현재 감정 상태 시그널", v: theirProfileSignals.emotionalState },
              { k: "관계에 대한 개방성", v: theirProfileSignals.relationshipOpenness },
              { k: "새로운 사람을 받아들일 준비로 읽히는 부분", v: theirProfileSignals.newPeopleReadiness },
              { k: "재회에 열려 있는지 (가능성 톤)", v: theirProfileSignals.reunionOpenness },
              { k: "먼저 연락할 가능성", v: theirProfileSignals.likelyToReachOutFirst },
            ].map((row) => (
              <Card key={row.k} className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    {row.k}
                  </CardTitle>
                  <p className="text-sm text-foreground leading-relaxed font-normal">{row.v}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Separator className="my-8 bg-border/60" />

          {/* 3. 상대 중심 핵심 리포트 */}
          <SectionTitle icon={Scan}>상대 중심 핵심 리포트</SectionTitle>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            아래는 상대 계정 신호를 중심으로 한 해석입니다.{" "}
            <span className="font-semibold text-foreground">가능성이 높다/낮다/이렇게 읽힌다</span> 수준으로 적었으며,
            단정적 판결은 피했습니다.
          </p>
          <div className="space-y-3">
            {[
              { k: "성별·관계 맥락 시그널", v: theirFocus.genderOrContextSignal },
              { k: "현재 관계 개방성", v: theirFocus.currentRelationshipOpenness },
              { k: "지금 다른 사람을 만날 가능성 신호", v: theirFocus.likelyDatingSomeoneSignals },
              { k: "상대의 관계 성향", v: theirFocus.relationshipStyle },
              { k: "무의식적 방어 패턴", v: theirFocus.unconsciousDefensePattern },
              { k: "재회를 완전히 닫았는지, 해석 여지가 남는지", v: theirFocus.reunionClosureRead },
            ].map((row) => (
              <Card key={row.k} className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                    {row.k}
                  </CardTitle>
                  <p className="text-sm text-foreground leading-relaxed font-normal">{row.v}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          {/* API 친화 축 요약 (재회·개방·교제·무의식·타이밍) */}
          <SectionTitle icon={Brain}>신호 축으로 정리 (가능성)</SectionTitle>
          <div className="space-y-3">
            {[
              { k: "재회 준비·열림", v: report.reunionReadiness },
              { k: "관계 개방성", v: report.relationshipOpenness },
              { k: "새 만남 가능성 신호", v: report.currentDatingLikelihood },
              { k: "무의식적 패턴", v: report.unconsciousPattern },
              { k: "연락 타이밍", v: report.contactTiming },
            ].map((row) => (
              <Card key={row.k} className="glass-card border-border/40 bg-card/40">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{row.k}</CardTitle>
                  <p className="text-sm text-foreground leading-relaxed font-normal">{row.v}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Separator className="my-8 bg-border/60" />

          {/* 4. 종합 해석 */}
          <SectionTitle icon={Scale}>재회 가능성 종합 해석</SectionTitle>
          <div className="space-y-4">
            {[
              { k: "왜 점수가 이 구간인지", v: synthesis.whyThisScore },
              { k: "지금 가장 큰 변수", v: synthesis.keyVariable },
              { k: "닫혀 보일 때 (가능한 이유)", v: synthesis.ifClosedWhy },
              { k: "열려 보일 때 (어떤 방식인지)", v: synthesis.ifOpenHow },
            ].map((row) => (
              <div key={row.k}>
                <p className="text-[11px] font-bold text-primary mb-1.5">{row.k}</p>
                <p className="text-sm text-foreground/95 leading-relaxed">{row.v}</p>
              </div>
            ))}
          </div>

          <Separator className="my-8 bg-border/60" />

          {/* 5. 행동 가이드 */}
          <SectionTitle icon={Compass}>행동 가이드</SectionTitle>
          <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
            근거로 읽힌 신호와, 감정이 상하지 않도록 하는 완충을 함께 담았습니다.
          </p>
          <div className="space-y-3">
            {[
              { k: "지금 연락해도 될까", v: actionGuide.contactNowGuidance },
              { k: "기다림이 나을 수 있는 경우", v: actionGuide.waitGuidance },
              { k: "절대 피하는 편이 좋은 행동", v: actionGuide.avoidActions },
              { k: "연락한다면 어떤 톤이 덜 자극적인지", v: actionGuide.toneIfContact },
            ].map((row) => (
              <Card key={row.k} className="glass-card border-border/50">
                <CardHeader className="py-3 px-4 space-y-1">
                  <CardTitle className="text-xs font-bold text-foreground flex items-center gap-2">
                    <ListChecks className="w-3.5 h-3.5 text-[hsl(45,70%,55%)]" />
                    {row.k}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground leading-relaxed font-normal">{row.v}</p>
                </CardHeader>
              </Card>
            ))}
          </div>

          <Card className="mt-6 glass-card border-[hsl(45,35%,28%)]/35 bg-gradient-to-br from-[hsl(45,12%,10%)] to-card">
            <CardHeader className="py-4 px-4">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Heart className="w-4 h-4 text-[hsl(45,70%,55%)]" />
                마무리 한 줄
              </CardTitle>
              <p className="text-sm text-foreground/95 leading-relaxed font-normal mt-2">{report.finalRecommendation}</p>
            </CardHeader>
          </Card>

          <Separator className="my-10 bg-border/60" />

          {/* 6. 프리미엄 */}
          <div className="space-y-4">
            <p className="text-sm font-bold text-foreground flex items-center gap-2">
              <Lock className="w-4 h-4 text-[hsl(45,70%,55%)]" />
              프리미엄 심층 리포트
            </p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              무료 구간에서는 방향만 확인하고, 아래는 심층 본문을 길게 렌더링한 뒤 블러 처리합니다. (결제 연동 전 UI)
            </p>
            {premiumLocked.map((card) => (
              <div
                key={card.title}
                className="relative rounded-2xl border border-[hsl(45,40%,25%)]/45 bg-gradient-to-br from-[hsl(45,12%,9%)] to-[hsl(0,0%,6%)] overflow-hidden min-h-[140px]"
              >
                <div className="p-5 pr-6 pb-24 blur-[7px] select-none pointer-events-none opacity-[0.85]" aria-hidden>
                  <p className="text-sm font-bold text-foreground mb-3">{card.title}</p>
                  <p className="text-xs text-muted-foreground leading-[1.75] whitespace-pre-line">{card.body}</p>
                  <p className="text-xs text-muted-foreground/80 leading-[1.75] mt-4">
                    (심층본에는 타임라인별 체크포인트, 문장 예시, 자기 점검 질문 등이 추가로 포함됩니다. 동일 필드에 AI
                    결과를 붙이면 이 영역이 풀립니다.)
                  </p>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/50 backdrop-blur-[3px] px-5">
                  <Lock className="w-6 h-6 text-[hsl(45,70%,55%)]" />
                  <p className="text-sm font-bold text-center text-foreground">{card.title}</p>
                  <p className="text-[11px] text-muted-foreground text-center max-w-xs">
                    프리미엄 잠금 · 본문은 결제 후 확인
                  </p>
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
