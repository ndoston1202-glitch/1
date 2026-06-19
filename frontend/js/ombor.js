async function omborYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-bottom:20px">
      <!-- Inventar holati -->
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
      <!-- Kirim tarixi -->
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

async function inventarYukla() {
  const kat = document.getElementById('omborKatFilter')?.value || '';
  try {
    let url = '/mahsulotlar';
    if (kat) url += `?kategoriya=${kat}`;
    const mahsulotlar = await apiGet(url);
    const div = document.getElementById('inventarRoyxat');
    if (!mahsulotlar.length) { div.innerHTML = '<div class="empty-state"><i class="fas fa-box-open"></i><p>Mahsulot topilmadi</p></div>'; return; }
    div.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Min</th><th>Holat</th></tr></thead>
          <tbody>
            ${mahsulotlar.map(m => {
              const foiz = m.min_miqdor > 0 ? Math.min(100, Math.round(m.miqdor / m.min_miqdor * 100)) : 100;
              const klass = foiz >= 100 ? 'yaxshi' : foiz >= 50 ? 'ogohlantirish' : 'xavf';
              return `
                <tr>
                  <td>
                    <div style="font-weight:600;font-size:13px">${m.nomi}</div>
                    <div style="font-size:11px;color:#64748b">${m.kategoriya_nomi || '-'}</div>
                  </td>
                  <td><b>${m.miqdor} ${m.birlik}</b></td>
                  <td style="color:#64748b">${m.min_miqdor} ${m.birlik}</td>
                  <td>
                    <div class="progress-bar"><div class="progress-fill ${klass}" style="width:${foiz}%"></div></div>
                    <div style="font-size:11px;color:#64748b;margin-top:2px">${foiz}%</div>
                  </td>
                </tr>`;
            }).join('')}
          </tbody>
        </table>
      </div>`;
  } catch (e) { toast(e.message, 'error'); }
}

async function kirimTarixYukla() {
  const bosh = document.getElementById('omborBosh')?.value || bugunSana();
  const tug = document.getElementById('omborTugash')?.value || bugunSana();
  try {
    const kirimlar = await apiGet(`/ombor?boshlanish=${bosh}&tugash=${tug}`);
    const div = document.getElementById('kirimTarix');
    if (!kirimlar.length) { div.innerHTML = '<div class="empty-state"><i class="fas fa-inbox"></i><p>Bu sana kirim yo\'q</p></div>'; return; }
    div.innerHTML = `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Narx</th><th>Yetkazuvchi</th><th>Sana</th></tr></thead>
          <tbody>
            ${kirimlar.map(k => `
              <tr>
                <td><b style="font-size:13px">${k.mahsulot_nomi}</b></td>
                <td>${k.miqdor} ${k.birlik}</td>
                <td>${formatSum(k.kelish_narxi)}</td>
                <td style="font-size:12px">${k.yetkazuvchi || '-'}</td>
                <td style="font-size:12px;color:#64748b">${formatSana(k.sana)}</td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:8px;color:#64748b;font-size:13px">Jami: ${kirimlar.length} ta kirim</div>`;
  } catch (e) { toast(e.message, 'error'); }
}

async function kirimModalOch() {
  const mahsulotlar = await apiGet('/mahsulotlar');
  const options = mahsulotlar.map(m => `<option value="${m.id}">${m.nomi} (${m.miqdor} ${m.birlik})</option>`).join('');
  const kontent = `
    <form onsubmit="kirimSaqlash(event)">
      <div class="form-group">
        <label>Mahsulot *</label>
        <select name="mahsulot_id" required class="filter-select" style="width:100%">
          <option value="">— Tanlang —</option>${options}
        </select>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Miqdor *</label>
          <input type="number" name="miqdor" min="0.01" step="0.01" required placeholder="0">
        </div>
        <div class="form-group">
          <label>Kelish narxi (so'm)</label>
          <input type="number" name="kelish_narxi" min="0" placeholder="0">
        </div>
      </div>
      <div class="form-group">
        <label>Yetkazuvchi</label>
        <input type="text" name="yetkazuvchi" placeholder="Yetkazuvchi ismi yoki kompaniyasi">
      </div>
      <div class="form-group">
        <label>Izoh</label>
        <input type="text" name="izoh" placeholder="Ixtiyoriy izoh">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-success"><i class="fas fa-plus"></i> Kirim qilish</button>
      </div>
    </form>`;
  modalOch('Ombor kirim', kontent);
}

async function kirimSaqlash(e) {
  e.preventDefault();
  const form = e.target;
  const data = {
    mahsulot_id: parseInt(form.mahsulot_id.value),
    miqdor: parseFloat(form.miqdor.value),
    kelish_narxi: parseFloat(form.kelish_narxi.value) || 0,
    yetkazuvchi: form.yetkazuvchi.value,
    izoh: form.izoh.value,
    foydalanuvchi_id: joriyFoydalanuvchi.id
  };
  try {
    await apiPost('/ombor', data);
    toast('Kirim muvaffaqiyatli amalga oshirildi!');
    modalYop();
    omborYukla();
  } catch (e) { toast(e.message, 'error'); }
}
