// 자주 묻는 질문: 검색 + 분류 + 펼쳐 보기
const fmtDate = (iso) => iso.replace(/^(\d{4})-(\d{2})-(\d{2})$/, (m, y, mo, d) => `${y}. ${Number(mo)}. ${Number(d)}.`);
import { FAQ, FAQ_SOURCE } from '../data/faq.js';
import { esc } from '../utils.js';
import { CONFIG } from '../config.js';

let category = '전체';
let query = '';

// 답변 속 웹 주소는 누르면 열리도록
const linkify = (t) => t.replace(/https?:\/\/[^\s)<]+/g, (u) => `<a class="link" href="${u}" target="_blank" rel="noopener">${u}</a>`);
const answerHTML = (a) =>
  esc(a)
    .split(/\n{2,}/)
    .map((p) => `<p>${linkify(p).replace(/\n/g, '<br/>')}</p>`)
    .join('');

function listHTML() {
  if (!FAQ.length) {
    return `<p class="notice">자주 묻는 질문을 준비하고 있습니다.</p>`;
  }
  const q = query.trim().toLowerCase();
  const hits = FAQ.filter((f) => (category === '전체' || f.category === category) && (!q || f.q.toLowerCase().includes(q) || f.a.toLowerCase().includes(q)));
  if (!hits.length) return `<p class="muted">'${esc(query)}'에 해당하는 질문이 없습니다. 다른 낱말로 검색해 보세요.</p>`;
  const groups = [...new Set(hits.map((f) => f.category || '기타'))];
  return groups
    .map(
      (g) => `<div class="faqcat"><p class="label">${esc(g)}</p>
      ${hits
        .filter((f) => (f.category || '기타') === g)
        .map((f) => `<details class="qa" ${q ? 'open' : ''}><summary>${esc(f.q)}</summary><div class="ans">${answerHTML(f.a)}</div></details>`)
        .join('')}</div>`
    )
    .join('');
}

export default {
  title: '자주 묻는 질문',
  public: true,
  render() {
    const cats = ['전체', ...new Set(FAQ.map((f) => f.category || '기타'))];
    return `
    <h1 class="page-title">자주 묻는 질문</h1>
    <p class="muted">한국어교육현장실습에 대해 자주 묻는 질문입니다.${FAQ_SOURCE.updated ? ` (업데이트: ${esc(fmtDate(FAQ_SOURCE.updated))})` : ''}</p>
    ${
      FAQ.length
        ? `<div class="faqtools">
        <input type="text" id="faqq" placeholder="질문 검색 (예: 유형, 졸업, 오프라인)" value="${esc(query)}" aria-label="질문 검색" />
        <div class="seg" role="group" aria-label="분류">${cats.map((c) => `<button type="button" data-cat="${esc(c)}" aria-pressed="${c === category}">${esc(c)}</button>`).join('')}</div>
      </div>`
        : ''
    }
    <div id="faqlist">${listHTML()}</div>
    <div class="notice tiny"><b>더 궁금한 점은</b> ${esc(CONFIG.contact.label)}에게 문의하세요: ${esc(CONFIG.contact.phone)} / <a class="link" href="mailto:${esc(CONFIG.contact.email)}">${esc(CONFIG.contact.email)}</a></div>
    <p class="tiny muted">출처: ${FAQ_SOURCE.url ? `<a class="link" href="${esc(FAQ_SOURCE.url)}" target="_blank" rel="noopener">${esc(FAQ_SOURCE.name)}</a>` : esc(FAQ_SOURCE.name)}</p>`;
  },
  mount(root) {
    root.querySelector('#faqq')?.addEventListener('input', (e) => {
      query = e.target.value;
      root.querySelector('#faqlist').innerHTML = listHTML();
    });
    root.querySelectorAll('[data-cat]').forEach((b) =>
      b.addEventListener('click', () => {
        category = b.dataset.cat;
        root.querySelectorAll('[data-cat]').forEach((x) => x.setAttribute('aria-pressed', x === b));
        root.querySelector('#faqlist').innerHTML = listHTML();
      })
    );
  },
};
