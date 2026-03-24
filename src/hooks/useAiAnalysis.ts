import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { trackSubmissionStart, trackSubmissionSuccess, trackSubmissionFailed } from "@/lib/trackSubmission";

export interface InstagramProfile {
  fullName: string;
  biography: string;
  followersCount: number;
  followsCount: number;
  postsCount: number;
  highlightReelCount: number;
  isBusinessAccount: boolean;
  profilePicUrl: string;
}

export interface InstagramStats {
  avgLikes: number;
  avgComments: number;
  engagementRate: number;
  totalLikes: number;
  totalComments: number;
  topHashtags: string[];
}

export interface InstagramPost {
  caption: string;
  likesCount: number;
  commentsCount: number;
  hashtags: string[];
  alt: string;
  timestamp: string;
  type: string;
}

export interface InstagramData {
  profile: InstagramProfile;
  stats: InstagramStats;
  posts: InstagramPost[];
}

export interface AiAnalysis {
  instaImpression: string;
  vibeKeywords: string[];
  perceivedAccessibility: string;
  attractedType: {
    name: string;
    emoji: string;
    approach: string;
    earlyBehavior: string;
    feelings: string;
  };
  attractionStats: {
    olderAttraction: number;
    sameAgeAttraction: number;
    youngerAttraction: number;
    aegenPower: number;
    tetoPower: number;
  };
  psychTriggers: string[];
  decisiveMoment: string;
  datingPattern: {
    beginning: string;
    middle: string;
    turningPoint: string;
  };
  risks: string[];
  goodMatch: {
    type: string;
    emoji: string;
    personality: string;
    whyGoodFit: string;
    behaviors: string;
  } | string;
  badMatch: {
    type: string;
    emoji: string;
    personality: string;
    whyRepeated: string;
    problems: string;
  } | string;
  redFlags: Array<{ label: string; description: string; emoji: string }> | string[];
  actionGuide?: {
    styling: string[];
    responseStyle: string[];
    datingBehavior: string[];
  };
  avoidGuide?: {
    firstMeeting: string[];
    earlyWarnings: string[];
    instaHabits: string[];
  };
  harshTruth: string;
  premiumTeasers: string[];
  confidence: number;
  obsessionRate: number;
  relationshipScore: number;
  instagramData: InstagramData;
}

// Simple in-memory cache
const cache = new Map<string, AiAnalysis>();

const TIMEOUT_MS = 120_000; // 120 seconds

export function useAiAnalysis(userId: string) {
  const [data, setData] = useState<AiAnalysis | null>(cache.get(userId) || null);
  const [loading, setLoading] = useState(!cache.has(userId));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (cache.has(userId)) {
      setData(cache.get(userId)!);
      setLoading(false);
      return;
    }

    let cancelled = false;
    let timeoutId: ReturnType<typeof setTimeout>;

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);

      // Step 1: DB insert — track analysis start
      console.log("[useAiAnalysis] 🚀 Analysis START for:", userId);
      let submissionId: string | null = null;

      try {
        submissionId = await trackSubmissionStart(userId);
        if (submissionId) {
          sessionStorage.setItem("instai_submission_id", submissionId);
          console.log("[useAiAnalysis] ✅ DB insert success, submissionId:", submissionId);
        } else {
          console.warn("[useAiAnalysis] ⚠️ DB insert returned null (no id)");
        }
      } catch (dbErr) {
        console.error("[useAiAnalysis] ❌ DB insert exception:", dbErr);
      }

      // Step 2: Call AI analysis with timeout
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("분석 시간이 초과되었어요 (60초). 다시 시도해주세요."));
        }, TIMEOUT_MS);
      });

      try {
        console.log("[useAiAnalysis] 📡 Calling edge function analyze-profile...");

        const result = await Promise.race([
          supabase.functions.invoke("analyze-profile", { body: { userId } }),
          timeoutPromise,
        ]);

        clearTimeout(timeoutId!);

        if (cancelled) return;

        if (result.error) {
          // Check response body for specific error codes
          const bodyError = result.data?.error || result.error.message;
          if (bodyError === "PRIVATE_ACCOUNT") {
            throw new Error("PRIVATE_ACCOUNT");
          }
          throw new Error(bodyError || "Analysis failed");
        }

        if (result.data?.error) {
          if (result.data.error === "PRIVATE_ACCOUNT") {
            throw new Error("PRIVATE_ACCOUNT");
          }
          throw new Error(result.data.error);
        }

        console.log("[useAiAnalysis] ✅ AI response received, type:", result.data?.attractedType?.name);

        // Step 3a: DB update — success
        const resultType = result.data?.attractedType?.name || "unknown";
        if (submissionId) {
          try {
            trackSubmissionSuccess(submissionId, resultType);
            console.log("[useAiAnalysis] ✅ DB update to success sent");
          } catch (updateErr) {
            console.error("[useAiAnalysis] ❌ DB update to success failed:", updateErr);
          }
        }

        cache.set(userId, result.data);
        setData(result.data);
        console.log("[useAiAnalysis] ✅ Analysis complete, navigating to result");
      } catch (e) {
        clearTimeout(timeoutId!);
        if (!cancelled) {
          const errorMsg = e instanceof Error ? e.message : "알 수 없는 오류가 발생했어요";
          console.error("[useAiAnalysis] ❌ Analysis FAILED:", errorMsg);

          // Step 3b: DB update — failed
          if (submissionId) {
            try {
              trackSubmissionFailed(submissionId);
              console.log("[useAiAnalysis] ✅ DB update to failed sent");
            } catch (updateErr) {
              console.error("[useAiAnalysis] ❌ DB update to failed failed:", updateErr);
            }
          }

          setError(errorMsg);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId!);
    };
  }, [userId]);

  return { data, loading, error };
}
