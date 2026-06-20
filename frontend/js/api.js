const API = 'http://localhost:3000/api';
let joriyFoydalanuvchi = null;

// ===== TOAST =====
function toast(xabar, tur = 'success') {
  const t = document.getElementById('toast');
  t.textContent = xabar;
  t.className = `toast ${tur}`;
  t.style.display = 'block';
  setTimeout(() => { t.style.display = 'none'; }, 3000);
}

// ===== API FUNKSIYALAR =====
async function apiGet(url) {
  const r = await fetch(API + url);
  if (!r.ok) { const e = await r.json(); throw new Error(e.xato || 'Xato yuz berdi'); }
  return r.json();
}

async function apiPost(url, data) {
  const r = await fetch(API + url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!r.ok) { const e = await r.json(); throw new Error(e.xato || 'Xato yuz berdi'); }
  return r.json();
}

async function apiPut(url, data) {
  const r = await fetch(API + url, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
  if (!r.ok) { const e = await r.json(); throw new Error(e.xato || 'Xato yuz berdi'); }
  return r.json();
}

async function apiDelete(url) {
  const r = await fetch(API + url, { method: 'DELETE' });
  if (!r.ok) { const e = await r.json(); throw new Error(e.xato || 'Xato yuz berdi'); }
  return r.json();
}

// ===== FORMAT FUNKSIYALAR =====
function formatSum(n) {
  if (n === null || n === undefined) return "0 so'm";
  return Number(n).toLocaleString('uz-UZ') + " so'm";
}

function formatSana(s) {
  if (!s) return '-';
  return new Date(s).toLocaleString('uz-UZ', { day:'2-digit', month:'2-digit', year:'numeric', hour:'2-digit', minute:'2-digit' });
}

function bugunSana() {
  return new Date().toISOString().split('T')[0];
}

// ===== MODAL =====
function modalOch(sarlavha, kontent) {
  document.getElementById('modalSarlavha').textContent = sarlavha;
  document.getElementById('modalKontent').innerHTML = kontent;
  document.getElementById('modal').style.display = 'flex';
}

function modalYop() {
  document.getElementById('modal').style.display = 'none';
}

// ===== TASDIQLASH =====
window._tasdiqlashCallback = null;
function tasdiqlash(xabar, callback) {
  window._tasdiqlashCallback = callback;
  const kontent = `
    <p style="margin-bottom:20px;font-size:15px;">${xabar}</p>
    <div class="modal-footer" style="padding:0">
      <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
      <button class="btn btn-danger" onclick="modalYop();window._tasdiqlashCallback && window._tasdiqlashCallback()">O'chirish</button>
    </div>`;
  modalOch('Tasdiqlash', kontent);
}

// ===== PAROL KO'RSATISH =====
function parolKorsatYashir() {
  const inp = document.getElementById('loginParol');
  const icon = document.getElementById('kozsatBtn');
  if (inp.type === 'password') { inp.type = 'text'; icon.className = 'fas fa-eye-slash'; }
  else { inp.type = 'password'; icon.className = 'fas fa-eye'; }
}
