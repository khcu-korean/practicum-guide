// STEP 2. 실습 유형 추천: 질문에 답하면 맞는 유형과 협력 기관을 추천
import { DIAGNOSIS_QUESTIONS as Q, PRACTICUM_TYPES, DIAGNOSIS_INTRO, recommend, getType, VACATION_NOTE, takeHalf, SEASON_LABEL, seasonOf, ATTR_LABELS, windowsIn, monthsFor, fmtWindows } from '../data/types.js';
import { sem, update, semesterId } from '../store.js';
import { esc, toast } from '../utils.js';
import { getSemester } from '../config.js';
import { typeGuideHTML, cautionsHTML, applicationNoticeHTML } from './typeGuide.js';

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
      return `<label class="choice"><input type="${inputType}" name="${q.id}" value="${esc(o.value)}" ${checked ? 'checked' : ''}/><span>${esc(o.label)}</span></label>`;
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

function instItem(i, sid, a) {
  // 학생이 고른 수강 학기·참관 시기에 해당하는 참관 가능 달
  const ws = windowsIn(i, monthsFor(a));
  const when = a.timing === 'vacation' ? SEASON_LABEL[seasonOf(a)] : a.timing === 'semester' ? '학기 중' : '';
  const badges = [ATTR_LABELS.region[i.region], ATTR_LABELS.mode[i.mode], ATTR_LABELS.days[i.days], when];
  const line = `${ws.length ? `${fmtWindows(ws)} 중${when ? ` (${when})` : ''}` : '참관 일정 추후 안내'} · ${i.method}${i.note ? ` · ${i.note}` : ''}`;
  return `<li class="inst-item">
    <b>${esc(i.name)}</b> <span class="muted">${esc(i.location || '')}</span>
    <div class="badges">${badges.filter(Boolean).map((x) => `<span class="tag">${esc(x)}</span>`).join('')}</div>
    <div class="tiny muted">${esc(line)}</div>
  </li>`;
}

const typeHead = (t) => `<div class="row"><h3 class="grow">${esc(t.name)}</h3><span class="badge badge-soon">추천</span></div>
  <p><b>${esc(t.summary)}</b></p>`;

function resultHTML(a) {
  const r = recommend(a, semesterId());
  let body = '';
  let ok = false;
  if (r.kind === 'self') {
    const t = getType(r.typeId);
    ok = true;
    body = `<p>스스로 섭외한 기관에서 실습하는 경우, 나에게 맞는 유형은 다음과 같습니다.</p>
      <div class="type-card">${typeHead(t)}<p class="muted">${esc(t.description)}</p>${cautionsHTML(t)}</div>`;
  } else if (r.kind === 'noSelfType') {
    body = `<p class="notice">직접 섭외한 <b>국내</b> 기관에서 강의참관만 할 수 있는 경우에는 해당하는 실습 유형이 없습니다.</p>
      <ul class="bullets tiny">
        <li>유형 2: 실습 기관에 자격을 갖춘 실습 지도자가 있고 강의실습까지 할 수 있어야 합니다.</li>
        <li>유형 3: 국외 기관에서 강의참관을 하는 경우만 해당합니다.</li>
      </ul>
      <p class="tiny">국내에서 강의참관만 한다면 <b>학과 협력 기관(유형 1·1-1)</b>에서 실습하세요.</p>
      <button type="button" class="btn primary big" data-to-partner>학과 협력 기관으로 추천 받기 ↑</button>`;
  } else if (r.matches.length) {
    ok = true;
    // 기관을 유형별로 묶어서 보여 줌
    const groups = PRACTICUM_TYPES.filter((t) => r.matches.some((i) => i.type === t.id));
    body = `<p>조건에 맞는 협력 기관이 <b>${r.matches.length}곳</b> 있어요. 기관 정보를 비교해 보고 신청할 곳을 정하세요.</p>
      ${groups
        .map(
          (t) => `<div class="type-card">${typeHead(t)}
          <ul class="inst-list">${r.matches.filter((i) => i.type === t.id).map((i) => instItem(i, r.target.id, a)).join('')}</ul>${cautionsHTML(t)}</div>`
        )
        .join('')}`;
  } else {
    body = `<p class="notice">입력한 조건에 모두 맞는 협력 기관이 없습니다.</p>
      ${
        r.relax.length
          ? `<p class="tiny">조건을 하나 바꾸면 이런 결과가 있어요.</p><ul class="bullets tiny">${r.relax
              .map((x) => `<li>‘${esc(x.label)}’ 조건을 빼면 <b>${x.count}곳</b></li>`)
              .join('')}</ul>`
          : ''
      }
      <p class="tiny muted">스스로 기관을 섭외하는 방법(유형 2·3)도 있습니다. 첫 문항에서 "직접 섭외"를 골라 보세요. 그 밖의 경우는 담당 교수(조교)에게 문의하세요.</p>
      <button type="button" class="btn primary big" data-retry>다른 항목 선택 후 다시 추천 받기 ↑</button>`;
  }
  const notes = [];
  if (a.timing === 'vacation') notes.push(`<b>방학 중 강의참관</b>: ${esc(VACATION_NOTE[takeHalf(a)])}`);
  if (r.target.fallback && r.kind !== 'self' && a.timing !== 'vacation') notes.push(`${a.take}학기 협력 기관과 일정은 아직 정해지지 않았습니다. 아래는 ${esc(getSemester(r.target.id).label)} 기준 정보이니 참고만 하세요.`);
  return `
  <section class="card">
    <h2>추천 결과</h2>
    ${notes.map((n) => `<p class="notice tiny">${n}</p>`).join('')}
    ${body}
    ${ok ? applicationNoticeHTML({ selfApply: r.kind === 'self' }) : ''}
    <p class="tiny muted">※ 추천 결과는 기관 선택을 돕기 위한 참고 자료입니다.</p>
  </section>
  <section class="card next">
    <p class="muted">확정 명단이 발표되면</p>
    <h2>STEP 3-가. 확정된 실습 유형 및 실습 기관을 입력하세요</h2>
    <p class="tiny">입력한 유형에 맞춰 유형별 과제 타임라인이 만들어집니다.</p>
    <a class="btn primary" href="#/assign">확정된 실습 유형·기관 입력하기 →</a>
  </section>`;
}

export default {
  title: '실습 유형 추천받기',
  render() {
    const s = sem();
    const a = s.diagnosis?.answers || {};
    return `
    <h1 class="page-title">STEP 2. 실습 유형 추천받기</h1>
    <p class="muted">몇 가지 질문에 답하면 나의 여건에 맞는 실습 유형과 협력 기관을 추천해 드려요.</p>
    <p class="notice tiny">${esc(DIAGNOSIS_INTRO)}</p>
    ${typeGuideHTML({ withGlossary: true })}
    <form id="diagForm" class="stack">
      <div id="questions">${Q.map((q) => questionHTML(q, a)).join('')}</div>
      <button class="btn primary big" type="submit">추천 받기</button>
    </form>
    <div id="result">${s.diagnosis ? resultHTML(a) : ''}</div>`;
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
    // 직접 섭외 국내·참관만 → 첫 문항을 '학과 협력 기관'으로 바꾸고 이어지는 질문으로 이동
    root.addEventListener('click', (e) => {
      if (!e.target.closest('[data-to-partner]')) return;
      const no = form.querySelector('input[name="self"][value="no"]');
      if (!no) return;
      no.checked = true;
      form.dispatchEvent(new Event('change'));
      const qs = root.querySelectorAll('#questions section.q');
      qs[1]?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      qs.forEach((q, i) => i > 0 && q.classList.add('retry'));
      setTimeout(() => qs.forEach((q) => q.classList.remove('retry')), 2500);
    });
    // 추천 결과가 없을 때: 질문으로 올라가 다른 항목을 고르게 함 (고른 답은 그대로 둠)
    root.addEventListener('click', (e) => {
      if (!e.target.closest('[data-retry]')) return;
      const first = root.querySelector('#questions section.q');
      first?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      root.querySelectorAll('#questions section.q').forEach((q) => q.classList.add('retry'));
      setTimeout(() => root.querySelectorAll('#questions section.q').forEach((q) => q.classList.remove('retry')), 2500);
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const a = read();
      const missing = Q.filter((q) => visible(q, a) && q.type === 'single' && !a[q.id]);
      if (missing.length) return toast('모든 문항에 답해 주세요.');
      update((s) => (s.diagnosis = { answers: a, at: new Date().toISOString() }));
      requestAnimationFrame(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth' }));
    });
  },
};
