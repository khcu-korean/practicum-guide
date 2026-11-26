// 실습 유형 안내: 접어 두었다가 누르면 유형별 설명이 펼쳐짐 (STEP 2·3에서 사용)
import { PRACTICUM_TYPES, TYPE_GUIDE_INTRO, GLOSSARY, APPLICATION_NOTICE, SELF_APPLY_STEPS, SELF_APPLY_NOTE, OVERSEAS_SITES } from '../data/types.js';
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
          ${cautionsHTML(t)}
          <div class="tiny">기관: ${t.institutions ? (t.institutions.length ? t.institutions.map((i) => esc(i.name) + (i.hideIn?.includes('1') ? ' (2학기만)' : '')).join(', ') : '추후 안내') : '실습생이 직접 섭외'}</div>
        </dd>`
      ).join('')}
    </dl>
  </details>`;
}

/** 유형별 유의 사항 목록 */
export const cautionsHTML = (t) =>
  t?.cautions?.length ? `<ul class="bullets tiny caution">${t.cautions.map((c) => `<li>${esc(c)}</li>`).join('')}</ul>` : '';

/** 실습 신청 안내 (selfApply: 유형 2·3 직접 섭외 절차도 함께) */
export function applicationNoticeHTML({ selfApply = false } = {}) {
  return `
  ${
    selfApply
      ? `<div class="notice">
    <b>유형 2·3 신청 절차 (실습 기관 직접 섭외)</b>
    <ol class="steps-ol tiny">${SELF_APPLY_STEPS.map((x) => `<li>${esc(x)}</li>`).join('')}</ol>
    <p class="tiny">※ ${esc(SELF_APPLY_NOTE)}</p>
    <p class="tiny"><b>해외 한국어 교육기관을 찾아볼 수 있는 사이트</b></p>
    <ul class="bullets tiny">${OVERSEAS_SITES.map(
      (x) => `<li>${esc(x.name)} (${esc(x.path)})<br/><a class="link" href="${esc(x.url)}" target="_blank" rel="noopener">${esc(x.url)}</a></li>`
    ).join('')}</ul>
  </div>`
      : ''
  }
  <div class="notice">
    <b>실습 신청은 이렇게 합니다</b>
    <ul class="bullets tiny">${APPLICATION_NOTICE.map((x) => `<li><b>${esc(x.label)}</b>: ${esc(x.text)}</li>`).join('')}</ul>
  </div>`;
}
