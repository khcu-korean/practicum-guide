// ⑤ 과제 수행 가이드 (과업 상세)
import { getTask, typesOfTask, SCHEDULE_NOTE, COMMON_GUIDE_NOTES } from '../data/tasks.js';
import { getType } from '../data/types.js';
import { sem, semesterId, update } from '../store.js';
import { esc, resolveDue, daysLeft, ddayLabel, ddayClass, fmtDate, periodLabel, toast } from '../utils.js';

export default {
  title: '과제 가이드',
  render({ params }) {
    const task = getTask(params[0]);
    if (!task) return '<p>과업을 찾을 수 없습니다.</p><a href="#/timeline">← 타임라인</a>';
    const r = sem().tasks?.[task.id] || {};
    const due = resolveDue(task, semesterId(), r);
    const left = daysLeft(due);
    const g = task.guide || {};
    const typeIds = typesOfTask(task.id);
    const typeNames = typeIds.length === 5 ? '모든 유형 공통' : typeIds.map((id) => getType(id)?.name.replace('실습 ', '')).join(', ');

    return `
    <a href="#/timeline" class="link">← 타임라인</a>
    <h1 class="page-title">${esc(task.title)}</h1>
    <p class="muted">${task.week ? `${task.week}주차까지 · ` : ''}${esc(typeNames)}</p>
    ${task.note ? `<p class="notice tiny">${esc(task.note)}</p>` : ''}

    <section class="card row">
      <span class="badge big ${ddayClass(left, r.done)}">${r.done ? '완료' : ddayLabel(left)}</span>
      <div class="grow">
        <p>${task.start && !r.customDue ? '기간' : '마감'}: <b>${due ? periodLabel(task, semesterId(), r) : '미정'}</b> ${r.customDue ? '<span class="tiny muted">(직접 입력)</span>' : ''}</p>
        ${task.due === null ? `<p class="tiny muted">${esc(SCHEDULE_NOTE[task.schedule] || '일정이 정해지면 직접 입력하세요.')}</p>` : ''}
      </div>
    </section>

    ${
      task.due === null
        ? `<section class="card">
        <h3>📅 마감일 직접 입력</h3>
        <div class="row">
          <input type="date" id="customDue" value="${esc(r.customDue || '')}" class="grow" />
          <button class="btn" id="saveDue">저장</button>
        </div>
      </section>`
        : ''
    }

    <section class="card guide">
      <h2>📌 과제 소개</h2>
      <p>${esc(g.intro)}</p>

      <h2>⚠️ 중요 사항</h2>
      <ul class="bullets">${[...(g.important || []), ...COMMON_GUIDE_NOTES].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

      <h2>📄 작성 양식</h2>
      ${
        g.templates?.length
          ? `<ul class="bullets">${g.templates
              .map((t) => (t.url ? `<li><a href="${esc(t.url)}" target="_blank" rel="noopener">${esc(t.name)} ⬇</a></li>` : `<li>${esc(t.name)}</li>`))
              .join('')}</ul>`
          : '<p class="muted">(양식 입력 예정)</p>'
      }

      <h2>📤 제출 방법 및 기한</h2>
      <table class="result">
        <tr><th>제출 방법</th><td>${esc(g.submit?.method)}</td></tr>
        <tr><th>제출 위치</th><td>${esc(g.submit?.where)}</td></tr>
        <tr><th>기한</th><td>${esc(g.submit?.deadlineText)}${due ? `<br/><b>${periodLabel(task, semesterId(), r)}</b>` : ''}</td></tr>
      </table>
    </section>

    <section class="card">
      <h3>📝 나의 메모</h3>
      <textarea id="memo" rows="3" placeholder="참관 날짜, 기관 담당자 연락처 등 자유롭게 기록하세요.">${esc(r.memo || '')}</textarea>
    </section>

    <button class="btn big ${r.done ? '' : 'primary'}" id="toggleDone">${r.done ? '완료 취소하기' : '✓ 완료로 체크하기'}</button>`;
  },

  mount(root, { params }) {
    const id = params[0];
    const patch = (fn) => update((s) => fn((s.tasks[id] ||= {})));

    root.querySelector('#toggleDone')?.addEventListener('click', () => {
      patch((r) => {
        r.done = !r.done;
        r.doneAt = r.done ? new Date().toISOString() : null;
      });
      toast(sem().tasks[id].done ? '완료 처리되었습니다.' : '완료를 취소했습니다.');
    });
    root.querySelector('#saveDue')?.addEventListener('click', () => {
      const v = root.querySelector('#customDue').value;
      patch((r) => (r.customDue = v || null));
      toast(v ? '마감일을 저장했어요.' : '마감일을 지웠어요.');
    });
    let t;
    root.querySelector('#memo')?.addEventListener('input', (e) => {
      clearTimeout(t);
      // 메모는 다시 그리지 않고 조용히 저장
      t = setTimeout(() => {
        const s = sem();
        (s.tasks[id] ||= {}).memo = e.target.value;
        update(() => {});
      }, 600);
    });
  },
  // 메모 입력 중 화면이 다시 그려지지 않도록
  keepOnUpdate: (root) => root.contains(document.activeElement) && document.activeElement.id === 'memo',
};
