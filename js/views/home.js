// 홈: 앱 소개 + 메뉴 바둑판 (진행 상황과 관계없이 항상 같은 화면)
import { CONFIG } from '../config.js';
import { MENUS } from '../steps.js';
import { esc } from '../utils.js';

// 진행률 원 (진행 현황 화면에서도 사용)
export const ring = (pct) => `
  <div class="ring" style="--p:${pct}">
    <span>${pct}<small>%</small></span>
  </div>`;

const ICONS = {
  check: '<path d="M9 11.5 11.5 14 16 9"/><rect x="3.5" y="3.5" width="17" height="17" rx="3"/>',
  compass: '<circle cx="12" cy="12" r="8.5"/><path d="m15.5 8.5-2 5-5 2 2-5z"/>',
  list: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 5M3.5 12l1.2 1.2L7 11M3.5 18l1.2 1.2L7 17"/>',
  faq: '<circle cx="12" cy="12" r="8.5"/><path d="M9.6 9.5a2.5 2.5 0 1 1 3.4 2.3c-.6.3-1 .8-1 1.5v.5"/><circle cx="12" cy="16.8" r=".6" fill="currentColor"/>',
};
const icon = (name) =>
  `<svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

export default {
  title: '홈',
  public: true,
  render() {
    const tiles = [
      ...MENUS.map((m) => ({ href: m.path, no: m.no, title: m.title, icon: m.icon })),
      { href: 'faq', no: '', title: '자주 묻는 질문', icon: 'faq' },
    ];
    return `
    <section class="hero">
      <h1>${esc(CONFIG.appName)}</h1>
      <p>${esc(CONFIG.subtitle)}</p>
    </section>

    <nav class="tile-grid" aria-label="메뉴">
      ${tiles
        .map(
          (t) => `<a class="tile" href="#/${t.href}">
            ${t.no ? `<span class="tile-no">${t.no}</span>` : '<span class="tile-no ghost"></span>'}
            <span class="tile-icon">${icon(t.icon)}</span>
            <span class="tile-title">${esc(t.title)}</span>
          </a>`
        )
        .join('')}
    </nav>`;
  },
};
