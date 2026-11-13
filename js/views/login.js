import { CONFIG, isServerMode } from '../config.js';
import { requestCode, verifyCode } from '../store.js';
import { esc, toast } from '../utils.js';

export default {
  title: '로그인',
  render() {
    return `
    <section class="hero">
      <p class="label" style="color:#f1dde2">한국어교육현장실습 · 수강생 안내</p>
      <h1>${esc(CONFIG.appName)}</h1>
      <p>${esc(CONFIG.subtitle)}</p>
      <p class="motto">“나에게 해당하는 정보만, 지금 무엇을 언제까지 어떻게 해야 하는지”</p>
    </section>

    <section class="card">
      <h2>이메일로 시작하기</h2>
      <p class="muted">처음이면 계정이 자동으로 만들어지고, 다음부터는 같은 이메일로 이전 기록을 이어 볼 수 있어요. (휴대폰·PC 공통)</p>
      <form id="emailForm" class="stack">
        <label>이메일
          <input type="email" name="email" required placeholder="example@email.com" autocomplete="email" />
        </label>
        <button class="btn primary" type="submit">인증 코드 받기</button>
      </form>

      <form id="codeForm" class="stack hidden">
        <p id="codeInfo" class="notice"></p>
        <label>인증 코드 6자리
          <input name="code" inputmode="numeric" maxlength="6" required placeholder="000000" />
        </label>
        <button class="btn primary" type="submit">로그인</button>
        <button class="btn ghost" type="button" id="backBtn">이메일 다시 입력</button>
      </form>
      ${isServerMode() ? '' : '<p class="tiny muted">※ 현재 로컬 체험 모드입니다. 기록은 이 기기 브라우저에만 저장됩니다.</p>'}
    </section>

    <section class="card soft">
      <h3>수강 신청 전이신가요?</h3>
      <p class="muted">회원가입 없이 수강 자격을 먼저 확인할 수 있어요.</p>
      <a class="btn" href="#/eligibility">수강 자격 자가진단 하기 →</a>
    </section>`;
  },

  mount(root) {
    const emailForm = root.querySelector('#emailForm');
    const codeForm = root.querySelector('#codeForm');
    let email = '';

    emailForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      email = emailForm.email.value.trim();
      try {
        const r = await requestCode(email);
        root.querySelector('#codeInfo').innerHTML = r.demo
          ? `[체험 모드] 실제 메일은 발송되지 않습니다. 인증 코드: <b>${r.code}</b>`
          : `<b>${esc(email)}</b>로 인증 코드를 보냈어요. 메일함(스팸함 포함)을 확인하세요.`;
        emailForm.classList.add('hidden');
        codeForm.classList.remove('hidden');
        codeForm.code.focus();
      } catch (err) {
        toast(err.message || '코드 발송에 실패했어요.');
      }
    });

    codeForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      try {
        await verifyCode(email, codeForm.code.value.trim());
        toast('로그인되었습니다.');
        location.hash = '#/';
      } catch (err) {
        toast(err.message || '인증에 실패했어요.');
      }
    });

    root.querySelector('#backBtn').addEventListener('click', () => {
      codeForm.classList.add('hidden');
      emailForm.classList.remove('hidden');
    });
  },
};
