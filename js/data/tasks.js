// =====================================================================
// ④ 타임라인 과업 + ⑤ 과제 수행 가이드 데이터
//
// [1] TASKS: 과업 목록 (여러 유형이 같이 하는 과업은 한 번만 적습니다)
// {
//   title: '과업 이름',
//   week: 3,                 ← (선택) 'n주차까지' 표시
//   due:  '2026-10-17'  |  { week: 3, day: 'sun' }  |  null
//         └ 날짜 직접 지정 | 개강일 기준 n주차 요일 | null = 날짜 미정
//   schedule: 'course' | 'institution'
//         └ 날짜 미정일 때 안내: course = 강의 공지에 따름, institution = 실습 기관 일정에 따름
//   note: '과업 목록에 함께 보여 줄 짧은 안내',
//   required: true,          ← 이수 완료 점검에 포함할지 (기본 true)
//   guide: { intro, important: [], templates: [{ name, url }], submit: { method, where, deadlineText } }
// }
//
// [2] SEQUENCES: 유형별 과업 순서 (타임라인에 이 순서대로 표시)
// =====================================================================

const TBD = '(내용 입력 예정)';

const guide = (intro = TBD, extra = {}) => ({
  intro,
  important: [TBD],
  templates: [],
  submit: { method: TBD, where: TBD, deadlineText: TBD },
  ...extra,
});

const TEACHING_PLAN_NOTE = '교안은 실습 기관의 실습 지도자에게 제출하고 지도를 받습니다.';
const ORG_PLAN_NOTE =
  '실습 기관의 강의참관·강의실습 일정에 맞춰 작성합니다. LMS의 리포트 제출 기한이 지났다면 조교에게 제출합니다.';

export const TASKS = {
  // ---------------- 모든 유형 ----------------
  orientation: {
    title: '한국어교육현장실습 교과목 오리엔테이션 참가',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'lms-log-4': {
    title: 'LMS 강의 4차시 참관 일지 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'lms-log-5': {
    title: 'LMS 강의 5차시 참관 일지 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'site-observe': {
    title: '현장 실습 기관 강의참관',
    due: null,
    schedule: 'institution',
    guide: guide(),
  },
  'site-observe-log': {
    title: '현장 강의참관 일지 제출',
    due: null,
    schedule: 'institution',
    guide: guide(),
  },

  // ---------------- 유형 1 · 1-1 · 3 ----------------
  plan: {
    title: '실습계획서 제출',
    week: 3,
    due: { week: 3, day: 'sun' },
    note: '개강 후 3주차까지',
    guide: guide(),
  },
  group: {
    title: '자신의 조 확인 및 조장 정하기',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'draft-plan': {
    title: '초벌 교안 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'peer-feedback': {
    title: '초벌 교안에 대한 동료 피드백',
    due: null,
    schedule: 'course',
    note: '조별 게시판에서 진행',
    guide: guide(),
  },
  'revise-1': {
    title: '1차 수정 교안 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'revise-2': {
    title: '2차 수정 교안 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'mock-class': {
    title: '모의수업',
    due: null,
    schedule: 'course',
    note: '지정된 강의실에서 진행',
    guide: guide(),
  },
  'final-plan': {
    title: '최종 교안 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },

  // ---------------- 유형 2 · 2-1 ----------------
  'plan-org': {
    title: '실습계획서 제출',
    due: null,
    schedule: 'institution',
    note: ORG_PLAN_NOTE,
    guide: guide(ORG_PLAN_NOTE),
  },
  teaching: {
    title: '강의실습',
    due: null,
    schedule: 'institution',
    note: TEACHING_PLAN_NOTE,
    guide: guide(TBD, { important: [TEACHING_PLAN_NOTE] }),
  },

  // ---------------- 유형 2 ----------------
  'org-find': {
    title: '실습 기관 섭외',
    due: null,
    schedule: 'institution',
    guide: guide(),
  },
  'org-apply': {
    title: '학부에 실습 기관 신청서 작성 및 제출',
    due: null,
    schedule: 'course',
    guide: guide(),
  },
  'org-approval': {
    title: '학부의 실습 기관 승인 결과 확인',
    due: null,
    schedule: 'course',
    note: '학부에서 승인 결과를 통보합니다',
    guide: guide(),
  },
  'result-report': {
    title: '실습 결과 회보서 송부 확인',
    due: null,
    schedule: 'institution',
    note: '실습 기관이 학부로 회보서를 보냅니다. 송부 여부를 실습생이 기관에 확인하세요.',
    guide: guide(),
  },
};

// 유형별 과업 순서
const SEQ_MOCK = [
  'orientation',
  'plan',
  'group',
  'lms-log-4',
  'lms-log-5',
  'draft-plan',
  'peer-feedback',
  'site-observe',
  'revise-1',
  'revise-2',
  'site-observe-log',
  'mock-class',
  'final-plan',
];

export const SEQUENCES = {
  1: SEQ_MOCK,
  '1-1': SEQ_MOCK,
  3: SEQ_MOCK,
  2: [
    'orientation',
    'org-find',
    'org-apply',
    'org-approval',
    'plan-org',
    'lms-log-4',
    'lms-log-5',
    'site-observe',
    'site-observe-log',
    'teaching',
    'result-report',
  ],
  '2-1': ['orientation', 'plan-org', 'lms-log-4', 'lms-log-5', 'site-observe', 'site-observe-log', 'teaching'],
};

// 날짜 미정 과업의 안내 문구
export const SCHEDULE_NOTE = {
  course: '제출일은 강의 공지를 확인하세요. 날짜가 정해지면 직접 입력할 수 있습니다.',
  institution: '실습 기관 일정에 따라 정해집니다. 일정이 확정되면 직접 입력하세요.',
};

// 이수 완료 점검에서 과업 외에 추가로 확인할 항목
export const COMPLETION_EXTRA_CHECKS = [
  { id: 'hours', label: '강의참관 9시간 이상과 강의참관 지도 1시간 이상을 모두 채웠다' },
  { id: 'files', label: '제출한 모든 파일이 정상적으로 열리는지 확인했다 (예시)' },
  { id: 'lms', label: 'LMS에서 제출 완료 상태를 확인했다 (예시)' },
];

export const getTask = (id) => (TASKS[id] ? { id, ...TASKS[id] } : null);

/** 유형별 과업 목록 (순서대로, step = 순번) */
export const tasksForType = (typeId) =>
  (SEQUENCES[typeId] || []).map((id, i) => ({ id, step: i + 1, ...TASKS[id] }));

/** 이 과업을 하는 유형 목록 */
export const typesOfTask = (id) => Object.keys(SEQUENCES).filter((t) => SEQUENCES[t].includes(id));
