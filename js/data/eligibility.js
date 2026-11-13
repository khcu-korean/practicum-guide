// =====================================================================
// ② 수강 자격 자가진단 + 자격증 영역별 이수 현황 데이터
// 출처: 경희사이버대학교 한국어교육전공 교육과정 (실습 과목 수강 자격, 영역별 과목, 자격 심사 영역별 필수 이수 학점)
// =====================================================================

export const ELIGIBILITY = {
  disclaimer:
    '본 결과는 학생이 선택한 과목에 근거한 자가진단입니다. 최종 수강 자격과 영역 인정은 학교의 공식 학사 기준과 국립국어원 심사에 따릅니다.',

  // 판정 기준이 되는 이수 시점 안내
  basisNote: '실습 신청 직전 학기 이수 여부를 기준으로 합니다.',

  // 학생 구분: 실습 수강 자격(1·3영역 합산)과 자격증 기준이 달라짐
  tracks: [
    { id: 'major', label: '주전공 · 복수전공', grade: '2급', combinedCredits: 24, combinedCourses: 8 },
    { id: 'minor', label: '부전공', grade: '3급', combinedCredits: 12, combinedCourses: 4 },
  ],

  // 실습 수강 자격: 합산 기준 영역과 영역별 최소 학점
  practicum: {
    combinedAreaIds: ['area1', 'area3'],
    minCreditsPerArea: 3,
  },

  // 과목 체크로 확인할 수 없는 요건 (예/아니요로 확인)
  otherRequirements: [
    {
      id: 'total105',
      label: '전체 이수 학점이 105학점 이상인가요?',
      help: '교양·일반선택 등을 모두 포함한 학점입니다. 학사 정보 시스템의 성적표에서 확인하세요.',
    },
    {
      id: 'year4',
      label: '실습을 수강할 학기에 4학년 1학기 이상인가요?',
      help: '실습은 4학년 1학기부터 수강할 수 있습니다.',
    },
  ],

  // 영역별 과목 (offered: 개설 학기 / 1 = 1학기, 2 = 2학기)
  // cert: 한국어교원 자격 심사 영역별 필수 이수 학점 { major: 2급, minor: 3급 }
  areas: [
    {
      id: 'area1',
      no: 1,
      name: '한국어학',
      cert: { major: 6, minor: 3 },
      courses: [
        { id: 'a1-grammar', name: '한국어문법론', credits: 3, offered: [1] },
        { id: 'a1-semantics', name: '한국어의미론', credits: 3, offered: [1] },
        { id: 'a1-intro', name: '한국어학개론', credits: 3, offered: [2] },
        { id: 'a1-norms', name: '한국어어문규범', credits: 3, offered: [2] },
      ],
    },
    {
      id: 'area2',
      no: 2,
      name: '일반언어학 및 응용언어학',
      cert: { major: 6, minor: 3 },
      courses: [
        { id: 'a2-linguistics', name: '언어학개론', credits: 3, offered: [1] },
        { id: 'a2-acquisition', name: '외국어습득론', credits: 3, offered: [1] },
        { id: 'a2-socio', name: '사회언어학', credits: 3, offered: [2] },
      ],
    },
    {
      id: 'area3',
      no: 3,
      name: '외국어로서의 한국어교육론',
      cert: { major: 24, minor: 9 },
      courses: [
        { id: 'a3-intro', name: '한국어교육개론', credits: 3, offered: [1, 2] },
        { id: 'a3-lessonplan', name: '한국어교안작성과자료개발', credits: 3, offered: [1, 2] },
        { id: 'a3-comprehension', name: '한국어이해교육론', credits: 3, offered: [1] },
        { id: 'a3-vocab', name: '한국어어휘교육론', credits: 3, offered: [1] },
        { id: 'a3-textbook', name: '한국어교재론', credits: 3, offered: [1] },
        { id: 'a3-assessment', name: '한국어평가론', credits: 3, offered: [1] },
        { id: 'a3-youth', name: '아동·청소년대상한국어교육론', credits: 3, offered: [1] },
        { id: 'a3-methods', name: '한국어교수방법론', credits: 3, offered: [2] },
        { id: 'a3-pronunciation', name: '한국어발음교육론', credits: 3, offered: [2] },
        { id: 'a3-expression', name: '한국어표현교육론', credits: 3, offered: [2] },
        { id: 'a3-grammar', name: '한국어문법교육론', credits: 3, offered: [2] },
        { id: 'a3-culture', name: '한국문화교육론', credits: 3, offered: [2] },
        { id: 'a3-multimedia', name: '멀티미디어활용한국어교육', credits: 3, offered: [2] },
      ],
    },
    {
      id: 'area4',
      no: 4,
      name: '한국문화',
      cert: { major: 6, minor: 3 },
      courses: [
        { id: 'a4-modern', name: '한국의현대문화', credits: 3, offered: [1] },
        { id: 'a4-compare', name: '한국문화와타문화의비교', credits: 3, offered: [1] },
        { id: 'a4-food', name: '한국의음식문화', credits: 3, offered: [1] },
        { id: 'a4-multicultural', name: '한국사회의다문화현상이해', credits: 3, offered: [2] },
        { id: 'a4-history', name: '한국역사의이해', credits: 3, offered: [2] },
      ],
    },
    {
      id: 'area5',
      no: 5,
      name: '한국어교육실습',
      cert: { major: 3, minor: 3 },
      courses: [{ id: 'a5-practicum', name: '한국어교육현장실습', credits: 3, offered: [1, 2] }],
    },
  ],
};
