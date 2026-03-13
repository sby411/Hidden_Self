// Premium deep analysis data generators
// All functions use deterministic hashing based on user ID

import { maleTypes, type MaleType } from "./sampleData";

function hash(id: string, seed: number): number {
  let h = seed;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 100000;
  return Math.abs(h);
}

// ============================================================
// 1. 연애 진행 시뮬레이션
// ============================================================
export interface DatingSimulation {
  stages: { step: number; title: string; description: string; emoji: string }[];
  entryPeriod: string;
  developSpeed: string;
}

const stageTemplates = [
  [
    { title: "관심 감지", description: "처음 만난 자리에서 당신의 분위기와 말투에 묘한 끌림을 느낍니다. 자꾸 눈길이 가고, 대화가 기억에 남습니다.", emoji: "👀" },
    { title: "가치관 탐색", description: "만남을 반복하며 당신의 생각, 취향, 라이프스타일을 자연스럽게 탐색합니다. 자신과 맞는 사람인지 무의식적으로 판단합니다.", emoji: "🔍" },
    { title: "감정 투자", description: "확신이 생기면 먼저 연락하고, 약속을 잡고, 작은 배려를 시작합니다. 감정을 조금씩 드러내기 시작합니다.", emoji: "💭" },
    { title: "관계 결정", description: "충분한 교감 후 더 깊은 관계로 나아가고 싶다는 확신을 갖고 본격적으로 마음을 표현합니다.", emoji: "💕" },
  ],
  [
    { title: "첫인상 각인", description: "당신을 처음 본 순간 강렬한 인상을 받습니다. 외모보다 전체적인 분위기와 에너지에 끌립니다.", emoji: "⚡" },
    { title: "정보 수집", description: "주변 사람들을 통해 당신에 대해 알아가기 시작합니다. 우연한 만남을 만들려고 노력합니다.", emoji: "📋" },
    { title: "접근 시도", description: "자연스러운 대화나 공통 모임을 통해 가까워지려 합니다. 유머와 배려로 좋은 인상을 남기려 합니다.", emoji: "🎯" },
    { title: "감정 폭발", description: "교감이 시작되면 감정이 빠르게 깊어지며, 솔직하게 마음을 표현합니다.", emoji: "🔥" },
  ],
  [
    { title: "무의식적 관심", description: "자신도 모르게 당신이 있는 자리를 의식하고, 당신의 말에 더 귀 기울이게 됩니다.", emoji: "🌀" },
    { title: "내적 갈등", description: "분명히 끌리는데 다가가야 할지 망설입니다. 거절이 두렵지만 포기할 수도 없습니다.", emoji: "💫" },
    { title: "결심과 행동", description: "더 이상 참지 못하고 용기를 내어 먼저 연락하거나 만남을 제안합니다.", emoji: "✨" },
    { title: "올인 모드", description: "관계가 시작되면 당신에게 완전히 집중하며, 진심 어린 애정을 쏟아냅니다.", emoji: "❤️‍🔥" },
  ],
];

const entryPeriods = ["약 2~3주 (빠른 편)", "약 1~2개월 (보통)", "약 3~6개월 (느린 편)", "약 1~3주 (매우 빠름)", "약 2~4개월 (신중한 편)"];
const developSpeeds = [
  "초반에 폭발적으로 빠르고, 이후 안정화됩니다.",
  "천천히 시작하지만 한번 불붙으면 급격히 진행됩니다.",
  "일정한 속도로 꾸준히 깊어지는 패턴입니다.",
  "밀당 패턴으로 빨라졌다 느려졌다를 반복합니다.",
  "매우 빠른 속도로 진행되며 초반 텐션이 높습니다.",
];

export function getDatingSimulation(id: string): DatingSimulation {
  const h = hash(id, 43);
  return {
    stages: stageTemplates[h % stageTemplates.length].map((s, i) => ({ ...s, step: i + 1 })),
    entryPeriod: entryPeriods[h % entryPeriods.length],
    developSpeed: developSpeeds[(h * 3) % developSpeeds.length],
  };
}

// ============================================================
// 2. 관심 있을 때 / 없을 때 행동 패턴
// ============================================================
export interface BehaviorPattern {
  interested: string[];
  notInterested: string[];
}

const behaviorSets: BehaviorPattern[] = [
  {
    interested: ["스토리를 올리자마자 가장 먼저 확인", "대화할 때 이모지와 리액션이 넘침", "사소한 일정도 기억하고 챙김", "당신의 관심사에 갑자기 관심을 보임", "읽자마자 답장, 가끔은 전화도 먼저"],
    notInterested: ["답장이 짧고 건조함 (ㅇㅇ, ㅋㅋ 수준)", "약속을 먼저 잡지 않음", "읽씹 빈도가 높아짐", "대화 주제를 확장하지 않음", "다른 사람과 있는 것을 자주 언급"],
  },
  {
    interested: ["DM을 먼저 보내며 대화를 이어감", "당신이 갔던 장소에 관심을 보임", "공통 관심사를 찾으려 노력함", "SNS에 당신 관련 흔적을 남김", "만남 후 빠르게 후속 연락"],
    notInterested: ["연락 빈도가 눈에 띄게 줄어듦", "만남 약속을 계속 미룸", "대화가 사무적으로 변함", "당신의 게시물에 반응이 없어짐", "다른 사람 이야기를 자주 함"],
  },
  {
    interested: ["당신의 게시물에 좋아요와 댓글 연타", "대화 중 미래 이야기를 자연스럽게 꺼냄", "사진이나 밈을 자주 공유함", "당신의 취향에 맞춘 추천을 해옴", "혼자 있을 때 먼저 연락"],
    notInterested: ["답장 시간이 점점 길어짐", "이유 없이 바쁘다는 말이 잦아짐", "감정적 대화를 회피함", "만남 후 연락이 뜸해짐", "약속 당일 취소가 늘어남"],
  },
];

export function getBehaviorPattern(id: string): BehaviorPattern {
  const h = hash(id, 67);
  return behaviorSets[h % behaviorSets.length];
}

// ============================================================
// 3. 연애 궁합 분석
// ============================================================
export interface CompatibilityScore {
  label: string;
  score: number;
  description: string;
  emoji: string;
}

export function getCompatibilityScores(id: string): CompatibilityScore[] {
  const h = hash(id, 89);
  const descs = [
    ["서로의 매력을 강하게 인식하며 끌림이 높습니다.", "초반 끌림은 보통이지만 알수록 매력이 깊어집니다.", "첫 만남부터 강한 화학반응이 일어나는 조합입니다."],
    ["연애 템포가 비슷해 자연스럽게 맞아갑니다.", "서로 다른 속도로 갈등이 생길 수 있지만 조율 가능합니다.", "한쪽이 빠르고 한쪽이 느려 밸런스 조율이 필요합니다."],
    ["깊은 감정적 교류가 가능한 궁합입니다.", "감정 표현 방식이 달라 노력이 필요합니다.", "서로의 감정을 읽는 능력이 뛰어난 조합입니다."],
    ["장기적으로 안정적인 관계를 유지할 수 있습니다.", "초반은 불안정하지만 시간이 지나면 안정됩니다.", "서로 성장을 자극하는 관계가 됩니다."],
  ];
  return [
    { label: "매력도 궁합", score: 55 + (h % 40), description: descs[0][h % 3], emoji: "💘" },
    { label: "연애 속도 궁합", score: 45 + ((h * 3) % 45), description: descs[1][(h * 2) % 3], emoji: "⏱️" },
    { label: "감정 교류 궁합", score: 50 + ((h * 7) % 42), description: descs[2][(h * 5) % 3], emoji: "💬" },
    { label: "장기 안정성 궁합", score: 40 + ((h * 11) % 50), description: descs[3][(h * 4) % 3], emoji: "🏠" },
  ];
}

// ============================================================
// 4. 연애 성공 전략
// ============================================================
export interface DatingStrategy {
  dos: string[];
  donts: string[];
}

const strategySets: DatingStrategy[] = [
  {
    dos: ["초반에 감정 압박 대신 자연스러운 대화 유지", "공통 관심사를 찾아 대화 주제 확장", "자기관리 라이프스타일을 자연스럽게 공유", "연락 템포를 상대에 맞춰 유연하게 조절", "함께하는 특별한 경험을 만들어 기억에 남기기"],
    donts: ["감정 확인 요구를 반복하지 않기", "답장 속도에 예민하게 반응하지 않기", "관계 정의를 너무 빨리 요구하지 않기", "과거 연애 이야기를 깊이 캐묻지 않기"],
  },
  {
    dos: ["미래 계획 이야기로 자연스럽게 대화 시작", "상대의 취미와 관심사에 진심으로 관심 표현", "적절한 밀당으로 설렘 유지하기", "소소한 기념일과 특별한 날 챙기기", "상대의 감정 언어를 파악하고 맞춰주기"],
    donts: ["집착하는 모습을 보이지 않기", "SNS 활동을 감시하거나 추궁하지 않기", "다른 이성 친구에 대해 과도하게 질투하지 않기", "상대를 바꾸려고 하지 않기"],
  },
  {
    dos: ["독립적인 자기 시간을 유지하며 매력 관리", "진심 어린 칭찬을 구체적으로 표현", "대화할 때 경청하고 공감하는 모습 보이기", "자연스러운 스킨십으로 친밀감 형성", "서로의 공간과 시간을 존중하기"],
    donts: ["너무 빈번한 연락으로 부담 주지 않기", "상대의 친구 관계에 간섭하지 않기", "감정적일 때 충동적으로 연락하지 않기", "비교하거나 시험하는 행동 하지 않기"],
  },
];

export function getDatingStrategy(id: string): DatingStrategy {
  const h = hash(id, 101);
  return strategySets[h % strategySets.length];
}

// ============================================================
// 5. 연애 리스크 분석
// ============================================================
export interface RiskItem {
  label: string;
  level: number; // 0~100
  description: string;
  emoji: string;
}

export function getRiskAnalysis(id: string): RiskItem[] {
  const h = hash(id, 113);
  const descs = {
    cheat: ["이 유형은 새로운 자극에 취약할 수 있습니다. 관계 안정기에 특히 주의가 필요합니다.", "상대적으로 안정적이지만, 관심이 줄어들면 위험 신호가 나타날 수 있습니다.", "자극 추구 성향이 있어 장기 관계에서 외부 유혹에 노출될 수 있습니다."],
    ghost: ["감정이 벅차오르면 잠수할 가능성이 있습니다. 감정적 과부하가 원인입니다.", "의외로 잠수 가능성은 낮지만, 큰 갈등 시 일시적 회피가 나타날 수 있습니다.", "회피 성향이 있어 갈등 상황에서 연락을 끊을 수 있습니다."],
    obsess: ["한번 빠지면 과도한 관심과 통제로 이어질 수 있습니다.", "적당한 수준의 관심을 유지하지만 불안 시 집착이 강해질 수 있습니다.", "집착 성향은 낮지만, 위기 상황에서 갑자기 나타날 수 있습니다."],
    avoid: ["감정적 대화를 회피하며 문제를 미루는 경향이 있습니다.", "보통은 소통하지만 깊은 감정 이야기에서 벽을 세우곤 합니다.", "감정 회피 성향이 강해 진심을 알기 어려울 수 있습니다."],
  };
  return [
    { label: "바람 가능성", level: 15 + (h % 55), description: descs.cheat[h % 3], emoji: "💔" },
    { label: "잠수 가능성", level: 10 + ((h * 3) % 60), description: descs.ghost[(h * 2) % 3], emoji: "🫥" },
    { label: "집착 가능성", level: 20 + ((h * 7) % 55), description: descs.obsess[(h * 5) % 3], emoji: "🔗" },
    { label: "감정 회피 성향", level: 15 + ((h * 11) % 55), description: descs.avoid[(h * 4) % 3], emoji: "🧊" },
  ];
}

// ============================================================
// 6. 당신에게 끌리는 남자 유형 TOP5
// ============================================================
export function getTop5Types(id: string): { rank: number; type: MaleType }[] {
  const h = hash(id, 127);
  const mainResult = maleTypes[h % maleTypes.length];
  const others = maleTypes.filter((t) => t.id !== mainResult.id);
  // Deterministic shuffle
  const sorted = [...others].sort((a, b) => {
    const ha = hash(a.id + id, 53);
    const hb = hash(b.id + id, 53);
    return ha - hb;
  });
  return [
    { rank: 1, type: mainResult },
    ...sorted.slice(0, 4).map((t, i) => ({ rank: i + 2, type: t })),
  ];
}

// ============================================================
// 7. 인스타 vibe 매력 분석
// ============================================================
export interface CharmStat {
  label: string;
  value: number;
  emoji: string;
}

export function getCharmAnalysis(id: string): CharmStat[] {
  const h = hash(id, 139);
  return [
    { label: "세련됨", value: 30 + ((h * 2) % 60), emoji: "✨" },
    { label: "신비로움", value: 25 + ((h * 3) % 65), emoji: "🔮" },
    { label: "독립성", value: 35 + ((h * 5) % 55), emoji: "🦋" },
    { label: "감성", value: 40 + ((h * 7) % 50), emoji: "🌸" },
    { label: "친근함", value: 30 + ((h * 11) % 55), emoji: "☀️" },
    { label: "지적 매력", value: 25 + ((h * 13) % 60), emoji: "📚" },
  ];
}

// ============================================================
// 8. 연애 시나리오 예측
// ============================================================
export interface ScenarioPhase {
  phase: string;
  period: string;
  description: string;
  emoji: string;
}

const scenarioSets: ScenarioPhase[][] = [
  [
    { phase: "초반", period: "1~3개월", description: "강렬한 설렘과 두근거림이 가득한 시기입니다. 서로에 대한 호기심이 극대화되며, 매 순간이 특별하게 느껴집니다. 연락 빈도가 높고 데이트 때마다 새로운 면을 발견합니다.", emoji: "🌅" },
    { phase: "중반", period: "4~8개월", description: "설렘이 안정감으로 변화하는 시기입니다. 서로의 단점이 보이기 시작하지만, 동시에 더 깊은 이해와 유대가 형성됩니다. 첫 번째 위기가 찾아올 수 있습니다.", emoji: "🌤️" },
    { phase: "후반", period: "9개월~", description: "관계의 진정한 모습이 드러나는 시기입니다. 서로의 가치관과 미래 방향이 맞는지 확인하게 되며, 이 시기를 넘기면 장기적 관계로 발전합니다.", emoji: "🌈" },
  ],
  [
    { phase: "초반", period: "1~2개월", description: "폭풍 같은 감정의 시작입니다. 상대는 빠르게 빠져들며 적극적으로 어필합니다. 모든 것이 완벽해 보이는 허니문 시기로, 매일이 영화 같습니다.", emoji: "🎆" },
    { phase: "중반", period: "3~6개월", description: "현실과 이상의 간극이 보이기 시작합니다. 서로 다른 생활 패턴과 가치관 차이로 갈등이 생기지만, 이를 극복하면 더 단단한 관계가 됩니다.", emoji: "⛅" },
    { phase: "후반", period: "7개월~", description: "진정한 파트너십이 형성되는 시기입니다. 서로를 있는 그대로 받아들이고, 함께 성장하는 관계로 발전합니다. 미래에 대한 구체적 대화가 시작됩니다.", emoji: "🌟" },
  ],
  [
    { phase: "초반", period: "1~4개월", description: "천천히 시작되는 관계입니다. 서로 조심스럽게 다가가며 신뢰를 쌓아갑니다. 드라마틱한 설렘보다 잔잔한 호감이 점점 깊어지는 패턴입니다.", emoji: "🌱" },
    { phase: "중반", period: "5~9개월", description: "안정적이지만 매너리즘의 위험이 있는 시기입니다. 새로운 경험을 함께 시도하며 관계에 활력을 불어넣는 것이 중요합니다.", emoji: "🍃" },
    { phase: "후반", period: "10개월~", description: "깊은 신뢰를 바탕으로 한 안정적인 관계가 이어집니다. 서로의 인생에 필수적인 존재가 되며, 자연스럽게 미래를 함께 계획합니다.", emoji: "🌳" },
  ],
];

export function getScenarioPrediction(id: string): ScenarioPhase[] {
  const h = hash(id, 151);
  return scenarioSets[h % scenarioSets.length];
}

// ============================================================
// 9. 당신이 끌어당기는 남자 위험도 분석
// ============================================================
export interface DangerType {
  title: string;
  emoji: string;
  whyAttracted: string;
  problems: string;
  avoidPattern: string;
  dangerLevel: number;
}

const dangerTypes: DangerType[] = [
  { title: "도파민형 남자", emoji: "⚡", whyAttracted: "당신의 신비로운 분위기가 정복 욕구를 자극합니다. 쉽게 읽히지 않는 매력이 끝없는 도전으로 느껴집니다.", problems: "강렬한 시작 후 감정이 식으면 빠르게 흥미를 잃습니다. 새로운 자극을 찾아 떠날 수 있습니다.", avoidPattern: "초반 과도한 로맨스에 경계하세요. 안정기에 갑자기 변하면 위험 신호입니다.", dangerLevel: 78 },
  { title: "감정 회피형 남자", emoji: "🧊", whyAttracted: "당신의 따뜻한 에너지가 그의 차가운 내면을 녹일 수 있다고 느낍니다. 정서적 안식처를 찾고 있습니다.", problems: "깊은 감정 대화를 피하고, 갈등 시 잠수 타거나 벽을 세웁니다. 진심을 확인하기 어렵습니다.", avoidPattern: "'변해줄 거야'라는 기대를 하지 마세요. 있는 그대로 받아들일 수 없다면 빠져나오세요.", dangerLevel: 72 },
  { title: "SNS 중독형 남자", emoji: "📱", whyAttracted: "당신의 세련된 피드가 그의 미적 감각을 자극합니다. 함께 '커플 이미지'를 만들고 싶어합니다.", problems: "현실보다 온라인 이미지를 중시하며, 좋아요와 팔로워에 집착합니다. 사생활 노출 갈등이 생깁니다.", avoidPattern: "SNS에서의 모습과 현실의 모습을 비교해보세요. 괴리가 크다면 주의하세요.", dangerLevel: 55 },
  { title: "자기애형 남자", emoji: "👑", whyAttracted: "당신의 매력적인 외모와 감성이 그의 '트로피 파트너' 욕구를 충족시킵니다.", problems: "관계가 일방적이 될 수 있으며, 당신의 감정보다 자기 이미지를 우선시합니다.", avoidPattern: "초반의 과도한 칭찬에 경계하세요. 관계에서 일방적 희생을 요구하면 위험합니다.", dangerLevel: 82 },
  { title: "통제형 남자", emoji: "🔒", whyAttracted: "당신의 독립적인 매력이 역설적으로 통제 욕구를 자극합니다. 당신을 자기 세계에 가두고 싶어합니다.", problems: "점진적으로 사회적 관계를 제한하고, 행동을 감시하며, 감정적 조종을 시도합니다.", avoidPattern: "초반부터 과도한 질투, 행동 제한, 지인 비난이 나타나면 즉시 거리를 두세요.", dangerLevel: 90 },
];

export function getDangerAnalysis(id: string): DangerType[] {
  const h = hash(id, 163);
  const shuffled = [...dangerTypes].sort((a, b) => hash(a.title + id, 71) - hash(b.title + id, 71));
  return shuffled.slice(0, 4);
}
