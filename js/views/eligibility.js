// ② 수강 자격·이수 현황 점검 (로그인 없이도 이용 가능)
// 과목을 체크하면 ① 실습 수강 자격과 ② 자격증 영역별 이수 현황이 함께 바뀝니다.
import { ELIGIBILITY as E } from '../data/eligibility.js';
import { getUser, sem, update } from '../store.js';
import { esc } from '../utils.js';

const offeredLabel = (o) => (o.length === 2 ? '1·2학기' : `${o[0]}학기`);
const areaById = (id) => E.areas.find((a) => a.id === id);

function evaluate(input) {
  const track = E.tracks.find((t) => t.id === input.track);
  const areas = E.areas.map((a) => {
    const taken = a.courses.filter((c) => input.courses.includes(c.id));
    return {
      id: a.id,
      no: a.no,
      name: a.name,
      earned: taken.reduce((n, c) => n + c.credits, 0),
      count: taken.length,
      remaining: a.courses.filter((c) => !input.courses.includes(c.id)),
      certReq: track ? a.cert[track.id] : null,
    };
  });
  const byId = Object.fromEntries(areas.map((a) => [a.id, a]));
  const P = E.practicum;

  // ① 실습 수강 자격
  const combinedEarned = P.combinedAreaIds.reduce((n, id) => n + byId[id].earned, 0);
  const minChecks = P.combinedAreaIds.map((id) => ({
    id,
    no: byId[id].no,
    earned: byId[id].earned,
    ok: byId[id].earned >= P.minCreditsPerArea,
  }));
  const others = E.otherRequirements.map((r) => ({ ...r, ok: Boolean(input.others[r.id]) }));
  const practicum = track && {
    combined: { earned: combinedEarned, required: track.combinedCredits, ok: combinedEarned >= track.combinedCredits },
    minChecks,
    others,
  };
  if (practicum) practicum.ok = practicum.combined.ok && minChecks.every((m) => m.ok) && others.every((o) => o.ok);

  // ② 자격증 영역별 이수 현황
  const totalEarned = areas.reduce((n, a) => n + a.earned, 0);
  const certTotal = track ? E.areas.reduce((n, a) => n + a.cert[track.id], 0) : null;
  const certMet = track ? areas.filter((a) => a.earned >= a.certReq).length : 0;

  return { track: track && { id: track.id, label: track.label, grade: track.grade }, areas, practicum, totalEarned, certTotal, certMet };
}

const mark = (ok) => `<span class="badge ${ok ? 'badge-done' : 'badge-over'}">${ok ? '충족' : '미충족'}</span>`;

function practicumHTML(r) {
  const p = r.practicum;
  const names = E.practicum.combinedAreaIds.map((id) => `${areaById(id).no}영역`).join('·');
  const todo = [];
  if (!p.combined.ok) {
    const lack = p.combined.required - p.combined.earned;
    const options = E.practicum.combinedAreaIds
      .map((id) => r.areas.find((a) => a.id === id))
      .map((a) => `<div class="tiny"><b>${a.no}영역</b>: ${a.remaining.map((c) => `${esc(c.name)} <span class="muted">(${offeredLabel(c.offered)})</span>`).join(', ') || '-'}</div>`)
      .join('');
    todo.push(`${names} 합산 <b>${lack}학점</b>(${Math.ceil(lack / 3)}과목)이 더 필요합니다.<div class="sub">들을 수 있는 과목:</div>${options}`);
  }
  p.minChecks.filter((m) => !m.ok).forEach((m) => todo.push(`${m.no}영역을 최소 <b>${E.practicum.minCreditsPerArea}학점</b> 이수해야 합니다.`));
  p.others.filter((o) => !o.ok).forEach((o) => todo.push(esc(o.help)));

  return `
  <section class="card ${p.ok ? 'success' : 'alert'}">
    <p class="label">① 실습 수강 자격</p>
    <h2>${p.ok ? '수강 신청 가능 (자가진단 기준)' : '아직 충족하지 않은 요건이 있어요'}</h2>
    <table class="result">
      <tr><th>${names} 합산</th><td>${p.combined.earned} / ${p.combined.required}학점</td><td>${mark(p.combined.ok)}</td></tr>
      ${p.minChecks.map((m) => `<tr><th>${m.no}영역 최소</th><td>${m.earned} / ${E.practicum.minCreditsPerArea}학점</td><td>${mark(m.ok)}</td></tr>`).join('')}
      ${p.others.map((o) => `<tr><th colspan="2">${esc(o.label.replace(/인가요\?$/, ''))}</th><td>${mark(o.ok)}</td></tr>`).join('')}
    </table>
    ${todo.length ? `<h3>이렇게 준비하세요</h3><ul class="bullets">${todo.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
  </section>`;
}

function certHTML(r) {
  return `
  <section class="card">
    <p class="label">② 한국어교원 ${esc(r.track.grade)} 자격 영역별 이수 현황</p>
    <h2>${r.certMet === E.areas.length ? '모든 영역의 필수 이수 학점을 채웠어요' : `${E.areas.length - r.certMet}개 영역이 남았어요`}
      <small>체크한 과목 합계 ${r.totalEarned}학점 · 자격 기준 ${r.certTotal}학점</small></h2>
    <div class="areas">
      ${r.areas
        .map((a) => {
          const ok = a.earned >= a.certReq;
          const pct = Math.min(100, (a.earned / a.certReq) * 100);
          return `<div class="area ${ok ? 'ok' : ''}">
            <span class="label">${a.no}영역</span>
            <span class="aname">${esc(a.name)}</span>
            <span class="num">${a.earned}<small> / ${a.certReq}학점</small></span>
            <div class="bar"><span style="width:${pct}%"></span></div>
            ${ok ? '<span class="badge badge-done">충족</span>' : `<span class="badge badge-soon">${a.certReq - a.earned}학점 부족</span>`}
          </div>`;
        })
        .join('')}
    </div>
    <p class="tiny muted">자격증은 졸업 후 국립국어원 심사로 받습니다. 영역마다 따로 채워야 하며, 한 영역의 남는 학점으로 다른 영역을 채울 수 없습니다.</p>
  </section>`;
}

function stickyHTML(r) {
  if (!r.track) return '';
  const p = r.practicum;
  return `<a href="#" class="sticky-sum ${p.ok ? 'ok' : ''}" data-top>
    <span><b>실습 자격</b> ${p.ok ? '충족' : '미충족'} <span class="muted">· 1·3영역 ${p.combined.earned}/${p.combined.required}</span></span>
    <span><b>자격증</b> ${r.totalEarned}/${r.certTotal}학점</span>
  </a>`;
}

function summaryHTML(r) {
  if (!r.track) return `<p class="notice">먼저 <b>전공 구분</b>을 고르면 결과가 나타납니다.</p>`;
  return practicumHTML(r) + certHTML(r);
}

export default {
  title: '수강 자격·이수 현황 점검',
  public: true,
  render() {
    const saved = sem().eligibility;
    const input = { track: '', courses: [], others: {}, ...(saved?.input || {}) };
    const r = evaluate(input);
    const track = E.tracks.find((t) => t.id === input.track);
    return `
    <h1 class="page-title">STEP 1. 수강 자격·이수 현황 점검</h1>
    <p class="muted">지금까지 이수한 과목에 체크하면 <b>실습 수강 자격</b>과 <b>자격증 영역별 이수 현황</b>을 함께 확인할 수 있어요.</p>
    <p class="notice tiny">${esc(E.basisNote)} 현재 수강 중인 과목은 아직 체크하지 마세요.</p>

    <form id="eligForm" class="stack">
      <section class="card">
        <h2>전공 구분</h2>
        <div class="choices">
          ${E.tracks
            .map(
              (t) => `<label class="choice"><input type="radio" name="track" value="${t.id}" ${input.track === t.id ? 'checked' : ''}/>
              <span>${esc(t.label)} <small class="muted">(${esc(t.grade)})</small></span></label>`
            )
            .join('')}
        </div>
      </section>

      <div id="summary">${summaryHTML(r)}</div>

      <section class="card">
        <h2>과목으로 확인할 수 없는 요건</h2>
        <div class="checks">
          ${E.otherRequirements
            .map(
              (o) => `<label class="check"><input type="checkbox" name="other" value="${o.id}" ${input.others[o.id] ? 'checked' : ''}/>
              <span>${esc(o.label)}<small class="note">${esc(o.help)}</small></span></label>`
            )
            .join('')}
        </div>
      </section>

      <h2 class="section-title">이수한 과목 체크</h2>
      ${E.areas
        .map(
          (a) => `
        <section class="card">
          <h2>${a.no}영역 ${esc(a.name)}
            <small>${track ? `자격 기준 ${a.cert[track.id]}학점` : `자격 기준 2급 ${a.cert.major}학점 · 3급 ${a.cert.minor}학점`}${E.practicum.combinedAreaIds.includes(a.id) ? ' · 실습 수강 자격에 포함' : ''}</small></h2>
          <div class="checks">
            ${a.courses
              .map(
                (c) => `<label class="check"><input type="checkbox" name="course" value="${c.id}" ${input.courses.includes(c.id) ? 'checked' : ''}/>
                <span>${esc(c.name)}</span><small>${c.credits}학점 · ${offeredLabel(c.offered)}</small></label>`
              )
              .join('')}
          </div>
        </section>`
        )
        .join('')}
    </form>
    <p class="tiny muted">${esc(E.disclaimer)}</p>
    ${getUser() ? '' : '<a class="btn primary" href="#/login">결과 저장하고 실습 준비 시작하기 →</a>'}
    ${stickyHTML(r)}`;
  },

  mount(root) {
    const form = root.querySelector('#eligForm');
    root.querySelector('[data-top]')?.addEventListener('click', (e) => {
      e.preventDefault();
      document.querySelector('#summary')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
    // 체크할 때마다 결과를 바로 계산해 저장 (화면은 자동으로 다시 그려짐)
    form.addEventListener('change', () => {
      const input = {
        track: form.querySelector('input[name=track]:checked')?.value || '',
        courses: [...form.querySelectorAll('input[name=course]:checked')].map((x) => x.value),
        others: Object.fromEntries([...form.querySelectorAll('input[name=other]:checked')].map((x) => [x.value, true])),
      };
      const result = evaluate(input);
      update((s) => (s.eligibility = { input, result, at: new Date().toISOString() }));
    });
  },
};
