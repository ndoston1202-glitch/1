async function mijozlarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="filter-bar">
          <input type="text" id="mijozQidiruvSahifa" class="search-input"
            placeholder="🔍 Ism yoki telefon..." oninput="mijozlarSahifaFilter()" style="min-width:220px">
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="mijozlarExcelImport()">
            <i class="fas fa-file-excel"></i> Excel import
          </button>
          <button class="btn btn-primary" onclick="mijozQosh()">
            <i class="fas fa-user-plus"></i> Yangi mijoz
          </button>
        </div>
      </div>
      <div class="card-body" id="mijozlarJadval">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await mijozlarRoyxatYukla();
}

let _barcha_mijozlar = [];

async function mijozlarRoyxatYukla() {
  try {
    _barcha_mijozlar = await apiGet('/mijozlar');
    const div = document.getElementById('mijozlarJadval');
    if (div) mijozlarJadvalKorsatish(_barcha_mijozlar);
  } catch (e) { toast(e.message, 'error'); }
}

function mijozlarSahifaFilter() {
  const q = document.getElementById('mijozQidiruvSahifa').value.toLowerCase();
  const filtrlangan = _barcha_mijozlar.filter(m =>
    (m.ism + ' ' + (m.familiya || '')).toLowerCase().includes(q) ||
    (m.telefon || '').includes(q)
  );
  mijozlarJadvalKorsatish(filtrlangan);
}

function mijozlarJadvalKorsatish(royxat) {
  const div = document.getElementById('mijozlarJadval');
  if (!div) return;
  if (!royxat.length) {
    div.innerHTML = '<div class="empty-state"><i class="fas fa-users"></i><p>Mijoz topilmadi</p></div>';
    return;
  }
  div.innerHTML = `
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th>#</th><th>Ismi</th><th>Telefon</th><th>Manzil</th>
            <th>Qarz</th><th>Sotuvlar</th><th>Yaratilgan</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>
          ${royxat.map((m, i) => `
            <tr>
              <td>${i + 1}</td>
              <td>
                <div style="display:flex;align-items:center;gap:8px">
                  <div style="width:32px;height:32px;border-radius:50%;background:#dbeafe;
                    display:flex;align-items:center;justify-content:center;
                    color:#2563eb;font-weight:700;font-size:13px;flex-shrink:0">
                    ${m.ism[0].toUpperCase()}
                  </div>
                  <div>
                    <div style="font-weight:600">${m.ism} ${m.familiya || ''}</div>
                    ${m.izoh ? `<div style="font-size:11px;color:#64748b">${m.izoh}</div>` : ''}
                  </div>
                </div>
              </td>
              <td>${m.telefon || '-'}</td>
              <td style="font-size:13px">${m.manzil || '-'}</td>
              <td>
                ${m.qarz > 0
                  ? `<span class="badge badge-danger"><i class="fas fa-exclamation-circle"></i> ${formatSum(m.qarz)}</span>`
                  : `<span class="badge badge-success">Qarzsiz</span>`}
              </td>
              <td>
                <button class="btn btn-secondary btn-sm" onclick="mijozSotuvlari(${m.id}, '${(m.ism + ' ' + (m.familiya || '')).trim().replace(/'/g,"\\'")}')">
                  <i class="fas fa-history"></i> Ko'rish
                </button>
              </td>
              <td style="font-size:12px;color:#64748b">${formatSana(m.yaratilgan)}</td>
              <td>
                <button class="btn btn-warning btn-sm btn-icon" onclick="mijozTahrir(${m.id})" title="Tahrirlash">
                  <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-danger btn-sm btn-icon" onclick="mijozOchir(${m.id},'${(m.ism + ' ' + (m.familiya || '')).trim().replace(/'/g,"\\'")}' )" title="O'chirish">
                  <i class="fas fa-trash"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:10px;color:#64748b;font-size:13px">Jami: ${royxat.length} ta mijoz</div>`;
}

// ===== MIJOZ QO'SHISH / TAHRIRLASH =====
function mijozFormKontent(m = null) {
  return `
    <form onsubmit="mijozSaqlash(event, ${m ? m.id : 'null'})">
      <div class="form-row">
        <div class="form-group">
          <label>Ismi *</label>
          <input type="text" name="ism" required value="${m ? m.ism : ''}" placeholder="Ismi">
        </div>
        <div class="form-group">
          <label>Familiyasi</label>
          <input type="text" name="familiya" value="${m ? (m.familiya || '') : ''}" placeholder="Familiyasi">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" name="telefon" value="${m ? (m.telefon || '') : ''}" placeholder="+998 90 123 45 67">
        </div>
        <div class="form-group">
          <label>Manzil</label>
          <input type="text" name="manzil" value="${m ? (m.manzil || '') : ''}" placeholder="Shahar, ko'cha">
        </div>
      </div>
      ${m ? `
        <div class="form-group">
          <label>Qarz (so'm)</label>
          <input type="number" name="qarz" min="0" value="${m.qarz || 0}">
        </div>` : ''}
      <div class="form-group">
        <label>Izoh</label>
        <input type="text" name="izoh" value="${m ? (m.izoh || '') : ''}" placeholder="Ixtiyoriy">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
}

function mijozQosh() {
  modalOch('Yangi mijoz qo\'shish', mijozFormKontent());
}

async function mijozTahrir(id) {
  try {
    const royxat = await apiGet('/mijozlar');
    const m = royxat.find(x => x.id == id);
    if (!m) return;
    modalOch('Mijozni tahrirlash', mijozFormKontent(m));
  } catch (e) { toast(e.message, 'error'); }
}

async function mijozSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const data = {
    ism: form.ism.value,
    familiya: form.familiya.value,
    telefon: form.telefon.value,
    manzil: form.manzil.value,
    izoh: form.izoh.value,
    qarz: form.qarz ? parseFloat(form.qarz.value) || 0 : 0
  };
  try {
    if (id) { await apiPut('/mijozlar/' + id, data); toast('Mijoz yangilandi!'); }
    else { await apiPost('/mijozlar', data); toast('Mijoz qo\'shildi!'); }
    modalYop();
    mijozlarRoyxatYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function mijozOchir(id, nomi) {
  tasdiqlash(`"${nomi}" mijozini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/mijozlar/' + id);
      toast('Mijoz o\'chirildi!');
      mijozlarRoyxatYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ===== MIJOZ SOTUVLAR TARIXI =====
async function mijozSotuvlari(id, nomi) {
  try {
    const data = await apiGet('/mijozlar/' + id);
    const sotuvlar = data.sotuvlar || [];
    const kontent = `
      <div style="margin-bottom:12px;display:flex;gap:12px;flex-wrap:wrap">
        <div class="stat-card" style="flex:1;min-width:120px">
          <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info">
            <h3>${sotuvlar.length}</h3><p>Jami sotuvlar</p>
          </div>
        </div>
        <div class="stat-card" style="flex:1;min-width:120px">
          <div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info">
            <h3>${formatSum(sotuvlar.reduce((s, x) => s + x.jami_summa, 0))}</h3><p>Jami summa</p>
          </div>
        </div>
        <div class="stat-card" style="flex:1;min-width:120px">
          <div class="stat-icon red"><i class="fas fa-credit-card"></i></div>
          <div class="stat-info">
            <h3>${formatSum(data.qarz)}</h3><p>Qarz</p>
          </div>
        </div>
      </div>
      ${sotuvlar.length ? `
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Chek</th><th>Summa</th><th>To'lov</th><th>Sana</th></tr></thead>
            <tbody>
              ${sotuvlar.map(s => `
                <tr>
                  <td><span class="badge badge-info">${s.chek_raqam}</span></td>
                  <td><b>${formatSum(s.jami_summa)}</b></td>
                  <td><span class="badge ${s.tolov_turi === 'naqd' ? 'badge-success' : s.tolov_turi === 'karta' ? 'badge-info' : 'badge-danger'}">
                    ${s.tolov_turi === 'naqd' ? '💵 Naqd' : s.tolov_turi === 'karta' ? '💳 Karta' : '📋 Qarz'}
                  </span></td>
                  <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
                </tr>`).join('')}
            </tbody>
          </table>
        </div>` :
        '<div class="empty-state"><i class="fas fa-receipt"></i><p>Bu mijozda sotuv yo\'q</p></div>'}`;
    modalOch(`${nomi} — Sotuv tarixi`, kontent);
  } catch (e) { toast(e.message, 'error'); }
}

// ===== EXCEL (CSV) IMPORT — MIJOZLAR =====
function mijozlarExcelImport() {
  const kontent = `
    <div>
      <!-- Shablon yuklab olish -->
      <div style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#1d4ed8">
          <i class="fas fa-download"></i> 1-qadam: Shablonni yuklab oling
        </div>
        <p style="font-size:13px;color:#3b82f6;margin-bottom:8px">
          Shablon faylni yuklab oling, to'ldiring va qayta yuklang.
        </p>
        <button class="btn btn-primary btn-sm" onclick="mijozShablonYukla()">
          <i class="fas fa-file-csv"></i> CSV Shablon yuklab olish
        </button>
      </div>
      <!-- Fayl yuklash -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:12px;margin-bottom:14px">
        <div style="font-weight:600;margin-bottom:6px;color:#15803d">
          <i class="fas fa-upload"></i> 2-qadam: To'ldirilgan faylni yuklang
        </div>
        <input type="file" id="mijozCSVFayl" accept=".csv,.txt"
          style="width:100%;padding:8px;border:2px dashed #e2e8f0;border-radius:8px;background:white"
          onchange="csvFaylOqi(this,'mijozCSVMatn')">
      </div>
      <div class="form-group">
        <label style="font-weight:600">CSV mazmuni:</label>
        <textarea id="mijozCSVMatn" rows="6"
          style="width:100%;font-family:monospace;font-size:12px;border:1px solid #e2e8f0;border-radius:8px;padding:8px"
          placeholder="ism,familiya,telefon,manzil"></textarea>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-success" onclick="mijozCSVYukla()">
          <i class="fas fa-upload"></i> Import qilish
        </button>
      </div>
    </div>`;
  modalOch('Mijozlarni Excel/CSV orqali import', kontent);
}

function mijozShablonYukla() {
  const sarlavha = 'ism,familiya,telefon,manzil';
  const namunaQatorlar = [
    'Alisher,Karimov,+998901234567,Toshkent Chilonzor',
    'Bobur,Rahimov,+998901111111,Samarqand',
    'Dilnoza,Yusupova,+998902222222,Namangan',
  ];
  const csvMatn = sarlavha + '\n' + namunaQatorlar.join('\n');
  const blob = new Blob(['\uFEFF' + csvMatn], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'mijozlar_shablon.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('Shablon yuklandi!', 'success');
}

async function mijozCSVYukla() {
  const csv = document.getElementById('mijozCSVMatn').value.trim();
  if (!csv) { toast('CSV matn bo\'sh!', 'warning'); return; }
  try {
    const r = await apiPost('/import/mijozlar', { csv });
    modalYop();
    toast(`✅ ${r.qoshildi} ta mijoz qo'shildi!`, 'success');
    if (r.xatolar && r.xatolar.length) {
      setTimeout(() => toast(`⚠ ${r.xatolar.length} ta xato: ${r.xatolar[0]}`, 'warning'), 3500);
    }
    mijozlarRoyxatYukla();
  } catch (e) { toast(e.message, 'error'); }
}

// CSV faylni o'qish
function csvFaylOqi(input, targetId) {