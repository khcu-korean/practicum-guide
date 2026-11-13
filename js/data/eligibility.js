// =====================================================================
// ② 수강 자격 자가진단 기준 데이터
// 출처: 경희사이버대학교 한국어교육전공 안내 (실습 과목 수강 자격, 영역별 과목)
// =====================================================================

export const ELIGIBILITY = {
  disclaimer:
    '본 결과는 학생이 입력한 정보에 근거한 자가진단입니다. 최종 수강 자격은 학교의 공식 학사 기준에 따릅니다.',

  // 판정 기준이 되는 이수 시점 안내
  basisNote: '실습 신청 직전 학기 이수 여부를 기준으로 합니다.',

  // 학생 구분 (구분에 따라 1·3영역 합산 기준이 달라짐)
  tracks: [
    { id: 'major', label: '주전공 · 복수전공', grade: '2급', combinedCredits: 24, combinedCourses: 8 },
    { id: 'minor', label: '부전공', grade: '3급', combinedCredits: 12, combinedCourses: 4 },
  ],

  // 공통: 전체 이수 학점
  totalCredits: {
    required: 105,
    label: '전체 이수 학점',
    help: '지금까지 이수한 전체 학점을 입력하세요.',
  },

  // 합산 기준에 들어가는 영역과, 각 영역의 최소 이수 학점
  combinedAreaIds: ['area1', 'area3'],
  minCreditsPerArea: 3,

  // 영역별 과목 (offered: 개설 학기 / 1 = 1학기, 2 = 2학기)
  areas: [
    {
      id: 'area1',
      name: '1영역 (한국어학)',
      courses: [
        { id: 'a1-grammar', name: '한국어문법론', credits: 3, offered: [1] },
        { id: 'a1-semantics', name: '한국어의미론', credits: 3, offered: [1] },
        { id: 'a1-intro', name: '한국어학개론', credits: 3, offered: [2] },
        { id: 'a1-norms', name: '한국어어문규범', credits: 3, offered: [2] },
      ],
    },
    {
      id: 'area3',
      name: '3영역 (외국어로서의 한국어교육론)',
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
  ],

  // 목록에 없는 과목으로 인정받은 학점(편입·학점 인정 등)을 영역별로 입력받을지
  allowExtraCredits: true,

  // 기타 수강 요건 — 모두 충족해야 '신청 가능'
  otherRequirements: [
    { id: 'year4', label: '실습을 수강할 학기에 4학년 1학기 이상인가요?', help: '4학년 1학기부터 수강할 수 있습니다.' },
  ],

  // 참고: 한국어교원 자격 심사 영역별 필수 이수 학점 (자격 취득 기준, 실습 신청 자격과는 별개)
  certificateTable: {
    title: '참고: 한국어교원 자격 심사 영역별 필수 이수 학점',
    columns: ['2급 (전공·복수전공)', '3급 (부전공)'],
    rows: [
      { area: '1영역 한국어학', values: [6, 3] },
      { area: '2영역 일반언어학 및 응용언어학', values: [6, 3] },
      { area: '3영역 외국어로서의 한국어교육론', values: [24, 9] },
      { area: '4영역 한국문화', values: [6, 3] },
      { area: '5영역 한국어교육실습', values: [3, 3] },
    ],
    total: [45, 21],
  },
};
