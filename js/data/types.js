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
    definition: '담당 교수가 참관하는 가운데, 수강생이 한국어 학습자나 동료 수강생을 대상으로 직접 수업을 진행하는 활동입니다. 오프라인 진행이 원칙이며, 해외에 거주하는 학우는 온라인으로 참여할 수 있습니다. 실습 유형에 따라 모의수업(유형 1·1-1·1-2·3) 또는 강의실습(유형 2·2-1) 중 한 가지에 참여합니다.',
  },
  {
    term: '강의실습',
    definition: '실습 기관에서 한국어를 배우고 있는 학습자를 대상으로 실습생이 직접 한 차시 수업을 하는 활동입니다. 실습 유형에 따라 모의수업(유형 1·1-1·1-2·3) 또는 강의실습(유형 2·2-1) 중 한 가지에 참여합니다.',
  },
];

// 유형 1 · 1-1 · 1-2 · 2-1의 지정 기관 (진단 문항, 유형 설명, 확정 기관 입력, 타임라인에서 함께 사용)
// - location: 소재지
// - mode: 참관 방식 ('offline' 전면 오프라인 / 'mixed' 오프라인 + 온라인)
// - days: 참관 요일 ('weekday' 평일 / 'weekend' 주말)
// - windows: 매년 강의참관이 가능한 달 [[시작 월, 끝 월], ...]  예: [[1, 2], [4, 5]] = 1~2월 중, 4~5월 중
// - method: 참관 방식 설명,  schedule: 참관 시간 구성,  note: 참고 사항
// ※ 달 구분: 1학기 수강생은 동계 방학(1~2월)·학기 중(3~6월), 2학기 수강생은 하계 방학(7~8월)·학기 중(9~12월)
export const INSTITUTIONS = [
  // 유형 1
  {
    id: 'khu-iie', name: '경희대학교 국제교육원', region: '국내', location: '서울', type: '1', mode: 'offline', days: 'weekday',
    windows: [[1, 2], [4, 5], [7, 8], [10, 11]], method: '평일 3일 오프라인 참관',
  },
  {
    id: 'honam', name: '호남대학교 한국어교육원', region: '국내', location: '광주광역시', type: '1', mode: 'offline', days: 'weekday',
    windows: [[1, 2], [4, 5], [7, 8], [10, 11]], method: '평일 3일 오프라인 참관',
  },
  {
    id: 'tongmyong', name: '동명대학교 부산국제대학 글로벌한국학과', region: '국내', location: '부산광역시', type: '1', mode: 'offline', days: 'weekday',
    windows: [[3, 4], [9, 10]], method: '평일 3일 오프라인 참관',
  },
  // 유형 1-1
  {
    id: 'khcu-center', name: '경희사이버대학교 한국어센터', region: '국내', location: '서울', type: '1-1', mode: 'mixed', days: 'weekend',
    windows: [[1, 2], [4, 5], [7, 8], [10, 11]], method: '토·일 2회 오프라인 참관 + 1회 온라인 참관',
    schedule: '토요일 4시간 + 일요일 2시간 + 온라인 3시간',
  },
  {
    id: 'ammi', name: '암미다문화센터', region: '국내', location: '남양주시', type: '1-1', mode: 'mixed', days: 'weekend',
    windows: [[1, 2], [4, 5], [10, 11]], method: '일요일 2회 오프라인 참관 + 1회 온라인 참관',
    schedule: '일요일 2회(회당 4시간) + 온라인 1시간',
  },
  {
    id: 'jecheon', name: '제천폴리텍다솜고등학교', region: '국내', location: '제천시', type: '1-1', mode: 'mixed', days: 'weekday',
    windows: [[3, 4], [9, 10]], method: '평일 3일 오프라인 참관 + 1회 온라인 참관',
    schedule: '평일 오프라인 총 8시간 + 온라인 1시간',
  },
  // 유형 1-2
  {
    id: 'kasetsart', name: '태국 까셋삿대학교', region: '해외', location: '태국', type: '1-2', mode: 'offline', days: 'weekday',
    windows: [[1, 2], [9, 10]], method: '평일 3일 오프라인 참관',
  },
  {
    id: 'nus', name: '싱가포르 국립대학교(NUS)', region: '해외', location: '싱가포르', type: '1-2', mode: 'offline', days: 'weekday',
    windows: [[3, 3], [9, 10]], method: '평일 3일 오프라인 참관',
  },
  // 유형 2-1
  {
    id: 'dalat', name: '베트남 예르생달랏대학교', region: '해외', location: '베트남 달랏', type: '2-1', mode: 'offline', days: 'weekday',
    windows: [[5, 5], [11, 11]], method: '평일 3일 오프라인 참관 + 1일 강의실습',
    note: '현지 체류 일정은 협의할 수 있습니다.',
  },
];

// 수강 학기·참관 시기별 달
export const MONTHS = {
  1: { vacation: [1, 2], semester: [3, 4, 5, 6] },
  2: { vacation: [7, 8], semester: [9, 10, 11, 12] },
};
const hits = (w, months) => months.some((m) => w[0] <= m && m <= w[1]);
/** 기관의 참관 가능 달 중 주어진 달에 걸치는 것 */
export const windowsIn = (inst, months) => (inst?.windows || []).filter((w) => hits(w, months));
/** [[1,2],[4,5]] → '1~2월, 4~5월' */
export const fmtWindows = (ws) => ws.map(([a, b]) => (a === b ? `${a}월` : `${a}~${b}월`)).join(', ');

/** 학기 id('2027-1')에 맞춘 기관 참관 정보 */
export const termOf = (inst, semesterId) => {
  if (!inst) return null;
  const [year, half] = semesterId.split('-');
  const M = MONTHS[half === '2' ? 2 : 1];
  const ws = windowsIn(inst, [...M.vacation, ...M.semester]);
  return {
    days: inst.days,
    method: inst.method,
    note: inst.note,
    vacation: windowsIn(inst, M.vacation).length > 0,
    semester: windowsIn(inst, M.semester).length > 0,
    period: ws.length ? `${year}년 ${fmtWindows(ws)} 중` : '이번 학기 참관 일정 없음',
  };
};

/** 기관 안내 한 줄: '2027년 1~2월, 4~5월 중 · 평일 3일 오프라인 참관' */
export const instLine = (inst, semesterId) => {
  const t = termOf(inst, semesterId);
  return t ? `${t.period} · ${t.method}` : inst?.schedule || '';
};

export const getInstitution = (id) => INSTITUTIONS.find((i) => i.id === id);

// 유형 이름과 할 일 (이름: '유형 1 (국내외 지정 기관)', 할 일: '강의참관 + 모의수업')
export const TYPE_LABELS = {
  1: { name: '유형 1 (국내 지정 기관 · 전면 오프라인)', work: '강의참관(전면 오프라인) + 모의수업' },
  '1-1': { name: '유형 1-1 (국내 지정 기관 · 온라인 병행)', work: '강의참관(오프라인 + 온라인) + 모의수업' },
  '1-2': { name: '유형 1-2 (국외 지정 기관 · 전면 오프라인)', work: '강의참관(전면 오프라인) + 모의수업' },
  2: { name: '유형 2 (국내외 기관 직접 섭외)', work: '강의참관 + 강의실습' },
  '2-1': { name: '유형 2-1 (해외 협약 대학)', work: '강의참관 + 강의실습' },
  3: { name: '유형 3 (국내외 기관 직접 섭외)', work: '강의참관 + 모의수업' },
};

const instOf = (typeId) => INSTITUTIONS.filter((i) => i.type === typeId);
// 고른 기관(한 곳)이 이 유형의 기관이면 [id], 아니면 []
const picked = (a, typeId) => [].concat(a.institutions || []).filter((id) => instOf(typeId).some((i) => i.id === id));

// 추천 질문 (STEP 2)
// - showIf: 특정 답변일 때만 문항 표시
export const DIAGNOSIS_QUESTIONS = [
  {
    id: 'self',
    text: '강의참관 기관은 어떻게 정하고 싶나요?',
    type: 'single',
    options: [
      { value: 'no', label: '학과 협력 기관' },
      { value: 'yes', label: '직접 섭외 (이미 섭외한 경우 포함)' },
    ],
  },
  {
    id: 'teachAtOrg',
    text: '그 기관에서 강의참관뿐 아니라 강의실습(한 차시 수업)까지 할 수 있나요?',
    type: 'single',
    showIf: { self: 'yes' },
    options: [
      { value: 'yes', label: '강의실습까지 가능' },
      { value: 'no', label: '강의참관만 가능' },
    ],
  },
  {
    id: 'take',
    text: '<한국어교육현장실습> 과목을 언제 수강하고 싶나요?',
    type: 'single',
    options: [
      { value: '1', label: '1학기' },
      { value: '2', label: '2학기' },
    ],
  },
  {
    id: 'timing',
    text: '강의참관은 방학 중에 미리 할 수도 있어요. 언제 하고 싶나요?',
    type: 'single',
    options: [
      { value: 'vacation', label: '방학 중' },
      { value: 'semester', label: '학기 중' },
    ],
  },
  {
    id: 'region',
    text: '강의참관은 어디에서 할 수 있나요?',
    type: 'single',
    showIf: { self: 'no' },
    options: [
      { value: 'domestic', label: '국내' },
      { value: 'overseas', label: '국외' },
      { value: 'any', label: '상관없음' },
    ],
  },
  {
    id: 'days',
    text: '실습에 시간을 낼 수 있는 요일은 언제인가요?',
    type: 'single',
    showIf: { self: 'no' },
    options: [
      { value: 'weekend', label: '주말' },
      { value: 'weekday', label: '평일' },
      { value: 'any', label: '상관없음' },
    ],
  },
  {
    id: 'mode',
    text: '어떤 방식의 강의참관을 원하나요?',
    type: 'single',
    showIf: { self: 'no' },
    options: [
      { value: 'offline', label: '전면 오프라인' },
      { value: 'mixed', label: '오프라인 + 온라인 병행' },
      { value: 'any', label: '상관없음' },
    ],
  },
];

// 기관 구분 표시(배지)
export const ATTR_LABELS = {
  region: { 국내: '국내', 해외: '국외' },
  mode: { offline: '전면 오프라인', mixed: '오프라인 + 온라인' },
  days: { weekday: '평일', weekend: '주말' },
  when: { semester: '학기 중', vacation: '방학 중' },
};

export function instBadges(inst, semesterId) {
  const t = termOf(inst, semesterId) || {};
  return [
    ATTR_LABELS.region[inst.region],
    ATTR_LABELS.mode[inst.mode],
    ATTR_LABELS.days[inst.days],
    t.vacation ? '방학 중 가능' : '',
    t.semester ? '학기 중 가능' : '',
  ].filter(Boolean);
}

// 추천 조건 (조건 이름, 기관이 조건에 맞는지)
const CONDITIONS = [
  { id: 'region', label: (v) => (v === 'domestic' ? '국내' : '국외'), test: (i, t, v) => v === 'any' || (v === 'domestic' ? i.region === '국내' : i.region === '해외') },
  { id: 'days', label: (v) => (v === 'weekend' ? '주말' : '평일'), test: (i, t, v) => v === 'any' || i.days === v },
  { id: 'mode', label: (v) => (v === 'offline' ? '전면 오프라인' : '오프라인 + 온라인 병행'), test: (i, t, v) => v === 'any' || i.mode === v },
];

/**
 * 추천 결과
 * - 스스로 섭외: { kind: 'self', typeId: '2' | '3' }
 * - 협력 기관: { kind: 'partner', matches: [기관], relax: [{ label, count }] }
 *   relax: 결과가 없을 때, 조건 하나를 빼면 몇 곳이 맞는지
 */
// 수강 학기(1·2학기)에 해당하는 학기 id (기관 참관 달은 매년 같으므로 어느 학기든 계산 가능)
export function targetSemester(a, currentId) {
  const [year] = currentId.split('-');
  const want = a.take ? `${year}-${a.take}` : currentId;
  return { id: want, want, fallback: false };
}

/** 학생이 고른 수강 학기·참관 시기의 달 */
export const monthsFor = (a) => {
  const M = MONTHS[a.take === '2' ? 2 : 1];
  return a.timing === 'vacation' ? M.vacation : a.timing === 'semester' ? M.semester : [...M.vacation, ...M.semester];
};

export const SEASON_LABEL = { winter: '동계 방학', summer: '하계 방학' };
export const seasonOf = (a) => (a.take === '2' ? 'summer' : 'winter');

// 방학 중 참관 안내
export const VACATION_NOTE = {
  1: '1학기에 수강한다면, 수강 전 동계 방학(겨울방학) 중에 강의참관을 마쳐야 합니다.',
  2: '2학기에 수강한다면, 수강 전 하계 방학(여름방학) 중에 강의참관을 마쳐야 합니다.',
};

export function recommend(a, currentId) {
  const target = targetSemester(a, currentId);
  const semesterId = target.id;
  if (a.self === 'yes') return { kind: 'self', typeId: a.teachAtOrg === 'yes' ? '2' : '3', target };
  // 강의참관 시기: 방학 중이면 수강 학기에 맞는 방학(1학기 → 동계, 2학기 → 하계)에 참관할 수 있는 기관
  const season = seasonOf(a);
  const timingCond = a.timing && {
    id: 'timing',
    label: () => (a.timing === 'vacation' ? `${SEASON_LABEL[season]} 중 참관` : '학기 중 참관'),
    test: (i) => windowsIn(i, monthsFor(a)).length > 0,
  };
  const active = [...CONDITIONS.filter((c) => a[c.id]), ...(timingCond ? [timingCond] : [])];
  const fits = (i, conds) => conds.every((c) => c.test(i, termOf(i, semesterId) || {}, a[c.id]));
  const matches = INSTITUTIONS.filter((i) => fits(i, active));
  const relax = matches.length
    ? []
    : active
        .filter((c) => a[c.id] !== 'any')
        .map((c) => ({ label: c.label(a[c.id]), count: INSTITUTIONS.filter((i) => fits(i, active.filter((x) => x !== c))).length }))
        .filter((r) => r.count > 0);
  return { kind: 'partner', matches, relax, target };
}

// 실습 유형 정의
// activities: 유형 카드에 보여 줄 활동 구성
// institutions: 지정 기관 (없으면 실습생이 직접 섭외)
// match(answers) → { ok: true/false, reasons: [...] }
export const PRACTICUM_TYPES = [
  {
    id: '1',
    name: TYPE_LABELS['1'].name,
    summary: TYPE_LABELS['1'].work,
    description: '국내 현장 실습 기관에서 전면 오프라인으로 강의참관을 하고, 모의수업을 하는 유형입니다. 기관마다 참관 일정이 다릅니다.',
    activities: ['강의참관 (전면 오프라인)', '모의수업'],
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
    name: TYPE_LABELS['1-1'].name,
    summary: TYPE_LABELS['1-1'].work,
    description: '국내 현장 실습 기관에서 강의참관을 하되 온라인 참관을 병행하고, 모의수업을 하는 유형입니다. 오프라인과 온라인을 합쳐 최소 9시간 이상 강의참관을 하며, 강의참관 지도(1시간 이상)는 9시간과 별도로 진행됩니다. 기관마다 참관 일정이 다릅니다.',
    activities: ['강의참관 (오프라인 + 온라인 병행, 총 9시간)', '모의수업'],
    institutions: instOf('1-1'),
    match: (a) => {
      const p = picked(a, '1-1');
      const r = [];
      if (!p.length) r.push('유형 1-1 지정 기관 중 방문할 수 있는 곳이 있어야 합니다');
      return r.length
        ? { ok: false, reasons: r }
        : { ok: true, reasons: [`참관 가능 기관: ${p.map((id) => INSTITUTIONS.find((i) => i.id === id).name).join(', ')}`] };
    },
  },
  {
    id: '1-2',
    name: TYPE_LABELS['1-2'].name,
    summary: TYPE_LABELS['1-2'].work,
    description: '국외 현장 실습 기관에서 전면 오프라인으로 강의참관을 하고, 모의수업을 하는 유형입니다. 기관마다 참관 일정이 다릅니다.',
    activities: ['강의참관 (전면 오프라인)', '모의수업'],
    institutions: instOf('1-2'),
    match: (a) => {
      const p = picked(a, '1-2');
      return p.length ? { ok: true, reasons: [] } : { ok: false, reasons: ['유형 1-2 지정 기관 중 방문할 수 있는 곳이 있어야 합니다'] };
    },
  },
  {
    id: '2',
    name: TYPE_LABELS['2'].name,
    summary: TYPE_LABELS['2'].work,
    description: '실습생이 국내 또는 해외의 기관을 직접 섭외하여 강의참관과 강의실습까지 하는 유형입니다. 일부 일정은 실습 기관의 일정을 따릅니다.',
    activities: ['강의참관', '강의실습'],
    institutions: null,
    match: (a) => {
      const r = [];
      if (!['secured', 'can'].includes(a.org)) r.push('실습 기관을 직접 섭외해야 합니다');
      else if (a.teachAtOrg === 'no') r.push('강의참관만 가능하면 유형 3에 해당합니다');
      if (r.length) return { ok: false, reasons: r };
      return {
        ok: true,
        reasons: ['기관 섭외 가능, 강의실습까지 가능'],
      };
    },
  },
  {
    id: '2-1',
    name: TYPE_LABELS['2-1'].name,
    summary: TYPE_LABELS['2-1'].work,
    description: '해외 협약 대학(베트남 예르생달랏대학교)에서 강의참관과 강의실습을 모두 하는 유형입니다. 일정은 현지 학사 일정을 따릅니다.',
    activities: ['강의참관', '강의실습'],
    institutions: instOf('2-1'),
    match: (a) => {
      const ok = picked(a, '2-1').length > 0;
      return { ok, reasons: [ok ? '예르생달랏대학교 방문 가능' : '예르생달랏대학교를 방문할 수 있어야 합니다'] };
    },
  },
  {
    id: '3',
    name: TYPE_LABELS['3'].name,
    summary: TYPE_LABELS['3'].work,
    description: '실습생이 국내 또는 해외의 기관을 직접 섭외하여 강의참관만 하고, 모의수업을 하는 유형입니다. (유형 2와 달리 강의실습 대신 모의수업을 합니다.)',
    activities: ['강의참관', '모의수업'],
    institutions: null,
    match: (a) => {
      const r = [];
      if (!['secured', 'can'].includes(a.org)) r.push('실습 기관을 직접 섭외해야 합니다');
      else if (a.teachAtOrg === 'yes') r.push('강의실습까지 할 수 있으면 유형 2에 해당합니다');
      if (r.length) return { ok: false, reasons: r };
      return {
        ok: true,
        reasons: ['기관 섭외 가능, 강의참관만 가능'],
      };
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
  '신청자 수와 실습 기관의 상황 등을 고려하여 배정합니다.',
  '실습 기간은 매 학기 학사 일정에 따라 달라집니다.',
];

// 실습 유형 안내 머리말 (STEP 2·3에서 접어 두었다가 펼쳐 보기)
export const TYPE_GUIDE_INTRO = '실습 유형은 경희사이버대학교가 운영 방식에 따라 정한 구분입니다.';

export const getType = (id) => PRACTICUM_TYPES.find((t) => t.id === id);
