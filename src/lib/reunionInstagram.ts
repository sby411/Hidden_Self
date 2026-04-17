/**
 * 재회용 인스타 스크랩 — attraction과 동일하게 Supabase Edge + Apify 경로 사용.
 * (`supabase/functions/reunion-instagram` ↔ attraction의 `analyze-profile` Apify 블록 재사용)
 */
import { supabase } from "@/integrations/supabase/client";

export type ReunionScrapePost = {
  timestamp: string;
  caption: string;
  hashtags: string[];
  mentions: string[];
  mediaType: string;
  likeCount: number;
  commentCount: number;
  locationName: string;
  imageUrls: string[];
  alt: string;
};

export type ReunionScrapeProfile = {
  username: string;
  fullName: string;
  biography: string;
  externalUrl: string;
  isPrivate: boolean;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  highlightReelCount: number;
  highlightTitles: string[];
  profilePicUrl: string;
};

export type ReunionScrapeBundle = {
  profile: ReunionScrapeProfile;
  posts: ReunionScrapePost[];
  stats: {
    avgLikes: number;
    avgComments: number;
    engagementRate: number;
    totalLikes: number;
    totalComments: number;
    postCountReturned: number;
  };
};

export type ReunionScrapeResult =
  | { ok: true; data: ReunionScrapeBundle; privateWarning?: boolean }
  | { ok: false; error: string; message?: string; partial?: ReunionScrapeBundle };

/** Claude 인물 분석 (페어 모드) — 스크랩 번들 타입은 그대로 두고 응답에만 부가 */
export type ReunionAccountAiAnalysis = {
  persona: string;
  impression: string;
  keywords: string[];
  approach: string;
  psychState: string;
};

export type ReunionPairPipelineResult =
  | {
      ok: true;
      my: ReunionScrapeBundle;
      their: ReunionScrapeBundle;
      myAi: ReunionAccountAiAnalysis | null;
      theirAi: ReunionAccountAiAnalysis | null;
      myPersonaLine: string;
      partnerPersonaLine: string;
      compatibilityType: string;
      compatibilityDesc: string;
      myYearning: number;
      partnerYearning: number;
      reunionComment: string;
      summaryLine: string;
      theirFirstMoveComment: string;
      tensionAxis: string;
      myPrivateWarning: boolean;
      theirPrivateWarning: boolean;
      fromCache: boolean;
    }
  | { ok: false; error: string; message?: string };

function parseAiAnalysis(raw: unknown): ReunionAccountAiAnalysis | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const persona = typeof o.persona === "string" ? o.persona : "";
  const impression = typeof o.impression === "string" ? o.impression : "";
  const keywords = Array.isArray(o.keywords) ? o.keywords.filter((x): x is string => typeof x === "string") : [];
  const approach = typeof o.approach === "string" ? o.approach : "";
  const psychState = typeof o.psychState === "string" ? o.psychState : "";
  if (!impression.trim() || keywords.length === 0) return null;
  return {
    persona: persona.trim(),
    impression: impression.trim(),
    keywords: keywords.slice(0, 8),
    approach: approach.trim() || "데이터가 부족해 접근 방식을 구체화하기 어렵다.",
    psychState: psychState.trim() || "공개 데이터만으로는 심리 상태를 단정하기 어렵다.",
  };
}

/**
 * 양 계정 스크랩 + Claude 인물 분석 + 서버 72h 캐시.
 * 단일 계정만 필요하면 `fetchInstagramProfileForReunion` 사용.
 */
export async function fetchReunionPairWithAnalysis(
  myUserId: string,
  theirUserId: string,
  resultsLimit = 24,
): Promise<ReunionPairPipelineResult> {
  const my = myUserId.replace(/^@/, "").trim();
  const their = theirUserId.replace(/^@/, "").trim();
  if (!my || !their) return { ok: false, error: "EMPTY_USERNAME" };

  const { data, error } = await supabase.functions.invoke("reunion-instagram", {
    body: { myUserId: my, theirUserId: their, resultsLimit },
  });

  if (error) {
    return { ok: false, error: error.message || "INVOKE_FAILED" };
  }

  if (data?.ok && data?.mode === "pair" && data?.my && data?.their) {
    const myAi = parseAiAnalysis(data.myAiAnalysis);
    const theirAi = parseAiAnalysis(data.theirAiAnalysis);
    return {
      ok: true,
      my: data.my as ReunionScrapeBundle,
      their: data.their as ReunionScrapeBundle,
      myAi,
      theirAi,
      myPersonaLine: (typeof data.myPersonaLine === "string" ? data.myPersonaLine : "") || myAi?.persona || "",
      partnerPersonaLine: (typeof data.partnerPersonaLine === "string" ? data.partnerPersonaLine : "") || theirAi?.persona || "",
      compatibilityType: typeof data.compatibilityType === "string" ? data.compatibilityType : "",
      compatibilityDesc: typeof data.compatibilityDesc === "string" ? data.compatibilityDesc : "",
      myYearning: typeof data.myYearning === "number" ? data.myYearning : 65,
      partnerYearning: typeof data.partnerYearning === "number" ? data.partnerYearning : 35,
      reunionComment: typeof data.reunionComment === "string" ? data.reunionComment : "",
      summaryLine: typeof data.summaryLine === "string" ? data.summaryLine : "",
      theirFirstMoveComment: typeof data.theirFirstMoveComment === "string" ? data.theirFirstMoveComment : "",
      tensionAxis: typeof data.tensionAxis === "string" ? data.tensionAxis : "",
      myPrivateWarning: Boolean(data.myPrivateWarning),
      theirPrivateWarning: Boolean(data.theirPrivateWarning),
      fromCache: Boolean(data.fromCache),
    };
  }

  return {
    ok: false,
    error: typeof data?.error === "string" ? data.error : "UNKNOWN",
    message: typeof data?.message === "string" ? data.message : undefined,
  };
}

export async function fetchInstagramProfileForReunion(
  username: string,
  resultsLimit = 24,
): Promise<ReunionScrapeResult> {
  const clean = username.replace(/^@/, "").trim();
  if (!clean) return { ok: false, error: "EMPTY_USERNAME" };

  const { data, error } = await supabase.functions.invoke("reunion-instagram", {
    body: { userId: clean, resultsLimit },
  });

  if (error) {
    return { ok: false, error: error.message || "INVOKE_FAILED" };
  }

  if (data?.ok && data?.data) {
    return { ok: true, data: data.data as ReunionScrapeBundle };
  }

  if (data?.error === "PRIVATE_ACCOUNT" && data?.partial) {
    return {
      ok: true,
      data: data.partial as ReunionScrapeBundle,
      privateWarning: true,
    };
  }

  return {
    ok: false,
    error: data?.error || "UNKNOWN",
    message: data?.message,
    partial: data?.partial,
  };
}

/** 프리미엄 카드 8개 AI 생성 결과 */
export type ReunionPremiumCards = {
  waitUntil: string;
  toneReply: string;
  firstMessage: string;
  replyStyle: string;
  newPerson: string;
  misunderstanding: string;
  theirTrace: string;
  myDestroy: string;
};

/** 프리미엄 카드 key → ReunionPremiumCards 필드 매핑 */
export const PREMIUM_CARD_KEY_MAP: Record<string, keyof ReunionPremiumCards> = {
  "wait-until": "waitUntil",
  "tone-reply": "toneReply",
  "first-message": "firstMessage",
  "reply-style": "replyStyle",
  "new-person": "newPerson",
  misunderstanding: "misunderstanding",
  "their-trace": "theirTrace",
  "my-destroy": "myDestroy",
};

/**
 * 프리미엄 카드 AI 생성 — 이미 확보한 pair 데이터를 body에 포함시켜 edge function 호출.
 * Apify 재호출 없이 Claude만 호출함.
 */
export async function fetchReunionPremiumCards(pairData: {
  my: ReunionScrapeBundle;
  their: ReunionScrapeBundle;
  myAi: ReunionAccountAiAnalysis | null;
  theirAi: ReunionAccountAiAnalysis | null;
  compatibility: {
    compatibilityType: string;
    compatibilityDesc: string;
    myYearning: number;
    partnerYearning: number;
    reunionComment: string;
    summaryLine: string;
    theirFirstMoveComment: string;
  };
}): Promise<{ ok: true; cards: ReunionPremiumCards } | { ok: false; error: string }> {
  const { data, error } = await supabase.functions.invoke("reunion-instagram", {
    body: {
      mode: "premium",
      myBundle: pairData.my,
      theirBundle: pairData.their,
      myAiAnalysis: pairData.myAi,
      theirAiAnalysis: pairData.theirAi,
      compatibility: pairData.compatibility,
    },
  });

  if (error) {
    return { ok: false, error: error.message || "INVOKE_FAILED" };
  }

  if (data?.ok && data?.premiumCards) {
    const c = data.premiumCards;
    const cards: ReunionPremiumCards = {
      waitUntil: typeof c.waitUntil === "string" ? c.waitUntil : "",
      toneReply: typeof c.toneReply === "string" ? c.toneReply : "",
      firstMessage: typeof c.firstMessage === "string" ? c.firstMessage : "",
      replyStyle: typeof c.replyStyle === "string" ? c.replyStyle : "",
      newPerson: typeof c.newPerson === "string" ? c.newPerson : "",
      misunderstanding: typeof c.misunderstanding === "string" ? c.misunderstanding : "",
      theirTrace: typeof c.theirTrace === "string" ? c.theirTrace : "",
      myDestroy: typeof c.myDestroy === "string" ? c.myDestroy : "",
    };
    return { ok: true, cards };
  }

  return { ok: false, error: data?.error || "UNKNOWN" };
}
