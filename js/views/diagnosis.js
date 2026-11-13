// ③ 실습 유형 진단 및 추천 → 유형 확정
import { DIAGNOSIS_QUESTIONS as Q, PRACTICUM_TYPES, GLOSSARY, APPLICATION_NOTICE, DIAGNOSIS_INTRO, instLine } from '../data/types.js';
import { sem, update, semesterId } from '../store.js';
import { esc, toast } from '../utils.js';
import { typeGuideHTML } from './typeGuide.js';

const visible = (q, a) =>
  !q.showIf ||
  Object.entries(q.showIf).every(([k, v]) => (Array.isArray(v) ? v.includes(a[k]) : a[k] === v));

function questionHTML(q, a) {
  if (!visible(q, a)) return '';
  let body = '';
  if (q.type === 'single' || q.type === 'multi') {
    const inputType = q.type === 'single' ? 'radio' : 'checkbox';
    const opt = (o) => {
      const checked = q.type === 'single' ? a[q.id] === o.value : (a[q.id] || []).includes(o.value);
      return `<label class="choice"><input type="${inputType}" name="${q.id}" value="${esc(o.value)}" ${checked ? 'checked' : ''}/><span>${esc(o.label)}${o.inst ? `<small class="note">${o.inst.location ? `${esc(o.inst.location)} · ` : ''}${esc(instLine(o.inst, semesterId()))}</small>` : ''}</span></label>`;
    };
    const groups = [...new Set(q.options.map((o) => o.group || ''))];
    body = groups
      .map((g) => `${g ? `<p class="group-title">${esc(g)}</p>` : ''}<div class="choices ${g ? 'col' : ''}">${q.options.filter((o) => (o.group || '') === g).map(opt).join('')}</div>`)
      .join('');
  } else {
    body = `<input type="text" name="${q.id}" value="${esc(a[q.id] || '')}" />`;
  }
  return `<section class="card q"><h3>${esc(q.text)}</h3>${q.help ? `<p class="tiny muted">${esc(q.help)}</p>` : ''}${body}</section>`;
}

function recommend(a) {
  return PRACTICUM_TYPES.map((t) => ({ type: t, ...t.match(a) }));
}

function resultHTML(results, currentTypeId) {
  const ok = results.filter((r) => r.ok);
  const no = results.filter((r) => !r.ok);
  const card = (r) => `
    <div class="type-card ${r.ok ? '' : 'disabled'} ${currentTypeId === r.type.id ? 'selected' : ''}">
      <div class="row">
        <h3 class="grow">${esc(r.type.name)}</h3>
        ${currentTypeId === r.type.id ? '<span class="badge badge-done">나의 확정 유형</span>' : ''}
      </div>
      <p><b>${esc(r.type.summary)}</b></p>
      <p class="muted">${esc(r.type.description)}</p>
      <p class="tiny">활동: ${r.type.activities.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}</p>
      ${
        r.type.institutions
          ? `<ul class="inst tiny">${r.type.institutions.map((i) => `<li>${esc(i.name)} <span class="muted">${i.location ? esc(i.location) : esc(i.region)} · ${esc(instLine(i, semesterId()))}</span></li>`).join('')}</ul>`
          : '<p class="tiny muted">실습 기관: 실습생이 직접 섭외</p>'
      }
      <ul class="bullets tiny">${r.reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>`;
  return `
  <section class="card">
    <h2>추천 결과</h2>
    ${ok.length ? `<p>선택 가능한 실습 유형이 <b>${ok.length}개</b> 있어요.</p>${ok.map(card).join('')}` : '<p class="notice">입력한 조건으로 선택 가능한 유형이 없습니다. 담당 교수(조교)에게 문의하세요.</p>'}
    ${no.length ? `<details><summary>선택이 어려운 유형 보기 (${no.length})</summary>${no.map(card).join('')}</details>` : ''}
    <div class="notice">
      <b>실제 신청은 이렇게 합니다</b>
      <ul class="bullets tiny">${APPLICATION_NOTICE.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
    <p class="tiny muted">※ 추천 결과는 기관 선택을 돕기 위한 참고 자료입니다.</p>
  </section>
  <section class="card next">
    <p class="muted">확정 명단이 발표되면</p>
    <h2>STEP 3. 확정된 실습 유형 및 실습 기관을 입력하세요</h2>
    <p class="tiny">입력한 유형에 맞춰 유형별 과제 타임라인이 만들어집니다.</p>
    <a class="btn primary" href="#/assign">확정된 실습 유형·기관 입력하기 →</a>
  </section>`;
}

export default {
  title: '실습 기관·유형 살펴보기',
  render() {
    const s = sem();
    const a = s.diagnosis?.answers || {};
    return `
    <h1 class="page-title">STEP 2. 실습 기관·유형 살펴보기</h1>
    <p class="muted">나의 상황과 여건을 입력하면 고를 수 있는 실습 기관과 유형을 추천해 드려요.</p>
    <p class="notice tiny">${esc(DIAGNOSIS_INTRO)}</p>
    ${typeGuideHTML({ withGlossary: true })}
    <form id="diagForm" class="stack">
      <div id="questions">${Q.map((q) => questionHTML(q, a)).join('')}</div>
      <button class="btn primary big" type="submit">추천 받기</button>
    </form>
    <div id="result">${s.diagnosis ? resultHTML(recommend(a), s.typeId) : ''}</div>`;
  },

  mount(root) {
    const form = root.querySelector('#diagForm');
    const read = () => {
      const a = {};
      for (const q of Q) {
        if (q.type === 'multi') a[q.id] = [...form.querySelectorAll(`input[name="${q.id}"]:checked`)].map((x) => x.value);
        else if (q.type === 'single') a[q.id] = form.querySelector(`input[name="${q.id}"]:checked`)?.value;
        else a[q.id] = form.querySelector(`input[name="${q.id}"]`)?.value;
      }
      return a;
    };
    // 답변에 따라 조건부 문항 표시/숨김
    form.addEventListener('change', () => {
      const a = read();
      root.querySelector('#questions').innerHTML = Q.map((q) => questionHTML(q, a)).join('');
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = read();
      const missing = Q.filter((q) => visible(q, a) && q.type === 'single' && !a[q.id]);
      if (missing.length) return toast('모든 문항에 답해 주세요.');
      const recommended = recommend(a).filter((r) => r.ok).map((r) => r.type.id);
      update((s) => (s.diagnosis = { answers: a, recommended, at: new Date().toISOString() }));
      requestAnimationFrame(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth' }));
    });
  },
};
