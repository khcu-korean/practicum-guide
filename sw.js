// 서비스 워커: 홈 화면 설치(PWA), 알림 표시, 항상 최신 파일 받기
// - 인터넷이 연결되어 있으면 매번 서버에서 최신 파일을 받아 옵니다(브라우저의 예전 파일을 쓰지 않음).
// - 인터넷이 끊겼을 때만 마지막으로 받은 파일을 보여 줍니다.
const CACHE = 'practicum-guide-v1';

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (e) => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  e.respondWith(
    fetch(req, { cache: 'no-cache' })
      .then((res) => {
        const copy = res.clone();
        caches.open(CACHE).then((c) => c.put(req, copy));
        return res;
      })
      .catch(() => caches.match(req))
  );
});

self.addEventListener('notificationclick', (e) => {
  e.notification.close();
  e.waitUntil(self.clients.openWindow('./#/progress'));
});

// (추후) 서버 푸시 수신
self.addEventListener('push', (e) => {
  const d = e.data ? e.data.json() : { title: '실습 길잡이', body: '확인할 과업이 있어요.' };
  e.waitUntil(self.registration.showNotification(d.title, { body: d.body, icon: 'icons/icon.svg' }));
});
