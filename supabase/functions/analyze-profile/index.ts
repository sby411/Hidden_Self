// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items";

function extractInstagramData(rawData: any[]) {
  if (!rawData || rawData.length === 0) return null;

  const firstItem = rawData[0];

  const profile = {
    fullName: firstItem.fullName || firstItem.ownerFullName || "",
    biography: firstItem.biography || firstItem.metaData?.biography || "",
    followersCount: firstItem.followersCount || firstItem.metaData?.followersCount || 0,
    followsCount: firstItem.followsCount || firstItem.metaData?.followsCount || 0,
    postsCount: firstItem.metaData?.postsCount || firstItem.postsCount || rawData.length,
    highlightReelCount: firstItem.highlightReelCount || firstItem.metaData?.highlightReelCount || 0,
    isBusinessAccount: firstItem.isBusinessAccount || firstItem.metaData?.isBusinessAccount || false,
    profilePicUrl: firstItem.profilePicUrl || firstItem.metaData?.profilePicUrl || "",
  };

  const posts = rawData.map((item: any) => ({
    caption: item.caption || "",
    likesCount: item.likesCount || 0,
    commentsCount: item.commentsCount || 0,
    hashtags: item.hashtags || [],
    alt: item.alt || "",
    timestamp: item.timestamp || "",
    type: item.type || "Image",
  }));

  const totalLikes = posts.reduce((s: number, p: any) => s + p.likesCount, 0);
  const totalComments = posts.reduce((s: number, p: any) => s + p.commentsCount, 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
  const engagementRate = profile.followersCount > 0
    ? parseFloat((((avgLikes + avgComments) / profile.followersCount) * 100).toFixed(1))
    : 0;

  const hashtagCounts: Record<string, number> = {};
  posts.forEach((p: any) => {
    (p.hashtags || []).forEach((h: string) => {
      hashtagCounts[h] = (hashtagCounts[h] || 0) + 1;
    });
  });
  const topHashtags = Object.entries(hashtagCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([tag]) => tag);

  return {
    profile,
    posts,
    stats: {
      avgLikes,
      avgComments,
      engagementRate,
      totalLikes,
      totalComments,
      topHashtags,
    },
  };
}

function toStringArray(value: any): string[] {
  if (Array.isArray(value)) {
    return value.filter((v) => v !== null && v !== undefined && String(v).trim() !== "").map((v) => String(v));
  }
  if (typeof value === "string" && value.trim() !== "") {
    return [value.trim()];
  }
  return [];
}

function normalizeAnalysisResponse(externalPayload: any) {
  const source = externalPayload?.result ?? externalPayload ?? {};

  // If external API already returns the legacy UI contract, pass through.
  if (source?.instaImpression && source?.attractedType) {
    return source;
  }

  const vibe = source?.vibeAnalysis ?? {};
  const attractedMen = source?.attractedMen ?? {};
  const metrics = source?.metrics ?? {};
  const premium = source?.premium ?? {};

  const redFlagTexts = toStringArray(premium?.redFlag);
  const redFlags = redFlagTexts.map((text, index) => ({
    label: `주의 신호 ${index + 1}`,
    description: text,
    emoji: "🚩",
  }));

  const actionGuideBase = toStringArray(premium?.actionGuide);
  const avoidGuideBase = toStringArray(premium?.avoidGuide);

  const relationshipPatternText = typeof premium?.relationshipPattern === "string" ? premium.relationshipPattern : "";
  const riskText = typeof premium?.risk === "string" ? premium.risk : "";
  const goodVsBadText = typeof premium?.goodVsBadMen === "string" ? premium.goodVsBadMen : "";

  return {
    instaImpression: vibe?.firstImpression ?? "분석 결과를 불러왔어요.",
    vibeKeywords: toStringArray(vibe?.tags),
    perceivedAccessibility: vibe?.approachDifficulty ?? "분석 중",
    attractedType: {
      name: attractedMen?.archetype ?? "분석 결과",
      emoji: "💘",
      approach: attractedMen?.approachStyle ?? "분석 내용을 불러오는 중이에요.",
      earlyBehavior: attractedMen?.behaviorPattern ?? "분석 내용을 불러오는 중이에요.",
      feelings: attractedMen?.emotion ?? "분석 내용을 불러오는 중이에요.",
    },
    attractionStats: {
      olderAttraction: Number(metrics?.olderMen ?? 0),
      sameAgeAttraction: Number(metrics?.sameAgeMen ?? 0),
      youngerAttraction: Number(metrics?.youngerMen ?? 0),
      aegenPower: Number(metrics?.feminineImage ?? 0),
      tetoPower: Number(metrics?.tetoImage ?? 0),
    },
    psychTriggers: toStringArray(premium?.psychologicalTrigger),
    decisiveMoment: premium?.criticalMoment ?? "",
    datingPattern: {
      beginning: relationshipPatternText,
      middle: relationshipPatternText,
      turningPoint: riskText,
    },
    risks: toStringArray(premium?.risk),
    goodMatch: {
      type: "안정형",
      emoji: "💚",
      personality: goodVsBadText || "안정적이고 일관된 패턴의 유형",
      whyGoodFit: goodVsBadText || "관계에서 예측 가능한 안정감을 제공",
      behaviors: actionGuideBase[0] ?? "초반부터 일관된 반응을 보이는 유형",
    },
    badMatch: {
      type: "해석놀이형",
      emoji: "💔",
      personality: goodVsBadText || "감정보다 반응 확인을 우선하는 유형",
      whyRepeated: vibe?.firstImpression || "첫인상에서 거리감과 호기심을 동시에 자극",
      problems: riskText || "감정 소모가 반복될 가능성이 높음",
    },
    redFlags,
    actionGuide: {
      styling: actionGuideBase,
      responseStyle: actionGuideBase,
      datingBehavior: actionGuideBase,
    },
    avoidGuide: {
      firstMeeting: avoidGuideBase,
      earlyWarnings: avoidGuideBase,
      instaHabits: avoidGuideBase,
    },
    harshTruth: riskText || vibe?.firstImpression || "표현보다 반응을 끌어내는 인상이 강해요.",
    premiumTeasers: [
      premium?.psychologicalTrigger,
      premium?.criticalMoment,
      premium?.relationshipPattern,
      premium?.risk,
      premium?.goodVsBadMen,
      redFlagTexts[0],
      actionGuideBase[0],
      avoidGuideBase[0],
    ].map((v) => (typeof v === "string" && v.trim() !== "" ? v : "이 섹션에는 당신만을 위한 심층 분석이 포함되어 있습니다.")),
    confidence: 92,
    obsessionRate: 68,
    relationshipScore: 55,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { userId } = await req.json();

    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) {
      return new Response(
        JSON.stringify({ error: "APIFY_TOKEN is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch real Instagram data via Apify
    console.log("Calling Apify actor for:", userId);
    let instagramData: any = null;

    try {
      const apifyRes = await fetch(`${APIFY_ACTOR_URL}?token=${APIFY_TOKEN}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          directUrls: [`https://www.instagram.com/${userId}/`],
          resultsType: "posts",
          resultsLimit: 6,
          addParentData: true,
        }),
      });

      if (!apifyRes.ok) {
        const errText = await apifyRes.text();
        console.error("Apify API error:", apifyRes.status, errText);
        return new Response(
          JSON.stringify({ error: "계정 데이터를 가져오지 못했어요. 아이디를 다시 확인해주세요." }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const rawData = await apifyRes.json();
      instagramData = extractInstagramData(rawData);

      if (!instagramData) {
        return new Response(
          JSON.stringify({ error: "계정 데이터를 가져오지 못했어요. 아이디를 다시 확인해주세요." }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    } catch (apifyErr) {
      console.error("Apify fetch error:", apifyErr);
      return new Response(
        JSON.stringify({ error: "계정 데이터를 가져오지 못했어요. 아이디를 다시 확인해주세요." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call external analysis API
    console.log("Calling external analysis API for:", userId);
    let externalAnalysis: any = null;

    try {
      const externalRes = await fetch("http://115.68.231.202:3000/analyze-instagram", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ instagramId: userId }),
      });

      if (!externalRes.ok) {
        const errText = await externalRes.text();
        console.error("External API error:", externalRes.status, errText);
        return new Response(
          JSON.stringify({ error: "분석 중 문제가 발생했어요. 잠시 후 다시 시도해주세요." }),
          { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      externalAnalysis = await externalRes.json();
    } catch (extErr) {
      console.error("External API fetch error:", extErr);
      return new Response(
        JSON.stringify({ error: "분석 중 문제가 발생했어요. 잠시 후 다시 시도해주세요." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const normalizedAnalysis = normalizeAnalysisResponse(externalAnalysis);

    // Return normalized analysis (legacy UI contract) + Apify data
    return new Response(
      JSON.stringify({
        ...normalizedAnalysis,
        instagramData: {
          profile: instagramData.profile,
          stats: instagramData.stats,
          posts: instagramData.posts.slice(0, 6),
        },
      }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("analyze-profile error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
