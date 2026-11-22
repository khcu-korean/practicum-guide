// 3. 실습 유형별 과제 수행: 세부 단계(3-1 ~ 3-4) 안내
import { getType } from '../data/types.js';
import { sem } from '../store.js';
import { SUBSTEPS } from '../steps.js';
import { progressStats } from '../selectors.js';
import { esc } from '../utils.js';

export default {
  title: '실습 유형별 과제 수행',
  render() {
    const s = sem();
    const type = getType(s.typeId);
    const stats = progressStats();
    return `
    <h1 class="page-title">STEP 3. 실습 유형별 과제 수행</h1>
    <p class="muted">확정 명단이 발표된 뒤 아래 순서대로 진행하세요. 3-1에서 실습 기관을 입력해야 3-2 ~ 3-4가 만들어집니다.</p>
    ${
      type
        ? `<p class="notice tiny"><b>${esc(type.name)}</b> · ${esc(type.summary)}${s.institution ? ` · ${esc(s.institution.name)}` : ''}<br/>과제 ${stats.total}개 중 ${stats.done}개 완료</p>`
        : ''
    }
    <ol class="menu-list flow card">
      ${SUBSTEPS.map(
        (x) => `<li><a href="#/${x.path}">
          <span class="dot">${x.no}</span>
          <span class="grow"><b>${esc(x.title)}</b><small>${esc(x.desc)}</small></span>
          <span class="arrow" aria-hidden="true">›</span></a></li>`
      ).join('')}
    </ol>`;
  },
};
