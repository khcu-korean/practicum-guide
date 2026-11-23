"""국립국어원 한국어교원 자격 '자주 묻는 질문'을 읽어 js/data/faq.js를 다시 만듭니다.

- 내용(분류·질문·답변)이 바뀌었을 때만 파일을 고칩니다.
- 읽기에 실패하거나 질문을 하나도 찾지 못하면 기존 파일을 그대로 두고 실패로 끝납니다.
사용: python scripts/update_faq.py  (저장소 최상위 폴더에서 실행)
"""
import datetime, html, json, os, re, sys, time, urllib.request

BASE = 'https://klp.korean.go.kr/certif'
CATS = {'001': '학위과정', '002': '비학위과정', '003': '경력 및 승급', '004': '심사신청 및 기타'}
OUT = os.path.join('js', 'data', 'faq.js')
UA = {'User-Agent': 'Mozilla/5.0 (FAQ sync for a course guide app)'}


def get(url, tries=5):
    for n in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=30) as r:
                return r.read().decode('utf-8', 'replace')
        except Exception as e:  # 연결이 끊기면 잠시 쉬었다가 다시 시도
            print(f'retry {n + 1}: {url} ({type(e).__name__})', flush=True)
            time.sleep(3 * (n + 1))
    raise RuntimeError(f'읽기 실패: {url}')


def to_text(h):
    h = re.sub(r'<a\s[^>]*href="([^"]+)"[^>]*>(.*?)</a>',
               lambda m: m.group(2) if m.group(1) in m.group(2) else f'{m.group(2)} ({m.group(1)})', h, flags=re.S | re.I)
    h = re.sub(r'<br\s*/?>', '\n', h, flags=re.I)
    h = re.sub(r'</(p|div)\s*>', '\n', h, flags=re.I)
    h = re.sub(r'<[^>]+>', '', h)
    h = html.unescape(h).replace('\xa0', ' ').replace('　', ' ')
    text = '\n'.join(re.sub(r'[ \t]+', ' ', l).strip() for l in h.split('\n'))
    return re.sub(r'\n{3,}', '\n\n', text).strip()


def fetch():
    items, seen = [], set()
    for grp, name in CATS.items():
        for page in range(1, 21):
            h = get(f'{BASE}/faq/list?grp={grp}&searchType=&keyword=&pageNo={page}')
            found = re.findall(r'title="([^"]*)" class="accordion-button" type="button" data-id="(\d+)"', h)
            new = [(q, i) for q, i in found if i not in seen]
            if not new:
                break
            for q, i in new:
                seen.add(i)
                items.append({'category': name, 'q': html.unescape(q).strip(), 'id': i})
            time.sleep(0.5)
    for it in items:
        it['a'] = to_text(get(f"{BASE}/faq/preview/{it['id']}"))
        time.sleep(0.8)
    return [{'category': x['category'], 'q': x['q'], 'a': x['a'], 'id': x['id']} for x in items]


def current():
    if not os.path.exists(OUT):
        return None
    m = re.search(r'export const FAQ = (\[.*\]);', open(OUT, encoding='utf-8').read(), re.S)
    return json.loads(m.group(1)) if m else None


def write(items):
    today = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=9))).strftime('%Y-%m-%d')
    js = f"""// =====================================================================
// 자주 묻는 질문 (국립국어원 한국어교원 자격 FAQ)
// 출처: 국립국어원 한국어교원 자격 '자주 묻는 질문' https://klp.korean.go.kr/certif/faq/list
// 이 파일은 scripts/update_faq.py가 매주 자동으로 다시 만듭니다. 직접 고치면 다음 업데이트 때 덮어써집니다.
// 항목 구조: {{ category: '분류', q: '질문', a: '답변 (줄바꿈은 \\n)', id: '원문 번호' }}
// =====================================================================

export const FAQ_SOURCE = {{
  name: '국립국어원 한국어교원 자격 자주 묻는 질문',
  url: 'https://klp.korean.go.kr/certif/faq/list',
  updated: '{today}',
}};

export const FAQ = {json.dumps(items, ensure_ascii=False, indent=2)};
"""
    open(OUT, 'w', encoding='utf-8').write(js)


def main():
    items = fetch()
    if not items or any(not x['a'] for x in items):
        print('질문이나 답변을 읽지 못해 기존 내용을 유지합니다.')
        sys.exit(1)
    if items == current():
        print(f'변경 없음 ({len(items)}개)')
        return
    write(items)
    print(f'업데이트함 ({len(items)}개)')


if __name__ == '__main__':
    main()
