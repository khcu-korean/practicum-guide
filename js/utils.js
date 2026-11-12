import { CONFIG, getSemester } from './config.js';

export const esc = (s) =>
  String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

const DAY_INDEX = { mon: 0, tue: 1, wed: 2, thu: 3, fri: 4, sat: 5, sun: 6 };
const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'];

export const toISO = (d) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const parseISO = (s) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};

export const todayISO = () => toISO(new Date());

/** 과업의 실제 마감일(ISO) 계산. 학생이 직접 입력한 날짜가 우선. 미정이면 null */
export function resolveDue(task, semesterId, record) {
  if (record?.customDue) return record.customDue;
  const due = task.due;
  if (!due) return null;
  if (typeof due === 'string') return due;
  const start = parseISO(getSemester(semesterId).startDate);
  // 학기 시작일이 속한 주의 월요일 기준
  const monday = new Date(start);
  monday.setDate(start.getDate() - ((start.getDay() + 6) % 7));
  const d = new Date(monday);
  d.setDate(monday.getDate() + (due.week - 1) * 7 + (DAY_INDEX[due.day] ?? 6));
  return toISO(d);
}

/** 남은 일수 (오늘=0, 지남=음수) */
export function daysLeft(iso) {
  if (!iso) return null;
  const ms = parseISO(iso) - parseISO(todayISO());
  return Math.round(ms / 86400000);
}

export function ddayLabel(n) {
  if (n === null || n === undefined) return '미정';
  if (n === 0) return 'D-DAY';
  return n > 0 ? `D-${n}` : `D+${-n}`;
}

export function fmtDate(iso) {
  if (!iso) return '미정';
  const d = parseISO(iso);
  return `${d.getMonth() + 1}/${d.getDate()}(${WEEKDAY_KO[d.getDay()]})`;
}

/** 배지 색상 클래스 */
export function ddayClass(n, done) {
  if (done) return 'badge-done';
  if (n === null) return 'badge-tbd';
  if (n < 0) return 'badge-over';
  if (n <= CONFIG.urgentDays) return 'badge-urgent';
  if (n <= 7) return 'badge-soon';
  return 'badge-normal';
}

export function toast(msg) {
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.classList.add('show'), 10);
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 300);
  }, 2200);
}
