/** Static copy + deterministic dummy metrics for /reunion (no API). */

export const reunionPremiumBlurCards = [
  {
    title: "상대의 진짜 마음 온도 맵",
    teaser: "스토리 반응 속도, 팔로우 변화, 캡션 톤까지 교차 분석한 관계 온도 분포.",
  },
  {
    title: "재회 시나리오 3종 시뮬레이션",
    teaser: "지금 연락 / 한 달 뒤 / 완전 무연락 각각에서 예상되는 상대 반응 곡선.",
  },
  {
    title: "연락 금지 타이밍 vs 골든 타임",
    teaser: "지금 DM이 역효과일 수 있는 구간과, 가장 덜 방어되는 창구 시간대.",
  },
] as const;

export type ReunionDummyMetrics = {
  score: number;
  temperatureLabel: string;
  temperatureDetail: string;
  defensiveLabel: string;
  defensiveDetail: string;
  contactLabel: string;
  contactDetail: string;
};

const temperatureOptions = [
  {
    label: "따뜻한 불균형",
    detail: "한쪽은 여전히 여운이 남아 있고, 다른 한쪽은 거리를 두려는 기색이 섞여 있어요.",
  },
  {
    label: "미묘한 온도 차",
    detail: "겉으로는 평온해 보이지만, 반응 속도와 노출 방식에서 미세한 온도 차가 감지돼요.",
  },
  {
    label: "얇게 언 빙판",
    detail: "큰 갈등은 없어 보이지만, 방어적 거리감이 얇게 깔려 있는 상태에 가깝습니다.",
  },
] as const;

const defensiveOptions = [
  {
    label: "상대가 더 방어적일 가능성",
    detail: "회피·짧은 답·노출 최소화 패턴이 상대 쪽에 더 많이 쌓일 수 있는 구간이에요.",
  },
  {
    label: "나의 방어가 더 두꺼운 편",
    detail: "감정을 먼저 숨기거나 확인 질문을 미루는 쪽이 본인에게 더 맞을 수 있어요.",
  },
  {
    label: "둘 다 방어적, 타이밍만 다른 상태",
    detail: "누가 더 맞다기보다, 서로 다른 방식으로 거리를 유지 중일 확률이 높아요.",
  },
] as const;

const contactOptions = [
  {
    label: "지금 연락하면 여지는 있음",
    detail: "다만 첫 문장과 채널(스토리/DM) 선택이 결과를 크게 가를 수 있어요.",
  },
  {
    label: "바로 연락보다 신호 정리가 먼저",
    detail: "짧은 관찰 구간을 두고 접촉하면 역효과 위험이 줄어드는 편이에요.",
  },
  {
    label: "충동 연락은 비추, 창구만 열어두기",
    detail: "직접적인 대화보다 부담 낮은 접점에서 반응을 먼저 테스트하는 편이 안전해요.",
  },
] as const;

function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

export function getReunionDummyMetrics(myId: string, theirId: string, lastContact: string): ReunionDummyMetrics {
  const h = hashKey(`${myId}|${theirId}|${lastContact}`);
  const score = 38 + (h % 45);
  const t = temperatureOptions[h % temperatureOptions.length];
  const d = defensiveOptions[(h >> 3) % defensiveOptions.length];
  const c = contactOptions[(h >> 6) % contactOptions.length];
  return {
    score,
    temperatureLabel: t.label,
    temperatureDetail: t.detail,
    defensiveLabel: d.label,
    defensiveDetail: d.detail,
    contactLabel: c.label,
    contactDetail: c.detail,
  };
}
