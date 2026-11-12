// =====================================================================
// ④ 타임라인 과업 + ⑤ 과제 수행 가이드 데이터
//
// 과업 하나의 구조:
// {
//   id: '고유 영문 ID',
//   title: '과업 이름',
//   types: 'all'  또는  ['1', '1-1']   ← 'all' = 공통 과업
//   week: 7,                          ← 몇 주차 과업인지 (타임라인 묶음 기준)
//   due:  '2026-10-17'  |  { week: 7, day: 'sun' }  |  null
//         └ 날짜 직접 지정 | 학기 시작일 기준 n주차 요일 | null = 미정(기관 일정에 따름)
//   dueNote: '미정일 때 학생에게 보여 줄 안내',
//   required: true,                   ← 이수 완료 점검에 포함할지
//   guide: {
//     intro: '과제 소개',
//     important: ['중요 사항', ...],
//     templates: [{ name: '양식 이름', url: '다운로드 링크' }],
//     submit: { method: '제출 방법', where: '제출 위치', deadlineText: '기한 설명' },
//   }
// }
// ※ 아래 내용은 모두 '틀 확인용 예시'입니다. 실제 과업으로 교체하세요.
// =====================================================================

const TBD = '(내용 입력 예정)';

const guide = (intro = TBD, extra = {}) => ({
  intro,
  important: [TBD],
  templates: [],
  submit: { method: TBD, where: TBD, deadlineText: TBD },
  ...extra,
});

export const TASKS = [
  // ---------------- 공통 과업 ----------------
  {
    id: 'common-orientation',
    title: '실습 오리엔테이션 참석',
    types: 'all',
    week: 1,
    due: { week: 1, day: 'sat' },
    required: true,
    guide: guide('실습 전체 과정과 유형별 진행 방식을 안내하는 오리엔테이션입니다.'),
  },
  {
    id: 'common-type-apply',
    title: '실습 유형 신청서 제출',
    types: 'all',
    week: 2,
    due: { week: 2, day: 'sun' },
    required: true,
    guide: guide('진단 결과를 참고하여 본인의 실습 유형을 확정하고 신청서를 제출합니다.', {
      templates: [{ name: '실습 유형 신청서 (양식 링크 입력 예정)', url: '' }],
    }),
  },
  {
    id: 'common-plan',
    title: '실습 계획서 제출',
    types: 'all',
    week: 3,
    due: { week: 3, day: 'sun' },
    required: true,
    guide: guide(),
  },
  {
    id: 'common-report',
    title: '최종 실습 보고서 제출',
    types: 'all',
    week: 15,
    due: { week: 15, day: 'sun' },
    required: true,
    guide: guide(),
  },
  {
    id: 'common-self-eval',
    title: '자기 평가서 제출',
    types: 'all',
    week: 15,
    due: { week: 15, day: 'sun' },
    required: true,
    guide: guide(),
  },

  // ---------------- 유형 1 ----------------
  {
    id: 't1-observe-apply',
    title: '오프라인 참관 일정 신청',
    types: ['1', '1-1'],
    week: 4,
    due: { week: 4, day: 'fri' },
    required: true,
    guide: guide(),
  },
  {
    id: 't1-observe',
    title: '오프라인 참관 수행 및 참관 일지 제출',
    types: ['1'],
    week: 8,
    due: { week: 8, day: 'sun' },
    required: true,
    guide: guide(),
  },

  // ---------------- 유형 1-1 ----------------
  {
    id: 't11-observe-offline',
    title: '오프라인 참관 8시간 수행 및 참관 일지 제출',
    types: ['1-1'],
    week: 8,
    due: { week: 8, day: 'sun' },
    required: true,
    guide: guide(),
  },
  {
    id: 't11-observe-online',
    title: '온라인 참관 1시간 수행 및 참관 일지 제출',
    types: ['1-1'],
    week: 9,
    due: { week: 9, day: 'sun' },
    required: true,
    guide: guide(),
  },

  // ---------------- 모의수업 (1, 1-1, 3) ----------------
  {
    id: 'mock-lessonplan',
    title: '모의수업 교안 제출',
    types: ['1', '1-1', '3'],
    week: 10,
    due: { week: 10, day: 'sun' },
    required: true,
    guide: guide(),
  },
  {
    id: 'mock-teach',
    title: '모의수업 시연 및 영상 제출',
    types: ['1', '1-1', '3'],
    week: 12,
    due: { week: 12, day: 'sun' },
    required: true,
    guide: guide(),
  },

  // ---------------- 기관 직접 섭외 (2, 3) ----------------
  {
    id: 'org-confirm',
    title: '실습 기관 확인서 제출',
    types: ['2', '3'],
    week: 4,
    due: { week: 4, day: 'sun' },
    required: true,
    guide: guide('직접 섭외한 실습 기관의 정보와 담당자 확인을 받아 제출합니다.'),
  },
  {
    id: 'org-observe',
    title: '기관 수업 참관 및 참관 일지 제출',
    types: ['2', '3'],
    week: 9,
    due: null,
    dueNote: '실습 기관 일정에 따라 결정됩니다. 일정이 확정되면 직접 입력하세요.',
    required: true,
    guide: guide(),
  },
  {
    id: 'org-teach-plan',
    title: '강의 실습 교안 제출',
    types: ['2'],
    week: 10,
    due: null,
    dueNote: '실습 기관 일정에 따라 결정됩니다.',
    required: true,
    guide: guide(),
  },
  {
    id: 'org-teach',
    title: '강의 실습 수행',
    types: ['2'],
    week: 12,
    due: null,
    dueNote: '실습 기관 일정에 따라 결정됩니다.',
    required: true,
    guide: guide(),
  },
  {
    id: 'org-eval',
    title: '기관 담당자 평가서 제출',
    types: ['2'],
    week: 14,
    due: { week: 14, day: 'sun' },
    required: true,
    guide: guide(),
  },

  // ---------------- 유형 2-1 (예르생달랏대학교) ----------------
  {
    id: 'dalat-apply',
    title: '예르생달랏대학교 실습 참가 신청',
    types: ['2-1'],
    week: 3,
    due: { week: 3, day: 'fri' },
    required: true,
    guide: guide(),
  },
  {
    id: 'dalat-observe',
    title: '현지 수업 참관 및 참관 일지 제출',
    types: ['2-1'],
    week: 9,
    due: null,
    dueNote: '현지 학사 일정에 따라 결정됩니다.',
    required: true,
    guide: guide(),
  },
  {
    id: 'dalat-teach',
    title: '현지 강의 실습 수행 및 교안 제출',
    types: ['2-1'],
    week: 12,
    due: null,
    dueNote: '현지 학사 일정에 따라 결정됩니다.',
    required: true,
    guide: guide(),
  },
];

// 이수 완료 점검에서 과업 외에 추가로 확인할 항목
export const COMPLETION_EXTRA_CHECKS = [
  { id: 'hours', label: '유형별 필수 실습 시간을 모두 채웠다 (예시)' },
  { id: 'files', label: '제출한 모든 파일이 정상적으로 열리는지 확인했다 (예시)' },
  { id: 'lms', label: 'LMS에서 제출 완료 상태를 확인했다 (예시)' },
];

export const getTask = (id) => TASKS.find((t) => t.id === id);

export const tasksForType = (typeId) =>
  TASKS.filter((t) => t.types === 'all' || (typeId && t.types.includes(typeId)));
