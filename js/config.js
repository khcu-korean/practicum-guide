// =====================================================================
// 앱 기본 설정
// - 학기 정보, 알림 기준일, 서버(Supabase) 연결 정보를 여기서 관리합니다.
// =====================================================================

export const CONFIG = {
  appName: '한국어교육현장실습 길잡이',
  subtitle: '한국어교육실습 수강생을 위한 실습 안내',

  // 학교 표시 (logo에 이미지 경로를 넣으면 글자 표시 대신 로고가 나옵니다. 예: 'icons/khcu-logo.png')
  school: {
    name: '경희사이버대학교',
    dept: '한국어문화학부',
    mark: 'KH',
    logo: 'icons/khcu-logo.png',
  },

  // 현재 운영 중인 학기 (학기가 바뀌면 여기만 수정)
  currentSemesterId: '2027-1',

  // 학기 목록: startDate = 개강일(1주차 월요일). 과업 날짜는 이 날짜 기준 'n주차 요일'로 자동 계산됩니다.
  semesters: [
    { id: '2026-2', label: '2026학년도 2학기', startDate: '2026-08-31' },
    { id: '2027-1', label: '2027학년도 1학기', startDate: '2027-03-01' },
  ],

  // 마감 며칠 전에 알림/강조할지
  alertDays: [7, 3, 1],
  urgentDays: 3, // 이 날짜 이하로 남으면 '마감 임박'으로 빨갛게 강조

  // ---------------------------------------------------------------
  // 서버 연결 (비워 두면 '로컬 체험 모드'로 동작: 이 기기 브라우저에만 저장)
  // Supabase 프로젝트를 만든 뒤 URL과 anon key를 넣으면
  // 이메일 인증 로그인 + 휴대폰/PC 간 기록 동기화가 켜집니다. (README 참고)
  // ---------------------------------------------------------------
  supabase: {
    url: '',
    anonKey: '',
  },
};

export const isServerMode = () => Boolean(CONFIG.supabase.url && CONFIG.supabase.anonKey);

export const getSemester = (id) =>
  CONFIG.semesters.find((s) => s.id === id) || CONFIG.semesters[0];
