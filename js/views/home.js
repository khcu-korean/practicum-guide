// 홈 대시보드: 단계 안내 + 마감 임박 과업(D-day) + 진행률
import { getType } from '../data/types.js';
import { getUser, sem } from '../store.js';
import { stepStatus, progressStats, upcoming, myTasks } from '../selectors.js';
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

export default {
  title: '홈',
  render() {
    const s = sem();
    const st = stepStatus();
    const stats = progressStats();
    const type = getType(s.typeId);
    const soon = upcoming(7);
    const tbd = myTasks().filter((t) => !t.done && t.due === null);

    const steps = [
      { key: 'eligibility', no: 1, label: '수강 자격 자가진단', href: '#/eligibility' },
      { key: 'diagnosis', no: 2, label: '실습 기관·유형 살펴보기', href: '#/diagnosis' },
      { key: 'type', no: 3, label: '실습 유형 확정 (명단 발표 후)', href: '#/diagnosis' },
      { key: 'tasks', no: 4, label: '과업 수행', href: '#/timeline' },
    ];
    const nextStep = steps.find((x) => !st[x.key]);

    return `
    <section class="greeting">
      <p class="muted">${esc(getUser()?.email || '')}</p>
      <h1>${type ? `${esc(type.name)} <small>${esc(type.summary)}</small>` : '실습 준비를 시작해 볼까요?'}</h1>
    </section>

    ${dueSection('🚨 기한이 지난 과업', soon.filter((t) => t.left < 0), 'alert')}
    ${dueSection('⏰ 마감 임박 과업 (7일 이내)', soon.filter((t) => t.left >= 0), 'warn')}

    ${
      nextStep
        ? `<section class="card next">
        <p class="muted">지금 해야 할 일</p>
        <h2>STEP ${nextStep.no}. ${nextStep.label}</h2>
        <a class="btn primary" href="${nextStep.href}">시작하기 →</a>
      </section>`
        : ''
    }

    <section class="card">
      <h2>나의 진행 단계</h2>
      <ol class="steps">
        ${steps
          .map(
            (x) => `<li class="${st[x.key] ? 'done' : ''} ${x === nextStep ? 'current' : ''}">
              <a href="${x.href}"><span class="dot">${st[x.key] ? '✓' : x.no}</span>${x.label}</a></li>`
          )
          .join('')}
      </ol>
    </section>

    ${
      s.typeId
        ? `<section class="card row">
        ${ring(stats.percent)}
        <div class="grow">
          <h2>과업 진행률</h2>
          <p>${stats.total}개 중 <b>${stats.done}개</b> 완료</p>
          ${tbd.length ? `<p class="tiny muted">일정 미정 과업 ${tbd.length}개 — 기관 일정이 정해지면 입력하세요.</p>` : ''}
          <a href="#/progress" class="link">자세히 보기 →</a>
        </div>
      </section>`
        : ''
    }`;
  },
};
