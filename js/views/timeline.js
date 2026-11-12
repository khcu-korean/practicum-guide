// ④ 유형별 맞춤 타임라인 (공통 + 유형별 과업을 주차별로 결합)
import { getType } from '../data/types.js';
import { sem, update } from '../store.js';
import { myTasks } from '../selectors.js';
import { esc, ddayLabel, ddayClass, fmtDate } from '../utils.js';

export function taskRow(t) {
  return `
  <li class="task ${t.done ? 'is-done' : ''}">
    <label class="checkbox"><input type="checkbox" data-done="${t.task.id}" ${t.done ? 'checked' : ''} aria-label="완료 체크"/></label>
    <a class="grow" href="#/task/${t.task.id}">
      <span class="title">${esc(t.task.title)}</span>
      <span class="meta">
        ${t.task.types === 'all' ? '<span class="tag">공통</span>' : '<span class="tag type">유형별</span>'}
        마감 ${fmtDate(t.due)}${t.record.customDue ? ' (직접 입력)' : ''}
      </span>
    </a>
    <span class="badge ${ddayClass(t.left, t.done)}">${t.done ? '완료' : ddayLabel(t.left)}</span>
  </li>`;
}

export function bindDoneToggle(root) {
  root.addEventListener('change', (e) => {
    const id = e.target.dataset?.done;
    if (!id) return;
    const checked = e.target.checked;
    update((s) => {
      const r = (s.tasks[id] ||= {});
      r.done = checked;
      r.doneAt = checked ? new Date().toISOString() : null;
    });
  });
}

export default {
  title: '타임라인',
  render() {
    const s = sem();
    const type = getType(s.typeId);
    if (!type) {
      return `<h1 class="page-title">맞춤 타임라인</h1>
      <section class="card next"><p>실습 유형을 확정하면 나에게 필요한 일정과 과업이 자동으로 만들어져요.</p>
      <a class="btn primary" href="#/diagnosis">실습 유형 진단하러 가기 →</a></section>`;
    }
    const list = myTasks().sort((a, b) => a.task.week - b.task.week || (a.due || '9').localeCompare(b.due || '9'));
    const weeks = [...new Set(list.map((t) => t.task.week))];
    return `
    <h1 class="page-title">맞춤 타임라인</h1>
    <p class="muted"><b>${esc(type.name)}</b> · ${esc(type.summary)} <a class="link" href="#/diagnosis">변경</a></p>
    <div class="legend tiny">
      <span class="badge badge-urgent">D-3 이내</span><span class="badge badge-soon">D-7 이내</span>
      <span class="badge badge-tbd">미정</span><span class="badge badge-done">완료</span>
    </div>
    <div class="timeline">
      ${weeks
        .map(
          (w) => `
        <section class="week">
          <h2 class="week-title">${w}주차</h2>
          <ul class="task-list">${list.filter((t) => t.task.week === w).map(taskRow).join('')}</ul>
        </section>`
        )
        .join('')}
    </div>`;
  },
  mount: bindDoneToggle,
};
