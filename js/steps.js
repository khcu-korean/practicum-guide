// 앱의 메뉴 구성
// - MENUS: 상단 메뉴와 홈 바둑판에 보이는 큰 메뉴 (1, 2, 3)
// - SUBSTEPS: 3. 실습 유형별 과제 수행 안의 세부 단계 (3-1 ~ 3-4, 순서대로 진행)

export const MENUS = [
  { path: 'eligibility', no: '1', short: '수강 자격', title: '수강 자격 자기점검', icon: 'check' },
  { path: 'diagnosis', no: '2', short: '유형 추천', title: '실습 유형 추천받기', icon: 'compass' },
  { path: 'practice', no: '3', short: '과제 수행', title: '실습 유형별 과제 수행', icon: 'list' },
];

export const SUBSTEPS = [
  { path: 'assign', no: '3-1', short: '유형·기관 입력', title: '확정된 실습 유형 및 실습 기관 입력', desc: '확정 명단이 발표되면 나의 실습 기관을 입력합니다.' },
  { path: 'timeline', no: '3-2', short: '과제 타임라인', title: '유형별 과제 타임라인과 가이드', desc: '내 유형의 과제 순서와 제출 기간, 수행 방법을 확인합니다.' },
  { path: 'progress', no: '3-3', short: '진행 현황', title: '진행 현황', desc: '완료한 과제와 남은 과제, 마감이 가까운 과제를 확인합니다.' },
  { path: 'complete', no: '3-4', short: '이수 점검', title: '이수 완료 점검', desc: '필수 과제와 최종 확인 사항을 점검합니다.' },
];

// 이전/다음 단계 버튼의 순서 (큰 메뉴 1, 2 → 3의 세부 단계)
export const FLOW = [MENUS[0], MENUS[1], ...SUBSTEPS];

export const stepOf = (path) => FLOW.find((s) => s.path === path);
export const isSubstep = (path) => SUBSTEPS.some((s) => s.path === path) || path === 'task';
