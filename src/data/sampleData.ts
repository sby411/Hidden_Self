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
  whyAttracted: string;
  datingPattern: string;
  obsessionRate: number;
}

export interface UserVibeType {
  id: string;
  title: string;
  emoji: string;
  description: string;
  gradientClass: string;
}

export const userVibeTypes: UserVibeType[] = [
  { id: "mystery", title: "신비로운 감성 미스터리형", emoji: "🔮", description: "당신의 인스타는 감성적인 색감과 차분한 분위기의 이미지가 많습니다.\n이런 vibe는 신비롭고 쉽게 읽히지 않는 매력을 만듭니다.", gradientClass: "from-[hsl(270,25%,92%)] to-[hsl(290,20%,87%)]" },
  { id: "urban", title: "세련된 도시 aesthetic형", emoji: "🏙️", description: "당신의 피드에서는 세련된 도시 감성과 트렌디한 라이프스타일이 돋보입니다.\n깔끔하고 정돈된 aesthetic이 도시적 매력을 만들어냅니다.", gradientClass: "from-[hsl(220,18%,92%)] to-[hsl(210,15%,87%)]" },
  { id: "warm", title: "따뜻한 청순 안정형", emoji: "🌸", description: "당신의 인스타에서는 따뜻하고 포근한 에너지가 가득합니다.\n자연스럽고 꾸밈없는 매력이 안정적이고 순수한 분위기를 만듭니다.", gradientClass: "from-[hsl(350,35%,93%)] to-[hsl(340,30%,88%)]" },
  { id: "hip", title: "힙한 자유 감성형", emoji: "🎧", description: "당신의 피드는 트렌디하면서도 자유로운 감성이 핵심입니다.\n남들과 다른 독특한 취향이 힙하고 개성 있는 매력을 만들어냅니다.", gradientClass: "from-[hsl(40,40%,92%)] to-[hsl(30,35%,87%)]" },
  { id: "dreamy", title: "몽환 감성 아티스트형", emoji: "🌙", description: "당신의 인스타는 몽환적이고 예술적인 감성으로 가득 차 있습니다.\n부드러운 색감과 감성적인 이미지가 꿈같은 분위기를 연출합니다.", gradientClass: "from-[hsl(280,22%,93%)] to-[hsl(300,18%,88%)]" },
  { id: "intellectual", title: "차분한 지성형", emoji: "📚", description: "당신의 피드에서는 지적이고 차분한 에너지가 느껴집니다.\n깊이 있는 콘텐츠와 절제된 표현이 지적인 매력을 만들어냅니다.", gradientClass: "from-[hsl(200,20%,92%)] to-[hsl(210,18%,87%)]" },
  { id: "vivid", title: "밝은 에너지 인싸형", emoji: "✨", description: "당신의 인스타는 밝고 활기찬 에너지로 넘칩니다.\n긍정적이고 사교적인 분위기가 주변을 환하게 만드는 매력이 있습니다.", gradientClass: "from-[hsl(45,45%,92%)] to-[hsl(35,40%,87%)]" },
  { id: "romantic", title: "로맨틱 감성 순수형", emoji: "💕", description: "당신의 피드에서는 로맨틱하고 순수한 감성이 물씬 풍깁니다.\n사랑스러운 일상과 감성적인 순간들이 따뜻한 매력을 만들어냅니다.", gradientClass: "from-[hsl(340,35%,93%)] to-[hsl(350,30%,88%)]" },
];

export const maleTypes: MaleType[] = [
  {
    id: "dopamine-popular",
    title: "도파민 회피형 인기남",
    emoji: "⚡",
    subtitle: "Dopamine Avoidant Popular",
    oneLiner: "강렬한 설렘을 주지만 잡히지 않는 도파민 타입",
    description: "당신의 인스타 vibe는 감성적이면서도 신비로운 분위기가 있습니다.\n이 vibe는 감정적으로 자극을 찾는 남자들에게 특히 매력적으로 작용합니다.",
    gradientClass: "from-[hsl(280,25%,92%)] to-[hsl(300,20%,87%)]",
    aiSummary: "당신의 피드에서는 감성적이면서도 신비로운 에너지가 감돌아요. 드라마틱한 색감과 의미심장한 캡션이 독특한 매력을 만들어냅니다. 이런 감성은 강렬한 자극을 추구하는 도파민형 남자를 끌어당기는 자석 같은 역할을 해요. AI가 포착한 당신의 핵심 에너지는 '미스터리한 감성 매력'입니다.",
    fallReasons: ["신비로운 분위기에서 정복 욕구를 느낌", "감성적 면이 자신의 강렬함과 대비되어 매력적", "쉽게 읽히지 않는 성격이 도전 의식을 자극", "독특한 취향이 지루하지 않은 상대로 인식됨"],
    pros: ["강렬한 설렘과 두근거림", "넘치는 카리스마와 매력", "자유롭고 예측 불가능한 재미"],
    cons: ["감정의 롤러코스터가 극심함", "관계 안정성이 매우 부족", "밀당이 심하고 진심을 알기 어려움"],
    attractionStats: [
      { label: "연상 끌림도", value: 65 },
      { label: "동갑 끌림도", value: 80 },
      { label: "연하 끌림도", value: 55 },
      { label: "에겐력", value: 35 },
      { label: "테토력", value: 92 },
    ],
    whyAttracted: "당신의 인스타는 차분한 aesthetic과 감성적인 분위기가 강합니다.\n이 vibe는 회피형이면서도 매력적인 남자들에게 강하게 어필하는 경향이 있습니다.\n그들은 당신의 조용한 매력 속에서 도전하고 싶은 욕구를 느끼게 됩니다.",
    datingPattern: "처음에는 장난스럽게 접근하지만\n관계가 깊어질수록 감정적으로 집착하는 경향이 있습니다.\n밀당의 고수로 당신의 감정을 롤러코스터처럼 만듭니다.",
    obsessionRate: 62,
  },
  {
    id: "anxious-older",
    title: "능력있는 불안형 연상남",
    emoji: "💼",
    subtitle: "Anxious Capable Older",
    oneLiner: "능력은 있지만 불안한 내면을 가진 연상 타입",
    description: "당신의 세련되고 안정적인 인스타 피드는\n능력 있지만 감정적으로 불안한 연상 남성에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(45,45%,91%)] to-[hsl(35,40%,86%)]",
    aiSummary: "당신의 피드는 세련되고 자기관리에 진심인 에너지를 뿜어내고 있어요. 고급스러운 취향과 정돈된 라이프스타일이 돋보이며, 성숙한 매력이 강하게 느껴집니다. 이런 분위기는 경제력은 있지만 정서적 안정을 갈구하는 연상 남성에게 강하게 작용해요. AI가 분석한 핵심 키워드는 '안정 속 세련미'입니다.",
    fallReasons: ["정돈된 피드에서 정서적 안정감을 발견", "세련된 취향이 자신의 세계관과 일치", "차분한 분위기에서 마음의 안식처를 느낌", "성숙한 에너지가 깊은 유대감을 예감하게 함"],
    pros: ["경제력과 사회적 안정감", "풍부한 경험에서 오는 리드력", "진지하고 깊은 감정 표현"],
    cons: ["불안감이 통제로 이어질 수 있음", "과거 경험에 의한 의심병", "감정 기복이 있을 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 95 },
      { label: "동갑 끌림도", value: 40 },
      { label: "연하 끌림도", value: 15 },
      { label: "에겐력", value: 90 },
      { label: "테토력", value: 45 },
    ],
    whyAttracted: "당신의 안정적이고 세련된 피드가 불안형 연상남의 마음을 사로잡습니다.\n그들은 당신에게서 자신이 필요로 하는 정서적 안정을 발견하고\n경제력과 경험으로 당신을 리드하고 싶어합니다.",
    datingPattern: "처음에는 여유롭고 성숙한 모습으로 접근하지만\n관계가 깊어지면 의외로 불안한 내면이 드러납니다.\n진심이기 때문에 더 걱정하고 더 신경 쓰는 타입입니다.",
    obsessionRate: 78,
  },
  {
    id: "clingy-younger",
    title: "집착형 연하 인싸남",
    emoji: "🐶",
    subtitle: "Clingy Younger Social",
    oneLiner: "한번 빠지면 끝까지 직진하는 에너지 넘치는 연하",
    description: "당신의 따뜻하고 포근한 인스타 에너지에\n순수하고 열정적인 연하 인싸남이 자연스럽게 끌립니다.",
    gradientClass: "from-[hsl(30,50%,92%)] to-[hsl(20,45%,87%)]",
    aiSummary: "당신의 인스타에서는 따뜻하고 편안한 감성이 물씬 풍겨요. 포근한 색감과 일상의 소소한 순간들을 담는 스타일이 돋보입니다. 이런 vibe는 에너지 넘치고 순수한 연하남의 마음을 강하게 자극해요. AI 분석 결과, 당신의 피드 키워드는 '따뜻한 포용력'입니다.",
    fallReasons: ["포근한 분위기에서 안정감과 동경을 느낌", "따뜻한 에너지가 보호받고 싶은 마음을 자극", "편안한 일상 콘텐츠에 자연스럽게 빠져듦", "부드러운 이미지에서 이상형을 발견"],
    pros: ["순수하고 진심 어린 애정 표현", "에너지 넘치는 활력을 줌", "거짓 없이 솔직한 감정 전달"],
    cons: ["집착으로 발전할 가능성", "질투심이 강하게 나타남", "감정 기복이 심한 편"],
    attractionStats: [
      { label: "연상 끌림도", value: 20 },
      { label: "동갑 끌림도", value: 45 },
      { label: "연하 끌림도", value: 95 },
      { label: "에겐력", value: 40 },
      { label: "테토력", value: 93 },
    ],
    whyAttracted: "당신의 포근하고 따뜻한 인스타 에너지가 연하 인싸남의 마음을 완전히 사로잡습니다.\n그들은 당신의 안정적인 분위기에서 동경과 설렘을 동시에 느끼며\n적극적으로 다가가지 않으면 안 되는 충동을 느낍니다.",
    datingPattern: "만난 순간부터 호감을 숨기지 못하고 적극 어필합니다.\n매일 연락하고, 모든 것을 챙기며, 항상 먼저 다가갑니다.\n한번 빠지면 끝까지 직진하지만 가끔 서투른 모습이 귀엽습니다.",
    obsessionRate: 94,
  },
  {
    id: "avoidant-cold",
    title: "감정차단 회피형 냉미남",
    emoji: "🧊",
    subtitle: "Emotionally Avoidant Cold",
    oneLiner: "겉은 차갑지만 내면에 깊은 감정을 숨긴 타입",
    description: "당신의 절제되고 세련된 인스타 분위기는\n감정을 차단하는 회피형 냉미남에게 끌리는 성향을 보여줍니다.",
    gradientClass: "from-[hsl(210,18%,92%)] to-[hsl(220,15%,87%)]",
    aiSummary: "당신의 피드는 절제되고 미니멀한 감성이 핵심이에요. 과하지 않으면서도 확실한 스타일을 가지고 있다는 인상을 줍니다. 쉽게 읽히지 않는 미스터리한 분위기가 회피형 남자의 호기심을 자극해요. AI가 감지한 당신의 핵심 에너지는 '절제된 카리스마'입니다.",
    fallReasons: ["쉽게 다가갈 수 없는 분위기에 도전 의식", "절제된 스타일에서 내면의 깊이를 예감", "차분한 에너지가 자신과 비슷하다고 느낌", "미스터리한 매력이 계속 궁금하게 만듦"],
    pros: ["반전 매력의 다정함", "한번 빠지면 누구보다 진심", "독립적이고 쿨한 관계"],
    cons: ["소통이 어렵고 속마음을 모름", "감정 표현 타이밍이 극도로 늦음", "관계 진전이 매우 느림"],
    attractionStats: [
      { label: "연상 끌림도", value: 75 },
      { label: "동갑 끌림도", value: 65 },
      { label: "연하 끌림도", value: 30 },
      { label: "에겐력", value: 60 },
      { label: "테토력", value: 82 },
    ],
    whyAttracted: "당신의 세련되고 절제된 인스타 분위기가 회피형 냉미남의 호기심을 자극합니다.\n그들은 쉽게 다가가지 못하는 당신의 분위기에서 도전 의식을 느끼고\n점점 깊이 빠져들게 됩니다.",
    datingPattern: "처음에는 무관심한 척하지만 사실 모든 것을 관찰하고 있습니다.\n어느 순간 예상치 못한 다정함으로 심장을 뛰게 만들며\n한번 마음을 열면 누구보다 진심이지만 표현이 서툽니다.",
    obsessionRate: 70,
  },
  {
    id: "emotional-artist",
    title: "감성 과몰입 예술남",
    emoji: "🎨",
    subtitle: "Over-Emotional Artist",
    oneLiner: "감성에 깊이 빠져드는 예술적 영혼의 타입",
    description: "당신의 아름다운 색감과 감성적 무드의 피드는\n같은 감성을 공유하는 예술가 타입 남자에게 끌리는 경향을 보여줍니다.",
    gradientClass: "from-[hsl(300,25%,92%)] to-[hsl(330,22%,87%)]",
    aiSummary: "당신의 피드에는 아름다운 색감과 섬세한 구도의 사진이 가득해요. 일상 속 작은 아름다움을 포착하는 감성이 빛나며, 미적 감각이 뛰어나다는 인상을 줍니다. 이런 감성은 예술가적 영혼을 가진 남자에게 깊은 공감대를 형성해요. AI가 읽은 피드 키워드는 '섬세한 미적 감각'입니다.",
    fallReasons: ["섬세한 미적 감각에 영감을 받음", "같은 감성을 공유할 수 있는 사람이라 확신", "피드 속 순간들에 예술적 공감", "독특한 시각이 매력적"],
    pros: ["깊은 감성을 공유하는 교감", "로맨틱하고 창의적인 표현력", "예상치 못한 특별한 데이트"],
    cons: ["현실적인 면이 부족함", "감정에 쉽게 과몰입함", "경제적 안정성이 낮을 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 50 },
      { label: "동갑 끌림도", value: 85 },
      { label: "연하 끌림도", value: 65 },
      { label: "에겐력", value: 35 },
      { label: "테토력", value: 78 },
    ],
    whyAttracted: "당신의 피드에서 느껴지는 섬세한 미적 감각이 예술남의 영감을 자극합니다.\n그들은 당신의 사진 한 장에서도 깊은 이야기를 읽어내고\n같은 세계를 공유할 수 있다고 확신하며 빠져듭니다.",
    datingPattern: "예상치 못한 장소에서 깊은 대화를 나누는 것을 좋아합니다.\n미술관, 독립영화, 숨겨진 카페 등 특별한 경험을 공유하고 싶어하며\n감정에 과몰입하면 상대의 모든 것이 영감의 원천이 됩니다.",
    obsessionRate: 83,
  },
  {
    id: "smart-loner",
    title: "똑똑한 아싸 안정남",
    emoji: "🧠",
    subtitle: "Smart Stable Introvert",
    oneLiner: "지적 매력과 안정감을 겸비한 조용한 타입",
    description: "당신의 지적이고 차분한 인스타 피드는\n똑똑하고 안정적인 아싸 타입 남자에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(200,22%,92%)] to-[hsl(210,18%,87%)]",
    aiSummary: "당신의 인스타에서는 지적 호기심과 깊이 있는 취향이 돋보여요. 의미 있는 콘텐츠와 차분한 분위기가 피드 전반에 드러나고 있습니다. 이런 분위기는 똑똑하고 깊이 있는 대화를 갈구하는 안정적인 남자의 관심을 끌어요. AI 분석 핵심 키워드는 '지적 깊이감'입니다.",
    fallReasons: ["깊이 있는 취향에서 지적 동반자를 발견", "독특한 관점이 호기심을 강하게 자극", "의미 있는 콘텐츠 공유 감성에 공감", "대화가 통할 것 같다는 직감적 확신"],
    pros: ["지적이고 깊이 있는 대화", "함께 성장할 수 있는 관계", "독립적이고 안정적인 성격"],
    cons: ["감정 표현이 매우 서툼", "사회성이 부족한 편", "자기 세계에 빠져 소통이 단절됨"],
    attractionStats: [
      { label: "연상 끌림도", value: 60 },
      { label: "동갑 끌림도", value: 78 },
      { label: "연하 끌림도", value: 40 },
      { label: "에겐력", value: 72 },
      { label: "테토력", value: 38 },
    ],
    whyAttracted: "당신의 피드에서 드러나는 지적 깊이와 독특한 관점이\n아싸 안정남의 호기심을 자극합니다.\n그들은 당신과의 대화에서 새로운 세계를 발견하며 빠져듭니다.",
    datingPattern: "처음에는 관심을 잘 표현하지 못하지만 한번 흥미를 느끼면 깊이 파고듭니다.\n데이트보다 함께 무언가를 배우거나 토론하는 것을 선호하며\n서서히 그러나 확실하게 마음을 엽니다.",
    obsessionRate: 55,
  },
  {
    id: "narcissist-popular",
    title: "자기애 과잉 인기남",
    emoji: "👑",
    subtitle: "Narcissistic Popular",
    oneLiner: "자신감 넘치지만 자기애가 과한 인기 타입",
    description: "당신의 트렌디하고 세련된 인스타 피드는\n자기애가 강하고 인기 많은 남자에게 끌리는 경향을 보여줍니다.",
    gradientClass: "from-[hsl(45,50%,91%)] to-[hsl(40,45%,86%)]",
    aiSummary: "당신의 피드는 트렌디하고 자기관리에 진심인 에너지를 뿜어내요. 세련된 라이프스타일이 강하게 드러나며, 당당한 자신감이 느껴집니다. 이런 분위기는 자기애가 강한 인기남의 레이더에 정확히 잡혀요. AI가 분석한 핵심 키워드는 '당당한 자신감'입니다.",
    fallReasons: ["세련된 외모 관리에 같은 가치관을 느낌", "트렌디한 취향이 자신의 이미지와 어울림", "당당한 분위기가 도전 의식을 자극", "함께 있으면 더 돋보일 거란 확신"],
    pros: ["넘치는 자신감과 카리스마", "사교적이고 분위기를 이끔", "외모와 자기관리에 진심"],
    cons: ["자기중심적인 사고방식", "공감 능력이 부족할 수 있음", "관계보다 자신의 이미지를 우선시"],
    attractionStats: [
      { label: "연상 끌림도", value: 55 },
      { label: "동갑 끌림도", value: 85 },
      { label: "연하 끌림도", value: 60 },
      { label: "에겐력", value: 65 },
      { label: "테토력", value: 88 },
    ],
    whyAttracted: "당신의 세련된 피드가 자기애형 인기남의 관심을 끌어당깁니다.\n그들은 당신의 트렌디한 이미지에서 자신과 어울리는 파트너를 발견하고\n함께하면 더 빛날 것이라 확신합니다.",
    datingPattern: "처음에는 강렬한 어필과 로맨틱한 제스처로 다가옵니다.\n관계 초반에는 완벽한 남자친구처럼 보이지만\n시간이 지나면 자기중심적인 면이 드러나기 시작합니다.",
    obsessionRate: 50,
  },
  {
    id: "workaholic-avoidant",
    title: "일중독 회피형 사업가",
    emoji: "📊",
    subtitle: "Workaholic Avoidant",
    oneLiner: "일에 몰두하며 감정을 회피하는 야망형 타입",
    description: "당신의 자기관리형 인스타 피드는\n일에 몰두하는 회피형 사업가 타입에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(15,35%,91%)] to-[hsl(25,30%,86%)]",
    aiSummary: "당신의 인스타에서는 자기관리와 성장에 진심인 에너지가 뚜렷해요. 목표 지향적 콘텐츠와 성취의 순간들이 자연스럽게 녹아 있습니다. 이런 분위기는 야망 넘치지만 감정적으로는 회피적인 사업가 남자의 레이더에 잡혀요. AI 분석 핵심 키워드는 '성장하는 에너지'입니다.",
    fallReasons: ["목표 지향적 모습에서 같은 가치관 발견", "자기관리 라이프스타일에 동질감", "함께 성장할 파트너로 인식", "독립적인 에너지에 끌림"],
    pros: ["강한 추진력과 비전", "경제적 안정감", "서로의 독립성을 존중"],
    cons: ["일에 빠져 연인을 소홀히 함", "감정 대화를 회피하는 경향", "관계보다 커리어를 우선시"],
    attractionStats: [
      { label: "연상 끌림도", value: 88 },
      { label: "동갑 끌림도", value: 50 },
      { label: "연하 끌림도", value: 18 },
      { label: "에겐력", value: 95 },
      { label: "테토력", value: 30 },
    ],
    whyAttracted: "당신의 독립적이고 성장 지향적인 피드가\n일중독 사업가의 관심을 끌어당깁니다.\n그들은 당신에게서 함께 성장할 수 있는 파트너를 봅니다.",
    datingPattern: "바쁜 일상 속에서도 시간을 내려 하지만 자주 약속을 미룹니다.\n관계에서도 효율과 계획을 추구하며\n감정적 대화보다는 미래 계획을 나누는 것을 선호합니다.",
    obsessionRate: 45,
  },
  {
    id: "push-pull",
    title: "밀당 중독 도파민남",
    emoji: "🎭",
    subtitle: "Push-Pull Dopamine",
    oneLiner: "밀당의 고수로 설렘과 불안을 오가게 하는 타입",
    description: "당신의 감성적이고 드라마틱한 피드는\n밀당에 능숙한 도파민 중독형 남자에게 끌리기 쉬운 패턴입니다.",
    gradientClass: "from-[hsl(340,30%,92%)] to-[hsl(320,25%,87%)]",
    aiSummary: "당신의 인스타는 감성적이면서도 드라마틱한 에너지가 느껴져요. 의미심장한 순간들을 포착하는 감각이 뛰어나며, 깊은 감정을 담은 콘텐츠가 많습니다. 이런 감성은 밀당의 쾌감을 즐기는 남자를 자극하는 역할을 해요. AI 핵심 키워드는 '드라마틱 감성'입니다.",
    fallReasons: ["감성적인 면이 밀당의 쾌감을 증폭시킴", "깊은 감정 표현이 정복 욕구를 자극", "쉽게 읽히지 않는 분위기가 게임 본능을 깨움", "드라마틱한 에너지가 지루하지 않게 함"],
    pros: ["강렬한 설렘의 연속", "지루할 틈이 없는 관계", "감정적 깊이가 있는 대화"],
    cons: ["불안감이 상시 동반됨", "감정 소모가 극심함", "진심인지 게임인지 구분 불가"],
    attractionStats: [
      { label: "연상 끌림도", value: 60 },
      { label: "동갑 끌림도", value: 75 },
      { label: "연하 끌림도", value: 70 },
      { label: "에겐력", value: 40 },
      { label: "테토력", value: 90 },
    ],
    whyAttracted: "당신의 감성적인 피드가 밀당남의 게임 본능을 자극합니다.\n그들은 당신의 깊은 감정 표현에서 정복의 쾌감을 느끼고\n끊임없이 밀고 당기며 관계를 이어갑니다.",
    datingPattern: "한번은 열정적으로, 한번은 차갑게 대하는 패턴을 반복합니다.\n당신이 떠날 것 같으면 돌아오고, 안심하면 다시 멀어지며\n이 과정에서 강렬한 도파민을 쏟아냅니다.",
    obsessionRate: 58,
  },
  {
    id: "contact-anxious",
    title: "연락 집착 불안형 남자",
    emoji: "📱",
    subtitle: "Contact-Obsessed Anxious",
    oneLiner: "연락이 안 되면 불안해지는 극도의 애착형 타입",
    description: "당신의 로맨틱하고 따뜻한 인스타 vibe는\n연락에 집착하는 불안형 남자에게 끌리는 경향이 있습니다.",
    gradientClass: "from-[hsl(350,40%,92%)] to-[hsl(340,35%,87%)]",
    aiSummary: "당신의 피드에서는 로맨틱하고 따뜻한 에너지가 물씬 풍겨요. 사랑스러운 일상과 감성적인 순간들이 가득합니다. 이런 따뜻한 분위기는 불안형 애착을 가진 남자의 안전지대가 되어요. AI가 포착한 핵심 매력 포인트는 '따뜻한 안정 에너지'입니다.",
    fallReasons: ["따뜻한 에너지에서 안정감을 발견", "감성적인 콘텐츠에 깊이 공감", "포근한 분위기가 불안감을 잠재움", "순수한 감성이 보호 본능을 자극"],
    pros: ["확실하고 진심 어린 애정 표현", "기념일과 소소한 것까지 기억", "한결같은 일편단심"],
    cons: ["연락 강박이 심함", "독점욕과 질투심이 극심", "감정적 의존도가 매우 높음"],
    attractionStats: [
      { label: "연상 끌림도", value: 45 },
      { label: "동갑 끌림도", value: 70 },
      { label: "연하 끌림도", value: 85 },
      { label: "에겐력", value: 42 },
      { label: "테토력", value: 96 },
    ],
    whyAttracted: "당신의 따뜻하고 로맨틱한 피드가 불안형 남자의 마음을 강하게 잡아당깁니다.\n그들은 당신의 감성에 깊이 공감하며\n자신만이 당신을 완벽하게 이해한다고 확신합니다.",
    datingPattern: "만난 첫날부터 강한 끌림을 느끼고 즉시 연락 폭격을 시작합니다.\n하루에도 수십 번 연락하고, 답장이 늦으면 불안해하며\n관계에서 절대 먼저 포기하지 않는 극도의 직진형입니다.",
    obsessionRate: 98,
  },
  {
    id: "social-popular",
    title: "여사친 많은 인싸 인기남",
    emoji: "🎉",
    subtitle: "Social Butterfly Popular",
    oneLiner: "넓은 인맥과 매력으로 어디서든 인기 있는 타입",
    description: "당신의 밝고 활기찬 인스타 분위기는\n사교적이고 인기 많은 인싸남에게 끌리는 패턴을 보여줍니다.",
    gradientClass: "from-[hsl(340,38%,92%)] to-[hsl(20,35%,87%)]",
    aiSummary: "당신의 인스타는 밝고 에너지 넘치는 분위기가 핵심이에요. 활발한 소셜 라이프가 피드 전반에 드러나고 있습니다. 이런 활기찬 에너지는 사교적이고 분위기를 이끄는 인기남의 관심을 끌어요. AI 분석 핵심 키워드는 '밝은 소셜 에너지'입니다.",
    fallReasons: ["활발한 소셜 라이프에서 공감대 형성", "밝은 에너지가 함께하면 더 재밌을 거란 확신", "사교적 성격이 자신의 세계와 맞음", "긍정적 분위기가 매력적"],
    pros: ["분위기 메이커로 항상 즐거움", "넓은 인맥을 통한 다양한 경험", "유머 감각으로 재미있는 일상"],
    cons: ["여자 사람 친구가 과도하게 많음", "가벼워 보이는 인상", "깊은 감정 대화를 어려워함"],
    attractionStats: [
      { label: "연상 끌림도", value: 38 },
      { label: "동갑 끌림도", value: 90 },
      { label: "연하 끌림도", value: 72 },
      { label: "에겐력", value: 55 },
      { label: "테토력", value: 82 },
    ],
    whyAttracted: "당신의 밝고 에너지 넘치는 피드가 인싸 인기남의 관심을 끌어당깁니다.\n그들은 당신의 활발한 소셜 라이프에서 공감대를 느끼고\n함께하면 더 재미있을 거라 확신합니다.",
    datingPattern: "친구들과 어울리는 자리에서 자연스럽게 다가옵니다.\n유머와 재치로 편안한 분위기를 만들며\n친구에서 연인으로 발전하는 패턴을 보입니다.",
    obsessionRate: 48,
  },
  {
    id: "stable-worker",
    title: "현실적인 안정형 직장남",
    emoji: "🏛️",
    subtitle: "Realistic Stable Worker",
    oneLiner: "안정적인 직장과 믿음직한 성격의 현실파 타입",
    description: "당신의 정돈되고 깔끔한 인스타 피드는\n현실적이고 안정적인 직장 남자에게 끌리는 성향을 보여줍니다.",
    gradientClass: "from-[hsl(150,15%,92%)] to-[hsl(170,12%,87%)]",
    aiSummary: "당신의 인스타에서는 정돈되고 깔끔한 라이프스타일이 느껴져요. 계획적이고 안정적인 일상이 자연스럽게 드러납니다. 이런 분위기는 같은 안정감을 추구하는 직장 남자의 이상형과 정확히 맞아요. AI 핵심 키워드는 '신뢰감 있는 안정미'입니다.",
    fallReasons: ["깔끔한 피드에서 같은 가치관을 발견", "계획적인 라이프스타일에 동질감", "함께 안정적인 미래를 그릴 수 있다는 확신", "성실하고 진지한 분위기에 신뢰감"],
    pros: ["안정적인 수입과 규칙적 생활", "믿음직하고 성실한 성격", "장기적 관계에 진심인 태도"],
    cons: ["다소 재미없고 예측 가능함", "보수적인 사고방식", "모험을 꺼리는 안전 지향"],
    attractionStats: [
      { label: "연상 끌림도", value: 68 },
      { label: "동갑 끌림도", value: 82 },
      { label: "연하 끌림도", value: 28 },
      { label: "에겐력", value: 78 },
      { label: "테토력", value: 42 },
    ],
    whyAttracted: "당신의 깔끔하고 정돈된 인스타 피드가 안정남의 가치관과 맞닿아 있습니다.\n그들은 당신의 계획적이고 성실한 모습에서 함께할 미래를 그리며\n진지하고 꾸준한 마음으로 다가옵니다.",
    datingPattern: "주말마다 정해진 시간에 연락하고 약속을 지킵니다.\n화려하진 않지만 꾸준하고 진심 어린 관심을 보여주며\n장기적인 관계를 전제로 천천히 다가갑니다.",
    obsessionRate: 65,
  },
  {
    id: "gamer-introvert",
    title: "집돌이 아싸 게이머",
    emoji: "🎮",
    subtitle: "Gamer Introvert",
    oneLiner: "집에서 함께 편안하게 시간을 보내는 집순이 타입",
    description: "당신의 따뜻하고 아늑한 인스타 분위기는\n집에서 소소한 일상을 즐기는 집돌이 게이머에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(260,18%,92%)] to-[hsl(250,15%,87%)]",
    aiSummary: "당신의 피드에서는 따뜻하고 아늑한 홈 감성이 느껴져요. 소소한 일상을 소중히 여기는 마음이 곳곳에서 드러납니다. 이런 편안한 분위기는 집에서 함께 시간을 보내고 싶은 집돌이 남자에게 이상적이에요. AI 핵심 에너지는 '아늑한 안정감'입니다.",
    fallReasons: ["아늑한 분위기에서 이상적 파트너를 발견", "편안한 일상을 함께할 수 있다는 기대감", "소소한 것을 소중히 여기는 가치관 공감", "따뜻한 에너지가 자신의 안식처 같은 느낌"],
    pros: ["바람 걱정이 없는 안심 연애", "함께 즐기는 공통 취미", "편안하고 부담 없는 관계"],
    cons: ["외출과 데이트를 극도로 꺼림", "게임에 빠져 연인을 방치 가능", "사회적 활동에 매우 소극적"],
    attractionStats: [
      { label: "연상 끌림도", value: 28 },
      { label: "동갑 끌림도", value: 85 },
      { label: "연하 끌림도", value: 78 },
      { label: "에겐력", value: 45 },
      { label: "테토력", value: 68 },
    ],
    whyAttracted: "당신의 아늑하고 따뜻한 인스타 분위기가 집돌이 남자의 이상형과 딱 맞습니다.\n그들은 당신과 함께 편안한 일상을 보내는 것만으로도 행복을 느끼며\n소소하지만 확실한 사랑을 보여줍니다.",
    datingPattern: "집에서 함께 넷플릭스를 보거나 게임을 하는 것이 최고의 데이트입니다.\n밖에 나가는 것보다 둘만의 아늑한 시간을 선호하며\n조용하지만 꾸준한 애정 표현을 합니다.",
    obsessionRate: 72,
  },
  {
    id: "free-traveler",
    title: "자유로운 회피형 여행남",
    emoji: "✈️",
    subtitle: "Free Avoidant Traveler",
    oneLiner: "세상 어디든 떠나고 싶은 자유로운 회피형 타입",
    description: "당신의 다채롭고 감성적인 인스타 피드는\n자유를 추구하는 회피형 여행남에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(180,20%,92%)] to-[hsl(165,22%,87%)]",
    aiSummary: "당신의 인스타는 다채롭고 모험적인 에너지가 가득해요. 다양한 장소와 경험을 담은 사진들이 자유로운 영혼을 보여줍니다. 이런 분위기는 함께 세상을 탐험하고 싶은 여행남의 마음을 강하게 흔들어요. AI 핵심 에너지는 '모험적 감성'입니다.",
    fallReasons: ["다채로운 피드에서 모험심을 발견", "함께라면 어디든 특별해질 거란 확신", "새로운 경험을 즐기는 열린 마인드에 끌림", "자유로운 에너지가 자신의 라이프스타일과 일치"],
    pros: ["다양하고 새로운 경험 공유", "열린 사고와 유연한 성격", "함께하는 모험이 깊은 유대감 형성"],
    cons: ["정착을 극도로 어려워함", "연락이 뜸해지는 시기가 빈번", "장기적 계획 세우기가 어려움"],
    attractionStats: [
      { label: "연상 끌림도", value: 52 },
      { label: "동갑 끌림도", value: 75 },
      { label: "연하 끌림도", value: 68 },
      { label: "에겐력", value: 48 },
      { label: "테토력", value: 58 },
    ],
    whyAttracted: "당신의 다채로운 인스타 피드가 여행남의 모험 심리를 자극합니다.\n그들은 당신과 함께라면 어디든 특별한 곳이 될 거라 느끼며\n새로운 경험을 공유하고 싶어합니다.",
    datingPattern: "데이트 장소가 항상 새롭고 예측 불가능합니다.\n즉흥적 여행을 제안하거나 이색적 경험을 함께하는 것을 좋아하며\n자유롭지만 진심 어린 감정 표현을 합니다.",
    obsessionRate: 42,
  },
  {
    id: "sns-addict",
    title: "감성 SNS 중독남",
    emoji: "📸",
    subtitle: "SNS-Obsessed Sensitive",
    oneLiner: "SNS에 감성을 쏟아붓는 온라인 감성 타입",
    description: "당신의 감성적이고 세련된 인스타 피드는\nSNS에 진심인 감성 중독형 남자에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(320,25%,92%)] to-[hsl(300,20%,87%)]",
    aiSummary: "당신의 피드는 감성적이면서도 세련된 미학이 돋보여요. 사진 하나하나에 진심을 담는 스타일이 인상적이며, SNS에서의 자기 표현이 뛰어납니다. 이런 감성은 같은 SNS 감성을 공유하는 남자를 끌어당겨요. AI 핵심 키워드는 '온라인 감성 매력'입니다.",
    fallReasons: ["세련된 피드에서 같은 감성을 발견", "사진 하나에도 진심을 담는 점에 공감", "온라인 자기 표현 방식이 매력적", "감성적 콘텐츠가 교감 욕구를 자극"],
    pros: ["감성적 공유가 풍부한 관계", "서로의 사진을 찍어주는 로맨스", "SNS를 통한 꾸준한 소통"],
    cons: ["현실보다 SNS를 우선시할 수 있음", "좋아요와 팔로워에 집착", "온라인 인격과 현실 괴리 가능"],
    attractionStats: [
      { label: "연상 끌림도", value: 42 },
      { label: "동갑 끌림도", value: 82 },
      { label: "연하 끌림도", value: 72 },
      { label: "에겐력", value: 38 },
      { label: "테토력", value: 75 },
    ],
    whyAttracted: "당신의 세련된 피드가 SNS 감성남의 미적 감각을 자극합니다.\n그들은 당신의 사진에서 자신과 같은 감성을 발견하고\n함께 감성적 세계를 만들어가고 싶어합니다.",
    datingPattern: "DM이나 스토리 반응으로 자연스럽게 다가옵니다.\n데이트 중에도 사진 찍기에 진심이며\n커플 피드를 운영하는 것을 관계의 상징으로 여깁니다.",
    obsessionRate: 60,
  },
  {
    id: "tsundere-stable",
    title: "무심한 츤데레 안정남",
    emoji: "❄️",
    subtitle: "Tsundere Stable",
    oneLiner: "무심해 보이지만 속은 따뜻한 안정적 츤데레 타입",
    description: "당신의 차분하고 정돈된 인스타 피드는\n무심해 보이지만 안정적인 츤데레 남자에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(195,18%,92%)] to-[hsl(205,15%,87%)]",
    aiSummary: "당신의 피드에서는 차분하고 정돈된 에너지가 느껴져요. 과하지 않으면서도 확실한 자기만의 스타일이 돋보입니다. 이런 절제된 매력은 겉으로는 무심하지만 내면은 따뜻한 츤데레 남자의 호기심을 자극해요. AI 핵심 키워드는 '절제된 깊이감'입니다.",
    fallReasons: ["절제된 분위기에서 내면의 깊이를 예감", "차분한 에너지가 자신과 비슷하다고 느낌", "쉽게 읽히지 않는 미스터리가 매력적", "독립적인 분위기가 편안함을 줌"],
    pros: ["반전 다정함의 극대화", "한번 마음 열면 진심 100%", "독립적이고 편안한 관계"],
    cons: ["초반 소통이 매우 어려움", "감정 표현 시점이 예측 불가", "오해가 자주 발생"],
    attractionStats: [
      { label: "연상 끌림도", value: 72 },
      { label: "동갑 끌림도", value: 65 },
      { label: "연하 끌림도", value: 35 },
      { label: "에겐력", value: 68 },
      { label: "테토력", value: 55 },
    ],
    whyAttracted: "당신의 차분하고 세련된 피드가 츤데레 남자의 호기심을 자극합니다.\n그들은 쉽게 다가갈 수 없는 당신의 분위기에서 도전을 느끼고\n점점 깊이 빠져들게 됩니다.",
    datingPattern: "처음에는 무관심한 척하지만 사실 모든 것을 기억합니다.\n어느 순간 예상치 못한 다정함으로 심장을 뛰게 만들며\n한번 마음을 열면 누구보다 진심인 연애를 합니다.",
    obsessionRate: 75,
  },
  {
    id: "alpha-direct",
    title: "직진형 테토 알파남",
    emoji: "🦁",
    subtitle: "Direct Alpha Male",
    oneLiner: "한번 마음 먹으면 직진하는 강한 알파 타입",
    description: "당신의 당당하고 자신감 있는 인스타 피드는\n직진형 알파남에게 강하게 끌리는 패턴을 보여줍니다.",
    gradientClass: "from-[hsl(25,40%,91%)] to-[hsl(15,35%,86%)]",
    aiSummary: "당신의 피드에서는 당당하고 자신감 있는 에너지가 느껴져요. 자기만의 확실한 스타일과 강한 개성이 돋보입니다. 이런 당당한 분위기는 직진형 알파남의 도전 본능을 자극해요. AI가 분석한 핵심 키워드는 '당당한 자신감'입니다.",
    fallReasons: ["당당한 자신감에서 도전 의식을 느낌", "확실한 개성이 정복 욕구를 자극", "강한 에너지가 동급의 파트너로 인식됨", "쉽게 무너지지 않는 분위기가 매력적"],
    pros: ["확실하고 강렬한 애정 표현", "리드력이 뛰어난 연애", "보호 본능이 강함"],
    cons: ["독점욕이 매우 강함", "주도권 싸움이 발생 가능", "자신의 방식을 고집하는 경향"],
    attractionStats: [
      { label: "연상 끌림도", value: 80 },
      { label: "동갑 끌림도", value: 60 },
      { label: "연하 끌림도", value: 55 },
      { label: "에겐력", value: 85 },
      { label: "테토력", value: 92 },
    ],
    whyAttracted: "당신의 당당한 피드가 알파남의 도전 본능을 자극합니다.\n그들은 쉽게 무너지지 않는 당신에게서 강한 매력을 느끼고\n한번 마음 먹으면 끝까지 직진합니다.",
    datingPattern: "처음부터 강렬하게 어필하며 주도적으로 다가옵니다.\n데이트 코스, 연락 빈도 등 모든 것을 자신이 리드하려 하며\n관계에서 확실한 주도권을 가지려 합니다.",
    obsessionRate: 80,
  },
  {
    id: "late-night-anxious",
    title: "새벽감성 불안형 남자",
    emoji: "🌙",
    subtitle: "Late-Night Anxious",
    oneLiner: "새벽에 감성이 폭발하는 불안형 로맨티스트 타입",
    description: "당신의 몽환적이고 감성적인 인스타 피드는\n새벽 감성에 빠지는 불안형 남자에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(250,22%,92%)] to-[hsl(270,18%,87%)]",
    aiSummary: "당신의 피드는 몽환적이고 감성이 깊은 에너지가 흘러요. 밤과 어울리는 차분한 색감과 의미심장한 캡션이 독특한 매력을 만듭니다. 이런 감성은 새벽에 감정이 폭발하는 불안형 남자를 끌어당겨요. AI 핵심 키워드는 '몽환적 깊은 감성'입니다.",
    fallReasons: ["몽환적 분위기에서 자신의 감성과 공명", "깊은 감성이 새벽의 외로움을 채워줄 것 같은 기대", "의미심장한 콘텐츠에 정서적 교감", "차분한 에너지가 불안감을 잠재움"],
    pros: ["깊은 감성 대화가 가능", "로맨틱한 표현력이 뛰어남", "감정적 교감이 깊음"],
    cons: ["새벽 연락이 잦아 피로감", "감정 기복이 심함", "불안감이 관계에 부담이 됨"],
    attractionStats: [
      { label: "연상 끌림도", value: 50 },
      { label: "동갑 끌림도", value: 72 },
      { label: "연하 끌림도", value: 78 },
      { label: "에겐력", value: 35 },
      { label: "테토력", value: 85 },
    ],
    whyAttracted: "당신의 몽환적 감성이 새벽감성 남자의 마음을 사로잡습니다.\n그들은 당신의 깊은 감성에서 자신의 외로움을 채울 수 있다 느끼며\n새벽마다 당신을 떠올리게 됩니다.",
    datingPattern: "낮에는 쿨한 척하지만 새벽이 되면 감성이 폭발합니다.\n긴 문자와 노래 공유로 감정을 표현하며\n감정적으로 깊은 교감을 원하지만 낮이 되면 다시 무심해집니다.",
    obsessionRate: 73,
  },
  {
    id: "hipster-loner",
    title: "힙스터 아싸 자유남",
    emoji: "🎧",
    subtitle: "Hipster Free Loner",
    oneLiner: "독특한 취향과 자유로운 영혼을 가진 힙스터 타입",
    description: "당신의 트렌디하면서도 독특한 인스타 피드는\n자유로운 힙스터 아싸 남자에게 끌리는 경향입니다.",
    gradientClass: "from-[hsl(40,35%,92%)] to-[hsl(50,30%,87%)]",
    aiSummary: "당신의 피드는 트렌디하면서도 독특한 취향이 빛나요. 남들과 다른 시각으로 세상을 바라보는 감성이 강하게 드러납니다. 이런 개성은 같은 독특함을 가진 힙스터 남자를 끌어당겨요. AI 핵심 키워드는 '독창적 감성'입니다.",
    fallReasons: ["독특한 취향에서 같은 세계관을 발견", "남들과 다른 시각이 호기심을 자극", "개성 있는 콘텐츠가 영감을 줌", "자유로운 분위기가 자신의 가치관과 일치"],
    pros: ["독특하고 새로운 경험 공유", "서로의 개성을 존중하는 관계", "지적이고 창의적인 대화"],
    cons: ["고집이 강하고 타협 어려움", "사회성이 매우 부족", "자기만의 세계에 갇힐 수 있음"],
    attractionStats: [
      { label: "연상 끌림도", value: 45 },
      { label: "동갑 끌림도", value: 80 },
      { label: "연하 끌림도", value: 65 },
      { label: "에겐력", value: 42 },
      { label: "테토력", value: 55 },
    ],
    whyAttracted: "당신의 독특하고 트렌디한 피드가 힙스터 남자의 감성을 자극합니다.\n그들은 당신의 독창적 시각에서 같은 세계관을 발견하고\n함께 독특한 경험을 공유하고 싶어합니다.",
    datingPattern: "일반적인 데이트 코스를 거부하고 숨겨진 장소를 탐험합니다.\n독립영화, 빈티지 마켓, 로컬 카페 등 남들이 모르는 곳을 찾으며\n관계에서도 자유롭고 독립적인 분위기를 유지합니다.",
    obsessionRate: 40,
  },
  {
    id: "rich-empty",
    title: "돈은 많은데 정서 빈곤남",
    emoji: "💎",
    subtitle: "Rich but Emotionally Poor",
    oneLiner: "경제력은 넘치지만 정서적으로 공허한 타입",
    description: "당신의 세련되고 고급스러운 인스타 피드는\n경제력은 있지만 정서적으로 공허한 남자에게 끌리는 패턴입니다.",
    gradientClass: "from-[hsl(48,45%,91%)] to-[hsl(38,40%,86%)]",
    aiSummary: "당신의 피드는 고급스럽고 세련된 라이프스타일이 돋보여요. 퀄리티 높은 사진과 정돈된 구도가 성숙한 취향을 보여줍니다. 이런 분위기는 물질적으로는 풍요롭지만 정서적 교감을 갈구하는 남자를 끌어당겨요. AI 핵심 키워드는 '고급 감성'입니다.",
    fallReasons: ["고급스러운 취향에서 자신의 세계관과 맞는 사람 발견", "세련된 라이프스타일이 함께 공유하고 싶은 욕구 자극", "정서적 깊이가 자신에게 부족한 것을 채워줄 기대", "차분하고 성숙한 에너지에 정서적 안정감을 느낌"],
    pros: ["경제적으로 여유로운 연애", "고급스러운 데이트 경험", "물질적 지원에 아낌없음"],
    cons: ["감정 표현이 물질로 대체됨", "정서적 교감 능력이 부족", "진심보다 조건을 앞세우는 경향"],
    attractionStats: [
      { label: "연상 끌림도", value: 90 },
      { label: "동갑 끌림도", value: 42 },
      { label: "연하 끌림도", value: 15 },
      { label: "에겐력", value: 98 },
      { label: "테토력", value: 28 },
    ],
    whyAttracted: "당신의 고급스러운 피드가 정서 빈곤남의 마음을 사로잡습니다.\n그들은 당신의 세련된 취향에서 자신과 어울리는 파트너를 발견하고\n물질적 풍요로 당신의 마음을 얻으려 합니다.",
    datingPattern: "고급 레스토랑, 명품 선물 등 물질적 어필로 접근합니다.\n감정 표현은 서툴지만 물질적 지원에는 아낌이 없으며\n진심을 보여주는 방법을 몰라 늘 선물로 대체합니다.",
    obsessionRate: 55,
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

export function getUserVibeType(id: string): UserVibeType {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 41 + id.charCodeAt(i)) % userVibeTypes.length;
  }
  return userVibeTypes[Math.abs(hash) % userVibeTypes.length];
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
  { photoMood: "트렌디한", colorTone: "하이톤", vibeKeyword: "힙한", captionStyle: "감각형" },
  { photoMood: "로맨틱한", colorTone: "핑크톤", vibeKeyword: "사랑스러운", captionStyle: "로맨스형" },
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
  return 75 + (Math.abs(hash) % 21);
}

export interface InstaProfile {
  followers: number;
  following: number;
  posts: number;
  followerBreakdown: { label: string; percent: number; emoji: string }[];
  followingBreakdown: { label: string; percent: number; emoji: string }[];
  topInterests: string[];
  activeTime: string;
  avgLikes: number;
  engagementRate: number;
}

const followerCategories = [
  { label: "동갑 또래 친구", emoji: "👫" },
  { label: "학교/직장 동료", emoji: "🏫" },
  { label: "관심사 기반 팔로워", emoji: "💫" },
  { label: "연애 관심 남성", emoji: "💘" },
  { label: "브랜드/셀럽 계정", emoji: "✨" },
  { label: "해외 팔로워", emoji: "🌍" },
];

const followingCategories = [
  { label: "패션/뷰티 계정", emoji: "👗" },
  { label: "카페/맛집 계정", emoji: "☕" },
  { label: "감성 사진 계정", emoji: "📷" },
  { label: "연예인/인플루언서", emoji: "⭐" },
  { label: "여행/라이프 계정", emoji: "✈️" },
  { label: "친구/지인", emoji: "🤝" },
];

const interestSets = [
  ["카페투어", "필름카메라", "독립서점", "빈티지", "재즈"],
  ["여행", "요가", "브런치", "와인", "갤러리"],
  ["패션", "뷰티", "네일아트", "쇼핑", "OOTD"],
  ["독서", "글쓰기", "차", "명상", "클래식"],
  ["맛집탐방", "요리", "베이킹", "홈카페", "플레이팅"],
  ["운동", "필라테스", "러닝", "헬시푸드", "셀프케어"],
  ["음악", "공연", "페스티벌", "LP수집", "힙합"],
  ["그림", "일러스트", "전시", "아트북", "캘리그라피"],
];

const activeTimes = ["밤 10시~새벽 1시", "오후 6시~9시", "오전 7시~9시", "새벽 1시~3시", "오후 12시~2시"];

export function getInstaProfile(id: string): InstaProfile {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 29 + id.charCodeAt(i)) % 10000;

  const followers = 180 + (Math.abs(h) % 2800);
  const following = 120 + (Math.abs((h * 7) % 1500));
  const posts = 30 + (Math.abs((h * 3) % 270));
  const avgLikes = Math.round(followers * (0.08 + (Math.abs(h % 12) / 100)));
  const engagementRate = parseFloat((avgLikes / followers * 100).toFixed(1));

  // Generate follower breakdown
  const fBreak: { label: string; percent: number; emoji: string }[] = [];
  let remaining = 100;
  const fIndices = [0, 1, 2, 3, 4, 5].sort((a, b) => ((h * (a + 1)) % 7) - ((h * (b + 1)) % 7));
  for (let i = 0; i < followerCategories.length; i++) {
    const cat = followerCategories[fIndices[i]];
    const pct = i < followerCategories.length - 1
      ? Math.max(5, Math.min(remaining - (followerCategories.length - i - 1) * 5, 10 + (Math.abs((h * (i + 3)) % 30))))
      : remaining;
    fBreak.push({ ...cat, percent: pct });
    remaining -= pct;
  }

  // Generate following breakdown
  const gBreak: { label: string; percent: number; emoji: string }[] = [];
  remaining = 100;
  const gIndices = [0, 1, 2, 3, 4, 5].sort((a, b) => ((h * (a + 2)) % 9) - ((h * (b + 2)) % 9));
  for (let i = 0; i < followingCategories.length; i++) {
    const cat = followingCategories[gIndices[i]];
    const pct = i < followingCategories.length - 1
      ? Math.max(5, Math.min(remaining - (followingCategories.length - i - 1) * 5, 10 + (Math.abs((h * (i + 5)) % 30))))
      : remaining;
    gBreak.push({ ...cat, percent: pct });
    remaining -= pct;
  }

  const topInterests = interestSets[Math.abs(h) % interestSets.length];
  const activeTime = activeTimes[Math.abs(h * 3) % activeTimes.length];

  return { followers, following, posts, followerBreakdown: fBreak, followingBreakdown: gBreak, topInterests, activeTime, avgLikes, engagementRate };
}
