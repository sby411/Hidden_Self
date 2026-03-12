export interface VibeResult {
  id: string;
  title: string;
  subtitle: string;
  oneLiner: string;
  description: string;
  detailParagraph: string;
  vibeCodes: string[];
  emoji: string;
  gradientClass: string;
  colors: string[];
  styleKeywords: string[];
  stats: { label: string; value: string }[];
}

export const sampleResults: VibeResult[] = [
  {
    id: "dreamy",
    title: "몽환 낭만",
    subtitle: "Dreamy Romantic",
    oneLiner: "감성적인 분위기와 부드러운 aesthetic을 추구하는 타입",
    description:
      "부드러운 색감과 감성적인 이미지가 많습니다.\n일상 속에서 영화 같은 장면을 만들어내는 분위기를 가지고 있습니다.",
    detailParagraph:
      "당신의 피드에는 따뜻한 조명 아래 흐릿하게 번지는 빛과, 고요한 오후의 정적이 담겨 있어요. 어디를 가든 그 장소만의 분위기를 포착하는 눈을 가졌고, 사소한 일상도 한 편의 단편영화처럼 기록하는 사람. 흐린 하늘도, 빈 카페의 창가도 당신의 렌즈를 통하면 누군가의 마음을 두드리는 한 장면이 됩니다.",
    vibeCodes: ["dreamy", "soft", "romantic"],
    emoji: "🌙",
    gradientClass: "from-[hsl(340,40%,88%)] to-[hsl(280,30%,90%)]",
    colors: ["베이지", "크림", "라이트 핑크"],
    styleKeywords: ["빈티지", "필름톤", "내추럴 감성"],
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
    oneLiner: "깨끗하고 투명한 분위기로 설렘을 자아내는 타입",
    description:
      "깨끗하고 자연스러운 이미지가 돋보이는 스타일입니다.\n꾸밈없는 아름다움 속에서 진정한 매력이 빛나는 타입이에요.",
    detailParagraph:
      "당신의 피드를 스크롤하면 마치 봄날 아침의 공기를 마시는 것 같은 느낌이 들어요. 햇살이 머무는 자리, 바람에 흔들리는 꽃잎, 수줍게 웃는 표정 — 당신은 있는 그대로의 모습에서 가장 빛나는 사람이에요. 사람들은 당신의 피드에서 잃어버린 설렘을 다시 찾게 됩니다.",
    vibeCodes: ["pure", "natural", "fresh"],
    emoji: "🌸",
    gradientClass: "from-[hsl(350,50%,92%)] to-[hsl(20,60%,92%)]",
    colors: ["화이트", "소프트 핑크", "스카이 블루"],
    styleKeywords: ["청량", "내추럴", "투명 메이크업"],
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
    oneLiner: "따뜻한 온기와 편안함으로 마음을 녹이는 타입",
    description:
      "따뜻하고 포근한 분위기가 피드 전체에 가득한 스타일입니다.\n사람들에게 편안함과 안정감을 주는 특별한 매력을 지니고 있어요.",
    detailParagraph:
      "당신의 피드는 마치 겨울밤 이불 속에서 따뜻한 코코아를 마시는 것 같은 안도감을 줘요. 좋아하는 카페의 창가 자리, 김이 모락모락 나는 홈쿠킹 — 당신이 담는 모든 것에는 '집'이라는 단어가 가진 포근함이 깃들어 있어요. 당신의 피드를 보면 누구든 마음이 말랑해집니다.",
    vibeCodes: ["warm", "cozy", "homey"],
    emoji: "☕",
    gradientClass: "from-[hsl(30,50%,90%)] to-[hsl(20,40%,88%)]",
    colors: ["카멜", "아이보리", "머스타드"],
    styleKeywords: ["니트", "어스톤", "홈카페"],
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
    oneLiner: "트렌드를 리드하며 자기만의 룰로 사는 타입",
    description:
      "트렌디하면서도 자신만의 스타일이 확고한 타입입니다.\n남들과 다른 시선으로 세상을 바라보는 독보적인 감각의 소유자예요.",
    detailParagraph:
      "당신의 피드에는 '대세'를 따르기보다 '나다움'을 만들어가는 자신감이 느껴져요. 골목의 그래피티, 빈티지 숍의 한 켤레, 아무도 모르는 루프탑에서의 석양 — 당신은 자신만의 필터로 세상을 재해석하는 사람이에요. 사람들은 당신의 피드에서 영감을 얻어갑니다.",
    vibeCodes: ["edgy", "trendy", "bold"],
    emoji: "🖤",
    gradientClass: "from-[hsl(260,20%,90%)] to-[hsl(220,20%,88%)]",
    colors: ["블랙", "올리브", "데님 블루"],
    styleKeywords: ["스트릿", "레이어드", "유니크"],
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
    oneLiner: "절제된 세련미와 모던한 감각의 도시형 타입",
    description:
      "세련되고 모던한 감성이 피드 곳곳에 묻어나는 스타일입니다.\n도시의 리듬을 자연스럽게 담아내는 감각적인 타입이에요.",
    detailParagraph:
      "당신의 피드는 도시의 스카이라인처럼 날카롭고 아름다워요. 깔끔한 라인, 모노톤 코디, 미니멀한 테이블 세팅 — 불필요한 것을 걷어낸 자리에서 피어나는 세련됨이 당신의 무기예요. 적게 보여주면서도 강렬한 인상을 남기는 법을 본능적으로 아는 사람.",
    vibeCodes: ["minimal", "chic", "urban"],
    emoji: "🏙️",
    gradientClass: "from-[hsl(210,15%,92%)] to-[hsl(200,20%,88%)]",
    colors: ["차콜", "슬레이트", "실버"],
    styleKeywords: ["미니멀", "모노톤", "클린핏"],
    stats: [
      { label: "감성 지수", value: "72%" },
      { label: "색감 톤", value: "쿨 그레이" },
      { label: "무드", value: "미니멀" },
    ],
  },
  {
    id: "classicElegant",
    title: "클래식 우아",
    subtitle: "Classic Elegant",
    oneLiner: "시대를 초월하는 품격과 단아한 아름다움의 타입",
    description:
      "격식 있고 단정한 이미지를 자연스럽게 풍기는 스타일입니다.\n클래식한 아이템과 정돈된 구도에서 당신만의 우아함이 드러나요.",
    detailParagraph:
      "당신의 피드에는 유행을 타지 않는 아름다움이 있어요. 잘 다림질된 셔츠, 진주 귀걸이, 깔끔하게 정돈된 책상 위 — 모든 것이 자기 자리를 찾은 듯 안정적이에요. 당신은 화려하지 않아도 눈길을 사로잡는 사람, 조용히 빛나는 타입입니다.",
    vibeCodes: ["classic", "elegant", "refined"],
    emoji: "🪞",
    gradientClass: "from-[hsl(35,30%,92%)] to-[hsl(25,25%,89%)]",
    colors: ["네이비", "버건디", "골드"],
    styleKeywords: ["클래식핏", "진주", "트렌치코트"],
    stats: [
      { label: "감성 지수", value: "80%" },
      { label: "색감 톤", value: "딥 뉴트럴" },
      { label: "무드", value: "품격" },
    ],
  },
  {
    id: "vintageVibes",
    title: "빈티지 감성",
    subtitle: "Vintage Soul",
    oneLiner: "과거의 아름다움을 현재에 녹여내는 감성가 타입",
    description:
      "레트로한 색감과 아날로그 감성이 피드 전체를 물들이는 스타일입니다.\n오래된 것에서 새로운 가치를 발견하는 섬세한 눈을 가지고 있어요.",
    detailParagraph:
      "당신의 피드에는 필름 카메라의 온기와 벼룩시장에서 건진 보물 같은 순간들이 가득해요. LP판 위에 올려진 바늘처럼, 당신은 느리지만 깊은 감동을 주는 사람이에요. 디지털 시대에 아날로그의 아름다움을 지켜가는 당신이야말로 진짜 감성가입니다.",
    vibeCodes: ["retro", "analog", "nostalgic"],
    emoji: "📷",
    gradientClass: "from-[hsl(40,35%,90%)] to-[hsl(30,30%,86%)]",
    colors: ["세피아", "올드 로즈", "카키"],
    styleKeywords: ["필름감성", "레트로", "빈티지숍"],
    stats: [
      { label: "감성 지수", value: "90%" },
      { label: "색감 톤", value: "세피아" },
      { label: "무드", value: "노스탤지아" },
    ],
  },
  {
    id: "pureGraceful",
    title: "청초 우아",
    subtitle: "Graceful Purity",
    oneLiner: "맑고 깨끗한 기품이 자연스럽게 배어나는 타입",
    description:
      "과하지 않은 절제미와 깨끗한 분위기가 돋보이는 스타일입니다.\n조용하지만 확실한 존재감으로 시선을 끄는 타입이에요.",
    detailParagraph:
      "당신의 피드에는 아침 이슬처럼 맑은 분위기가 흐르고 있어요. 깨끗한 리넨, 산뜻한 그린, 잘 정돈된 공간 — 절제 속에서 피어나는 우아함이 당신의 가장 큰 매력이에요. 많은 것을 보여주지 않아도 충분히 아름다운, 그런 사람.",
    vibeCodes: ["graceful", "clean", "serene"],
    emoji: "🕊️",
    gradientClass: "from-[hsl(150,20%,92%)] to-[hsl(170,15%,90%)]",
    colors: ["민트", "오프화이트", "라이트 세이지"],
    styleKeywords: ["린넨", "미니멀", "뮤트톤"],
    stats: [
      { label: "감성 지수", value: "85%" },
      { label: "색감 톤", value: "뮤트 그린" },
      { label: "무드", value: "청아" },
    ],
  },
  {
    id: "freeArtist",
    title: "자유로운 예술가",
    subtitle: "Free Spirit Artist",
    oneLiner: "틀에 갇히지 않는 창의적 영혼의 소유자 타입",
    description:
      "자유롭고 실험적인 감성이 피드 곳곳에서 느껴지는 스타일입니다.\n예측 불가능한 매력으로 사람들의 호기심을 자극하는 타입이에요.",
    detailParagraph:
      "당신의 피드는 하나의 갤러리 같아요. 과감한 앵글, 예상치 못한 색 조합, 일상을 예술로 바꾸는 시선 — 당신은 규칙을 따르기보다 자신만의 규칙을 만드는 사람이에요. 그 자유로움이 사람들에게 '나도 이렇게 살고 싶다'는 영감을 줍니다.",
    vibeCodes: ["creative", "free", "artistic"],
    emoji: "🎨",
    gradientClass: "from-[hsl(300,25%,92%)] to-[hsl(260,25%,90%)]",
    colors: ["라벤더", "테라코타", "터콰이즈"],
    styleKeywords: ["아트워크", "믹스매치", "보헤미안"],
    stats: [
      { label: "감성 지수", value: "87%" },
      { label: "색감 톤", value: "비비드" },
      { label: "무드", value: "자유분방" },
    ],
  },
  {
    id: "lovelyGirl",
    title: "러블리 소녀감성",
    subtitle: "Lovely Girl Vibes",
    oneLiner: "사랑스럽고 달콤한 에너지가 넘치는 타입",
    description:
      "핑크와 파스텔이 자연스럽게 어울리는 달콤한 스타일입니다.\n밝고 긍정적인 에너지로 보는 사람까지 행복하게 만드는 타입이에요.",
    detailParagraph:
      "당신의 피드는 마치 딸기 케이크 위에 올려진 크림처럼 달콤해요. 귀여운 소품, 파스텔 톤의 일상, 밝은 미소 — 당신이 있는 곳에는 항상 따뜻한 빛이 있어요. 그 사랑스러움은 억지가 아니라 당신의 본질이기에 더욱 특별합니다.",
    vibeCodes: ["lovely", "sweet", "cute"],
    emoji: "🎀",
    gradientClass: "from-[hsl(340,50%,92%)] to-[hsl(350,45%,90%)]",
    colors: ["베이비 핑크", "라일락", "피치"],
    styleKeywords: ["리본", "프릴", "파스텔"],
    stats: [
      { label: "감성 지수", value: "93%" },
      { label: "색감 톤", value: "파스텔" },
      { label: "무드", value: "로맨틱" },
    ],
  },
  {
    id: "coolMinimal",
    title: "쿨 미니멀",
    subtitle: "Cool Minimal",
    oneLiner: "군더더기 없는 쿨함으로 시선을 사로잡는 타입",
    description:
      "깔끔하고 정제된 피드가 인상적인 스타일입니다.\n말보다 이미지로 말하는, 절제의 미학을 아는 타입이에요.",
    detailParagraph:
      "당신의 피드는 잘 편집된 매거진 한 페이지 같아요. 여백의 미, 정돈된 라인, 흑백 사이의 미묘한 톤 — 불필요한 것을 과감히 덜어내는 용기가 오히려 강렬한 인상을 만들어요. 적을수록 강하다는 것을 본능적으로 아는 사람, 그게 바로 당신이에요.",
    vibeCodes: ["cool", "minimal", "clean"],
    emoji: "◻️",
    gradientClass: "from-[hsl(220,10%,93%)] to-[hsl(210,12%,90%)]",
    colors: ["화이트", "라이트 그레이", "블랙"],
    styleKeywords: ["모노톤", "여백", "클린"],
    stats: [
      { label: "감성 지수", value: "65%" },
      { label: "색감 톤", value: "모노크롬" },
      { label: "무드", value: "쿨" },
    ],
  },
  {
    id: "cinematic",
    title: "감성 시네마틱",
    subtitle: "Cinematic Soul",
    oneLiner: "모든 순간을 영화의 한 장면으로 만드는 타입",
    description:
      "극적인 조명과 깊이 있는 구도가 돋보이는 스타일입니다.\n당신의 피드는 그 자체로 하나의 영화 같은 서사를 가지고 있어요.",
    detailParagraph:
      "당신의 피드를 넘기면 마치 한 편의 영화 예고편을 보는 것 같은 몰입감이 있어요. 역광으로 물든 실루엣, 비 오는 거리의 반사광, 창문 너머로 보이는 도시의 야경 — 당신은 일상에서 드라마를 발견하는 감독의 눈을 가졌어요. 그 깊이감이 사람들을 당신의 세계로 끌어들입니다.",
    vibeCodes: ["cinematic", "dramatic", "moody"],
    emoji: "🎬",
    gradientClass: "from-[hsl(220,20%,88%)] to-[hsl(240,15%,86%)]",
    colors: ["미드나잇 블루", "앰버", "딥 브라운"],
    styleKeywords: ["무드등", "역광", "필름누아르"],
    stats: [
      { label: "감성 지수", value: "94%" },
      { label: "색감 톤", value: "딥톤" },
      { label: "무드", value: "드라마틱" },
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
