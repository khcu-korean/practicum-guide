// STEP 3. 확정된 실습 유형 및 실습 기관 입력
// 유형 이름 아래에 기관이 나열되어 있어, 학생은 기관명만 보고 고르면 유형이 함께 정해집니다.
// 유형 2·3(직접 섭외)은 유형을 고른 뒤 기관명을 직접 입력합니다.
import { PRACTICUM_TYPES, getType, instLine, termOf } from '../data/types.js';
import { sem, update, semesterId } from '../store.js';
import { esc, toast } from '../utils.js';
import { typeGuideHTML } from './typeGuide.js';

// 선택 값: 지정 기관은 기관 id, 직접 섭외는 'self:2' / 'self:3'
function currentValue(s) {
  if (!s.typeId) return '';
  const type = getType(s.typeId);
  return type?.institutions ? s.institution?.id || '' : `self:${s.typeId}`;
}

function selfInputs(saved) {
  return `
  <div class="self-inputs">
    <label>기관명
      <input type="text" name="instName" value="${esc(saved?.name || '')}" placeholder="예: ○○대학교 한국어교육원" />
    </label>
    <label>소재지 (국가·지역)
      <input type="text" name="instRegion" value="${esc(saved?.region || '')}" placeholder="예: 서울 / 일본 도쿄" />
    </label>
    <p class="tiny muted">아직 섭외 중이면 비워 두고 나중에 입력해도 됩니다.</p>
  </div>`;
}

export default {
  title: '확정된 실습 유형 및 실습 기관 입력',
  render() {
    const s = sem();
    const value = currentValue(s);
    const savedSelf = s.institution && !s.institution.id ? s.institution : null;
    const sem_ = semesterId();
    return `
    <h1 class="page-title">STEP 3. 확정된 실습 유형 및 실습 기관 입력</h1>
    <p class="muted">학과 게시판에 확정 명단이 발표되면, 나의 <b>실습 기관</b>을 고르세요. 기관을 고르면 유형도 함께 정해지고, 그 유형에 맞춰 <b>유형별 과제 타임라인</b>이 만들어집니다.</p>

    ${typeGuideHTML()}
    <form id="assignForm" class="stack">
      ${PRACTICUM_TYPES.map((t) => {
        const head = `<h2>${esc(t.name)}<small>${esc(t.summary)}</small></h2>`;
        if (t.institutions) {
          return `<section class="card">${head}
            <div class="choices col">
              ${t.institutions
                .map((i) => {
                  const term = termOf(i, sem_);
                  return `<label class="choice"><input type="radio" name="pick" value="${i.id}" ${value === i.id ? 'checked' : ''}/>
                  <span>${esc(i.name)} <small class="muted">${esc(i.location || i.region)}</small>
                  <small class="note">${esc(instLine(i, sem_))}${term?.note ? ` · ${esc(term.note)}` : ''}</small></span></label>`;
                })
                .join('')}
            </div></section>`;
        }
        const v = `self:${t.id}`;
        return `<section class="card">${head}
          <div class="choices col">
            <label class="choice"><input type="radio" name="pick" value="${v}" ${value === v ? 'checked' : ''}/>
              <span>직접 섭외한 기관에서 실습 <small class="note">${esc(t.description)}</small></span></label>
          </div>
          ${value === v ? selfInputs(savedSelf) : `<div class="self-box" data-for="${v}"></div>`}
        </section>`;
      }).join('')}
      <button class="btn primary big" type="submit">저장하고 타임라인 보기</button>
    </form>
    <p class="tiny muted">확정 결과가 바뀌면 언제든 다시 입력할 수 있습니다. 공통 과제의 완료 기록은 그대로 유지됩니다.</p>`;
  },

  mount(root) {
    const form = root.querySelector('#assignForm');
    // 직접 섭외를 고르면 그 유형 아래에 기관명 입력 칸을 보여 줌
    form.addEventListener('change', (e) => {
      if (e.target.name !== 'pick') return;
      form.querySelectorAll('.self-inputs').forEach((el) => {
        el.outerHTML = `<div class="self-box"></div>`;
      });
      if (e.target.value.startsWith('self:')) {
        const box = e.target.closest('section').querySelector('.self-box');
        const s = sem();
        const keep = `self:${s.typeId}` === e.target.value ? s.institution : null;
        if (box) box.outerHTML = selfInputs(keep);
      }
    });
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const value = form.querySelector('input[name=pick]:checked')?.value;
      if (!value) return toast('확정된 실습 기관(유형)을 선택하세요.');
      let typeId;
      let institution = null;
      if (value.startsWith('self:')) {
        typeId = value.slice(5);
        const name = form.querySelector('input[name=instName]')?.value.trim();
        if (name) institution = { name, region: form.querySelector('input[name=instRegion]')?.value.trim() || '' };
      } else {
        const type = PRACTICUM_TYPES.find((t) => t.institutions?.some((i) => i.id === value));
        const i = type.institutions.find((x) => x.id === value);
        typeId = type.id;
        institution = { id: i.id, name: i.name, region: i.region };
      }
      const cur = sem().typeId;
      if (cur && cur !== typeId && !confirm('실습 유형이 바뀌면 타임라인이 새 유형에 맞게 바뀝니다. 바꿀까요?\n(공통 과제의 완료 기록은 유지됩니다)')) return;
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
