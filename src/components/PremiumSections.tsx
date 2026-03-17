import { useMemo } from "react";
import { Progress } from "@/components/ui/progress";
import {
  getDatingSimulation,
  getBehaviorPattern,
  getCompatibilityScores,
  getDatingStrategy,
  getRiskAnalysis,
  getTop5Types,
  getCharmAnalysis,
  getScenarioPrediction,
  getDangerAnalysis,
} from "@/data/premiumData";
import {
  Heart,
  Footprints,
  Eye,
  Target,
  Shield,
  Trophy,
  Radar,
  Film,
  AlertOctagon,
  Check,
  X,
  ArrowRight,
  Crown,
} from "lucide-react";

interface Props {
  id: string;
  resultTitle: string;
}

const premiumCardClass =
  "rounded-2xl p-5 mb-5 bg-gradient-to-br from-[hsl(45,50%,95%)] to-card border border-[hsl(45,60%,80%)]/30";

const premiumAccentBorder = "border-l-4 border-l-[hsl(45,70%,55%)]";

const sectionHeader = (icon: React.ReactNode, title: string) => (
  <div className="flex items-center gap-1.5 mb-4">
    {icon}
    <h3 className="text-sm font-bold text-foreground">{title}</h3>
  </div>
);

const PremiumSections = ({ id, resultTitle }: Props) => {
  const simulation = useMemo(() => getDatingSimulation(id), [id]);
  const behavior = useMemo(() => getBehaviorPattern(id), [id]);
  const compatibility = useMemo(() => getCompatibilityScores(id), [id]);
  const strategy = useMemo(() => getDatingStrategy(id), [id]);
  const risks = useMemo(() => getRiskAnalysis(id), [id]);
  const top5 = useMemo(() => getTop5Types(id), [id]);
  const charm = useMemo(() => getCharmAnalysis(id), [id]);
  const scenario = useMemo(() => getScenarioPrediction(id), [id]);
  const dangers = useMemo(() => getDangerAnalysis(id), [id]);

  return (
    <>
      {/* ====== 1. 연애 진행 시뮬레이션 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Footprints className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "연애 진행 시뮬레이션")}
        <p className="text-[11px] text-muted-foreground mb-4">
          <strong className="text-foreground">{resultTitle}</strong> 유형이 당신에게 빠지는 과정을 단계별로 분석합니다.
        </p>

        <div className="relative pl-5 space-y-0">
          {/* Timeline line */}
          <div className="absolute left-[9px] top-2 bottom-2 w-px bg-gradient-to-b from-[hsl(45,70%,60%)] to-[hsl(45,70%,85%)]" />

          {simulation.stages.map((stage) => (
            <div key={stage.step} className="relative pb-5 last:pb-0">
              {/* Dot */}
              <div className="absolute -left-5 top-0.5 w-[18px] h-[18px] rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center shadow-sm">
                <span className="text-[8px] font-black text-white">{stage.step}</span>
              </div>
              <div className="ml-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-base">{stage.emoji}</span>
                  <h4 className="text-xs font-bold text-foreground">{stage.title}</h4>
                </div>
                <p className="text-[11px] text-foreground/70 leading-relaxed">{stage.description}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-2 mt-4 pt-4 border-t border-[hsl(45,60%,80%)]/30">
          <div className="rounded-xl bg-[hsl(45,60%,92%)]/60 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">예상 연애 진입 기간</p>
            <p className="text-xs font-bold text-foreground">{simulation.entryPeriod}</p>
          </div>
          <div className="rounded-xl bg-[hsl(45,60%,92%)]/60 p-3 text-center">
            <p className="text-[10px] text-muted-foreground mb-1">관계 발전 속도</p>
            <p className="text-xs font-bold text-foreground">{simulation.developSpeed}</p>
          </div>
        </div>
      </div>

      {/* ====== 2. 관심 있을 때 보이는 행동 패턴 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Eye className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "관심 행동 패턴 분석")}

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center">
                <Heart className="w-3 h-3 text-primary" />
              </div>
              <h4 className="text-xs font-bold text-foreground">관심 있을 때 행동</h4>
            </div>
            <div className="space-y-2">
              {behavior.interested.map((b) => (
                <div key={b} className="flex items-start gap-2 bg-primary/5 rounded-xl px-3 py-2.5">
                  <Check className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground/80 leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5 mb-2.5">
              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-3 h-3 text-destructive" />
              </div>
              <h4 className="text-xs font-bold text-foreground">관심 없을 때 행동</h4>
            </div>
            <div className="space-y-2">
              {behavior.notInterested.map((b) => (
                <div key={b} className="flex items-start gap-2 bg-destructive/5 rounded-xl px-3 py-2.5">
                  <X className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground/80 leading-relaxed">{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====== 3. 연애 궁합 분석 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Target className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "연애 궁합 분석")}
        <p className="text-[11px] text-muted-foreground mb-4">
          당신과 <strong className="text-foreground">{resultTitle}</strong> 유형의 관계 궁합을 점수로 분석합니다.
        </p>

        <div className="space-y-4">
          {compatibility.map((item) => (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <span>{item.emoji}</span> {item.label}
                </span>
                <span className="text-sm font-black text-[hsl(45,70%,45%)]">{item.score}점</span>
              </div>
              <div className="h-3 bg-secondary rounded-full overflow-hidden mb-1.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[hsl(45,70%,60%)] to-[hsl(35,80%,50%)] transition-all"
                  style={{ width: `${item.score}%` }}
                />
              </div>
              <p className="text-[10px] text-muted-foreground leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ====== 4. 연애 성공 전략 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Shield className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "연애 성공 전략")}
        <p className="text-[11px] text-muted-foreground mb-4">
          <strong className="text-foreground">{resultTitle}</strong> 유형과의 연애 성공 확률을 높이는 전략입니다.
        </p>

        <div className="space-y-4">
          <div>
            <h4 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-[hsl(160,40%,90%)] flex items-center justify-center">
                <Check className="w-3 h-3 text-[hsl(160,50%,40%)]" />
              </div>
              이렇게 하세요
            </h4>
            <div className="space-y-2">
              {strategy.dos.map((d) => (
                <div key={d} className="flex items-start gap-2 bg-[hsl(160,30%,95%)] rounded-xl px-3 py-2.5 border border-[hsl(160,30%,88%)]">
                  <Check className="w-3.5 h-3.5 text-[hsl(160,50%,40%)] shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground/80 leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold text-foreground mb-2.5 flex items-center gap-1.5">
              <div className="w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                <X className="w-3 h-3 text-destructive" />
              </div>
              하면 안 되는 행동
            </h4>
            <div className="space-y-2">
              {strategy.donts.map((d) => (
                <div key={d} className="flex items-start gap-2 bg-destructive/5 rounded-xl px-3 py-2.5 border border-destructive/10">
                  <X className="w-3.5 h-3.5 text-destructive shrink-0 mt-0.5" />
                  <span className="text-[11px] text-foreground/80 leading-relaxed">{d}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ====== 5. 연애 리스크 분석 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<AlertOctagon className="w-4 h-4 text-destructive" />, "연애 리스크 분석")}
        <p className="text-[11px] text-muted-foreground mb-4">
          이 유형과 연애할 때 발생할 수 있는 위험 요소를 분석합니다.
        </p>

        <div className="space-y-4">
          {risks.map((risk) => {
            const color =
              risk.level >= 60
                ? "text-destructive"
                : risk.level >= 40
                ? "text-[hsl(35,80%,45%)]"
                : "text-[hsl(160,50%,40%)]";
            const barColor =
              risk.level >= 60
                ? "bg-destructive"
                : risk.level >= 40
                ? "bg-[hsl(35,80%,55%)]"
                : "bg-[hsl(160,50%,45%)]";
            const levelText =
              risk.level >= 70 ? "높음 ⚠️" : risk.level >= 40 ? "보통" : "낮음 ✅";

            return (
              <div key={risk.label}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                    <span>{risk.emoji}</span> {risk.label}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold ${color}`}>{levelText}</span>
                    <span className={`text-sm font-black ${color}`}>{risk.level}%</span>
                  </div>
                </div>
                <div className="h-2.5 bg-secondary rounded-full overflow-hidden mb-1.5">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all`}
                    style={{ width: `${risk.level}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground leading-relaxed">{risk.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* ====== 6. 끌리는 남자 유형 TOP5 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Trophy className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "당신에게 끌리는 남자 유형 TOP5", "P6")}

        <div className="space-y-2.5">
          {top5.map(({ rank, type }) => (
            <div
              key={type.id}
              className={`rounded-2xl p-4 flex items-center gap-3 border ${
                rank === 1
                  ? "bg-gradient-to-r from-[hsl(45,60%,90%)] to-[hsl(35,50%,92%)] border-[hsl(45,70%,70%)] shadow-sm"
                  : "bg-card/50 border-border/30"
              }`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-black ${
                  rank === 1
                    ? "bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] text-white"
                    : "bg-secondary text-muted-foreground"
                }`}
              >
                {rank}
              </div>
              <div className="text-2xl shrink-0">{type.emoji}</div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-foreground">{type.title}</h4>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{type.oneLiner}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== 7. 인스타 vibe 매력 분석 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Radar className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "인스타 vibe 매력 분석", "P7")}
        <p className="text-[11px] text-muted-foreground mb-4">
          당신의 인스타에서 느껴지는 매력 요소를 구체적으로 분석합니다.
        </p>

        <div className="space-y-3">
          {charm.map((c) => {
            const maxStat = Math.max(...charm.map((s) => s.value));
            const isMax = c.value === maxStat;
            return (
              <div key={c.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-foreground flex items-center gap-1.5">
                    <span>{c.emoji}</span> {c.label}
                    {isMax && (
                      <span className="text-[9px] bg-[hsl(45,70%,55%)] text-white px-1.5 py-0.5 rounded-full font-bold">
                        TOP
                      </span>
                    )}
                  </span>
                  <span className={`text-sm font-black ${isMax ? "text-[hsl(45,70%,45%)]" : "text-foreground/60"}`}>
                    {c.value}%
                  </span>
                </div>
                <div className="h-3 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isMax
                        ? "bg-gradient-to-r from-[hsl(45,70%,60%)] to-[hsl(35,80%,50%)]"
                        : "bg-primary/40"
                    }`}
                    style={{ width: `${c.value}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 p-3 rounded-xl bg-[hsl(45,60%,90%)]/50 border border-[hsl(45,60%,80%)]/30">
          <p className="text-[10px] text-foreground/70 leading-relaxed">
            💡 <strong className="text-foreground">AI 인사이트:</strong> 당신의 가장 강한 매력 포인트는{" "}
            <strong className="text-[hsl(45,70%,45%)]">
              {charm.reduce((a, b) => (a.value > b.value ? a : b)).label}
            </strong>
            입니다. 이 매력이 특정 유형의 남자들을 강하게 끌어당기는 핵심 요소입니다.
          </p>
        </div>
      </div>

      {/* ====== 8. 연애 시나리오 예측 ====== */}
      <div className={`${premiumCardClass} ${premiumAccentBorder}`}>
        {sectionHeader(<Film className="w-4 h-4 text-[hsl(45,70%,50%)]" />, "연애 시나리오 예측", "P8")}
        <p className="text-[11px] text-muted-foreground mb-4">
          <strong className="text-foreground">{resultTitle}</strong> 유형과 연애할 경우 예상되는 관계 흐름입니다.
        </p>

        <div className="space-y-0">
          {scenario.map((phase, i) => (
            <div key={phase.phase} className="relative">
              {i < scenario.length - 1 && (
                <div className="absolute left-[15px] top-10 bottom-0 w-px bg-[hsl(45,60%,80%)]" />
              )}
              <div className="flex gap-3 pb-5">
                <div className="w-[30px] h-[30px] rounded-full bg-gradient-to-br from-[hsl(45,80%,60%)] to-[hsl(35,85%,55%)] flex items-center justify-center shrink-0 shadow-sm">
                  <span className="text-sm">{phase.emoji}</span>
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-xs font-bold text-foreground">{phase.phase}</h4>
                    <span className="text-[10px] bg-[hsl(45,60%,88%)] text-[hsl(45,70%,40%)] px-2 py-0.5 rounded-full font-medium">
                      {phase.period}
                    </span>
                  </div>
                  <p className="text-[11px] text-foreground/70 leading-[1.8]">{phase.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ====== 9. 끌어당기는 남자 위험도 분석 ====== */}
      <div className={`${premiumCardClass} border-l-4 border-l-destructive/50`}>
        {sectionHeader(<AlertOctagon className="w-4 h-4 text-destructive" />, "끌어당기는 위험 유형 분석", "P9")}
        <p className="text-[11px] text-muted-foreground mb-4">
          당신이 반복적으로 끌어들이는 연애 위험 유형을 분석합니다.
        </p>

        <div className="space-y-3">
          {dangers.map((d) => (
            <div key={d.title} className="rounded-2xl border border-destructive/15 bg-destructive/3 overflow-hidden">
              <div className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">{d.emoji}</span>
                    <h4 className="text-xs font-bold text-foreground">{d.title}</h4>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-destructive font-bold">위험도</span>
                    <span className="text-sm font-black text-destructive">{d.dangerLevel}%</span>
                  </div>
                </div>
                <div className="h-2 bg-destructive/10 rounded-full overflow-hidden mb-3">
                  <div className="h-full rounded-full bg-destructive/70" style={{ width: `${d.dangerLevel}%` }} />
                </div>

                <div className="space-y-2.5 text-[11px] leading-relaxed">
                  <div>
                    <p className="font-semibold text-foreground/90 mb-0.5">왜 당신에게 끌리는지</p>
                    <p className="text-foreground/60">{d.whyAttracted}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-foreground/90 mb-0.5">어떤 문제가 생길 수 있는지</p>
                    <p className="text-foreground/60">{d.problems}</p>
                  </div>
                  <div className="bg-destructive/5 rounded-lg p-2.5 border border-destructive/10">
                    <p className="font-semibold text-destructive mb-0.5">⚠ 피해야 하는 패턴</p>
                    <p className="text-foreground/60">{d.avoidPattern}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default PremiumSections;
