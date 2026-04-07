// @ts-nocheck
/**
 * 재회용 인스타 스크랩 (단일 계정) + 페어 모드(양 계정 스크랩 후 Claude 인물 분석, 72h DB 캐시).
 * attraction analyze-profile 은 수정 금지 — Apify 요청 형식만 동일하게 유지.
 */

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const APIFY_ACTOR_URL =
  "https://api.apify.com/v2/acts/apify~instagram-scraper/run-sync-get-dataset-items";

const CLAUDE_MODEL = Deno.env.get("REUNION_CLAUDE_MODEL") ?? "claude-haiku-4-5-20251001";
const CACHE_TTL_MS = 72 * 60 * 60 * 1000;

/** PostgREST: 값에 `.` `:` `T` 등이 있으면 파서가 깨짐 → 반드시 큰따옴표로 감싼 뒤 쿼리스트링에 넣음 */
function pgQuoted(op: string, value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '""');
  return `${op}."${escaped}"`;
}

function supabaseRestBase(supabaseUrl: string): string {
  return supabaseUrl.replace(/\/+$/, "");
}

function extractMentions(caption: string): string[] {
  if (!caption) return [];
  const m = caption.match(/@[\w.]+/g);
  return m ? [...new Set(m.map((x) => x.slice(1)))] : [];
}

function extractInstagramProfileReunion(username: string, rawData: any[]) {
  if (!rawData || rawData.length === 0) return null;

  const firstItem = rawData[0];
  const meta = firstItem.metaData || {};

  const isPrivate =
    firstItem.isPrivate === true ||
    meta.isPrivate === true ||
    firstItem.private === true;

  const profile = {
    username: username.replace(/^@/, ""),
    fullName: firstItem.fullName || firstItem.ownerFullName || meta.fullName || "",
    biography: firstItem.biography || meta.biography || "",
    externalUrl: firstItem.externalUrl || meta.externalUrl || "",
    isPrivate: Boolean(isPrivate),
    followersCount: Number(firstItem.followersCount ?? meta.followersCount ?? 0),
    followsCount: Number(firstItem.followsCount ?? meta.followsCount ?? 0),
    postsCount: Number(meta.postsCount ?? firstItem.postsCount ?? rawData.length),
    highlightReelCount: Number(firstItem.highlightReelCount ?? meta.highlightReelCount ?? 0),
    highlightTitles: [] as string[],
    profilePicUrl: firstItem.profilePicUrl || meta.profilePicUrl || "",
  };

  const posts = rawData.map((item: any) => ({
    timestamp: item.timestamp || "",
    caption: item.caption || "",
    hashtags: Array.isArray(item.hashtags) ? item.hashtags : [],
    mentions: extractMentions(item.caption || ""),
    mediaType: item.type || "Image",
    likeCount: Number(item.likesCount ?? 0),
    commentCount: Number(item.commentsCount ?? 0),
    locationName: item.locationName || item.location?.name || "",
    imageUrls: [item.displayUrl, item.thumbnailUrl].filter(Boolean),
    alt: item.alt || "",
  }));

  const totalLikes = posts.reduce((s: number, p: any) => s + p.likeCount, 0);
  const totalComments = posts.reduce((s: number, p: any) => s + p.commentCount, 0);
  const avgLikes = posts.length > 0 ? Math.round(totalLikes / posts.length) : 0;
  const avgComments = posts.length > 0 ? Math.round(totalComments / posts.length) : 0;
  const engagementRate =
    profile.followersCount > 0
      ? parseFloat((((avgLikes + avgComments) / profile.followersCount) * 100).toFixed(2))
      : 0;

  return {
    profile,
    posts,
    stats: {
      avgLikes,
      avgComments,
      engagementRate,
      totalLikes,
      totalComments,
      postCountReturned: posts.length,
    },
  };
}

async function runApifyScrape(userId: string, token: string, resultsLimit: number) {
  const apifyRes = await fetch(`${APIFY_ACTOR_URL}?token=${token}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      directUrls: [`https://www.instagram.com/${userId}/`],
      resultsType: "posts",
      resultsLimit,
      addParentData: true,
    }),
  });

  if (!apifyRes.ok) {
    const errText = await apifyRes.text();
    console.error("Apify reunion error:", apifyRes.status, errText);
    return { kind: "error" as const, message: "SCRAPER_FAILED" };
  }

  const rawData = await apifyRes.json();
  const extracted = extractInstagramProfileReunion(userId, rawData);
  if (!extracted) {
    return { kind: "error" as const, message: "EMPTY_RESULT" };
  }
  if (extracted.profile.isPrivate) {
    return { kind: "private" as const, data: extracted };
  }
  return { kind: "ok" as const, data: extracted };
}

function compactBundleForPrompt(bundle: any, maxPosts: number) {
  const p = bundle.profile;
  const posts = (bundle.posts || []).slice(0, maxPosts).map((x: any) => ({
    t: x.timestamp,
    caption: String(x.caption || "").slice(0, 280),
    hashtags: (x.hashtags || []).slice(0, 12),
    likes: x.likeCount,
    comments: x.commentCount,
    loc: x.locationName || "",
  }));
  return {
    username: p.username,
    fullName: p.fullName,
    biography: String(p.biography || "").slice(0, 600),
    followersCount: p.followersCount,
    followsCount: p.followsCount,
    postsCountMeta: p.postsCount,
    isPrivate: p.isPrivate,
    stats: bundle.stats,
    recentPosts: posts,
  };
}

const REUNION_AI_SYSTEM = `You analyze public Instagram profile data for a "reunion / post-breakup contact" product.
Output ONLY a single JSON object, no markdown fences, no extra text.
Schema:
{
  "persona": string (Korean, 15-30자. 이 사람의 인스타 페르소나를 팩폭 한 줄로 정의. ~타입/~형 같은 추상어 절대 금지. 반드시 해당 계정의 실제 데이터(팔로워 수, 게시물 주제, 캡션 스타일, 활동 빈도, 키워드)를 직접 반영해야 함. 일반적인 심리 묘사 금지. 반드시 그 계정에서만 나올 수 있는 구체적인 행동이나 콘텐츠를 담아야 함. 예: 팔로워 17만에 뷰티 콘텐츠면 → "SNS 팔로워는 17만인데 전 남친 스토리는 혼자 몰래 보는 사람", 필름카메라 취미면 → "필름카메라로 감성 챙기면서 연락은 디지털처럼 차갑게 끊는 사람". 절대 다른 계정과 같은 문장이 나오면 안 됨),
  "impression": string (Korean, 2-3 sentences, concrete, grounded in the data),
  "keywords": string[] (3-5 short Korean keyword phrases),
  "approach": string (Korean: in reunion context — recommended tone, how to open contact, what to avoid; practical),
  "psychState": string (Korean: how the account reads emotionally right now; use cautious phrasing like "~로 읽힐 수 있다", no medical diagnosis)
}
Rules:
- Do NOT infer gender from names, usernames, or photos. Use neutral wording: "이 사람", "계정", "상대".
- Do not state private facts; only patterns visible from the given text/numbers.
- If data is sparse or the account is private/partial, say so briefly and lower confidence in wording.
- 말투: 자연스러운 한국어 문장으로 써줘. 단문 끊어치기 금지. "~다. ~다. ~다." 반복 금지. 친구가 솔직하게 조언해주는 톤으로. 문장은 적절히 이어서 쓰고, 읽었을 때 자연스럽게 흘러야 한다.`;

async function callClaudeAnalysis(
  apiKey: string,
  bundle: any,
  role: "me" | "them",
  peerUsername: string,
  dataLimited: boolean,
): Promise<Record<string, unknown> | null> {
  const payload = compactBundleForPrompt(bundle, 20);
  const roleLine =
    role === "me"
      ? "This is the USER's own account (the person running the report)."
      : `This is the OTHER person's account (@${peerUsername} is the user viewing the report).`;

  const userBlock = `${roleLine}
Data quality note: ${dataLimited ? "LIMITED — private or few posts; be conservative." : "Public posts available."}
INPUT_JSON:
${JSON.stringify(payload)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1200,
      system: REUNION_AI_SYSTEM,
      messages: [{ role: "user", content: userBlock }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Claude API error:", res.status, t);
    return null;
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;

  let parsed: Record<string, unknown>;
  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    parsed = JSON.parse(trimmed);
  } catch {
    console.error("Claude JSON parse failed:", text.slice(0, 200));
    return null;
  }

  const persona = typeof parsed.persona === "string" ? parsed.persona : "";
  const impression = typeof parsed.impression === "string" ? parsed.impression : "";
  const keywords = Array.isArray(parsed.keywords) ? parsed.keywords.filter((x) => typeof x === "string") : [];
  const approach = typeof parsed.approach === "string" ? parsed.approach : "";
  const psychState = typeof parsed.psychState === "string" ? parsed.psychState : "";
  if (!impression || keywords.length === 0) return null;

  return {
    persona: persona.trim() || "",
    impression,
    keywords: keywords.slice(0, 8),
    approach: approach || "데이터가 부족해 접근 방식을 구체화하기 어렵다. 짧고 부담 없는 톤부터 시도하는 편이 상대적으로 안전할 수 있다.",
    psychState: psychState || "공개된 텍스트만으로는 심리 상태를 단정하기 어렵다.",
  };
}

const COMPATIBILITY_SYSTEM = `You analyze two Instagram accounts for a "reunion / post-breakup" product and determine their compatibility type and yearning levels.
Output ONLY a single JSON object, no markdown fences, no extra text.
Schema:
{
  "compatibilityType": string (Korean, 15자 내외. 두 사람의 관계 구조를 정의하는 제목. ~관계 또는 ~사이 형태로. 예: "끌리지만 타이밍이 문제인 관계", "감정은 남아있지만 방식이 다른 관계", "한쪽만 열려있는 비대칭 관계"),
  "compatibilityDesc": string (Korean, 한 문장. 두 사람의 구체적인 관계 패턴 설명. 자연스러운 한국어로. 예: "서로 잡아당기는 힘은 있는데 지금은 둘 다 준비가 안 됐다", "마음이 없는 게 아니라 표현 방식이 달라서 계속 엇갈리는 구조다"),
  "myYearning": number (0-100. MY_ACCOUNT의 미련 수치. 피드에서 읽히는 감정 잔류, 미련, 과거 회상 정도를 종합한 점수),
  "partnerYearning": number (0-100. THEIR_ACCOUNT의 미련 수치. 동일 기준. 중요: myYearning은 반드시 partnerYearning보다 높아야 한다. 리포트를 돌리는 쪽이 대체로 미련이 더 크기 때문이다)
}
Rules:
- 자연스러운 한국어 문장으로. 단문 끊어치기 금지. 친구가 솔직하게 조언하는 말투로.
- Do NOT infer gender. Use neutral wording.
- Base analysis only on visible public data patterns.
- myYearning must always be > partnerYearning. Typical range: myYearning 55-85, partnerYearning 20-55.`;

async function callClaudeCompatibility(
  apiKey: string,
  myBundle: any,
  theirBundle: any,
  dataLimited: boolean,
): Promise<{ compatibilityType: string; compatibilityDesc: string; myYearning: number; partnerYearning: number } | null> {
  const myPayload = compactBundleForPrompt(myBundle, 10);
  const theirPayload = compactBundleForPrompt(theirBundle, 10);

  const userBlock = `Data quality: ${dataLimited ? "LIMITED — some accounts are private or have few posts." : "Public posts available for both."}
MY_ACCOUNT:
${JSON.stringify(myPayload)}

THEIR_ACCOUNT:
${JSON.stringify(theirPayload)}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 400,
      system: COMPATIBILITY_SYSTEM,
      messages: [{ role: "user", content: userBlock }],
    }),
  });

  if (!res.ok) {
    console.error("Claude compatibility API error:", res.status);
    return null;
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;

  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(trimmed);
    const compatibilityType = typeof parsed.compatibilityType === "string" ? parsed.compatibilityType.trim() : "";
    const compatibilityDesc = typeof parsed.compatibilityDesc === "string" ? parsed.compatibilityDesc.trim() : "";
    let myYearning = typeof parsed.myYearning === "number" ? Math.round(parsed.myYearning) : 65;
    let partnerYearning = typeof parsed.partnerYearning === "number" ? Math.round(parsed.partnerYearning) : 35;
    myYearning = Math.max(0, Math.min(100, myYearning));
    partnerYearning = Math.max(0, Math.min(100, partnerYearning));
    if (myYearning <= partnerYearning) { myYearning = Math.min(100, partnerYearning + 15); }
    if (!compatibilityType) return null;
    return { compatibilityType, compatibilityDesc, myYearning, partnerYearning };
  } catch {
    console.error("Claude compatibility JSON parse failed");
    return null;
  }
}

async function restGetCache(
  supabaseUrl: string,
  serviceKey: string,
  cacheKey: string,
): Promise<any | null> {
  const base = supabaseRestBase(supabaseUrl);
  const u = new URL(`${base}/rest/v1/reunion_pair_analysis_cache`);
  u.searchParams.set("cache_key", pgQuoted("eq", cacheKey));
  u.searchParams.set("expires_at", pgQuoted("gt", new Date().toISOString()));
  u.searchParams.set("select", "payload");

  const res = await fetch(u.toString(), {
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      Accept: "application/json",
      "Content-Profile": "public",
      "Accept-Profile": "public",
    },
  });
  if (!res.ok) {
    const errBody = await res.text();
    console.error("[reunion-cache] GET failed:", res.status, errBody.slice(0, 500));
    return null;
  }
  const rows = await res.json();
  if (!Array.isArray(rows) || rows.length === 0) {
    console.log("[reunion-cache] GET miss (no row):", cacheKey);
    return null;
  }
  let payload = rows[0].payload;
  if (payload == null) return null;
  if (typeof payload === "string") {
    try {
      payload = JSON.parse(payload);
    } catch {
      console.error("[reunion-cache] payload JSON parse failed");
      return null;
    }
  }
  if (!payload?.my || !payload?.their) {
    console.error("[reunion-cache] payload shape invalid (missing my/their)");
    return null;
  }
  console.log("[reunion-cache] HIT:", cacheKey);
  return payload;
}

async function restUpsertCache(
  supabaseUrl: string,
  serviceKey: string,
  cacheKey: string,
  payload: unknown,
  expiresAtIso: string,
) {
  const base = supabaseRestBase(supabaseUrl);
  const res = await fetch(
    `${base}/rest/v1/reunion_pair_analysis_cache?on_conflict=cache_key`,
    {
      method: "POST",
      headers: {
        apikey: serviceKey,
        Authorization: `Bearer ${serviceKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "Content-Profile": "public",
        "Accept-Profile": "public",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({
        cache_key: cacheKey,
        payload,
        expires_at: expiresAtIso,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!res.ok) {
    console.error("[reunion-cache] UPSERT failed:", res.status, await res.text());
  } else {
    console.log("[reunion-cache] STORED:", cacheKey, "expires", expiresAtIso);
  }
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const resultsLimit = Math.min(8, Math.max(1, Number(body.resultsLimit) || 8));

    const myUserId = String(body.myUserId || body.myId || "")
      .replace(/^@/, "")
      .trim();
    const theirUserId = String(body.theirUserId || body.theirId || "")
      .replace(/^@/, "")
      .trim();

    const pairMode = Boolean(myUserId && theirUserId);

    if (pairMode) {
      const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
      const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
      const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
      const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

      if (!APIFY_TOKEN) {
        return new Response(JSON.stringify({ error: "APIFY_TOKEN is not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
        return new Response(
          JSON.stringify({ error: "SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is not configured" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }

      const cacheKey = `reunion_ai_v1:${myUserId.toLowerCase()}:${theirUserId.toLowerCase()}`;
      const cached = await restGetCache(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, cacheKey);
      if (cached?.my && cached?.their) {
        return new Response(
          JSON.stringify({
            ok: true,
            mode: "pair",
            fromCache: true,
            my: cached.my,
            their: cached.their,
            myAiAnalysis: cached.myAiAnalysis ?? null,
            theirAiAnalysis: cached.theirAiAnalysis ?? null,
            myPersonaLine: cached.myAiAnalysis?.persona || "",
            partnerPersonaLine: cached.theirAiAnalysis?.persona || "",
            compatibilityType: cached.compatibility?.compatibilityType || "",
            compatibilityDesc: cached.compatibility?.compatibilityDesc || "",
            myYearning: cached.compatibility?.myYearning ?? 65,
            partnerYearning: cached.compatibility?.partnerYearning ?? 35,
            myPrivateWarning: Boolean(cached.myPrivateWarning),
            theirPrivateWarning: Boolean(cached.theirPrivateWarning),
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      const [myScrape, theirScrape] = await Promise.all([
        runApifyScrape(myUserId, APIFY_TOKEN, resultsLimit),
        runApifyScrape(theirUserId, APIFY_TOKEN, resultsLimit),
      ]);

      let myBundle: any;
      let theirBundle: any;
      let myPrivateWarning = false;
      let theirPrivateWarning = false;

      if (myScrape.kind === "error") {
        return new Response(
          JSON.stringify({
            error: myScrape.message,
            message: "내 계정 데이터를 가져오지 못했습니다.",
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }
      if (theirScrape.kind === "error") {
        return new Response(
          JSON.stringify({
            error: theirScrape.message,
            message: "상대 계정 데이터를 가져오지 못했습니다.",
          }),
          { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
        );
      }

      if (myScrape.kind === "private") {
        myBundle = myScrape.data;
        myPrivateWarning = true;
      } else {
        myBundle = myScrape.data;
      }
      if (theirScrape.kind === "private") {
        theirBundle = theirScrape.data;
        theirPrivateWarning = true;
      } else {
        theirBundle = theirScrape.data;
      }

      const myLimited =
        myPrivateWarning || (myBundle.stats?.postCountReturned ?? 0) < 4;
      const theirLimited =
        theirPrivateWarning || (theirBundle.stats?.postCountReturned ?? 0) < 4;

      const [myAiAnalysis, theirAiAnalysis] = await Promise.all([
        callClaudeAnalysis(ANTHROPIC_API_KEY, myBundle, "me", theirUserId, myLimited),
        callClaudeAnalysis(ANTHROPIC_API_KEY, theirBundle, "them", myUserId, theirLimited),
      ]);

      const compatibility = await callClaudeCompatibility(
        ANTHROPIC_API_KEY,
        myBundle,
        theirBundle,
        myLimited || theirLimited,
      );

      const expiresAt = new Date(Date.now() + CACHE_TTL_MS).toISOString();
      const payloadToStore = {
        version: 1,
        my: myBundle,
        their: theirBundle,
        myAiAnalysis,
        theirAiAnalysis,
        compatibility,
        myPrivateWarning,
        theirPrivateWarning,
      };
      await restUpsertCache(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, cacheKey, payloadToStore, expiresAt);

      return new Response(
        JSON.stringify({
          ok: true,
          mode: "pair",
          fromCache: false,
          my: myBundle,
          their: theirBundle,
          myAiAnalysis,
          theirAiAnalysis,
          myPersonaLine: myAiAnalysis?.persona || "",
          partnerPersonaLine: theirAiAnalysis?.persona || "",
          compatibilityType: compatibility?.compatibilityType || "",
          compatibilityDesc: compatibility?.compatibilityDesc || "",
          myYearning: compatibility?.myYearning ?? 65,
          partnerYearning: compatibility?.partnerYearning ?? 35,
          myPrivateWarning,
          theirPrivateWarning,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // --- single-account (기존 동작) ---
    const userId = String(body.userId || body.username || "")
      .replace(/^@/, "")
      .trim();

    if (!userId) {
      return new Response(JSON.stringify({ error: "userId is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const APIFY_TOKEN = Deno.env.get("APIFY_TOKEN");
    if (!APIFY_TOKEN) {
      return new Response(JSON.stringify({ error: "APIFY_TOKEN is not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const scraped = await runApifyScrape(userId, APIFY_TOKEN, resultsLimit);
    if (scraped.kind === "error") {
      return new Response(
        JSON.stringify({ error: scraped.message, message: "계정 데이터를 가져오지 못했습니다." }),
        { status: 422, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }
    if (scraped.kind === "private") {
      return new Response(
        JSON.stringify({
          error: "PRIVATE_ACCOUNT",
          message: "비공개 계정은 공개 데이터만으로는 확신도가 낮습니다.",
          partial: scraped.data,
        }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    return new Response(JSON.stringify({ ok: true, data: scraped.data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("reunion-instagram error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
