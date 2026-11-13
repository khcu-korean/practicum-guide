// =====================================================================
// ③ 용어 정의 + 실습 유형 진단 문항 + 유형 정의 + 추천 규칙
// =====================================================================

// 용어 정의 (유형 진단 화면 상단에 표시)
export const GLOSSARY = [
  {
    term: '현장 실습 기관',
    definition: '실습생이 한국어 교육 현장을 경험할 수 있는 기관이나 단체입니다.',
  },
  {
    term: '강의참관',
    definition: '현장 실습 기관에서 한국어 학습자를 대상으로 운영하는 한국어 수업을 관찰하고 분석하는 활동입니다. 강의참관은 최소 9시간 이상 해야 하며, 이와 별도로 강의참관 지도를 1시간 이상 받습니다.',
  },
  {
    term: '모의수업',
    definition: '담당 교수가 참관하는 가운데, 수강생이 한국어 학습자나 동료 수강생을 대상으로 직접 수업을 진행하는 활동입니다. 모든 수강생이 참여합니다.',
  },
  {
    term: '강의실습',
    definition: '실습 기관에서 한국어를 배우고 있는 학습자를 대상으로 실습생이 직접 한 차시 수업을 하는 활동입니다. 모든 실습생이 참여합니다.',
  },
];

// 유형 1 · 1-1 · 2-1의 지정 기관 (진단 문항과 유형 설명에서 함께 사용)
export const INSTITUTIONS = [
  // 유형 1
  { id: 'khu-iie', name: '경희대학교 국제교육원', region: '국내', type: '1' },
  { id: 'honam', name: '호남대학교', region: '국내', type: '1' },
  { id: 'tongmyong', name: '동명대학교', region: '국내', type: '1' },
  { id: 'kasetsart', name: '태국 까셋삿대학교', region: '해외', type: '1' },
  { id: 'nus', name: '싱가포르 국립대학교(NUS)', region: '해외', type: '1' },
  // 유형 1-1 (schedule: 참관 일정 구성)
  { id: 'khcu-center', name: '경희사이버대학교 한국어센터', region: '국내', type: '1-1', schedule: '토요일 4시간 + 일요일 2시간 + 온라인 3시간' },
  { id: 'ammi', name: '암미다문화센터', region: '국내', type: '1-1', schedule: '일요일 2회(회당 4시간) + 온라인 1시간' },
  { id: 'jecheon', name: '제천폴리텍다솜고등학교', region: '국내', type: '1-1', schedule: '평일 2~3회(총 8시간) + 온라인 1시간' },
  // 유형 2-1
  { id: 'dalat', name: '베트남 예르생달랏대학교', region: '해외', type: '2-1' },
];

const instOf = (typeId) => INSTITUTIONS.filter((i) => i.type === typeId);
const picked = (a, typeId) => (a.institutions || []).filter((id) => instOf(typeId).some((i) => i.id === id));

// 진단 문항
// - type: 'single'(하나 선택) | 'multi'(여러 개 선택) | 'text'(직접 입력)
// - showIf: 특정 답변일 때만 문항 표시
// - options의 group: 선택지를 묶어서 보여 줄 제목
export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'institutions',
    text: '아래 기관 중 실습(강의참관)하고 싶고, 직접 방문할 수 있는 곳을 모두 고르세요.',
    help: '거주 지역과 관계없이 고를 수 있습니다. 해당하는 곳이 없으면 고르지 않아도 됩니다.',
    type: 'multi',
    options: INSTITUTIONS.map((i) => ({
      value: i.id,
      label: i.name,
      note: i.schedule,
      group: `${i.region} 기관 (${i.type === '1' ? '유형 1' : i.type === '1-1' ? '유형 1-1' : '유형 2-1'})`,
    })),
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
  {
    id: 'org',
    text: '위 기관 외에, 실습할 기관을 직접 섭외할 수 있나요?',
    type: 'single',
    options: [
      { value: 'secured', label: '이미 섭외했다' },
      { value: 'can', label: '아직 없지만 섭외할 수 있다' },
      { value: 'cannot', label: '섭외하기 어렵다' },
    ],
  },
  {
    id: 'teachAtOrg',
    text: '섭외한 기관에서 강의참관뿐 아니라 직접 강의실습(한 차시 수업)까지 할 수 있나요?',
    type: 'single',
    showIf: { org: ['secured', 'can'] },
    options: [
      { value: 'yes', label: '강의실습까지 가능' },
      { value: 'no', label: '강의참관만 가능' },
      { value: 'unknown', label: '아직 모르겠다' },
    ],
  },
  {
    id: 'days',
    text: '실습에 참여할 수 있는 요일을 모두 고르세요.',
    type: 'multi',
    options: ['월', '화', '수', '목', '금', '토', '일'].map((d) => ({ value: d, label: d })),
  },
  {
    id: 'time',
    text: '실습에 참여할 수 있는 시간대를 적어 주세요. (예: 평일 오후 7시 이후)',
    type: 'text',
  },
];

// 실습 유형 정의
// activities: 유형 카드에 보여 줄 활동 구성
// institutions: 지정 기관 (없으면 실습생이 직접 섭외)
// match(answers) → { ok: true/false, reasons: [...] }
export const PRACTICUM_TYPES = [
  {
    id: '1',
    name: '실습 유형 1',
    summary: '지정 기관 강의참관 + 모의수업',
    description: '아래 현장 실습 기관 중 한 곳에서 강의를 참관하고, 모의수업을 합니다.',
    activities: ['강의참관', '모의수업'],
    institutions: instOf('1'),
    match: (a) => {
      const p = picked(a, '1');
      return p.length
        ? { ok: true, reasons: [`참관 가능 기관: ${p.map((id) => INSTITUTIONS.find((i) => i.id === id).name).join(', ')}`] }
        : { ok: false, reasons: ['유형 1 지정 기관 중 방문할 수 있는 곳이 있어야 합니다'] };
    },
  },
  {
    id: '1-1',
    name: '실습 유형 1-1',
    summary: '지정 기관 강의참관(오프라인 + 온라인, 총 9시간) + 모의수업',
    description: '아래 현장 실습 기관 중 한 곳에서 오프라인 참관과 온라인 참관을 합쳐 최소 9시간 이상 강의참관을 하고, 모의수업을 합니다. 강의참관 지도(1시간 이상)는 9시간과 별도로 진행됩니다. 기관마다 참관 일정이 다릅니다.',
    activities: ['강의참관 (오프라인 + 온라인, 총 9시간)', '모의수업'],
    institutions: instOf('1-1'),
    match: (a) => {
      const p = picked(a, '1-1');
      const r = [];
      if (!p.length) r.push('유형 1-1 지정 기관 중 방문할 수 있는 곳이 있어야 합니다');
      if (a.online !== 'yes') r.push('온라인 참관에 참여할 수 있어야 합니다');
      return r.length
        ? { ok: false, reasons: r }
        : { ok: true, reasons: [`참관 가능 기관: ${p.map((id) => INSTITUTIONS.find((i) => i.id === id).name).join(', ')}`, '온라인 참관 참여 가능'] };
    },
  },
  {
    id: '2',
    name: '실습 유형 2',
    summary: '직접 섭외한 기관에서 강의참관 + 강의실습',
    description: '실습생이 직접 섭외한 실습 기관에서 강의참관과 강의실습을 합니다. 일부 일정은 실습 기관의 일정을 따릅니다.',
    activities: ['강의참관', '강의실습'],
    institutions: null,
    match: (a) => {
      const r = [];
      if (!['secured', 'can'].includes(a.org)) r.push('실습 기관을 직접 섭외해야 합니다');
      else if (a.teachAtOrg === 'no') r.push('섭외한 기관에서 강의실습까지 할 수 있어야 합니다');
      if (r.length) return { ok: false, reasons: r };
      return {
        ok: true,
        reasons: [a.teachAtOrg === 'unknown' ? '기관 섭외 가능 — 강의실습 가능 여부를 기관에 꼭 확인하세요' : '기관 섭외 및 강의실습 가능'],
      };
    },
  },
  {
    id: '2-1',
    name: '실습 유형 2-1',
    summary: '베트남 예르생달랏대학교에서 강의참관 + 강의실습',
    description: '베트남 예르생달랏대학교에서 강의참관과 강의실습을 합니다. 일정은 현지 학사 일정을 따릅니다.',
    activities: ['강의참관', '강의실습'],
    institutions: instOf('2-1'),
    match: (a) => {
      const ok = picked(a, '2-1').length > 0;
      return { ok, reasons: [ok ? '예르생달랏대학교 방문 가능' : '예르생달랏대학교를 방문할 수 있어야 합니다'] };
    },
  },
  {
    id: '3',
    name: '실습 유형 3',
    summary: '직접 섭외한 기관에서 강의참관 + 모의수업',
    description: '실습생이 직접 섭외한 실습 기관에서 강의를 참관하고, 모의수업을 합니다.',
    activities: ['강의참관', '모의수업'],
    institutions: null,
    match: (a) => {
      const ok = ['secured', 'can'].includes(a.org);
      return { ok, reasons: [ok ? '실습 기관 섭외 가능' : '실습 기관을 직접 섭외해야 합니다'] };
    },
  },
];

// 유형 진단 단계의 성격 안내 (진단 화면 상단)
export const DIAGNOSIS_INTRO =
  '이 단계는 신청 단계가 아닙니다. 나에게 맞는 실습 기관과 유형을 고르는 데 도움을 드리는 단계입니다.';

// 추천 결과와 함께 보여 줄 실제 신청 안내
export const APPLICATION_NOTICE = [
  '실제 신청은 학과 게시판 공지사항을 통해 이루어지며, 공지된 날짜에 확정 명단이 발표됩니다.',
  '거주 지역과 관계없이, 실습할 수 있고 가고 싶은 기관(유형)을 고르면 됩니다.',
  '기관마다 정원이 있어 신청한 곳에 모두 배정되는 것은 아닙니다. 정원은 학기마다 기관 사정에 따라 달라질 수 있습니다.',
  '특정 유형에 우선순위는 없으며, 신청자 수와 실습 기간의 상황 등을 고려하여 배정합니다.',
  '실습 기간은 매 학기 학사 일정에 따라 달라집니다.',
];

export const getType = (id) => PRACTICUM_TYPES.find((t) => t.id === id);
