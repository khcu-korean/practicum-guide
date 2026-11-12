// 서비스 워커: 홈 화면 설치(PWA)와 알림 표시용. 추후 Web Push 수신 코드를 여기에 추가합니다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./#/progress'));
});

// (추후) 서버 푸시 수신
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : { title: '실습 길잡이', body: '확인할 과업이 있어요.' };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: 'icons/icon.svg' }));
});
