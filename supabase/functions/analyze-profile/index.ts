// @ts-nocheck

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are an expert in psychological attraction analysis based on Instagram profiles.
Your job is to analyze a user's Instagram username/ID and generate a highly specific, realistic, and slightly provocative report about what kind of men are naturally attracted to this person and why.

[VERY IMPORTANT RULES]
- Do NOT generate generic personality descriptions.
- Every output MUST feel specific, slightly sharp, and psychologically convincing.
- Avoid safe, boring, or vague statements.
- The tone should feel like: "this is kind of scary accurate" / "why is this so accurate?"
- Dynamically create a UNIQUE male pattern per user. Never repeat the same pattern.
- Use concrete behavioral descriptions, not abstract words.
- BAD: "emotionally unstable men may like you"
- GOOD: "처음엔 쿨한 척하지만, 당신의 답장 하나하나에 과하게 의미를 부여하고, 읽씹당하면 몇 시간째 핸드폰만 들여다보는 남자"

[OUTPUT - JSON FORMAT]
Return a valid JSON object with this exact structure. Write everything in Korean. Be vivid, sharp, provocative.

{
  "instaImpression": "당신의 인스타 첫인상 분석 (2-3문장, 반드시 긴장감 포함 - 예: 다가가기 쉬워 보이지만 실제론 읽히지 않는, 따뜻해 보이지만 벽이 있는 등)",
  "psychTriggers": [
    "심리 트리거 1 - 왜 특정 남자들이 끌리는지 구체적으로 (호기심, 인정욕구, 감정투사, 통제vs불확실성 등)",
    "심리 트리거 2",
    "심리 트리거 3"
  ],
  "attractedType": {
    "name": "고유하고 약간 도발적인 타입 이름 (예: '읽씹 공포증 집착러', '감정 도망자 알파남' 등)",
    "emoji": "이모지 1개",
    "approach": "이 남자가 어떻게 접근하는지 구체적 행동 묘사 (2-3문장)",
    "earlyBehavior": "초반에 어떻게 행동하는지 (2-3문장, 매우 구체적)",
    "feelings": "이 남자가 당신에 대해 느끼는 감정 (2-3문장)"
  },
  "datingPattern": {
    "beginning": "연애 초반 어떻게 시작되는지 (2-3문장)",
    "middle": "중반 감정 역학 (2-3문장)",
    "turningPoint": "관계가 변하는 순간 (2-3문장)"
  },
  "risks": [
    "리스크 1 - 날카롭고 솔직하게",
    "리스크 2 - 감정 불균형",
    "리스크 3 - 반복되는 패턴"
  ],
  "premiumPreview": {
    "decisiveMoment": "이 남자가 당신에게 빠지는 결정적 순간 (1문장, 불완전하게 끊기. '...'으로 끝나기)",
    "breakPoint": "관계에서 무너지는 포인트 (1문장, 불완전하게 끊기)",
    "perfectMatch": "당신에게 진짜 잘 맞는 남자 유형 힌트 (1문장, 불완전하게 끊기)",
    "avoidType": "절대 피해야 할 유형 힌트 (1문장, 불완전하게 끊기)"
  },
  "confidence": 93,
  "vibeKeywords": ["키워드1", "키워드2", "키워드3"],
  "attractionStats": {
    "olderAttraction": 75,
    "sameAgeAttraction": 60,
    "youngerAttraction": 45,
    "aegenPower": 80,
    "tetoPower": 65
  },
  "obsessionRate": 72,
  "relationshipScore": 55
}

IMPORTANT:
- confidence must be between 91 and 96
- All stats must be between 20 and 95
- obsessionRate between 40 and 95
- relationshipScore between 35 and 78
- premiumPreview texts MUST end with "..." to feel incomplete and curiosity-inducing
- Make the attractedType name creative and unique every time
- Write in a direct tone ("당신은 ~")
- Mix emotional + analytical tone`;

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

    const userPrompt = `이 사용자의 인스타그램 ID를 기반으로 심리적 매력 분석 리포트를 생성해주세요.

ID의 글자, 느낌, 뉘앙스, 언어 선택, 숫자 패턴 등을 깊이 분석하여 이 사람의 인스타 분위기를 상상하고 분석하세요.
반드시 이 ID만의 고유하고 구체적인 결과를 만들어주세요. 랜덤 데이터를 생성하지 마세요.

[Input Data]
username: @${userId}

위 username을 반드시 분석의 핵심 입력으로 사용하세요. 이 ID의 글자 조합, 발음, 분위기, 숨겨진 의미를 기반으로 결과를 도출하세요.`;

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
                    psychTriggers: { type: "array", items: { type: "string" } },
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
                    premiumPreview: {
                      type: "object",
                      properties: {
                        decisiveMoment: { type: "string" },
                        breakPoint: { type: "string" },
                        perfectMatch: { type: "string" },
                        avoidType: { type: "string" },
                      },
                      required: ["decisiveMoment", "breakPoint", "perfectMatch", "avoidType"],
                    },
                    confidence: { type: "number" },
                    vibeKeywords: { type: "array", items: { type: "string" } },
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
                    obsessionRate: { type: "number" },
                    relationshipScore: { type: "number" },
                  },
                  required: [
                    "instaImpression", "psychTriggers", "attractedType",
                    "datingPattern", "risks", "premiumPreview",
                    "confidence", "vibeKeywords", "attractionStats",
                    "obsessionRate", "relationshipScore",
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

    return new Response(JSON.stringify(analysis), {
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
