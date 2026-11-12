// 앱 시작점: 화면 전환(라우터), 공통 레이아웃, 로그인 확인
import { CONFIG, getSemester } from './config.js';
import { initStore, subscribe, getUser, semesterId } from './store.js';
import { upcoming } from './selectors.js';
import { notifyDueTasks } from './notify.js';
import { esc, ddayLabel } from './utils.js';

import home from './views/home.js';
import login from './views/login.js';
import eligibility from './views/eligibility.js';
import diagnosis from './views/diagnosis.js';
import timeline from './views/timeline.js';
import task from './views/task.js';
import progress from './views/progress.js';
import complete from './views/complete.js';
import settings from './views/settings.js';

const ROUTES = {
  '': home,
  login,
  eligibility,
  diagnosis,
  timeline,
  task,
  progress,
  complete,
  settings,
};

const NAV = [
  { path: '', icon: '🏠', label: '홈' },
  { path: 'timeline', icon: '🗓️', label: '타임라인' },
  { path: 'progress', icon: '📊', label: '진행현황' },
  { path: 'complete', icon: '🎓', label: '이수점검' },
  { path: 'settings', icon: '⋯', label: '더보기' },
];

const app = document.getElementById('app');
let current = null;

function parseHash() {
  const [path = '', ...params] = location.hash.replace(/^#\/?/, '').split('/');
  return { path, params };
}

function layout(view, path, body) {
  const user = getUser();
  const soon = user ? upcoming(CONFIG.urgentDays) : [];
  return `
  <header class="topbar">
    <a href="#/" class="brand">${esc(CONFIG.appName)}</a>
    ${user ? `<span class="sem">${esc(getSemester(semesterId()).label)}</span>` : '<a class="link" href="#/login">로그인</a>'}
  </header>
  ${
    soon.length && path !== ''
      ? `<a class="strip" href="#/task/${soon[0].task.id}">⏰ <b>${ddayLabel(soon[0].left)}</b> ${esc(soon[0].task.title)}${soon.length > 1 ? ` 외 ${soon.length - 1}건` : ''}</a>`
      : ''
  }
  <main class="container" id="view">${body}</main>
  ${
    user
      ? `<nav class="bottomnav">${NAV.map(
          (n) => `<a href="#/${n.path}" class="${(path === n.path || (path === 'task' && n.path === 'timeline')) ? 'active' : ''}"><span>${n.icon}</span>${n.label}</a>`
        ).join('')}</nav>`
      : ''
  }`;
}

function render(force = true) {
  const { path, params } = parseHash();
  const view = ROUTES[path] || home;

  // 로그인 확인: public 화면(로그인, 자격진단)은 비로그인 허용
  if (!getUser() && view !== login && !view.public) {
    location.hash = '#/login';
    return;
  }
  if (getUser() && view === login) {
    location.hash = '#/';
    return;
  }

  const viewEl = document.getElementById('view');
  if (!force && current === view && view.keepOnUpdate?.(viewEl)) return;

  const scroll = current === view ? window.scrollY : 0;
  const ctx = { params };
  app.innerHTML = layout(view, path, view.render(ctx));
  document.title = `${view.title} | ${CONFIG.appName}`;
  view.mount?.(document.getElementById('view'), ctx);
  window.scrollTo(0, scroll);
  current = view;
}

async function start() {
  app.innerHTML = '<p class="loading">불러오는 중…</p>';
  await initStore();
  window.addEventListener('hashchange', () => render());
  subscribe(() => render(false));
  render();
  if (getUser()) notifyDueTasks();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

start();
