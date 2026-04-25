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

const CLAUDE_MODEL = Deno.env.get("REUNION_CLAUDE_MODEL") ?? "claude-sonnet-4-6";
const CACHE_TTL_MS = 72 * 60 * 60 * 1000;

/** PostgREST: 값에 `.` `:` `T` 등이 있으면 파서가 깨짐 → 반드시 큰따옴표로 감싼 뒤 쿼리스트링에 넣음 */
function pgQuoted(op: string, value: string): string {
  const escaped = value.replace(/\\/g, "\\\\").replace(/"/g, '""');
  return `${op}."${escaped}"`;
}

function supabaseRestBase(supabaseUrl: string): string {
  return supabaseUrl.replace(/\/+$/, "");
}

/** Strip markdown code fences and parse JSON, with fallback regex extraction */
function parseClaudeJson(raw: string, label: string): any | null {
  try {
    const cleaned = raw
      .trim()
      .replace(/^```(?:json)?\s*\n?/i, '')
      .replace(/\n?```\s*$/i, '')
      .trim();
    return JSON.parse(cleaned);
  } catch (err1) {
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (err2) {
        console.error(
          `[${label}] Claude JSON parse failed (both attempts):`,
          "\n  Error 1:", err1 instanceof Error ? err1.message : err1,
          "\n  Error 2:", err2 instanceof Error ? err2.message : err2,
          "\n  Raw (first 500 chars):", raw.slice(0, 500),
        );
      }
    } else {
      console.error(
        `[${label}] Claude JSON parse failed (no JSON object found):`,
        "\n  Error:", err1 instanceof Error ? err1.message : err1,
        "\n  Raw (first 500 chars):", raw.slice(0, 500),
      );
    }
    return null;
  }
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

type CompactPost = { t: string; caption: string; hashtags: string[]; likes: number; comments: number; loc: string };

function mapPost(x: any): CompactPost {
  return {
    t: x.timestamp,
    caption: String(x.caption || "").slice(0, 280),
    hashtags: (x.hashtags || []).slice(0, 12),
    likes: x.likeCount,
    comments: x.commentCount,
    loc: x.locationName || "",
  };
}

function compactBundleForPrompt(bundle: any, maxPosts: number, breakupYear?: number, breakupMonth?: number) {
  const p = bundle.profile;
  const allPosts: CompactPost[] = (bundle.posts || []).slice(0, maxPosts).map(mapPost);

  const base = {
    username: p.username,
    fullName: p.fullName,
    biography: String(p.biography || "").slice(0, 600),
    followersCount: p.followersCount,
    followsCount: p.followsCount,
    postsCountMeta: p.postsCount,
    isPrivate: p.isPrivate,
    stats: bundle.stats,
  };

  if (!breakupYear || !breakupMonth) {
    return { ...base, recentPosts: allPosts, breakupContext: null };
  }

  // Build breakup threshold: first day of breakup month
  const breakupThreshold = new Date(breakupYear, breakupMonth - 1, 1);

  const before: CompactPost[] = [];
  const after: CompactPost[] = [];
  const unknown: CompactPost[] = [];

  for (const post of allPosts) {
    if (!post.t) { unknown.push(post); continue; }
    const d = new Date(post.t);
    if (isNaN(d.getTime())) { unknown.push(post); continue; }
    if (d < breakupThreshold) { before.push(post); } else { after.push(post); }
  }

  const analysisMode = before.length >= 1 && after.length >= 1
    ? "before_after_comparison" as const
    : "current_only" as const;

  const breakupContext = {
    breakupDate: `${breakupYear}-${String(breakupMonth).padStart(2, "0")}`,
    postsBeforeBreakupCount: before.length,
    postsAfterBreakupCount: after.length,
    analysisMode,
  };

  if (analysisMode === "before_after_comparison") {
    return { ...base, breakupContext, postsBeforeBreakup: before, postsAfterBreakup: after, ...(unknown.length > 0 ? { postsUnknownDate: unknown } : {}) };
  }
  // current_only: send all posts as flat array
  return { ...base, breakupContext, recentPosts: allPosts };
}

const REUNION_AI_SYSTEM = `You are a relationship psychologist who reads unconscious patterns from Instagram data.
You analyze public Instagram profile data for a "reunion / post-breakup contact" product.
Output ONLY a single JSON object. No markdown, no code fences (\`\`\`), no explanation, no text before or after the JSON.
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
- "팔로워가 몇 명이다", "게시물이 몇 개다" 같은 표면 나열 금지. 그 숫자가 심리적으로 뭘 의미하는지를 쓸 것.
- Do NOT infer gender. Use neutral wording: "이 사람", "계정", "상대".
- 말투: 친구가 솔직하게 조언하는 톤. 찔리게 쓸 것. 뻔한 위로 금지.
- CRITICAL: Respond with ONLY valid JSON. 절대로 \`\`\`json 이나 \`\`\` 로 감싸지 마라.

[CRITICAL: breakupContext.analysisMode 기반 분석 분기]

breakupContext가 null이면 이별 시점 관련 언급 자체를 하지 마라.

[Mode: current_only]
이별 시점 비교 분석 금지. 수집된 게시물이 이별 전후로 충분히 분리되지 않음.
시점 단정 표현 절대 사용 금지:
- ❌ "이별 후 본인은...", "이별 전과 다르게...", "헤어진 다음부터...", "요즘 들어서..."
대신 현재 시점 표현 사용:
- ✅ "본인은 카페와 셀카 위주의 자기관리형 라이프를 보여준다"
- ✅ "피드에서 보이는 패턴은...", "인스타에 드러나는 성향은..."
postBreakupPhase 필드에서도 "이별 후 ~단계"라고 단정하지 말고 "현재 피드에서 읽히는 감정 상태" 정도로 신중하게.

[Mode: before_after_comparison]
postsBeforeBreakup과 postsAfterBreakup 두 배열이 분리 제공됨. 비교 분석 가능:
- 이별 전/후 게시물 변화 추적 (톤, 빈도, 소재)
- 각 인용 시 어느 시기 게시물인지 명확히
- 단, 한쪽이 1-2개로 적으면 단정 자제. "아직 변화 폭을 판단하기엔 이르지만..." 같이 신중하게.`;

async function callClaudeAnalysis(
  apiKey: string,
  bundle: any,
  role: "me" | "them",
  peerUsername: string,
  dataLimited: boolean,
  breakupYear?: number,
  breakupMonth?: number,
): Promise<Record<string, unknown> | null> {
  const payload = compactBundleForPrompt(bundle, 20, breakupYear, breakupMonth);
  const roleLine =
    role === "me"
      ? "This is the USER's own account (the person running the report)."
      : `This is the OTHER person's account (@${peerUsername} is the user viewing the report).`;

  const userBlock = `${roleLine}
Data quality note: ${dataLimited ? "LIMITED — private or few posts; be conservative." : "Public posts available."}
INPUT_JSON:
${JSON.stringify(payload)}`;

  const t0 = Date.now();
  console.log(`[reunion-analysis] Claude call START for: ${bundle.profile?.username || "?"}`);

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: REUNION_AI_SYSTEM,
        messages: [{ role: "user", content: userBlock }],
      }),
      signal: abort.signal,
    });
  } catch (fetchErr: any) {
    clearTimeout(timer);
    console.error(`[reunion-analysis] Claude fetch failed after ${Date.now() - t0}ms:`, fetchErr?.name, fetchErr?.message);
    return null;
  }
  clearTimeout(timer);
  console.log(`[reunion-analysis] Claude response in ${Date.now() - t0}ms, status=${res.status}`);

  if (!res.ok) {
    const t = await res.text();
    console.error("Claude API error:", res.status, t);
    return null;
  }

  const json = await res.json();
  if (json?.stop_reason === "max_tokens") {
    console.error("[reunion-analysis] Claude response truncated (stop_reason=max_tokens)");
    return null;
  }
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;
  console.log(`[reunion-analysis] Claude text length: ${text.length} chars`);

  const parsed = parseClaudeJson(text, "reunion-analysis") as Record<string, unknown> | null;
  if (!parsed) return null;

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
Output ONLY a single JSON object. No markdown, no code fences (\`\`\`), no explanation, no text before or after the JSON.
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
  "tensionAxis": string (Korean, 1문장. 두 사람의 핵심 심리적 긴장 구조. "~축" 으로 끝낼 것. 예: "확인받고 싶은 쪽과 확인해주기 싫은 쪽이 엇갈리는 축"),
  "relationshipLoop": string (Korean, 4~5문장. 이 커플이 반복하는 관계 악순환 시나리오를 단계별로 서술. "너가 ~할수록 → 상대는 ~하고 → 결국 ~되는" 구조로. 반드시 양쪽의 애착 유형과 감정 처리 방식에 근거.),
  "brutalTruth": string (Korean, 2~3문장. 이 관계의 핵심 문제를 한 방에 찌르는 팩폭. 읽는 사람이 불편하지만 인정할 수밖에 없는 수준. 위로 금지. 양쪽 피드 데이터에서 읽히는 심리적 근거 포함.),
  "loveStyle": object (두 사람의 연애 체질 태그 비교. {"my": ["감정 표현형", "의미 부여형", "붙잡는 타입"], "their": ["감정 차단형", "흔적 삭제형", "도망가는 타입"]}. 각각 2~3개의 연애 체질 태그. 피드 데이터에서 읽히는 연애 스타일을 심리적으로 정의. 예시 태그: "확인 중독형", "감정 냉동형", "의미 과잉 부여형", "존재감 소멸형", "통제 욕구형", "자존심 방어형", "미련 포장형", "감정 도피형"),
  "recommendLabel": string (Korean, 한 줄. 이 두 사람의 재회 가능성을 한 문장으로 요약. 일반적 템플릿("반반이다", "여지는 있다" 등) 흉내내지 말 것. 반드시 두 계정의 구체 데이터와 심리 분석 맥락을 반영한 고유한 표현이어야 한다. 예: "회피형이 먼저 돌아올 리 없고, 불안형이 참을 리도 없다", "둘 다 미련은 있는데 자존심이 더 크다"),
  "recommendReasons": array of objects (3-4개. 왜 이 재회 추천도/카피가 나왔는지 핵심 근거. 각 항목: {"title": "포인트 제목 (8자 이내)", "body": "1-2문장. 두 계정 데이터에서 도출한 구체 관찰 + 재회 가능성에 미치는 영향. 일반론 금지."}. 예: {"title": "감정 온도차", "body": "이별 후 한쪽은 게시물 폭주, 다른 쪽은 침묵. 감정 처리 속도가 달라서 지금 연락하면 타이밍이 안 맞는다."})
}
Rules:
- 표면 데이터("팔로워 수", "계정 종류") 비교 금지. 심리적 의미를 읽어낼 것.
- myYearning must always be > partnerYearning. Typical range: myYearning 55-85, partnerYearning 20-55.
- 말투: 친구가 팩폭하는 톤. 뻔한 위로 금지.
- Do NOT infer gender. Use neutral wording.
- CRITICAL: Respond with ONLY valid JSON. 절대로 \`\`\`json 이나 \`\`\` 로 감싸지 마라.
- analysisMode가 "current_only"면 이별 전후 비교 표현 금지. 현재 피드 성향만으로 분석.
- analysisMode가 "before_after_comparison"이면 전후 변화 비교 가능하되 데이터 적으면 신중하게.`;

async function callClaudeCompatibility(
  apiKey: string,
  myBundle: any,
  theirBundle: any,
  dataLimited: boolean,
  breakupYear?: number,
  breakupMonth?: number,
): Promise<{ compatibilityType: string; compatibilityDesc: string; myYearning: number; partnerYearning: number; reunionComment: string; summaryLine: string; theirFirstMoveComment: string; tensionAxis: string; relationshipLoop: string; brutalTruth: string; loveStyle: { my: string[]; their: string[] }; recommendLabel: string; recommendReasons: Array<{ title: string; body: string }> } | null> {
  const myPayload = compactBundleForPrompt(myBundle, 10, breakupYear, breakupMonth);
  const theirPayload = compactBundleForPrompt(theirBundle, 10, breakupYear, breakupMonth);

  const userBlock = `Data quality: ${dataLimited ? "LIMITED — some accounts are private or have few posts." : "Public posts available for both."}
MY_ACCOUNT:
${JSON.stringify(myPayload)}

THEIR_ACCOUNT:
${JSON.stringify(theirPayload)}`;

  const t0 = Date.now();
  console.log("[reunion-compatibility] Claude call START");

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: COMPATIBILITY_SYSTEM,
        messages: [{ role: "user", content: userBlock }],
      }),
      signal: abort.signal,
    });
  } catch (fetchErr: any) {
    clearTimeout(timer);
    console.error(`[reunion-compatibility] Claude fetch failed after ${Date.now() - t0}ms:`, fetchErr?.name, fetchErr?.message);
    return null;
  }
  clearTimeout(timer);
  console.log(`[reunion-compatibility] Claude response in ${Date.now() - t0}ms, status=${res.status}`);

  if (!res.ok) {
    console.error("Claude compatibility API error:", res.status);
    return null;
  }

  const json = await res.json();
  if (json?.stop_reason === "max_tokens") {
    console.error("[reunion-compatibility] Claude response truncated (stop_reason=max_tokens)");
    return null;
  }
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;
  console.log(`[reunion-compatibility] Claude text length: ${text.length} chars`);

  const parsed = parseClaudeJson(text, "reunion-compatibility") as Record<string, any> | null;
  if (!parsed) return null;

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
  const relationshipLoop = typeof parsed.relationshipLoop === "string" ? parsed.relationshipLoop.trim() : "";
  const brutalTruth = typeof parsed.brutalTruth === "string" ? parsed.brutalTruth.trim() : "";
  let loveStyle: { my: string[]; their: string[] } = { my: [], their: [] };
  try {
    const ls = typeof parsed.loveStyle === "string" ? JSON.parse(parsed.loveStyle) : parsed.loveStyle;
    if (ls && Array.isArray(ls.my) && Array.isArray(ls.their)) {
      loveStyle = { my: ls.my.filter((x: unknown) => typeof x === "string"), their: ls.their.filter((x: unknown) => typeof x === "string") };
    }
  } catch { /* loveStyle parse failed, use empty */ }
  const recommendLabel = typeof parsed.recommendLabel === "string" ? parsed.recommendLabel.trim() : "";
  let recommendReasons: Array<{ title: string; body: string }> = [];
  if (Array.isArray(parsed.recommendReasons)) {
    recommendReasons = parsed.recommendReasons
      .filter((r: any) => r && typeof r.title === "string" && typeof r.body === "string")
      .map((r: any) => ({ title: r.title.trim(), body: r.body.trim() }))
      .slice(0, 5);
  }
  if (!compatibilityType) return null;
  return { compatibilityType, compatibilityDesc, myYearning, partnerYearning, reunionComment, summaryLine, theirFirstMoveComment, tensionAxis, relationshipLoop, brutalTruth, loveStyle, recommendLabel, recommendReasons };
}

const PREMIUM_SYSTEM = `You are a relationship psychologist generating 8 premium deep-analysis cards for a reunion/post-breakup product.
You receive: two Instagram accounts, their AI persona analyses, compatibility analysis, AND the breakup date.
Output ONLY a single JSON object. No markdown, no code fences (\`\`\`), no explanation, no text before or after the JSON.

CRITICAL: 표면 데이터 나열이 아닌 심리 분석 기반으로 써야 한다. 8개 카드 간 내용 중복 절대 금지.

Schema:
{
  "waitUntil": string (Korean, 3~4문장. 상대의 현재 감정 처리 단계(부정/분노/거래/우울/수용)에서 언제 수용으로 넘어갈지, 피드 신호로 어떻게 판단하는지. 단순히 "몇 주 기다려라"가 아니라 "상대 캡션 톤이 이렇게 바뀌면 그때가 타이밍이다"는 식의 심리적 전환 신호 기준.),
  "toneReply": object ({
    "workingTones": array of 2 objects. 먹히는 톤 카테고리. 각: {"label": "짧은 톤 이름 (예: 정보성 톤, 관심사 매개 톤)", "characteristic": "이 톤이 어떤 형태/패턴인지 한 줄 설명. 구체 메시지 예시는 절대 넣지 말 것 (firstMessage 카드와 겹침 방지). 대신 '~한 형태', '~한 구조'처럼 메시지의 형식적 특징을 서술.", "why": "왜 먹히는지 한 줄. 상대 애착 유형과 소통 선호에 근거."},
    "blockingTones": array of 2 objects. 멀어지게 만드는 톤 카테고리. 같은 구조: {"label": "톤 이름", "characteristic": "이 톤의 형식적 특징 한 줄", "why": "왜 역효과인지 한 줄"}.
    원칙: tone 카드는 카테고리/원칙을 다루고, firstMessage 카드는 구체 메시지를 다룸. 두 카드의 콘텐츠가 절대 겹치지 않게. tone에서는 메시지 형식의 일반화된 패턴만 설명.
  }),
  "firstMessage": object ({
    "recommendedMessage": string (Korean, 20자 내외. 따옴표 없이 그대로 보낼 수 있는 단 하나의 첫 문장. 상대 최근 게시물 소재에서 추출한 구체적 소재 활용. 감정 표현이 아닌 경험/정보 질문 형태가 이상적.),
    "messageReasons": string[] (3개. 왜 이 메시지가 먹히는지 핵심 근거. 각 1줄. 상대 피드 데이터와 심리 분석에 근거.),
    "avoidMessages": string[] (3개. 같은 상황에서 절대 보내면 안 되는 함정 메시지. 실제 사람들이 자주 보내려는 것들. 짧게.)
  }),
  "replyStyle": string (Korean, 3~4문장. 상대의 소통 패턴에서 읽히는 심리적 선호. 짧은 답 = 처리 비용 최소화 욕구, 이모지만 = 감정 노출 회피, 읽씹 = 대화 자체가 부담. 각 패턴별 대응 전략.),
  "newPerson": string (Korean, 3~4문장. 새 사람 가능성을 심리적 맥락에서 분석. 리바운드인지 진짜 넘어간 건지. 이별 후 빠르게 새 사람이 보이면 회피형 특유의 감정 대체 패턴일 수 있음.),
  "misunderstanding": string (Korean, 3~4문장. 이 커플의 애착 유형 조합에서 가장 위험한 심리적 오해. 불안형이 회피형의 침묵을 "관심 없음"으로 읽는 것, 회피형이 불안형의 연타를 "집착"으로 읽는 것 등.),
  "theirTrace": string (Korean, 3~4문장. 상대가 흔적을 남기는 심리적 이유. 팔로우 유지 = 연결고리 완전 차단하기 싫은 무의식, 스토리만 봄 = 궁금하지만 직접 접근은 부담. 어떤 게 여지이고 어떤 게 습관인지 심리적으로 구분.),
  "myDestroy": string (Korean, 3~4문장. 내 애착 유형에서 나오는 자기파괴 패턴. 불안형이면: 확인 강박, 연타, 간접 메시지, 상대 반응 과잉 해석. 회피형이면: 먼저 연락하고 싶은데 자존심이 막음. 내 피드에서 읽히는 구체적 패턴.)
}
Rules:
- 말투: 친구가 팩폭하는 톤. 뻔한 위로 금지. 찔리게 쓸 것.
- 표면 데이터 나열 금지. 심리적 의미를 읽어낼 것.
- Do NOT infer gender. Use neutral wording.
- CRITICAL: Respond with ONLY valid JSON. 절대로 \`\`\`json 이나 \`\`\` 로 감싸지 마라.
- analysisMode가 "current_only"면 이별 전후 비교 표현 금지. 현재 피드 성향만으로 분석.
- analysisMode가 "before_after_comparison"이면 전후 변화 비교 가능하되 데이터 적으면 신중하게.`;

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
  const myPayload = compactBundleForPrompt(myBundle, 15, breakupYear, breakupMonth);
  const theirPayload = compactBundleForPrompt(theirBundle, 15, breakupYear, breakupMonth);

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

  const t0 = Date.now();
  console.log("[reunion-premium] Claude call START");

  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 120_000);

  let res: Response;
  try {
    res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: CLAUDE_MODEL,
        max_tokens: 8192,
        system: PREMIUM_SYSTEM,
        messages: [{ role: "user", content: userBlock }],
      }),
      signal: abort.signal,
    });
  } catch (fetchErr: any) {
    clearTimeout(timer);
    console.error(`[reunion-premium] Claude fetch failed after ${Date.now() - t0}ms:`, fetchErr?.name, fetchErr?.message);
    return null;
  }
  clearTimeout(timer);
  console.log(`[reunion-premium] Claude response in ${Date.now() - t0}ms, status=${res.status}`);

  if (!res.ok) {
    const t = await res.text();
    console.error("Claude premium API error:", res.status, t);
    return null;
  }

  const json = await res.json();
  if (json?.stop_reason === "max_tokens") {
    console.error("[reunion-premium] Claude response truncated (stop_reason=max_tokens)");
    return null;
  }
  const text = json?.content?.[0]?.text;
  if (!text || typeof text !== "string") return null;
  console.log(`[reunion-premium] Claude text length: ${text.length} chars`);

  const parsed = parseClaudeJson(text, "reunion-premium") as Record<string, any> | null;
  if (!parsed) return null;

  const stringKeys = ["waitUntil", "replyStyle", "newPerson", "misunderstanding", "theirTrace", "myDestroy"];
  const result: Record<string, any> = {};
  for (const k of stringKeys) {
    result[k] = typeof parsed[k] === "string" ? parsed[k].trim() : "";
  }

  // toneReply: structured object or fallback to string
  const tr = parsed.toneReply;
  if (tr && typeof tr === "object" && Array.isArray(tr.workingTones)) {
    const mapTone = (t: any) => ({
      label: typeof t?.label === "string" ? t.label.trim() : "",
      characteristic: typeof t?.characteristic === "string" ? t.characteristic.trim() : "",
      why: typeof t?.why === "string" ? t.why.trim() : "",
    });
    result.toneReply = JSON.stringify({
      workingTones: tr.workingTones.filter((t: any) => t?.label).map(mapTone).slice(0, 4),
      blockingTones: Array.isArray(tr.blockingTones) ? tr.blockingTones.filter((t: any) => t?.label).map(mapTone).slice(0, 4) : [],
    });
  } else {
    result.toneReply = typeof tr === "string" ? tr.trim() : "";
  }

  // firstMessage: structured object or fallback to string
  const fm = parsed.firstMessage;
  if (fm && typeof fm === "object" && typeof fm.recommendedMessage === "string") {
    result.firstMessage = JSON.stringify({
      recommendedMessage: fm.recommendedMessage.trim(),
      messageReasons: Array.isArray(fm.messageReasons) ? fm.messageReasons.filter((x: any) => typeof x === "string").slice(0, 5) : [],
      avoidMessages: Array.isArray(fm.avoidMessages) ? fm.avoidMessages.filter((x: any) => typeof x === "string").slice(0, 5) : [],
    });
  } else {
    result.firstMessage = typeof fm === "string" ? fm.trim() : "";
  }

  if (!result.waitUntil || !result.toneReply) return null;
  return result as Record<string, string>;
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
            relationshipLoop: cached.compatibility?.relationshipLoop || "",
            brutalTruth: cached.compatibility?.brutalTruth || "",
            loveStyle: cached.compatibility?.loveStyle || { my: [], their: [] },
            recommendLabel: cached.compatibility?.recommendLabel || "",
            recommendReasons: cached.compatibility?.recommendReasons || [],
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
          relationshipLoop: compatibility?.relationshipLoop || "",
          brutalTruth: compatibility?.brutalTruth || "",
          loveStyle: compatibility?.loveStyle || { my: [], their: [] },
          recommendLabel: compatibility?.recommendLabel || "",
          recommendReasons: compatibility?.recommendReasons || [],
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
