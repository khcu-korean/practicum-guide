// ⑦ 이수 완료 점검
import { COMPLETION_EXTRA_CHECKS } from '../data/tasks.js';
import { getType } from '../data/types.js';
import { sem, update } from '../store.js';
import { myTasks } from '../selectors.js';
import { esc, fmtDate } from '../utils.js';

export default {
  title: '이수 완료 점검',
  render() {
    const s = sem();
    const type = getType(s.typeId);
    if (!type) {
      return `<h1 class="page-title">STEP 6. 이수 완료 점검</h1>
      <section class="card next"><p>배정된 유형을 먼저 입력해 주세요.</p><a class="btn primary" href="#/assign">배정 유형·기관 입력하기 →</a></section>`;
    }
    const required = myTasks().filter((t) => t.task.required !== false);
    const missing = required.filter((t) => !t.done);
    const extras = COMPLETION_EXTRA_CHECKS.map((c) => ({ ...c, ok: Boolean(s.extraChecks?.[c.id]) }));
    const allOk = missing.length === 0 && extras.every((c) => c.ok);

    return `
    <h1 class="page-title">STEP 6. 이수 완료 점검</h1>
    <p class="muted">${esc(type.name)} · ${esc(type.summary)}</p>

    <section class="card ${allOk ? 'success' : 'alert'}">
      <h2>${allOk ? '모든 이수 요건을 확인했어요' : `확인이 필요한 항목이 ${missing.length + extras.filter((c) => !c.ok).length}개 있어요`}</h2>
      ${allOk ? '<p>수고하셨습니다. 최종 성적 및 이수 여부는 LMS 공지를 확인하세요.</p>' : ''}
    </section>

    <section class="card">
      <h2>필수 과업 (${required.length - missing.length}/${required.length})</h2>
      <ul class="checklist">
        ${required
          .map(
            (t) => `<li class="${t.done ? 'ok' : 'no'}">
              <span>${t.done ? '<span class="badge badge-done">완료</span>' : '<span class="badge badge-normal">남음</span>'}</span>
              <a href="#/task/${t.task.id}" class="grow">${esc(t.task.title)}</a>
              <span class="tiny muted">${t.done ? '완료' : `마감 ${fmtDate(t.due)}`}</span></li>`
          )
          .join('')}
      </ul>
    </section>

    <section class="card">
      <h2>최종 확인 사항</h2>
      <div class="checks">
        ${extras
          .map((c) => `<label class="check"><input type="checkbox" data-extra="${c.id}" ${c.ok ? 'checked' : ''}/><span>${esc(c.label)}</span></label>`)
          .join('')}
      </div>
    </section>`;
  },
  mount(root) {
    root.addEventListener('change', (e) => {
      const id = e.target.dataset?.extra;
      if (id) update((s) => (s.extraChecks[id] = e.target.checked));
    });
  },
};
