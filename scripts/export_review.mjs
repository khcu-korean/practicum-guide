// 앱에 들어 있는 모든 정보를 펼쳐서 '내용 검토본' PDF로 만듭니다. (조교·담당자 검토용)
// 사용: node scripts/export_review.mjs  → exports/ 폴더에 PDF와 HTML이 만들어집니다.
// 보완이 필요한 곳('내용 입력 예정', '추후 안내', 정보 없음 등)은 노란색으로 표시합니다.
import { createRequire } from 'node:module';
import { mkdirSync, writeFileSync } from 'node:fs';
import { CONFIG } from '../js/config.js';
import { ELIGIBILITY as E } from '../js/data/eligibility.js';
import {
  GLOSSARY, INSTITUTIONS, DIAGNOSIS_QUESTIONS, PRACTICUM_TYPES, APPLICATION_NOTICE, VACATION_NOTE,
  TYPE_GUIDE_INTRO, DIAGNOSIS_INTRO, ATTR_LABELS, fmtWindows, APPLICATION_NOTICE_SELF,
} from '../js/data/types.js';
import { TASKS, SEQUENCES, SCHEDULE_NOTE, COMMON_GUIDE_NOTES, COMPLETION_EXTRA_CHECKS, ALL_TYPE_IDS, typesOfTask } from '../js/data/tasks.js';
import { FAQ, FAQ_SOURCE } from '../js/data/faq.js';

const require = createRequire(import.meta.url);
const today = new Date(Date.now() + 9 * 3600e3).toISOString().slice(0, 10);

// ---------- 도움 함수 ----------
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const TODO_RE = /(내용 입력 예정|양식 입력 예정|추후 안내|준비 중|예시\))/;
const todos = []; // 보완 필요 항목 모음
const mark = (text, where) => {
  const t = esc(text);
  if (TODO_RE.test(text)) {
    if (where) todos.push(where);
    return `<span class="todo">${t}</span>`;
  }
  return t;
};
const need = (label, where) => {
  todos.push(where);
  return `<span class="todo">${esc(label)}</span>`;
};
const termText = (terms) => {
  if (!terms?.length) return '';
  const by = {};
  terms.forEach((t) => {
    const [y, h] = t.split('-');
    (by[y] ||= []).push(h);
  });
  return Object.entries(by).map(([y, hs]) => `${y}학년 ${hs.join('·')}학기`).join(', ');
};
const weekText = (t) => {
  if (!t.due) return '';
  if (typeof t.due === 'string') return t.due;
  const s = t.start?.week;
  return s && s !== t.due.week ? `개강 후 ${s}~${t.due.week}주차` : `개강 후 ${t.due.week}주차`;
};
const typeName = (id) => PRACTICUM_TYPES.find((t) => t.id === id)?.name || `유형 ${id}`;
const list = (arr, where) => (arr?.length ? `<ul>${arr.map((x) => `<li>${mark(x, where)}</li>`).join('')}</ul>` : '');

// ---------- 1. 기본 정보 ----------
const sec0 = `
<h2>0. 기본 정보</h2>
<table>
  <tr><th>앱 이름</th><td>${esc(CONFIG.appName)} — ${esc(CONFIG.subtitle)}</td></tr>
  <tr><th>학교·학부</th><td>${esc(CONFIG.school.name)} ${esc(CONFIG.school.dept)}</td></tr>
  <tr><th>접속 주소</th><td>https://khcu-korean.github.io/practicum-guide/</td></tr>
  <tr><th>현재 운영 학기</th><td>${esc(CONFIG.semesters.find((s) => s.id === CONFIG.currentSemesterId)?.label)}</td></tr>
</table>
<h3>학기 목록 (학생이 고를 수 있는 수강 학기)</h3>
<table><tr><th>학기</th><th>개강일</th><th>학생 선택 가능</th></tr>
${CONFIG.semesters.map((s) => `<tr><td>${esc(s.label)}</td><td>${esc(s.startDate)}</td><td>${s.selectable ? '○' : '-'}</td></tr>`).join('')}
</table>`;

// ---------- 2. STEP 1 수강 자격 ----------
const P = E.practicum;
const sec1 = `
<h2>1. 수강 자격 자기점검 (STEP 1)</h2>
<p class="note">${esc(E.basisNote)} ${esc(E.disclaimer)}</p>
<h3>실습 수강 자격 기준</h3>
<table>
  <tr><th>공통</th><td>전체 이수 학점 ${E.totalCredits?.required ?? 105}학점 이상 (4학년 1학기부터 수강 가능)</td></tr>
  ${E.tracks.map((t) => `<tr><th>${esc(t.label)} (${esc(t.grade)})</th><td>직전 학기까지 1영역·3영역 합산 ${t.combinedCourses}과목(${t.combinedCredits}학점) 이상 이수</td></tr>`).join('')}
  <tr><th>영역별 최소</th><td>${P.combinedAreaIds.map((id) => E.areas.find((a) => a.id === id).no + '영역').join(', ')} 모두 최소 ${P.minCreditsPerArea}학점 이상 이수</td></tr>
</table>
<h3>과목 외 확인 요건</h3>
<table><tr><th>질문</th><th>도움말</th></tr>
${E.otherRequirements.map((o) => `<tr><td>${esc(o.label)}</td><td>${esc(o.help)}</td></tr>`).join('')}
</table>
<h3>한국어교원 자격 영역별 필수 이수 학점</h3>
<table><tr><th>영역</th><th>2급 (주전공·복수전공)</th><th>3급 (부전공)</th></tr>
${E.areas.map((a) => `<tr><td>${a.no}영역 ${esc(a.name)}</td><td>${a.cert.major}학점</td><td>${a.cert.minor}학점</td></tr>`).join('')}
<tr><th>합계</th><th>${E.areas.reduce((n, a) => n + a.cert.major, 0)}학점</th><th>${E.areas.reduce((n, a) => n + a.cert.minor, 0)}학점</th></tr>
</table>
<h3>영역별 과목</h3>
<table><tr><th>영역</th><th>과목명</th><th>학점</th><th>개설 학년·학기</th><th>비고</th></tr>
${E.areas
  .map((a) =>
    a.courses
      .map(
        (c, i) => `<tr>${i === 0 ? `<td rowspan="${a.courses.length}">${a.no}영역<br/>${esc(a.name)}</td>` : ''}<td>${esc(c.name)}</td><td>${c.credits}</td>
        <td>${c.terms?.length ? termText(c.terms) : need('정보 없음', `STEP 1: '${c.name}' 개설 학년·학기`)}</td><td>${c.common ? '기초공통' : ''}</td></tr>`
      )
      .join('')
  )
  .join('')}
</table>`;

// ---------- 3. STEP 2 유형 추천 ----------
const showIfText = (q) =>
  q.showIf
    ? Object.entries(q.showIf)
        .map(([k, v]) => {
          const src = DIAGNOSIS_QUESTIONS.find((x) => x.id === k);
          const labels = [].concat(v).map((val) => src?.options.find((o) => o.value === val)?.label || val);
          return `‘${src?.text || k}’에서 ${labels.join('/')}를 고른 경우`;
        })
        .join(', ')
    : '항상';
const sec2 = `
<h2>2. 실습 유형 추천받기 (STEP 2)</h2>
<p class="note">${esc(DIAGNOSIS_INTRO)}</p>
<h3>추천 질문</h3>
<table><tr><th>#</th><th>질문</th><th>선택지</th><th>나오는 조건</th></tr>
${DIAGNOSIS_QUESTIONS.map((q, i) => `<tr><td>${i + 1}</td><td>${esc(q.text)}</td><td>${q.options.map((o) => esc(o.label)).join(' / ')}</td><td>${esc(showIfText(q))}</td></tr>`).join('')}
</table>
<h3>알아 두면 좋은 용어</h3>
<table>${GLOSSARY.map((g) => `<tr><th>${esc(g.term)}</th><td>${mark(g.definition)}</td></tr>`).join('')}</table>
<h3>실습 유형</h3>
<p class="note">${esc(TYPE_GUIDE_INTRO)}</p>
<table><tr><th>유형</th><th>할 일</th><th>설명</th><th>기관</th></tr>
${PRACTICUM_TYPES.map(
  (t) => `<tr><td><b>${esc(t.name)}</b></td><td>${esc(t.summary)}</td><td>${mark(t.description)}</td>
  <td>${t.institutions ? (t.institutions.length ? t.institutions.map((i) => esc(i.name)).join('<br/>') : need('추후 안내', `STEP 2: ${t.name} 협력 기관`)) : '실습생이 직접 섭외'}</td></tr>`
).join('')}
</table>
<h3>협력 기관 정보</h3>
<p class="note">달 구분: 1학기 수강생은 동계 방학 1~2월·학기 중 3~6월, 2학기 수강생은 하계 방학 7~8월·학기 중 9~12월</p>
<table><tr><th>유형</th><th>기관</th><th>소재지</th><th>국내/국외</th><th>방식</th><th>요일</th><th>매년 참관 가능한 달</th><th>참관 방식</th><th>시간 구성</th><th>참고</th></tr>
${INSTITUTIONS.map(
  (i) => `<tr><td>${esc(i.type)}</td><td>${esc(i.name)}</td><td>${esc(i.location || '')}</td><td>${esc(ATTR_LABELS.region[i.region])}</td>
  <td>${esc(ATTR_LABELS.mode[i.mode])}</td><td>${esc(ATTR_LABELS.days[i.days])}</td><td>${esc(fmtWindows(i.windows || []))}</td>
  <td>${esc(i.method || '')}</td><td>${i.schedule ? esc(i.schedule) : need('정보 없음', `STEP 2: '${i.name}' 시간 구성(총 몇 시간)`)}</td><td>${esc(i.note || '')}</td></tr>`
).join('')}
</table>
<h3>추천 결과 아래 안내</h3>
<p><b>실습 신청은 이렇게 합니다</b> (유형 2 외 추천 시)</p>${list(APPLICATION_NOTICE)}
<p><b>실습 신청은 이렇게 합니다</b> (유형 2 추천 시, 1학기 기준 · 2학기는 6개월 뒤 달)</p>${list(APPLICATION_NOTICE_SELF('1'))}
<p><b>방학 중 참관을 고른 경우</b></p>${list(Object.values(VACATION_NOTE))}`;

// ---------- 4. STEP 3 과제 ----------
const seqTable = `
<table><tr><th>순서</th>${ALL_TYPE_IDS.map((id) => `<th>유형 ${id}</th>`).join('')}</tr>
${Array.from({ length: Math.max(...ALL_TYPE_IDS.map((id) => SEQUENCES[id].length)) }, (_, n) => `<tr><td>${n + 1}</td>${ALL_TYPE_IDS.map((id) => `<td>${SEQUENCES[id][n] ? esc(TASKS[SEQUENCES[id][n]].title) : ''}</td>`).join('')}</tr>`).join('')}
</table>`;
const order = [...new Set(ALL_TYPE_IDS.flatMap((id) => SEQUENCES[id]))];
const taskDetail = order
  .map((id) => {
    const t = TASKS[id];
    const g = t.guide || {};
    const types = typesOfTask(id);
    const where = `STEP 3: '${t.title}'`;
    return `
  <div class="task">
    <h4>${esc(t.title)}</h4>
    <table>
      <tr><th>해당 유형</th><td>${types.length === ALL_TYPE_IDS.length ? '모든 유형 공통' : types.map(typeName).map(esc).join(', ')}</td></tr>
      <tr><th>기한</th><td>${t.due ? esc(weekText(t)) : esc(t.dueText || '날짜 미정')}${t.due === null ? ` <span class="sub">(${esc(t.scheduleNote || SCHEDULE_NOTE[t.schedule] || '')})</span>` : ''}${t.shiftMonths ? ' <span class="sub">※ 2학기에는 글 속의 달이 6개월 뒤로 표시됨</span>' : ''}</td></tr>
      ${t.note ? `<tr><th>짧은 안내</th><td>${mark(t.note, where + ' 짧은 안내')}</td></tr>` : ''}
      <tr><th>과제 소개</th><td>${mark(g.intro || '', where + ' 과제 소개')}</td></tr>
      <tr><th>중요 사항</th><td>${g.important?.length ? list(g.important, where + ' 중요 사항') : '-'}</td></tr>
      <tr><th>작성 양식</th><td>${g.templates?.length ? g.templates.map((x) => (x.url ? `${esc(x.name)} (${esc(x.url)})` : `${esc(x.name)} ${need('파일 링크 없음', `${where} 양식 파일 링크: ${x.name}`)}`)).join('<br/>') : '-'}</td></tr>
      <tr><th>제출 방법</th><td>${mark(g.submit?.method || '', where + ' 제출 방법')}</td></tr>
      <tr><th>제출 위치</th><td>${mark(g.submit?.where || '', where + ' 제출 위치')}</td></tr>
      <tr><th>기한 설명</th><td>${mark(g.submit?.deadlineText || '', where + ' 기한 설명')}</td></tr>
    </table>
  </div>`;
  })
  .join('');
const sec3 = `
<h2>3. 실습 유형별 과제 수행 (STEP 3)</h2>
<p class="note">과제 기한은 ‘개강 후 n주차’로 안내합니다. 자세한 날짜는 반별 공지사항에서 확인하며, 학생이 ‘우리 반 날짜’를 입력하면 D-day가 표시됩니다.</p>
<h3>유형별 과제 순서</h3>${seqTable}
<h3>모든 과제에 공통으로 보이는 안내</h3>${list(COMMON_GUIDE_NOTES)}
<h3>과제별 상세 안내</h3>${taskDetail}
<h3>이수 완료 점검: 최종 확인 사항</h3>${list(COMPLETION_EXTRA_CHECKS.map((c) => c.label), 'STEP 3-라: 최종 확인 사항')}`;

// ---------- 5. FAQ ----------
const cats = [...new Set(FAQ.map((f) => f.category))];
const sec4 = `
<h2>4. 자주 묻는 질문</h2>
<p class="note">출처: ${esc(FAQ_SOURCE.name)} (${esc(FAQ_SOURCE.url)}) · 업데이트: ${esc(FAQ_SOURCE.updated || '')} · 총 ${FAQ.length}개<br/>
국립국어원 원문을 매주 자동으로 가져오므로 앱에서 직접 고치는 내용이 아닙니다. 아래는 질문 목록만 정리했습니다.</p>
${cats.map((c) => `<h4>${esc(c)} (${FAQ.filter((f) => f.category === c).length})</h4><ol>${FAQ.filter((f) => f.category === c).map((f) => `<li>${esc(f.q)}</li>`).join('')}</ol>`).join('')}`;

// ---------- 보완 필요 항목 (맨 앞) ----------
const body = sec0 + sec1 + sec2 + sec3 + sec4;
const uniqTodos = [...new Set(todos)];
const secTodo = `
<h2>보완이 필요한 항목 (${uniqTodos.length}개)</h2>
<p class="note">본문에서 <span class="todo">노란색</span>으로 표시된 곳입니다. 내용을 정리해 주시면 앱에 반영합니다.</p>
<ol class="todos">${uniqTodos.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>`;

const html = `<!DOCTYPE html><html lang="ko"><head><meta charset="utf-8"/>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700;800&display=swap"/>
<style>
  * { box-sizing: border-box; }
  body { font-family: 'Noto Sans KR', 'WenQuanYi Zen Hei', sans-serif; font-size: 9.5pt; color: #1e2430; line-height: 1.5; margin: 0; }
  h1 { font-size: 18pt; margin: 0 0 4px; color: #5c1426; }
  h2 { font-size: 13pt; margin: 22px 0 8px; padding: 6px 10px; background: #f6eaee; border-left: 4px solid #8a1538; color: #5c1426; page-break-after: avoid; }
  h3 { font-size: 11pt; margin: 14px 0 6px; color: #8a1538; page-break-after: avoid; }
  h4 { font-size: 10pt; margin: 12px 0 4px; page-break-after: avoid; }
  table { width: calc(100% - 2px); border-collapse: collapse; margin: 4px 1px 8px; page-break-inside: auto; }
  tr { page-break-inside: avoid; }
  th, td { border: 1px solid #d9d4cd; padding: 4px 6px; vertical-align: top; text-align: left; }
  th { background: #faf8f5; font-weight: 700; white-space: nowrap; }
  ul, ol { margin: 2px 0; padding-left: 18px; }
  .note { color: #667080; font-size: 8.5pt; }
  .sub { color: #667080; font-size: 8pt; }
  .todo { background: #fff3b0; padding: 0 3px; border-radius: 3px; }
  .task { page-break-inside: avoid; }
  .task table th { width: 80px; }
  .todos li { margin: 2px 0; }
  .cover p { margin: 2px 0; color: #667080; }
</style></head><body>
<div class="cover">
  <h1>${esc(CONFIG.appName)} — 내용 검토본</h1>
  <p>${esc(CONFIG.school.name)} ${esc(CONFIG.school.dept)} · 만든 날: ${today}</p>
  <p>앱에 들어 있는 모든 정보를 펼쳐서 정리했습니다. (앱의 데이터 파일에서 자동으로 뽑은 내용)</p>
</div>
${secTodo}
${body}
</body></html>`;

mkdirSync('exports', { recursive: true });
const base = `exports/실습길잡이_내용검토본_${today}`;
writeFileSync(`${base}.html`, html);

const { chromium } = require('playwright');
const browser = await chromium.launch();
const page = await browser.newPage();
await page.setContent(html, { waitUntil: 'networkidle' });
await page.pdf({
  path: `${base}.pdf`,
  format: 'A4',
  margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' },
  printBackground: true,
  displayHeaderFooter: true,
  headerTemplate: '<div></div>',
  footerTemplate: '<div style="font-size:7pt;color:#999;width:100%;text-align:center;"><span class="pageNumber"></span> / <span class="totalPages"></span></div>',
});
await browser.close();
console.log(`${base}.pdf (보완 필요 ${uniqTodos.length}개)`);
