/**
 * 재회 리포트 데이터 모델 + 결정적 더미 생성.
 * 실제 분석 연동 시 동일 키에 API/AI 결과를 주입하면 됩니다.
 */

export type ReunionScores = {
  /** 두 계정 종합 재회 가능성 (0–100) */
  reunionPossibility: number;
  /** 상대의 재회·관계 개방도 (0–100) */
  theirReunionOpenness: number;
  /** 지금 연락 시도 적합도 (0–100) */
  contactTimingFit: number;
};

/** 내 계정: 피드·프로필 기반 신호 블록 */
export type MyProfileSignals = {
  /** 어떤 표면 신호를 봤는지 (투명성) */
  observedFrom: string;
  emotionalState: string;
  relationshipOpenness: string;
  lingeringAttachment: string;
  contactInitiationTendency: string;
};

/** 상대 계정: 동일 계열 + 재회·선제연락 */
export type TheirProfileSignals = {
  observedFrom: string;
  emotionalState: string;
  relationshipOpenness: string;
  newPeopleReadiness: string;
  reunionOpenness: string;
  likelyToReachOutFirst: string;
};

/** 상대 중심 심화 (가능성/신호 톤) */
export type TheirFocusReport = {
  genderOrContextSignal: string;
  currentRelationshipOpenness: string;
  likelyDatingSomeoneSignals: string;
  relationshipStyle: string;
  unconsciousDefensePattern: string;
  reunionClosureRead: string;
};

export type ReunionSynthesis = {
  whyThisScore: string;
  keyVariable: string;
  ifClosedWhy: string;
  ifOpenHow: string;
};

export type ReunionActionGuide = {
  contactNowGuidance: string;
  waitGuidance: string;
  avoidActions: string;
  toneIfContact: string;
};

export type ReunionPremiumCard = {
  title: string;
  body: string;
};

/** API/AI 매핑용 상위 필드 (문단 문자열) */
export type ReunionReportPayload = {
  myProfileSignals: MyProfileSignals;
  theirProfileSignals: TheirProfileSignals;
  reunionReadiness: string;
  relationshipOpenness: string;
  currentDatingLikelihood: string;
  unconsciousPattern: string;
  contactTiming: string;
  finalRecommendation: string;
};

export type ReunionFullReport = ReunionReportPayload & {
  summaryTitle: string;
  summaryLine: string;
  scores: ReunionScores;
  theirFocus: TheirFocusReport;
  synthesis: ReunionSynthesis;
  actionGuide: ReunionActionGuide;
  premiumLocked: ReunionPremiumCard[];
};

function hashKey(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

function pick<T>(h: number, salt: number, arr: readonly T[]): T {
  return arr[(h ^ salt) % arr.length];
}

function scoreTriplet(h: number): ReunionScores {
  const base = 36 + (h % 28);
  const open = 32 + ((h >> 4) % 32);
  const contact = 28 + ((h >> 8) % 38);
  return {
    reunionPossibility: Math.min(88, Math.max(34, base)),
    theirReunionOpenness: Math.min(86, Math.max(30, open)),
    contactTimingFit: Math.min(82, Math.max(26, contact)),
  };
}

const SUMMARY_LINES = [
  "지금 상대는 완전히 닫힌 상태는 아니지만, 먼저 다가오는 타입은 아닙니다. 신호상 여지는 있으나 해석의 폭이 남아 있어요.",
  "두 계정 모두 감정의 잔여물이 완전히 사라진 톤은 아니에요. 다만 그 잔여물이 곧바로 '연락을 반긴다'는 뜻은 아닙니다.",
  "상대 쪽에서 관계를 다시 여는 문은 살짝 열려 보이는 구간이 있어요. 다만 그 문은 넓게 열린 상태라기보다, 상황에 따라 닫힐 수 있는 폭이 큽니다.",
  "내 계정 신호는 아직 정리 중인 감정이 겉으로도 읽히는 편이에요. 상대는 겉으로는 단정해 보이나, 세부 톤에서 방어가 남아 있을 가능성이 있습니다.",
] as const;

function buildReport(h: number): ReunionFullReport {
  const scores = scoreTriplet(h);
  const summaryLine = pick(h, 1, SUMMARY_LINES);

  const my: MyProfileSignals = {
    observedFrom:
      "프로필 소개 문구, 최근 게시물 캡션의 반복 키워드, 피드 톤(밝음/차분/과장), 스토리 하이라이트 구성, 업로드 간격 등 공개 영역에서 읽히는 패턴을 기준으로 했습니다.",
    emotionalState: pick(h, 2, [
      "최근 캡션과 이미지 톤이 '괜찮아 보이려는' 구성이 섞여 있어요. 겉은 가볍게 보이나, 특정 주제에서만 감정 밀도가 올라가는 흔적이 신호로 잡힙니다.",
      "피드 리듬이 다소 불규칙하고, 감정을 직접 말하기보다 은유·노래 가사·짧은 문장으로 대신하는 패턴이 보입니다. 아직 정리 중인 감정이 옅게 비치는 편이에요.",
      "전반적으로 안정된 톤을 유지하려 하지만, 예전 대비 '관계'나 '이별'에 닿는 단어 선택이 조심스러운 경향이 있어요.",
    ]),
    relationshipOpenness: pick(h, 3, [
      "새로운 관계를 적극적으로 열어두는 톤보다는, 일단 나를 지키는 방향의 서사가 앞에 서 있는 느낌입니다.",
      "타인과의 경계는 비교적 분명하고, 동시에 외로움이나 그리움을 완전히 지운 상태는 아니라고 읽힙니다.",
      "관계에 대한 언급은 줄었지만, '혼자 잘 지냄'을 과시하는 쪽에 가깝다면 방어적 자기안정일 수 있어요.",
    ]),
    lingeringAttachment: pick(h, 4, [
      "과거 관계를 직접 언급하진 않아도, 시간·장소·감정을 트리거할 만한 소재가 간헐적으로 반복됩니다. 미련이 '폭발적'이라기보다는 잔류형에 가깝게 읽혀요.",
      "팔로우·태그·하이라이트에서 특정 시기 콘텐츠가 상대적으로 많이 남아 있는 편이에요. 정리가 끝난 사람의 전형적인 미니멀 피드와는 거리가 있습니다.",
      "미련이 크게 드러나진 않지만, 갑작스러운 활동 중단이나 반대로 과한 활동 증가 같은 '리듬 변화'가 신호로 포착됩니다.",
    ]),
    contactInitiationTendency: pick(h, 5, [
      "스토리 반응이나 가벼운 리액션으로 접점을 테스트하려는 패턴이 있을 수 있어요. 큰 대화보다는 작은 신호로 먼저 온도를 재는 쪽에 가깝습니다.",
      "감정이 올라오면 먼저 연락하기보다, 캡션이나 노출로 우회적으로 신호를 보낼 가능성이 신호상 더 큽니다.",
      "이미 한 번 크게 다가갔다가 물러선 경험이 있을 때 흔한 '다시는 안 한다' 선언형 톤과 실제 행동(스토리 확인 등) 사이에 간극이 보일 수 있어요.",
    ]),
  };

  const their: TheirProfileSignals = {
    observedFrom:
      "상대 공개 프로필의 바이오 톤, 피드의 주제 분산도, 타인과의 태그 빈도, 캡션의 감정 거리감, 하이라이트에 남긴 관계 서사 등을 함께 봤습니다.",
    emotionalState: pick(h, 6, [
      "겉으로는 단정하고 일상 중심의 피드를 유지하지만, 특정 시기 게시물의 톤이나 스토리 소재에서 감정의 '잔여물'이 옅게 남아 있을 수 있어요.",
      "최근 들어 새로운 취미·사람·장소 노출이 늘었다면, 관심사 전환일 수도 있고 회피적 리셋일 수도 있어요. 단정은 피합니다.",
      "감정 표현이 줄고, 브랜드·풍경·업무 중심으로 피드가 이동한 경우가 많습니다. '정리 완료' 신호일 수도, '말하지 않는 정리 중'일 수도 있어요.",
    ]),
    relationshipOpenness: pick(h, 7, [
      "새 관계를 열어둔다기보다, 일단 '나만의 영역'을 확보하는 쪽의 서사가 강해 보입니다.",
      "타인과의 친밀 노출은 있으나, 연애 서사로 읽히는 태그·캡션은 신중한 편이에요.",
      "관계에 대한 직접 언급은 드물고, 경계를 분명히 하는 이미지 운용이 보입니다.",
    ]),
    newPeopleReadiness: pick(h, 8, [
      "새로운 사람을 받아들일 '공간'이 완전히 비어 보이진 않지만, 깊은 교류까지 열려 있다고 보기엔 신호가 엇갈립니다.",
      "사교적 노출은 있으나, 감정적 깊이가 필요한 관계로의 전환 신호는 아직 약한 편으로 읽힐 수 있어요.",
      "외부 자극(모임·여행·소개)에는 열려 있어 보이나, 연인 관계로의 재진입은 별도의 문턱이 있어 보입니다.",
    ]),
    reunionOpenness: pick(h, 9, [
      "재회에 '완전 닫힘'이라기보다, 조건부·상황부로 열려 있을 가능성이 신호상 더 큽니다. 다만 그 조건이 말로 명시되지는 않아요.",
      "과거 관계를 부정하지는 않지만, 다시 열기를 적극 홍보하는 톤도 아닙니다. 중립적 거리에서 관찰할 여지가 남습니다.",
      "상대 스스로 먼저 재회를 열어젖히기보다는, 부담 낮은 접점에서 반응이 생기면 움직일 수 있는 타입에 가깝게 읽힐 수 있어요.",
    ]),
    likelyToReachOutFirst: pick(h, 10, [
      "먼저 긴 메시지를 보내거나 관계를 정의하려는 스타일은 신호상 낮은 편으로 보입니다. 짧고 가벼운 접점 쪽 가능성이 더 큽니다.",
      "자존심·경계·피로감 중 무엇이든 '먼저 잡는 것'에 대한 비용을 크게 느끼는 톤이 섞여 있을 수 있어요.",
      "만약 먼저 연락한다면, 감정 고백보다는 일상·업무·공통 관심사 같은 안전한 빌드업 쪽이 더 자연스러울 수 있습니다.",
    ]),
  };

  const theirFocus: TheirFocusReport = {
    genderOrContextSignal: pick(h, 11, [
      "프로필만으로 성별을 단정하지 않습니다. 다만 캡션·태그·하이라이트에서 '이성·친구·관계' 맥락이 어떻게 배치되는지를 중심으로 읽었습니다.",
      "관계 맥락의 단서는 간접적으로 주로 드러납니다. 직접적인 연애 공개 없이도, 특정 인물과의 반복 노출이나 거리감 조절이 신호가 될 수 있어요.",
      "이성 관계 서사가 드러나는 방식이 '과시형'인지 '숨김형'인지에 따라 해석이 달라져요. 지금은 후자 쪽 신호가 조금 더 짙게 잡힙니다.",
    ]),
    currentRelationshipOpenness: pick(h, 12, [
      "지금 당장 깊은 관계를 열어두기보다는, 감정 에너지를 회복·분산하는 단계로 보이는 흔적이 있습니다.",
      "새로운 만남 가능성을 완전히 닫지는 않았지만, 우선순위가 높지 않을 수 있어요.",
      "관계에 대한 언급이 줄고 일상 리듬이 안정된 것처럼 보이나, 그 안정이 '진짜 평온'인지 '억제'인지는 교차 신호가 필요합니다.",
    ]),
    likelyDatingSomeoneSignals: pick(h, 72, [
      "특정 인물과의 반복 태그·유사한 장소·시간대 스토리가 겹친다면 가능성을 열어둘 수 있어요. 다만 친구·업무 관계일 수도 있어 단정하지 않습니다.",
      "연애를 암시하는 직접 증거는 약하고, 오히려 '관계 공백'을 채우는 소소한 사교 활동 신호가 더 두드러질 수 있어요.",
      "새 인물 단독 노출이 갑자기 늘었다면 주목할 만하지만, 그것만으로 교제 중이라고 말하긴 이릅니다.",
    ]),
    relationshipStyle: pick(h, 13, [
      "갈등이 생기면 먼저 정리하려 하기보다 거리를 두고 상황이 가라앉기를 기다리는 성향이 신호에 섞여 있을 수 있어요.",
      "관계에서의 기대치를 말로 명확히 하는 편보다, 행동과 노출로 간접 표현하는 쪽에 가깝습니다.",
      "친밀해질수록 경계를 다시 세우는 패턴이 반복될 수 있는 타입으로 읽힐 여지가 있습니다.",
    ]),
    unconsciousDefensePattern: pick(h, 14, [
      "감정이 올라올 때 '바쁨·친구·일'로 화제를 전환하거나, 유머로 덮는 방식의 방어가 보일 수 있어요.",
      "상처받기 싫어서 먼저 차갑게 보이려는 선제적 거리두기 패턴이 무의식에 깔려 있을 수 있습니다.",
      "잘못을 인정하기보다 상황을 재해석해 자기 내러티브를 보호하는 경향이 신호에 옅게 섞여 있을 수 있어요.",
    ]),
    reunionClosureRead: pick(h, 15, [
      "완전히 닫아버린 사람의 전형적 패턴(관계 흔적 최소화, 감정 언어 제거, 새 서사 강한 전환)과는 거리가 있습니다. 해석의 여지가 남아 있어요.",
      "닫힌 듯 보이나, 특정 트리거에서 반응이 달라지는 흔적이 있다면 '단단한 종료'보다 '억제된 종료'에 가까울 수 있어요.",
      "지금은 재회를 적극 열어두는 단계라기보다, 상황이 바뀌면 다시 해석될 수 있는 중간 상태로 보는 편이 신호와 맞습니다.",
    ]),
  };

  const reunionReadiness = pick(h, 16, [
    "상대의 재회 준비도는 '지금 당장'보다는 조건부로 읽히는 편이에요. 부담이 낮고 자존심이 덜 건드는 접점이 있을 때만 움직일 가능성이 큽니다.",
    "재회를 원한다기보다, 관계의 의미를 아직 완전히 내려놓지 못한 잔여 구간이 있을 수 있어요. 이 둘은 같지 않습니다.",
    "상대가 먼저 재회를 제안할 확률은 신호상 높지 않습니다. 다만 완전한 거절 상태로 고정됐다고 보기에도 이릅니다.",
  ]);

  const relationshipOpenness = pick(h, 17, [
    "관계 전반에 대한 개방성은 중간 이하로 읽힙니다. 새로운 깊이로 들어가기 전에 감정 안전지대를 먼저 확보하려는 톤이에요.",
    "겉으로는 열려 있어 보이나, 실제 감정 투자는 신중한 편으로 해석할 수 있어요.",
    "관계에 대한 기대를 낮춘 상태에서 천천히 관찰하는 모드에 가깝습니다.",
  ]);

  const currentDatingLikelihood = pick(h, 18, [
    "다른 사람과 진지한 교제 중이라는 직접 신호는 약합니다. 다만 가벼운 만남·소개 자리 가능성은 열어둘 만해요.",
    "새로운 로맨스보다는 일상 회복·사교 확장 쪽 에너지가 더 두드러질 수 있어요.",
    "특정 인물과의 반복 노출이 있다면 '교제 중' 가능성을 열어두되, 친밀한 친구 관계일 수도 있어요.",
  ]);

  const unconsciousPattern = pick(h, 19, [
    "무의식적으로는 '다시 상처받지 않기'가 먼저입니다. 그래서 관심이 있어도 표면적으로는 차갑게 보일 수 있어요.",
    "과거 관계에서 반복된 패턴(회피·도망·과잉설명)이 재발하기 전에 관문을 세우는 방어가 작동 중일 수 있습니다.",
    "좋은 감정과 불안이 동시에 올라올 때, 불안 쪽을 먼저 처리하려는 경향이 신호에 섞여 있을 수 있어요.",
  ]);

  const contactTiming = pick(h, 20, [
    "지금은 '큰 말'보다 '짧고 부담 없는 한 줄'이 신호상 덜 자극적입니다. 시간대는 상대가 혼자 있을 법한 구간이 상대적으로 안전해 보여요.",
    "감정이 올라온 밤보다, 주말 오전·일상 리듬이 안정된 시간대가 역효과 위험이 낮을 수 있어요. 사람마다 다릅니다.",
    "연락 전 48시간은 상대 피드·스토리 리듬을 한 번 더 보는 것이 신호 해석에 도움이 됩니다.",
  ]);

  const synthesis: ReunionSynthesis = {
    whyThisScore: pick(h, 21, [
      `점수는 두 계정의 표면 신호를 합쳤을 때, 재회가 '불가능'도 '확정적'도 아닌 중간대에 놓인다는 뜻에 가깝습니다. 내 쪽에서는 정리가 덜 된 흔적이, 상대 쪽에서는 방어와 거리가 함께 읽혀요.`,
      `가능성 점수가 중간대인 이유는, 긍정 신호와 제한 신호가 동시에 존재하기 때문이에요. 한쪽만 보고 결론 내리면 오판이 나기 쉽습니다.`,
      `두 사람 모두 '완전 끝' 서사는 약하고, 동시에 '다시 시작하자' 서사도 약합니다. 그 사이의 회색 영역이 점수로 반영됐습니다.`,
    ]),
    keyVariable: pick(h, 22, [
      "지금 가장 큰 변수는 상대의 자존심·피로감과, 내 쪽에서 연락이 '부담'으로 읽힐지 '부담 없는 접점'으로 읽힐지입니다.",
      "시간 변수(마지막 연락 이후 경과)와, 상대가 새 서사를 얼마나 단단히 쌓았는지가 점수를 가를 수 있어요.",
      "내 감정의 높이와 상대의 방어 사이 간극이 좁혀지느냐가 핵심입니다. 간격이 크면 같은 말도 다르게 들립니다.",
    ]),
    ifClosedWhy: pick(h, 23, [
      "닫혀 보인다면, 대개 '미움'보다 '지침'과 '다시 설명하기 싫음'에 가까운 경우가 많아요. 그건 영원한 종료와는 다른 종류의 닫힘일 수 있어요.",
      "상대가 닫힌 것처럼 보일 때도, 실제로는 감정이 아직 남아 있어 오히려 더 조심스러운 상태일 수 있습니다.",
      "방어가 두껍게 보이면, 재회 거절이라기보다 자기보호일 가능성을 함께 열어두는 편이 균형에 가깝습니다.",
    ]),
    ifOpenHow: pick(h, 24, [
      "열려 있다면, 큰 약속보다는 작은 일관성이 신호를 만듭니다. 한 번에 해결하려 하기보다 부담을 낮추는 쪽이 읽힙니다.",
      "열려 있는 방식이 '다시 사귀자'가 아니라 '일단 무리 없이 대화'일 수 있어요. 후자부터 받아들일 준비가 필요합니다.",
      "상대가 열려 있을 때도 조건이 붙어 있을 수 있어요. 그 조건이 말로 나오기 전까지는 속도를 맞추는 게 안전합니다.",
    ]),
  };

  const actionGuide: ReunionActionGuide = {
    contactNowGuidance: pick(h, 25, [
      "지금 당장 긴 고백보다는, 짧은 확인 한 줄이 신호상 덜 위험합니다. 단, 상대가 최근 스토리·피드에서 회피 톤이 강하면 하루 이틀 미루는 편이 나을 수 있어요.",
      "연락 자체가 괜찮을 수도 있지만, '관계 정의'까지 한 번에 가져가면 역효과 가능성이 커집니다.",
      "내 감정이 폭발 직전이면 연락은 미루는 게 결과적으로 더 나을 수 있어요. 메시지 톤은 감정이 쓴다는 느낌이 나면 위험합니다.",
    ]),
    waitGuidance: pick(h, 26, [
      "기다림이 맞을 때는, '아무것도 안 함'이 아니라 '자극을 줄임'입니다. 확인 강박이 올라오면 오히려 신호가 틀어질 수 있어요.",
      "상대가 새 서사를 쌓는 듯한 구간에서는 속도를 맞추는 쪽이 현실적입니다.",
      "기다릴 때는 하루 단위가 아니라 '상대 리듬이 안정되는지'를 기준으로 보는 편이 좋아요.",
    ]),
    avoidActions: pick(h, 27, [
      "죄책감 유발, 비난, 과거 총정리, 새 연애 추궁, 공개 플랫폼에서의 간접 메시지는 신호상 위험도가 높습니다.",
      "읽씹에 대한 연타, 사과의 과잉, '마지막이야' 협박성 문장도 방어를 키우기 쉬워요.",
      "친구를 통한 전달, SNS 스토리로만 감정 표현하기는 오해를 키울 수 있어요.",
    ]),
    toneIfContact: pick(h, 28, [
      "톤은 짧고, 요구가 아니라 선택지를 주는 방식이 덜 부담스럽습니다. '괜찮으면' '부담되면 안 해도 돼' 같은 완충 문장이 도움이 될 수 있어요.",
      "사과가 필요하다면 한두 문장으로 핵심만, 설명은 상대가 물을 때 늘리는 편이 안전합니다.",
      "감정의 크기를 말로 증명하려 하기보다, 행동의 일관성을 보여주는 쪽이 신뢰 신호로 읽힐 수 있어요.",
    ]),
  };

  const finalRecommendation = pick(h, 29, [
    "정리하면, 지금은 '가능성을 닫지 말되, 속도는 낮추라'에 가깝습니다. 신호는 인스타 표면에서 읽힌 해석이며, 대화 한 번이 변수를 바꿀 수 있어요.",
    "당장 결론을 내리기보다, 한 번의 가벼운 접점에서 상대 반응을 보고 다음을 정하는 전략이 신호와 맞습니다.",
    "당신의 감정도 중요합니다. '연락해야만 한다'는 강박이 생기면 톤이 틀어지기 쉬워요. 가능하면 친한 사람과 한 번 말로 정리한 뒤 연락을 쓰는 것도 방법입니다.",
  ]);

  const premiumLocked: ReunionPremiumCard[] = [
    {
      title: "상대가 아직 정리하지 못한 감정의 흔적",
      body: `캡션에서 반복되는 시간대·계절·장소의 은유, 특정 노래 가사 인용 패턴, 과거 관계와 겹치는 이미지 구도 등을 타임라인 순으로 좁혀 봅니다. "여전히 남아 있다"와 "그저 습관"을 구분하는 체크리스트와, 접촉 시 이 흔적을 건드리면 안 되는 지점(자극 포인트)을 짚습니다. 무료 요약에서는 방향만 제시하고, 심층본에서는 문장 예시와 회피 문장까지 포함합니다.`,
    },
    {
      title: "지금 새로운 사람을 만나고 있을 가능성 시그널",
      body: `태그 패턴의 변화, 특정 인물과의 반복 노출, 주말·야간 스토리의 상관관계, 피드 톤의 '커플 서사' 가능성을 점수화하지 않고 가능성 구간으로 제시합니다. 오탐이 나기 쉬운 패턴(가족·동료·촬영)을 걸러내는 기준과, 확인 질문이 역효과인 경우를 구분합니다. 심층본에서는 2주 단위 관찰 포인트와 '묻지 말아야 할 질문' 목록을 제공합니다.`,
    },
    {
      title: "상대의 무의식이 재회를 막는 이유",
      body: `방어가 '거절'인지 '피로'인지 '자존심'인지 '트라우마 재연 방지'인지를 행동 신호로 나눕니다. 상대가 회피할 때 흔히 쓰는 문장 유형과, 그 뒤에 숨은 필요(존중·시간·사과의 형태)를 분리해 설명합니다. 희망고문이 아니라, 현실적으로 문을 열려면 어떤 조건이 필요해 보이는지 '가설'로 제시합니다.`,
    },
    {
      title: "다시 연락이 이어질 수 있는 현실적인 조건",
      body: `두 사람의 생활 리듬, 거리감, 최근 갈등의 성격(신뢰·소통·외압)을 기준으로 '최소 조건'과 '충분 조건'을 나눕니다. 인스타 신호만으로는 부족한 부분은 솔직히 한계로 표시하고, 대화에서 확인해야 할 질문 5개를 제안합니다. 타임라인별(2주/한 달/분기)로 기대치를 조정하는 가이드도 포함합니다.`,
    },
    {
      title: "내가 연락할 때 먹히는 문장 톤",
      body: `지금 두 계정 신호를 합쳐 '짧은 첫 문장' 6종, '피해야 할 첫 문장' 6종을 대비합니다. 사과가 필요한 케이스와 불필요한 케이스를 나누고, 상대 방어 패턴에 맞춘 완충 표현을 제안합니다. 복사해 쓰는 문장보다 원칙(길이·요구·감정 과잉 금지)을 먼저 고정하는 연습 시트를 심층본에 둡니다.`,
    },
    {
      title: "지금 관계에서 가장 위험한 오해 포인트",
      body: `읽씹=싫음인지 피로인지, 스토리 열람=관심인지 습관인지, 친절=재회 신호인지 예의인지 등 흔한 오해 TOP를 짚습니다. 각 오해가 생길 때 감정이 어떻게 폭주하는지와, 폭주를 막는 자기 질문 3가지를 넣습니다. 인스타 기반 해석의 한계와 함께, 반드시 현실 대화로 교차검증해야 할 지점을 명시합니다.`,
    },
  ];

  return {
    summaryTitle: "재회 가능성 분석 결과",
    summaryLine,
    scores,
    myProfileSignals: my,
    theirProfileSignals: their,
    reunionReadiness,
    relationshipOpenness,
    currentDatingLikelihood,
    unconsciousPattern,
    contactTiming,
    theirFocus: theirFocus,
    synthesis,
    actionGuide,
    finalRecommendation,
    premiumLocked,
  };
}

export function getReunionFullReport(myId: string, theirId: string, lastContact: string): ReunionFullReport {
  const h = hashKey(`${myId}|${theirId}|${lastContact}`);
  return buildReport(h);
}
