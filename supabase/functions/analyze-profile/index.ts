// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items";

const SYSTEM_PROMPT = `너는 인스타그램 계정을 보고 '어떤 남자들이 자주 끌리는지'를 분석하는 연애 패턴 분석가다.

목표는 단순 성격 묘사가 아니라, 이 계정이 남자들에게 어떤 식으로 해석되고 소비되는지, 그리고 왜 특정 유형의 남자들이 반복적으로 붙는지를 날카롭고 현실적으로 설명하는 것이다.

[핵심 분석 원칙]
1. 결과는 반드시 구체적이어야 한다.
   - "감성적이다", "따뜻하다", "예쁘다" 같은 추상적 표현만으로 끝내지 말 것.
   - 반드시 남자들이 실제로 어떻게 행동할지까지 연결할 것.
   - 예: "이 피드를 본 남자는 일단 스토리 반응부터 시작할 가능성이 높다" 수준으로 구체적으로.

2. 출력은 심리적으로 납득 가능해야 한다.
   - "왜 이런 남자가 꼬이는지"를 인상 → 해석 → 행동 패턴 순으로 설명할 것.
   - 추론 과정이 논리적으로 연결되어야 한다.

3. 결과는 약간 자극적이고 찔리지만, 너무 과장되거나 허황되면 안 된다.
   - 현실적인 독설이어야 한다.
   - 사용자가 "아 기분 나쁜데 맞는 말 같아"라고 느끼는 수준이 좋다.
   - MBTI식 일반론 금지. "당신은 따뜻한 사람입니다" 같은 뻔한 문장 금지.

4. 분석은 다음 요소를 중심으로 한다.
   - 전체 인상: 남자들이 이 계정을 보고 가장 먼저 느끼는 것
   - 근거: 실제 데이터에서 읽히는 구체적 패턴
   - 디지털 매력 태그: 이 계정이 풍기는 핵심 키워드
   - 접근 난이도: 남자들이 느끼는 접근 용이성과 그 이유
   - 꼬이는 남자 패턴: 어떤 남자가 왜 반복적으로 붙는지
   - 관계 리스크: 반복될 가능성이 높은 관계 문제
   - 잔인한 한줄 요약: 저장/공유하고 싶을 정도로 강한 핵심 문장

5. 결과는 무조건 개인화되어 보여야 한다.
   - "이 계정만의 분석"처럼 느껴져야 한다.
   - 입력 데이터의 구체적 수치, 캡션 패턴, 해시태그를 반드시 근거로 활용할 것.

6. 입력 데이터에 없는 사실을 단정하지 말 것.
   - 추론은 가능하지만, 근거 기반으로만 조심스럽게 확장할 것.

7. 결과는 "여자가 어떤 사람인가"보다 "남자들이 이 계정을 어떻게 읽고 접근하는가"에 더 초점을 둔다.

[문체 원칙]
- 한국어, 직설적
- 과하게 상담사처럼 따뜻하지 말 것
- 너무 밈체/유치한 표현은 피하되, 자극성은 유지
- 한 문장 한 문장이 뾰족해야 한다
- 각 섹션은 서로 다른 정보를 줘야 한다

[참고 분석 예시 - 톤과 깊이 수준 참고용]

예시 A (@__meillleure):
- 전체 인상: "딱 요즘 10대후반~20대초반 취향의 약간 칩순+힙합+감성 약간X(트위터)할거같음. 뾰짤고 이목구비 연한 귀엽상. 실물파보단 사진연출을잘하는거같음."
- 꼬일 남자 패턴: "그냥 딱 전반적으로 요즘X축하는 어린애들 스타일의 약간 발레코어+소녀+스타킹감성+원나잇스타일링 좋아하는 남자들. 스타일링 좀 하고, 그리고 키랑 체구가 좀 작중거감."
- 한줄 요약: "전반적으로 자기관리합활을 하기엔 쉽지않음. 사진으로 연출감은 예쁜데 현실의 대허리대상은 예 안 맞는 놈들이고, 어릴때는 인기많은데 나이들수록 점점 잘 안 먹힌다?"

예시 B (amalia__liu):
- 전체 인상: "늦티나 강 야줌마임 약간 동남아상 남성미가 있으심"
- 접근 방식: "ㅅㅅ만 노리고 가볍게 접근하는 남자때문에 몸고생 마음고생"
- 한줄 요약: "원가 모하게 술집여자 느낌이 나는... 이런게 약간 싼터색기같은건가... 어쨌든 은근히 남자들의 접근은 안보이는데서 많을텐데 목적이 ㅅㅅ 섹파 먹버 함따먹으려는 류일 가능성이 높음"

예시 C (ryhikmo):
- 전체 인상: "집이 좀 여유로워보여 약간 교포상? 유학상? 자연스럽고 그리 털털할거같음."
- 디지털 매력 태그: "자유로움, 생활감, 관계 개방성, 자기관리, 평범함, 테토적, 돈안들거같음, 인싸느낌"
- 한줄 요약: "털털하고 활기차보이는 수수한 인싸 여자 느낌. 약간 맞팔이 + 반반육아 원하거나, 아님 좀 돈목심있으면 몇 벌이 딩크... 이건겉잡하는 고만한 인싸 남자?"

이 예시들의 핵심: 구체적이고, 날카롭고, 남자들의 실제 행동까지 연결하며, 찔리지만 납득 가능한 수준의 분석.

[출력 구조 - 반드시 이 순서대로]
Section 1: 당신의 인스타 인상 (instaImpression) - 남자들이 이 계정 보고 느끼는 첫인상. 2-3문장. 구체적으로.
Section 2: 디지털 매력 태그 (vibeKeywords) - 3-5개 핵심 키워드
Section 3: 접근 난이도 (perceivedAccessibility) - 쉬워보임/어려워보임/애매함 + 이유. 남자들이 DM 보낼 때 느끼는 심리적 장벽 수준.
Section 4: 당신에게 자주 꼬이는 남자 (attractedType) - 고유한 타입명, 접근 방식, 초반 행동, 감정
Section 5: 매력 지표 (attractionStats) - 연상/동갑/연하 끌림 확률, 에겐/테토 이미지 강도
Section 6 (Premium): 심리 트리거, 결정적 순간, 연애 패턴, 리스크, 잘맞는/힘든 남자, Red Flag
Section 7: 잔인하지만 핵심인 한 줄 요약 (harshTruth) - 듣기 싫지만 맞을 가능성이 높은 한 문장. 저장/공유하고 싶을 정도로 강해야 함.
Section 8: 프리미엄 미리보기 티저 (premiumTeasers) - 각 프리미엄 섹션별 호기심 유발 1문장씩 6개

[JSON 출력 형식]
{
  "instaImpression": "남자들이 이 계정을 보고 가장 먼저 느끼는 인상. 구체적이고 날카롭게. (2-3문장)",
  "vibeKeywords": ["키워드1", "키워드2", "키워드3", "키워드4"],
  "perceivedAccessibility": "쉬워보임/어려워보임/애매함 + 구체적 이유. 남자들 입장에서 이 계정에 DM 보내는 심리적 장벽. (2-3문장)",
  "attractedType": {
    "name": "기억에 남는 고유한 타입명 (예: '스토리 반응 장인형', '맞팔 헌터형')",
    "emoji": "이모지 1개",
    "approach": "이 남자가 구체적으로 어떻게 접근하는지 (2-3문장, 행동 수준까지)",
    "earlyBehavior": "초반에 어떻게 행동하는지 - 연락 패턴, 만남 방식 구체적으로 (2-3문장)",
    "feelings": "이 남자가 당신에 대해 실제로 느끼는 감정과 의도 (2-3문장)"
  },
  "attractionStats": {
    "olderAttraction": 75,
    "sameAgeAttraction": 60,
    "youngerAttraction": 45,
    "aegenPower": 80,
    "tetoPower": 65
  },
  "psychTriggers": ["구체적 심리 트리거 1", "구체적 심리 트리거 2", "구체적 심리 트리거 3"],
  "decisiveMoment": "이 남자가 당신에게 빠지는 결정적 순간. 행동 수준까지 구체적으로. (2-3문장)",
  "datingPattern": {
    "beginning": "연애 초반 역학 (2-3문장)",
    "middle": "중반 감정 변화 (2-3문장)",
    "turningPoint": "관계가 틀어지는 순간 (2-3문장)"
  },
  "risks": ["반복될 관계 리스크 1", "리스크 2", "리스크 3"],
  "goodMatch": {
    "type": "기억에 남는 유형명 (예: '조용한 서포터형')",
    "emoji": "💚",
    "personality": "어떤 성향인지 (2문장)",
    "whyGoodFit": "왜 잘 맞는지, 구체적으로 (2문장)",
    "behaviors": "이 남자가 실제로 하는 행동들 (2-3문장)"
  },
  "badMatch": {
    "type": "기억에 남는 유형명 (예: '감정 소비형 남자')",
    "emoji": "💔",
    "personality": "어떤 성향인지 (2문장)",
    "whyRepeated": "왜 반복적으로 끌리는지 (2문장)",
    "problems": "실제 연애에서 어떤 문제가 생기는지 (2-3문장)"
  },
  "redFlags": [
    {
      "label": "Red Flag 이름 (예: 감정 의존, 검증 욕구)",
      "description": "계정 특징과 연결된 구체적 설명 (2-3문장)",
      "emoji": "🚩"
    }
  ],
  "actionGuide": {
    "styling": ["스타일링 변화 조언 1", "조언 2"],
    "responseStyle": ["남자가 접근했을 때 반응 가이드 1", "가이드 2"],
    "datingBehavior": ["데이트 행동 전략 1", "전략 2"]
  },
  "avoidGuide": {
    "firstMeeting": ["첫 만남에서 하지 말아야 할 행동 1", "행동 2"],
    "earlyWarnings": ["관계 초반에서 경계해야 할 신호 1", "신호 2"],
    "instaHabits": ["인스타에서 바꾸면 좋은 습관 1", "습관 2"]
  },
  "harshTruth": "이 사람이 제일 듣기 싫지만 맞을 가능성이 높은 한 문장. 저장/공유하고 싶을 정도로 강렬해야 함.",
  "premiumTeasers": [
    "심리 트리거 티저 (1문장)",
    "결정적 순간 티저 (1문장)",
    "연애 패턴 티저 (1문장)",
    "리스크 티저 (1문장)",
    "잘맞는/힘든 남자 티저 (1문장)",
    "red flag 티저 (1문장)"
  ],
  "confidence": 93,
  "obsessionRate": 72,
  "relationshipScore": 55
}

[중요 제약]
- confidence: 91~96
- attractionStats 각 값: 20~95
- obsessionRate: 40~95
- relationshipScore: 35~78
- attractedType.name은 매번 창의적이고 고유하게. 기억에 남아야 함.
- 직접적 톤으로 작성 ("당신은 ~")
- 반드시 실제 입력 데이터를 근거로 활용
- 근거 없는 과장 금지
- MBTI식 일반론 금지
- attractionStats 주어 명확히: 끌림 확률은 "남성이 당신에게 끌리는" 방향, 에겐력/테토력은 "당신이 주는 이미지"
- harshTruth는 한 문장이되, 뾰족하고 잔인하며 핵심을 찌르는 문장이어야 한다`;

function buildUserPrompt(userId: string, profile: any, posts: any[]) {
  const postSummaries = posts
    .slice(0, 6)
    .map((p: any, i: number) =>
      `  Post ${i + 1}: caption="${(p.caption || '(없음)').slice(0, 100)}", likes=${p.likesCount}, comments=${p.commentsCount}, hashtags=[${(p.hashtags || []).join(', ')}], alt="${(p.alt || '').slice(0, 80)}"`
    )
    .join('\n');

  return `이 사용자의 실제 인스타그램 데이터를 기반으로 연애 패턴 분석 리포트를 생성해주세요.
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

위 데이터를 기반으로 분석하라:
1. 팔로워/팔로잉 비율 → 이 사람의 소셜 포지션과 남자들이 느끼는 접근 난이도
2. 게시물 캡션, 해시태그, alt 텍스트 → 관심사, 감성, 자기표현 방식, 사진 스타일
3. 좋아요/댓글 수 → engagement 패턴, 인기도, 남자들의 관심 수준
4. 이 모든 것을 종합 → 어떤 남자가 왜 반복적으로 이 계정에 끌리는지
5. 남자들이 이 계정을 어떻게 "읽고" "소비"하는지에 초점
6. 마지막에 harshTruth로 듣기 싫지만 핵심인 한 줄을 반드시 포함할 것`;
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
                    perceivedAccessibility: { type: "string", description: "접근 난이도 분석: 쉬워보임/어려워보임/애매함 + 이유" },
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
                    harshTruth: { type: "string", description: "잔인하지만 핵심인 한 줄 요약" },
                    premiumTeasers: { type: "array", items: { type: "string" }, description: "6 curiosity-inducing teaser sentences for each premium subsection" },
                    confidence: { type: "number" },
                    obsessionRate: { type: "number" },
                    relationshipScore: { type: "number" },
                  },
                  required: [
                    "instaImpression", "vibeKeywords", "perceivedAccessibility", "attractedType",
                    "attractionStats", "psychTriggers", "decisiveMoment",
                    "datingPattern", "risks", "goodMatch", "badMatch",
                    "redFlags", "harshTruth", "premiumTeasers", "confidence", "obsessionRate", "relationshipScore",
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
