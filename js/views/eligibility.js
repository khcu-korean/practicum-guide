// ② 수강 자격 자가진단 (로그인 없이도 이용 가능)
import { ELIGIBILITY as E } from '../data/eligibility.js';
import { getUser, sem, update } from '../store.js';
import { esc } from '../utils.js';

const offeredLabel = (o) => (o.length === 2 ? '1·2학기' : `${o[0]}학기`);

function evaluate(input) {
  const track = E.tracks.find((t) => t.id === input.track) || E.tracks[0];
  const total = Number(input.totalCredits) || 0;

  const areas = E.areas.map((a) => {
    const taken = a.courses.filter((c) => input.courses.includes(c.id));
    const extra = Number(input.extra?.[a.id]) || 0;
    const earned = taken.reduce((n, c) => n + c.credits, 0) + extra;
    const min = E.combinedAreaIds.includes(a.id) ? E.minCreditsPerArea : 0;
    return {
      id: a.id,
      name: a.name,
      earned,
      courseCount: taken.length,
      extra,
      min,
      ok: earned >= min,
      lack: Math.max(0, min - earned),
      remaining: a.courses.filter((c) => !input.courses.includes(c.id)),
    };
  });

  const combinedEarned = areas.filter((a) => E.combinedAreaIds.includes(a.id)).reduce((n, a) => n + a.earned, 0);
  const combined = {
    earned: combinedEarned,
    required: track.combinedCredits,
    courses: track.combinedCourses,
    ok: combinedEarned >= track.combinedCredits,
    lack: Math.max(0, track.combinedCredits - combinedEarned),
  };
  const others = E.otherRequirements.map((r) => ({ ...r, ok: Boolean(input.others[r.id]) }));
  const totalOk = total >= E.totalCredits.required;

  return {
    track: { id: track.id, label: track.label, grade: track.grade },
    total: { earned: total, required: E.totalCredits.required, ok: totalOk, lack: Math.max(0, E.totalCredits.required - total) },
    combined,
    areas,
    others,
    ok: totalOk && combined.ok && areas.every((a) => a.ok) && others.every((o) => o.ok),
  };
}

function resultHTML(r) {
  const mark = (ok) => `<span class="badge ${ok ? 'badge-done' : 'badge-over'}">${ok ? '충족' : '미충족'}</span>`;
  const combinedName = E.combinedAreaIds.map((id) => E.areas.find((a) => a.id === id).name.split(' ')[0]).join('·');
  const todo = [];
  if (!r.total.ok) todo.push(`전체 이수 학점이 <b>${r.total.lack}학점</b> 부족합니다.`);
  r.areas
    .filter((a) => !a.ok)
    .forEach((a) => todo.push(`<b>${esc(a.name)}</b>을(를) 최소 <b>${a.min}학점</b> 이수해야 합니다. (현재 ${a.earned}학점)`));
  if (!r.combined.ok) {
    const options = r.areas
      .filter((a) => E.combinedAreaIds.includes(a.id))
      .map(
        (a) => `<div class="tiny"><b>${esc(a.name)}</b>: ${a.remaining.map((c) => `${esc(c.name)} <span class="muted">(${offeredLabel(c.offered)})</span>`).join(', ') || '-'}</div>`
      )
      .join('');
    todo.push(
      `${combinedName} 합산 학점이 <b>${r.combined.lack}학점</b>(약 ${Math.ceil(r.combined.lack / 3)}과목) 더 필요합니다.<div class="sub">추가로 이수할 수 있는 과목:</div>${options}`
    );
  }
  r.others.filter((o) => !o.ok).forEach((o) => todo.push(`${esc(o.help || o.label)}`));

  return `
  <section class="card ${r.ok ? 'success' : 'alert'}">
    <h2>${r.ok ? '수강 신청 가능 (자가진단 기준)' : '아직 충족하지 않은 요건이 있어요'}</h2>
    <p class="tiny muted">${esc(r.track.label)} (${esc(r.track.grade)}) 기준</p>
    <table class="result">
      <tr><th>${esc(E.totalCredits.label)}</th><td>${r.total.earned} / ${r.total.required}학점</td><td>${mark(r.total.ok)}</td></tr>
      <tr><th>${combinedName} 합산</th><td>${r.combined.earned} / ${r.combined.required}학점</td><td>${mark(r.combined.ok)}</td></tr>
      ${r.areas
        .filter((a) => a.min)
        .map((a) => `<tr><th>${esc(a.name.split(' ')[0])} 최소 학점</th><td>${a.earned} / ${a.min}학점</td><td>${mark(a.ok)}</td></tr>`)
        .join('')}
      ${r.others.map((o) => `<tr><th colspan="2">${esc(o.label)}</th><td>${mark(o.ok)}</td></tr>`).join('')}
    </table>
    ${todo.length ? `<h3>이렇게 준비하세요</h3><ul class="bullets">${todo.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
    <p class="tiny muted">${esc(E.basisNote)} ${esc(E.disclaimer)}</p>
    ${getUser() ? '' : '<a class="btn primary" href="#/login">결과 저장하고 실습 준비 시작하기 →</a>'}
  </section>`;
}

function certificateHTML() {
  const t = E.certificateTable;
  return `
  <details class="card soft">
    <summary><b>${esc(t.title)}</b></summary>
    <p class="tiny muted">졸업 전까지 자격 취득을 위해 이수해야 하는 학점입니다. 실습 신청 자격과는 별개입니다.</p>
    <table class="result">
      <tr><th>영역</th>${t.columns.map((c) => `<th>${esc(c)}</th>`).join('')}</tr>
      ${t.rows.map((r) => `<tr><td>${esc(r.area)}</td>${r.values.map((v) => `<td>${v}학점</td>`).join('')}</tr>`).join('')}
      <tr><th>합계</th>${t.total.map((v) => `<th>${v}학점</th>`).join('')}</tr>
    </table>
  </details>`;
}

export default {
  title: '수강 자격 자가진단',
  public: true,
  render() {
    const saved = sem().eligibility;
    const input = { totalCredits: '', track: '', courses: [], others: {}, extra: {}, ...(saved?.input || {}) };
    return `
    <h1 class="page-title">STEP 1. 수강 자격 자가진단</h1>
    <p class="muted">지금까지 이수한 과목을 선택하면 한국어교육현장실습 수강 신청 자격을 확인해 드려요.</p>
    <p class="notice tiny">${esc(E.basisNote)}</p>

    <form id="eligForm" class="stack">
      <section class="card">
        <h2>전공 구분</h2>
        <div class="choices">
          ${E.tracks
            .map(
              (t) => `<label class="choice"><input type="radio" name="track" value="${t.id}" ${input.track === t.id ? 'checked' : ''} required/>
              <span>${esc(t.label)} <small class="muted">(${esc(t.grade)})</small></span></label>`
            )
            .join('')}
        </div>
      </section>

      <section class="card">
        <label>${esc(E.totalCredits.label)}
          <input type="number" name="totalCredits" min="0" max="200" value="${esc(input.totalCredits)}" required />
        </label>
        <p class="tiny muted">${esc(E.totalCredits.help)} 기준: ${E.totalCredits.required}학점 이상</p>
      </section>

      ${E.areas
        .map(
          (a) => `
        <section class="card">
          <h2>${esc(a.name)}</h2>
          <p class="tiny muted">이수한 과목에 모두 체크하세요.</p>
          <div class="checks">
            ${a.courses
              .map(
                (c) => `<label class="check"><input type="checkbox" name="course" value="${c.id}" ${input.courses.includes(c.id) ? 'checked' : ''}/>
                <span>${esc(c.name)}</span><small>${c.credits}학점 · ${offeredLabel(c.offered)}</small></label>`
              )
              .join('')}
          </div>
          ${
            E.allowExtraCredits
              ? `<label class="tiny extra">위 목록에 없는 과목으로 인정받은 학점 (편입·학점 인정 등)
                <input type="number" name="extra-${a.id}" min="0" max="60" step="1" value="${esc(input.extra[a.id] || '')}" placeholder="없으면 비워 두세요" /></label>`
              : ''
          }
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
    <div id="result">${saved?.result?.combined ? resultHTML(saved.result) : ''}</div>
    ${certificateHTML()}`;
  },

  mount(root) {
    const form = root.querySelector('#eligForm');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = {
        track: form.querySelector('input[name=track]:checked')?.value,
        totalCredits: form.totalCredits.value,
        courses: [...form.querySelectorAll('input[name=course]:checked')].map((x) => x.value),
        extra: Object.fromEntries(E.areas.map((a) => [a.id, form.querySelector(`input[name="extra-${a.id}"]`)?.value || ''])),
        others: Object.fromEntries([...form.querySelectorAll('input[name=other]:checked')].map((x) => [x.value, true])),
      };
      const result = evaluate(input);
      update((s) => (s.eligibility = { input, result, at: new Date().toISOString() }));
      requestAnimationFrame(() => document.querySelector('#result')?.scrollIntoView({ behavior: 'smooth' }));
    });
  },
};
