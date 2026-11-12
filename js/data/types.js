// =====================================================================
// ③ 실습 유형 진단 문항 + 유형 정의 + 추천 규칙
// ※ 추천 규칙(match)은 임시 규칙입니다. 실제 운영 기준에 맞게 수정하세요.
// =====================================================================

// 진단 문항
// - type: 'single'(하나 선택) | 'multi'(여러 개 선택) | 'text'(직접 입력)
// - showIf: 특정 답변일 때만 문항 표시
export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'residence',
    text: '현재 거주 지역은 어디인가요?',
    type: 'single',
    options: [
      { value: 'domestic', label: '국내' },
      { value: 'overseas', label: '해외' },
    ],
  },
  {
    id: 'visitKorea',
    text: '실습 기간 중 한국(대면 수업 장소)에 방문하여 대면 활동에 참여할 수 있나요?',
    type: 'single',
    options: [
      { value: 'yes', label: '가능' },
      { value: 'no', label: '불가능' },
    ],
  },
  {
    id: 'dalat',
    text: '베트남 예르생달랏대학교에서 참관 및 강의 실습을 수행할 수 있나요?',
    type: 'single',
    showIf: { residence: 'overseas' },
    options: [
      { value: 'yes', label: '가능' },
      { value: 'no', label: '불가능 / 해당 없음' },
    ],
  },
  {
    id: 'days',
    text: '실습에 참여 가능한 요일을 모두 선택하세요.',
    type: 'multi',
    options: ['월', '화', '수', '목', '금', '토', '일'].map((d) => ({ value: d, label: d })),
  },
  {
    id: 'time',
    text: '실습 참여 가능한 시간대를 적어 주세요. (예: 평일 오후 7시 이후)',
    type: 'text',
  },
  {
    id: 'org',
    text: '실습 기관(한국어 수업 기관) 확보 상황은 어떤가요?',
    type: 'single',
    options: [
      { value: 'secured', label: '이미 확보했다' },
      { value: 'can', label: '아직 없지만 스스로 섭외할 수 있다' },
      { value: 'cannot', label: '스스로 섭외하기 어렵다' },
    ],
  },
  {
    id: 'teachAtOrg',
    text: '확보(섭외)한 기관에서 직접 강의(수업) 실습까지 할 수 있나요?',
    type: 'single',
    showIf: { org: ['secured', 'can'] },
    options: [
      { value: 'yes', label: '강의 실습 가능' },
      { value: 'no', label: '참관만 가능' },
    ],
  },
  {
    id: 'online',
    text: '온라인 실시간 활동(Zoom 등)에 참여할 수 있나요?',
    type: 'single',
    options: [
      { value: 'yes', label: '가능' },
      { value: 'no', label: '불가능' },
    ],
  },
];

// 실습 유형 정의
// match(answers) → { ok: true/false, reasons: ['충족/미충족 이유', ...] }
export const PRACTICUM_TYPES = [
  {
    id: '1',
    name: '실습 유형 1',
    summary: '전면 오프라인 참관 + 모의수업',
    description: '학교가 지정한 기관에서 오프라인으로 수업을 참관하고, 모의수업을 수행합니다. (상세 설명 입력 예정)',
    requirements: ['대면 활동 참여 가능'],
    match: (a) => {
      const ok = a.visitKorea === 'yes';
      return { ok, reasons: [ok ? '대면 활동 참여 가능' : '대면 활동 참여가 필요합니다'] };
    },
  },
  {
    id: '1-1',
    name: '실습 유형 1-1',
    summary: '오프라인 참관(8시간) + 온라인 참관(1시간) + 모의수업',
    description: '오프라인 참관 8시간과 온라인 참관 1시간을 수행하고, 모의수업을 합니다. (상세 설명 입력 예정)',
    requirements: ['대면 활동 참여 가능', '온라인 실시간 활동 참여 가능'],
    match: (a) => {
      const r = [];
      if (a.visitKorea !== 'yes') r.push('대면 활동 참여가 필요합니다');
      if (a.online !== 'yes') r.push('온라인 실시간 활동 참여가 필요합니다');
      return { ok: r.length === 0, reasons: r.length ? r : ['대면·온라인 활동 모두 가능'] };
    },
  },
  {
    id: '2',
    name: '실습 유형 2',
    summary: '참관 및 강의 실습 기관을 실습생이 직접 섭외',
    description: '실습생이 직접 섭외한 기관에서 수업 참관과 강의 실습을 모두 수행합니다. 일부 일정은 기관 일정을 따릅니다. (상세 설명 입력 예정)',
    requirements: ['실습 기관 확보(또는 섭외 가능)', '기관에서 강의 실습 가능'],
    match: (a) => {
      const r = [];
      if (!['secured', 'can'].includes(a.org)) r.push('실습 기관을 직접 확보해야 합니다');
      if (a.teachAtOrg !== 'yes') r.push('기관에서 강의 실습이 가능해야 합니다');
      return { ok: r.length === 0, reasons: r.length ? r : ['기관 확보 및 강의 실습 가능'] };
    },
  },
  {
    id: '2-1',
    name: '실습 유형 2-1',
    summary: '예르생달랏대학교에서 참관 및 강의 실습을 모두 수행',
    description: '베트남 예르생달랏대학교에서 수업 참관과 강의 실습을 수행합니다. 일정은 현지 학사 일정을 따릅니다. (상세 설명 입력 예정)',
    requirements: ['예르생달랏대학교 현지 실습 가능'],
    match: (a) => {
      const ok = a.dalat === 'yes';
      return { ok, reasons: [ok ? '예르생달랏대학교 실습 가능' : '예르생달랏대학교 현지 실습이 가능해야 합니다'] };
    },
  },
  {
    id: '3',
    name: '실습 유형 3',
    summary: '실습생이 직접 섭외한 기관에서 강의 참관 + 모의수업',
    description: '직접 섭외한 기관에서 수업을 참관하고, 강의 실습 대신 모의수업을 수행합니다. (상세 설명 입력 예정)',
    requirements: ['실습 기관 확보(또는 섭외 가능)'],
    match: (a) => {
      const ok = ['secured', 'can'].includes(a.org);
      return { ok, reasons: [ok ? '실습 기관 확보(섭외) 가능' : '실습 기관을 직접 확보해야 합니다'] };
    },
  },
];

export const getType = (id) => PRACTICUM_TYPES.find((t) => t.id === id);
