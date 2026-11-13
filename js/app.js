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
import assign from './views/assign.js';
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
  assign,
  timeline,
  task,
  progress,
  complete,
  settings,
};

// 아이콘 (선 아이콘, 색은 글자색을 따름)
const ICON = {
  home: '<path d="M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z"/>',
  timeline: '<rect x="3" y="4.5" width="18" height="16.5" rx="2"/><path d="M3 9.5h18M8 2.5v4M16 2.5v4"/>',
  progress: '<path d="M4 20V10M10 20V4M16 20v-7M22 20H2"/>',
  complete: '<path d="m4 12.5 5 5L20 6.5"/>',
  more: '<circle cx="5" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="19" cy="12" r="1.3"/>',
};
const svg = (name) =>
  `<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[name]}</svg>`;

const NAV = [
  { path: '', icon: 'home', label: '홈' },
  { path: 'timeline', icon: 'timeline', label: '타임라인' },
  { path: 'progress', icon: 'progress', label: '진행 현황' },
  { path: 'complete', icon: 'complete', label: '이수 점검' },
  { path: 'settings', icon: 'more', label: '더보기' },
];

const app = document.getElementById('app');
let current = null;

function parseHash() {
  const [path = '', ...params] = location.hash.replace(/^#\/?/, '').split('/');
  return { path, params };
}

const brandHTML = () =>
  CONFIG.school.logo
    ? `<img class="logo" src="${esc(CONFIG.school.logo)}" alt="${esc(CONFIG.school.name)}" /><span class="dept">${esc(CONFIG.school.dept)}</span>`
    : `<span class="mark" aria-hidden="true">${esc(CONFIG.school.mark)}</span><span>${esc(CONFIG.school.name)}<small>${esc(CONFIG.school.dept)}</small></span>`;

function layout(view, path, body) {
  const user = getUser();
  const soon = user ? upcoming(CONFIG.urgentDays) : [];
  const isActive = (n) => path === n.path || (n.path === 'timeline' && (path === 'task' || path === 'assign'));
  return `
  <header class="band">
    <div class="band-in">
      <a href="#/" class="brand">${brandHTML()}</a>
      ${user ? `<span class="sem">${esc(getSemester(semesterId()).label)}</span>` : view.public ? '<a class="band-link" href="#/login">로그인</a>' : ''}
    </div>
  </header>
  ${
    user
      ? `<nav class="mainnav" aria-label="주 메뉴"><div class="mainnav-in">${NAV.map(
          (n) => `<a href="#/${n.path}" class="${isActive(n) ? 'active' : ''}" ${isActive(n) ? 'aria-current="page"' : ''}>${svg(n.icon)}<span>${n.label}</span></a>`
        ).join('')}</div></nav>`
      : ''
  }
  ${
    soon.length && path !== ''
      ? `<a class="strip" href="#/task/${soon[0].task.id}"><span class="badge badge-urgent">${ddayLabel(soon[0].left)}</span> ${esc(soon[0].task.title)}${soon.length > 1 ? ` <span class="muted">외 ${soon.length - 1}건</span>` : ''}</a>`
      : ''
  }
  <main class="container" id="view">${body}</main>
  <footer class="foot container">
    <p>${esc(CONFIG.appName)} · ${esc(CONFIG.school.name)} ${esc(CONFIG.school.dept)}</p>
    <p>이 앱의 안내와 진단 결과는 참고용이며, 최종 기준은 학교의 공식 학사 안내와 학과 공지를 따릅니다.</p>
  </footer>`;
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
