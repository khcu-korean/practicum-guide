// ⑥ 진행 현황: 진행률, 완료/미완료 구분, 마감 임박 강조, 알림 설정
import { sem } from '../store.js';
import { myTasks, progressStats } from '../selectors.js';
import { taskRow, bindDoneToggle } from './timeline.js';
import { ring } from './home.js';
import { CONFIG } from '../config.js';
import { notificationStatus, enableNotifications } from '../notify.js';
import { toast } from '../utils.js';

export default {
  title: '진행 현황',
  render() {
    if (!sem().typeId) {
      return `<h1 class="page-title">STEP 5. 진행 현황</h1>
      <section class="card next"><p>STEP 3에서 확정된 실습 유형을 입력하면 진행 현황을 확인할 수 있어요.</p>
      <a class="btn primary" href="#/assign">확정된 실습 유형·기관 입력하기 →</a></section>`;
    }
    const list = myTasks();
    const stats = progressStats();
    const byDue = (a, b) => (a.left ?? 9999) - (b.left ?? 9999);
    const todo = list.filter((t) => !t.done).sort(byDue);
    const done = list.filter((t) => t.done);
    const nStatus = notificationStatus();

    return `
    <h1 class="page-title">STEP 5. 진행 현황</h1>
    <section class="card row">
      ${ring(stats.percent)}
      <div class="grow">
        <p>전체 <b>${stats.total}</b> · 완료 <b>${stats.done}</b> · 남음 <b>${stats.total - stats.done}</b></p>
        <div class="bar"><span style="width:${stats.percent}%"></span></div>
      </div>
    </section>

    <section class="card">
      <h2>미완료 과업 (${todo.length})</h2>
      ${todo.length ? `<ul class="task-list">${todo.map(taskRow).join('')}</ul>` : '<p class="muted">모든 과업을 완료했어요. <a class="link" href="#/complete">이수 완료 점검 →</a></p>'}
    </section>

    <section class="card">
      <h2>완료한 과업 (${done.length})</h2>
      ${done.length ? `<ul class="task-list">${done.map(taskRow).join('')}</ul><p class="tiny muted">체크를 해제하면 미완료로 되돌릴 수 있어요.</p>` : '<p class="muted">아직 완료한 과업이 없어요.</p>'}
    </section>

    <section class="card soft">
      <h2>마감 알림</h2>
      <p class="muted">마감 ${CONFIG.alertDays.join('일 전 · ')}일 전에 알려 드려요.</p>
      <p class="tiny">현재 상태: <b>${nStatus.label}</b></p>
      ${nStatus.canEnable ? '<button class="btn" id="enableNoti">휴대폰/브라우저 알림 켜기</button>' : ''}
      <p class="tiny muted">※ 현재는 앱에 접속했을 때 알림이 표시됩니다. 앱을 열지 않아도 오는 푸시 알림은 서버 연결 후 활성화됩니다.</p>
    </section>`;
  },
  mount(root) {
    bindDoneToggle(root);
    root.querySelector('#enableNoti')?.addEventListener('click', async () => {
      const ok = await enableNotifications();
      toast(ok ? '알림이 켜졌어요.' : '알림 권한이 허용되지 않았어요.');
      location.reload();
    });
  },
};
