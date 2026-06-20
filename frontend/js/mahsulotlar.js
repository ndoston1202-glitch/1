let mahsulotlarRoyxat = [];
let kategoriyalarRoyxat = [];
let joriySahifa = 1;
const SAHIFADAGI_SON = 20;
let omborMahsulotTab = 'mahsulotlar'; // 'mahsulotlar' yoki 'ombor'

async function mahsulotlarYukla(tab) {
  omborMahsulotTab = tab || 'mahsulotlar';
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <!-- TAB MENU -->
    <div style="display:flex;gap:8px;margin-bottom:16px;border-bottom:2px solid #e2e8f0;padding-bottom:0">
      <button onclick="mahsulotlarYukla('mahsulotlar')"
        style="padding:10px 20px;border:none;background:none;cursor:pointer;font-size:15px;font-weight:600;
        border-bottom:3px solid ${omborMahsulotTab==='mahsulotlar'?'#2563eb':'transparent'};
        color:${omborMahsulotTab==='mahsulotlar'?'#2563eb':'#64748b'};margin-bottom:-2px">
        <i class="fas fa-boxes"></i> Mahsulotlar
      </button>
      <button onclick="mahsulotlarYukla('ombor')"
        style="padding:10px 20px;border:none;background:none;cursor:pointer;font-size:15px;font-weight:600;
        border-bottom:3px solid ${omborMahsulotTab==='ombor'?'#2563eb':'transparent'};
        color:${omborMahsulotTab==='ombor'?'#2563eb':'#64748b'};margin-bottom:-2px">
        <i class="fas fa-warehouse"></i> Ombor
      </button>
    </div>
    <div id="omborMahsulotKontent"></div>`;

  if (omborMahsulotTab === 'mahsulotlar') {
    await mahsulotlarTabYukla();
  } else {
    await omborYuklaTab();
  }
}

async function mahsulotlarTabYukla() {
  document.getElementById('omborMahsulotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="filter-bar">
          <input type="text" id="mahQidiruv" class="search-input"
            placeholder="🔍 Nomi yoki shtrix kod..." oninput="mahsulotlarFilter()">
          <select id="mahKategoriya" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barcha kategoriyalar</option>
          </select>
          <select id="mahHolat" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barchasi</option>
            <option value="kam">Kam qolganlar</option>
          </select>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap">
          <button class="btn btn-secondary btn-sm" onclick="kategoriyalarBoshqar()">
            <i class="fas fa-tags"></i> Kategoriyalar
          </button>
          <button class="btn btn-secondary btn-sm" onclick="mahsulotlarExcelImport()">
            <i class="fas fa-file-excel"></i> Excel import
          </button>
          <button class="btn btn-primary" onclick="mahsulotQosh()">
            <i class="fas fa-plus"></i> Yangi mahsulot
          </button>
        </div>
      </div>
      <div class="card-body">
        <div id="mahsulotlarJadval"></div>
        <div id="mahPagination" class="pagination"></div>
      </div>
    </div>`;

  try {
    [mahsulotlarRoyxat, kategoriyalarRoyxat] = await Promise.all([
      apiGet('/mahsulotlar'), apiGet('/kategoriyalar')
    ]);
    const sel = document.getElementById('mahKategoriya');
    kategoriyalarRoyxat.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    mahsulotlarKorsatish(mahsulotlarRoyxat);
  } catch (e) { toast(e.message, 'error'); }
}

async function omborYuklaTab() {
  document.getElementById('omborMahsulotKontent').innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap">
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-warehouse"></i> Inventar holati</h3>
          <div style="display:flex;gap:8px">
            <select id="omborKatFilter" class="filter-select" onchange="inventarYukla()">
              <option value="">Barcha kategoriyalar</option>
            </select>
            <button class="btn btn-primary btn-sm" onclick="kirimModalOch()"><i class="fas fa-plus"></i> Kirim</button>
          </div>
        </div>
        <div class="card-body" id="inventarRoyxat">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
        </div>
      </div>
      <div class="card">
        <div class="card-header">
          <h3><i class="fas fa-history"></i> Kirim tarixi</h3>
          <div class="filter-bar">
            <input type="date" id="omborBosh" class="search-input" style="width:140px" value="${bugunSana()}" onchange="kirimTarixYukla()">
            <input type="date" id="omborTugash" class="search-input" style="width:140px" value="${bugunSana()}" onchange="kirimTarixYukla()">
          </div>
        </div>
        <div class="card-body" id="kirimTarix">
          <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
        </div>
      </div>
    </div>`;

  try {
    const kategoriyalar = await apiGet('/kategoriyalar');
    const sel = document.getElementById('omborKatFilter');
    kategoriyalar.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    await Promise.all([inventarYukla(), kirimTarixYukla()]);
  } catch (e) { toast(e.message, 'error'); }
}

function mahsulotlarFilter() {
  const q = document.getElementById('mahQidiruv').value.toLowerCase();
  const kat = document.getElementById('mahKategoriya').value;
  const holat = document.getElementById('mahHolat').value;
  let filtrlangan = mahsulotlarRoyxat.filter(m => {
    const nomMos = m.nomi.toLowerCase().includes(q) || (m.shtrix_kod || '').includes(q);
    const katMos = !kat || m.kategoriya_id == kat;
    const holatMos = holat !== 'kam' || m.miqdor <= m.min_miqdor;
    return nomMos && katMos && holatMos;
  });
  joriySahifa = 1;
  mahsulotlarKorsatish(filtrlangan);
}

function mahsulotlarKorsatish(royxat) {
  const bosh = (joriySahifa - 1) * SAHIFADAGI_SON;
  const sahifadagilar = royxat.slice(bosh, bosh + SAHIFADAGI_SON);
  const jami_sahifa = Math.ceil(royxat.length / SAHIFADAGI_SON);

  document.getElementById('mahsulotlarJadval').innerHTML = sahifadagilar.length ? `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Nomi</th><th>Kategoriya</th><th>Shtrix kod</th>
            <th>Birlik</th><th>Kelish narxi</th><th>Sotish narxi</th>
            <th>Miqdor</th><th>Holat</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${sahifadagilar.map((m, i) => `
            <tr>
              <td>${bosh + i + 1}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  ${m.rasm ? `<img src="${m.rasm}" style="width:36px;height:36px;object-fit:cover;border-radius:6px;flex-shrink:0">` : `<div style="width:36px;height:36px;background:#f1f5f9;border-radius:6px;display:flex;align-items:center;justify-content:center;flex-shrink:0"><i class="fas fa-box" style="color:#cbd5e1"></i></div>`}
                  <b>${m.nomi}</b>
                </div>
              </td>
              <td><span class="badge badge-secondary">${m.kategoriya_nomi || '-'}</span></td>
              <td style="font-family:monospace;font-size:12px">${m.shtrix_kod || '-'}</td>
              <td>${m.birlik}</td>
              <td>${formatSum(m.kelish_narxi)}</td>
              <td><b style="color:#2563eb">${formatSum(m.sotish_narxi)}</b></td>
              <td>${m.miqdor} ${m.birlik}</td>
              <td>${m.miqdor <= m.min_miqdor
                ? '<span class="badge badge-danger"><i class="fas fa-exclamation-triangle"></i> Kam</span>'
                : '<span class="badge badge-success"><i class="fas fa-check"></i> Yetarli</span>'}</td>
              <td>
                <button class="btn btn-warning btn-sm btn-icon" title="Tahrirlash"
                  onclick="mahsulotTahrir(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" title="O'chirish"
                  onclick="mahsulotOchir(${m.id},'${m.nomi.replace(/'/g,"\\'")}',${m.miqdor})">
                  <i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:10px;color:#64748b;font-size:13px">Jami: ${royxat.length} ta mahsulot</div>` :
    '<div class="empty-state"><i class="fas fa-search"></i><p>Mahsulot topilmadi</p></div>';

  let pages = '';
  if (jami_sahifa > 1) {
    if (joriySahifa > 1) pages += `<button class="page-btn" onclick="sahifaOtIndex(${joriySahifa-1})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = Math.max(1, joriySahifa-2); i <= Math.min(jami_sahifa, joriySahifa+2); i++) {
      pages += `<button class="page-btn ${i===joriySahifa?'active':''}" onclick="sahifaOtIndex(${i})">${i}</button>`;
    }
    if (joriySahifa < jami_sahifa) pages += `<button class="page-btn" onclick="sahifaOtIndex(${joriySahifa+1})"><i class="fas fa-chevron-right"></i></button>`;
  }
  document.getElementById('mahPagination').innerHTML = pages;
  window._mahsulotlarFiltrlangan = royxat;
}

function sahifaOtIndex(n) {
  joriySahifa = n;
  mahsulotlarKorsatish(window._mahsulotlarFiltrlangan || mahsulotlarRoyxat);
}

// ===== QO'SHISH / TAHRIRLASH =====
function mahsulotQosh() {
  modalOch('Yangi mahsulot qo\'shish', mahsulotFormKontent());
}

async function mahsulotTahrir(id) {
  try {
    const m = await apiGet('/mahsulotlar/' + id);
    modalOch('Mahsulotni tahrirlash', mahsulotFormKontent(m));
  } catch (e) { toast(e.message, 'error'); }
}

function mahsulotFormKontent(m = null) {
  const katOptions = kategoriyalarRoyxat.map(k =>
    `<option value="${k.id}" ${m && m.kategoriya_id == k.id ? 'selected' : ''}>${k.nomi}</option>`
  ).join('');
  const birliklar = ['dona', 'kg', 'm', 'm2', 'm3', 'litr', 'qop', 'paket', 'rulon'];
  return `
    <form onsubmit="mahsulotSaqlash(event,${m ? m.id : 'null'})">
      <div class="form-group">
        <label>Mahsulot nomi *</label>
        <input type="text" name="nomi" required value="${m ? m.nomi : ''}"
          placeholder="Masalan: Portland tsement M400">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kategoriya</label>
          <select name="kategoriya_id">
            <option value="">— Tanlang —</option>${katOptions}
          </select>
        </div>
        <div class="form-group">
          <label>Birlik *</label>
          <select name="birlik">
            ${birliklar.map(b => `<option ${m && m.birlik===b ? 'selected' : ''}>${b}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kelish narxi (so'm)</label>
          <input type="number" name="kelish_narxi" min="0" value="${m ? m.kelish_narxi : ''}">
        </div>
        <div class="form-group">
          <label>Sotish narxi (so'm) *</label>
          <input type="number" name="sotish_narxi" min="0" required value="${m ? m.sotish_narxi : ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Mavjud miqdor</label>
          <input type="number" name="miqdor" min="0" step="0.01" value="${m ? m.miqdor : '0'}">
        </div>
        <div class="form-group">
          <label>Minimum miqdor</label>
          <input type="number" name="min_miqdor" min="0" step="0.01" value="${m ? m.min_miqdor : '5'}">
        </div>
      </div>
      <div class="form-group">
        <label>Shtrix kod</label>
        <input type="text" name="shtrix_kod" value="${m ? (m.shtrix_kod || '') : ''}" placeholder="Ixtiyoriy">
      </div>
      <div class="form-group">
        <label>Tavsif</label>
        <textarea name="tavsif" rows="2" style="resize:vertical">${m ? (m.tavsif || '') : ''}</textarea>
      </div>

      <!-- RASM -->
      <div class="form-group">
        <label><i class="fas fa-image"></i> Mahsulot rasmi</label>
        <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap">
          <div id="rasmPreview" style="width:80px;height:80px;border:2px dashed #e2e8f0;border-radius:8px;
            display:flex;align-items:center;justify-content:center;overflow:hidden;background:#f8fafc;flex-shrink:0">
            ${m && m.rasm
              ? `<img src="${m.rasm}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`
              : '<i class="fas fa-image fa-2x" style="color:#cbd5e1"></i>'}
          </div>
          <div style="flex:1">
            <input type="file" id="rasmFaylInput" accept="image/*" onchange="rasmTanlash(this)"
              style="display:none">
            <button type="button" class="btn btn-secondary btn-sm" onclick="document.getElementById('rasmFaylInput').click()">
              <i class="fas fa-upload"></i> Rasm tanlash
            </button>
            ${m && m.rasm ? `<button type="button" class="btn btn-danger btn-sm" style="margin-left:6px" onclick="rasmOchir()">
              <i class="fas fa-times"></i> O'chirish
            </button>` : ''}
            <div style="font-size:11px;color:#94a3b8;margin-top:4px">PNG, JPG, JPEG (max 1MB)</div>
          </div>
        </div>
        <input type="hidden" name="rasm" id="rasmInput" value="${m ? (m.rasm || '') : ''}">
      </div>

      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
}

async function mahsulotSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {
    nomi: form.nomi.value.trim(),
    kategoriya_id: form.kategoriya_id.value || null,
    birlik: form.birlik.value,
    kelish_narxi: parseFloat(form.kelish_narxi.value) || 0,
    sotish_narxi: parseFloat(form.sotish_narxi.value),
    miqdor: parseFloat(form.miqdor.value) || 0,
    min_miqdor: parseFloat(form.min_miqdor.value) || 5,
    shtrix_kod: form.shtrix_kod.value || null,
    tavsif: form.tavsif.value,
    rasm: document.getElementById('rasmInput')?.value || null,
    foydalanuvchi_id: joriyFoydalanuvchi?.id || null
  };
  try {
    if (id) { await apiPut('/mahsulotlar/' + id, data); toast('Mahsulot yangilandi!'); }
    else { await apiPost('/mahsulotlar', data); toast('Mahsulot qo\'shildi!'); }
    modalYop();
    mahsulotlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

// ===== RASM FUNKSIYALARI =====
function rasmTanlash(input) {
  const file = input.files[0];
  if (!file) return;
  if (file.size > 1024 * 1024) { toast('Rasm 1MB dan kichik bo\'lsin!', 'warning'); return; }
  const reader = new FileReader();
  reader.onload = e => {
    const base64 = e.target.result;
    document.getElementById('rasmInput').value = base64;
    const preview = document.getElementById('rasmPreview');
    if (preview) preview.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:6px">`;
  };
  reader.readAsDataURL(file);
}

function rasmOchir() {
  document.getElementById('rasmInput').value = '';
  const preview = document.getElementById('rasmPreview');
  if (preview) preview.innerHTML = '<i class="fas fa-image fa-2x" style="color:#cbd5e1"></i>';
}

// ===== O'CHIRISH — miqdor 0 bo'lishi shart =====
function mahsulotOchir(id, nomi, miqdor) {
  if (miqdor > 0) {
    modalOch('⚠️ O\'chirib bo\'lmaydi', `
      <div style="text-align:center;padding:10px">
        <i class="fas fa-exclamation-triangle fa-3x" style="color:#f59e0b;margin-bottom:12px"></i>
        <p style="font-size:15px;margin-bottom:8px">
          <b>"${nomi}"</b> mahsulotini o'chirib bo'lmaydi!
        </p>
        <p style="color:#64748b;font-size:14px">
          Hozirgi miqdor: <b style="color:#ef4444">${miqdor}</b><br>
          O'chirishdan avval miqdorni <b>0</b> ga tushiring.
        </p>
        <div style="margin-top:16px">
          <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
          <button class="btn btn-warning" style="margin-left:8px"
            onclick="modalYop();mahsulotTahrir(${id})">
            <i class="fas fa-edit"></i> Miqdorni o'zgartirish
          </button>
        </div>
      </div>`);
    return;
  }
  tasdiqlash(`"${nomi}" mahsulotini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/mahsulotlar/' + id);
      toast('Mahsulot o\'chirildi!');
      mahsulotlarYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ===== EXCEL IMPORT (SHABLON BILAN) =====
function mahsulotlarExcelImport() {
  const kontent = `
    <div>
      <!-- Shablon yuklab olish -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#1d4ed8">
          <i class="fas fa-download"></i> 1-qadam: Shablonni yuklab oling
        </div>
        <p style="font-size:13px;color:#3b82f6;margin-bottom:8px">
          Shablon faylni yuklab oling, ma'lumotlarni to'ldiring va qayta yuklang.
        </p>
        <button class="btn btn-primary btn-sm" onclick="mahsulotShablonYukla()">
          <i class="fas fa-file-csv"></i> CSV Shablon yuklab olish
        </button>
      </div>

      <!-- Fayl yuklash -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#15803d">
          <i class="fas fa-upload"></i> 2-qadam: To'ldirilgan faylni yuklang
        </div>
        <input type="file" id="mahCSVFayl" accept=".csv,.txt"
          style="width:100%;padding:8px;border:2px dashed #e2e8f0;border-radius:8px;background:white"
          onchange="csvFaylOqi(this,'mahCSVMatn')">
      </div>

      <!-- Preview -->
      <div class="form-group">
        <label style="font-weight:600">CSV mazmuni (tekshirish yoki qo'lda kiritish):</label>
        <textarea id="mahCSVMatn" rows="7"
          style="width:100%;font-family:monospace;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;padding:8px"
          placeholder="nomi,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,kategoriya"></textarea>
      </div>

      <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:8px;padding:10px;font-size:12px;color:#92400e;margin-bottom:10px">
        <b>⚠ Eslatma:</b> Bir xil nomli mahsulotlar o'tkazib yuboriladi (duplikat himoyasi).
      </div>

      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-success" onclick="mahsulotCSVYukla()">
          <i class="fas fa-upload"></i> Import qilish
        </button>
      </div>
    </div>`;
  modalOch('Mahsulotlarni Excel/CSV orqali import', kontent);
}

function mahsulotShablonYukla() {
  // Kategoriya nomlarini olish
  const katlar = kategoriyalarRoyxat.map(k => k.nomi).join(' / ');
  const sarlavha = 'nomi,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,kategoriya';
  const namunaQatorlar = [
    `Portland tsement M400,qop,85000,95000,100,10,Tsement va qorishmalar`,
    `Armatura 12mm,m,18000,22000,500,20,Temir va metall`,
    `G'isht qizil,dona,1200,1500,1000,50,G'isht va bloklar`,
  ];
  const csvMatn = sarlavha + '\n' + namunaQatorlar.join('\n');
  const blob = new Blob(['\uFEFF' + csvMatn], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mahsulotlar_shablon.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Shablon yuklandi! Excel yoki Notepad da oching.', 'success');
}

async function mahsulotCSVYukla() {
  const csv = document.getElementById('mahCSVMatn').value.trim();
  if (!csv) { toast('CSV matn bo\'sh!', 'warning'); return; }
  try {
    const r = await apiPost('/import/mahsulotlar', { csv });
    modalYop();
    toast(`✅ ${r.qoshildi} ta mahsulot qo'shildi!`, 'success');
    if (r.xatolar && r.xatolar.length) {
      setTimeout(() => toast(`⚠ ${r.xatolar.length} ta o'tkazib yuborildi: ${r.xatolar[0]}`, 'warning'), 3500);
    }
    mahsulotlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

// CSV faylni o'qish yordamchi funksiya
function csvFaylOqi(input, targetId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    let text = e.target.result;
    // BOM ni olib tashlash
    if (text.charCodeAt(0) === 0xFEFF) text = text.slice(1);
    document.getElementById(targetId).value = text;
  };
  reader.readAsText(file, 'UTF-8');
}

// ===== KATEGORIYALAR =====
function kategoriyalarBoshqar() {
  kategoriyalarYuklaModal();
}

async function kategoriyalarYuklaModal() {
  const katlar = await apiGet('/kategoriyalar');
  const kontent = `
    <div style="margin-bottom:16px">
      <form onsubmit="kategoriyaQosh(event)" style="display:flex;gap:8px">
        <input type="text" id="yangiKat" placeholder="Kategoriya nomi"
          class="search-input" required style="flex:1">
        <button type="submit" class="btn btn-primary btn-sm">
          <i class="fas fa-plus"></i> Qo'sh
        </button>
      </form>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Nomi</th><th>Amallar</th></tr></thead>
        <tbody>
          ${katlar.map(k => `
            <tr>
              <td>${k.nomi}</td>
              <td>
                <button class="btn btn-danger btn-sm btn-icon"
                  onclick="kategoriyaOchir(${k.id},'${k.nomi.replace(/'/g,"\\'")}')">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;
  modalOch('Kategoriyalarni boshqarish', kontent);
}

async function kategoriyaQosh(e) {
  e.preventDefault();
  const nomi = document.getElementById('yangiKat').value;
  try {
    await apiPost('/kategoriyalar', { nomi });
    toast('Kategoriya qo\'shildi!');
    kategoriyalarYuklaModal();
  } catch (e) { toast(e.message, 'error'); }
}

function kategoriyaOchir(id, nomi) {
  tasdiqlash(`"${nomi}" kategoriyasini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/kategoriyalar/' + id);
      toast('Kategoriya o\'chirildi!');
      kategoriyalarYuklaModal();
    } catch (e) { toast(e.message, 'error'); }
  });
}
