/**
 * rich signal → 짧은 판독 문장 (점수는 UI 게이지에만 두고 본문에 숫자 없음).
 */
import type { ReunionFullReport } from "@/data/reunionDummyData";
import type { ReunionRichSignals } from "@/lib/reunionSignals";
import type { ReunionDisplayScores, ReunionOutcomeCase } from "@/lib/reunionScoring";

export type ReunionNarrativePayload = {
  topSummary: string;
  myTypeTitle: string;
  myTypeBody: string;
  mySubA: string;
  mySubB: string;
  theirTypeTitle: string;
  theirTypeBody: string;
  theirSubA: string;
  theirSubB: string;
  myMistakePattern: string;
  theirReasonBlock: string;
  pairDynamicBody: string;
  reopenConditionBody: string;
  decisionHeadline: string;
  decisionSubLine: string;
  whyThisReadsLikeThis: string;
  traceAxis: string;
  traceYou: string;
  traceThem: string;
  waitWindowHint: string;
  contactToneHint: string;
  newPersonHint: string;
  misunderstandingRisk: string;
};

function trendKo(t: "up" | "down" | "flat"): string {
  if (t === "up") return "최근 업·스토리 템포가 예전보다 빠름";
  if (t === "down") return "예전만큼 자주 안 올림";
  return "올리는 간격 들쭉날쭉, 큰 변화 없음";
}

export function buildReunionNarrative(
  s: ReunionRichSignals,
  caseResolved: ReunionOutcomeCase,
  _scores: ReunionDisplayScores,
  myUser: string,
  theirUser: string,
): ReunionNarrativePayload {
  const { mySignals: my, theirSignals: th, pairSignals: pair, actionSignals: act, profileMeta: meta } = s;
  const conf = meta.dataConfidence;
  const confNote =
    conf < 0.82
      ? " 공개 데이터만 본 거라, 비공개·게시 적으면 해석은 더 얇게 잡음."
      : "";

  const topSummary =
    caseResolved === "closed"
      ? `재회할 확률이 솔직히 그리 높지는 않다. 상대 피드에는 회피적인 신호가 크게 보이고, 지금 진지하게 붙잡으면 읽씹당하거나 차단당할 확률이 높다.${confNote}`
      : caseResolved === "open"
        ? `짧고 가벼운 한 줄 정도는 아직 창구가 열려 있는 상태다. 다만 장문이나 관계 총정리부터 밀면 오히려 역효과가 날 수 있다.${confNote}`
        : `된다 안 된다로 딱 잘라 말하기 어려운 상태다. 무거운 연락은 닫히고, 가벼운 한 줄만 간혹 통하는 정도라서 속도 조절이 핵심이다.${confNote}`;

  const myTypeTitle =
    my.emotionalResidueScore >= 62
      ? "끝났다면서 피드로 감정 다 흘리는 사람"
      : my.selfFocusScore >= 58
        ? "연애 얘기는 줄이고 셀프 브랜딩에 올인하는 사람"
        : "정리한 척하면서 인스타는 계속 들여다보는 사람";

  const myTypeBody =
    my.emotionalResidueScore >= 62
      ? `@{${myUser}} 피드를 보면 ${trendKo(my.activityTrend)}. 캡션이나 무드에 감정 잔상이 꽤 크게 묻어나고 있어서, 끝났다는 말보다 피드가 더 솔직하게 보인다.`
      : my.selfFocusScore >= 58
        ? `@{${myUser}} 피드를 보면 ${trendKo(my.activityTrend)}. 관계 관련 서사는 줄이고 자기 자신에 집중하는 콘텐츠를 두텁게 깔아두고 있다.`
        : `@{${myUser}} 피드를 보면 ${trendKo(my.activityTrend)}. 정리된 것 같으면서도 흔적이 애매하게 남아 있는 상태다.`;

  const mySubA = lingeringAttachmentProxy(my);
  const mySubB = "접점에 대한 욕구가 피드나 스토리로 새어나가기 쉬운 상태다. DM으로 넘어가는 순간 상대한테는 에너지를 요구하는 것처럼 느껴질 수 있다.";

  const theirTypeTitle =
    th.avoidanceScore >= 68
      ? "마음은 남았는데 다시 엮이는 건 사양인 사람"
      : th.opennessScore >= 62
        ? "문은 덜 잠겼지만 무거운 연락은 바로 피하는 사람"
        : "자기 리듬부터 챙기고 감정은 나중에 보는 사람";

  const theirTypeBody =
    th.newPersonHintScore >= 58
      ? `@{${theirUser}} 피드를 보면 ${trendKo(th.activityTrend)}. 회피와 경계가 깔려 있고, 태그나 반복 노출 쪽에 새 인물 흔적 같은 기울기도 보이지만 확정할 수는 없다.`
      : th.avoidanceScore >= 62
        ? `@{${theirUser}} 피드를 보면 ${trendKo(th.activityTrend)}. 회피와 방어 쪽 전환이 먼저 보이고, 열린 것처럼 보여도 무거운 연락에는 바로 닫히는 패턴이 있다.`
        : `@{${theirUser}} 피드를 보면 ${trendKo(th.activityTrend)}. 경계와 리듬을 먼저 세워두고 감정적인 부분은 뒤로 미루는 상태로 읽힌다.`;

  const theirSubA =
    th.casualReentryOpenness >= th.heavyContactResistance
      ? "가벼운 재진입의 틈은 아직 남아 있다. 다만 무거운 연락을 밀어붙이면 바로 닫힐 수 있다."
      : "가벼운 접점마저도 좁은 상태다. 적극적으로 다가가면 방어부터 올라갈 가능성이 크다.";
  const theirSubB = "상대가 친절하거나 노출이 있다고 해서 재회 신호로 읽으면 오판이다. 지금은 열린 게 아니라 완전히 닫지 않은 것에 가깝다.";

  const myMistakePattern = "감정 자체보다 감정이 새어나가는 방식이 더 위험하다. 장문, 사과 연타, 관계 총정리 같은 건 상대한테 대화가 아니라 처리해야 할 과제처럼 느껴진다. 사과 욕구, 관계 정의 욕구, 무거운 한 방, 셋 다 지금은 독이 될 수 있다.";

  const theirReasonBlock = `상대가 모르는 게 아니라 알면서도 피하고 있는 상황으로 보인다. 지금 피하는 게 너인지, 상황 자체인지, 감정을 처리하는 비용 때문인지는 ${pair.tensionAxis} 축에서 갈린다.`;

  const pairDynamicBody = `${pair.tensionAxis}.\n\n서로 리듬이 안 맞고 잔상을 해석하는 방식이 엇갈리면, 같은 행동이 어떤 날은 여지로 읽히고 어떤 날은 방어로 느껴질 수 있다.`;

  const reopenConditionBody = "지금은 마음보다 방식이 문제인 상태다. 부담이 낮은 짧은 한 줄이나 선택지를 주는 톤이면 반응이 덜 막히고, 무게부터 실으면 방어가 이긴다. 오해만 걷어내도 판이 달라질 수 있다.";

  const decisionHeadline =
    caseResolved === "closed"
      ? "지금 먼저 연락하면 읽씹이나 차단 쪽으로 흐를 가능성이 높다. 재회보다 방어가 먼저 두꺼워지는 타이밍이다."
      : caseResolved === "open"
        ? "무거운 연락은 지금 비추천이지만, 짧은 한 줄 정도면 아주 얇은 틈이 남아 있을 수 있다."
        : "연락 자체가 안 되는 건 아닌데, 무겁게 들어가면 닫힌다. 가볍게만 가야 한다.";

  const decisionSubLine = "위 게이지가 오늘 기준으로 본 판의 무게감이다. 아래 문장은 그 기준으로 읽으면 된다.";

  const whyThisReadsLikeThis = `계정 톤은 날마다 흔들리기 때문에, 지금 핵심은 ${pair.tensionAxis}이다. 이 숫자는 된다 안 된다를 말하는 게 아니라, 이 속도로 가면 닫히는지만 가리키고 있다.`;

  const traceAxis = pair.tensionAxis;
  const traceYou = `네 계정을 보면 ${trendKo(my.activityTrend)}. 감정 잔상이나 간접적인 신호가 피드에 묻어나고 있어서, 확인하고 싶은 마음이 스토리로 새어나가기 쉬운 상태다.`;
  const traceThem = `상대 계정을 보면 ${trendKo(th.activityTrend)}. 완전히 끝냈다는 느낌은 아닌데, 무거운 대화의 비용은 크게 느끼고 있는 구간이다.`;

  const waitWindowHint =
    meta.breakupMonthsSince <= 2
      ? "이별 직후라면 상대 피드 톤이 방어에서 내려가는지 먼저 지켜보는 게 좋다. 지금 연락하면 확인이 아니라 부담으로 느껴질 수 있다."
      : meta.breakupMonthsSince <= 8
        ? "몇 주 단위로 회피 톤이나 반응 속도가 완화되는지 지켜봐야 한다. 변화 없이 시간만 보내는 건 기다림이 아니다."
        : "단기 타이밍보다는, 상대의 새로운 일상이 얇아지거나 특정 소재에서만 톤이 흔들릴 때를 보는 게 더 중요하다.";

  const contactToneHint = "먹히는 방식은 짧게, 요구 대신 선택지를 주고, 답이 없어도 죄책감이 남지 않는 톤이다. 피해야 할 건 총정리, 관계 정의, 감정 폭발, 그리고 연타 메시지다.";

  const newPersonHint = "태그나 반복적인 노출이 있더라도 확정 짓지 않는 게 좋다. 질투나 추궁으로 들어가면 방어만 두꺼워질 뿐이다.";

  const misunderstandingRisk = "가장 큰 오해는 잔상이 남아 있는 걸 재회 의지로 바꿔 읽는 것이다. 상대의 예의 있는 한 줄 답장을 곧바로 열림 신호로 키워서 읽는 것도 위험하다.";

  return {
    topSummary,
    myTypeTitle,
    myTypeBody,
    mySubA,
    mySubB,
    theirTypeTitle,
    theirTypeBody,
    theirSubA,
    theirSubB,
    myMistakePattern,
    theirReasonBlock,
    pairDynamicBody,
    reopenConditionBody,
    decisionHeadline,
    decisionSubLine,
    whyThisReadsLikeThis,
    traceAxis,
    traceYou,
    traceThem,
    waitWindowHint,
    contactToneHint,
    newPersonHint,
    misunderstandingRisk,
  };
}

function lingeringAttachmentProxy(my: ReunionRichSignals["mySignals"]): string {
  if (my.cleanupIncompleteScore >= 58) {
    return "피드에 과거 무드를 남겨두면 본인은 여지로 읽지만, 상대는 부담으로 받아들일 수 있다.";
  }
  return "스토리나 캡션으로 온도를 재다가 장문으로 넘어가기 쉬운 상태다. 그 순간 상대한테는 대화가 아니라 처리해야 할 과제처럼 느껴진다.";
}

const PREMIUM_INJECT: (keyof ReunionNarrativePayload)[] = [
  "waitWindowHint",
  "contactToneHint",
  "contactToneHint",
  "contactToneHint",
  "newPersonHint",
  "misunderstandingRisk",
  "theirReasonBlock",
  "myMistakePattern",
];

/** 스크랩 기반 문장으로 리포트 본문 오버레이 (카드·TOC 구조 유지) */
export function mergeReunionNarrativeIntoReport(
  base: ReunionFullReport,
  n: ReunionNarrativePayload,
  opts: { contactLeanPercent: number; scores: ReunionDisplayScores },
): ReunionFullReport {
  const inj = (i: number, body: string) => {
    const k = PREMIUM_INJECT[i];
    const hint = (n as Record<string, string>)[k] || "";
    return hint ? `${hint}\n\n${body}` : body;
  };

  return {
    ...base,
    summaryLine: n.topSummary,
    scores: opts.scores,
    reunionJourney: {
      ...base.reunionJourney,
      myTypeName: n.myTypeTitle,
      myTypeLead: n.myTypeBody,
      myTypeSubcards: [n.mySubA, n.mySubB],
      theirTypeName: n.theirTypeTitle,
      theirTypeLead: n.theirTypeBody,
      theirTypeSubcards: [n.theirSubA, n.theirSubB],
      comboCardBody: n.pairDynamicBody,
      lockBodyComboConditions: n.reopenConditionBody,
      lockBodyWhyVaries: n.whyThisReadsLikeThis,
    },
    freeCore: {
      whyAmbiguous: `지금 먼저 들어가면 불리한 이유: ${n.whyThisReadsLikeThis}`,
      keyVariable: `지금 관계를 바꾸는 변수: ${n.reopenConditionBody}`,
    },
    signalSnapshot: {
      conflictLine: n.traceAxis,
      youLine: n.traceYou,
      themLine: n.traceThem,
    },
    decisionHint: {
      ...base.decisionHint,
      contactLeanPercent: opts.contactLeanPercent,
      headline: n.decisionHeadline,
      hintLine: n.decisionSubLine,
    },
    finalRecommendation: n.topSummary,
    premiumTeasers: base.premiumTeasers.map((card, i) => ({
      ...card,
      lockedBody: inj(i, card.lockedBody),
    })),
    premiumLocked: base.premiumTeasers.map((card, i) => ({
      title: card.title,
      body: inj(i, card.lockedBody),
    })),
  };
}