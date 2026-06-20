// ===== KASSA HISOBI =====
async function kassaHisobiYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const bugun = bugunSana();
  const oyBoshi = bugun.slice(0, 8) + '01';

  kontent.innerHTML = `
    <div style="max-width:900px">

      <!-- BALANS KARTALAR -->
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card" id="naqdKarta">
          <div class="stat-icon green"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-info">
            <h3 id="naqdBalans">—</h3>
            <p>💵 Naqd pul</p>
          </div>
        </div>
        <div class="stat-card" id="kartaKarta">
          <div class="stat-icon blue"><i class="fas fa-credit-card"></i></div>
          <div class="stat-info">
            <h3 id="kartaBalans">—</h3>
            <p>💳 Plastik karta</p>
          </div>
        </div>
        <div class="stat-card" id="qarzKarta">
          <div class="stat-icon red"><i class="fas fa-hand-holding-usd"></i></div>
          <div class="stat-info">
            <h3 id="qarzBalans">—</h3>
            <p>📋 Jami qarzlar</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="fas fa-wallet"></i></div>
          <div class="stat-info">
            <h3 id="umumiyBalans">—</h3>
            <p>💰 Umumiy balans</p>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px">

        <!-- QARZ MIJOZLAR -->
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-users" style="color:#ef4444"></i> Qarzli mijozlar</h3>
            <input type="text" id="qarzQidiruv" class="search-input"
              placeholder="🔍 Qidirish..." oninput="qarzMijozlarFilter()"
              style="width:160px">
          </div>
          <div class="card-body" id="qarzMijozlarDiv">
            <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
          </div>
        </div>

        <!-- KASSA HARAKATLARI -->
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-exchange-alt"></i> Kassa harakatlari</h3>
            <div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
              <input type="date" id="kassaHBosh" value="${oyBoshi}" class="search-input"
                onchange="kassaHarakatlariYukla()" style="width:130px">
              <input type="date" id="kassaHTugash" value="${bugun}" class="search-input"
                onchange="kassaHarakatlariYukla()" style="width:130px">
              <button class="btn btn-danger btn-sm" onclick="chiqimQosh()">
                <i class="fas fa-minus-circle"></i> Chiqim
              </button>
            </div>
          </div>
          <div class="card-body" id="kassaHarakatlariDiv">
            <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
          </div>
        </div>

      </div>
    </div>`;

  await Promise.all([kassaBalansYukla(), qarzMijozlarYukla(), kassaHarakatlariYukla()]);
}

// ===== BALANS HISOBLASH =====
async function kassaBalansYukla() {
  try {
    const [sotuvlar, xarajatlar, qaytarishlar] = await Promise.all([
      apiGet('/sotuvlar'),
      apiGet('/xarajatlar'),
      apiGet('/qaytarishlar')
    ]);

    // Naqd: naqd sotuvlar - xarajatlar - naqd qaytarishlar
    const naqdKirim  = sotuvlar.filter(s => s.tolov_turi === 'naqd').reduce((s,x) => s+x.jami_summa, 0);
    const kartaKirim = sotuvlar.filter(s => s.tolov_turi === 'karta').reduce((s,x) => s+x.jami_summa, 0);
    const qarzKirim  = sotuvlar.filter(s => s.tolov_turi === 'qarz').reduce((s,x) => s+x.jami_summa, 0);
    const xarajatJami = xarajatlar.reduce((s,x) => s+x.summa, 0);
    const qaytarishJami = qaytarishlar.reduce((s,x) => s+x.jami_summa, 0);

    const naqdBalans  = naqdKirim  - xarajatJami - qaytarishJami;
    const kartaBalans = kartaKirim;
    const qarzJami    = qarzKirim;
    const umumiy      = naqdBalans + kartaBalans;

    const el = id => document.getElementById(id);
    if (el('naqdBalans'))    el('naqdBalans').textContent    = formatSum(Math.max(0, naqdBalans));
    if (el('kartaBalans'))   el('kartaBalans').textContent   = formatSum(kartaBalans);
    if (el('qarzBalans'))    el('qarzBalans').textContent    = formatSum(qarzJami);
    if (el('umumiyBalans'))  el('umumiyBalans').textContent  = formatSum(Math.max(0, umumiy));

    // Rang
    if (el('naqdBalans'))   el('naqdBalans').style.color   = naqdBalans < 0 ? '#ef4444' : '';
    if (el('umumiyBalans')) el('umumiyBalans').style.color = umumiy < 0 ? '#ef4444' : '';

  } catch(e) { toast(e.message, 'error'); }
}

// ===== QARZLI MIJOZLAR =====
let _qarzMijozlar = [];

async function qarzMijozlarYukla() {
  try {
    const mijozlar = await apiGet('/mijozlar');
    _qarzMijozlar = mijozlar.filter(m => m.qarz > 0).sort((a,b) => b.qarz - a.qarz);
    qarzMijozlarKorsatish(_qarzMijozlar);
  } catch(e) { toast(e.message, 'error'); }
}

function qarzMijozlarFilter() {
  const q = document.getElementById('qarzQidiruv')?.value.toLowerCase() || '';
  const f = _qarzMijozlar.filter(m =>
    (m.ism+' '+(m.familiya||'')).toLowerCase().includes(q) ||
    (m.telefon||'').includes(q));
  qarzMijozlarKorsatish(f);
}

function qarzMijozlarKorsatish(royxat) {
  const div = document.getElementById('qarzMijozlarDiv');
  if (!div) return;

  if (!royxat.length) {
    div.innerHTML = `<div class="empty-state" style="padding:30px">
      <i class="fas fa-check-circle fa-2x" style="color:#10b981;margin-bottom:8px"></i>
      <p>Barcha mijozlar qarzsiz! ✅</p>
    </div>`;
    return;
  }

  const jamiQarz = royxat.reduce((s,m) => s + m.qarz, 0);
  div.innerHTML = `
    <div style="background:#fff1f2;padding:10px 14px;border-radius:8px;margin-bottom:12px;
      display:flex;justify-content:space-between;font-size:14px">
      <span><b>${royxat.length}</b> ta mijoz qarzli</span>
      <span>Jami: <b style="color:#ef4444">${formatSum(jamiQarz)}</b></span>
    </div>
    <div style="max-height:320px;overflow-y:auto">
      ${royxat.map(m => `
        <div style="display:flex;align-items:center;gap:10px;padding:10px;
          border:1px solid #fee2e2;border-radius:8px;margin-bottom:8px;background:white">
          <div style="width:36px;height:36px;border-radius:50%;background:#fee2e2;
            display:flex;align-items:center;justify-content:center;
            font-weight:700;color:#ef4444;flex-shrink:0">
            ${m.ism[0].toUpperCase()}
          </div>
          <div style="flex:1">
            <div style="font-weight:600;font-size:14px">${m.ism} ${m.familiya||''}</div>
            <div style="font-size:12px;color:#64748b">${m.telefon||'Telefon yo\'q'}</div>
          </div>
          <div style="text-align:right">
            <div style="color:#ef4444;font-weight:700;font-size:14px">${formatSum(m.qarz)}</div>
            <button class="btn btn-success btn-sm" style="font-size:11px;padding:3px 8px;margin-top:4px"
              onclick="qarzTolash(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}',${m.qarz})">
              <i class="fas fa-check"></i> To'lash
            </button>
          </div>
        </div>`).join('')}
    </div>`;
}

// ===== QARZ TO'LASH =====
function qarzTolash(mijoz_id, ism, joriyQarz) {
  modalOch(`💳 Qarz to'lash — ${ism}`, `
    <div style="background:#fff1f2;padding:12px;border-radius:8px;margin-bottom:16px;text-align:center">
      <div style="font-size:13px;color:#64748b;margin-bottom:4px">Joriy qarz:</div>
      <div style="font-size:22px;font-weight:700;color:#ef4444">${formatSum(joriyQarz)}</div>
    </div>
    <form onsubmit="qarzTolashSaqla(event,${mijoz_id},${joriyQarz})">
      <div class="form-group">
        <label style="font-weight:600">To'lov summasi *</label>
        <input type="number" id="qarzTolashSumma" name="summa" min="1" max="${joriyQarz}"
          required value="${joriyQarz}"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:16px">
        <div style="display:flex;gap:8px;margin-top:8px">
          <button type="button" class="btn btn-secondary btn-sm" style="flex:1"
            onclick="document.getElementById('qarzTolashSumma').value=${joriyQarz}">
            To'liq to'lash
          </button>
          <button type="button" class="btn btn-secondary btn-sm" style="flex:1"
            onclick="document.getElementById('qarzTolashSumma').value=${Math.round(joriyQarz/2)}">
            Yarmini to'lash
          </button>
        </div>
      </div>
      <div class="form-group">
        <label style="font-weight:600">To'lov turi</label>
        <div style="display:flex;gap:8px;margin-top:4px">
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;
            border:2px solid #e2e8f0;border-radius:8px;flex:1">
            <input type="radio" name="tolov_turi" value="naqd" checked> 💵 Naqd
          </label>
          <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 14px;
            border:2px solid #e2e8f0;border-radius:8px;flex:1">
            <input type="radio" name="tolov_turi" value="karta"> 💳 Karta
          </label>
        </div>
      </div>
      <div class="form-group">
        <label>Izoh</label>
        <input type="text" name="izoh" placeholder="Masalan: Naqd to'landi"
          style="width:100%;padding:8px;border:1px solid #e2e8f0;border-radius:8px">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-success">
          <i class="fas fa-check-circle"></i> Qarzni to'lash
        </button>
      </div>
    </form>`);
}

async function qarzTolashSaqla(e, mijoz_id, joriyQarz) {
  e.preventDefault();
  const form = e.target;
  const summa = parseFloat(form.summa.value) || 0;
  const tolov = form.querySelector('[name=tolov_turi]:checked')?.value || 'naqd';
  const izoh = form.izoh.value;

  if (summa <= 0 || summa > joriyQarz) {
    toast('Summa noto\'g\'ri!', 'warning'); return;
  }

  try {
    // Yangi qarzni hisoblash
    const yangiQarz = Math.max(0, joriyQarz - summa);

    // Mijoz qarzini yangilash
    const mijozlar = await apiGet('/mijozlar');
    const mijoz = mijozlar.find(m => m.id == mijoz_id);
    if (!mijoz) { toast('Mijoz topilmadi!', 'error'); return; }

    await apiPut('/mijozlar/' + mijoz_id, { ...mijoz, qarz: yangiQarz });

    // Kirim sifatida yozish (kassa harakatlarida ko'rinsin)
    await apiPost('/xarajatlar', {
      nomi: `Qarz to'lovi — ${mijoz.ism} ${mijoz.familiya||''}`,
      summa: -summa,  // Manfiy — bu kirim
      kategoriya: `Qarz to'lovi (${tolov==='naqd'?'💵 Naqd':'💳 Karta'})`,
      foydalanuvchi_id: joriyFoydalanuvchi.id,
      izoh: izoh || `Qarz to'landi. Qoldi: ${formatSum(yangiQarz)}`
    });

    modalYop();
    toast(`✅ ${formatSum(summa)} qarz to'landi! Qoldi: ${formatSum(yangiQarz)}`, 'success');
    kassaHisobiYukla();
  } catch(e) { toast(e.message, 'error'); }
}

// ===== KASSA HARAKATLARI =====
async function kassaHarakatlariYukla() {
  const bosh   = document.getElementById('kassaHBosh')?.value   || bugunSana();
  const tug    = document.getElementById('kassaHTugash')?.value || bugunSana();
  const div = document.getElementById('kassaHarakatlariDiv');
  if (!div) return;

  try {
    const [sotuvlar, xarajatlar, qaytarishlar] = await Promise.all([
      apiGet(`/sotuvlar?boshlanish=${bosh}&tugash=${tug}`),
      apiGet(`/xarajatlar?boshlanish=${bosh}&tugash=${tug}`),
      apiGet(`/qaytarishlar?boshlanish=${bosh}&tugash=${tug}`)
    ]);

    // Barcha harakatlarni birga yig'ish
    const harakatlar = [
      ...sotuvlar.map(s => ({
        tur: 'kirim',
        id: s.id,
        tolov: s.tolov_turi,
        tavsif: `🛒 ${s.chek_raqam}${s.mijoz_ismi ? ' — '+s.mijoz_ismi : ''}`,
        summa: s.jami_summa,
        sana: s.sana,
        chek_raqam: s.chek_raqam
      })),
      ...xarajatlar.map(x => ({
        tur: x.summa < 0 ? 'kirim' : 'chiqim',
        tolov: 'naqd',
        tavsif: `${x.summa < 0 ? '💰' : '💸'} ${x.nomi} ${x.kategoriya ? '('+x.kategoriya+')' : ''}`,
        summa: Math.abs(x.summa),
        sana: x.sana
      })),
      ...qaytarishlar.map(q => ({
        tur: 'chiqim',
        tolov: 'naqd',
        tavsif: `↩️ Qaytarish ${q.chek_raqam} ${q.sabab ? '— '+q.sabab : ''}`,
        summa: q.jami_summa,
        sana: q.sana
      }))
    ].sort((a,b) => b.sana.localeCompare(a.sana));

    if (!harakatlar.length) {
      div.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><p>Bu davrda harakat yo\'q</p></div>';
      return;
    }

    const jamiKirim  = harakatlar.filter(h => h.tur === 'kirim').reduce((s,h) => s+h.summa, 0);
    const jamiChiqim = harakatlar.filter(h => h.tur === 'chiqim').reduce((s,h) => s+h.summa, 0);

    div.innerHTML = `
      <div style="display:flex;gap:10px;margin-bottom:12px">
        <div style="flex:1;padding:10px;background:#f0fdf4;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:#64748b">Kirim</div>
          <div style="font-weight:700;color:#10b981">${formatSum(jamiKirim)}</div>
        </div>
        <div style="flex:1;padding:10px;background:#fff1f2;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:#64748b">Chiqim</div>
          <div style="font-weight:700;color:#ef4444">${formatSum(jamiChiqim)}</div>
        </div>
        <div style="flex:1;padding:10px;background:#f0f9ff;border-radius:8px;text-align:center">
          <div style="font-size:12px;color:#64748b">Sof</div>
          <div style="font-weight:700;color:${jamiKirim-jamiChiqim>=0?'#10b981':'#ef4444'}">
            ${formatSum(jamiKirim-jamiChiqim)}
          </div>
        </div>
      </div>
      <div style="max-height:340px;overflow-y:auto">
        ${harakatlar.map(h => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
            border-bottom:1px solid #f1f5f9;font-size:13px;
            cursor:${h.id&&h.tur==='kirim'?'pointer':'default'}"
            ${h.id&&h.tur==='kirim'?`onclick="kassaCheckTafsilot(${h.id})"
              onmouseover="this.style.background='#f8fafc'"
              onmouseout="this.style.background=''"`:''}>
            <div style="width:28px;height:28px;border-radius:50%;flex-shrink:0;
              background:${h.tur==='kirim'?'#dcfce7':'#fee2e2'};
              display:flex;align-items:center;justify-content:center">
              <i class="fas ${h.tur==='kirim'?'fa-arrow-down':'fa-arrow-up'}"
                style="color:${h.tur==='kirim'?'#10b981':'#ef4444'};font-size:11px"></i>
            </div>
            <div style="flex:1">
              <div style="font-size:13px">
                ${h.tavsif}
                ${h.id&&h.tur==='kirim'?`<i class="fas fa-eye" style="color:#94a3b8;font-size:10px;margin-left:4px"></i>`:''}
              </div>
              <div style="font-size:11px;color:#94a3b8">${formatSana(h.sana)}</div>
            </div>
            <div style="font-weight:700;${h.tur==='kirim'?'color:#10b981':'color:#ef4444'}">
              ${h.tur==='kirim'?'+':'-'}${formatSum(h.summa)}
            </div>
          </div>`).join('')}
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}


// ===== CHIQIM QO'SHISH =====
function chiqimQosh() {
  const kategoriyalar = [
    'Ijara', 'Maosh', 'Kommunal (suv/gaz/elektr)', 
    'Yuk tashish', 'Ta\'mirlash', 'Ofis xarajatlari',
    'Soliq', 'Bank xizmati', 'Boshqa'
  ];
  modalOch('💸 Yangi chiqim', `
    <form onsubmit="chiqimSaqlash(event)">
      <div class="form-group">
        <label style="font-weight:600">Chiqim nomi *</label>
        <input type="text" name="nomi" required autofocus
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          placeholder="Masalan: Oylik ijara, Maosh...">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label style="font-weight:600">Summa (so'm) *</label>
          <input type="number" name="summa" min="1" required
            style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
            placeholder="0">
        </div>
        <div class="form-group">
          <label style="font-weight:600">To'lov turi</label>
          <div style="display:flex;gap:6px;margin-top:4px">
            <label style="display:flex;align-items:center;gap:5px;padding:8px 10px;
              border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;flex:1;font-size:13px">
              <input type="radio" name="tolov_chiqim" value="naqd" checked> 💵 Naqd
            </label>
            <label style="display:flex;align-items:center;gap:5px;padding:8px 10px;
              border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;flex:1;font-size:13px">
              <input type="radio" name="tolov_chiqim" value="karta"> 💳 Karta
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label style="font-weight:600">Kategoriya</label>
        <select name="kategoriya"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white">
          <option value="">— Tanlang —</option>
          ${kategoriyalar.map(k => `<option value="${k}">${k}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label style="font-weight:600">Izoh</label>
        <input type="text" name="izoh"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          placeholder="Ixtiyoriy izoh...">
      </div>

      <div style="background:#fff1f2;border:1px solid #fecaca;border-radius:8px;
        padding:10px 14px;margin-bottom:12px;font-size:13px;color:#991b1b">
        <i class="fas fa-info-circle"></i>
        Bu chiqim kassa hisobidan ayiriladi va xarajatlar ro'yxatida ko'rinadi.
      </div>

      <div class="modal-footer" style="padding:0">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-danger">
          <i class="fas fa-minus-circle"></i> Chiqim kiritish
        </button>
      </div>
    </form>`);
}

async function chiqimSaqlash(e) {
  e.preventDefault();
  const form = e.target;
  const summa   = parseFloat(form.summa.value) || 0;
  const nomi    = form.nomi.value.trim();
  const tolov   = form.querySelector('[name=tolov_chiqim]:checked')?.value || 'naqd';
  const kateg   = form.kategoriya.value;
  const izoh    = form.izoh.value.trim();

  if (!nomi || summa <= 0) { toast('Nomi va summa kiritilishi shart!', 'warning'); return; }

  try {
    await apiPost('/xarajatlar', {
      nomi: nomi,
      summa: summa,
      kategoriya: kateg || 'Boshqa',
      foydalanuvchi_id: joriyFoydalanuvchi.id,
      izoh: izoh || `${tolov === 'naqd' ? '💵 Naqd' : '💳 Karta'} to\'landi`
    });
    modalYop();
    toast(`✅ Chiqim kiritildi: ${formatSum(summa)}`, 'success');
    kassaHisobiYukla();
  } catch(err) { toast(err.message, 'error'); }
}

// ===== SOTUV CHEKIGA BOSGANIDA TAFSILOT =====
async function kassaCheckTafsilot(sotuv_id) {
  try {
    const s = await apiGet('/sotuvlar/' + sotuv_id);
    const tolovBadge = {
      naqd:  '<span style="background:#dcfce7;color:#166534;padding:2px 10px;border-radius:12px;font-size:12px">💵 Naqd</span>',
      karta: '<span style="background:#dbeafe;color:#1e40af;padding:2px 10px;border-radius:12px;font-size:12px">💳 Karta</span>',
      qarz:  '<span style="background:#fee2e2;color:#991b1b;padding:2px 10px;border-radius:12px;font-size:12px">📋 Qarz</span>',
    };

    modalOch(`🧾 Chek — ${s.chek_raqam}`, `
      <!-- Chek sarlavha -->
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;
        padding:14px;margin-bottom:16px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;font-size:13px">
          <div><span style="color:#64748b">Kassir:</span> <b>${s.kassir_ismi}</b></div>
          <div><span style="color:#64748b">Sana:</span> <b>${formatSana(s.sana)}</b></div>
          <div><span style="color:#64748b">Mijoz:</span>
            <b>${s.mijoz_ismi || '<span style="color:#94a3b8">Mijozsiz</span>'}</b>
          </div>
          <div><span style="color:#64748b">To\'lov:</span>
            ${tolovBadge[s.tolov_turi] || s.tolov_turi}
          </div>
        </div>
      </div>

      <!-- Mahsulotlar ro'yxati -->
      <div style="font-weight:600;font-size:13px;color:#475569;margin-bottom:8px">
        <i class="fas fa-list"></i> Mahsulotlar ro'yxati
      </div>
      <div style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:12px">
        <table style="width:100%;border-collapse:collapse;font-size:13px">
          <thead>
            <tr style="background:#f8fafc">
              <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600">#</th>
              <th style="padding:8px 12px;text-align:left;color:#64748b;font-weight:600">Mahsulot</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;font-weight:600">Miqdor</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;font-weight:600">Narxi</th>
              <th style="padding:8px 12px;text-align:right;color:#64748b;font-weight:600">Jami</th>
            </tr>
          </thead>
          <tbody>
            ${s.tafsilotlar.map((t, i) => `
              <tr style="border-top:1px solid #f1f5f9">
                <td style="padding:8px 12px;color:#94a3b8">${i+1}</td>
                <td style="padding:8px 12px;font-weight:600">${t.mahsulot_nomi}</td>
                <td style="padding:8px 12px;text-align:right">${t.miqdor} ${t.birlik}</td>
                <td style="padding:8px 12px;text-align:right">${formatSum(t.narxi)}</td>
                <td style="padding:8px 12px;text-align:right;color:#10b981;font-weight:700">
                  ${formatSum(t.jami)}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>

      <!-- Jami -->
      <div style="border-top:2px solid #e2e8f0;padding-top:12px">
        ${s.chegirma > 0 ? `
          <div style="display:flex;justify-content:space-between;font-size:13px;
            color:#64748b;margin-bottom:6px">
            <span>Chegirma:</span>
            <span style="color:#ef4444">-${formatSum(s.chegirma)}</span>
          </div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700">
          <span>JAMI:</span>
          <span style="color:#10b981">+${formatSum(s.jami_summa)}</span>
        </div>
      </div>

      <div class="modal-footer" style="padding:0;margin-top:14px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="window.print()">
          <i class="fas fa-print"></i> Chop etish
        </button>
      </div>`);
  } catch(e) { toast(e.message, 'error'); }
}
