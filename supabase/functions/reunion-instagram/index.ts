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

const REUNION_AI_SYSTEM = `You are a relationship psychologist who reads unconscious patterns from Instagram data.
You analyze public Instagram profile data for a "reunion / post-breakup contact" product.
Output ONLY a single JSON object, no markdown fences, no extra text.
You will receive: the account data AND the breakup date (year, month).
CRITICAL ANALYSIS FRAMEWORK — 인스타에서 내면/무의식을 읽는 법:

이별 전후 변화 분석 (breakup date 기준):
- 이별 전 게시물 vs 이별 후 게시물의 톤/빈도/소재 변화
- 갑자기 셀카가 늘었다 = 자존감 회복 시도 또는 어필
- 갑자기 여행/모임 사진 폭주 = 회피성 탈출, "나 잘 살고 있어" 과시
- 게시물이 뚝 끊겼다 = 감정 처리 중이거나 완전 철수
- 감성 캡션이 갑자기 늘었다 = 간접 메시지, 미련의 무의식적 표출
- 반대로 캡션이 사라졌다 = 감정을 숨기려는 방어

무의식적 욕구 읽기:
- 셀카 비율 높음 = 인정/확인 욕구 ("나 괜찮지?" 를 피드로 묻고 있음)
- 음식/카페만 올림 = 사람과의 관계보다 안전한 소재에 숨는 회피
- 친구 사진 많음 = 외로움 방어, "나 혼자 아니야" 증명 욕구
- 운동/자기관리 = 통제 욕구, 감정을 몸으로 전환
- 풍경/사물 위주 = 자기 노출 회피, 감정 거리두기
- 일상을 자주 올림 = 누군가 봐주길 바라는 존재감 욕구
- 게시물 거의 없음 = 자기 표현 차단, 관찰자 모드

애착 유형 추론:
- 불안형: 게시물 연타, 감성 캡션 많음, 스토리 자주, 반응에 민감한 흔적
- 회피형: 게시물 드뭄, 캡션 최소, 감정 표현 거의 없음, 사물/풍경 위주
- 안정형: 꾸준한 간격, 다양한 소재, 자연스러운 톤
- 혼란형: 올렸다 삭제, 톤 급변, 패턴 불일치

감정 단계 읽기 (이별 후):
- 부정: 아무 변화 없는 척, 이전과 동일한 피드
- 분노: 공격적 캡션, 의미심장한 글귀, 간접 저격
- 거래: "잘 살겠다" 식 과시, 갑작스러운 자기계발
- 우울: 게시물 급감, 감성 톤 증가, 혼자 있는 사진
- 수용: 새로운 일상 소재, 안정적 간격, 자연스러운 톤

Schema:
{
  "persona": string (10~20자. 이 사람의 숨겨진 결핍/과시욕/무의식적 욕구를 꿰뚫어서 한 방에 정의. 계정 사실 나열 절대 금지. 읽는 순간 찔리게.
절대 금지: '~하는 사람', '~인 사람', '~형', '~것', '~인 것' 으로 끝나는 문장.
대신 이런 톤으로 끝낼 것: '~봄', '~중', '~셈', '~꼴', 또는 명사로 끝내기.
예: '작품으로 말하고 싶은데 얼굴만 보는 게 억울한 도예과', '쇼핑몰이 곧 자아인 창업자', '일상 재미없어서 여행으로 자아 보충 중'),
  "impression": string (Korean, 3-4 sentences. 표면이 아닌 내면을 읽어줄 것. 이 사람이 피드를 통해 무의식적으로 보여주고 싶은 것과 숨기고 싶은 것을 구분해서 써줘. 이별 시기를 기준으로 전후 변화가 보이면 반드시 언급. "~처럼 보이지만 실은 ~" 구조로 겉과 속의 괴리를 짚어줘.),
  "keywords": string[] (3-5. 표면 키워드가 아닌 심리 키워드. 예: "인정 결핍", "회피성 자기보호", "무의식적 어필", "감정 동결 모드"),
  "attachmentStyle": string (Korean, 1-2문장. 이 계정에서 읽히는 애착 유형과 근거. "불안형/회피형/안정형/혼란형 중 ~에 가깝다. 근거는 ~"),
  "unconsciousNeed": string (Korean, 2문장. 이 사람이 피드를 통해 무의식적으로 채우려는 욕구. 인정? 통제? 소속감? 자존감 확인? 구체적으로.),
  "postBreakupPhase": string (Korean, 2문장. 이별 후 감정 처리 단계 추정. 이별 시기 대비 현재 피드 상태에서 부정/분노/거래/우울/수용 중 어디인지. 근거 포함.),
  "approach": string (Korean, 2-3문장. 이 사람의 심리 상태에 맞는 재회 접근법. 애착 유형과 감정 단계를 고려한 실질적 조언.),
  "psychState": string (Korean, 2문장. 현재 감정 상태를 캡션 톤, 활동 패턴 변화에서 읽어낸 것. "~로 읽힐 수 있다" 톤.)
}
Rules:
- 이별 시기(breakup date)를 기준으로 게시물 timestamp를 비교해서 이별 전후 변화를 반드시 분석할 것.
- "팔로워가 몇 명이다", "게시물이 몇 개다" 같은 표면 나열 금지. 그 숫자가 심리적으로 뭘 의미하는지를 쓸 것.
- Do NOT infer gender. Use neutral wording: "이 사람", "계정", "상대".
- 말투: 친구가 솔직하게 조언하는 톤. 찔리게 쓸 것. 뻔한 위로 금지.`;

async function callClaudeAnalysis(
  apiKey: string,
  bundle: any,
  role: "me" | "them",
  peerUsername: string,
  dataLimited: boolean,
  breakupYear?: number,
  breakupMonth?: number,
): Promise<Record<string, unknown> | null> {
  const payload = compactBundleForPrompt(bundle, 20);
  const roleLine =
    role === "me"
      ? "This is the USER's own account (the person running the report)."
      : `This is the OTHER person's account (@${peerUsername} is the user viewing the report).`;

  const breakupLine = breakupYear && breakupMonth
    ? `\nBreakup date: ${breakupYear}년 ${breakupMonth}월. 게시물 timestamp를 이 날짜와 비교해서 이별 전후 변화를 분석할 것.`
    : "";

  const userBlock = `${roleLine}
Data quality note: ${dataLimited ? "LIMITED — private or few posts; be conservative." : "Public posts available."}${breakupLine}
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
      max_tokens: 1800,
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
  const attachmentStyle = typeof parsed.attachmentStyle === "string" ? parsed.attachmentStyle : "";
  const unconsciousNeed = typeof parsed.unconsciousNeed === "string" ? parsed.unconsciousNeed : "";
  const postBreakupPhase = typeof parsed.postBreakupPhase === "string" ? parsed.postBreakupPhase : "";
  if (!impression || keywords.length === 0) return null;

  return {
    persona: persona.trim() || "",
    impression,
    keywords: keywords.slice(0, 8),
    attachmentStyle: attachmentStyle.trim() || "",
    unconsciousNeed: unconsciousNeed.trim() || "",
    postBreakupPhase: postBreakupPhase.trim() || "",
    approach: approach || "데이터가 부족해 접근 방식을 구체화하기 어렵다.",
    psychState: psychState || "공개된 텍스트만으로는 심리 상태를 단정하기 어렵다.",
  };
}

const COMPATIBILITY_SYSTEM = `You are a relationship psychologist analyzing two Instagram accounts for a reunion/post-breakup product.
Output ONLY a single JSON object, no markdown fences, no extra text.
You will receive: both account data AND the breakup date.
CRITICAL: 표면 비교("한쪽은 인플루언서, 한쪽은 일반인")가 아니라 심리적 궁합을 분석해야 한다.

분석 프레임워크:
- 애착 유형 궁합: 불안+회피 = 추격-도주 패턴, 불안+불안 = 감정 과잉 소진, 회피+회피 = 평행선
- 이별 후 감정 온도차: 한쪽은 이미 수용 단계인데 다른 쪽은 아직 부정/분노 단계일 수 있음
- 소통 방식 불일치: 장문 감성 vs 무캡션 = 감정 표현 방식 자체가 다름

Schema:
{
  "compatibilityType": string (Korean, 15자 내외. 두 사람의 심리적 관계 구조를 정의. ~관계 또는 ~사이 형태로),
  "compatibilityDesc": string (Korean, 한 문장. 심리적 궁합 패턴 설명),
  "myYearning": number (0-100. 피드에서 읽히는 미련 수치),
  "partnerYearning": number (0-100. 반드시 myYearning보다 낮아야 함),
  "reunionComment": string (Korean, 2문장. 지금 연락하면 어떤 심리적 반응이 나올지 예측. "읽씹" 같은 표면 결과가 아니라 "상대는 지금 감정 동결 모드라 어떤 연락이든 처리 비용으로 느낀다" 같은 내면 분석),
  "summaryLine": string (Korean, 2~3문장. 표면 비교 금지. "불안형 애착이 회피형을 쫓는 구조라 연락할수록 멀어지는 패턴이 보인다" 같은 심리적 구조 분석),
  "theirFirstMoveComment": string (Korean, 2~3문장. 상대의 애착 유형과 감정 단계에 근거해서 먼저 연락할 시점/방식 예측),
  "tensionAxis": string (Korean, 1문장. 두 사람의 핵심 심리적 긴장 구조. "~축" 으로 끝낼 것. 예: "확인받고 싶은 쪽과 확인해주기 싫은 쪽이 엇갈리는 축")
}
Rules:
- 이별 시기를 기준으로 전후 변화를 반드시 언급.
- 표면 데이터("팔로워 수", "계정 종류") 비교 금지. 심리적 의미를 읽어낼 것.
- myYearning must always be > partnerYearning. Typical range: myYearning 55-85, partnerYearning 20-55.
- 말투: 친구가 팩폭하는 톤. 뻔한 위로 금지.
- Do NOT infer gender. Use neutral wording.`;

async function callClaudeCompatibility(
  apiKey: string,
  myBundle: any,
  theirBundle: any,
  dataLimited: boolean,
  breakupYear?: number,
  breakupMonth?: number,
): Promise<{ compatibilityType: string; compatibilityDesc: string; myYearning: number; partnerYearning: number; reunionComment: string; summaryLine: string; theirFirstMoveComment: string; tensionAxis: string } | null> {
  const myPayload = compactBundleForPrompt(myBundle, 10);
  const theirPayload = compactBundleForPrompt(theirBundle, 10);

  const breakupLine = breakupYear && breakupMonth
    ? `\nBreakup date: ${breakupYear}년 ${breakupMonth}월. 게시물 timestamp를 이 날짜와 비교해서 이별 전후 변화를 분석할 것.`
    : "";

  const userBlock = `Data quality: ${dataLimited ? "LIMITED — some accounts are private or have few posts." : "Public posts available for both."}${breakupLine}
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
      max_tokens: 1200,
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
    console.log("[reunion-compatibility] parsed:", JSON.stringify({ tensionAxis: parsed.tensionAxis, compatibilityType: parsed.compatibilityType }));
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
    const tensionAxis = typeof parsed.tensionAxis === "string" ? parsed.tensionAxis.trim() : "";
    if (!compatibilityType) return null;
    return { compatibilityType, compatibilityDesc, myYearning, partnerYearning, reunionComment, summaryLine, theirFirstMoveComment, tensionAxis };
  } catch {
    console.error("Claude compatibility JSON parse failed");
    return null;
  }
}

const PREMIUM_SYSTEM = `You are a relationship psychologist generating 8 premium deep-analysis cards for a reunion/post-breakup product.
You receive: two Instagram accounts, their AI persona analyses, compatibility analysis, AND the breakup date.
Output ONLY a single JSON object, no markdown fences, no extra text.

CRITICAL: 표면 데이터 나열이 아닌 심리 분석 기반으로 써야 한다. 8개 카드 간 내용 중복 절대 금지.

Schema:
{
  "waitUntil": string (Korean, 3~4문장. 상대의 현재 감정 처리 단계(부정/분노/거래/우울/수용)에서 언제 수용으로 넘어갈지, 피드 신호로 어떻게 판단하는지. 단순히 "몇 주 기다려라"가 아니라 "상대 캡션 톤이 이렇게 바뀌면 그때가 타이밍이다"는 식의 심리적 전환 신호 기준.),
  "toneReply": string (Korean, 3~4문장. 상대의 애착 유형에 맞는 톤 전략. 회피형이면 감정 표현 자체가 부담이니 정보성 톤으로, 불안형이면 확인해주는 톤으로 등. 상대 캡션 스타일에서 읽히는 소통 선호를 근거로.),
  "firstMessage": string (Korean, 3~4문장. 상대의 무의식적 관심사와 현재 감정 단계에 맞는 첫 문장. 상대 최근 게시물 소재에서 뽑되, 그 소재가 상대에게 심리적으로 어떤 의미인지까지 고려.),
  "replyStyle": string (Korean, 3~4문장. 상대의 소통 패턴에서 읽히는 심리적 선호. 짧은 답 = 처리 비용 최소화 욕구, 이모지만 = 감정 노출 회피, 읽씹 = 대화 자체가 부담. 각 패턴별 대응 전략.),
  "newPerson": string (Korean, 3~4문장. 새 사람 가능성을 심리적 맥락에서 분석. 리바운드인지 진짜 넘어간 건지. 이별 후 빠르게 새 사람이 보이면 회피형 특유의 감정 대체 패턴일 수 있음.),
  "misunderstanding": string (Korean, 3~4문장. 이 커플의 애착 유형 조합에서 가장 위험한 심리적 오해. 불안형이 회피형의 침묵을 "관심 없음"으로 읽는 것, 회피형이 불안형의 연타를 "집착"으로 읽는 것 등.),
  "theirTrace": string (Korean, 3~4문장. 상대가 흔적을 남기는 심리적 이유. 팔로우 유지 = 연결고리 완전 차단하기 싫은 무의식, 스토리만 봄 = 궁금하지만 직접 접근은 부담. 어떤 게 여지이고 어떤 게 습관인지 심리적으로 구분.),
  "myDestroy": string (Korean, 3~4문장. 내 애착 유형에서 나오는 자기파괴 패턴. 불안형이면: 확인 강박, 연타, 간접 메시지, 상대 반응 과잉 해석. 회피형이면: 먼저 연락하고 싶은데 자존심이 막음. 내 피드에서 읽히는 구체적 패턴.)
}
Rules:
- 말투: 친구가 팩폭하는 톤. 뻔한 위로 금지. 찔리게 쓸 것.
- 이별 시기를 기준으로 전후 변화를 반드시 언급.
- 표면 데이터 나열 금지. 심리적 의미를 읽어낼 것.
- Do NOT infer gender. Use neutral wording.`;

async function callClaudePremium(
  apiKey: string,
  myBundle: any,
  theirBundle: any,
  myAiAnalysis: any,
  theirAiAnalysis: any,
  compatibility: any,
  breakupYear?: number,
  breakupMonth?: number,
): Promise<Record<string, string> | null> {
  const myPayload = compactBundleForPrompt(myBundle, 15);
  const theirPayload = compactBundleForPrompt(theirBundle, 15);

  const breakupLine = breakupYear && breakupMonth
    ? `Breakup date: ${breakupYear}년 ${breakupMonth}월. 게시물 timestamp를 이 날짜와 비교해서 이별 전후 변화를 분석할 것.\n\n`
    : "";

  const userBlock = `${breakupLine}MY_ACCOUNT:
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
    const breakupYear = typeof body.breakupYear === "number" ? body.breakupYear : undefined;
    const breakupMonth = typeof body.breakupMonth === "number" ? body.breakupMonth : undefined;

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
        breakupYear,
        breakupMonth,
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
            tensionAxis: cached.compatibility?.tensionAxis || "",
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
        callClaudeAnalysis(ANTHROPIC_API_KEY, myBundle, "me", theirUserId, myLimited, breakupYear, breakupMonth),
        callClaudeAnalysis(ANTHROPIC_API_KEY, theirBundle, "them", myUserId, theirLimited, breakupYear, breakupMonth),
      ]);

      const compatibility = await callClaudeCompatibility(
        ANTHROPIC_API_KEY,
        myBundle,
        theirBundle,
        myLimited || theirLimited,
        breakupYear,
        breakupMonth,
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
          tensionAxis: compatibility?.tensionAxis || "",
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
