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
    ? parseFloat(((avgLikes + avgComments) / profile.followersCount * 100).toFixed(1))
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
    let analysis: any = null;

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

      analysis = await externalRes.json();
    } catch (extErr) {
      console.error("External API fetch error:", extErr);
      return new Response(
        JSON.stringify({ error: "분석 중 문제가 발생했어요. 잠시 후 다시 시도해주세요." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return both analysis and real Instagram data
    return new Response(JSON.stringify({
      ...analysis,
      instagramData: {
        profile: instagramData.profile,
        stats: instagramData.stats,
        posts: instagramData.posts.slice(0, 6),
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("analyze-profile error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
