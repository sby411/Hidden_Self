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

const CLAUDE_MODEL = Deno.env.get("REUNION_CLAUDE_MODEL") ?? "claude-sonnet-4-5";
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
  "persona": string (10~20자. 이 사람의 숨겨진 결핍/과시욕/심리를 꿰뚫어서 한 방에 정의. 계정 사실 나열 절대 금지. 읽는 순간 찔리게.

반드시 아래 신호들을 조합해서 심리를 읽어낼 것:
- 게시물 빈도/패턴 (꾸준 vs 갑자기 뚝)
- 셀카 비율 vs 사물/풍경 비율
- 팔로워 수 대비 게시물 수
- 캡션 길이/스타일
- 해시태그 패턴
- 위치 태그
- 하이라이트 제목

신호 → 심리 → 페르소나 변환 예시:
- 셀카 많음 + 팔로워 많음 + 광고 협업 → "예쁜 거 알면서 확인받고 싶은 것"
- 카페/맛집 위주 + 감성 사진 → "감성 있는 척이 취미인 것"
- 여행 사진 많음 + 일상 거의 없음 → "일상 재미없어서 여행으로 자아 충전 중"
- 운동 인증 + 몸매 슬쩍 노출 → "관리한다고 티내고 싶은 것"
- 해외여행 + 명품 슬쩍 + 카페 → "평범한 일상 숨기고 하이라이트만 보여주는 것"
- 친구 사진 많음 + 항상 중심 → "무리에서 주인공이어야 직성 풀리는 것"
- 일상 자주 올림 → "아무도 안 봐도 올려야 직성 풀리는 것"
- 게시물 거의 없음 + 팔로잉만 많음 → "보기만 하고 존재감은 없는 그림자"
- 운동 인증 + 근육 슬쩍 → "말 대신 몸으로 어필하려는 것"
- 감성 사진 + 팔로워 적음 → "감성남인 척하고 싶은 것"
- 차/장비 자랑 → "물건으로 자신감 채우는 것"
- 감성 글귀 + 뒷모습/손 → "존재감은 남기고 싶은데 얼굴은 싫은 것"

형식 자유. 끝맺음 형식 없음. 반드시 그 계정에서만 나올 수 있는 문장으로.
절대 금지: '~하는 사람', '~인 사람', '~형', '~것', '~인 것' 으로 끝나는 문장.
대신 이런 톤으로 끝낼 것: '~봄', '~중', '~셈', '~꼴', 또는 명사로 끝내기.
예: '작품으로 말하고 싶은데 얼굴만 보는 게 억울한 도예과', '쇼핑몰이 곧 자아인 창업자', '일상 재미없어서 여행으로 자아 보충 중'),
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
  "partnerYearning": number (0-100. THEIR_ACCOUNT의 미련 수치. 동일 기준. 중요: myYearning은 반드시 partnerYearning보다 높아야 한다. 리포트를 돌리는 쪽이 대체로 미련이 더 크기 때문이다),
  "reunionComment": string (Korean, 2문장. 두 계정 데이터를 근거로 한 재회 가능성 코멘트. 지금 연락하면 어떤 결과가 나올지, 왜 그런지를 양쪽 피드 패턴에 근거해서 구체적으로 쓸 것. 뻔한 조언 금지. 예: "지금 네가 먼저 길게 쓰면 상대 스토리 업로드 패턴상 읽씹 확률이 높다. 상대 캡션 톤이 방어에서 내려갈 때까지 짧은 접점만 유지해라."),
  "summaryLine": string (Korean, 2~3문장. 두 사람의 관계 상태를 양쪽 계정 데이터 근거로 요약. 팔로워/게시물/캡션 톤/활동 패턴 등 실제 데이터 포인트를 언급하면서 자연스럽게 써줄 것. 예: "솔직히 말하면 지금 재회 가능성은 낮은 쪽에 가깝다. 상대 피드는 새 일상 중심으로 전환된 반면, 네 쪽은 아직 감성적 캡션이 남아 있어서 온도 차이가 크게 보인다."),
  "theirFirstMoveComment": string (Korean, 2~3문장. 상대(THEIR_ACCOUNT)가 먼저 연락할 것 같은 시점과 방식을 계정 특성에 근거해서 예측. 게시물 빈도, 스토리 패턴, 캡션 톤, 팔로잉 변화 등 구체적 데이터 포인트 반영. 예: "상대 게시물 간격이 2~3주로 느려진 걸 보면 지금 정리 모드에 가깝다. 먼저 온다면 스토리 반응이나 이모지 정도가 먼저일 거고, 장문 DM은 기대하기 어렵다.")
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
): Promise<{ compatibilityType: string; compatibilityDesc: string; myYearning: number; partnerYearning: number; reunionComment: string; summaryLine: string; theirFirstMoveComment: string } | null> {
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
      max_tokens: 800,
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
    const reunionComment = typeof parsed.reunionComment === "string" ? parsed.reunionComment.trim() : "";
    const summaryLine = typeof parsed.summaryLine === "string" ? parsed.summaryLine.trim() : "";
    const theirFirstMoveComment = typeof parsed.theirFirstMoveComment === "string" ? parsed.theirFirstMoveComment.trim() : "";
    if (!compatibilityType) return null;
    return { compatibilityType, compatibilityDesc, myYearning, partnerYearning, reunionComment, summaryLine, theirFirstMoveComment };
  } catch {
    console.error("Claude compatibility JSON parse failed");
    return null;
  }
}

const PREMIUM_SYSTEM = `You generate 8 premium deep-analysis cards for a "reunion / post-breakup" product.
You receive two Instagram account profiles (MY_ACCOUNT, THEIR_ACCOUNT), their AI persona analyses, and their compatibility analysis.
Output ONLY a single JSON object, no markdown fences, no extra text.

Each field must be 3~4 sentences of concrete, actionable advice grounded in the actual account data (posting patterns, caption tone, follower counts, activity trends, etc.).
CRITICAL: All 8 fields must contain DIFFERENT content. No overlapping sentences or repeated advice between cards.

Schema:
{
  "waitUntil": string (Korean. 기다린다면 언제까지가 맞는지. 상대 피드의 업로드 간격, 스토리 톤 변화, 방어 신호 완화 시점을 근거로 구체적 타이밍 제시. 2주/4주/8주 체크포인트와 그때 써도 되는 첫 문장 톤을 케이스별로.),
  "toneReply": string (Korean. 연락한다면 먹히는 톤 vs 멀어지는 톤. 상대 캡션 스타일과 반응 패턴에서 읽히는 선호 톤 분석. 구체적 문장 예시 포함. 답장 가능성 높이는 방식과 역효과 방식 대비.),
  "firstMessage": string (Korean. 처음 뭐라고 보내야 하는지. 상대 관심사/캡션 소재에서 뽑은 구체적 첫 문장 방향 3개. 각각 길이와 톤이 다르게. 방어형/개방형 상대 구분.),
  "replyStyle": string (Korean. 답장이 올 가능성이 높은 방식. 상대의 소통 패턴—댓글 스타일, 캡션 길이, 이모지 사용—에서 읽히는 선호 응답 형태. 질문형 vs 공유형 vs 확인형 중 어떤 게 맞는지.),
  "newPerson": string (Korean. 상대가 새 사람 쪽으로 기운 가능성. 태그 반복, 특정 인물 노출, 시간대별 활동 변화 등 구체적 데이터 포인트로 가능성 구간 정리. 오탐 기준도 같이.),
  "misunderstanding": string (Korean. 이 관계에서 가장 위험한 오해 포인트. 양쪽 피드 패턴에서 읽히는 구체적 오해 시나리오. '잔상=의지', '침묵=거절' 같은 착각을 이 커플 데이터에 맞게.),
  "theirTrace": string (Korean. 상대가 안 오는데 흔적은 남기는 이유. 팔로우 유지, 스토리 열람, 간접 반응 등의 패턴을 상대 심리와 연결. 그 흔적이 여지인지 습관인지 구분 기준.),
  "myDestroy": string (Korean. 내가 먼저 망치는 패턴. 내 계정 활동에서 읽히는 위험 행동—연타, 간접 메시지, 스토리 확인 강박 등. 구체적으로 어떤 행동이 상대를 닫히게 만드는지.)
}
Rules:
- 자연스러운 한국어 문장으로. 단문 끊어치기 금지. 친구가 솔직하게 조언하는 말투로.
- 반드시 양쪽 계정 데이터(게시물 수, 팔로워, 캡션 톤, 활동 패턴 등)를 근거로 쓸 것. 일반론 금지.
- 8개 카드 간 내용 중복 절대 금지. 같은 조언이 두 카드에 나오면 안 됨.
- Do NOT infer gender. Use neutral wording.`;

async function callClaudePremium(
  apiKey: string,
  myBundle: any,
  theirBundle: any,
  myAiAnalysis: any,
  theirAiAnalysis: any,
  compatibility: any,
): Promise<Record<string, string> | null> {
  const myPayload = compactBundleForPrompt(myBundle, 15);
  const theirPayload = compactBundleForPrompt(theirBundle, 15);

  const userBlock = `MY_ACCOUNT:
${JSON.stringify(myPayload)}

THEIR_ACCOUNT:
${JSON.stringify(theirPayload)}

MY_AI_ANALYSIS:
${JSON.stringify(myAiAnalysis || {})}

THEIR_AI_ANALYSIS:
${JSON.stringify(theirAiAnalysis || {})}

COMPATIBILITY:
${JSON.stringify(compatibility || {})}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 2500,
      system: PREMIUM_SYSTEM,
      messages: [{ role: "user", content: userBlock }],
    }),
  });

  if (!res.ok) {
    const t = await res.text();
    console.error("Claude premium API error:", res.status, t);
    return null;
  }

  const json = await res.json();
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;

  try {
    const trimmed = text.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "");
    const parsed = JSON.parse(trimmed);
    const keys = ["waitUntil", "toneReply", "firstMessage", "replyStyle", "newPerson", "misunderstanding", "theirTrace", "myDestroy"];
    const result: Record<string, string> = {};
    for (const k of keys) {
      result[k] = typeof parsed[k] === "string" ? parsed[k].trim() : "";
    }
    if (!result.waitUntil || !result.toneReply) return null;
    return result;
  } catch {
    console.error("Claude premium JSON parse failed");
    return null;
  }
}

async function restGetCache(
  supabaseUrl: string,
  serviceKey: string,
  cacheKey: string,
): Promise<any | null> {
  return null;
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

    // --- premium mode: 프론트에서 이미 갖고 있는 데이터로 심층 카드 생성 ---
    if (body.mode === "premium") {
      const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY");
      if (!ANTHROPIC_API_KEY) {
        return new Response(JSON.stringify({ error: "ANTHROPIC_API_KEY is not configured" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const { myBundle, theirBundle, myAiAnalysis, theirAiAnalysis, compatibility } = body;
      if (!myBundle || !theirBundle) {
        return new Response(JSON.stringify({ error: "myBundle and theirBundle are required for premium mode" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const premiumCards = await callClaudePremium(
        ANTHROPIC_API_KEY,
        myBundle,
        theirBundle,
        myAiAnalysis,
        theirAiAnalysis,
        compatibility,
      );
      if (!premiumCards) {
        return new Response(JSON.stringify({ ok: false, error: "PREMIUM_AI_FAILED" }), {
          status: 200,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      return new Response(
        JSON.stringify({ ok: true, mode: "premium", premiumCards }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

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

      const cacheKey = `reunion_ai_v5:${myUserId.toLowerCase()}:${theirUserId.toLowerCase()}`;
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
            reunionComment: cached.compatibility?.reunionComment || "",
            summaryLine: cached.compatibility?.summaryLine || "",
            theirFirstMoveComment: cached.compatibility?.theirFirstMoveComment || "",
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
          reunionComment: compatibility?.reunionComment || "",
          summaryLine: compatibility?.summaryLine || "",
          theirFirstMoveComment: compatibility?.theirFirstMoveComment || "",
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
