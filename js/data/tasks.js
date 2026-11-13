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
const CHECK = '(확인 필요)';

const guide = (intro = TBD, extra = {}) => ({
  intro,
  important: [],
  templates: [],
  submit: { method: TBD, where: TBD, deadlineText: '' },
  ...extra,
});

// 모든 과제 가이드에 공통으로 보여 줄 안내
export const COMMON_GUIDE_NOTES = [
  '제출하는 모든 과제는 학기 초에 제공하는 양식을 내려받아 사용합니다. 글자 크기 등 형식을 임의로 바꾸지 마세요. 표는 작성 내용에 따라 셀의 높이만 조절할 수 있습니다.',
  '일정은 상황에 따라 바뀔 수 있습니다. 바뀐 일정은 공지 사항에 따로 안내하니 자주 확인하세요.',
];

const TEACHING_PLAN_NOTE = '교안은 실습 기관의 실습 지도자에게 제출하고 지도를 받습니다.';
const ORG_PLAN_NOTE =
  '실습 기관의 강의참관·강의실습 일정에 맞춰 작성합니다. LMS의 리포트 제출 기한이 지났다면 조교에게 제출합니다.';
const MOCK_BLOCK = '기한 안에 하지 않으면 모의수업에 참가할 수 없습니다. (유형 1·1-1·3)';

// 날짜 표기: { week: n, day: 'mon'~'sun' } = 개강 n주차 요일 (2027-1 기준 2026-2 일정에서 환산, 검토 전)
export const TASKS = {
  // ---------------- 모든 유형 ----------------
  orientation: {
    title: '한국어교육현장실습 교과목 오리엔테이션 참가',
    due: { week: 2, day: 'thu' },
    time: '19:00',
    note: '1차 온라인 개강 세미나',
    guide: guide('자기소개, 학사 일정, 실습 관련 안내 사항, 각종 작성 양식 설명 등을 다루는 온라인 개강 세미나입니다.', {
      submit: { method: '온라인 세미나 참여', where: '접속 방법은 반별 공지 확인', deadlineText: '개강 2주차 목요일 19:00' },
    }),
  },
  'lms-log-4': {
    title: 'LMS 강의 4차시 참관 일지 제출',
    start: { week: 4, day: 'mon' },
    due: { week: 6, day: 'sun' },
    guide: guide('온라인 강의실 4차시의 한국어 수업(초급 문법 수업)을 관찰하고 참관 일지를 작성하여 제출합니다.', {
      important: ['4차시 1강을 참관하고 참관 일지를 작성합니다.', MOCK_BLOCK],
      submit: { method: '참관 일지 제출', where: `온라인 강의실 ${CHECK}`, deadlineText: '4차시 강의 기간 시작 ~ 6주차 일요일' },
    }),
  },
  'lms-log-5': {
    title: 'LMS 강의 5차시 참관 일지 제출',
    start: { week: 5, day: 'mon' },
    due: { week: 7, day: 'sun' },
    guide: guide('온라인 강의실 5차시의 한국어 수업(초급 말하기 수업)을 관찰하고 참관 일지를 작성하여 제출합니다.', {
      important: ['5차시 1강을 참관하고 참관 일지를 작성합니다.', MOCK_BLOCK],
      submit: { method: '참관 일지 제출', where: `온라인 강의실 ${CHECK}`, deadlineText: '5차시 강의 기간 시작 ~ 7주차 일요일' },
    }),
  },
  'site-observe': {
    title: '현장 실습 기관 강의참관',
    due: null,
    schedule: 'institution',
    note: '모의수업 전까지 완료',
    guide: guide('배정된 현장 실습 기관에서 한국어 강의를 참관합니다. 기관별 자세한 일정은 강의실 공지 사항으로 안내합니다.', {
      important: [
        '기관에서 정한 현장 참관 비용을 따로 내야 합니다.',
        '정해진 현장 강의참관을 하지 않으면(결석, 일부만 참관 등) 실습 조건을 충족하지 못해 모의수업에 참가할 수 없습니다.',
        '기타 기관에서 참관하는 경우 기관 교육과정을 따르며, 지도교수와 반드시 미리 논의해야 합니다.',
      ],
      submit: { method: '현장 강의참관', where: '배정된 실습 기관', deadlineText: '기관 일정에 따름 (모의수업 전까지)' },
    }),
  },
  'site-observe-log': {
    title: '현장 강의참관 일지 제출',
    due: null,
    schedule: 'institution',
    note: '모의수업 전까지 제출',
    guide: guide('현장 실습 기관에서 강의를 참관한 뒤 실습 일지와 참관 일지를 작성하여 제출합니다.', {
      important: ['제출 방법은 강의실 공지 사항에서 확인하세요.', MOCK_BLOCK],
      submit: { method: '실습 일지·참관 일지 제출', where: `강의실 공지 사항 확인 ${CHECK}`, deadlineText: '모의수업 전까지' },
    }),
  },

  // ---------------- 유형 1 · 1-1 · 3 ----------------
  plan: {
    title: '실습계획서 제출',
    start: { week: 2, day: 'wed' },
    due: { week: 3, day: 'sun' },
    note: '개강 후 3주차까지',
    guide: guide('방학 중 진행된 한국어 교육 현장 실습 워크숍과 오리엔테이션 자료집 등을 확인한 뒤, 필요한 내용을 넣어 실습계획서를 작성합니다.', {
      important: [
        '실습 기관: 소개, 연간 학사 일정, 교육과정, 교재, 학습자 특성 등',
        '실습 계획: 배정 문법, 교안 작성 계획, 실습 계획, 실습에 임하는 자세 등',
      ],
      submit: { method: '실습계획서 제출', where: `LMS 리포트 게시판 ${CHECK}`, deadlineText: '3주차 일요일까지' },
    }),
  },
  group: {
    title: '자신의 조 확인 및 조장 정하기',
    due: { week: 2, day: 'thu' },
    note: '배정 문법도 함께 확인',
    guide: guide('실습 조 편성과 실습 문법 배정 결과를 확인하고, 조원들과 조장을 정합니다. 실습 조별로 동료 피드백을 비롯한 실습 활동을 합니다.', {
      important: [
        '배정받은 문법으로 문법 교안을 작성하고, 그에 맞는 문법 모의수업을 진행합니다.',
        '교재: 《경희한국어》(경희대학교 출판문화원) 초급1~초급2 문법 또는 《세종한국어(2022)》 1A~2B',
      ],
      submit: { method: '조 편성·배정 문법 확인, 조장 선정', where: `강의실 공지 / 조별 게시판 ${CHECK}`, deadlineText: '2주차 목요일까지' },
    }),
  },
  'draft-plan': {
    title: '초벌 교안 제출',
    start: { week: 3, day: 'mon' },
    due: { week: 5, day: 'sun' },
    guide: guide('배정된 문법 항목에 맞게 한 차시 수업을 위한 교안을 작성합니다.', {
      important: [
        '교안을 쓰기 전에 반드시 2차시 강의를 수강하고, 워크숍과 오리엔테이션 자료를 참고하세요.',
        '한 차시는 50분이며, 문법 수업의 5단계(도입-제시-연습-활용-마무리)에 맞게 작성합니다.',
        '기타 교육 기관에서 실습하는 경우 그 기관의 한 차시 기준에 맞게 작성할 수 있습니다. (지도교수와 반드시 미리 논의)',
        '기한 안에 초벌 교안, 1차 수정 교안, 2차 수정 교안을 내지 않으면 모의수업에 참가할 수 없고, 실습을 이수할 수 없습니다.',
      ],
      submit: { method: '교안 제출 (두 곳 모두)', where: 'LMS 리포트 게시판 + 조별 게시판', deadlineText: '5주차 일요일까지' },
    }),
  },
  'peer-feedback': {
    title: '초벌 교안에 대한 동료 피드백',
    start: { week: 6, day: 'mon' },
    due: { week: 6, day: 'sun' },
    note: '조별 게시판에서 진행',
    guide: guide('조별 게시판에 올라온 동료의 교안을 내려받아 피드백을 적어 올리거나, 따로 작성하여 올립니다. 동료 피드백을 통해 자신의 교안도 돌아봅니다.', {
      important: [
        '반드시 조별 게시판에서 활동하고 제출하세요. 평가에 반영됩니다.',
        '피드백 전에 자료실의 소논문 「장미라(2010), 예비 한국어 교사의 학습지도안 구성에 대한 연구」를 읽고 피드백의 주안점을 잡으세요.',
        '단순한 오타 교정은 피하고, 교육 내용과 방법에 대한 의견이나 제안을 중심으로 작성하세요.',
        '조별 Zoom 회의 등을 함께 하는 것을 권장합니다.',
      ],
      submit: { method: '동료 교안에 피드백 작성', where: '조별 게시판', deadlineText: '6주차 월요일 ~ 일요일' },
    }),
  },
  'revise-1': {
    title: '1차 수정 교안 제출',
    start: { week: 7, day: 'mon' },
    due: { week: 7, day: 'sun' },
    guide: guide('동료 피드백을 확인하고 반영 여부를 판단하여 교안을 수정·보완해 제출합니다.', {
      important: [
        '동료 피드백을 모두 반영할 필요는 없지만, 다양한 의견을 검토하는 과정은 꼭 필요하니 반드시 확인하세요.',
        '지도교수 피드백은 8주차 일요일 무렵 게시판에 올라옵니다. 개인별 교안에 수정·보완 사항을 적어 주는 방식이니, 반드시 내려받아 확인하세요.',
        '피드백을 기다리는 동안에도 계속 스스로 수정해 나가세요. 동료 교안에 대한 교수 피드백도 함께 공부하면 좋습니다.',
      ],
      submit: { method: '교안 제출', where: `LMS 리포트 게시판 ${CHECK}`, deadlineText: '7주차 월요일 ~ 일요일' },
    }),
  },
  'revise-2': {
    title: '2차 수정 교안 제출',
    start: { week: 10, day: 'mon' },
    due: { week: 11, day: 'sun' },
    guide: guide('지도교수의 피드백을 성실히 반영하여 수정 교안을 작성하여 제출합니다.', {
      important: [
        '2차 수정 교안으로 모의수업을 진행하므로 수정과 보완을 충실히 하세요.',
        '기한 안에 초벌 교안, 1차 수정 교안, 2차 수정 교안을 내지 않으면 모의수업에 참가할 수 없고, 실습을 이수할 수 없습니다.',
      ],
      submit: { method: '교안 제출', where: `LMS 리포트 게시판 ${CHECK}`, deadlineText: '11주차 일요일까지' },
    }),
  },
  'mock-class': {
    title: '모의수업',
    start: { week: 12, day: 'sat' },
    due: { week: 13, day: 'sun' },
    note: '12~13주차 주말 중 지정된 날, 지정된 강의실',
    guide: guide('작성한 교안으로 문법 모의수업을 진행하고 지도교수의 지도를 받습니다. 워크숍 형식으로 "개별 모의수업 → 지도교수 개별 지도 및 평가 → 전체 간담회" 순서로 진행됩니다.', {
      important: [
        '같은 조의 동료 실습생이 학습자가 되어 실제 수업처럼 진행합니다. 모의수업은 15~20분으로 압축하여 진행합니다.',
        '자신의 모의수업 날 외에 동료의 모의수업 1일을 반드시 추가로 참관해야 합니다. (전체 참관 권장)',
        '모의수업일 기준으로 다음을 마치지 않으면 참가할 수 없고 실습 이수도 인정되지 않습니다: 실습계획서, 초벌 교안, 동료 피드백, 1·2차 수정 교안, 4·5차시 참관 일지, 현장 강의참관 및 참관 일지',
        '자세한 내용은 온라인 세미나 등에서 미리 안내합니다.',
      ],
      submit: { method: '모의수업 진행', where: '지정된 강의실', deadlineText: '12~13주차 토·일 중 지정일' },
    }),
  },
  'final-plan': {
    title: '최종 교안 제출',
    start: { week: 14, day: 'mon' },
    due: { week: 15, day: 'sun' },
    guide: guide('모의수업 후 받은 교수 피드백과 평가를 반영하여 최종 교안을 작성합니다.', {
      important: ['반드시 "자기성찰"을 포함하여 작성하세요.'],
      submit: { method: '교안 제출', where: `LMS 리포트 게시판 ${CHECK}`, deadlineText: '15주차 일요일까지' },
    }),
  },

  // ---------------- 유형 2 · 2-1 ----------------
  'plan-org': {
    title: '실습계획서 제출',
    due: null,
    schedule: 'institution',
    note: ORG_PLAN_NOTE,
    guide: guide(ORG_PLAN_NOTE, {
      important: [
        '실습 기관: 소개, 연간 학사 일정, 교육과정, 교재, 학습자 특성 등',
        '실습 계획: 교안 작성 계획, 실습 계획, 실습에 임하는 자세 등',
      ],
      submit: { method: '실습계획서 제출', where: 'LMS 리포트 게시판 (기한이 지났다면 조교에게 제출)', deadlineText: '실습 기관 일정에 맞춰' },
    }),
  },
  teaching: {
    title: '강의실습',
    due: null,
    schedule: 'institution',
    note: TEACHING_PLAN_NOTE,
    guide: guide('실습 기관에서 한국어를 배우는 학습자를 대상으로 직접 한 차시 수업을 합니다.', {
      important: [TEACHING_PLAN_NOTE, '교안은 실습 기관에서 사용하는 교재로 작성합니다.'],
      submit: { method: '강의실습 진행', where: '실습 기관', deadlineText: '실습 기관 일정에 따름' },
    }),
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
export const typesOfTask = (id) => ['1', '1-1', '2', '2-1', '3'].filter((t) => SEQUENCES[t]?.includes(id));
