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
  psychTriggers: string[];
  attractedType: {
    name: string;
    emoji: string;
    approach: string;
    earlyBehavior: string;
    feelings: string;
  };
  datingPattern: {
    beginning: string;
    middle: string;
    turningPoint: string;
  };
  risks: string[];
  premiumPreview: {
    decisiveMoment: string;
    breakPoint: string;
    perfectMatch: string;
    avoidType: string;
  };
  confidence: number;
  vibeKeywords: string[];
  attractionStats: {
    olderAttraction: number;
    sameAgeAttraction: number;
    youngerAttraction: number;
    aegenPower: number;
    tetoPower: number;
  };
  obsessionRate: number;
  relationshipScore: number;
  instagramData: InstagramData;
}

// Simple in-memory cache
const cache = new Map<string, AiAnalysis>();

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

    async function fetchAnalysis() {
      setLoading(true);
      setError(null);

      try {
        const { data: result, error: fnError } = await supabase.functions.invoke(
          "analyze-profile",
          { body: { userId } }
        );

        if (cancelled) return;

        if (fnError) {
          throw new Error(fnError.message || "Analysis failed");
        }

        if (result?.error) {
          throw new Error(result.error);
        }

        cache.set(userId, result);
        setData(result);
      } catch (e) {
        if (!cancelled) {
          setError(e instanceof Error ? e.message : "Unknown error");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchAnalysis();
    return () => { cancelled = true; };
  }, [userId]);

  return { data, loading, error };
}
