/**
 * 재회 리포트 데이터 모델 + 결정적 더미 생성.
 * 이별 시점(년·월)과 경과 개월을 해시·문구에 반영해 실제 API에 그대로 매핑 가능하게 둡니다.
 */

export type ReunionScores = {
  reunionPossibility: number;
  theirReunionOpenness: number;
  contactTimingFit: number;
};

export type MyProfileSignals = {
  observedFrom: string;
  emotionalState: string;
  lingeringAttachment: string;
  relationshipOpenness: string;
  contactInitiationTendency: string;
};

export type TheirProfileSignals = {
  observedFrom: string;
  emotionalState: string;
  relationshipOpenness: string;
  newPeopleReadiness: string;
  reunionOpenness: string;
  likelyToReachOutFirst: string;
};

/** 상대 중심 핵심 — 재회 의사결정에 바로 쓰는 4축 */
export type TheirFocusReport = {
  /** 지금 재회에 얼마나 열려 있는지 (신호 기반, 단정 금지) */
  openToReunionNow: string;
  /** 새 인물/만남 가능성 시그널 */
  newPersonPossibilitySignals: string;
  /** 무의식적 방어 패턴 */
  unconsciousDefensePattern: string;
  /** 먼저 연락할 타입인지 */
  willTheyReachOutFirst: string;
};

/** 무료 구간 마지막 — 한눈에 정리 */
export type ReunionFreeClosingSummary = {
  whyThisScore: string;
  keyVariable: string;
  contactNowOrWait: string;
};

/** 프리미엄 직전 CTA + 하단 스티키 바 카피 */
export type ReunionPremiumGateCta = {
  title: string;
  body: string;
  footnote: string;
  /** 메인 버튼 한 개 */
  ctaPrimary: string;
  /** 메인 버튼 바로 아래 짧은 보조 설명 */
  ctaAuxiliary: string;
  /** 스티키 바 제목 (전체 재회 리포트 중심) */
  stickyHeadline: string;
  stickySubline: string;
  /** 취소선 정가 (오픈 이벤트) */
  stickyListPrice: string;
  stickyPriceLabel: string;
  /** 짧은 오픈 특가 설명 */
  stickySaleNote: string;
};

export type ReunionSynthesis = {
  whyThisScore: string;
  keyVariable: string;
  /** 지금 연락/행동이 관계를 닫는 쪽인지, 열릴 여지를 남기는 쪽인지 */
  contactOpensOrCloses: string;
};

export type ReunionActionGuide = {
  contactNowGuidance: string;
  waitGuidance: string;
  avoidActions: string;
  toneIfContact: string;
};

/** @deprecated AI 마이그레이션용 — UI는 premiumTeasers 사용 */
export type ReunionPremiumCard = {
  title: string;
  body: string;
};

/** 무료 전면: 연락 vs 기다림 힌트 (최종 판독은 유료) */
export type ReunionDecisionHint = {
  /** 0~100, 높을수록 ‘연락 쪽’ 기울기 */
  contactLeanPercent: number;
  headline: string;
  hintLine: string;
};

/** 무료 압축: 갈등축 + 나/상대 한 줄 */
export type ReunionSignalSnapshot = {
  conflictLine: string;
  youLine: string;
  themLine: string;
};

/** 프리미엄: 제목 + 공개 1요소만 선명, 나머지 본문은 블러 */
export type ReunionPremiumTeaser = {
  key: string;
  title: string;
  /** 보조 한 줄 (비우면 미표시) */
  visibleSummary: string;
  /** 카드1: 연락↔기다림 게이지 % */
  contactVsWaitPercent?: number;
  /** 카드2: 기간 범위만 공개 (예: 2~4주) */
  waitRangeShort?: string;
  /** 카드3: 예시 문장 일부 */
  tonePreview?: string;
  /** 카드4: 가중치·밴드 % (리포트 느낌) */
  newPersonWeightPercent?: number;
  lockedBody: string;
};

/** API/AI 매핑용 (문단) */
export type ReunionReportPayload = {
  myProfileSignals: MyProfileSignals;
  theirProfileSignals: TheirProfileSignals;
  reunionReadiness: string;
  relationshipOpenness: string;
  currentDatingLikelihood: string;
  unconsciousPattern: string;
  contactTiming: string;
  finalRecommendation: string;
};

export type ReunionReportMeta = {
  breakupYear: number;
  breakupMonth: number;
  breakupLabel: string;
  /** 달력 기준 만 개월 수 (0 이상) */
  monthsSinceBreakup: number;
  /** UI용 자연어: "한 달 미만" | "약 N개월" 등 */
  monthsSinceLabel: string;
};

export type ReunionFullReport = ReunionReportPayload & {
  meta: ReunionReportMeta;
  summaryTitle: string;
  summaryLine: string;
  scores: ReunionScores;
  /** 인스타 신호로 읽힌 '이별 축' — 단정 아닌 공명용 */
  breakupResonance: string;
  socialProofLine: string;
  toc: { id: string; label: string }[];
  theirFocus: TheirFocusReport;
  synthesis: ReunionSynthesis;
  actionGuide: ReunionActionGuide;
  freeClosingSummary: ReunionFreeClosingSummary;
  premiumGateCta: ReunionPremiumGateCta;
  /** 부분 공개형 심층 카드 */
  premiumTeasers: ReunionPremiumTeaser[];
  decisionHint: ReunionDecisionHint;
  signalSnapshot: ReunionSignalSnapshot;
  /** 짧은 무료 요약 (애매한 이유 / 최대 변수) */
  freeCore: { whyAmbiguous: string; keyVariable: string };
  premiumLocked: ReunionPremiumCard[];
};

export function getMonthsSinceBreakup(breakupYear: number, breakupMonth: number, now = new Date()): number {
  const end = now.getFullYear() * 12 + now.getMonth();
  const start = breakupYear * 12 + (breakupMonth - 1);
  return Math.max(0, end - start);
}

export function formatMonthsSinceLabel(months: number): string {
  if (months <= 0) return "한 달 미만";
  if (months === 1) return "약 1개월";
  if (months < 12) return `약 ${months}개월`;
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (m === 0) return `약 ${y}년`;
  return `약 ${y}년 ${m}개월`;
}

function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(seed: number, salt: number, arr: readonly T[]): T {
  return arr[(seed ^ salt) % arr.length];
}

function scoreTriplet(seed: number, monthsSince: number): ReunionScores {
  const damp = monthsSince <= 2 ? -4 : monthsSince >= 12 ? 3 : 0;
  const base = 36 + (seed % 28) + damp;
  const open = 32 + ((seed >> 4) % 32) + Math.min(4, Math.floor(monthsSince / 6));
  const contact = 28 + ((seed >> 8) % 38) - (monthsSince <= 1 ? 5 : 0);
  return {
    reunionPossibility: Math.min(88, Math.max(32, base)),
    theirReunionOpenness: Math.min(86, Math.max(28, open)),
    contactTimingFit: Math.min(82, Math.max(24, contact)),
  };
}

const SUMMARY_LINES = [
  "다시 들일 만큼 열린 건 아니다. 완전히 정리된 것도 아니다. 지금은 가능성보다 부담이 먼저 읽힌다.",
  "끝낸 척은 하는데 완전히 끝낼 용기는 없어 보인다. 캡션·간격이 그걸 말한다.",
  "여지 남기는 사람처럼 보여도, 책임은 피하고 싶은 톤에 가깝다. 첫 문장이 부담이면 창구부터 닫힌다.",
  "다시 만나고 싶은 마음보다, 다시 휘말리고 싶지 않은 쪽이 더 크게 읽힌다—적어도 상대 피드는 그렇다.",
] as const;

const BREAKUP_RESONANCE = [
  "확인받고 싶다가 한 줄, 혼자 견딘다가 한 줄—같은 주에 공존한다. 말은 괜찮은데 톤은 냉각.",
  "이별 직후 과하게 멀쩡하면 감정이 없어진 게 아니라, 다시 흔들리는 상황을 피하는 쪽에 가깝다.",
  "한쪽은 접점을 늘리고 한쪽은 속도를 늦춘다. 연애 문제라기보다 기대·속도 불일치 축.",
  "급삭제가 아니다. 말하기 지친 축이다. 트리거 소재에서만 톤이 무너진다.",
] as const;

const SNAPSHOT_YOU = [
  "감정이 사라진 게 아니라, 감정이 새는 구멍만 좁혀 둔 상태로 읽힌다.",
  "스토리로 우회하다 DM은 못 보낸다. 들키기 싫은 욕구가 고백으로 번지기 쉽다.",
  "‘혼자 잘 산다’가 반복되면 방어다. 무관심이면 굳이 증명할 에너지가 줄어든다.",
] as const;

const SNAPSHOT_THEM = [
  "열린 사람인 척은 해도, 실제로는 다시 흔들리기 싫어서 문을 얇게 잠근 톤.",
  "연애 캡션은 줄이고 경계는 피드에 박아 뒀다. 친절과 개방을 헷갈리면 오판 난다.",
  "절대 안 돌아간다도, 다시 열자도 아니다. 새 사람 쪽으로 기운지는 따로 봐야 한다.",
] as const;

const FREE_WHY_AMBIGUOUS = [
  "끝낸 척은 하는데 잔상은 남았다. 한 신호만 골라 믿으면 ‘될 것 같다’로 오판 난다.",
  "여지처럼 보이는 것과 방어가 동시에 있다. 점수는 ‘된다’가 아니라 지금 들어가면 방어만 두꺼워질 쪽을 가리킨다.",
  "완전 종료도 적극 재시작도 약하다. 애매함이 곧 지금의 판정이다.",
] as const;

const FREE_KEY_VARIABLE = [
  "연락이 문제라기보다, 지금 들어가면 진심보다 피로로 읽힐 가능성이 크다. 피로·자존심·‘부담인지 대화인지’가 승부를 가른다.",
  "상대가 새 서사를 쌓았을수록 첫 접점은 가볍지 않으면 문만 닫힌다.",
  "네 감정 높이와 상대 방어 사이 간격. 좁히기 전엔 말해도 전달이 어긋난다.",
] as const;

function computeContactLeanPercent(seed: number, scores: ReunionScores): number {
  return Math.min(78, Math.max(22, Math.round(
    46 + (scores.contactTimingFit - scores.theirReunionOpenness) * 0.42 + (seed % 11) - 5,
  )));
}

function buildDecisionHint(seed: number, contactLeanPercent: number): ReunionDecisionHint {
  const headline =
    contactLeanPercent >= 58
      ? pick(seed, 201, [
          "지금은 ‘연락하면 먹힐 틈’이 조금 보인다. 그렇다고 지금 당장 손 대도 된다는 뜻은 아니다.",
          "창구는 있을 수 있다. 첫 문장이 부담이면 틈은 바로 사라진다.",
          "기다림만이 정답은 아니다. 다만 연락은 짧고 가벼울 때만 관계를 연다.",
        ])
      : contactLeanPercent <= 42
        ? pick(seed, 202, [
            "지금은 기다리는 쪽에 무게가 실린다. 속도 안 맞춘 연락은 관계를 여는 대신 방어만 두껍게 만든다.",
            "먼저 들어가면 상대 방어만 더 두꺼워질 가능성이 크다. 자극(연타·간접 압박)부터 줄여라.",
            "기다림은 멍때림이 아니다. 상대 리듬에 맞출 때까지 손 떼는 쪽이다.",
          ])
        : pick(seed, 203, [
            "열린 것 같다가도 닫힌 것 같다. 애매함이 지금의 판정이다.",
            "여지처럼 보이는 것과 방어가 겹친다. 승부수보다 온도가 먼저다.",
            "된다/안 된다보다, 지금 어떤 접근이 문을 닫는지가 본론이다.",
          ]);

  const hintLine = pick(seed, 204, [
    "지금 손 내밀면 먹히는지·기다려야 하는지·상대가 진짜 열려 있는지—끝까지는 심층에서 판독한다.",
    "무료는 방향만 준다. 문장·타이밍·답 올 확률은 잠금.",
    "‘언제·뭐라고’가 갈린다. 그건 유료 구간이다.",
  ]);

  return { contactLeanPercent, headline, hintLine };
}


function buildPremiumTeasers(
  seed: number,
  monthsSince: number,
  contactPct: number,
  synthesis: ReunionSynthesis,
  theirFocus: TheirFocusReport,
  actionGuide: ReunionActionGuide,
): ReunionPremiumTeaser[] {
  const waitRangeShort = monthsSince <= 2 ? "2~4주" : monthsSince <= 8 ? "3~6주" : "8주+";

  const waitWindowHint =
    monthsSince <= 2
      ? "우선 2~4주: 상대 스토리·업로드 리듬이 ‘방어 톤’에서 내려가는지 본다."
      : monthsSince <= 8
        ? "3~6주 단위로 체크: 피로·회피 톤이 완화되는 신호가 있을 때만 속도를 올린다."
        : "단기가 아니다. 새 서사가 얇아지거나 트리거에서만 톤이 흔들릴 때 관망 비중이 커진다.";

  const tonePreview = pick(seed, 91, [
    "\"요즘 어때? 한 줄만이라도.\"",
    "\"바쁠 수 있는데, 괜찮을 때만 짧게.\"",
    "\"그때 부담 준 건 미안해. 길게 안 할게.\"",
  ]);

  const newPersonWeightPercent = 26 + (seed % 37);

  const locked1 = [
    `【연락 vs 기다림 · 최종 판독】\n${synthesis.whyThisScore}\n\n${theirFocus.openToReunionNow}\n\n무의식 방어: ${theirFocus.unconsciousDefensePattern}\n\n${synthesis.keyVariable}`,
    `지금 변수: ${synthesis.contactOpensOrCloses}`,
  ].join("\n\n");

  const locked2 = [
    `【기다림이 맞다면 · 언제까지】\n${waitWindowHint}\n\n이후에도 다음이 남아 있으면 연락은 미룬다: 스토리가 회피 톤, 댓글·반응 속도 급락, 야간·주말에만 감정 소재가 튀는 패턴.\n\n2주·4주·8주 체크포인트별로 ‘연락 시도 적합/비적합’ 기준과, 그때 써도 되는 첫 문장 톤(짧음·중립·사과 중심)을 케이스별로 정리한다. 달력이 아니라 계정 신호가 안정·완화되는 패턴을 기준으로 한다.`,
    monthsSince <= 3
      ? "이별 직후라면 ‘즉시’보다 상대 피로가 내려가는 구간을 먼저 잡는 편이 역효과가 적다."
      : "시간이 지난 만큼 새 서사가 단단해졌는지가 변수다. 서사가 두꺼울수록 첫 접점은 더 가볍게.",
  ].join("\n\n");

  const locked3 = [
    `【톤 · 문장 · 답장 가능성】\n먹히는 톤: ${actionGuide.toneIfContact}\n\n지금 연락 가이드: ${actionGuide.contactNowGuidance}\n\n기다릴 때: ${actionGuide.waitGuidance}`,
    `답장 가능성이 올라가는 방식: 한 줄 확인, 부담 낮은 질문, 사과는 핵심만, 요구 대신 선택지.\n\n답 없이 더 멀어지는 방식: ${actionGuide.avoidActions}`,
    `첫 문장 후보 3개(복붙용 아님—길이·속도 원칙 고정): (1) 안부 한 줄 (2) 사과 한 줄 (3) 공통 관심 한 줄. 방어형 상대에게는 (1)만 먼저.`,
  ].join("\n\n");

  const locked4 = [
    `【새 사람 가능성 · 가중치】\n${theirFocus.newPersonPossibilitySignals}\n\n태그 반복, 특정 인물 단독 노출, 야간·주말 스토리 상관, 장소 루프를 가능성 구간으로만 정리한다. 가족·동료·촬영 오탐을 걸러내는 기준과, 확인 질문이 왜 방어를 올리는지(역효과)를 사례별로 쓴다. 14일 관찰 시트·묻지 말 질문 목록 포함.`,
  ].join("\n");

  return [
    {
      key: "contact-wait",
      title: "지금 연락 vs 기다리기",
      visibleSummary: "",
      contactVsWaitPercent: contactPct,
      lockedBody: locked1,
    },
    {
      key: "wait-until",
      title: "기다린다면, 언제까지가 맞는지",
      visibleSummary: "",
      waitRangeShort,
      lockedBody: locked2,
    },
    {
      key: "tone-reply",
      title: "연락한다면: 먹히는 톤 vs 멀어지는 톤",
      visibleSummary: "",
      tonePreview,
      lockedBody: locked3,
    },
    {
      key: "new-person",
      title: "상대가 새 사람 쪽으로 기운 가능성",
      visibleSummary: "",
      newPersonWeightPercent,
      lockedBody: locked4,
    },
  ];
}

function buildReport(seed: number, monthsSince: number, breakupYear: number, breakupMonth: number): ReunionFullReport {
  const scores = scoreTriplet(seed, monthsSince);
  const summaryLine = pick(seed, 1, SUMMARY_LINES);
  const breakupResonance = pick(seed, 30, BREAKUP_RESONANCE);
  const my: MyProfileSignals = {
    observedFrom: "공개 바이오·캡션·하이라이트·스토리 간격만. 비공개·삭제는 제외.",
    emotionalState: pick(seed, 2, [
      "관계 키워드만 터지면 캡션 밀도가 달라진다. 감정이 없어진 게 아니라 피하는 주제가 있다.",
      "가사·이모지로 감정 대체. 톤만 무거워지면 ‘말하기 싫다’ 쪽.",
      "말투·태그만 사라지면 피드에서 관계 서사 지우는 편집일 수 있다.",
    ]),
    lingeringAttachment: pick(seed, 4, [
      "장소·계절 반복은 미련일 수도, 흔들리기 싫은 잔류일 수도 있다.",
      "과거 콘텐츠를 새 서사로 안 덮으면 정리 완료와 거리가 있다.",
      "활동 리듬이 들쭉날쭉하면 감정이 피드에 박혀 있다.",
    ]),
    relationshipOpenness: pick(seed, 3, [
      "새 사람보다 ‘나 먼저’ 서사가 앞선다. 다시 들일 만큼 문 열린 상태는 아니다.",
      "경계는 있는데 그리움을 완전히 지운 톤은 아니다. 열림과 방어가 동시다.",
      "‘혼자 잘 산다’ 반복은 방어일 수 있다. 증명이 많을수록 에너지가 아직 거기 있다.",
    ]),
    contactInitiationTendency: pick(seed, 5, [
      "스토리 반응으로 온도 재다 고백으로 번지기 쉽다.",
      "DM보다 피드·스토리 우회가 크면 오해가 커진다.",
      "연락 안 한다면서 열람·반응 남기면 경계만 올라간다.",
    ]),
  };

  const their: TheirProfileSignals = {
    observedFrom: "상대 공개 피드만. 패턴이 겹칠 때만 해석.",
    emotionalState: pick(seed, 6, [
      "특정 소재에서만 톤이 바뀐다. 감정 새는 구멍만 막은 느낌.",
      "새 장소 노출 = 전환이라 단정 금지. 리셋 연출과 구분해야 한다.",
      "성과·풍경 중심 이동은 정리일 수도 억제일 수도 있다.",
    ]),
    relationshipOpenness: pick(seed, 7, [
      "환영보다 통제·회복 모드. 연락 반응으로 드러난다.",
      "연애 캡션 줄인 건 경계를 피드로 그은 것.",
      "경계 문장 반복이면 혼란 싫음이 열림보다 앞선다.",
    ]),
    newPeopleReadiness: pick(seed, 8, [
      "0은 아니다. 깊은 교류까지 열렸다고 말하긴 이르다.",
      "사교 늘어도 로맨틱 개방으로 바로 연결하지 마라.",
      "예전 관계로 다시 들어가는 건 별도 문턱이다.",
    ]),
    reunionOpenness: pick(seed, 9, [
      "절대 안 돌아간다도, 다시 열자도 아니다. 부담 낮을 때만 반응이 달라질 수 있다.",
      "관망이 곧 여지는 아니다. 피로가 먼저일 수 있다.",
      "가벼운 접점엔 반응할 수 있어도 기다리면 온다에만 매달리면 방어만 익숙해진다.",
    ]),
    likelyToReachOutFirst: pick(seed, 10, [
      "긴 총정리·관계 정의 타입은 낮다. 비용을 크게 느낀다.",
      "무관심이 방어일 수 있다. 그럼 연락은 늦거나 짧다.",
      "먼저 오면 고백보다 일상·공통 관심 한 줄이 덜 자극적이다.",
    ]),
  };

  const theirFocus: TheirFocusReport = {
    openToReunionNow: pick(seed, 40, [
      "지금은 환영 모드가 아니라 조건부 관망에 가깝습니다. 완전 차단형(흔적 급삭제·감정 언어 제거)과도 거리가 있어요—그래서 더 애매합니다. 열려 있다는 말이 재회를 원한다는 뜻은 아니고, 부담이 낮을 때만 문이 아주 조금 움직일 수 있는 신호예요.",
      "가능성 0은 아니지만 적극적으로 다시 열어두는 단계도 아닙니다. 잔여 감정과 방어가 동시에 있어서, 무거운 연락 한 번에 후자가 이기기 쉬운 구간이에요. 지금 필요한 건 확신이 아니라 속도와 자극 조절입니다.",
      "‘다시 사귀자’보다 ‘일단 숨 고르기’ 신호가 더 큽니다. 숨 고르기 전에 장문·총정리·죄책감이 들어오면 문이 닫히는 쪽으로 기울기 쉽습니다. 가벼운 접점이 쌓이면 해석이 바뀔 여지는 있지만, 그걸 ‘곧 된다’로 바꾸면 오판입니다.",
    ]),
    newPersonPossibilitySignals: pick(seed, 72, [
      "같은 인물 반복 태그, 비슷한 시간대·장소 루프가 겹치면 새 만남 가능성을 열어둘 만합니다. 친구·동료·촬영 오탐이 많아 단정은 금지고, 심층에서는 가중치와 제외 규칙을 더 촘촘히 둡니다.",
      "연애 고백형 캡션은 약한데 사교·외출로 공백을 메우면, 누군가와 깊어졌다기보다 외로움·불안을 분산하는 패턴일 수 있어요. 재회 타이밍 잡을 때 변수로만 넣어야 합니다.",
      "특정 인물이 단독으로 자주 등장하면 주목할 만합니다. 교제 중이라 단정은 못 해도, ‘지금 내 연락이 어디에 걸릴지’를 현실적으로 좁히는 데 쓰입니다.",
    ]),
    unconsciousDefensePattern: pick(seed, 14, [
      "감정이 올라오면 본인도 모르게 바쁨·친구·일·유머로 화제를 돌립니다. 싫어해서가 아니라 다시 무너지는 느낌을 피하는 무의식 방어에 가깝고, 그때 설득을 밀어붙이면 방어만 두꺼워집니다.",
      "먼저 차갑게 보이려 거리를 두는 선제 방어가 있을 수 있어요. 겉은 단단한데 안은 지친 타입이면 공격으로 받아들이고, 관계만 더 굳습니다.",
      "잘못 인정보다 상황 재해석으로 내러티브를 지키려는 경향이 섞이면, 논리 이기기보다 호흡 맞추기가 덜 상처 나는 경우가 많아요. 그건 당신이 틀렸다는 뜻이 아니라 상대의 방어 기제가 그렇게 작동한다는 뜻입니다.",
    ]),
    willTheyReachOutFirst: pick(seed, 15, [
      "먼저 긴 연락·관계 재정의 타입은 신호상 낮습니다. 짧은 신호나 우연한 듯한 접점 쪽이 더 그럴듯해요. 기다리면 온다에만 기대면 시간만 가고, 방어는 익숙해집니다.",
      "먼저 잡는 비용을 크게 느끼면 표면 무관심이 나옵니다. 기다림이 항상 답은 아니고, 부담 없는 첫 문장이 변수가 될 때가 있습니다—다만 그 문장도 자극이면 소용없습니다.",
      "먼저 온다면 고백보다 일상·업무·공통 관심으로 시작하는 쪽이 자연스럽습니다. 그 순간 본인 쪽 과한 압박·추궁이 있으면 바로 닫힙니다.",
    ]),
  };

  const reunionReadiness = pick(seed, 16, [
    "재회가 '지금 당장'이 아니라 조건부로 읽힙니다. 부담 낮은 접점 없이는 움직일 이유가 신호상 약해요.",
    "재회 욕망과 의미 정리 미완은 다릅니다. 후자만 있으면 연락은 통할 수 있어도 관계는 같은 자리로 돌아가기 쉽습니다.",
    "상대가 먼저 제안할 확률은 높지 않습니다. 완전 거절 고정이라 단정하긴 이르지만, 기다림만으로 열리는 타입도 아닙니다.",
  ]);

  const relationshipOpenness = pick(seed, 17, [
    "관계 전반 개방성은 중간 이하로 읽힙니다. 안전지대를 먼저 쌓는 신호가 앞섭니다.",
    "겉으론 열려 보여도 실제 투자는 신중합니다. 친절을 개방으로 착각하면 바로 오해가 납니다.",
    "기대를 낮춘 채 관망하는 모드에 가깝고, 그 관망이 곧 여지는 아닙니다.",
  ]);

  const currentDatingLikelihood = pick(seed, 18, [
    "진지한 교제 직접 신호는 약합니다. 가벼운 만남·사교는 열어둘 만하지만 로맨스로 바로 연결하긴 이릅니다.",
    "새 로맨스보다 일상 회복·사교 쪽 에너지가 더 두드러질 수 있어요. 그건 ‘없다’가 아니라 ‘다른 축에 있다’에 가깝습니다.",
    "반복 노출이 있어도 친구·업무일 수 있습니다. 단정 대신 변수로만 두는 게 안전합니다.",
  ]);

  const unconsciousPattern = pick(seed, 19, [
    "다시 상처받지 않기가 먼저라 관심이 있어도 겉은 차갑게 보일 수 있어요. 그걸 거절로만 읽으면 대응이 과해집니다.",
    "과거 패턴 재발 전에 관문을 세우는 방어가 작동 중일 수 있습니다. 설득보다 자극을 줄이는 쪽이 덜 역효과입니다.",
    "좋은 감정과 불안이 동시에 올라올 때 불안을 먼저 처리하려는 경향이 섞이면, 짧은 연락도 부담으로 들리기 쉽습니다.",
  ]);

  const contactTiming = pick(seed, 20, [
    "큰 말보다 짧고 부담 없는 한 줄이 덜 자극적입니다. 길이가 곧 진심이 아니라 부담으로 읽힐 수 있어요.",
    "감정 폭발이 오른 밤보다 리듬이 안정된 시간대가 역효과 위험이 낮은 편입니다.",
    "연락 전 상대 피드·스토리 리듬을 짧게라도 다시 보세요. 감으로 쓰면 톤이 어긋나기 쉽습니다.",
  ]);

  const synthesis: ReunionSynthesis = {
    whyThisScore: pick(seed, 21, [
      `세 점수가 동시에 높지도 낮지도 않은 이유는, 두 계정 모두 ‘끝냈다’는 표면과 아직 남은 잔상이 같이 잡히기 때문입니다. 헤어진 지 ${monthsSince <= 0 ? "얼마 되지 않아" : "시간이 흘러"} 감정과 방어의 비중이 바뀌는 구간이라 한 신호만 믿고 결론 내리면 오판이 납니다.`,
      "여지로 읽히는 신호와 방어·피로 신호가 겹칩니다. 점수는 ‘된다/안 된다’가 아니라 지금 이 속도·톤으로 가면 문이 닫힐 쪽으로 기우는지를 말하는 편에 가깝습니다.",
      "완전 종료 서사도 적극 재시작 서사도 약하면 회색대가 길게 납니다. 그 불편한 간격이 지금 점수 구간이에요.",
    ]),
    keyVariable: pick(seed, 22, [
      "가장 큰 변수는 상대의 피로·자존심, 그리고 내 연락이 대화 요청으로 들릴지 부담으로 들릴지입니다. 같은 문장도 여기서 갈립니다. 문제는 가능성이 아니라 어떤 접근이 이 사람을 더 닫히게 만드느냐입니다.",
      "시간이 지난 만큼 상대가 새 생활 서사를 얼마나 단단히 쌓았는지가 두 번째 변수입니다. 쌓일수록 무거운 한 방보다 가벼운 접점이 변수가 됩니다.",
      "내 감정의 높이와 상대 방어 사이 간격이 좁혀지지 않으면 진심도 전달이 어긋납니다. ‘말했는데 왜 몰라’가 나오기 전에 온도부터 맞추는 게 현실적입니다.",
    ]),
    contactOpensOrCloses: pick(seed, 99, [
      "지금 충동적으로 장문을 쏘거나 관계를 못 박는 연락은 신호상 문을 닫는 쪽으로 기울 확률이 큽니다. 짧고 존중이 있는 한 줄은 문을 활짝 열진 못해도 나중을 위한 숨구멍은 남길 수 있어요.",
      "회피 모드에서 연타·죄책감·새 사람 추궁은 방어만 두꺼워집니다. 속도를 줄이는 건 포기가 아니라 온도 맞추기일 수 있지만, 기다림이 항상 정답은 아닙니다.",
      "연락 한 번이 결과를 바꿀 수도 망칠 수도 있는 구간입니다. 그 불편한 불확실성을 인정할 때 톤이 덜 흔들립니다.",
    ]),
  };

  const actionGuide: ReunionActionGuide = {
    contactNowGuidance: pick(seed, 25, [
      "지금 연락이 맞는지는 감정이 폭발 직전인지부터 봅니다. 들떠 있으면 오늘은 쓰지 않는 게 이기는 경우가 많아요. 차분할 때 짧은 확인 한 줄이 가장 덜 위험합니다.",
      "연락은 통할 구간이어도 관계 정의·재회 선언까지 한 번에 가면 역효과가 큽니다. 먼저 부담만 깎으세요.",
      "상대 피드·스토리가 회피 톤이면 하루 이틀 미루고 리듬을 다시 보는 편이 안전합니다. 강박으로 쓰면 톤이 금방 새요.",
    ]),
    waitGuidance: pick(seed, 26, [
      "기다림은 멍하니 있는 게 아니라 연타·스토리 확인 강박·간접 메시지 같은 자극을 줄이는 겁니다. 안 하면서 스토리만 열어보는 건 기다림이 아니에요.",
      "상대가 새 서사를 쌓는 구간이면 속도를 맞추는 쪽이 현실적입니다. 내 감정 시계와 상대 시계가 다르다는 걸 전제로 두세요.",
      "하루 단위보다 상대 리듬이 안정됐는지를 기준으로 보세요. 불안이 기준을 잡으면 판단이 흔들립니다.",
    ]),
    avoidActions: pick(seed, 27, [
      "죄책감 유발, 비난, 과거 총정리, 새 연애 추궁, 공개 플랫폼 간접 메시지는 위험도가 높습니다. ‘진심’이라는 이름으로 자극만 키우는 경우가 많아요.",
      "읽씹 후 연타, 과잉 사과, ‘마지막이야’식 문장은 방어를 키웁니다. 말이 길수록 통제욕으로 읽히기 쉽습니다.",
      "친구 전달·스토리로만 감정 표현은 오해를 키웁니다. 직접 말하기 어렵다는 건 상대에게도 그만큼 부담이라는 뜻일 수 있어요.",
    ]),
    toneIfContact: pick(seed, 28, [
      "짧게, 요구가 아니라 선택지를 주는 톤이 덜 부담스럽습니다. 완충 문장은 미약해 보여도 방어를 덜 긁습니다.",
      "사과가 필요하면 한두 문장으로 핵심만. 설명은 상대가 물을 때 늘리세요. 먼저 길게 풀면 해명으로 읽힙니다.",
      "감정 크기를 말로 증명하려 하지 말고 이후 행동이 말을 따라가게 하세요. 말이 앞서면 신뢰 신호로 안 읽힙니다.",
    ]),
  };

  const freeClosingSummary: ReunionFreeClosingSummary = {
    whyThisScore: pick(seed, 50, [
      `지금 점수는 불가능도 확정 성공도 아닙니다. 두 계정 신호가 서로를 당기는 상태를 숫자로 옮긴 거예요. 헤어진 지 ${monthsSince <= 0 ? "얼마 안 된 시점" : "이만큼 지난 시점"}이라 감정과 방어가 섞여 있기 때문입니다.`,
      "한쪽만 보면 오판이 납니다. 여지만 보면 착각이 되고 방어만 보면 너무 차가워집니다. 점수는 그 사이를 같이 보라는 신호예요.",
    ]),
    keyVariable: pick(seed, 51, [
      "지금 가장 중요한 건 속도입니다. 상대 피로·자존심, 내 연락이 부담으로 들리는지가 다음 한 수를 가릅니다.",
      "두 번째는 상대가 새 생활 서사를 얼마나 단단히 쌓았는지입니다. 두꺼울수록 무거운 한 방보다 가벼운 접점이 변수입니다.",
    ]),
    contactNowOrWait: pick(seed, 52, [
      "감정이 격해져 있거나 상대 피드가 회피 톤이면 오늘은 기다리는 편이 이득일 수 있어요. 차분하고 짧은 한 줄이 준비됐다면 관계를 더 닫지 않는 쪽으로만 시도하세요.",
      "연락해야 한다는 강박이 느껴지면 잠시 멈추세요. 강박이 톤에 섞이면 관계가 닫히는 경우가 많습니다. 짧은 메시지가 있으면 부담 최소화 방향으로만 가세요.",
    ]),
  };

  const premiumGateCta: ReunionPremiumGateCta = {
    title: "여기까지가 무료 판독의 끝이다.",
    body: "지금 연락하면 먹히는지, 기다려야 하는지, 상대가 열려 있는지, 새 사람 쪽으로 기운지—심층에서 문장으로 끝까지 연다. 듣기 좋은 말만 하지 않는다.",
    footnote: "공개 프로필 시그널·패턴 해석. 운세 아님.",
    ctaPrimary: "기다릴지 연락할지 끝까지 보기",
    ctaAuxiliary: "상대 속마음·반응 가능성·첫 문장까지 한 번에",
    stickyHeadline: "기다릴지 연락할지 끝까지 보기",
    stickySubline: `심층 열람 ${1_200 + (seed % 800).toLocaleString()}건`,
    stickyListPrice: "9,900원",
    stickyPriceLabel: "4,900원",
    stickySaleNote: "오픈 특가 · 정가 대비",
  };

  const finalRecommendation = pick(seed, 29, [
    "숫자에 숨지 마라. 다음 한 수는 짧게. 속도 틀리면 진심도 역효과다.",
    "한 번에 해결하려 할수록 방어만 두꺼워진다. 가벼운 접점에서 반응을 본 뒤 움직여라.",
    "연락 강박이 오르면 오늘은 쓰지 마라. 톤에 강박이 묻으면 상대는 피로로 읽는다.",
  ]);

  const breakupLabel = `${breakupYear}년 ${breakupMonth}월`;
  const monthsSinceLabel = formatMonthsSinceLabel(monthsSince);

  const contactLeanPercent = computeContactLeanPercent(seed, scores);
  const decisionHint = buildDecisionHint(seed, contactLeanPercent);
  const signalSnapshot: ReunionSignalSnapshot = {
    conflictLine: breakupResonance,
    youLine: pick(seed, 301, SNAPSHOT_YOU),
    themLine: pick(seed, 302, SNAPSHOT_THEM),
  };
  const freeCore = {
    whyAmbiguous: pick(seed, 400, FREE_WHY_AMBIGUOUS),
    keyVariable: pick(seed, 401, FREE_KEY_VARIABLE),
  };
  const premiumTeasers = buildPremiumTeasers(seed, monthsSince, contactLeanPercent, synthesis, theirFocus, actionGuide);
  const premiumLocked: ReunionPremiumCard[] = premiumTeasers.map((t) => ({ title: t.title, body: t.lockedBody }));

  return {
    meta: {
      breakupYear,
      breakupMonth,
      breakupLabel,
      monthsSinceBreakup: monthsSince,
      monthsSinceLabel,
    },
    summaryTitle: "지금, 연락이 먹히는지 판독",
    summaryLine,
    scores,
    breakupResonance,
    socialProofLine: "",
    toc: [
      { id: "reunion-decision", label: "열릴까 닫힐까" },
      { id: "reunion-scores", label: "왜 애매한가" },
      { id: "reunion-snapshot", label: "인스타 흔적" },
      { id: "reunion-premium", label: "심층 판독" },
    ],
    myProfileSignals: my,
    theirProfileSignals: their,
    reunionReadiness,
    relationshipOpenness,
    currentDatingLikelihood,
    unconsciousPattern,
    contactTiming,
    theirFocus,
    synthesis,
    actionGuide,
    freeClosingSummary,
    premiumGateCta,
    finalRecommendation,
    decisionHint,
    signalSnapshot,
    freeCore,
    premiumTeasers,
    premiumLocked,
  };
}

/** 이별 시점을 로컬 기준 현재 이전으로 클램프 (미래 월·연도 방지) */
export function clampBreakupToPast(
  breakupYear: number,
  breakupMonth: number,
  now = new Date(),
): { year: number; month: number } {
  const cy = now.getFullYear();
  const cm = now.getMonth() + 1;
  let y = breakupYear;
  let m = breakupMonth;
  if (y > cy) y = cy;
  if (y === cy && m > cm) m = cm;
  if (m < 1) m = 1;
  if (y < 2000) y = 2000;
  return { year: y, month: m };
}

export function getReunionFullReport(
  myId: string,
  theirId: string,
  breakupYear: number,
  breakupMonth: number,
  now = new Date(),
): ReunionFullReport {
  const { year, month } = clampBreakupToPast(breakupYear, breakupMonth, now);
  const key = `${myId}|${theirId}|${year}-${month}`;
  const seed = hashKey(key);
  const monthsSince = getMonthsSinceBreakup(year, month, now);
  return buildReport(seed, monthsSince, year, month);
}
