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
      ? `재회 쪽으로 기울 여지 얇다. 상대 피드엔 회피·거리 두기 신호가 굵다. 지금 무겁게 들어가면 읽씹·차단 쪽으로 바로 기운다.${confNote}`
      : caseResolved === "open"
        ? `짧고 가벼운 한 줄 접점만큼은 창구가 아직 덜 닫힌 상태. 장문·관계 총정리부터 밀면 지금 연락은 역효과.${confNote}`
        : `‘된다/안 된다’로 말하면 거짓말이다. 무거운 연락은 닫히고, 가벼운 한 줄만 간혹 통한다. 속도가 본론.${confNote}`;

  const myTypeTitle =
    my.emotionalResidueScore >= 62
      ? "말로 다 못 박고 흔적으로 새는 타입"
      : my.selfFocusScore >= 58
        ? "관계 서사는 줄이고 ‘나’ 축을 굳히는 타입"
        : "정리한 듯 보이는데 완전 끊기엔 애매한 타입";

  const myTypeBody =
    my.emotionalResidueScore >= 62
      ? `@{${myUser}} ${trendKo(my.activityTrend)}. 캡션·무드에 감정 잔상이 크게 묻음. ‘끝났다’는 말보다 피드가 더 시끄러움.`
      : my.selfFocusScore >= 58
        ? `@{${myUser}} ${trendKo(my.activityTrend)}. 관계 서사는 줄이고 ‘나’ 축만 두껍게 깔아 둠.`
        : `@{${myUser}} ${trendKo(my.activityTrend)}. 정리한 듯 보이는데 흔적은 애매하게 남음.`;

  const mySubA = lingeringAttachmentProxy(my);
  const mySubB = `접점 욕구는 피드·스토리로 새기 쉬움. DM으로 넘기는 순간 상대에겐 ‘에너지 요청’으로 박힘.`;

  const theirTypeTitle =
    th.avoidanceScore >= 68
      ? "감정 잔상은 있어도 다시 엮기 싫어서 도망치는 타입"
      : th.opennessScore >= 62
        ? "문은 덜 잠겼는데 무거운 연락만큼은 바로 피하는 타입"
        : "경계·리듬 먼저 박아 두고 감정은 뒤로 미는 타입";

  const theirTypeBody =
    th.newPersonHintScore >= 58
      ? `@{${theirUser}} ${trendKo(th.activityTrend)}. 회피·경계 앞에 깔림. 태그·반복 노출 쪽에 새 인물 흔적용 기울기도 있음—확정은 금지.`
      : th.avoidanceScore >= 62
        ? `@{${theirUser}} ${trendKo(th.activityTrend)}. 회피·방어 전환이 앞섬. 열린 척은 하는데 무거운 연락엔 바로 닫힘.`
        : `@{${theirUser}} ${trendKo(th.activityTrend)}. 경계·리듬 먼저 박고 감정은 뒤로 미룸.`;

  const theirSubA =
    th.casualReentryOpenness >= th.heavyContactResistance
      ? "가벼운 재진입 틈은 남음. 무거운 연락만 밀어붙이면 바로 닫힘."
      : "가벼운 접점도 좁음. 들이대면 방어부터 선다.";
  const theirSubB = `친절·노출을 재회 신호로 읽으면 오판. 지금은 열린 게 아니라 덜 닫힌 거다.`;

  const myMistakePattern = `감정보다 ‘새는 방식’이 위험함. 장문·사과 연타·관계 총정리는 상대에겐 처리 업무로 박힘. 사과·정의 욕구·무거운 한 방, 셋 다 지금은 독.`;

  const theirReasonBlock = `모르는 게 아니라, 알고도 피하는 그림. 지금 피하는 게 너인지 상황인지 감정 처리 비용인지는 ${pair.tensionAxis}에서 갈림.`;

  const pairDynamicBody = `${pair.tensionAxis}.\n\n리듬이 안 맞고 잔상 해석이 엇갈리면, 같은 행동이 어떤 날은 여지로·어떤 날은 방어로 박힘.`;

  const reopenConditionBody = `지금은 마음보다 방식이 문제다. 부담 낮은 한 줄·선택지 톤이면 반응 덜 막힘. 무게가 먼저면 방어가 이김. 오해만 걷어도 판이 달라짐.`;

  const decisionHeadline =
    caseResolved === "closed"
      ? `지금 먼저 연락하면 읽씹·차단 쪽으로 간다. 재회보다 방어부터 두꺼워짐.`
      : caseResolved === "open"
        ? `무거운 연락은 지금 비추. 짧은 한 줄이면 틈 아주 얇게 남음.`
        : `연락 자체 금지는 아님. 무겁게만 가면 닫힘. 가볍게만.`;

  const decisionSubLine = `위에 세 칸 게이지가 오늘 판의 체중이다. 아래 문장은 그 무게 기준으로만 읽으면 됨.`;

  const whyThisReadsLikeThis = `계정 톤은 날마다 흔들림. 지금 본론은 ${pair.tensionAxis}. 숫자는 ‘된다/안 된다’가 아니라 이 속도면 닫히는지만 가리킴.`;

  const traceAxis = pair.tensionAxis;
  const traceYou = `네 계정: ${trendKo(my.activityTrend)}. 감정 잔상·간접이 피드에 묻어 나옴—확인 욕이 스토리로 새기 쉬움.`;
  const traceThem = `상대 계정: ${trendKo(th.activityTrend)}. 완전 종료 서사만은 아님. 무거운 대화 비용은 크게 느끼는 구간.`;

  const waitWindowHint =
    meta.breakupMonthsSince <= 2
      ? "이별 직후면 상대 피드 톤이 방어에서 내려가는지 먼저 본다. 연락은 확인이 아니라 부담으로 박히기 쉬움."
      : meta.breakupMonthsSince <= 8
        ? "몇 주 단위로 회피 톤·반응 속도가 완화되는지 본다. 변화 없이 시간만 보내는 건 기다림이 아님."
        : "단기 타이밍보다 새 서사가 얇아지거나 트리거에서만 톤이 흔들릴 때 관망 비중이 커짐.";

  const contactToneHint = `먹히는 쪽: 짧게, 요구 말고 선택지, 답 없어도 죄책감 안 남기게. 피할 쪽: 총정리·관계 정의·감정 폭발·연타.`;

  const newPersonHint = `태그·반복 노출이 있어도 확정 금지. 질투·추궁으로 들어가면 방어만 두꺼워짐.`;

  const misunderstandingRisk = `가장 큰 오해: 잔상을 재회 의지로 바꿔 읽는 것. 예의 있는 한 줄을 곧바로 ‘열림’으로 키우는 것도 위험.`;

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
    return "피드에 과거 무드 남겨 두면 넌 여지로 읽고, 상대는 부담으로 넣는다.";
  }
  return "스토리·캡션으로 온도 재다가 장문으로 넘기기 쉬움. 그 순간 상대에겐 대화가 아니라 처리 과제로 박힘.";
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