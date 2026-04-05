/**
 * 재회 판정 뼈대 (Apify / AI 연결 전 단계).
 * TODO(Apify): `buildMockSignalsFromInput` 대신 프로필 스크랩·분석 결과를 `ReunionSignals`로 매핑하는 어댑터만 교체하면 된다.
 */

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
