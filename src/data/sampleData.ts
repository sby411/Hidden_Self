export interface VibeResult {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  vibeCodes: string[];
  emoji: string;
}

export const sampleResults: VibeResult[] = [
  {
    id: "dreamy",
    title: "몽환 낭만",
    subtitle: "Dreamy Romantic",
    description:
      "부드러운 색감과 감성적인 이미지가 많습니다.\n일상 속에서 영화 같은 분위기를 추구하는 타입입니다.\n따뜻한 조명, 흐린 하늘, 그리고 고요한 순간을 사랑하는 당신.",
    vibeCodes: ["dreamy", "soft", "romantic"],
    emoji: "🌙",
  },
  {
    id: "innocent",
    title: "청순 첫사랑",
    subtitle: "Pure First Love",
    description:
      "깨끗하고 자연스러운 이미지가 돋보입니다.\n꾸밈없는 아름다움 속에서 진정한 매력이 빛나는 타입입니다.\n봄날의 산들바람 같은, 편안하면서도 설레는 분위기를 가지고 있어요.",
    vibeCodes: ["pure", "natural", "fresh"],
    emoji: "🌸",
  },
  {
    id: "cozy",
    title: "폭닥 포근",
    subtitle: "Warm & Cozy",
    description:
      "따뜻하고 포근한 분위기가 피드 전체에 가득합니다.\n사람들에게 편안함과 안정감을 주는 특별한 매력을 지닌 타입입니다.\n카페 라떼 같은 온기가 느껴지는 감성의 소유자예요.",
    vibeCodes: ["warm", "cozy", "homey"],
    emoji: "☕",
  },
  {
    id: "hipster",
    title: "힙스터 걸크러쉬",
    subtitle: "Hipster Girl Crush",
    description:
      "트렌디하면서도 자신만의 스타일이 확고합니다.\n남들과 다른 시선으로 세상을 바라보는 독보적인 감각의 소유자입니다.\n쿨하지만 속은 따뜻한, 반전 매력이 넘치는 타입이에요.",
    vibeCodes: ["edgy", "trendy", "bold"],
    emoji: "🖤",
  },
  {
    id: "cityChic",
    title: "도시 시크",
    subtitle: "City Chic",
    description:
      "세련되고 모던한 감성이 피드 곳곳에 묻어납니다.\n도시의 리듬을 자연스럽게 담아내는 감각적인 타입입니다.\n미니멀하지만 강렬한, 절제된 아름다움을 추구해요.",
    vibeCodes: ["minimal", "chic", "urban"],
    emoji: "🏙️",
  },
];

export const premiumFeatures = [
  { title: "실제미", description: "실제로 주변에서 느끼는 당신의 이미지", locked: true },
  { title: "도달가능미", description: "노력하면 가질 수 있는 분위기", locked: true },
  { title: "소화 어려운 추구미", description: "현재 스타일과 거리가 먼 분위기", locked: true },
  { title: "추구미 발전 전략", description: "추구미에 더 가까워지는 구체적 방법", locked: true },
  { title: "나와 같은 추구미인 연예인", description: "비슷한 vibe를 가진 셀럽 분석", locked: true },
];

export function getRandomResult(id: string): VibeResult {
  // Simple hash from id string to pick a result
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % sampleResults.length;
  }
  return sampleResults[Math.abs(hash) % sampleResults.length];
}
