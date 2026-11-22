// 앱 시작점: 화면 전환(라우터), 공통 레이아웃, 로그인 확인
import { CONFIG, getSemester, isServerMode } from './config.js';
import { MENUS, SUBSTEPS, stepOf, isSubstep } from './steps.js';
import { initStore, subscribe, getUser, semesterId, update } from './store.js';
import { upcoming } from './selectors.js';
import { notifyDueTasks } from './notify.js';
import { esc, ddayLabel, toast } from './utils.js';

import home from './views/home.js';
import login from './views/login.js';
import eligibility from './views/eligibility.js';
import diagnosis from './views/diagnosis.js';
import assign from './views/assign.js';
import timeline from './views/timeline.js';
import practice from './views/practice.js';
import task from './views/task.js';
import progress from './views/progress.js';
import complete from './views/complete.js';
import settings from './views/settings.js';
import faq from './views/faq.js';

const ROUTES = {
  '': home,
  login,
  eligibility,
  diagnosis,
  practice,
  assign,
  timeline,
  task,
  progress,
  complete,
  settings,
  faq,
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
  const item = (href, label, active, no) =>
    `<a href="#/${href}" class="${active ? 'active' : ''}" ${active ? 'aria-current="page"' : ''}>${no ? `<span class="no">${no}</span>` : ''}${label}</a>`;
  const activeMenu = isSubstep(path) ? 'practice' : path;
  return `<nav class="stepnav" aria-label="전체 메뉴"><div class="stepnav-in">
    ${item('', '홈', path === '')}
    ${MENUS.map((m) => item(m.path, m.short, activeMenu === m.path, m.no)).join('')}
    ${item('faq', 'FAQ', path === 'faq')}
    ${item('settings', '더보기', path === 'settings')}
  </div></nav>`;
}

// 3. 실습 유형별 과제 수행 안의 하위 메뉴 (3-1 ~ 3-4)
function subNav(path) {
  if (!isSubstep(path) && path !== 'practice') return '';
  const active = path === 'task' ? 'timeline' : path;
  return `<nav class="subnav" aria-label="실습 유형별 과제 수행"><div class="subnav-in">
    ${SUBSTEPS.map(
      (x, i) => `${i ? '<span class="sep" aria-hidden="true">›</span>' : ''}<a href="#/${x.path}" class="${active === x.path ? 'active' : ''}"><span class="no">${x.no}</span>${x.short}</a>`
    ).join('')}
  </div></nav>`;
}

function prevNext(path) {
  const FLOW_ = [MENUS[0], MENUS[1], ...SUBSTEPS];
  const st = stepOf(path);
  if (!st) return '';
  const i = FLOW_.indexOf(st);
  const prev = FLOW_[i - 1];
  const next = FLOW_[i + 1];
  // 입력을 비우고 다시 할 수 있는 단계
  const resettable = { eligibility: '수강 자격 자기점검', diagnosis: '실습 유형 추천받기' };
  return `<nav class="prevnext container" aria-label="단계 이동">
    ${prev ? `<a href="#/${prev.path}" class="btn">← <span class="pn-name">${prev.no}. ${prev.short}</span><span class="pn-short">이전</span></a>` : '<a href="#/" class="btn">← 홈</a>'}
    ${resettable[path] ? `<button type="button" class="btn ghost-line" data-reset="${path}">비우고 다시 하기</button>` : ''}
    ${next ? `<a href="#/${next.path}" class="btn primary"><span class="pn-name">다음: ${next.no}. ${next.short}</span><span class="pn-short">다음</span> →</a>` : '<a href="#/" class="btn primary">홈으로</a>'}
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
  ${subNav(path)}
  ${
    soon.length
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
  document.querySelectorAll('.stepnav a.active, .subnav a.active').forEach((el) => el.scrollIntoView({ block: 'nearest', inline: 'center' }));
  window.scrollTo(0, scroll);
  current = view;
}

async function start() {
  app.innerHTML = '<p class="loading">불러오는 중…</p>';
  await initStore();
  window.addEventListener('hashchange', () => render());
  // '비우고 다시 하기': 해당 단계의 입력을 지움
  document.addEventListener('click', (e) => {
    const key = e.target.closest('[data-reset]')?.dataset.reset;
    if (!key) return;
    if (!confirm('입력한 내용을 모두 지우고 처음부터 다시 할까요?')) return;
    update((s) => delete s[key]);
    window.scrollTo(0, 0);
    toast('입력을 비웠습니다. 처음부터 다시 선택하세요.');
  });
  subscribe(() => render(false));
  render();
  notifyDueTasks();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js', { updateViaCache: 'none' }).catch(() => {});
}

start();
