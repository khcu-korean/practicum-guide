// ⑤ 과제 수행 가이드 (과업 상세)
import { getTask, typesOfTask, SCHEDULE_NOTE, COMMON_GUIDE_NOTES, ALL_TYPE_IDS, localizeTask } from '../data/tasks.js';
import { getType } from '../data/types.js';
import { instScheduleFor } from '../selectors.js';
import { sem, planSemesterId, update } from '../store.js';
import { esc, resolveDue, daysLeft, ddayLabel, ddayClass, fmtDate, weekLabel, toast } from '../utils.js';

export default {
  title: '과제 가이드',
  render({ params }) {
    const task = localizeTask(getTask(params[0]), planSemesterId());
    if (!task) return '<p>과업을 찾을 수 없습니다.</p><a href="#/timeline">← 타임라인</a>';
    const r = sem().tasks?.[task.id] || {};
    const due = resolveDue(task, planSemesterId(), r);
    const left = daysLeft(due);
    const g = task.guide || {};
    const typeIds = typesOfTask(task.id);
    const typeNames = typeIds.length === ALL_TYPE_IDS.length ? '모든 유형 공통' : typeIds.map((id) => `유형 ${id}`).join(', ');

    return `
    <a href="#/timeline" class="link">← 타임라인</a>
    <h1 class="page-title">${esc(task.title)}</h1>
    <p class="muted">${task.week ? `${task.week}주차까지 · ` : ''}${esc(typeNames)}</p>
    ${task.note ? `<p class="notice tiny">${esc(task.note)}</p>` : ''}

    <section class="card row">
      <span class="badge big ${r.done || left !== null ? ddayClass(left, r.done) : weekLabel(task) ? 'badge-normal' : 'badge-tbd'}">${r.done ? '완료' : left !== null ? ddayLabel(left) : weekLabel(task) || '미정'}</span>
      <div class="grow">
        <p>${task.start ? '기간' : task.due === null ? '일정' : '기한'}: <b>${weekLabel(task) ? `개강 후 ${weekLabel(task)}` : esc(instScheduleFor(task.id)?.term.period || task.dueText || '미정')}</b></p>
        ${r.customDue ? `<p class="tiny">우리 반 날짜: <b>${fmtDate(r.customDue)}</b></p>` : ''}
        ${task.due === null && !(instScheduleFor(task.id) && !r.customDue) ? `<p class="tiny muted">${esc(task.scheduleNote || SCHEDULE_NOTE[task.schedule] || '일정이 정해지면 직접 입력하세요.')}</p>` : ''}
        ${task.due && !r.customDue ? '<p class="tiny muted">자세한 날짜는 반별 공지사항을 확인하세요.</p>' : ''}
      </div>
    </section>

    ${(() => {
      const mi = instScheduleFor(task.id);
      return mi
        ? `<section class="card next">
        <p class="label">나의 실습 기관 일정 (${esc(mi.inst.name)})</p>
        <table class="result">
          <tr><th>기간</th><td>${esc(mi.term.period)}</td></tr>
          <tr><th>방식</th><td>${esc(mi.term.method)}</td></tr>
          ${mi.inst.schedule ? `<tr><th>시간 구성</th><td>${esc(mi.inst.schedule)}</td></tr>` : ''}
          ${mi.term.note ? `<tr><th>참고</th><td>${esc(mi.term.note)}</td></tr>` : ''}
        </table>
        <p class="tiny muted">정확한 날짜는 강의실 공지 사항으로 안내합니다. 날짜가 정해지면 아래에 입력하세요.</p>
      </section>`
        : '';
    })()}

    <section class="card">
      <h3>우리 반 날짜 입력</h3>
      <p class="tiny muted">반별 공지에서 날짜를 확인해 입력하면 D-day와 마감 알림이 표시됩니다. 비우고 저장하면 지워집니다.</p>
      <div class="row">
        <input type="date" id="customDue" value="${esc(r.customDue || '')}" class="grow" />
        <button class="btn" id="saveDue">저장</button>
      </div>
    </section>

    <section class="card guide">
      <h2>과제 소개</h2>
      <p>${esc(g.intro)}</p>

      <h2>중요 사항</h2>
      <ul class="bullets">${[...(g.important || []), ...COMMON_GUIDE_NOTES].map((x) => `<li>${esc(x)}</li>`).join('')}</ul>

      ${
        g.templates?.length
          ? `<h2>작성 양식</h2>
        <ul class="templates">${g.templates
          .map((t) =>
            t.url
              ? `<li>${esc(t.name)} <a class="btn small" href="${esc(t.url)}" target="_blank" rel="noopener">클릭</a></li>`
              : `<li>${esc(t.name)} <button type="button" class="btn small" data-nofile>클릭</button></li>`
          )
          .join('')}</ul>`
          : ''
      }

      <h2>제출 방법 및 기한</h2>
      <table class="result">
        <tr><th>제출 방법</th><td>${esc(g.submit?.method)}</td></tr>
        <tr><th>제출 위치</th><td>${esc(g.submit?.where)}</td></tr>
        <tr><th>기한</th><td>${esc(g.submit?.deadlineText)}${r.customDue ? `<br/><b>우리 반 날짜: ${fmtDate(r.customDue)}</b>` : ''}</td></tr>
      </table>
    </section>

    <section class="card">
      <h3>나의 메모</h3>
      <textarea id="memo" rows="3" placeholder="참관 날짜, 기관 담당자 연락처 등 자유롭게 기록하세요.">${esc(r.memo || '')}</textarea>
    </section>

    <button class="btn big ${r.done ? '' : 'primary'}" id="toggleDone">${r.done ? '완료 취소하기' : '✓ 완료로 체크하기'}</button>`;
  },

  mount(root, { params }) {
    root.querySelectorAll('[data-nofile]').forEach((b) =>
      b.addEventListener('click', () => toast('현재는 파일이 없습니다. 양식이 준비되면 이곳에서 내려받을 수 있습니다.'))
    );
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
      toast(v ? '날짜를 저장했어요.' : '기준 날짜로 되돌렸어요.');
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
