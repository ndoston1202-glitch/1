let mahsulotlarRoyxat = [];
let kategoriyalarRoyxat = [];
let joriySahifa = 1;
const SAHIFADAGI_SON = 20;

async function mahsulotlarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <div class="filter-bar">
          <input type="text" id="mahQidiruv" class="search-input" placeholder="🔍 Nomi yoki shtrix kod..." oninput="mahsulotlarFilter()">
          <select id="mahKategoriya" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barcha kategoriyalar</option>
          </select>
          <select id="mahHolat" class="filter-select" onchange="mahsulotlarFilter()">
            <option value="">Barchasi</option>
            <option value="kam">Kam qolganlar</option>
          </select>
        </div>
        <div style="display:flex;gap:8px">
          <button class="btn btn-secondary btn-sm" onclick="kategoriyalarBoshqar()"><i class="fas fa-tags"></i> Kategoriyalar</button>
          <button class="btn btn-primary" onclick="mahsulotQosh()"><i class="fas fa-plus"></i> Yangi mahsulot</button>
        </div>
      </div>
      <div class="card-body">
        <div id="mahsulotlarJadval"></div>
        <div id="mahPagination" class="pagination"></div>
      </div>
    </div>`;

  try {
    [mahsulotlarRoyxat, kategoriyalarRoyxat] = await Promise.all([apiGet('/mahsulotlar'), apiGet('/kategoriyalar')]);
    const sel = document.getElementById('mahKategoriya');
    kategoriyalarRoyxat.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);
    mahsulotlarKorsatish(mahsulotlarRoyxat);
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
  const oxir = bosh + SAHIFADAGI_SON;
  const sahifadagilar = royxat.slice(bosh, oxir);
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
              <td><b>${m.nomi}</b></td>
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
                <button class="btn btn-warning btn-sm btn-icon" title="Tahrirlash" onclick="mahsulotTahrir(${m.id})"><i class="fas fa-edit"></i></button>
                <button class="btn btn-danger btn-sm btn-icon" title="O'chirish" onclick="mahsulotOchir(${m.id},'${m.nomi.replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>
    <div style="padding:10px;color:#64748b;font-size:13px">Jami: ${royxat.length} ta mahsulot</div>` :
    '<div class="empty-state"><i class="fas fa-search"></i><p>Mahsulot topilmadi</p></div>';

  // Pagination
  let pages = '';
  if (jami_sahifa > 1) {
    if (joriySahifa > 1) pages += `<button class="page-btn" onclick="sahifaOt(${joriySahifa-1},${JSON.stringify(royxat).replace(/"/g,'&quot;')})"><i class="fas fa-chevron-left"></i></button>`;
    for (let i = Math.max(1, joriySahifa-2); i <= Math.min(jami_sahifa, joriySahifa+2); i++) {
      pages += `<button class="page-btn ${i===joriySahifa?'active':''}" onclick="sahifaOtIndex(${i})">${i}</button>`;
    }
    if (joriySahifa < jami_sahifa) pages += `<button class="page-btn" onclick="sahifaOt(${joriySahifa+1},null)"><i class="fas fa-chevron-right"></i></button>`;
  }
  document.getElementById('mahPagination').innerHTML = pages;
  window._mahsulotlarFiltrlangan = royxat;
}

function sahifaOtIndex(n) { joriySahifa = n; mahsulotlarKorsatish(window._mahsulotlarFiltrlangan || mahsulotlarRoyxat); }

function mahsulotQosh() {
  const kontent = mahsulotFormKontent();
  modalOch('Yangi mahsulot qo\'shish', kontent);
}

async function mahsulotTahrir(id) {
  try {
    const m = await apiGet('/mahsulotlar/' + id);
    const kontent = mahsulotFormKontent(m);
    modalOch('Mahsulotni tahrirlash', kontent);
  } catch (e) { toast(e.message, 'error'); }
}

function mahsulotFormKontent(m = null) {
  const katOptions = kategoriyalarRoyxat.map(k => `<option value="${k.id}" ${m && m.kategoriya_id == k.id ? 'selected' : ''}>${k.nomi}</option>`).join('');
  const birliklar = ['dona', 'kg', 'm', 'm2', 'm3', 'litr', 'qop', 'paket', 'rulon'];
  return `
    <form onsubmit="mahsulotSaqlash(event,${m ? m.id : 'null'})">
      <div class="form-group">
        <label>Mahsulot nomi *</label>
        <input type="text" name="nomi" required value="${m ? m.nomi : ''}" placeholder="Masalan: Portland tsement M400">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Kategoriya</label>
          <select name="kategoriya_id"><option value="">— Tanlang —</option>${katOptions}</select>
        </div>
        <div class="form-group">
          <label>Birlik *</label>
          <select name="birlik">${birliklar.map(b => `<option ${m && m.birlik===b?'selected':''}>${b}</option>`).join('')}</select>
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
    nomi: form.nomi.value,
    kategoriya_id: form.kategoriya_id.value || null,
    birlik: form.birlik.value,
    kelish_narxi: parseFloat(form.kelish_narxi.value) || 0,
    sotish_narxi: parseFloat(form.sotish_narxi.value),
    miqdor: parseFloat(form.miqdor.value) || 0,
    min_miqdor: parseFloat(form.min_miqdor.value) || 5,
    shtrix_kod: form.shtrix_kod.value || null,
    tavsif: form.tavsif.value
  };
  try {
    if (id) { await apiPut('/mahsulotlar/' + id, data); toast('Mahsulot yangilandi!'); }
    else { await apiPost('/mahsulotlar', data); toast('Mahsulot qo\'shildi!'); }
    modalYop();
    mahsulotlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function mahsulotOchir(id, nomi) {
  tasdiqlash(`"${nomi}" mahsulotini o'chirasizmi?`, async () => {
    try { await apiDelete('/mahsulotlar/' + id); toast('Mahsulot o\'chirildi!'); mahsulotlarYukla(); }
    catch (e) { toast(e.message, 'error'); }
  });
}

function kategoriyalarBoshqar() {
  kategoriyalarYuklaModal();
}

async function kategoriyalarYuklaModal() {
  const katlar = await apiGet('/kategoriyalar');
  const kontent = `
    <div style="margin-bottom:16px">
      <form onsubmit="kategoriyaQosh(event)" style="display:flex;gap:8px">
        <input type="text" id="yangiKat" placeholder="Kategoriya nomi" class="search-input" required style="flex:1">
        <button type="submit" class="btn btn-primary btn-sm"><i class="fas fa-plus"></i> Qo'sh</button>
      </form>
    </div>
    <div class="table-wrapper">
      <table>
        <thead><tr><th>Nomi</th><th>Amallar</th></tr></thead>
        <tbody id="katJadval">
          ${katlar.map(k => `
            <tr>
              <td>${k.nomi}</td>
              <td>
                <button class="btn btn-danger btn-sm btn-icon" onclick="kategoriyaOchir(${k.id},'${k.nomi.replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button>
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
    try { await apiDelete('/kategoriyalar/' + id); toast('Kategoriya o\'chirildi!'); kategoriyalarYuklaModal(); }
    catch (e) { toast(e.message, 'error'); }
  });
}
