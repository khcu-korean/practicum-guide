// STEP 3. 배정 결과 입력: 확정 명단에 따라 나의 실습 유형과 기관을 입력
import { PRACTICUM_TYPES, getType, instLine, termOf } from '../data/types.js';
import { sem, update, semesterId } from '../store.js';
import { esc, toast } from '../utils.js';

function institutionHTML(typeId, saved) {
  const type = getType(typeId);
  if (!type) return '';
  if (type.institutions) {
    return `
    <section class="card">
      <h2>확정된 실습 기관</h2>
      <div class="choices col">
        ${type.institutions
          .map(
            (i) => `<label class="choice"><input type="radio" name="inst" value="${i.id}" ${saved?.id === i.id ? 'checked' : ''} ${type.institutions.length === 1 ? 'checked' : ''}/>
            <span>${esc(i.name)} <small class="muted">${esc(i.location || i.region)}</small><small class="note">${esc(instLine(i, semesterId()))}${termOf(i, semesterId())?.note ? ` · ${esc(termOf(i, semesterId()).note)}` : ''}</small></span></label>`
          )
          .join('')}
      </div>
    </section>`;
  }
  return `
  <section class="card">
    <h2>직접 섭외한 실습 기관</h2>
    <label>기관명
      <input type="text" name="instName" value="${esc(saved?.id ? '' : saved?.name || '')}" placeholder="예: ○○대학교 한국어교육원" />
    </label>
    <label>소재지 (국가·지역)
      <input type="text" name="instRegion" value="${esc(saved?.id ? '' : saved?.region || '')}" placeholder="예: 서울 / 일본 도쿄" />
    </label>
    <p class="tiny muted">아직 섭외 중이면 비워 두고 나중에 입력해도 됩니다.</p>
  </section>`;
}

export default {
  title: '확정된 실습 유형 및 실습 기관 입력',
  render() {
    const s = sem();
    const typeId = s.typeId || '';
    return `
    <h1 class="page-title">STEP 3. 확정된 실습 유형 및 실습 기관 입력</h1>
    <p class="muted">학과 게시판에 확정 명단이 발표되면, 나의 실습 유형과 실습 기관을 입력하세요. 입력한 유형에 맞춰 <b>유형별 과제 타임라인</b>이 만들어집니다.</p>

    <form id="assignForm" class="stack">
      <section class="card">
        <h2>확정된 실습 유형</h2>
        <div class="choices col">
          ${PRACTICUM_TYPES.map(
            (t) => `<label class="choice"><input type="radio" name="type" value="${t.id}" ${typeId === t.id ? 'checked' : ''}/>
            <span>${esc(t.name)}<small class="note">${esc(t.summary)}</small></span></label>`
          ).join('')}
        </div>
      </section>
      <div id="instBox">${institutionHTML(typeId, s.institution)}</div>
      <button class="btn primary big" type="submit">저장하고 타임라인 보기</button>
    </form>
    <p class="tiny muted">확정 결과가 바뀌면 언제든 다시 입력할 수 있습니다. 공통 과업의 완료 기록은 그대로 유지됩니다.</p>`;
  },

  mount(root) {
    const form = root.querySelector('#assignForm');
    form.addEventListener('change', (e) => {
      if (e.target.name === 'type') {
        const s = sem();
        const keep = s.typeId === e.target.value ? s.institution : null;
        root.querySelector('#instBox').innerHTML = institutionHTML(e.target.value, keep);
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const typeId = form.querySelector('input[name=type]:checked')?.value;
      if (!typeId) return toast('확정된 실습 유형을 선택하세요.');
      const type = getType(typeId);
      let institution = null;
      if (type.institutions) {
        const id = form.querySelector('input[name=inst]:checked')?.value;
        if (!id) return toast('확정된 실습 기관을 선택하세요.');
        const i = type.institutions.find((x) => x.id === id);
        institution = { id: i.id, name: i.name, region: i.region };
      } else {
        const name = form.instName.value.trim();
        if (name) institution = { name, region: form.instRegion.value.trim() };
      }
      const cur = sem().typeId;
      if (cur && cur !== typeId && !confirm('실습 유형을 바꾸면 타임라인이 새 유형에 맞게 바뀝니다. 바꿀까요?\n(공통 과업의 완료 기록은 유지됩니다)')) return;
      update((s) => {
        s.typeId = typeId;
        s.institution = institution;
        s.assignedAt = new Date().toISOString();
      });
      toast('저장했습니다. 유형별 과제 타임라인을 확인하세요!');
      location.hash = '#/timeline';
    });
  },
};
