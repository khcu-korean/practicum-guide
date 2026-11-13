// ③ 실습 유형 진단 및 추천 → 유형 확정
import { DIAGNOSIS_QUESTIONS as Q, PRACTICUM_TYPES, GLOSSARY, APPLICATION_NOTICE } from '../data/types.js';
import { sem, update } from '../store.js';
import { esc, toast } from '../utils.js';

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
      return `<label class="choice"><input type="${inputType}" name="${q.id}" value="${esc(o.value)}" ${checked ? 'checked' : ''}/><span>${esc(o.label)}${o.note ? `<small class="note">${esc(o.note)}</small>` : ''}</span></label>`;
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
        ${currentTypeId === r.type.id ? '<span class="badge badge-done">확정됨</span>' : ''}
      </div>
      <p><b>${esc(r.type.summary)}</b></p>
      <p class="muted">${esc(r.type.description)}</p>
      <p class="tiny">활동: ${r.type.activities.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}</p>
      ${
        r.type.institutions
          ? `<ul class="inst tiny">${r.type.institutions.map((i) => `<li>${esc(i.name)} <span class="muted">${esc(i.region)}${i.schedule ? ` · ${esc(i.schedule)}` : ''}</span></li>`).join('')}</ul>`
          : '<p class="tiny muted">실습 기관: 실습생이 직접 섭외</p>'
      }
      <ul class="bullets tiny">${r.reasons.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
      ${r.ok ? `<button class="btn ${currentTypeId === r.type.id ? '' : 'primary'}" data-pick="${r.type.id}">${currentTypeId === r.type.id ? '이 유형으로 확정됨' : '이 유형으로 확정하기'}</button>` : ''}
    </div>`;
  return `
  <section class="card">
    <h2>추천 결과</h2>
    ${ok.length ? `<p>선택 가능한 실습 유형이 <b>${ok.length}개</b> 있어요.</p>${ok.map(card).join('')}` : '<p class="notice">입력한 조건으로 선택 가능한 유형이 없습니다. 담당 교수(조교)에게 문의하세요.</p>'}
    ${no.length ? `<details><summary>선택이 어려운 유형 보기 (${no.length})</summary>${no.map(card).join('')}</details>` : ''}
    <div class="notice">
      <b>📌 기관 신청 안내</b>
      <ul class="bullets tiny">${APPLICATION_NOTICE.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>
    </div>
    <p class="tiny muted">※ 추천 결과는 참고용입니다. 기관 배정 결과가 나오면 해당 유형으로 확정하세요. 확정한 뒤에도 바꿀 수 있습니다.</p>
  </section>`;
}

export default {
  title: '실습 유형 진단',
  render() {
    const s = sem();
    const a = s.diagnosis?.answers || {};
    return `
    <h1 class="page-title">STEP 2. 실습 유형 진단</h1>
    <p class="muted">나의 상황과 여건을 입력하면 선택할 수 있는 실습 유형을 추천해 드려요.</p>
    <details class="card soft">
      <summary><b>📖 먼저 알아 두면 좋은 용어</b></summary>
      <dl class="glossary">${GLOSSARY.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.definition)}</dd>`).join('')}</dl>
    </details>
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
    root.addEventListener('click', (e) => {
      const id = e.target.closest('[data-pick]')?.dataset.pick;
      if (!id) return;
      const cur = sem().typeId;
      if (cur && cur !== id && !confirm('실습 유형을 변경하면 타임라인이 새 유형에 맞게 바뀝니다. 변경할까요?\n(공통 과업 체크 기록은 유지됩니다)')) return;
      update((s) => (s.typeId = id));
      toast('실습 유형이 확정되었습니다. 맞춤 타임라인을 확인하세요!');
      location.hash = '#/timeline';
    });
  },
};
