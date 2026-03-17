// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items";

const SYSTEM_PROMPT = `You are an expert in psychological attraction analysis based on Instagram profiles.
Your job is to analyze a user's REAL Instagram data and generate a highly specific, realistic, and slightly provocative report about what kind of men are naturally attracted to this person and why.

[VERY IMPORTANT RULES]
- You will receive REAL Instagram data including follower counts, post captions, hashtags, likes, and comments.
- Use this REAL data to ground your analysis. Reference specific patterns you see in the data.
- Do NOT generate generic personality descriptions.
- Every output MUST feel specific, slightly sharp, and psychologically convincing.
- Avoid safe, boring, or vague statements.
- The tone should feel like: "this is kind of scary accurate" / "why is this so accurate?"
- Dynamically create a UNIQUE male pattern per user. Never repeat the same pattern.
- Use concrete behavioral descriptions, not abstract words.

[SECTION ORDER - MUST FOLLOW EXACTLY]
The output MUST follow this exact section structure. Do NOT invent new sections. Do NOT reorder.

Section 1: 당신의 인스타 인상 (instaImpression)
- 2-3 sentences about the user's Instagram first impression based on real data.

Section 2: 당신에게 자주 꼬이는 남자 (attractedType)
- A unique, provocative type name, emoji, approach style, early behavior, and feelings.

Section 3 (Premium): Contains these subsections IN ORDER:
  3-1: 당신이 유발하는 심리 트리거 (psychTriggers) - 3 specific triggers
  3-2: 이 남자가 당신에게 빠지는 결정적 순간 (decisiveMoment) - 2-3 sentences
  3-3: 당신의 연애 패턴 (datingPattern) - beginning, middle, turningPoint each 2-3 sentences
  3-4: 관계에서 발생할 수 있는 리스크 (risks) - 3 risks
  3-5: 잘 맞는 남자 vs 자주 꼬이지만 힘든 남자 (goodMatch + badMatch) - each 2-3 sentences
  3-6: 절대 조심해야 할 red flag (redFlags) - 3 specific red flags

[OUTPUT - JSON FORMAT]
Return a valid JSON object with this exact structure. Write everything in Korean. Be vivid, sharp, provocative.

{
  "instaImpression": "당신의 인스타 첫인상 분석 (2-3문장)",
  "vibeKeywords": ["키워드1", "키워드2", "키워드3"],
  "attractedType": {
    "name": "고유하고 약간 도발적인 타입 이름",
    "emoji": "이모지 1개",
    "approach": "이 남자가 어떻게 접근하는지 (2-3문장)",
    "earlyBehavior": "초반에 어떻게 행동하는지 (2-3문장)",
    "feelings": "이 남자가 당신에 대해 느끼는 감정 (2-3문장)"
  },
  "attractionStats": {
    "olderAttraction": 75,   // 연상 남성이 당신에게 끌릴 확률
    "sameAgeAttraction": 60, // 동갑 남성이 당신에게 끌릴 확률
    "youngerAttraction": 45, // 연하 남성이 당신에게 끌릴 확률
    "aegenPower": 80,        // 당신이 주는 에겐(애기같은) 이미지 강도
    "tetoPower": 65          // 당신이 주는 테토(도도한) 이미지 강도
  },
  "psychTriggers": ["심리 트리거 1", "심리 트리거 2", "심리 트리거 3"],
  "decisiveMoment": "이 남자가 당신에게 빠지는 결정적 순간 (2-3문장)",
  "datingPattern": {
    "beginning": "연애 초반 (2-3문장)",
    "middle": "중반 감정 역학 (2-3문장)",
    "turningPoint": "관계가 변하는 순간 (2-3문장)"
  },
  "risks": ["리스크 1", "리스크 2", "리스크 3"],
  "goodMatch": "당신과 진짜 잘 맞는 남자 유형 설명 (2-3문장)",
  "badMatch": "자주 꼬이지만 결국 힘든 남자 유형 설명 (2-3문장)",
  "redFlags": ["red flag 1", "red flag 2", "red flag 3"],
  "confidence": 93,
  "obsessionRate": 72,
  "relationshipScore": 55
}

IMPORTANT:
- confidence must be between 91 and 96
- All stats must be between 20 and 95
- obsessionRate between 40 and 95
- relationshipScore between 35 and 78
- Make the attractedType name creative and unique every time
- Write in a direct tone ("당신은 ~")
- Reference the REAL data you receive
- Follow the section order EXACTLY as specified above`;

function buildUserPrompt(userId: string, profile: any, posts: any[]) {
  const postSummaries = posts
    .slice(0, 6)
    .map((p: any, i: number) =>
      `  Post ${i + 1}: caption="${(p.caption || '(없음)').slice(0, 100)}", likes=${p.likesCount}, comments=${p.commentsCount}, hashtags=[${(p.hashtags || []).join(', ')}], alt="${(p.alt || '').slice(0, 80)}"`
    )
    .join('\n');

  return `이 사용자의 실제 인스타그램 데이터를 기반으로 심리적 매력 분석 리포트를 생성해주세요.
반드시 아래 실제 데이터를 분석의 핵심 근거로 활용하세요. 랜덤 데이터를 생성하지 마세요.

[Input Data]
username: @${userId}
fullName: ${profile.fullName || '(비공개)'}
biography: ${profile.biography || '(없음)'}
followersCount: ${profile.followersCount}
followsCount: ${profile.followsCount}
postsCount: ${profile.postsCount}
highlightReelCount: ${profile.highlightReelCount || 0}
isBusinessAccount: ${profile.isBusinessAccount}
followerRatio: ${(profile.followersCount / Math.max(profile.followsCount, 1)).toFixed(2)}

[Recent Posts (${posts.length}개)]
${postSummaries}

위 데이터를 기반으로:
- 팔로워/팔로잉 비율에서 이 사람의 소셜 포지션을 읽어내세요
- 게시물 캡션과 해시태그에서 이 사람의 관심사, 감성, 자기표현 방식을 분석하세요
- 좋아요/댓글 수에서 engagement 패턴과 인기도를 파악하세요
- 이 모든 것을 종합하여 어떤 남자가 이 사람에게 끌리는지 분석하세요`;
}

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

  // Compute derived stats
  const totalLikes = posts.reduce((s: number, p: any) => s + p.likesCount, 0);
  const totalComments = posts.reduce((s: number, p: any) => s + p.commentsCount, 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
  const engagementRate = profile.followersCount > 0
    ? parseFloat(((avgLikes + avgComments) / profile.followersCount * 100).toFixed(1))
    : 0;

  // Extract top hashtags
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

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ error: "LOVABLE_API_KEY is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) {
      return new Response(
        JSON.stringify({ error: "APIFY_TOKEN is not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch real Instagram data dynamically via Apify actor
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

    const userPrompt = buildUserPrompt(userId, instagramData.profile, instagramData.posts);

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          tools: [
            {
              type: "function",
              function: {
                name: "generate_analysis",
                description: "Generate Instagram attraction analysis report",
                parameters: {
                  type: "object",
                  properties: {
                    instaImpression: { type: "string" },
                    vibeKeywords: { type: "array", items: { type: "string" } },
                    attractedType: {
                      type: "object",
                      properties: {
                        name: { type: "string" },
                        emoji: { type: "string" },
                        approach: { type: "string" },
                        earlyBehavior: { type: "string" },
                        feelings: { type: "string" },
                      },
                      required: ["name", "emoji", "approach", "earlyBehavior", "feelings"],
                    },
                    attractionStats: {
                      type: "object",
                      properties: {
                        olderAttraction: { type: "number" },
                        sameAgeAttraction: { type: "number" },
                        youngerAttraction: { type: "number" },
                        aegenPower: { type: "number" },
                        tetoPower: { type: "number" },
                      },
                      required: ["olderAttraction", "sameAgeAttraction", "youngerAttraction", "aegenPower", "tetoPower"],
                    },
                    psychTriggers: { type: "array", items: { type: "string" } },
                    decisiveMoment: { type: "string" },
                    datingPattern: {
                      type: "object",
                      properties: {
                        beginning: { type: "string" },
                        middle: { type: "string" },
                        turningPoint: { type: "string" },
                      },
                      required: ["beginning", "middle", "turningPoint"],
                    },
                    risks: { type: "array", items: { type: "string" } },
                    goodMatch: { type: "string" },
                    badMatch: { type: "string" },
                    redFlags: { type: "array", items: { type: "string" } },
                    confidence: { type: "number" },
                    obsessionRate: { type: "number" },
                    relationshipScore: { type: "number" },
                  },
                  required: [
                    "instaImpression", "vibeKeywords", "attractedType",
                    "attractionStats", "psychTriggers", "decisiveMoment",
                    "datingPattern", "risks", "goodMatch", "badMatch",
                    "redFlags", "confidence", "obsessionRate", "relationshipScore",
                  ],
                },
              },
            },
          ],
          tool_choice: { type: "function", function: { name: "generate_analysis" } },
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Credits exhausted." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errText = await response.text();
      console.error("AI gateway error:", response.status, errText);
      return new Response(
        JSON.stringify({ error: "AI analysis failed" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];

    if (!toolCall) {
      console.error("No tool call in response:", JSON.stringify(data));
      return new Response(
        JSON.stringify({ error: "AI did not return structured data" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const analysis = JSON.parse(toolCall.function.arguments);

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
