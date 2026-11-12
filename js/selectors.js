// 여러 화면에서 공통으로 쓰는 계산 로직
import { tasksForType } from './data/tasks.js';
import { sem, semesterId } from './store.js';
import { resolveDue, daysLeft } from './utils.js';

/** 내 유형에 해당하는 과업 목록 (마감일·완료 여부 포함) */
export function myTasks() {
  const s = sem();
  return tasksForType(s.typeId).map((task) => {
    const record = s.tasks?.[task.id] || {};
    const due = resolveDue(task, semesterId(), record);
    return { task, record, due, left: daysLeft(due), done: Boolean(record.done) };
  });
}

export function progressStats() {
  const list = myTasks();
  const done = list.filter((t) => t.done).length;
  return { total: list.length, done, percent: list.length ? Math.round((done / list.length) * 100) : 0 };
}

/** 마감 임박(기본 7일 이내) + 기한 지난 미완료 과업 */
export function upcoming(withinDays = 7) {
  return myTasks()
    .filter((t) => !t.done && t.left !== null && t.left <= withinDays)
    .sort((a, b) => a.left - b.left);
}

/** 진행 단계 상태 */
export function stepStatus() {
  const s = sem();
  const stats = progressStats();
  return {
    eligibility: Boolean(s.eligibility),
    diagnosis: Boolean(s.diagnosis),
    type: Boolean(s.typeId),
    tasks: s.typeId && stats.done === stats.total,
  };
}
