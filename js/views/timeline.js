// ④ 유형별 과제 타임라인과 가이드 (유형별 과제 순서대로 표시)
import { getType } from '../data/types.js';
import { sem, update } from '../store.js';
import { myTasks, instScheduleFor } from '../selectors.js';
import { getSemester } from '../config.js';
import { esc, ddayLabel, ddayClass, periodLabel } from '../utils.js';
import { planSemesterId } from '../store.js';

export function taskRow(t) {
  const mi = !t.record.customDue ? instScheduleFor(t.task.id) : null;
  return `
  <li class="task ${t.done ? 'is-done' : ''}">
    <label class="checkbox"><input type="checkbox" data-done="${t.task.id}" ${t.done ? 'checked' : ''} aria-label="완료 체크"/></label>
    <a class="grow" href="#/task/${t.task.id}">
      <span class="title">${esc(t.task.title)}</span>
      <span class="meta">${t.due ? `${periodLabel(t.task, planSemesterId(), t.record)}${t.record.customDue ? ' (직접 입력)' : ''}` : mi ? `${esc(mi.term.period)} · ${esc(mi.term.method)}` : esc(t.task.dueText || '날짜 미정')}${t.task.note ? ` · ${esc(t.task.note)}` : ''}</span>
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
  title: '유형별 과제 타임라인과 가이드',
  render() {
    const s = sem();
    const type = getType(s.typeId);
    if (!type) {
      return `<h1 class="page-title">STEP 3-나. 유형별 과제 타임라인과 가이드</h1>
      <section class="card next"><p>확정 명단이 발표된 뒤 STEP 3-가에서 실습 유형과 실습 기관을 입력하면, 나에게 필요한 과제와 일정이 자동으로 만들어져요.</p>
      <a class="btn primary" href="#/assign">확정된 실습 유형·기관 입력하기 →</a></section>`;
    }
    const list = myTasks();
    return `
    <h1 class="page-title">STEP 3-나. 유형별 과제 타임라인과 가이드</h1>
    <p class="muted"><b>${esc(type.name)}</b> · ${esc(type.summary)}<br/>실습 기관: ${s.institution ? esc(s.institution.name) : '실습 기관 미입력'} <a class="link" href="#/assign">수정</a></p>
    <div class="legend tiny">
      <span class="badge badge-urgent">D-3 이내</span><span class="badge badge-soon">D-7 이내</span>
      <span class="badge badge-tbd">미정</span><span class="badge badge-done">완료</span>
    </div>
    <p class="notice tiny"><b>${esc(getSemester(planSemesterId()).label)}</b> 기준의 대략적인 일정입니다. 반마다 다를 수 있으니 <b>자세한 일정은 반별 공지사항을 확인하세요.</b></p>
    <p class="tiny muted">과제를 누르면 수행 방법을 볼 수 있어요. 우리 반 날짜를 알면 과제 화면에서 직접 바꿀 수 있습니다.</p>
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
