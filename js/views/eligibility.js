// ② 수강 자격 자가진단 (로그인 없이도 이용 가능)
import { ELIGIBILITY as E } from '../data/eligibility.js';
import { getUser, sem, update } from '../store.js';
import { esc } from '../utils.js';

function evaluate(input) {
  const total = Number(input.totalCredits) || 0;
  const areas = E.areas.map((a) => {
    const taken = a.courses.filter((c) => input.courses.includes(c.id));
    const earned = taken.reduce((n, c) => n + c.credits, 0);
    return {
      id: a.id,
      name: a.name,
      required: a.requiredCredits,
      earned,
      ok: earned >= a.requiredCredits,
      lack: Math.max(0, a.requiredCredits - earned),
      remaining: a.courses.filter((c) => !input.courses.includes(c.id)),
    };
  });
  const others = E.otherRequirements.map((r) => ({ ...r, ok: Boolean(input.others[r.id]) }));
  const totalOk = total >= E.totalCredits.required;
  return {
    total: { earned: total, required: E.totalCredits.required, ok: totalOk, lack: Math.max(0, E.totalCredits.required - total) },
    areas,
    others,
    ok: totalOk && areas.every((a) => a.ok) && others.every((o) => o.ok),
  };
}

function resultHTML(r) {
  const mark = (ok) => `<span class="badge ${ok ? 'badge-done' : 'badge-over'}">${ok ? '충족' : '미충족'}</span>`;
  return `
  <section class="card ${r.ok ? 'success' : 'alert'}">
    <h2>${r.ok ? '✅ 수강 신청 가능 (자가진단 기준)' : '⚠️ 아직 충족하지 않은 요건이 있어요'}</h2>
    <table class="result">
      <tr><th>${esc(E.totalCredits.label)}</th><td>${r.total.earned} / ${r.total.required}학점</td><td>${mark(r.total.ok)}</td></tr>
      ${r.areas.map((a) => `<tr><th>${esc(a.name)}</th><td>${a.earned} / ${a.required}학점</td><td>${mark(a.ok)}</td></tr>`).join('')}
      ${r.others.map((o) => `<tr><th colspan="2">${esc(o.label)}</th><td>${mark(o.ok)}</td></tr>`).join('')}
    </table>

    ${
      r.ok
        ? ''
        : `<h3>이렇게 준비하세요</h3><ul class="bullets">
        ${r.total.ok ? '' : `<li>전체 학점이 <b>${r.total.lack}학점</b> 부족합니다.</li>`}
        ${r.areas
          .filter((a) => !a.ok)
          .map(
            (a) => `<li><b>${esc(a.name)}</b>에서 <b>${a.lack}학점</b>이 더 필요합니다.<br/>
              <span class="muted">추가 이수 가능 과목: ${a.remaining.map((c) => `${esc(c.name)}(${c.credits})`).join(', ') || '-'}</span></li>`
          )
          .join('')}
        ${r.others.filter((o) => !o.ok).map((o) => `<li>${esc(o.label)} → 요건 확인 필요</li>`).join('')}
      </ul>`
    }
    <p class="tiny muted">${esc(E.disclaimer)}</p>
    ${getUser() ? '' : '<a class="btn primary" href="#/login">결과 저장하고 실습 준비 시작하기 →</a>'}
  </section>`;
}

export default {
  title: '수강 자격 자가진단',
  public: true,
  render() {
    const saved = sem().eligibility;
    const input = saved?.input || { totalCredits: '', courses: [], others: {} };
    return `
    <h1 class="page-title">STEP 1. 수강 자격 자가진단</h1>
    <p class="muted">지금까지 이수한 과목을 선택하면 수강 신청 자격을 확인해 드려요.</p>

    <form id="eligForm" class="stack">
      <section class="card">
        <label>${esc(E.totalCredits.label)}
          <input type="number" name="totalCredits" min="0" max="200" value="${esc(input.totalCredits)}" required />
        </label>
        <p class="tiny muted">${esc(E.totalCredits.help)}</p>
      </section>

      ${E.areas
        .map(
          (a) => `
        <section class="card">
          <h2>${esc(a.name)} <small class="muted">필수 ${a.requiredCredits}학점</small></h2>
          <div class="checks">
            ${a.courses
              .map(
                (c) => `<label class="check"><input type="checkbox" name="course" value="${c.id}" ${input.courses.includes(c.id) ? 'checked' : ''}/>
                <span>${esc(c.name)}</span><small>${c.credits}학점</small></label>`
              )
              .join('')}
          </div>
        </section>`
        )
        .join('')}

      <section class="card">
        <h2>기타 수강 요건</h2>
        <div class="checks">
          ${E.otherRequirements
            .map(
              (r) => `<label class="check"><input type="checkbox" name="other" value="${r.id}" ${input.others[r.id] ? 'checked' : ''}/>
              <span>${esc(r.label)}</span></label>`
            )
            .join('')}
        </div>
      </section>

      <button class="btn primary big" type="submit">진단하기</button>
    </form>
    <div id="result">${saved ? resultHTML(saved.result) : ''}</div>`;
  },

  mount(root) {
    const form = root.querySelector('#eligForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = {
        totalCredits: form.totalCredits.value,
        courses: [...form.querySelectorAll('input[name=course]:checked')].map((x) => x.value),
        others: Object.fromEntries([...form.querySelectorAll('input[name=other]:checked')].map((x) => [x.value, true])),
      };
      const result = evaluate(input);
      update((s) => (s.eligibility = { input, result, at: new Date().toISOString() }));
      requestAnimationFrame(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth' }));
    });
  },
};
