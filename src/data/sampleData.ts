export interface VibeResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  detailParagraph: string;
  vibeCodes: string[];
  emoji: string;
  gradientClass: string;
  stats: { label: string; value: string }[];
}

export const sampleResults: VibeResult[] = [
  {
    id: "dreamy",
    title: "몽환 낭만",
    subtitle: "Dreamy Romantic",
    description:
      "부드러운 색감과 감성적인 분위기를 선호하는 스타일입니다.\n일상적인 순간도 영화 같은 장면으로 만드는 감각을 가지고 있습니다.",
    detailParagraph:
      "당신의 피드에는 따뜻한 조명 아래 흐릿하게 번지는 빛과, 고요한 오후의 정적이 담겨 있어요. 어디를 가든 그 장소만의 분위기를 포착하는 눈을 가졌고, 사소한 일상도 한 편의 단편영화처럼 기록하는 사람. 당신이 추구하는 건 화려함이 아니라, 잔잔하지만 깊은 울림을 주는 아름다움이에요. 흐린 하늘도, 빈 카페의 창가도 당신의 렌즈를 통하면 누군가의 마음을 두드리는 한 장면이 됩니다.",
    vibeCodes: ["dreamy", "soft", "romantic"],
    emoji: "🌙",
    gradientClass: "from-[hsl(340,40%,88%)] to-[hsl(280,30%,90%)]",
    stats: [
      { label: "감성 지수", value: "92%" },
      { label: "색감 톤", value: "웜 파스텔" },
      { label: "무드", value: "시네마틱" },
    ],
  },
  {
    id: "innocent",
    title: "청순 첫사랑",
    subtitle: "Pure First Love",
    description:
      "깨끗하고 자연스러운 이미지가 돋보이는 스타일입니다.\n꾸밈없는 아름다움 속에서 진정한 매력이 빛나는 타입이에요.",
    detailParagraph:
      "당신의 피드를 스크롤하면 마치 봄날 아침의 공기를 마시는 것 같은 느낌이 들어요. 화려한 필터나 과한 연출 없이도 충분히 아름다운 순간들을 담고 있죠. 햇살이 머무는 자리, 바람에 흔들리는 꽃잎, 수줍게 웃는 표정 — 당신은 있는 그대로의 모습에서 가장 빛나는 사람이에요. 사람들은 당신의 피드에서 잃어버린 설렘을 다시 찾게 됩니다. 첫사랑의 기억처럼, 선명하고도 따뜻한 감성의 소유자.",
    vibeCodes: ["pure", "natural", "fresh"],
    emoji: "🌸",
    gradientClass: "from-[hsl(350,50%,92%)] to-[hsl(20,60%,92%)]",
    stats: [
      { label: "감성 지수", value: "88%" },
      { label: "색감 톤", value: "내추럴" },
      { label: "무드", value: "청량" },
    ],
  },
  {
    id: "cozy",
    title: "폭닥 포근",
    subtitle: "Warm & Cozy",
    description:
      "따뜻하고 포근한 분위기가 피드 전체에 가득한 스타일입니다.\n사람들에게 편안함과 안정감을 주는 특별한 매력을 지니고 있어요.",
    detailParagraph:
      "당신의 피드는 마치 겨울밤 이불 속에서 따뜻한 코코아를 마시는 것 같은 안도감을 줘요. 좋아하는 카페의 창가 자리, 잘 개어진 린넨, 김이 모락모락 나는 홈쿠킹 — 당신이 담는 모든 것에는 '집'이라는 단어가 가진 포근함이 깃들어 있어요. 특별하지 않은 일상을 가장 특별하게 기록하는 재능. 당신의 피드를 보면 누구든 마음이 말랑해지고, 조금은 쉬어가도 괜찮다는 위안을 얻게 됩니다.",
    vibeCodes: ["warm", "cozy", "homey"],
    emoji: "☕",
    gradientClass: "from-[hsl(30,50%,90%)] to-[hsl(20,40%,88%)]",
    stats: [
      { label: "감성 지수", value: "95%" },
      { label: "색감 톤", value: "어스 톤" },
      { label: "무드", value: "힐링" },
    ],
  },
  {
    id: "hipster",
    title: "힙스터 걸크러쉬",
    subtitle: "Hipster Girl Crush",
    description:
      "트렌디하면서도 자신만의 스타일이 확고한 타입입니다.\n남들과 다른 시선으로 세상을 바라보는 독보적인 감각의 소유자예요.",
    detailParagraph:
      "당신의 피드에는 '대세'를 따르기보다 '나다움'을 만들어가는 사람의 자신감이 느껴져요. 남들이 지나치는 골목의 그래피티, 빈티지 숍의 한 켤레, 아무도 모르는 루프탑에서의 석양 — 당신은 자신만의 필터로 세상을 재해석하는 사람이에요. 쿨해 보이지만 실은 누구보다 섬세하고, 무심한 듯하지만 모든 디테일에 진심인 당신. 사람들은 당신의 피드에서 '이렇게 살고 싶다'는 영감을 얻어갑니다.",
    vibeCodes: ["edgy", "trendy", "bold"],
    emoji: "🖤",
    gradientClass: "from-[hsl(260,20%,90%)] to-[hsl(220,20%,88%)]",
    stats: [
      { label: "감성 지수", value: "78%" },
      { label: "색감 톤", value: "뉴트럴" },
      { label: "무드", value: "쿨시크" },
    ],
  },
  {
    id: "cityChic",
    title: "도시 시크",
    subtitle: "City Chic",
    description:
      "세련되고 모던한 감성이 피드 곳곳에 묻어나는 스타일입니다.\n도시의 리듬을 자연스럽게 담아내는 감각적인 타입이에요.",
    detailParagraph:
      "당신의 피드는 도시의 스카이라인처럼 날카롭고 아름다워요. 깔끔한 라인의 건축물, 모노톤 코디, 미니멀한 테이블 세팅 — 불필요한 것을 걷어낸 자리에서 피어나는 세련됨이 당신의 무기예요. 절제할 줄 아는 사람만이 가질 수 있는 우아함. 당신은 적게 보여주면서도 강렬한 인상을 남기는 법을 본능적으로 알고 있어요. 바쁜 도시의 소음 속에서도 자신만의 고요한 리듬을 잃지 않는, 진짜 시크한 사람.",
    vibeCodes: ["minimal", "chic", "urban"],
    emoji: "🏙️",
    gradientClass: "from-[hsl(210,15%,92%)] to-[hsl(200,20%,88%)]",
    stats: [
      { label: "감성 지수", value: "72%" },
      { label: "색감 톤", value: "쿨 그레이" },
      { label: "무드", value: "미니멀" },
    ],
  },
];

export const premiumFeatures = [
  { title: "실제미", description: "실제로 주변 사람들이 느끼는 당신의 이미지", emoji: "🪞" },
  { title: "도달가능미", description: "조금만 노력하면 가질 수 있는 분위기", emoji: "✨" },
  { title: "소화 어려운 추구미", description: "현재 스타일과 거리가 먼 분위기 분석", emoji: "🚧" },
  { title: "추구미 발전 전략", description: "추구미에 더 가까워지는 구체적 방법 제안", emoji: "📈" },
  { title: "나와 같은 추구미 연예인", description: "비슷한 vibe를 가진 셀럽 매칭 분석", emoji: "🌟" },
];

export function getRandomResult(id: string): VibeResult {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % sampleResults.length;
  }
  return sampleResults[Math.abs(hash) % sampleResults.length];
}
