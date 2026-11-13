// 실습 유형 안내: 접어 두었다가 누르면 유형별 설명이 펼쳐짐 (STEP 2·3에서 사용)
import { PRACTICUM_TYPES, TYPE_GUIDE_INTRO, GLOSSARY } from '../data/types.js';
import { esc } from '../utils.js';

/** withGlossary: 용어 정의도 함께 보여 줄지 (STEP 2) */
export function typeGuideHTML({ withGlossary = false } = {}) {
  return `
  <details class="card soft type-guide">
    <summary><b>${withGlossary ? '용어와 실습 유형 안내' : '실습 유형 안내'}</b> <span class="tiny muted">눌러서 펼치기</span></summary>
    ${
      withGlossary
        ? `<h3 class="guide-sub">알아 두면 좋은 용어</h3>
    <dl class="glossary">${GLOSSARY.map((g) => `<dt>${esc(g.term)}</dt><dd>${esc(g.definition)}</dd>`).join('')}</dl>
    <h3 class="guide-sub">실습 유형</h3>`
        : ''
    }
    <p class="notice tiny">${esc(TYPE_GUIDE_INTRO)}</p>
    <dl class="type-list">
      ${PRACTICUM_TYPES.map(
        (t) => `<dt>${esc(t.name)} <span class="muted">${esc(t.summary)}</span></dt>
        <dd>${esc(t.description)}
          <div class="tiny">${t.activities.map((x) => `<span class="tag">${esc(x)}</span>`).join(' ')}
          ${t.institutions ? ` · 기관: ${t.institutions.map((i) => esc(i.name)).join(', ')}` : ' · 기관: 실습생이 직접 섭외'}</div>
        </dd>`
      ).join('')}
    </dl>
  </details>`;
}
