export interface MaleType {
  id: string;
  title: string;
  emoji: string;
  subtitle: string;
  oneLiner: string;
  description: string;
  gradientClass: string;
  pros: string[];
  cons: string[];
  attractionStats: { label: string; value: number }[];
}

export const maleTypes: MaleType[] = [
  {
    id: "rich-older",
    title: "재력 플렉스 연상남",
    emoji: "💸",
    subtitle: "Wealthy Older Guy",
    oneLiner: "경제력과 여유로움으로 당신을 리드하는 타입",
    description: "당신의 인스타 vibe는 세련되고 자기관리형입니다.\n이런 분위기에는 경제력 있고 여유로운 연상 남성이 끌리는 경우가 많습니다.",
    gradientClass: "from-[hsl(45,50%,90%)] to-[hsl(35,45%,85%)]",
    pros: ["경제력", "안정감", "경험에서 오는 여유"],
    cons: ["통제하려 할 수 있음", "세대 차이 이슈"],
    attractionStats: [
      { label: "연상 끌림도", value: 92 },
      { label: "동갑 끌림도", value: 45 },
      { label: "연하 끌림도", value: 20 },
      { label: "에겐력", value: 88 },
      { label: "테토력", value: 35 },
    ],
  },
  {
    id: "younger-pursuer",
    title: "직진 연하남",
    emoji: "🐶",
    subtitle: "Younger Pursuer",
    oneLiner: "한 번 빠지면 끝까지 직진하는 에너지 넘치는 타입",
    description: "당신의 피드에서 느껴지는 따뜻하고 포근한 에너지에\n순수하고 열정적인 연하남이 자연스럽게 끌립니다.",
    gradientClass: "from-[hsl(30,50%,92%)] to-[hsl(20,45%,88%)]",
    pros: ["순수한 애정 표현", "에너지 넘침", "솔직함"],
    cons: ["가끔 미숙할 수 있음", "질투심이 강할 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 25 },
      { label: "동갑 끌림도", value: 40 },
      { label: "연하 끌림도", value: 95 },
      { label: "에겐력", value: 50 },
      { label: "테토력", value: 90 },
    ],
  },
  {
    id: "bad-boy",
    title: "나쁜남자 도파민형",
    emoji: "🖤",
    subtitle: "Bad Boy Dopamine",
    oneLiner: "위험한 매력으로 심장을 뛰게 만드는 도파민 타입",
    description: "당신의 감성적이고 드라마틱한 피드 분위기는\n예측 불가능한 매력의 나쁜남자에게 끌리기 쉬운 패턴을 보여줍니다.",
    gradientClass: "from-[hsl(260,20%,90%)] to-[hsl(280,18%,86%)]",
    pros: ["강렬한 설렘", "카리스마", "자유로운 분위기"],
    cons: ["불안정한 관계", "감정 기복이 심함"],
    attractionStats: [
      { label: "연상 끌림도", value: 70 },
      { label: "동갑 끌림도", value: 65 },
      { label: "연하 끌림도", value: 55 },
      { label: "에겐력", value: 30 },
      { label: "테토력", value: 95 },
    ],
  },
  {
    id: "artistic",
    title: "감성 예술가 남자",
    emoji: "🎨",
    subtitle: "Artistic Sensitive Guy",
    oneLiner: "섬세한 감성과 예술적 영혼으로 공감대를 형성하는 타입",
    description: "당신의 인스타에 담긴 아름다운 색감과 감성적 무드는\n같은 감성을 공유하는 예술가 타입 남자에게 끌리는 경향을 보여줍니다.",
    gradientClass: "from-[hsl(300,25%,92%)] to-[hsl(340,20%,90%)]",
    pros: ["깊은 감성 공유", "로맨틱한 표현력", "창의적 데이트"],
    cons: ["현실적이지 못할 수 있음", "감정에 빠지기 쉬움"],
    attractionStats: [
      { label: "연상 끌림도", value: 55 },
      { label: "동갑 끌림도", value: 80 },
      { label: "연하 끌림도", value: 60 },
      { label: "에겐력", value: 40 },
      { label: "테토력", value: 75 },
    ],
  },
  {
    id: "nerd-genius",
    title: "Nerd 천재형",
    emoji: "🧠",
    subtitle: "Nerdy Genius",
    oneLiner: "지적 매력으로 대화가 끊이지 않는 두뇌 섹시 타입",
    description: "당신의 피드에서 보이는 지적 호기심과 깊이 있는 콘텐츠는\n똑똑하고 독특한 시각을 가진 천재형 남자에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(210,25%,92%)] to-[hsl(220,20%,88%)]",
    pros: ["지적인 대화", "성장 자극", "독립적인 성격"],
    cons: ["감정 표현이 서툴 수 있음", "사회성이 부족할 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 60 },
      { label: "동갑 끌림도", value: 75 },
      { label: "연하 끌림도", value: 45 },
      { label: "에겐력", value: 70 },
      { label: "테토력", value: 40 },
    ],
  },
  {
    id: "tsundere",
    title: "츤데레 냉미남",
    emoji: "❄️",
    subtitle: "Tsundere Cold Guy",
    oneLiner: "겉은 차갑지만 속은 따뜻한 반전 매력의 타입",
    description: "당신의 절제되고 세련된 인스타 분위기는\n쉽게 마음을 열지 않는 츤데레 타입에게 끌리는 성향을 보여줍니다.",
    gradientClass: "from-[hsl(200,20%,92%)] to-[hsl(220,15%,88%)]",
    pros: ["반전 매력", "한번 빠지면 진심", "독립적"],
    cons: ["소통이 어려울 수 있음", "오해가 생기기 쉬움"],
    attractionStats: [
      { label: "연상 끌림도", value: 75 },
      { label: "동갑 끌림도", value: 60 },
      { label: "연하 끌림도", value: 35 },
      { label: "에겐력", value: 55 },
      { label: "테토력", value: 85 },
    ],
  },
  {
    id: "ambitious",
    title: "야망 사업가형",
    emoji: "🔥",
    subtitle: "Ambitious Entrepreneur",
    oneLiner: "목표를 향해 달리는 열정과 야망을 가진 타입",
    description: "당신의 자기관리형 인스타 피드는\n커리어와 비전에 몰두하는 야망 넘치는 사업가 타입에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(15,40%,90%)] to-[hsl(25,35%,86%)]",
    pros: ["강한 추진력", "비전 공유", "성장하는 관계"],
    cons: ["일 중독 가능성", "여유가 없을 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 85 },
      { label: "동갑 끌림도", value: 55 },
      { label: "연하 끌림도", value: 20 },
      { label: "에겐력", value: 92 },
      { label: "테토력", value: 50 },
    ],
  },
  {
    id: "popular",
    title: "인싸 인기남",
    emoji: "🎉",
    subtitle: "Popular Social Guy",
    oneLiner: "어디서든 분위기를 이끄는 사교적 매력의 타입",
    description: "당신의 밝고 활기찬 인스타 분위기는\n사교적이고 유머 감각 넘치는 인기남에게 끌리는 패턴을 보여줍니다.",
    gradientClass: "from-[hsl(340,40%,92%)] to-[hsl(20,40%,90%)]",
    pros: ["분위기 메이커", "넓은 인맥", "재미있는 일상"],
    cons: ["여자 사람 친구 이슈", "가벼워 보일 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 40 },
      { label: "동갑 끌림도", value: 90 },
      { label: "연하 끌림도", value: 70 },
      { label: "에겐력", value: 55 },
      { label: "테토력", value: 80 },
    ],
  },
  {
    id: "obsessive",
    title: "집착 직진남",
    emoji: "💘",
    subtitle: "Obsessive Pursuer",
    oneLiner: "오직 당신만을 향한 강렬한 집중력의 타입",
    description: "당신의 로맨틱하고 감성적인 인스타 vibe는\n한 사람에게 올인하는 집착형 직진남에게 끌리는 경향이 있습니다.",
    gradientClass: "from-[hsl(350,45%,92%)] to-[hsl(340,40%,88%)]",
    pros: ["확실한 애정 표현", "한결같은 마음", "기념일 챙김"],
    cons: ["집착이 될 수 있음", "독점욕이 강함"],
    attractionStats: [
      { label: "연상 끌림도", value: 50 },
      { label: "동갑 끌림도", value: 70 },
      { label: "연하 끌림도", value: 80 },
      { label: "에겐력", value: 45 },
      { label: "테토력", value: 98 },
    ],
  },
  {
    id: "traveler",
    title: "자유로운 여행남",
    emoji: "✈️",
    subtitle: "Free Traveler",
    oneLiner: "세상 어디든 함께 떠나고 싶은 자유로운 영혼의 타입",
    description: "당신의 다채롭고 감성적인 인스타 피드는\n새로운 경험을 추구하는 자유로운 여행남에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(180,20%,92%)] to-[hsl(160,25%,88%)]",
    pros: ["다양한 경험", "열린 사고", "함께하는 모험"],
    cons: ["정착을 어려워할 수 있음", "연락이 뜸할 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 55 },
      { label: "동갑 끌림도", value: 75 },
      { label: "연하 끌림도", value: 65 },
      { label: "에겐력", value: 50 },
      { label: "테토력", value: 60 },
    ],
  },
  {
    id: "stable",
    title: "공기업 안정남",
    emoji: "🏛️",
    subtitle: "Stable Government Worker",
    oneLiner: "믿음직한 안정감으로 미래를 함께 그리는 타입",
    description: "당신의 정돈되고 깔끔한 인스타 피드는\n안정적이고 계획적인 공기업 남자에게 끌리는 성향을 보여줍니다.",
    gradientClass: "from-[hsl(150,15%,92%)] to-[hsl(170,12%,89%)]",
    pros: ["안정적인 수입", "규칙적인 생활", "믿음직함"],
    cons: ["다소 재미없을 수 있음", "보수적인 성향"],
    attractionStats: [
      { label: "연상 끌림도", value: 65 },
      { label: "동갑 끌림도", value: 80 },
      { label: "연하 끌림도", value: 30 },
      { label: "에겐력", value: 75 },
      { label: "테토력", value: 45 },
    ],
  },
  {
    id: "gamer-homebody",
    title: "게이머 집돌이남",
    emoji: "🎮",
    subtitle: "Gamer Homebody",
    oneLiner: "집에서 함께 시간을 보내며 편안함을 주는 타입",
    description: "당신의 따뜻하고 아늑한 인스타 분위기는\n집에서 함께하는 소소한 일상을 즐기는 집돌이 타입에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(260,18%,92%)] to-[hsl(240,15%,89%)]",
    pros: ["바람 걱정 없음", "함께하는 취미", "편안한 관계"],
    cons: ["외출을 싫어할 수 있음", "게임에 빠질 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 30 },
      { label: "동갑 끌림도", value: 85 },
      { label: "연하 끌림도", value: 75 },
      { label: "에겐력", value: 45 },
      { label: "테토력", value: 70 },
    ],
  },
];

export function getRandomResult(id: string): MaleType {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) % maleTypes.length;
  }
  return maleTypes[Math.abs(hash) % maleTypes.length];
}

export function getAdditionalTypes(mainId: string): MaleType[] {
  const others = maleTypes.filter((t) => t.id !== mainId);
  const shuffled = [...others].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

export function getWarningType(mainId: string): MaleType {
  const others = maleTypes.filter((t) => t.id !== mainId);
  return others[Math.floor(Math.random() * others.length)];
}
