/**
 * normalized 스크랩 → 재회용 rich signals (0~100, 성별·단정 배제).
 */
import type { ReunionScrapeBundle, ReunionScrapePost } from "@/lib/reunionInstagram";

export type ReunionRichSignals = {
  profileMeta: {
    myIsPrivate: boolean;
    theirIsPrivate: boolean;
    breakupMonthsSince: number;
    dataConfidence: number;
  };
  mySignals: {
    activityTrend: "up" | "down" | "flat";
    emotionalResidueScore: number;
    indirectSignalScore: number;
    cleanupIncompleteScore: number;
    selfFocusScore: number;
    socialExpansionScore: number;
  };
  theirSignals: {
    activityTrend: "up" | "down" | "flat";
    opennessScore: number;
    avoidanceScore: number;
    defensiveShiftScore: number;
    emotionalResidueScore: number;
    newPersonHintScore: number;
    casualReentryOpenness: number;
    heavyContactResistance: number;
  };
  pairSignals: {
    rhythmGapScore: number;
    residueMismatchScore: number;
    tensionAxis: string;
    reopenConditionScore: number;
    misunderstandingRiskScore: number;
  };
  actionSignals: {
    waitFitScore: number;
    lightContactFitScore: number;
    heavyContactRiskScore: number;
    apologyRiskScore: number;
    definitionTalkRiskScore: number;
  };
};

const EMOTION_HINTS =
  /그리운|보고싶|미안|슬프|울|아프|힘들|외로|헤어|이별|miss\s|love|♡|💔|눈물|쓸쓸|empty|허전/i;
const REL_HINTS = /연애|사랑|우리|너와|함께|커플|기념|애인|남친|여친|소개|듀오/i;
const CLEAN_HINTS = /새로운|시작|정리|앞으로|나만|혼자\s*잘|독립|흔적\s*지/i;
const SELF_HINTS = /나는|내가|내\s*인생|성장|루틴|운동|일상|직장|공부|me\s/i;

function parseTs(p: ReunionScrapePost): number {
  if (!p.timestamp) return NaN;
  const n = typeof p.timestamp === "number" ? p.timestamp * 1000 : Date.parse(String(p.timestamp));
  return Number.isFinite(n) ? n : NaN;
}

function postingCadenceScore(posts: ReunionScrapePost[]): { trend: "up" | "down" | "flat"; burst: number } {
  const withT = posts
    .map((p) => ({ p, t: parseTs(p) }))
    .filter((x) => Number.isFinite(x.t))
    .sort((a, b) => b.t - a.t);
  if (withT.length < 3) return { trend: "flat", burst: 0 };

  const now = Date.now();
  const day = 86400000;
  const recent = withT.filter((x) => now - x.t < 45 * day);
  const older = withT.filter((x) => now - x.t >= 45 * day && now - x.t < 120 * day);
  const r = recent.length / Math.max(1, 45 / 14);
  const o = older.length / Math.max(1, 45 / 14);
  let trend: "up" | "down" | "flat" = "flat";
  if (r > o * 1.35) trend = "up";
  else if (o > r * 1.35 && recent.length > 0) trend = "down";
  else if (recent.length >= 6 && withT.length >= 8) trend = "up";

  const gaps: number[] = [];
  for (let i = 0; i < withT.length - 1; i++) {
    gaps.push(withT[i].t - withT[i + 1].t);
  }
  const avgGap = gaps.length ? gaps.reduce((a, b) => a + b, 0) / gaps.length : day;
  const burst = avgGap < 2.5 * day && withT.length >= 5 ? 1 : 0;
  return { trend, burst };
}

function nightHeavyRatio(posts: ReunionScrapePost[]): number {
  let n = 0;
  let c = 0;
  for (const p of posts) {
    const t = parseTs(p);
    if (!Number.isFinite(t)) continue;
    c++;
    const h = new Date(t).getUTCHours();
    if (h >= 13 && h <= 20) n++;
  }
  return c ? n / c : 0;
}

function captionEmotionScore(posts: ReunionScrapePost[]): number {
  let hit = 0;
  let total = 0;
  for (const p of posts) {
    const cap = (p.caption || "").slice(0, 500);
    if (!cap.trim()) continue;
    total++;
    if (EMOTION_HINTS.test(cap)) hit++;
  }
  if (!total) return 22;
  return Math.round(28 + Math.min(72, (hit / total) * 80));
}

function indirectScore(posts: ReunionScrapePost[]): number {
  let m = 0;
  let t = 0;
  for (const p of posts) {
    if (!p.caption?.trim()) continue;
    t++;
    if (/노래|가사|lyrics|무드|mood|\.{3,}|…/.test(p.caption)) m++;
  }
  if (!t) return 30;
  return Math.round(25 + (m / t) * 55);
}

function cleanupIncomplete(bio: string, posts: ReunionScrapePost[]): number {
  let s = bio.match(REL_HINTS) ? 28 : 12;
  const caps = posts.map((p) => p.caption).join(" ");
  const hits = (caps.match(CLEAN_HINTS) || []).length;
  s += Math.min(40, hits * 8);
  if (posts.length > 0 && posts.length < 4) s += 12;
  return Math.min(100, Math.round(s));
}

function selfFocus(bio: string, posts: ReunionScrapePost[]): number {
  let hit = bio.match(SELF_HINTS) ? 1 : 0;
  for (const p of posts) {
    if (SELF_HINTS.test(p.caption || "")) hit++;
  }
  return Math.min(100, Math.round(22 + hit * 9));
}

function socialExpansion(bio: string, posts: ReunionScrapePost[], followers: number, follows: number): number {
  const ratio = follows > 0 ? followers / follows : followers / 100;
  let x = Math.min(40, Math.log10(Math.max(10, followers)) * 12);
  if (ratio > 2.5) x += 15;
  const loc = posts.filter((p) => p.locationName).length;
  x += Math.min(25, loc * 4);
  if (REL_HINTS.test(bio)) x -= 8;
  return Math.min(100, Math.round(x));
}

function theirOpennessAvoidance(
  bio: string,
  posts: ReunionScrapePost[],
  trend: "up" | "down" | "flat",
): { open: number; avoid: number; def: number; residue: number; newHint: number } {
  const residue = captionEmotionScore(posts);
  const relInBio = REL_HINTS.test(bio) ? 22 : 0;
  let open = 38 + relInBio;
  if (trend === "up") open += 14;
  if (trend === "down") open -= 10;

  let avoid = 28;
  if (trend === "down" && posts.length >= 4) avoid += 18;
  if (!REL_HINTS.test(bio) && posts.every((p) => !REL_HINTS.test(p.caption || ""))) avoid += 12;

  const def = Math.min(
    100,
    Math.round(30 + nightHeavyRatio(posts) * 28 + (avoid / 100) * 35),
  );

  const coupleTags = posts.reduce((a, p) => a + (p.hashtags || []).filter((h) => /데이트|커플|love|wedding/i.test(h)).length, 0);
  const newHint = Math.min(88, Math.round(18 + coupleTags * 10 + (trend === "up" ? 8 : 0)));

  return {
    open: Math.min(100, Math.max(8, Math.round(open))),
    avoid: Math.min(100, Math.max(10, Math.round(avoid))),
    def: Math.min(100, Math.max(12, def)),
    residue: Math.min(100, Math.max(10, residue)),
    newHint: Math.min(100, Math.max(5, newHint)),
  };
}

function casualReentry(avoid: number, def: number, open: number): number {
  return Math.min(100, Math.max(5, Math.round(open * 0.45 + (100 - avoid) * 0.35 + (100 - def) * 0.2)));
}

function heavyResistance(avoid: number, def: number): number {
  return Math.min(100, Math.round(avoid * 0.55 + def * 0.45));
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function buildReunionRichSignals(
  my: ReunionScrapeBundle,
  their: ReunionScrapeBundle,
  breakupMonthsSince: number,
  opts?: { myPrivatePenalty?: boolean; theirPrivatePenalty?: boolean },
): ReunionRichSignals {
  const myP = my.profile;
  const thP = their.profile;
  const myPosts = my.posts || [];
  const thPosts = their.posts || [];

  let confidence = 1;
  if (opts?.myPrivatePenalty) confidence *= 0.72;
  if (opts?.theirPrivatePenalty) confidence *= 0.72;
  if (myPosts.length < 4) confidence *= 0.88;
  if (thPosts.length < 4) confidence *= 0.88;

  const myCad = postingCadenceScore(myPosts);
  const thCad = postingCadenceScore(thPosts);

  const myResidue = captionEmotionScore(myPosts);
  const myIndirect = indirectScore(myPosts);
  const myCleanup = cleanupIncomplete(myP.biography, myPosts);
  const mySelf = selfFocus(myP.biography, myPosts);
  const mySocial = socialExpansion(myP.biography, myPosts, myP.followersCount, myP.followsCount);

  const th = theirOpennessAvoidance(thP.biography, thPosts, thCad.trend);
  const casual = casualReentry(th.avoid, th.def, th.open);
  const heavyR = heavyResistance(th.avoid, th.def);

  const rhythmGap = clamp(Math.abs(myCad.trend === thCad.trend ? 15 : 48) + (myCad.burst + thCad.burst) * 12);
  const residueMismatch = clamp(Math.abs(myResidue - th.residue) * 0.9 + 12);

  let tensionAxis = "확인·잔상을 남기는 쪽과, 부담을 줄이려는 쪽이 동시에 보이는 축";
  if (th.avoid > 68 && myResidue > 62) {
    tensionAxis = "네 쪽 잔상 신호는 남아 있는데, 상대 피드는 거리 두기 쪽으로 읽히는 축";
  } else if (th.open > 62 && heavyR > 60) {
    tensionAxis = "열린 듯 보여도 무거운 접점에는 바로 방어가 올라가기 쉬운 축";
  }

  const reopenC = clamp(
    th.open * 0.35 + casual * 0.3 + (100 - th.avoid) * 0.2 + (100 - heavyR) * 0.15,
  );
  const misRisk = clamp(th.def * 0.4 + residueMismatch * 0.35 + (100 - confidence * 100) * 0.25);

  const waitFit = clamp(
    th.avoid * 0.35 + heavyR * 0.3 + (breakupMonthsSince <= 1 ? 18 : 0) + myResidue * 0.15,
  );
  const lightContact = clamp(
    casual * 0.4 + (100 - heavyR) * 0.25 + th.open * 0.2 + (100 - th.newHint) * 0.15,
  );
  const heavyRisk = clamp(heavyR * 0.45 + th.def * 0.35 + apologyRiskFrom(myPosts) * 0.2);
  const apologyR = apologyRiskFrom(myPosts);
  const defTalkR = clamp(th.def * 0.5 + heavyR * 0.35 + 10);

  const applyC = (v: number) => clamp(v * confidence + (1 - confidence) * 42);

  return {
    profileMeta: {
      myIsPrivate: myP.isPrivate,
      theirIsPrivate: thP.isPrivate,
      breakupMonthsSince,
      dataConfidence: confidence,
    },
    mySignals: {
      activityTrend: myCad.trend,
      emotionalResidueScore: applyC(myResidue),
      indirectSignalScore: applyC(myIndirect),
      cleanupIncompleteScore: applyC(myCleanup),
      selfFocusScore: applyC(mySelf),
      socialExpansionScore: applyC(mySocial),
    },
    theirSignals: {
      activityTrend: thCad.trend,
      opennessScore: applyC(th.open),
      avoidanceScore: applyC(th.avoid),
      defensiveShiftScore: applyC(th.def),
      emotionalResidueScore: applyC(th.residue),
      newPersonHintScore: applyC(th.newHint),
      casualReentryOpenness: applyC(casual),
      heavyContactResistance: applyC(heavyR),
    },
    pairSignals: {
      rhythmGapScore: applyC(rhythmGap),
      residueMismatchScore: applyC(residueMismatch),
      tensionAxis,
      reopenConditionScore: applyC(reopenC),
      misunderstandingRiskScore: applyC(misRisk),
    },
    actionSignals: {
      waitFitScore: applyC(waitFit),
      lightContactFitScore: applyC(lightContact),
      heavyContactRiskScore: applyC(heavyRisk),
      apologyRiskScore: applyC(apologyR),
      definitionTalkRiskScore: applyC(defTalkR),
    },
  };
}

function apologyRiskFrom(posts: ReunionScrapePost[]): number {
  let n = 0;
  for (const p of posts) {
    if (/미안|사과|잘못|후회/i.test(p.caption || "")) n++;
  }
  return Math.min(100, 28 + n * 14);
}

function hashFallbackKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function triFallback(h: number, salt: number): 0 | 1 | 2 {
  const x = (h ^ salt * 2654435761) >>> 0;
  return (x % 3) as 0 | 1 | 2;
}

/** 스크랩 없을 때 해시 기반 rich 시그널 (상대 먼저 연락 % 등 UI용) */
export function buildFallbackReunionRichSignals(
  myId: string,
  theirId: string,
  breakupMonthsSince: number,
): ReunionRichSignals {
  const h0 = hashFallbackKey(`${myId}|${theirId}`);
  const h1 = hashFallbackKey(`${theirId}|${myId}|${breakupMonthsSince}`);
  const band = (h: number, salt: number, lo: number, hi: number) => {
    const t = triFallback(h, salt);
    const mid = lo + ((hi - lo) * t) / 2;
    return Math.min(hi, Math.max(lo, Math.round(mid + (breakupMonthsSince % 5))));
  };
  const tr = (h: number, salt: number): "up" | "down" | "flat" => {
    const x = triFallback(h, salt);
    if (x === 0) return "up";
    if (x === 1) return "down";
    return "flat";
  };

  const open = band(h1, 1, 32, 78);
  const avoid = band(h1, 2, 28, 82);
  const casual = band(h1, 3, 28, 76);
  const residue = band(h1, 4, 25, 80);
  const heavyR = Math.min(95, Math.round(avoid * 0.52 + band(h1, 5, 22, 72) * 0.48));

  return {
    profileMeta: {
      myIsPrivate: false,
      theirIsPrivate: false,
      breakupMonthsSince,
      dataConfidence: 0.58,
    },
    mySignals: {
      activityTrend: tr(h0, 10),
      emotionalResidueScore: band(h0, 11, 30, 82),
      indirectSignalScore: band(h0, 12, 25, 78),
      cleanupIncompleteScore: band(h0, 13, 22, 85),
      selfFocusScore: band(h0, 14, 25, 80),
      socialExpansionScore: band(h0, 15, 22, 88),
    },
    theirSignals: {
      activityTrend: tr(h1, 20),
      opennessScore: open,
      avoidanceScore: avoid,
      defensiveShiftScore: band(h1, 21, 25, 82),
      emotionalResidueScore: residue,
      newPersonHintScore: band(h1, 22, 12, 70),
      casualReentryOpenness: casual,
      heavyContactResistance: heavyR,
    },
    pairSignals: {
      rhythmGapScore: band(h0, 30, 20, 78),
      residueMismatchScore: band(h0, 31, 18, 80),
      tensionAxis: "확인 욕구 vs 거리 두기",
      reopenConditionScore: band(h1, 32, 22, 85),
      misunderstandingRiskScore: band(h1, 33, 20, 88),
    },
    actionSignals: {
      waitFitScore: band(h1, 40, 28, 88),
      lightContactFitScore: band(h1, 41, 25, 85),
      heavyContactRiskScore: band(h1, 42, 30, 92),
      apologyRiskScore: band(h0, 43, 22, 80),
      definitionTalkRiskScore: band(h1, 44, 28, 88),
    },
  };
}
