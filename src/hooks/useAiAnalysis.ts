import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  goodMatch: string;
  badMatch: string;
  redFlags: string[];
  premiumTeasers: string[];
  confidence: number;
  obsessionRate: number;
  relationshipScore: number;
  instagramData: InstagramData;
}

// Simple in-memory cache
const cache = new Map<string, AiAnalysis>();

const TIMEOUT_MS = 90_000; // 90 seconds

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

      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        timeoutId = setTimeout(() => {
          reject(new Error("분석 시간이 초과되었어요. 다시 시도해주세요."));
        }, TIMEOUT_MS);
      });

      try {
        const result = await Promise.race([
          supabase.functions.invoke("analyze-profile", { body: { userId } }),
          timeoutPromise,
        ]);

        clearTimeout(timeoutId!);

        if (cancelled) return;

        if (result.error) {
          throw new Error(result.error.message || "Analysis failed");
        }

        if (result.data?.error) {
          throw new Error(result.data.error);
        }

        cache.set(userId, result.data);
        setData(result.data);
      } catch (e) {
        clearTimeout(timeoutId!);
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "알 수 없는 오류가 발생했어요");
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
