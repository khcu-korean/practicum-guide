// 마감 알림
// 현재: 앱 접속 시 D-7/D-3/D-1 과업을 브라우저(휴대폰) 알림으로 표시 (하루 1회)
// 추후: 서버(Supabase Edge Function + 예약 실행)에서 Web Push 또는 이메일 발송으로 확장
import { CONFIG } from './config.js';
import { upcoming } from './selectors.js';
import { ddayLabel, todayISO } from './utils.js';

export function notificationStatus() {
  if (!('Notification' in window)) return { label: '이 브라우저는 알림을 지원하지 않음', canEnable: false };
  if (Notification.permission === 'granted') return { label: '켜짐', canEnable: false };
  if (Notification.permission === 'denied') return { label: '차단됨 (브라우저 설정에서 허용 필요)', canEnable: false };
  return { label: '꺼짐', canEnable: true };
}

export async function enableNotifications() {
  if (!('Notification' in window)) return false;
  return (await Notification.requestPermission()) === 'granted';
}

/** 앱 접속 시 호출: 알림 기준일(7·3·1일 전, 당일, 지남)에 해당하는 과업 알림 */
export async function notifyDueTasks() {
  if (!('Notification' in window) || Notification.permission !== 'granted') return;
  const key = `pg:notified:${todayISO()}`;
  if (localStorage.getItem(key)) return;
  const targets = upcoming(Math.max(...CONFIG.alertDays)).filter(
    (t) => t.left <= 0 || CONFIG.alertDays.includes(t.left)
  );
  if (!targets.length) return;
  const body = targets.map((t) => `[${ddayLabel(t.left)}] ${t.task.title}`).join('\n');
  const reg = await navigator.serviceWorker?.getRegistration();
  const opts = { body, icon: 'icons/icon.svg', tag: 'due' };
  if (reg) reg.showNotification('마감 임박 과업이 있어요', opts);
  else new Notification('마감 임박 과업이 있어요', opts);
  localStorage.setItem(key, '1');
}
