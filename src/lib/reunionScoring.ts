/**
 * 재회 판정 — discrete mock 시그널(0~2) + rich 스크랩 시그널(0~100) 파생 점수.
 */
import type { ReunionRichSignals } from "@/lib/reunionSignals";

/** `reunionDummyData`의 ReunionScores와 동일 필드 (순환 import 방지) */
export type ReunionDisplayScores = {
  reunionPossibility: number;
  theirReunionOpenness: number;
  contactTimingFit: number;
};

/** 5개 핵심 시그널 — 모두 0 | 1 | 2, 합산 시 높을수록 재회 쪽으로 유리 */
export type ReunionSignals = {
  /** 감정 잔존 흔적: 낮음 0 / 중간 1 / 높음 2 */
  emotionResidual: 0 | 1 | 2;
  /** 방어감(높을수록 방어 큼): 높음 0 / 중간 1 / 낮음 2 → 점수는 낮은 방어가 유리하므로 2가 가장 유리 */
  defensiveness: 0 | 1 | 2;
  /** 관계 개방성: 낮음 0 / 중간 1 / 높음 2 */
  relationshipOpenness: 0 | 1 | 2;
  /** 새 사람 가능성(높을수록 불리): 높음 0 / 중간 1 / 낮음 2 */
  newPersonLikelihood: 0 | 1 | 2;
  /** 나와의 접점 가능성: 낮음 0 / 중간 1 / 높음 2 */
  contactPossibility: 0 | 1 | 2;
};

export type ReunionOutcomeCase = "closed" | "mixed" | "open";

function hashDeterministic(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function triFromHash(h: number, salt: number): 0 | 1 | 2 {
  const x = (h ^ salt * 2654435761) >>> 0;
  return (x % 3) as 0 | 1 | 2;
}

/**
 * TODO(Apify): 이 함수 본문을 `mapApifyOrAiToSignals(result): ReunionSignals` 로 교체.
 * 지금은 아이디·이별 경과월만으로 안정적인 0/1/2 목업을 만든다.
 */
export function buildMockSignalsFromInput(
  myId: string,
  theirId: string,
  breakupMonths: number,
): ReunionSignals {
  const h0 = hashDeterministic(`${myId}|${theirId}`);
  const h1 = hashDeterministic(`${theirId}|${myId}|${breakupMonths}`);
  const h2 = hashDeterministic(`${breakupMonths}|${myId.length}|${theirId.length}`);

  return {
    emotionResidual: triFromHash(h0, 1),
    defensiveness: triFromHash(h0, 2),
    relationshipOpenness: triFromHash(h1, 3),
    newPersonLikelihood: triFromHash(h1, 4),
    contactPossibility: triFromHash(h2, 5),
  };
}

/** 이별 후 경과 개월 수 기준 보정 */
export function calculateBreakupAdjustment(breakupMonths: number): number {
  if (breakupMonths <= 1) return -1;
  if (breakupMonths >= 2 && breakupMonths <= 6) return 0;
  if (breakupMonths >= 7 && breakupMonths <= 18) return 1;
  return 0;
}

export function calculateReunionScore(signals: ReunionSignals, breakupAdjustment: number): number {
  return (
    signals.emotionResidual +
    signals.defensiveness +
    signals.relationshipOpenness +
    signals.newPersonLikelihood +
    signals.contactPossibility +
    breakupAdjustment
  );
}

/**
 * 게이트 규칙 적용 후 closed / mixed / open.
 * 1차 밴드: finalScore 0~3 closed, 4~6 mixed, 7~11 open 후보
 */
export function decideReunionCase(
  signals: ReunionSignals,
  breakupMonths: number,
  finalScore: number,
): ReunionOutcomeCase {
  const { defensiveness, relationshipOpenness, newPersonLikelihood, contactPossibility } = signals;

  if (defensiveness === 0 && contactPossibility === 0) return "closed";
  if (defensiveness === 0 && relationshipOpenness === 0) return "closed";
  if (newPersonLikelihood === 0 && contactPossibility === 0) return "closed";
  if (breakupMonths <= 1 && defensiveness <= 1 && contactPossibility <= 1) return "closed";

  if (finalScore <= 3) return "closed";
  if (finalScore <= 6) return "mixed";

  const openEligible =
    finalScore >= 7 &&
    contactPossibility >= 1 &&
    defensiveness >= 1 &&
    relationshipOpenness >= 1;
  if (!openEligible) return "mixed";

  if (contactPossibility === 1 && defensiveness === 1 && relationshipOpenness === 1) return "mixed";

  return "open";
}

function clampScore(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/** UI 상단 3개 막대 — 시그널·최종 점수 반영 (기존 카드 레이아웃용 숫자) */
export function calculateDisplayScores(
  signals: ReunionSignals,
  finalScore: number,
  breakupMonths: number,
): ReunionDisplayScores {
  const { emotionResidual, defensiveness, relationshipOpenness, newPersonLikelihood, contactPossibility } = signals;

  const reunionPossibility = clampScore(
    28 +
      emotionResidual * 13 +
      relationshipOpenness * 11 +
      contactPossibility * 9 +
      newPersonLikelihood * 5 +
      (finalScore - 5) * 2.5 +
      (breakupMonths <= 2 ? -4 : breakupMonths >= 12 ? 3 : 0),
    24,
    88,
  );

  const theirReunionOpenness = clampScore(
    26 + relationshipOpenness * 17 + defensiveness * 13 + emotionResidual * 5 + (finalScore - 5) * 1.5,
    22,
    86,
  );

  const contactTimingFit = clampScore(
    24 +
      contactPossibility * 19 +
      defensiveness * 10 +
      (2 - Math.min(2, newPersonLikelihood)) * 4 +
      (finalScore - 5) * 2,
    22,
    84,
  );

  return {
    reunionPossibility,
    theirReunionOpenness,
    contactTimingFit,
  };
}

/** 무료 구간 연락 기울기 % — 시그널·finalScore 기반 */
export function calculateContactLeanPercent(signals: ReunionSignals, finalScore: number): number {
  const p =
    32 +
    signals.contactPossibility * 13 +
    signals.defensiveness * 9 +
    signals.relationshipOpenness * 5 +
    (finalScore - 5) * 2;
  return Math.min(78, Math.max(22, Math.round(p)));
}

function clampUi(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, Math.round(n)));
}

/**
 * rich signals(0~100) → UI 3점수 + 연락 기울기 % + case (규칙 오버라이드).
 */
export function scoreReunionFromRich(s: ReunionRichSignals): {
  case: ReunionOutcomeCase;
  displayScores: ReunionDisplayScores;
  contactLeanPercent: number;
} {
  const th = s.theirSignals;
  const act = s.actionSignals;
  const pair = s.pairSignals;
  const my = s.mySignals;

  let reunionPossibility = clampUi(
    th.opennessScore * 0.22 +
      th.casualReentryOpenness * 0.22 +
      (100 - th.avoidanceScore) * 0.18 +
      pair.reopenConditionScore * 0.18 +
      act.lightContactFitScore * 0.12 +
      (100 - act.heavyContactRiskScore) * 0.08,
    26,
    88,
  );

  const theirReunionOpenness = clampUi(
    th.opennessScore * 0.45 + th.casualReentryOpenness * 0.35 + (100 - th.heavyContactResistance) * 0.2,
    24,
    86,
  );

  const contactTimingFit = clampUi(
    act.lightContactFitScore * 0.5 +
      (100 - act.heavyContactRiskScore) * 0.3 +
      (100 - act.definitionTalkRiskScore) * 0.2,
    24,
    84,
  );

  let contactLeanPercent = Math.round(
    Math.min(
      78,
      Math.max(
        22,
        26 +
          act.lightContactFitScore * 0.38 -
          act.waitFitScore * 0.22 +
          (100 - th.heavyContactResistance) * 0.14 +
          (th.casualReentryOpenness - 50) * 0.12,
      ),
    ),
  );

  let caseResolved: ReunionOutcomeCase = "mixed";

  if (th.avoidanceScore >= 74 && my.emotionalResidueScore >= 58) {
    caseResolved = "closed";
  } else if (th.casualReentryOpenness >= 60 && th.defensiveShiftScore <= 52 && act.heavyContactRiskScore < 70) {
    caseResolved = "open";
  } else if (reunionPossibility < 42 || th.avoidanceScore >= 80) {
    caseResolved = "closed";
  } else if (reunionPossibility >= 60 && contactTimingFit >= 50 && act.heavyContactRiskScore < 72) {
    caseResolved = "open";
  }

  if (caseResolved === "open" && act.heavyContactRiskScore >= 72) caseResolved = "mixed";
  if (caseResolved === "open" && th.avoidanceScore >= 70) caseResolved = "mixed";
  if (caseResolved === "open" && th.opennessScore < 48) caseResolved = "mixed";
  if (caseResolved === "closed" && th.opennessScore >= 68 && th.avoidanceScore < 66 && act.heavyContactRiskScore < 75) {
    caseResolved = "mixed";
  }

  return {
    case: caseResolved,
    displayScores: {
      reunionPossibility,
      theirReunionOpenness,
      contactTimingFit,
    },
    contactLeanPercent,
  };
}

/** 상대가 먼저 연락 올 확률·시점·채널 (theirSignals + 경과월) */
export type TheirReachOutForecast = {
  percent: number;
  timingBand: string;
  channelPrimary: string;
  channelSecondary: string;
  rationaleLine: string;
  punchLine: string;
  lockedBody: string;
};

export function computeTheirReachOutFirst(s: ReunionRichSignals): TheirReachOutForecast {
  const th = s.theirSignals;
  const m = s.profileMeta.breakupMonthsSince;

  const raw =
    th.casualReentryOpenness * 0.34 +
    th.emotionalResidueScore * 0.23 +
    (100 - th.avoidanceScore) * 0.31 +
    (100 - th.heavyContactResistance) * 0.12;
  const percent = clampUi(raw * 0.88, 11, 84);

  let timingBand: string;
  if (th.avoidanceScore >= 74) {
    timingBand =
      m <= 1
        ? "지금~4주: 거의 제로에 가깝다. 회피 점수가 너무 높음."
        : m <= 4
          ? "10~14주쯤 가서야 스토리급 가벼운 접점 정도는 볼 수 있음"
          : "8~12주 넘겨도 장문 DM 먼저 올 확률은 낮음";
  } else if (percent >= 52) {
    timingBand =
      m <= 2 ? "이별 후 4~7주 사이" : m <= 6 ? "이별 후 6~9주 사이" : "이별 후 8~12주 사이";
  } else {
    timingBand =
      m <= 2 ? "6~10주는 봐야 함 — 지금은 아님" : "10주 넘겨도 먼저 길게 쓰진 않을 쪽";
  }

  let channelPrimary: string;
  let channelSecondary: string;
  if (th.avoidanceScore >= 68) {
    channelPrimary = "스토리 반응 · 이모지 · 짧은 리액션";
    channelSecondary = `회피 ${th.avoidanceScore}면 장문 DM으로 선뜻 안 온다. 부담 거의 없는 쪽부터 깨는 타입.`;
  } else if (th.casualReentryOpenness >= 58 && th.emotionalResidueScore >= 52) {
    channelPrimary = "DM 한두 줄 · 짧은 확인 멘트";
    channelSecondary = `가벼운 재진입 ${th.casualReentryOpenness} + 잔상 ${th.emotionalResidueScore}면 직접 타이핑 나올 틈은 있음.`;
  } else if (th.activityTrend === "up") {
    channelPrimary = "피드·릴 노출 뒤 스토리나 가벼운 댓글";
    channelSecondary = `노출은 늘었는데 회피 ${th.avoidanceScore} — 오픈 DM보단 겉도는 접점이 먼저.`;
  } else {
    channelPrimary = "공개 댓글보다 비공개 스토리·반응 쪽";
    channelSecondary = `댓글은 부담으로 잡히기 쉬움. 회피 ${th.avoidanceScore}.`;
  }

  const rationaleLine = `가벼운 재진입 ${th.casualReentryOpenness} · 잔상 ${th.emotionalResidueScore} · 회피 ${th.avoidanceScore} 조합으로 뽑은 수치다.`;

  const punchLine =
    percent >= 55
      ? "잔상은 있는데 회피가 같이 높으면 오긴 오는데 티 안 내려고 하는 타입 많다. 안 보이면 없는 거다."
      : "회피가 잔상 이기면 먼저 온다고 착각했다가 읽씹 각 나온다.";

  const lockedBody = [
    rationaleLine,
    "",
    `예상 시점: ${timingBand}`,
    "",
    `먼저 오면 이런 형태: ${channelPrimary}`,
    channelSecondary,
    "",
    punchLine,
  ].join("\n");

  return {
    percent,
    timingBand,
    channelPrimary,
    channelSecondary,
    rationaleLine,
    punchLine,
    lockedBody,
  };
}
