// ② 수강 자격·이수 현황 점검 (로그인 없이도 이용 가능)
// 과목마다 미이수·수강 중·이수를 고르면 실습 수강 자격과 자격증 영역별 이수 현황이 함께 바뀝니다.
import { ELIGIBILITY as E } from '../data/eligibility.js';
import { sem, update } from '../store.js';
import { esc } from '../utils.js';

// 개설 학년·학기 표시: ['1-1','1-2'] → '1학년 1·2학기', ['2-1'] → '2학년 1학기'
const termLabel = (terms) => {
  if (!terms?.length) return '';
  const byYear = {};
  terms.forEach((t) => {
    const [y, h] = t.split('-');
    (byYear[y] ||= []).push(h);
  });
  return Object.entries(byYear).map(([y, hs]) => `${y}학년 ${hs.join('·')}학기`).join(', ');
};
const firstTerm = (c) => (c.terms?.[0] ? c.terms[0] : '9-9');

// 이수 상태: 0 미이수, 1 수강 중, 2 이수 (예전 체크 기록은 '이수'로 바꿔 읽음)
const STATUS = ['미이수', '수강 중', '이수'];
function statusMap(input) {
  const st = { ...(input.status || {}) };
  (input.courses || []).forEach((id) => {
    if (st[id] === undefined) st[id] = 2;
  });
  return st;
}
const areaById = (id) => E.areas.find((a) => a.id === id);

// min: 2면 '이수'만, 1이면 '수강 중'까지 포함해서 계산
function evaluate(input, min = 2) {
  const st = statusMap(input);
  const track = E.tracks.find((t) => t.id === input.track);
  const areas = E.areas.map((a) => {
    const taken = a.courses.filter((c) => (st[c.id] || 0) >= min);
    return {
      id: a.id,
      no: a.no,
      name: a.name,
      earned: taken.reduce((n, c) => n + c.credits, 0),
      count: taken.length,
      remaining: a.courses.filter((c) => !(st[c.id] || 0)),
      certReq: track ? a.cert[track.id] : null,
    };
  });
  const byId = Object.fromEntries(areas.map((a) => [a.id, a]));
  const P = E.practicum;

  // ① 실습 수강 자격
  const combinedEarned = P.combinedAreaIds.reduce((n, id) => n + byId[id].earned, 0);
  const combinedCount = P.combinedAreaIds.reduce((n, id) => n + byId[id].count, 0);
  const minChecks = P.combinedAreaIds.map((id) => ({
    id,
    no: byId[id].no,
    earned: byId[id].earned,
    ok: byId[id].earned >= P.minCreditsPerArea,
  }));
  const others = E.otherRequirements.map((r) => ({ ...r, ok: Boolean(input.others[r.id]) }));
  const practicum = track && {
    combined: { earned: combinedEarned, count: combinedCount, required: track.combinedCredits, courses: track.combinedCourses, ok: combinedEarned >= track.combinedCredits },
    minChecks,
    others,
  };
  if (practicum) practicum.ok = practicum.combined.ok && minChecks.every((m) => m.ok) && others.every((o) => o.ok);

  // ② 자격증 영역별 이수 현황
  const totalEarned = areas.reduce((n, a) => n + a.earned, 0);
  const certTotal = track ? E.areas.reduce((n, a) => n + a.cert[track.id], 0) : null;
  const certMet = track ? areas.filter((a) => a.earned >= a.certReq).length : 0;

  const result = { track: track && { id: track.id, label: track.label, grade: track.grade }, areas, practicum, totalEarned, certTotal, certMet };
  if (min === 2) result.prog = evaluate(input, 1); // 수강 중 포함 결과
  return result;
}

const mark = (ok) => `<span class="badge ${ok ? 'badge-done' : 'badge-over'}">${ok ? '충족' : '미충족'}</span>`;

function practicumHTML(r) {
  const p = r.practicum;
  const pp = r.prog.practicum; // 수강 중 포함
  const later = !p.ok && pp.ok;
  const plus = (a, b, unit) => (b > a ? ` <span class="tiny prog">(수강 중 포함 ${b}${unit})</span>` : '');
  const names = E.practicum.combinedAreaIds.map((id) => `${areaById(id).no}영역`).join('·');
  const todo = [];
  if (!p.combined.ok) {
    const lack = p.combined.required - p.combined.earned;
    const options = E.practicum.combinedAreaIds
      .map((id) => r.areas.find((a) => a.id === id))
      .map((a) => `<div class="tiny"><b>${a.no}영역</b>: ${[...a.remaining].sort((x, y) => firstTerm(x).localeCompare(firstTerm(y))).map((c) => `${esc(c.name)}${c.terms?.length ? ` <span class="muted">(${termLabel(c.terms)})</span>` : ''}`).join(', ') || '-'}</div>`)
      .join('');
    todo.push(`${names} 합산 <b>${lack}학점</b>(${Math.ceil(lack / 3)}과목)이 더 필요합니다.<div class="sub">들을 수 있는 과목:</div>${options}`);
  }
  p.minChecks.filter((m) => !m.ok).forEach((m) => todo.push(`${m.no}영역을 최소 <b>${E.practicum.minCreditsPerArea}학점</b> 이수해야 합니다.`));
  p.others.filter((o) => !o.ok).forEach((o) => todo.push(esc(o.help)));

  return `
  <section class="card ${p.ok ? 'success' : later ? 'warn' : 'alert'}">
    <h2 class="result-title">실습 수강 자격<small>&lt;한국어교육현장실습&gt;을 신청할 수 있는지</small></h2>
    <p class="verdict ${p.ok ? 'ok' : later ? 'warn' : 'no'}">${p.ok ? '✓ 수강 신청 가능 (자가진단 기준)' : later ? '지금 수강 중인 과목을 모두 이수하면 신청할 수 있어요' : '아직 충족하지 않은 요건이 있어요'}</p>
    <p class="tiny muted">판정은 ‘이수’한 과목으로 합니다. ‘수강 중’인 과목은 괄호 안에 따로 보여 줍니다.</p>
    <table class="result">
      <tr><th>${names} 합산</th><td>${p.combined.count} / ${p.combined.courses}과목${plus(p.combined.count, pp.combined.count, '과목')}<br/><span class="muted">${p.combined.earned} / ${p.combined.required}학점</span></td><td>${mark(p.combined.ok)}</td></tr>
      ${p.minChecks.map((m, i) => `<tr><th>${m.no}영역 최소</th><td>${m.earned} / ${E.practicum.minCreditsPerArea}학점${plus(m.earned, pp.minChecks[i].earned, '학점')}</td><td>${mark(m.ok)}</td></tr>`).join('')}
      ${p.others.map((o) => `<tr><th colspan="2">${esc(o.label.replace(/인가요\?$/, ''))}</th><td>${mark(o.ok)}</td></tr>`).join('')}
    </table>
    ${todo.length ? `<h3>이렇게 준비하세요</h3><ul class="bullets">${todo.map((t) => `<li>${t}</li>`).join('')}</ul>` : ''}
  </section>`;
}

function certHTML(r) {
  return `
  <section class="card">
    <h2 class="result-title">한국어교원 ${esc(r.track.grade)} 자격 영역별 이수 현황<small>졸업 후 자격증을 받기 위한 기준 (실습 신청 자격과는 별개)</small></h2>
    <p class="verdict ${r.certMet === E.areas.length ? 'ok' : 'neutral'}">${r.certMet === E.areas.length ? '✓ 모든 영역의 필수 이수 학점을 채웠어요' : `${E.areas.length - r.certMet}개 영역이 남았어요`}
      <small>이수 ${r.totalEarned}학점${r.prog.totalEarned > r.totalEarned ? ` (수강 중 포함 ${r.prog.totalEarned}학점)` : ''} · 자격 기준 ${r.certTotal}학점</small></p>
    <div class="areas">
      ${r.areas
        .map((a, i) => {
          const ok = a.earned >= a.certReq;
          const pg = r.prog.areas[i].earned;
          const pct = Math.min(100, (a.earned / a.certReq) * 100);
          const ppct = Math.min(100, (pg / a.certReq) * 100);
          return `<div class="area ${ok ? 'ok' : ''}">
            <span class="label">${a.no}영역</span>
            <span class="aname">${esc(a.name)}</span>
            <span class="num">${a.earned}<small> / ${a.certReq}학점</small></span>
            <div class="bar dual"><span class="p" style="width:${ppct}%"></span><span style="width:${pct}%"></span></div>
            ${ok ? '<span class="badge badge-done">충족</span>' : pg >= a.certReq ? '<span class="badge badge-tbd">수강 중 포함 시 충족</span>' : `<span class="badge badge-soon">${a.certReq - a.earned}학점 부족</span>`}
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
    <span><b>실습 자격</b> ${p.ok ? '충족' : r.prog.practicum.ok ? '수강 중 이수 시 충족' : '미충족'} <span class="muted">· 1·3영역 ${p.combined.earned}/${p.combined.required}</span></span>
    <span><b>자격증</b> ${r.totalEarned}/${r.certTotal}학점 <span class="muted">· 결과 보기 ↓</span></span>
  </a>`;
}

function summaryHTML(r) {
  if (!r.track) return `<p class="notice">먼저 <b>전공 구분</b>을 고르면 결과가 나타납니다.</p>`;
  return practicumHTML(r) + certHTML(r);
}

export default {
  title: '수강 자격 자기점검',
  public: true,
  render() {
    const saved = sem().eligibility;
    const input = { track: '', courses: [], status: {}, others: {}, ...(saved?.input || {}) };
    const st = statusMap(input);
    const r = evaluate(input);
    const track = E.tracks.find((t) => t.id === input.track);
    return `
    <h1 class="page-title">STEP 1. <span class="nowrap">&lt;한국어교육현장실습&gt;</span> 수강 자격 자기점검</h1>
    <p class="muted">과목마다 미이수·수강 중·이수를 고르면, 아래에 <b>실습 수강 자격</b>과 <b>한국어교원 자격 영역별 이수 현황</b> 진단 결과가 나옵니다.</p>
    <p class="notice tiny">${esc(E.basisNote)}</p>
    <details class="card soft">
      <summary><b>수강 자격 기준과 근거</b></summary>
      <table class="result">
        <tr><th>공통</th><td>전체 이수 학점 105학점 이상 (4학년 1학기부터 수강 가능)</td></tr>
        <tr><th>주전공·복수전공 (2급)</th><td>직전 학기까지 1영역·3영역 합산 8과목(24학점) 이상 이수</td></tr>
        <tr><th>부전공 (3급)</th><td>직전 학기까지 1영역·3영역 합산 4과목(12학점) 이상 이수</td></tr>
        <tr><th>영역별 최소</th><td>1영역, 3영역 모두 최소 3학점 이상 이수</td></tr>
      </table>
      <div class="tiny muted basis">
        <p>근거:</p>
        <ul class="bullets">
          <li>경희사이버대학교 한국어교육현장실습 수강 자격 공지</li>
          <li>국립국어원 「한국어교육 실습 교과목 운영 지침」의 2.2 수강 자격</li>
        </ul>
      </div>
    </details>

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

      <h2 class="section-title">① 영역별 과목 이수 확인</h2>
      <p class="tiny muted">과목마다 <b>미이수 / 수강 중 / 이수</b> 중 하나를 고르세요.</p>
      ${E.areas
        .map(
          (a) => `
        <section class="card">
          <h2>${a.no}영역 ${esc(a.name)}
            <small>${track ? `자격 기준 ${a.cert[track.id]}학점` : `자격 기준 2급 ${a.cert.major}학점 · 3급 ${a.cert.minor}학점`}${E.practicum.combinedAreaIds.includes(a.id) ? ' · 실습 수강 자격에 포함' : ''}</small></h2>
          <div class="course-list">
            ${[...a.courses]
              .sort((x, y) => firstTerm(x).localeCompare(firstTerm(y)))
              .map((c) => {
                const v = st[c.id] || 0;
                return `<div class="course s${v}">
                <div class="cinfo"><span class="cname">${esc(c.name)}${c.common ? ' <span class="tag">기초공통</span>' : ''}</span>
                  <span class="cmeta">${c.credits}학점${c.terms?.length ? ` · ${termLabel(c.terms)}` : ''}</span></div>
                <div class="st" role="radiogroup" aria-label="${esc(c.name)} 이수 상태">
                  ${STATUS.map((t, i) => `<label class="o${i}"><input type="radio" name="st-${c.id}" value="${i}" ${v === i ? 'checked' : ''}/><span>${t}</span></label>`).join('')}
                </div></div>`;
              })
              .join('')}
          </div>
        </section>`
        )
        .join('')}

      <section class="card">
        <h2>② 과목 외 확인 요건</h2>
        <div class="checks">
          ${E.otherRequirements
            .map(
              (o) => `<label class="check"><input type="checkbox" name="other" value="${o.id}" ${input.others[o.id] ? 'checked' : ''}/>
              <span>${esc(o.label)}<small class="note">${esc(o.help)}</small></span></label>`
            )
            .join('')}
        </div>
      </section>

      <h2 class="section-title">③ 진단 결과</h2>
      <div id="summary">${summaryHTML(r)}</div>
    </form>
    <p class="tiny muted">${esc(E.disclaimer)}</p>
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
        status: Object.fromEntries([...form.querySelectorAll('input[name^="st-"]:checked')].map((x) => [x.name.slice(3), Number(x.value)])),
        others: Object.fromEntries([...form.querySelectorAll('input[name=other]:checked')].map((x) => [x.value, true])),
      };
      const result = evaluate(input);
      update((s) => (s.eligibility = { input, result, at: new Date().toISOString() }));
    });
  },
};
