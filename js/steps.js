// 앱의 단계(메뉴) 구성 — 첫 화면 소개, 상단 메뉴, 이전/다음 단계 버튼에 함께 쓰입니다.
// group: 'prep' = 언제든 따로 확인하는 단계(순서 무관), 'flow' = 순서대로 진행하는 단계

export const GROUPS = {
  prep: { label: '언제든 확인', title: '수강 전 · 언제든 따로 확인', desc: '수강 신청 전에도 볼 수 있고, 순서와 상관없이 이용합니다.' },
  flow: { label: '순서대로 진행', title: '실습 진행 · 순서대로', desc: '확정 명단 발표 후 STEP 3부터 차례로 진행합니다. STEP 3을 입력해야 4~6단계가 만들어집니다.' },
};
export const STEPS = [
  {
    path: 'eligibility',
    no: 1,
    group: 'prep',
    short: '수강 자격',
    title: '<한국어교육현장실습> 수강 자격 자기점검',
    desc: '이수한 과목에 체크하면 실습 수강 자격과 자격증 영역별 이수 현황을 함께 확인합니다.',
  },
  {
    path: 'diagnosis',
    no: 2,
    group: 'prep',
    short: '기관·유형',
    title: '실습 기관·유형 살펴보기',
    desc: '나의 상황과 여건에 맞는 실습 기관과 유형을 추천받습니다. (신청 단계 아님)',
  },
  {
    path: 'assign',
    no: 3,
    group: 'flow',
    short: '유형·기관 입력',
    title: '확정된 실습 유형 및 실습 기관 입력',
    desc: '학과 게시판에 확정 명단이 발표되면 나의 실습 유형과 실습 기관을 입력합니다.',
  },
  {
    path: 'timeline',
    no: 4,
    group: 'flow',
    short: '과제 타임라인',
    title: '유형별 과제 타임라인과 가이드',
    desc: '내 유형에 맞는 과제 순서와 제출 기간, 과제별 수행 방법을 확인합니다.',
  },
  {
    path: 'progress',
    no: 5,
    group: 'flow',
    short: '진행 현황',
    title: '진행 현황',
    desc: '완료한 과제와 남은 과제, 마감이 가까운 과제(D-day)를 확인합니다.',
  },
  {
    path: 'complete',
    no: 6,
    group: 'flow',
    short: '이수 점검',
    title: '이수 완료 점검',
    desc: '필수 과제와 최종 확인 사항을 모두 마쳤는지 점검합니다.',
  },
];

export const stepOf = (path) => STEPS.find((s) => s.path === path);
