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
  aiSummary: string;
  fallReasons: string[];
  // Premium fields
  whyAttracted: string;
  datingPattern: string;
  obsessionRate: number;
}

export const maleTypes: MaleType[] = [
  {
    id: "rich-older",
    title: "재력 플렉스 연상남",
    emoji: "💸",
    subtitle: "Wealthy Older Guy",
    oneLiner: "경제력과 여유로움으로 당신을 리드하는 타입",
    description:
      "당신의 인스타 vibe는 세련되고 자기관리형입니다.\n이런 분위기에는 경제력 있고 여유로운 연상 남성이 끌리는 경우가 많습니다.",
    gradientClass: "from-[hsl(45,50%,90%)] to-[hsl(35,45%,85%)]",
    aiSummary: "당신의 인스타 피드는 전체적으로 세련되고 깔끔한 톤을 유지하고 있어요. 자기관리에 진심인 느낌이 강하게 드러나며, 고급스러운 취향이 사진 곳곳에서 느껴집니다. 이런 분위기는 경제력과 여유를 갖춘 연상 남성의 감성과 가장 잘 맞아요. AI는 당신의 피드에서 '안정감 속 세련미'를 핵심 키워드로 뽑았습니다.",
    fallReasons: ["세련된 라이프스타일에서 같은 가치관을 느낌", "정돈된 피드에서 성숙함과 자기관리력을 발견", "고급스러운 취향이 자신의 세계관과 일치한다고 확신", "차분하면서도 자신감 있는 분위기에 강하게 끌림"],
    pros: ["경제력으로 인한 여유로운 데이트", "풍부한 경험에서 오는 안정감", "리드력 있는 연애 스타일"],
    cons: ["무의식적으로 통제하려는 경향", "세대 차이에서 오는 가치관 충돌", "관계에서 주도권을 양보하지 않음"],
    attractionStats: [
      { label: "연상 끌림도", value: 92 },
      { label: "동갑 끌림도", value: 45 },
      { label: "연하 끌림도", value: 20 },
      { label: "에겐력", value: 88 },
      { label: "테토력", value: 35 },
    ],
    whyAttracted:
      "당신의 인스타는 고급스러운 감성과 자기관리가 돋보이는 피드입니다.\n이런 세련된 분위기는 경제력과 여유를 갖춘 연상 남성에게 특히 매력적으로 작용합니다.\n그들은 당신의 정돈된 라이프스타일에서 같은 가치관을 느끼고 끌리게 됩니다.",
    datingPattern:
      "처음에는 고급 레스토랑이나 특별한 장소로 데이트를 제안하며 여유롭게 접근합니다.\n관계가 깊어지면 물질적인 것뿐 아니라 정서적으로도 깊은 유대감을 형성하려 합니다.\n다만 본인의 경험과 판단을 기준으로 리드하려는 경향이 강해질 수 있습니다.",
    obsessionRate: 72,
  },
  {
    id: "younger-pursuer",
    title: "직진 연하남",
    emoji: "🐶",
    subtitle: "Younger Pursuer",
    oneLiner: "한 번 빠지면 끝까지 직진하는 에너지 넘치는 타입",
    description:
      "당신의 피드에서 느껴지는 따뜻하고 포근한 에너지에\n순수하고 열정적인 연하남이 자연스럽게 끌립니다.",
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
    whyAttracted:
      "당신의 인스타에서 풍기는 따뜻하고 부드러운 에너지가 연하남들의 마음을 사로잡습니다.\n그들은 당신의 포근한 분위기에서 안정감과 동경을 동시에 느끼며\n자신도 모르게 적극적으로 다가가게 됩니다.",
    datingPattern:
      "처음 만나는 순간부터 호감을 숨기지 못하고 적극적으로 표현합니다.\n매일 연락하고, 작은 것도 챙기며, 관계에서 항상 먼저 다가가는 스타일입니다.\n한번 빠지면 끝까지 직진하지만, 가끔 서투른 모습이 귀엽기도 합니다.",
    obsessionRate: 91,
  },
  {
    id: "bad-boy",
    title: "나쁜남자 도파민형",
    emoji: "🖤",
    subtitle: "Bad Boy Dopamine",
    oneLiner: "위험한 매력으로 심장을 뛰게 만드는 도파민 타입",
    description:
      "당신의 감성적이고 드라마틱한 피드 분위기는\n예측 불가능한 매력의 나쁜남자에게 끌리기 쉬운 패턴을 보여줍니다.",
    gradientClass: "from-[hsl(260,20%,90%)] to-[hsl(280,18%,86%)]",
    pros: ["강렬한 설렘", "카리스마", "자유로운 분위기"],
    cons: ["감정 롤러코스터", "안정성 부족"],
    attractionStats: [
      { label: "연상 끌림도", value: 70 },
      { label: "동갑 끌림도", value: 65 },
      { label: "연하 끌림도", value: 55 },
      { label: "에겐력", value: 30 },
      { label: "테토력", value: 95 },
    ],
    whyAttracted:
      "당신의 인스타는 감성적인 색감과 차분한 분위기의 이미지가 많습니다.\n이 vibe는 도파민형 나쁜남자에게 특히 매력적으로 작용합니다.\n그들은 당신의 조용한 매력 속에서 정복하고 싶은 욕구를 느끼게 됩니다.",
    datingPattern:
      "처음에는 장난스럽게 접근하지만 관계가 깊어지면 강하게 집착하는 경향이 있습니다.\n밀당의 고수로 당신의 감정을 롤러코스터처럼 만들 수 있지만\n그 강렬함이 오히려 중독적인 매력으로 작용합니다.",
    obsessionRate: 65,
  },
  {
    id: "artistic",
    title: "감성 예술가 남자",
    emoji: "🎨",
    subtitle: "Artistic Sensitive Guy",
    oneLiner: "섬세한 감성과 예술적 영혼으로 공감대를 형성하는 타입",
    description:
      "당신의 인스타에 담긴 아름다운 색감과 감성적 무드는\n같은 감성을 공유하는 예술가 타입 남자에게 끌리는 경향을 보여줍니다.",
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
    whyAttracted:
      "당신의 피드에서 느껴지는 섬세한 미적 감각이 예술가 타입 남자의 영감을 자극합니다.\n그들은 당신의 사진 한 장에서도 깊은 이야기를 읽어내고\n같은 감성을 공유할 수 있는 사람이라 확신하며 끌리게 됩니다.",
    datingPattern:
      "예상치 못한 장소에서 깊은 대화를 나누는 것을 좋아합니다.\n미술관, 독립영화, 숨겨진 카페 등 특별한 경험을 함께 공유하고 싶어하며\n관계에서 정서적 교감을 가장 중요시합니다.",
    obsessionRate: 78,
  },
  {
    id: "nerd-genius",
    title: "Nerd 천재형",
    emoji: "🧠",
    subtitle: "Nerdy Genius",
    oneLiner: "지적 매력으로 대화가 끊이지 않는 두뇌 섹시 타입",
    description:
      "당신의 피드에서 보이는 지적 호기심과 깊이 있는 콘텐츠는\n똑똑하고 독특한 시각을 가진 천재형 남자에게 끌리는 패턴입니다.",
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
    whyAttracted:
      "당신의 인스타에서 드러나는 깊이 있는 취향과 독특한 관점이\n천재형 남자의 지적 호기심을 자극합니다.\n그들은 당신과의 대화에서 새로운 시각을 발견하고 매력을 느끼게 됩니다.",
    datingPattern:
      "처음에는 관심을 잘 표현하지 못하지만, 한번 흥미를 느끼면 깊이 파고듭니다.\n데이트보다는 함께 무언가를 배우거나 토론하는 것을 선호하며\n서서히 그러나 확실하게 마음을 열어갑니다.",
    obsessionRate: 58,
  },
  {
    id: "tsundere",
    title: "츤데레 냉미남",
    emoji: "❄️",
    subtitle: "Tsundere Cold Guy",
    oneLiner: "겉은 차갑지만 속은 따뜻한 반전 매력의 타입",
    description:
      "당신의 절제되고 세련된 인스타 분위기는\n쉽게 마음을 열지 않는 츤데레 타입에게 끌리는 성향을 보여줍니다.",
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
    whyAttracted:
      "당신의 세련되고 절제된 인스타 분위기가 츤데레 남자의 호기심을 자극합니다.\n그들은 쉽게 다가가지 못하는 당신의 분위기에서 도전 의식을 느끼고\n점점 깊이 빠져들게 됩니다.",
    datingPattern:
      "처음에는 무관심한 척하지만, 사실 당신의 모든 것을 관찰하고 있습니다.\n어느 순간 예상치 못한 다정함으로 심장을 뛰게 만들며\n한번 마음을 열면 누구보다 진심인 연애를 합니다.",
    obsessionRate: 82,
  },
  {
    id: "ambitious",
    title: "야망 사업가형",
    emoji: "🔥",
    subtitle: "Ambitious Entrepreneur",
    oneLiner: "목표를 향해 달리는 열정과 야망을 가진 타입",
    description:
      "당신의 자기관리형 인스타 피드는\n커리어와 비전에 몰두하는 야망 넘치는 사업가 타입에게 끌리는 경향입니다.",
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
    whyAttracted:
      "당신의 인스타에서 보이는 목표 지향적이고 성장하는 모습이\n같은 에너지를 가진 사업가 타입 남자를 끌어당깁니다.\n그들은 당신에게서 함께 성장할 수 있는 파트너의 가능성을 봅니다.",
    datingPattern:
      "바쁜 일상 속에서도 효율적으로 시간을 내서 만남을 유지합니다.\n관계에서도 목표와 계획을 세우는 것을 좋아하며\n함께 미래를 설계하는 대화를 즐깁니다.",
    obsessionRate: 61,
  },
  {
    id: "popular",
    title: "인싸 인기남",
    emoji: "🎉",
    subtitle: "Popular Social Guy",
    oneLiner: "어디서든 분위기를 이끄는 사교적 매력의 타입",
    description:
      "당신의 밝고 활기찬 인스타 분위기는\n사교적이고 유머 감각 넘치는 인기남에게 끌리는 패턴을 보여줍니다.",
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
    whyAttracted:
      "당신의 밝고 에너지 넘치는 피드가 인싸 남자의 관심을 끌어당깁니다.\n그들은 당신의 활발한 소셜 라이프에서 공감대를 느끼고\n함께하면 더 재미있을 거라는 확신을 갖게 됩니다.",
    datingPattern:
      "친구들과 함께 어울리는 자리에서 자연스럽게 다가옵니다.\n유머와 재치로 편안한 분위기를 만들며\n관계 초반에는 친구에서 연인으로 발전하는 패턴을 보입니다.",
    obsessionRate: 55,
  },
  {
    id: "obsessive",
    title: "집착 직진남",
    emoji: "💘",
    subtitle: "Obsessive Pursuer",
    oneLiner: "오직 당신만을 향한 강렬한 집중력의 타입",
    description:
      "당신의 로맨틱하고 감성적인 인스타 vibe는\n한 사람에게 올인하는 집착형 직진남에게 끌리는 경향이 있습니다.",
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
    whyAttracted:
      "당신의 인스타에서 풍기는 로맨틱한 감성이 집착형 남자의 보호 본능을 자극합니다.\n그들은 당신의 감성적인 면에 깊이 공감하며\n자신만이 당신을 완벽하게 이해할 수 있다고 확신합니다.",
    datingPattern:
      "만난 첫날부터 강한 끌림을 느끼고 매일 연락합니다.\n기념일과 사소한 것까지 모두 기억하며\n관계에서 절대 먼저 포기하지 않는 일편단심 스타일입니다.",
    obsessionRate: 97,
  },
  {
    id: "traveler",
    title: "자유로운 여행남",
    emoji: "✈️",
    subtitle: "Free Traveler",
    oneLiner: "세상 어디든 함께 떠나고 싶은 자유로운 영혼의 타입",
    description:
      "당신의 다채롭고 감성적인 인스타 피드는\n새로운 경험을 추구하는 자유로운 여행남에게 끌리는 패턴입니다.",
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
    whyAttracted:
      "당신의 다채로운 인스타 피드가 여행남의 모험 심리를 자극합니다.\n그들은 당신과 함께라면 어디든 특별한 곳이 될 거라 느끼며\n새로운 경험을 공유하고 싶은 마음에 끌리게 됩니다.",
    datingPattern:
      "데이트 장소가 항상 새롭고 예측 불가능합니다.\n즉흥적인 여행을 제안하거나 이색적인 경험을 함께하는 것을 좋아하며\n자유롭지만 진심 어린 감정 표현을 합니다.",
    obsessionRate: 48,
  },
  {
    id: "stable",
    title: "공기업 안정남",
    emoji: "🏛️",
    subtitle: "Stable Government Worker",
    oneLiner: "믿음직한 안정감으로 미래를 함께 그리는 타입",
    description:
      "당신의 정돈되고 깔끔한 인스타 피드는\n안정적이고 계획적인 공기업 남자에게 끌리는 성향을 보여줍니다.",
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
    whyAttracted:
      "당신의 깔끔하고 정돈된 인스타 피드가 안정남의 가치관과 맞닿아 있습니다.\n그들은 당신의 계획적이고 성실한 모습에서 함께할 미래를 그리며\n진지하고 꾸준한 마음으로 다가옵니다.",
    datingPattern:
      "주말마다 정해진 시간에 연락하고 약속을 지키는 것을 중요시합니다.\n화려하진 않지만 꾸준하고 진심 어린 관심을 보여주며\n장기적인 관계를 전제로 천천히 다가갑니다.",
    obsessionRate: 69,
  },
  {
    id: "gamer-homebody",
    title: "게이머 집돌이남",
    emoji: "🎮",
    subtitle: "Gamer Homebody",
    oneLiner: "집에서 함께 시간을 보내며 편안함을 주는 타입",
    description:
      "당신의 따뜻하고 아늑한 인스타 분위기는\n집에서 함께하는 소소한 일상을 즐기는 집돌이 타입에게 끌리는 경향입니다.",
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
    whyAttracted:
      "당신의 아늑하고 따뜻한 인스타 분위기가 집돌이 남자의 이상형과 딱 맞습니다.\n그들은 당신과 함께 편안한 일상을 보내는 것만으로 행복을 느끼며\n소소하지만 확실한 사랑을 보여줍니다.",
    datingPattern:
      "집에서 함께 넷플릭스를 보거나 게임을 하는 것을 최고의 데이트로 생각합니다.\n밖에 나가는 것보다 둘만의 아늑한 시간을 선호하며\n조용하지만 꾸준한 애정 표현을 합니다.",
    obsessionRate: 74,
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

export interface VibeAnalysis {
  photoMood: string;
  colorTone: string;
  vibeKeyword: string;
  captionStyle: string;
}

const vibeOptions: VibeAnalysis[] = [
  { photoMood: "감성적", colorTone: "파스텔톤", vibeKeyword: "몽환적", captionStyle: "감성형" },
  { photoMood: "세련된", colorTone: "뉴트럴", vibeKeyword: "시크한", captionStyle: "미니멀형" },
  { photoMood: "밝고 활기찬", colorTone: "비비드톤", vibeKeyword: "에너지틱", captionStyle: "유머형" },
  { photoMood: "차분한", colorTone: "모노톤", vibeKeyword: "절제된", captionStyle: "관찰자형" },
  { photoMood: "따뜻한", colorTone: "웜톤", vibeKeyword: "포근한", captionStyle: "일상형" },
  { photoMood: "신비로운", colorTone: "다크톤", vibeKeyword: "미스터리", captionStyle: "시적형" },
];

export function getVibeAnalysis(id: string): VibeAnalysis {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 37 + id.charCodeAt(i)) % vibeOptions.length;
  }
  return vibeOptions[Math.abs(hash) % vibeOptions.length];
}

export function getAiConfidence(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 13 + id.charCodeAt(i)) % 21;
  }
  return 75 + (Math.abs(hash) % 21); // 75~95
}
