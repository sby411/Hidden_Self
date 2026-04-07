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
    return {
      ok: true,
      my: data.my as ReunionScrapeBundle,
      their: data.their as ReunionScrapeBundle,
      myAi: parseAiAnalysis(data.myAiAnalysis),
      theirAi: parseAiAnalysis(data.theirAiAnalysis),
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
