# 한국어교육현장실습 길잡이

경희사이버대학교 한국어교육실습 수강생용 웹앱입니다. 휴대폰과 PC에서 모두 쓸 수 있고, 홈 화면에 앱처럼 설치할 수 있습니다(PWA).

> “나에게 해당하는 정보만 보여 주고, 지금 무엇을 언제까지 어떻게 해야 하는지 알려 주는 앱”

- 접속 주소: https://khcu-korean.github.io/practicum-guide/
- 저장소: https://github.com/khcu-korean/practicum-guide

## 1. 내용 추가할 파일

내용은 **`js/data/` 폴더**에만 넣으면 됩니다. 화면 코드는 고칠 필요가 없습니다.

| 넣을 정보 | 파일 | 비고 |
|---|---|---|
| 학기, 개강일, 알림 기준일(D-7·D-3) | `js/config.js` | 학기가 바뀌면 `currentSemesterId`, `semesters`만 수정 |
| 수강 자격 기준(전체 학점, 1·3영역 과목·학점, 기타 요건) | `js/data/eligibility.js` | 현재 들어 있는 과목은 **예시** |
| 실습 유형 진단 문항, 유형 설명, 추천 규칙 | `js/data/types.js` | `match()`가 추천 규칙이며 지금은 **임시 규칙** |
| 주차별 과업, 마감일, 과제 가이드(소개·중요 사항·양식·제출 방법) | `js/data/tasks.js` | 파일 맨 위에 작성법이 있음 |
| 이수 완료 점검 추가 항목 | `js/data/tasks.js` 맨 아래 `COMPLETION_EXTRA_CHECKS` | |

### 과업 마감일 넣는 세 가지 방법
```js
due: '2026-10-17'              // ① 날짜를 직접 지정
due: { week: 7, day: 'sun' }   // ② 개강일 기준 7주차 일요일 (학기가 바뀌어도 자동 계산)
due: null, dueNote: '기관 일정에 따라 결정됩니다.'   // ③ 미정 → 학생이 날짜를 직접 입력
```

### 과업을 특정 유형에만 보이게 하기
```js
types: 'all'           // 모든 유형 공통
types: ['1', '1-1']    // 유형 1, 1-1 학생에게만 표시
```

## 2. 화면 구성

| 메뉴 | 주소 | 기능 |
|---|---|---|
| 로그인 | `#/login` | 이메일 인증 코드로 로그인 |
| 수강 자격 자가진단 | `#/eligibility` | **로그인 없이 이용 가능.** 부족한 영역·학점과 추가로 들을 과목 안내 |
| 실습 유형 진단 | `#/diagnosis` | 문항 응답 → 선택 가능한 유형 추천 → 유형 확정 |
| 홈 | `#/` | 기한 지남·마감 임박(D-day), 다음 할 일, 진행 단계, 진행률 |
| 타임라인 | `#/timeline` | 공통 과업과 유형별 과업을 합쳐 주차별로 표시, 완료 체크 |
| 과제 가이드 | `#/task/과업ID` | 소개, 중요 사항, 양식, 제출 방법·기한, 미정 마감일 입력, 메모 |
| 진행현황 | `#/progress` | 완료/미완료 구분, 진행률, 알림 켜기 |
| 이수점검 | `#/complete` | 필수 과업과 최종 확인 사항 점검 |
| 더보기 | `#/settings` | 학기 전환(학기별 기록 구분), 로그아웃 |

## 3. 내 컴퓨터에서 실행하기

```bash
cd practicum-guide
python3 -m http.server 8000
```
브라우저에서 http://localhost:8000 을 엽니다. (파일을 더블클릭해서 열면 동작하지 않습니다.)

## 4. 저장 방식(두 가지 모드)

- **로컬 체험 모드(현재 상태)**: `js/config.js`의 `supabase` 값이 비어 있으면 이 모드로 동작합니다. 실제 메일은 보내지 않고 인증 코드를 화면에 보여 주며, 기록은 그 기기의 브라우저에만 저장됩니다. 개발하거나 시연할 때 씁니다.
- **서버 모드**: Supabase(무료 요금제 있음)를 연결하면 실제 이메일 인증을 하고, 휴대폰과 PC에서 같은 기록을 볼 수 있습니다.

### Supabase 연결 방법
1. https://supabase.com 에서 프로젝트를 만듭니다.
2. SQL Editor에서 아래 SQL을 실행합니다.
   ```sql
   create table user_data (
     user_id uuid primary key references auth.users on delete cascade,
     data jsonb not null,
     updated_at timestamptz default now()
   );
   alter table user_data enable row level security;
   create policy "own row" on user_data
     for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
   ```
3. Authentication → Email Templates에서 메일 본문에 `{{ .Token }}`(6자리 코드)이 들어가도록 수정합니다.
4. Project Settings → API에서 `URL`과 `anon public key`를 복사해 `js/config.js`의 `supabase`에 넣습니다.

## 5. 배포
정적 파일만 있으므로 GitHub Pages, Netlify, Vercel 중 어디에 올려도 됩니다. 배포된 주소를 LMS 공지사항에 올리면 됩니다.

## 6. 알림
- **현재**: 앱에 접속하면 화면 상단과 홈에 D-day가 표시됩니다. 알림을 허용한 학생에게는 마감 7·3·1일 전, 당일, 기한이 지난 과업에 대해 하루 한 번 알림을 띄웁니다.
- **추후 확장**: 앱을 열지 않아도 휴대폰으로 알림이 가게 하려면 서버 모드에서 정기 작업(Supabase Edge Function + cron)을 만들어 Web Push나 이메일을 보내야 합니다. `sw.js`에 푸시 수신 코드는 미리 넣어 두었습니다.

## 폴더 구조
```
index.html          앱 진입점
manifest.json, sw.js, icons/   홈 화면 설치·알림(PWA)
css/style.css       디자인
js/config.js        학기·알림·서버 설정
js/data/            ★ 내용 데이터 (여기를 채워 나가면 됩니다)
js/store.js         로그인·저장
js/selectors.js     진행률·D-day 계산
js/notify.js        알림
js/views/           화면별 코드
```
