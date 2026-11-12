// =====================================================================
// 데이터 저장소 + 로그인
//  - 로컬 체험 모드: 브라우저 localStorage에 저장 (서버 설정 전 개발/시연용)
//  - 서버 모드: Supabase 이메일 인증 + DB 저장 (휴대폰/PC 동기화)
//
// 사용자 데이터 구조:
// {
//   currentSemesterId: '2026-2',
//   semesters: {
//     '2026-2': {
//       eligibility: { input, result, at },
//       diagnosis:   { answers, recommended: ['1','1-1'], at },
//       typeId:      '1-1',              ← 확정한 실습 유형
//       tasks:       { [taskId]: { done, doneAt, customDue, memo } },
//       extraChecks: { [checkId]: true },
//     }
//   }
// }
// =====================================================================

import { CONFIG, isServerMode } from './config.js';

const LS_SESSION = 'pg:session';
const LS_DATA = (key) => `pg:data:${key}`;
const GUEST = 'guest';

let supabase = null;
let user = null; // { id, email }
let data = emptyData();
const listeners = new Set();

function emptyData() {
  return { currentSemesterId: CONFIG.currentSemesterId, semesters: {} };
}

// ---------------- 초기화 ----------------
export async function initStore() {
  if (isServerMode()) {
    const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
    supabase = createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey);
    const { data: s } = await supabase.auth.getSession();
    if (s.session) user = { id: s.session.user.id, email: s.session.user.email };
    supabase.auth.onAuthStateChange(async (_e, session) => {
      const next = session ? { id: session.user.id, email: session.user.email } : null;
      if (next?.id !== user?.id) {
        user = next;
        await loadData();
        emit();
      }
    });
  } else {
    const saved = localStorage.getItem(LS_SESSION);
    if (saved) user = JSON.parse(saved);
  }
  await loadData();
}

async function loadData() {
  if (user && supabase) {
    const { data: row } = await supabase.from('user_data').select('data').eq('user_id', user.id).maybeSingle();
    data = row?.data || emptyData();
    // 로그인 전 자격진단 결과가 있으면 이어 붙이기
    mergeGuestData();
  } else {
    const key = user ? user.email : GUEST;
    data = JSON.parse(localStorage.getItem(LS_DATA(key)) || 'null') || emptyData();
    if (user) mergeGuestData();
  }
}

function mergeGuestData() {
  const guest = JSON.parse(localStorage.getItem(LS_DATA(GUEST)) || 'null');
  if (!guest) return;
  for (const [semId, g] of Object.entries(guest.semesters || {})) {
    const s = (data.semesters[semId] ||= {});
    if (g.eligibility && !s.eligibility) s.eligibility = g.eligibility;
  }
  localStorage.removeItem(LS_DATA(GUEST));
  save();
}

let saveTimer = null;
function save() {
  clearTimeout(saveTimer);
  saveTimer = setTimeout(async () => {
    if (user && supabase) {
      await supabase.from('user_data').upsert({ user_id: user.id, data, updated_at: new Date().toISOString() });
    } else {
      localStorage.setItem(LS_DATA(user ? user.email : GUEST), JSON.stringify(data));
    }
  }, 300);
}

// ---------------- 구독 ----------------
export const subscribe = (fn) => (listeners.add(fn), () => listeners.delete(fn));
const emit = () => listeners.forEach((fn) => fn());

// ---------------- 조회/수정 ----------------
export const getUser = () => user;
export const getData = () => data;
export const semesterId = () => data.currentSemesterId || CONFIG.currentSemesterId;

export function sem() {
  const id = semesterId();
  return (data.semesters[id] ||= { tasks: {}, extraChecks: {} });
}

/** 현재 학기 데이터 수정: update(s => { s.typeId = '1' }) */
export function update(fn) {
  const s = sem();
  s.tasks ||= {};
  s.extraChecks ||= {};
  fn(s);
  save();
  emit();
}

export function setSemester(id) {
  data.currentSemesterId = id;
  save();
  emit();
}

// ---------------- 로그인 ----------------
/** 1단계: 이메일로 인증 코드 발송 */
export async function requestCode(email) {
  if (supabase) {
    const { error } = await supabase.auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
    if (error) throw error;
    return { demo: false };
  }
  // 로컬 체험 모드: 실제 메일 발송 없음 → 화면에 코드 표시
  const code = String(Math.floor(100000 + Math.random() * 900000));
  sessionStorage.setItem('pg:demoCode', JSON.stringify({ email, code }));
  return { demo: true, code };
}

/** 2단계: 코드 확인 후 로그인 */
export async function verifyCode(email, code) {
  if (supabase) {
    const { data: r, error } = await supabase.auth.verifyOtp({ email, token: code, type: 'email' });
    if (error) throw error;
    user = { id: r.user.id, email: r.user.email };
  } else {
    const demo = JSON.parse(sessionStorage.getItem('pg:demoCode') || 'null');
    if (!demo || demo.email !== email || demo.code !== code) throw new Error('인증 코드가 올바르지 않습니다.');
    user = { id: email, email };
    localStorage.setItem(LS_SESSION, JSON.stringify(user));
  }
  await loadData();
  emit();
}

export async function logout() {
  if (supabase) await supabase.auth.signOut();
  localStorage.removeItem(LS_SESSION);
  user = null;
  await loadData();
  emit();
}
