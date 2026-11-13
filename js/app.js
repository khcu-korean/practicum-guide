// 앱 시작점: 화면 전환(라우터), 공통 레이아웃, 로그인 확인
import { CONFIG, getSemester, isServerMode } from './config.js';
import { STEPS, GROUPS, stepOf } from './steps.js';
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

function stepNav(path) {
  const activePath = path === 'task' ? 'timeline' : path;
  const item = (href, label, active, no) =>
    `<a href="#/${href}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>${no ? `<span class="no">${no}</span>` : ''}${label}</a>`;
  const group = (g, joiner) =>
    `<span class="navgroup ${g}"><span class="navlabel">${GROUPS[g].label}</span>${STEPS.filter((x) => x.group === g)
      .map((x) => item(x.path, x.short, activePath === x.path, x.no))
      .join(joiner)}</span>`;
  return `<nav class="stepnav" aria-label="전체 메뉴"><div class="stepnav-in">
    ${item('', '홈', activePath === '')}
    ${group('prep', '<span class="sep" aria-hidden="true">·</span>')}
    ${group('flow', '<span class="sep" aria-hidden="true">›</span>')}
    ${item('settings', '더보기', activePath === 'settings')}
  </div></nav>`;
}

function prevNext(path) {
  const st = stepOf(path);
  if (!st) return '';
  const i = STEPS.indexOf(st);
  const prev = STEPS[i - 1];
  const next = STEPS[i + 1];
  return `<nav class="prevnext container" aria-label="단계 이동">
    ${prev ? `<a href="#/${prev.path}" class="btn">← ${prev.no}. ${prev.short}</a>` : '<a href="#/" class="btn">← 홈</a>'}
    ${next ? `<a href="#/${next.path}" class="btn primary">다음 단계: ${next.no}. ${next.short} →</a>` : '<a href="#/" class="btn primary">홈으로</a>'}
  </nav>`;
}

function layout(view, path, body) {
  const soon = upcoming(CONFIG.urgentDays);
  return `
  <header class="band">
    <div class="band-in">
      <a href="#/" class="brand">${brandHTML()}</a>
      <span class="sem">${esc(getSemester(semesterId()).label)}</span>
    </div>
  </header>
  ${stepNav(path)}
  ${
    soon.length && path !== ''
      ? `<a class="strip" href="#/task/${soon[0].task.id}"><span class="badge badge-urgent">${ddayLabel(soon[0].left)}</span> ${esc(soon[0].task.title)}${soon.length > 1 ? ` <span class="muted">외 ${soon.length - 1}건</span>` : ''}</a>`
      : ''
  }
  <main class="container" id="view">${body}</main>
  ${prevNext(path)}
  <footer class="foot container">
    <p>${esc(CONFIG.appName)} · ${esc(CONFIG.school.name)} ${esc(CONFIG.school.dept)}</p>
    <p>이 앱의 안내와 진단 결과는 참고용이며, 최종 기준은 학교의 공식 학사 안내와 학과 공지를 따릅니다.</p>
  </footer>`;
}

function render(force = true) {
  const { path, params } = parseHash();
  const view = ROUTES[path] || home;

  // 로그인 확인: public 화면(로그인, 자격진단)은 비로그인 허용
  // 서버 모드일 때만 로그인이 필요합니다. (지금은 기록이 이 기기 브라우저에 저장되므로 로그인 없이 이용)
  if (isServerMode() && !getUser() && view !== login && !view.public) {
    location.hash = '#/login';
    return;
  }
  if ((getUser() || !isServerMode()) && view === login) {
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
  // 상단 메뉴에서 현재 단계가 보이도록 옆으로 스크롤
  document.querySelector('.stepnav a.active')?.scrollIntoView({ block: 'nearest', inline: 'center' });
  window.scrollTo(0, scroll);
  current = view;
}

async function start() {
  app.innerHTML = '<p class="loading">불러오는 중…</p>';
  await initStore();
  window.addEventListener('hashchange', () => render());
  subscribe(() => render(false));
  render();
  notifyDueTasks();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
}

start();
