let kassaMahsulotlar = [];
let chekMahsulotlar = [];
let tanlangan_mijoz = null; // { id, ism, familiya, telefon }

async function kassaYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="kassa-wrapper">
      <!-- CHAP: Mahsulotlar -->
      <div class="kassa-mahsulotlar">
        <div class="card" style="margin-bottom:12px">
          <div class="card-body" style="padding:12px">
            <div class="filter-bar">
              <input type="text" id="kassaQidiruv" class="search-input"
                placeholder="🔍 Mahsulot qidirish..." oninput="kassaMahsulotFilter()" style="flex:1">
              <select id="kassaKat" class="filter-select" onchange="kassaMahsulotFilter()">
                <option value="">Barcha kategoriyalar</option>
              </select>
            </div>
          </div>
        </div>
        <div id="kassaMahsulotGrid" class="mahsulot-grid"></div>
      </div>

      <!-- O'NG: Chek -->
      <div class="kassa-chek">
        <div class="chek-header">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3><i class="fas fa-receipt"></i> Joriy chek</h3>
            <button class="btn btn-secondary btn-sm" onclick="chekTozala()">
              <i class="fas fa-times"></i> Tozala
            </button>
          </div>
        </div>

        <div class="chek-items" id="chekItems">
          <div class="empty-state" style="padding:30px">
            <i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p>
          </div>
        </div>

        <div class="chek-footer">
          <!-- MIJOZ TANLASH -->
          <div style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#f8fafc">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600;color:#475569">
                <i class="fas fa-user"></i> Mijoz
              </span>
              <button class="btn btn-secondary btn-sm" onclick="mijozTanlash()">
                <i class="fas fa-search"></i> Tanlash
              </button>
            </div>
            <div id="tanlangan_mijoz_blok">
              <span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>
            </div>
          </div>

          <div class="chek-jami-qator">
            <span>Jami:</span><span id="chekJami">0 so'm</span>
          </div>
          <div class="chek-jami-qator">
            <span>Chegirma:</span>
            <input type="number" id="chegirmaInput" min="0" placeholder="0"
              style="width:100px;text-align:right;border:1px solid #e2e8f0;border-radius:4px;padding:4px"
              oninput="chekHisoba()">
          </div>
          <div class="chek-jami-qator katta">
            <span>To'lash:</span><span id="chekYakuniy">0 so'm</span>
          </div>

          <div class="form-group" style="margin:10px 0 8px">
            <label style="font-size:13px">To'lov turi</label>
            <select id="tolovTuri" class="filter-select" style="width:100%">
              <option value="naqd">💵 Naqd pul</option>
              <option value="karta">💳 Plastik karta</option>
              <option value="qarz">📋 Qarz</option>
            </select>
          </div>

          <button class="btn btn-success"
            style="width:100%;padding:12px;font-size:15px" onclick="sotuvYakunla()">
            <i class="fas fa-check-circle"></i> Sotishni tasdiqlash
          </button>
        </div>
      </div>
    </div>`;

  try {
    const [mahsulotlar, kategoriyalar] = await Promise.all([
      apiGet('/mahsulotlar'), apiGet('/kategoriyalar')
    ]);
    kassaMahsulotlar = mahsulotlar;
    chekMahsulotlar = [];
    tanlangan_mijoz = null;
    const sel = document.getElementById('kassaKat');
    kategoriyalar.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    kassaMahsulotKorsatish(kassaMahsulotlar);
  } catch (e) { toast(e.message, 'error'); }
}

// ===== MIJOZ TANLASH MODAL =====
async function mijozTanlash() {
  const mijozlar = await apiGet('/mijozlar');
  const kontent = `
    <div style="margin-bottom:12px">
      <input type="text" id="mijozQidiruv" class="search-input" placeholder="🔍 Mijoz qidirish..."
        oninput="mijozlarFilter()" style="width:100%">
    </div>
    <div id="mijozlarRoyxat" style="max-height:350px;overflow-y:auto">
      ${mijozlarHtml(mijozlar)}
    </div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0">
      <button class="btn btn-secondary" style="width:100%" onclick="mijozniBekor()">
        <i class="fas fa-times"></i> Mijozsiz davom etish
      </button>
    </div>`;
  modalOch('Mijoz tanlash', kontent);
  window._kassaMijozlar = mijozlar;
}

function mijozlarHtml(royxat) {
  if (!royxat.length) return '<div class="empty-state"><i class="fas fa-users"></i><p>Mijoz topilmadi</p></div>';
  return royxat.map(m => `
    <div onclick="mijozniTanla(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}','${(m.telefon||'').replace(/'/g,"\\'")}','${(m.familiya||'').replace(/'/g,"\\'")}','${m.ism.replace(/'/g,"\\'")}' )"
      style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;cursor:pointer;display:flex;align-items:center;gap:10px;transition:background 0.15s"
      onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='white'">
      <div style="width:36px;height:36px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#2563eb;font-weight:700;flex-shrink:0">
        ${m.ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${m.ism} ${m.familiya||''}</div>
        <div style="font-size:12px;color:#64748b">${m.telefon||'Telefon yo\'q'}
          ${m.qarz > 0 ? `<span style="color:#ef4444;margin-left:8px">Qarz: ${formatSum(m.qarz)}</span>` : ''}
        </div>
      </div>
      <i class="fas fa-chevron-right" style="color:#94a3b8"></i>
    </div>`).join('');
}

function mijozlarFilter() {
  const q = document.getElementById('mijozQidiruv').value.toLowerCase();
  const filtrlangan = (window._kassaMijozlar||[]).filter(m =>
    (m.ism+' '+(m.familiya||'')).toLowerCase().includes(q) ||
    (m.telefon||'').includes(q)
  );
  document.getElementById('mijozlarRoyxat').innerHTML = mijozlarHtml(filtrlangan);
}

function mijozniTanla(id, toliqIsm, telefon, familiya, ism) {
  tanlangan_mijoz = { id, ism, familiya, telefon, toliqIsm };
  document.getElementById('tanlangan_mijoz_blok').innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;justify-content:center;color:#2563eb;font-weight:700;font-size:12px">
        ${ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${toliqIsm}</div>
        ${telefon ? `<div style="font-size:11px;color:#64748b">${telefon}</div>` : ''}
      </div>
      <button class="btn btn-secondary btn-sm btn-icon" onclick="mijozniBekor()" title="Olib tashlash">
        <i class="fas fa-times"></i>
      </button>
    </div>`;
  modalYop();
}

function mijozniBekor() {
  tanlangan_mijoz = null;
  document.getElementById('tanlangan_mijoz_blok').innerHTML =
    '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
  modalYop();
}

// ===== MAHSULOT FILTR =====
function kassaMahsulotFilter() {
  const q = document.getElementById('kassaQidiruv').value.toLowerCase();
  const kat = document.getElementById('kassaKat').value;
  const filtrlangan = kassaMahsulotlar.filter(m => {
    const nomMos = m.nomi.toLowerCase().includes(q) || (m.shtrix_kod||'').includes(q);
    const katMos = !kat || m.kategoriya_id == kat;
    return nomMos && katMos;
  });
  kassaMahsulotKorsatish(filtrlangan);
}

function kassaMahsulotKorsatish(royxat) {
  const grid = document.getElementById('kassaMahsulotGrid');
  if (!royxat.length) {
    grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Mahsulot topilmadi</p></div>';
    return;
  }
  grid.innerHTML = royxat.map(m => `
    <div class="mahsulot-karta ${m.miqdor <= 0 ? 'kam' : ''}" onclick="chekGaQosh(${m.id})">
      <h4>${m.nomi}</h4>
      <div class="narxi">${formatSum(m.sotish_narxi)}</div>
      <div class="miqdor">Mavjud: ${m.miqdor} ${m.birlik}</div>
      ${m.miqdor <= 0 ? '<div style="color:#ef4444;font-size:11px;margin-top:4px">⚠ Tugagan</div>' : ''}
    </div>`).join('');
}

// ===== CHEK =====
function chekGaQosh(mahsulot_id) {
  const m = kassaMahsulotlar.find(x => x.id == mahsulot_id);
  if (!m || m.miqdor <= 0) { toast('Bu mahsulot omborda tugagan!', 'warning'); return; }
  const mavjud = chekMahsulotlar.find(x => x.mahsulot_id == mahsulot_id);
  if (mavjud) {
    if (mavjud.miqdor >= m.miqdor) { toast('Omborda yetarli mahsulot yo\'q!', 'warning'); return; }
    mavjud.miqdor += 1;
  } else {
    chekMahsulotlar.push({
      mahsulot_id: m.id, nomi: m.nomi,
      narxi: m.sotish_narxi, miqdor: 1,
      birlik: m.birlik, max: m.miqdor
    });
  }
  chekKorsatish();
}

function chekKorsatish() {
  const div = document.getElementById('chekItems');
  if (!chekMahsulotlar.length) {
    div.innerHTML = '<div class="empty-state" style="padding:30px"><i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p></div>';
    chekHisoba(); return;
  }
  div.innerHTML = chekMahsulotlar.map((m, i) => `
    <div class="chek-item">
      <div style="flex:1">
        <div class="chek-item-nomi">${m.nomi}</div>
        <div class="chek-item-narxi">${formatSum(m.narxi)} / ${m.birlik}</div>
      </div>
      <div class="chek-item-miqdor">
        <button onclick="chekMiqdorOzgartir(${i},-1)">−</button>
        <input type="number" value="${m.miqdor}" min="0.01" max="${m.max}" step="0.01"
          onchange="chekMiqdorSet(${i},this.value)" style="width:55px">
        <button onclick="chekMiqdorOzgartir(${i},1)">+</button>
      </div>
      <div class="chek-item-jami">${formatSum(m.narxi * m.miqdor)}</div>
      <button class="btn btn-danger btn-icon btn-sm" onclick="chekDanOchir(${i})">
        <i class="fas fa-times"></i>
      </button>
    </div>`).join('');
  chekHisoba();
}

function chekMiqdorOzgartir(i, delta) {
  const m = chekMahsulotlar[i];
  const yangi = Math.round((m.miqdor + delta) * 100) / 100;
  if (yangi <= 0) { chekDanOchir(i); return; }
  if (yangi > m.max) { toast('Omborda yetarli emas!', 'warning'); return; }
  chekMahsulotlar[i].miqdor = yangi;
  chekKorsatish();
}

function chekMiqdorSet(i, qiymat) {
  const val = parseFloat(qiymat);
  if (!val || val <= 0) { chekDanOchir(i); return; }
  if (val > chekMahsulotlar[i].max) { toast('Omborda yetarli emas!', 'warning'); return; }
  chekMahsulotlar[i].miqdor = val;
  chekKorsatish();
}

function chekDanOchir(i) {
  chekMahsulotlar.splice(i, 1);
  chekKorsatish();
}

function chekTozala() {
  chekMahsulotlar = [];
  tanlangan_mijoz = null;
  chekKorsatish();
  document.getElementById('chegirmaInput').value = '';
  document.getElementById('tanlangan_mijoz_blok').innerHTML =
    '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
}

function chekHisoba() {
  const jami = chekMahsulotlar.reduce((s, m) => s + m.narxi * m.miqdor, 0);
  const chegirma = parseFloat(document.getElementById('chegirmaInput')?.value) || 0;
  const yakuniy = Math.max(0, jami - chegirma);
  document.getElementById('chekJami').textContent = formatSum(jami);
  document.getElementById('chekYakuniy').textContent = formatSum(yakuniy);
}

async function sotuvYakunla() {
  if (!chekMahsulotlar.length) { toast('Chek bo\'sh!', 'warning'); return; }
  const chegirma = parseFloat(document.getElementById('chegirmaInput').value) || 0;
  const tolov_turi = document.getElementById('tolovTuri').value;
  const data = {
    kassir_id: joriyFoydalanuvchi.id,
    mahsulotlar: chekMahsulotlar.map(m => ({
      mahsulot_id: m.mahsulot_id, miqdor: m.miqdor, narxi: m.narxi
    })),
    chegirma,
    tolov_turi,
    mijoz_id: tanlangan_mijoz ? tanlangan_mijoz.id : null,
    mijoz_ismi: tanlangan_mijoz ? tanlangan_mijoz.toliqIsm : ''
  };
  try {
    const r = await apiPost('/sotuvlar', data);
    toast(`Sotuv muvaffaqiyatli! Chek: ${r.chek_raqam}`, 'success');
    chekChidir(r);
    const mij = tanlangan_mijoz;
    chekTozala();
    // mahsulot miqdorlarini yangilaymiz
    kassaYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function chekChidir(sotuv) {
  const chegirma = parseFloat(document.getElementById('chegirmaInput')?.value) || 0;
  const mijozNomi = tanlangan_mijoz ? tanlangan_mijoz.toliqIsm : 'Mijozsiz';
  const kontent = `
    <div class="chek-print-box" id="chekPrint">
      <h3>🏗️ Qurilish Do'koni</h3>
      <div class="chek-print-qator"><span>Chek:</span><span>${sotuv.chek_raqam}</span></div>
      <div class="chek-print-qator"><span>Kassir:</span><span>${joriyFoydalanuvchi.ism}</span></div>
      <div class="chek-print-qator"><span>Mijoz:</span><span>${mijozNomi}</span></div>
      <div class="chek-print-qator"><span>Sana:</span><span>${new Date().toLocaleString('uz-UZ')}</span></div>
      <div class="chek-print-separator"></div>
      ${chekMahsulotlar.map(m => `
        <div class="chek-print-qator"><span>${m.nomi}</span></div>
        <div class="chek-print-qator">
          <span>${m.miqdor} x ${formatSum(m.narxi)}</span>
          <span>${formatSum(m.narxi*m.miqdor)}</span>
        </div>`).join('')}
      <div class="chek-print-separator"></div>
      ${chegirma > 0 ? `<div class="chek-print-qator"><span>Chegirma:</span><span>-${formatSum(chegirma)}</span></div>` : ''}
      <div class="chek-print-qator" style="font-weight:bold;font-size:14px">
        <span>JAMI:</span><span>${formatSum(sotuv.jami_summa)}</span>
      </div>
      <div class="chek-print-separator"></div>
      <div style="text-align:center;margin-top:8px">Rahmat! Yana keling! 🙏</div>
    </div>
    <div class="modal-footer" style="padding:0;margin-top:16px">
      <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
      <button class="btn btn-primary" onclick="window.print()">
        <i class="fas fa-print"></i> Chop etish
      </button>
    </div>`;
  modalOch('Sotuv cheki', kontent);
}
