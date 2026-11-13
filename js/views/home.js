// 첫 화면: 앱 소개 + 전체 메뉴(단계) + 마감 임박 과제 + 진행률
import { CONFIG } from '../config.js';
import { getType } from '../data/types.js';
import { sem } from '../store.js';
import { STEPS, GROUPS } from '../steps.js';
import { progressStats, upcoming, myTasks } from '../selectors.js';
import { esc, ddayLabel, ddayClass, fmtDate } from '../utils.js';

export const ring = (pct) => `
  <div class="ring" style="--p:${pct}">
    <span>${pct}<small>%</small></span>
  </div>`;

const dueSection = (title, list, cls) =>
  list.length
    ? `<section class="card ${cls}">
      <h2>${title}</h2>
      <ul class="task-list">
        ${list
          .map(
            (t) => `<li><a href="#/task/${t.task.id}">
              <span class="badge ${ddayClass(t.left, false)}">${ddayLabel(t.left)}</span>
              <span class="grow">${esc(t.task.title)}</span>
              <span class="muted">${fmtDate(t.due)}</span></a></li>`
          )
          .join('')}
      </ul></section>`
    : '';

/** 단계별 완료 여부 */
function stepDone() {
  const s = sem();
  const stats = progressStats();
  return {
    eligibility: Boolean(s.eligibility?.result?.practicum),
    diagnosis: Boolean(s.diagnosis),
    assign: Boolean(s.typeId),
    timeline: Boolean(s.typeId) && stats.done > 0,
    progress: Boolean(s.typeId) && stats.total > 0 && stats.done === stats.total,
    complete: false,
  };
}

export default {
  title: '홈',
  public: true,
  render() {
    const s = sem();
    const stats = progressStats();
    const type = getType(s.typeId);
    const soon = upcoming(7);
    const tbd = myTasks().filter((t) => !t.done && t.due === null);
    const done = stepDone();
    const next = STEPS.find((x) => !done[x.path]) || STEPS[0];

    return `
    <section class="hero">
      <h1>${esc(CONFIG.appName)}</h1>
      <p>${esc(CONFIG.subtitle)}</p>
    </section>

    ${dueSection('기한이 지난 과제', soon.filter((t) => t.left < 0), 'alert')}
    ${dueSection('마감 임박 과제 (7일 이내)', soon.filter((t) => t.left >= 0), 'warn')}

    <section class="card">
      <h2>이렇게 이용하세요</h2>
      ${['prep', 'flow']
        .map(
          (g) => `
        <div class="mgroup ${g}">
          <p class="mgroup-title"><span class="chip">${GROUPS[g].label}</span> ${esc(GROUPS[g].title)}</p>
          <p class="tiny muted">${esc(GROUPS[g].desc)}</p>
          <ol class="menu-list">
            ${STEPS.filter((x) => x.group === g)
              .map(
                (x) => `<li class="${done[x.path] ? 'done' : ''} ${x === next ? 'current' : ''}">
              <a href="#/${x.path}">
                <span class="dot">${done[x.path] ? '✓' : x.no}</span>
                <span class="grow"><b>${esc(x.title).replace(/(&lt;.+?&gt;)/, '<span class="nowrap">$1</span>')}</b><small>${esc(x.desc)}</small></span>
                <span class="arrow" aria-hidden="true">›</span>
              </a></li>`
              )
              .join('')}
          </ol>
        </div>`
        )
        .join('')}
      <a class="btn primary big" href="#/${next.path}">${next === STEPS[0] && !done.eligibility ? '시작하기' : `이어서 하기: ${esc(next.short)}`} →</a>
    </section>

    ${
      type
        ? `<section class="card row">
        ${ring(stats.percent)}
        <div class="grow">
          <p class="label">${esc(type.name)}${s.institution ? ` · ${esc(s.institution.name)}` : ''}</p>
          <h2>과제 진행률</h2>
          <p>${stats.total}개 중 <b>${stats.done}개</b> 완료</p>
          ${tbd.length ? `<p class="tiny muted">날짜 미정 과제 ${tbd.length}개 — 일정이 정해지면 직접 입력하세요.</p>` : ''}
          <a href="#/progress" class="link">진행 현황 보기 →</a>
        </div>
      </section>`
        : ''
    }`;
  },
};
