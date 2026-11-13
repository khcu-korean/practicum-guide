// ④ 유형별 맞춤 타임라인 (유형별 과업 순서대로 표시)
import { getType } from '../data/types.js';
import { sem, update } from '../store.js';
import { myTasks } from '../selectors.js';
import { esc, ddayLabel, ddayClass, periodLabel } from '../utils.js';
import { semesterId } from '../store.js';

export function taskRow(t) {
  return `
  <li class="task ${t.done ? 'is-done' : ''}">
    <label class="checkbox"><input type="checkbox" data-done="${t.task.id}" ${t.done ? 'checked' : ''} aria-label="완료 체크"/></label>
    <a class="grow" href="#/task/${t.task.id}">
      <span class="title">${esc(t.task.title)}</span>
      <span class="meta">${t.due ? `${periodLabel(t.task, semesterId(), t.record)}${t.record.customDue ? ' (직접 입력)' : ''}` : esc(t.task.dueText || '날짜 미정')}${t.task.note ? ` · ${esc(t.task.note)}` : ''}</span>
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
      <section class="card next"><p>확정 명단이 발표된 뒤 배정된 유형과 기관을 입력하면, 나에게 필요한 일정과 과업이 자동으로 만들어져요.</p>
      <a class="btn primary" href="#/assign">배정 유형·기관 입력하기 →</a></section>`;
    }
    const list = myTasks();
    return `
    <h1 class="page-title">맞춤 타임라인</h1>
    <p class="muted"><b>${esc(type.name)}</b> · ${esc(type.summary)}<br/>실습 기관: ${s.institution ? esc(s.institution.name) : '실습 기관 미입력'} <a class="link" href="#/assign">수정</a></p>
    <div class="legend tiny">
      <span class="badge badge-urgent">D-3 이내</span><span class="badge badge-soon">D-7 이내</span>
      <span class="badge badge-tbd">미정</span><span class="badge badge-done">완료</span>
    </div>
    <p class="tiny muted">과업을 누르면 수행 방법을 볼 수 있어요. 날짜가 미정인 과업은 일정이 정해지면 직접 입력하세요.</p>
    <ol class="steps-timeline">
      ${list
        .map(
          (t) => `<li class="${t.done ? 'done' : ''}"><span class="num">${t.done ? '✓' : t.task.step}</span>
            <ul class="task-list">${taskRow(t)}</ul></li>`
        )
        .join('')}
    </ol>`;
  },
  mount: bindDoneToggle,
};
