// 앱의 단계(메뉴) 구성 — 첫 화면 소개, 상단 메뉴, 이전/다음 단계 버튼에 함께 쓰입니다.
export const STEPS = [
  {
    path: 'eligibility',
    no: 1,
    short: '수강 자격',
    title: '<한국어교육현장실습> 수강 자격 자기점검',
    desc: '이수한 과목에 체크하면 실습 수강 자격과 자격증 영역별 이수 현황을 함께 확인합니다.',
  },
  {
    path: 'diagnosis',
    no: 2,
    short: '기관·유형',
    title: '실습 기관·유형 살펴보기',
    desc: '나의 상황과 여건에 맞는 실습 기관과 유형을 추천받습니다. (신청 단계 아님)',
  },
  {
    path: 'assign',
    no: 3,
    short: '유형·기관 입력',
    title: '확정된 실습 유형 및 실습 기관 입력',
    desc: '학과 게시판에 확정 명단이 발표되면 나의 실습 유형과 실습 기관을 입력합니다.',
  },
  {
    path: 'timeline',
    no: 4,
    short: '과제 타임라인',
    title: '유형별 과제 타임라인과 가이드',
    desc: '내 유형에 맞는 과제 순서와 제출 기간, 과제별 수행 방법을 확인합니다.',
  },
  {
    path: 'progress',
    no: 5,
    short: '진행 현황',
    title: '진행 현황',
    desc: '완료한 과제와 남은 과제, 마감이 가까운 과제(D-day)를 확인합니다.',
  },
  {
    path: 'complete',
    no: 6,
    short: '이수 점검',
    title: '이수 완료 점검',
    desc: '필수 과제와 최종 확인 사항을 모두 마쳤는지 점검합니다.',
  },
];

export const stepOf = (path) => STEPS.find((s) => s.path === path);
