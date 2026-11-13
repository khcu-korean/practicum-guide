// 더보기: 기록 관리(이 기기 저장, 기록 코드로 옮기기, 초기화), 학기 선택
import { CONFIG, isServerMode } from '../config.js';
import { getUser, getData, semesterId, setSemester, logout, exportCode, importCode, resetData } from '../store.js';
import { esc, toast } from '../utils.js';

export default {
  title: '더보기',
  render() {
    const data = getData();
    const user = getUser();
    return `
    <h1 class="page-title">더보기</h1>

    <section class="card">
      <h2>내 기록 관리</h2>
      ${
        isServerMode() && user
          ? `<p>${esc(user.email)}</p><p class="tiny muted">서버에 저장되어 휴대폰·PC에서 같은 기록을 볼 수 있어요.</p>
             <button class="btn" id="logout">로그아웃</button>`
          : `<p class="muted">체크한 내용은 <b>지금 쓰는 기기의 브라우저</b>에 자동으로 저장됩니다. 이름이나 이메일 같은 개인 정보는 받지 않습니다.</p>
             <ul class="bullets tiny muted">
               <li>같은 기기, 같은 브라우저로 다시 들어오면 기록이 그대로 남아 있습니다.</li>
               <li>브라우저의 방문 기록·데이터를 지우거나, 시크릿(개인 정보 보호) 모드로 열면 기록이 사라집니다.</li>
               <li>다른 기기에서 이어 쓰려면 아래 <b>기록 코드</b>를 복사해 그 기기에서 붙여넣으세요.</li>
             </ul>`
      }
      <div class="btn-row">
        <button class="btn" id="exportBtn">기록 코드 복사</button>
        <button class="btn" id="importBtn">기록 코드 붙여넣기</button>
        <button class="btn ghost" id="resetBtn">전체 초기화</button>
      </div>
      <div id="codeBox" class="hidden">
        <textarea id="codeText" rows="4" placeholder="다른 기기에서 복사한 기록 코드를 붙여넣으세요"></textarea>
        <div class="btn-row"><button class="btn primary" id="importDo">불러오기</button></div>
      </div>
      <div id="resetBox" class="hidden notice">
        이 기기에 저장된 모든 기록을 지웁니다.
        <div class="btn-row"><button class="btn" id="resetYes">지우기</button><button class="btn ghost" id="resetNo">취소</button></div>
      </div>
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
    </section>`;
  },
  mount(root) {
    const $ = (sel) => root.querySelector(sel);
    $('#logout')?.addEventListener('click', async () => {
      await logout();
      location.hash = '#/';
    });
    $('#exportBtn').addEventListener('click', async () => {
      const code = exportCode();
      $('#codeBox').classList.remove('hidden');
      $('#codeText').value = code;
      try {
        await navigator.clipboard.writeText(code);
        toast('기록 코드를 복사했습니다. 다른 기기에서 붙여넣으세요.');
      } catch {
        $('#codeText').select();
        toast('코드를 길게 눌러(또는 Ctrl+C) 복사하세요.');
      }
    });
    $('#importBtn').addEventListener('click', () => {
      $('#codeBox').classList.remove('hidden');
      $('#codeText').value = '';
      $('#codeText').focus();
    });
    $('#importDo').addEventListener('click', () => {
      try {
        importCode($('#codeText').value);
        toast('기록을 불러왔습니다.');
      } catch {
        toast('코드를 읽지 못했습니다. 복사한 코드 전체를 붙여넣었는지 확인하세요.');
      }
    });
    $('#resetBtn').addEventListener('click', () => $('#resetBox').classList.remove('hidden'));
    $('#resetNo').addEventListener('click', () => $('#resetBox').classList.add('hidden'));
    $('#resetYes').addEventListener('click', () => {
      resetData();
      toast('모든 기록을 지웠습니다.');
    });
    root.addEventListener('change', (e) => {
      if (e.target.name === 'sem') setSemester(e.target.value);
    });
  },
};
