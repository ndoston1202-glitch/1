let _jurnalData = [];

async function jurnalYukla() {
  const bugun = bugunSana();
  const oyBoshi = bugun.slice(0, 8) + '01';
  const kontent = document.getElementById('asosiyKontent');

  kontent.innerHTML = `
    <div class="card">
      <div class="card-header" style="flex-wrap:wrap;gap:10px">
        <h3><i class="fas fa-book"></i> Operatsiyalar jurnali</h3>
        <div class="filter-bar" style="flex-wrap:wrap">
          <input type="date" id="jBosh" value="${oyBoshi}" class="search-input"
            onchange="jurnalYuklaMalumat()" style="width:140px">
          <input type="date" id="jTugash" value="${bugun}" class="search-input"
            onchange="jurnalYuklaMalumat()" style="width:140px">
          <select id="jTur" class="filter-select" onchange="jurnalYuklaMalumat()">
            <option value="barchasi">📋 Barchasi</option>
            <option value="sotuv">🛒 Sotuvlar</option>
            <option value="qaytarish">↩️ Qaytarishlar</option>
            <option value="kirim">📦 Ombor kirim</option>
            <option value="xarajat">💸 Xarajatlar</option>
            <option value="mahsulot">📦 Mahsulot o'zgarishlari</option>
          </select>
          <input type="text" id="jQidiruv" class="search-input"
            placeholder="🔍 Qidirish..." oninput="jurnalFilter()" style="width:180px">
        </div>
      </div>

      <!-- STATISTIKA KARTALAR -->
      <div style="padding:16px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:10px">
        <div id="jStat1" class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('sotuv')">
          <div class="stat-icon green"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3 id="jSotuvSon">—</h3><p>Sotuvlar</p></div>
        </div>
        <div id="jStat2" class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('qaytarish')">
          <div class="stat-icon red"><i class="fas fa-undo"></i></div>
          <div class="stat-info"><h3 id="jQaytSon">—</h3><p>Qaytarishlar</p></div>
        </div>
        <div id="jStat3" class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('kirim')">
          <div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
          <div class="stat-info"><h3 id="jKirimSon">—</h3><p>Ombor kirim</p></div>
        </div>
        <div id="jStat4" class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('xarajat')">
          <div class="stat-icon orange"><i class="fas fa-money-bill"></i></div>
          <div class="stat-info"><h3 id="jXarajatSon">—</h3><p>Xarajatlar</p></div>
        </div>
        <div class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('barchasi')">
          <div class="stat-icon purple"><i class="fas fa-list-alt"></i></div>
          <div class="stat-info"><h3 id="jJamiSon">—</h3><p>Jami operatsiya</p></div>
        </div>
        <div id="jStat5" class="stat-card" style="cursor:pointer" onclick="jurnalTurFilter('mahsulot')">
          <div class="stat-icon" style="background:linear-gradient(135deg,#8b5cf6,#c4b5fd)"><i class="fas fa-box"></i></div>
          <div class="stat-info"><h3 id="jMahsulotSon">—</h3><p>Mahsulot o'zgarish</p></div>
        </div>
      </div>

      <div class="card-body" style="padding-top:0">
        <div id="jurnalJadval">
          <div style="text-align:center;padding:40px">
            <i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i>
          </div>
        </div>
        <div id="jurnalPagination" class="pagination" style="margin-top:12px"></div>
      </div>
    </div>`;

  await jurnalYuklaMalumat();
}

let _jurnalSahifa = 1;
const JURNAL_SAHIFA_SON = 30;

async function jurnalYuklaMalumat() {
  _jurnalSahifa = 1;
  const bosh   = document.getElementById('jBosh')?.value   || bugunSana();
  const tug    = document.getElementById('jTugash')?.value || bugunSana();
  const tur    = document.getElementById('jTur')?.value    || 'barchasi';
  const div    = document.getElementById('jurnalJadval');
  if (div) div.innerHTML = '<div style="text-align:center;padding:30px"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i></div>';

  try {
    _jurnalData = await apiGet(`/jurnal?boshlanish=${bosh}&tugash=${tug}&tur=${tur}&limit=500`);
    jurnalStatKorsatish(_jurnalData);
    jurnalJadvalKorsatish(_jurnalData);
  } catch(e) { toast(e.message, 'error'); }
}

function jurnalTurFilter(tur) {
  const sel = document.getElementById('jTur');
  if (sel) { sel.value = tur; jurnalYuklaMalumat(); }
}

function jurnalFilter() {
  const q = (document.getElementById('jQidiruv')?.value || '').toLowerCase();
  const filtrlangan = _jurnalData.filter(o =>
    (o.raqam||'').toLowerCase().includes(q) ||
    (o.xodim||'').toLowerCase().includes(q) ||
    (o.mijoz_ismi||'').toLowerCase().includes(q) ||
    (o.mahsulot_nomi||'').toLowerCase().includes(q) ||
    (o.sabab||'').toLowerCase().includes(q)
  );
  _jurnalSahifa = 1;
  jurnalJadvalKorsatish(filtrlangan);
}

function jurnalStatKorsatish(data) {
  const sotuvlar   = data.filter(o => o.tur === 'sotuv');
  const qaytarish  = data.filter(o => o.tur === 'qaytarish');
  const kirimlar   = data.filter(o => o.tur === 'kirim');
  const xarajatlar = data.filter(o => o.tur === 'xarajat');

  const el = id => document.getElementById(id);
  if (el('jSotuvSon'))    el('jSotuvSon').textContent    = `${sotuvlar.length} ta`;
  if (el('jQaytSon'))     el('jQaytSon').textContent     = `${qaytarish.length} ta`;
  if (el('jKirimSon'))    el('jKirimSon').textContent    = `${kirimlar.length} ta`;
  if (el('jXarajatSon'))  el('jXarajatSon').textContent  = `${xarajatlar.length} ta`;
  if (el('jJamiSon'))     el('jJamiSon').textContent     = `${data.length} ta`;
  const mahsulotLogi = data.filter(o => ['qoshildi','tahrirlandi','ochirildi'].includes(o.tur));
  if (el('jMahsulotSon')) el('jMahsulotSon').textContent = `${mahsulotLogi.length} ta`;
}

// Tur bo'yicha badge
function turBadge(tur) {
  const m = {
    sotuv:      { bg: '#dcfce7', color: '#166534', icon: 'fa-shopping-cart',  matn: 'Sotuv'         },
    qaytarish:  { bg: '#fee2e2', color: '#991b1b', icon: 'fa-undo',           matn: 'Qaytarish'     },
    kirim:      { bg: '#dbeafe', color: '#1e40af', icon: 'fa-boxes',          matn: 'Kirim'         },
    xarajat:    { bg: '#fef3c7', color: '#92400e', icon: 'fa-money-bill',     matn: 'Xarajat'       },
    qoshildi:   { bg: '#f0fdf4', color: '#166534', icon: 'fa-plus-circle',    matn: 'Mahsulot ++'   },
    tahrirlandi:{ bg: '#eff6ff', color: '#1e40af', icon: 'fa-edit',           matn: 'Tahrirlandi'   },
    ochirildi:  { bg: '#fdf2f8', color: '#86198f', icon: 'fa-trash',          matn: 'O\'chirildi'   },
  };
  const t = m[tur] || { bg:'#f1f5f9', color:'#475569', icon:'fa-circle', matn: tur };
  return `<span style="display:inline-flex;align-items:center;gap:5px;padding:3px 10px;
    border-radius:20px;font-size:12px;font-weight:600;
    background:${t.bg};color:${t.color}">
    <i class="fas ${t.icon}" style="font-size:10px"></i> ${t.matn}
  </span>`;
}

// Summa rangi
function summaCss(tur) {
  if (tur === 'sotuv')     return 'color:#10b981;font-weight:700';
  if (tur === 'qaytarish') return 'color:#ef4444;font-weight:700';
  if (tur === 'kirim')     return 'color:#2563eb;font-weight:700';
  if (tur === 'xarajat')   return 'color:#f59e0b;font-weight:700';
  return '';
}

function summaBelgi(tur) {
  if (tur === 'sotuv')     return '+';
  if (tur === 'qaytarish') return '-';
  if (tur === 'kirim')     return '';
  if (tur === 'xarajat')   return '-';
  return '';
}

function jurnalJadvalKorsatish(data) {
  const div = document.getElementById('jurnalJadval');
  if (!div) return;

  const bosh = (_jurnalSahifa - 1) * JURNAL_SAHIFA_SON;
  const sahifadagilar = data.slice(bosh, bosh + JURNAL_SAHIFA_SON);
  const jami_sahifa = Math.ceil(data.length / JURNAL_SAHIFA_SON);

  if (!data.length) {
    div.innerHTML = `<div class="empty-state" style="padding:60px">
      <i class="fas fa-book-open fa-3x" style="opacity:0.2;margin-bottom:12px"></i>
      <p>Bu davrda operatsiya topilmadi</p>
    </div>`;
    document.getElementById('jurnalPagination').innerHTML = '';
    return;
  }

  div.innerHTML = `
    <div style="padding:8px 0 4px;color:#64748b;font-size:13px">
      Jami: <b>${data.length}</b> ta operatsiya
      ${data.length > JURNAL_SAHIFA_SON ? ` | Ko'rsatilgan: ${bosh+1}–${Math.min(bosh+JURNAL_SAHIFA_SON, data.length)}` : ''}
    </div>
    <div class="table-wrapper">
      <table>
        <thead>
          <tr>
            <th style="width:40px">#</th>
            <th>Tur</th>
            <th>Raqam</th>
            <th>Xodim</th>
            <th>Mijoz / Tavsif</th>
            <th>Summa</th>
            <th>Sana / Vaqt</th>
            <th style="width:50px"></th>
          </tr>
        </thead>
        <tbody>
          ${sahifadagilar.map((o, i) => `
            <tr style="cursor:pointer"
              onmouseover="this.style.background='#f8fafc'"
              onmouseout="this.style.background=''"
              onclick="jurnalBatafsil(${i + bosh})">
              <td style="color:#94a3b8;font-size:12px">${bosh + i + 1}</td>
              <td>${turBadge(o.tur)}</td>
              <td>
                <code style="background:#f1f5f9;padding:2px 8px;border-radius:4px;font-size:12px">
                  ${o.raqam || '-'}
                </code>
              </td>
              <td style="font-size:13px">${o.xodim || '-'}</td>
              <td style="font-size:13px;color:#475569;max-width:160px">
                ${o.tur === 'sotuv' ? `
                  <div>${o.mijoz_ismi || '<span style="color:#94a3b8">Mijozsiz</span>'}</div>
                  <div style="font-size:11px;color:#64748b">
                    <i class="fas fa-box" style="color:#10b981"></i> ${o.mahsulotlar_soni || 0} ta mahsulot
                  </div>` : ''}
                ${o.tur === 'qaytarish' ? `<span style="color:#ef4444">${o.sabab || o.mijoz_ismi || '-'}</span>` : ''}
                ${o.tur === 'kirim' ? `📦 ${o.mahsulot_nomi || ''} ${o.miqdor||''} ${o.birlik||''}` : ''}
                ${o.tur === 'xarajat' ? `💸 ${o.mahsulot_nomi || ''} <span class="badge badge-secondary" style="font-size:11px">${o.sabab||''}</span>` : ''}
                ${['qoshildi','tahrirlandi','ochirildi'].includes(o.tur) ? `
                  <div style="font-weight:600">${o.mahsulot_nomi||''}</div>
                  <div style="font-size:11px;color:#64748b">${o.izoh||o.sabab||''}</div>` : ''}
              </td>
              <td>
                ${o.tur === 'sotuv' ? `<span style="${summaCss(o.tur)}">+${formatSum(o.summa)}</span>` : ''}
                ${o.tur === 'qaytarish' ? `<span style="${summaCss(o.tur)}">-${formatSum(o.summa)}</span>` : ''}
                ${o.tur === 'kirim' ? `<span style="${summaCss(o.tur)}">${formatSum(o.summa)}</span>` : ''}
                ${o.tur === 'xarajat' ? `<span style="${summaCss(o.tur)}">-${formatSum(o.summa)}</span>` : ''}
                ${['qoshildi','tahrirlandi','ochirildi'].includes(o.tur) ? `
                  <span style="color:#8b5cf6;font-size:12px">${formatSum(o.sotish_narxi||o.summa||0)}</span>` : ''}
              </td>
              <td style="font-size:12px;color:#64748b;white-space:nowrap">
                ${formatSana(o.sana)}
              </td>
              <td>
                <button class="btn btn-secondary btn-sm btn-icon"
                  onclick="event.stopPropagation();jurnalBatafsil(${i + bosh})"
                  title="Batafsil ko'rish">
                  <i class="fas fa-eye"></i>
                </button>
              </td>
            </tr>`).join('')}
        </tbody>
      </table>
    </div>`;

  // Pagination
  const pg = document.getElementById('jurnalPagination');
  if (!pg) return;
  if (jami_sahifa <= 1) { pg.innerHTML = ''; return; }
  let pages = '';
  if (_jurnalSahifa > 1)
    pages += `<button class="page-btn" onclick="jurnalSahifaOt(${_jurnalSahifa-1})"><i class="fas fa-chevron-left"></i></button>`;
  for (let i = Math.max(1, _jurnalSahifa-2); i <= Math.min(jami_sahifa, _jurnalSahifa+2); i++)
    pages += `<button class="page-btn ${i===_jurnalSahifa?'active':''}" onclick="jurnalSahifaOt(${i})">${i}</button>`;
  if (_jurnalSahifa < jami_sahifa)
    pages += `<button class="page-btn" onclick="jurnalSahifaOt(${_jurnalSahifa+1})"><i class="fas fa-chevron-right"></i></button>`;
  pg.innerHTML = pages;
}

function jurnalSahifaOt(n) {
  _jurnalSahifa = n;
  const q = (document.getElementById('jQidiruv')?.value || '').toLowerCase();
  const data = q ? _jurnalData.filter(o =>
    (o.raqam||'').toLowerCase().includes(q) ||
    (o.xodim||'').toLowerCase().includes(q) ||
    (o.mijoz_ismi||'').toLowerCase().includes(q) ||
    (o.mahsulot_nomi||'').toLowerCase().includes(q)
  ) : _jurnalData;
  jurnalJadvalKorsatish(data);
  window.scrollTo(0, 0);
}

// ===== BATAFSIL MODAL =====
async function jurnalBatafsil(index) {
  const o = _jurnalData[index];
  if (!o) return;

  try {
    let kontent = '';

    if (o.tur === 'sotuv') {
      const s = await apiGet('/sotuvlar/' + o.id);
      kontent = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;
          background:#f0fdf4;padding:12px;border-radius:8px;margin-bottom:16px;border:1px solid #bbf7d0">
          <div><b>Chek:</b> <code>${s.chek_raqam}</code></div>
          <div><b>Kassir:</b> ${s.kassir_ismi}</div>
          <div><b>Sana:</b> ${formatSana(s.sana)}</div>
          <div><b>To'lov:</b> ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}</div>
          ${s.mijoz_ismi?`<div><b>Mijoz:</b> ${s.mijoz_ismi}</div>`:'<div><b>Mijoz:</b> <span style="color:#94a3b8">Mijozsiz</span></div>'}
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
            <tbody>${s.tafsilotlar.map((t,i)=>`
              <tr>
                <td>${i+1}</td>
                <td><b>${t.mahsulot_nomi}</b></td>
                <td>${t.miqdor} ${t.birlik}</td>
                <td>${formatSum(t.narxi)}</td>
                <td><b style="color:#10b981">${formatSum(t.jami)}</b></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px">
          ${s.chegirma>0?`<div style="display:flex;justify-content:space-between;margin-bottom:4px;color:#64748b"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>`:''}
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#10b981">
            <span>JAMI:</span><span>+${formatSum(s.jami_summa)}</span>
          </div>
        </div>`;

    } else if (o.tur === 'qaytarish') {
      const r = await apiGet('/qaytarishlar/' + o.id);
      kontent = `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;
          background:#fff1f2;padding:12px;border-radius:8px;margin-bottom:16px;border:1px solid #fecaca">
          <div><b>Raqam:</b> <code>${r.chek_raqam}</code></div>
          <div><b>Kassir:</b> ${r.kassir_ismi||'-'}</div>
          <div><b>Sana:</b> ${formatSana(r.sana)}</div>
          <div><b>Mijoz:</b> ${r.mijoz_ismi||'-'}</div>
          ${r.sabab?`<div style="grid-column:span 2"><b>Sabab:</b> <span style="color:#ef4444">${r.sabab}</span></div>`:''}
        </div>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
            <tbody>${(r.tafsilotlar||[]).map((t,i)=>`
              <tr>
                <td>${i+1}</td>
                <td><b>${t.mahsulot_nomi}</b></td>
                <td>${t.miqdor} ${t.birlik}</td>
                <td>${formatSum(t.narxi)}</td>
                <td><b style="color:#ef4444">${formatSum(t.jami)}</b></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
        <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px;
          display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#ef4444">
          <span>Qaytarish:</span><span>-${formatSum(r.jami_summa)}</span>
        </div>`;

    } else if (o.tur === 'kirim') {
      kontent = `
        <div style="background:#eff6ff;padding:16px;border-radius:8px;border:1px solid #bfdbfe;margin-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px">
            <div><b>Raqam:</b> <code>${o.raqam}</code></div>
            <div><b>Xodim:</b> ${o.xodim||'-'}</div>
            <div><b>Sana:</b> ${formatSana(o.sana)}</div>
            <div><b>Yetkazuvchi:</b> ${o.sabab||'-'}</div>
          </div>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
          <h4 style="margin-bottom:12px;font-size:14px"><i class="fas fa-box"></i> Kirim ma'lumotlari</h4>
          <table style="width:100%;font-size:14px">
            <tr style="border-bottom:1px solid #f1f5f9;padding-bottom:8px">
              <td style="color:#64748b;padding:6px 0">Mahsulot:</td>
              <td style="font-weight:600">${o.mahsulot_nomi||'-'}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:6px 0">Miqdor:</td>
              <td><b>${o.miqdor||0} ${o.birlik||''}</b></td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:6px 0">Kelish narxi:</td>
              <td>${formatSum(o.kelish_narxi)}</td>
            </tr>
            <tr>
              <td style="color:#64748b;padding:6px 0">Jami qiymat:</td>
              <td><b style="color:#2563eb;font-size:16px">${formatSum(o.summa)}</b></td>
            </tr>
          </table>
        </div>`;

    } else if (o.tur === 'xarajat') {
      kontent = `
        <div style="background:#fffbeb;padding:16px;border-radius:8px;border:1px solid #fcd34d;margin-bottom:16px">
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px">
            <div><b>Raqam:</b> <code>${o.raqam}</code></div>
            <div><b>Xodim:</b> ${o.xodim||'-'}</div>
            <div><b>Sana:</b> ${formatSana(o.sana)}</div>
            <div><b>Kategoriya:</b> <span class="badge badge-warning">${o.sabab||'-'}</span></div>
          </div>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
          <h4 style="margin-bottom:12px;font-size:14px"><i class="fas fa-money-bill"></i> Xarajat ma'lumotlari</h4>
          <table style="width:100%;font-size:14px">
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:6px 0">Nomi:</td>
              <td><b>${o.mahsulot_nomi||'-'}</b></td>
            </tr>
            <tr>
              <td style="color:#64748b;padding:6px 0">Summa:</td>
              <td><b style="color:#f59e0b;font-size:16px">-${formatSum(o.summa)}</b></td>
            </tr>
          </table>
        </div>`;

    } else if (['qoshildi','tahrirlandi','ochirildi'].includes(o.tur)) {
      const amalRangi = o.tur==='qoshildi' ? '#10b981' : o.tur==='tahrirlandi' ? '#2563eb' : '#ef4444';
      const amalIcon  = o.tur==='qoshildi' ? 'fa-plus-circle' : o.tur==='tahrirlandi' ? 'fa-edit' : 'fa-trash';
      const amalMatn  = o.tur==='qoshildi' ? 'Qo\'shildi' : o.tur==='tahrirlandi' ? 'Tahrirlandi' : 'O\'chirildi';
      kontent = `
        <div style="background:#f8fafc;padding:16px;border-radius:8px;
          border:2px solid ${amalRangi}20;margin-bottom:16px">
          <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
            <div style="width:40px;height:40px;border-radius:50%;background:${amalRangi}20;
              display:flex;align-items:center;justify-content:center">
              <i class="fas ${amalIcon}" style="color:${amalRangi};font-size:18px"></i>
            </div>
            <div>
              <div style="font-weight:700;font-size:15px">${amalMatn}</div>
              <div style="font-size:12px;color:#64748b">${formatSana(o.sana)}</div>
            </div>
          </div>
          <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px">
            <div><b>Xodim:</b> ${o.xodim||'Tizim'}</div>
            <div><b>Raqam:</b> <code style="font-size:12px">${o.raqam}</code></div>
          </div>
        </div>
        <div style="background:white;border:1px solid #e2e8f0;border-radius:8px;padding:16px">
          <h4 style="margin-bottom:12px;font-size:14px">
            <i class="fas fa-box"></i> Mahsulot ma'lumotlari
          </h4>
          <table style="width:100%;font-size:14px;border-collapse:collapse">
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:7px 0;width:40%">Nomi:</td>
              <td><b>${o.mahsulot_nomi||'-'}</b></td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:7px 0">Birlik:</td>
              <td>${o.birlik||'-'}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:7px 0">Miqdor:</td>
              <td><b>${o.miqdor||0} ${o.birlik||''}</b></td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:7px 0">Kelish narxi:</td>
              <td>${formatSum(o.kelish_narxi||0)}</td>
            </tr>
            <tr style="border-bottom:1px solid #f1f5f9">
              <td style="color:#64748b;padding:7px 0">Sotish narxi:</td>
              <td><b style="color:#2563eb">${formatSum(o.sotish_narxi||0)}</b></td>
            </tr>
            ${o.izoh||o.sabab ? `
            <tr>
              <td style="color:#64748b;padding:7px 0">Izoh:</td>
              <td style="color:#475569">${o.izoh||o.sabab||''}</td>
            </tr>` : ''}
          </table>
        </div>`;
    }

    const sarlavhalar = {
      sotuv:      `🛒 Sotuv — ${o.raqam}`,
      qaytarish:  `↩️ Qaytarish — ${o.raqam}`,
      kirim:      `📦 Ombor kirim — ${o.raqam}`,
      xarajat:    `💸 Xarajat — ${o.raqam}`,
      qoshildi:   `✅ Mahsulot qo'shildi`,
      tahrirlandi:`✏️ Mahsulot tahrirlandi`,
      ochirildi:  `🗑️ Mahsulot o'chirildi`,
    };

    modalOch(sarlavhalar[o.tur] || 'Batafsil', kontent + `
      <div class="modal-footer" style="padding:0;margin-top:16px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
      </div>`);

  } catch(e) { toast(e.message, 'error'); }
}
