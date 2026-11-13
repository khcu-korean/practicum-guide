// 더보기: 학기 선택(학기별 기록 구분), 로그아웃
import { CONFIG, isServerMode } from '../config.js';
import { getUser, getData, semesterId, setSemester, logout } from '../store.js';
import { esc } from '../utils.js';

export default {
  title: '더보기',
  render() {
    const data = getData();
    return `
    <h1 class="page-title">더보기</h1>
    <section class="card">
      <h2>내 계정</h2>
      <p>${esc(getUser()?.email)}</p>
      <p class="tiny muted">${isServerMode() ? '서버에 저장되어 휴대폰·PC에서 같은 기록을 볼 수 있어요.' : '로컬 체험 모드: 이 기기 브라우저에만 저장됩니다.'}</p>
      <button class="btn" id="logout">로그아웃</button>
    </section>

    <section class="card">
      <h2>학기 선택</h2>
      <p class="muted">학기별로 실습 기록이 따로 저장됩니다.</p>
      <div class="choices">
        ${CONFIG.semesters
          .map(
            (s) => `<label class="choice"><input type="radio" name="sem" value="${s.id}" ${semesterId() === s.id ? 'checked' : ''}/>
            <span>${esc(s.label)}${data.semesters[s.id]?.typeId ? ' · 기록 있음' : ''}</span></label>`
          )
          .join('')}
      </div>
    </section>

    <section class="card soft">
      <h2>바로가기</h2>
      <ul class="bullets">
        <li><a href="#/eligibility">수강 자격·이수 현황 점검</a></li>
        <li><a href="#/diagnosis">실습 기관·유형 살펴보기</a></li>
        <li><a href="#/assign">배정 유형·기관 입력 / 수정</a></li>
        <li><a href="#/complete">이수 완료 점검</a></li>
      </ul>
    </section>`;
  },
  mount(root) {
    root.querySelector('#logout').addEventListener('click', async () => {
      await logout();
      location.hash = '#/login';
    });
    root.addEventListener('change', (e) => {
      if (e.target.name === 'sem') setSemester(e.target.value);
    });
  },
};
