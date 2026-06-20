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
          <div class="stat-info"><h3 id="naqdBalans">—</h3><p>💵 Naqd pul</p></div>
        </div>
        <div class="stat-card" id="kartaKarta">
          <div class="stat-icon blue"><i class="fas fa-credit-card"></i></div>
          <div class="stat-info"><h3 id="kartaBalans">—</h3><p>💳 Plastik karta</p></div>
        </div>
        <div class="stat-card" id="qarzKarta">
          <div class="stat-icon red"><i class="fas fa-hand-holding-usd"></i></div>
          <div class="stat-info"><h3 id="qarzBalans">—</h3><p>📋 Jami qarzlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="fas fa-wallet"></i></div>
          <div class="stat-info"><h3 id="umumiyBalans">—</h3><p>💰 Umumiy balans</p></div>
        </div>
      </div>

      <!-- KIRIM / CHIQIM TUGMALARI -->
      <div style="display:flex;gap:10px;margin-bottom:16px">
        <button class="btn btn-success" onclick="kirimQosh()" style="flex:1;padding:12px;font-size:14px">
          <i class="fas fa-plus-circle"></i> Kassaga kirim
        </button>
        <button class="btn btn-danger" onclick="chiqimQosh()" style="flex:1;padding:12px;font-size:14px">
          <i class="fas fa-minus-circle"></i> Kassadan chiqim
        </button>
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
    const [sotuvlar, qaytarishlar, kassa_h] = await Promise.all([
      apiGet('/sotuvlar'),
      apiGet('/qaytarishlar'),
      apiGet('/kassa_harakatlari')
    ]);

    // Sotuvlardan kirim
    const naqdKirim  = sotuvlar.filter(s => s.tolov_turi === 'naqd').reduce((s,x) => s+x.jami_summa, 0);
    const kartaKirim = sotuvlar.filter(s => s.tolov_turi === 'karta').reduce((s,x) => s+x.jami_summa, 0);
    const qarzKirim  = sotuvlar.filter(s => s.tolov_turi === 'qarz').reduce((s,x) => s+x.jami_summa, 0);

    // Qaytarishlar chiqim
    const qaytarishJami = qaytarishlar.reduce((s,x) => s+x.jami_summa, 0);

    // Qo'lda kiritilgan kassa harakatlari
    const qKirim  = kassa_h.filter(h => h.tur === 'kirim'  && h.tolov_turi === 'naqd').reduce((s,x) => s+x.summa, 0);
    const qChiqim = kassa_h.filter(h => h.tur === 'chiqim' && h.tolov_turi === 'naqd').reduce((s,x) => s+x.summa, 0);
    const kKirim  = kassa_h.filter(h => h.tur === 'kirim'  && h.tolov_turi === 'karta').reduce((s,x) => s+x.summa, 0);
    const kChiqim = kassa_h.filter(h => h.tur === 'chiqim' && h.tolov_turi === 'karta').reduce((s,x) => s+x.summa, 0);

    const naqdBalans  = naqdKirim  - qaytarishJami + qKirim  - qChiqim;
    const kartaBalans = kartaKirim                 + kKirim  - kChiqim;
    const umumiy      = naqdBalans + kartaBalans;

    // Qarzli mijozlardan qarz
    const mijozlar   = await apiGet('/mijozlar');
    const qarzJami   = mijozlar.filter(m => m.qarz > 0).reduce((s,m) => s+m.qarz, 0);

    const el = id => document.getElementById(id);
    if (el('naqdBalans'))   { el('naqdBalans').textContent   = formatSum(naqdBalans);  el('naqdBalans').style.color  = naqdBalans < 0 ? '#ef4444' : ''; }
    if (el('kartaBalans'))  { el('kartaBalans').textContent  = formatSum(kartaBalans); }
    if (el('qarzBalans'))   { el('qarzBalans').textContent   = formatSum(qarzJami);    }
    if (el('umumiyBalans')) { el('umumiyBalans').textContent = formatSum(umumiy);      el('umumiyBalans').style.color = umumiy < 0 ? '#ef4444' : ''; }

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

    // Kassa harakati sifatida kiritish (xarajat emas!)
    await apiPost('/kassa_harakatlari', {
      tur: 'kirim',
      nomi: `Qarz to'lovi — ${mijoz.ism} ${mijoz.familiya||''}`,
      summa: summa,
      tolov_turi: tolov,
      kategoriya: 'Qarz to\'lovi',
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
    // Kassa harakatlari (kirim/chiqim) — alohida jadvaldan
    const [kassa_h, sotuvlar, qaytarishlar] = await Promise.all([
      apiGet(`/kassa_harakatlari?boshlanish=${bosh}&tugash=${tug}`),
      apiGet(`/sotuvlar?boshlanish=${bosh}&tugash=${tug}`),
      apiGet(`/qaytarishlar?boshlanish=${bosh}&tugash=${tug}`)
    ]);

    // Barcha harakatlarni birga yig'ish
    const harakatlar = [
      // Sotuvlar — kirim
      ...sotuvlar.map(s => ({
        tur: 'kirim', id: s.id,
        tolov: s.tolov_turi,
        tavsif: `🛒 ${s.chek_raqam}${s.mijoz_ismi ? ' — '+s.mijoz_ismi : ''}`,
        summa: s.jami_summa,
        sana: s.sana,
        chek_raqam: s.chek_raqam,
        tip: 'sotuv'
      })),
      // Qaytarishlar — chiqim
      ...qaytarishlar.map(q => ({
        tur: 'chiqim',
        tolov: 'naqd',
        tavsif: `↩️ ${q.chek_raqam}${q.sabab ? ' — '+q.sabab : ''}`,
        summa: q.jami_summa,
        sana: q.sana,
        tip: 'qaytarish'
      })),
      // Kassa harakatlari (qo'lda kiritilgan kirim/chiqim)
      ...kassa_h.map(h => ({
        tur: h.tur,
        tolov: h.tolov_turi,
        tavsif: `${h.tur === 'kirim' ? '💰' : '💸'} ${h.nomi}${h.kategoriya ? ' ('+h.kategoriya+')' : ''}`,
        summa: h.summa,
        sana: h.sana,
        tip: 'kassa_' + h.tur,
        izoh: h.izoh
      }))
    ].sort((a, b) => b.sana.localeCompare(a.sana));

    if (!harakatlar.length) {
      div.innerHTML = '<div class="empty-state"><i class="fas fa-exchange-alt"></i><p>Bu davrda harakat yo\'q</p></div>';
      return;
    }

    const jamiKirim  = harakatlar.filter(h => h.tur === 'kirim').reduce((s,h) => s+h.summa, 0);
    const jamiChiqim = harakatlar.filter(h => h.tur === 'chiqim').reduce((s,h) => s+h.summa, 0);
    const sof = jamiKirim - jamiChiqim;

    div.innerHTML = `
      <div style="display:flex;gap:8px;margin-bottom:12px">
        <div style="flex:1;padding:10px;background:#f0fdf4;border-radius:8px;text-align:center;border:1px solid #bbf7d0">
          <div style="font-size:11px;color:#166534;font-weight:600">⬇ KIRIM</div>
          <div style="font-weight:700;color:#10b981;font-size:15px">+${formatSum(jamiKirim)}</div>
        </div>
        <div style="flex:1;padding:10px;background:#fff1f2;border-radius:8px;text-align:center;border:1px solid #fecaca">
          <div style="font-size:11px;color:#991b1b;font-weight:600">⬆ CHIQIM</div>
          <div style="font-weight:700;color:#ef4444;font-size:15px">-${formatSum(jamiChiqim)}</div>
        </div>
        <div style="flex:1;padding:10px;background:${sof>=0?'#f0f9ff':'#fff1f2'};border-radius:8px;text-align:center;border:1px solid ${sof>=0?'#bae6fd':'#fecaca'}">
          <div style="font-size:11px;color:#475569;font-weight:600">= SOF</div>
          <div style="font-weight:700;color:${sof>=0?'#0ea5e9':'#ef4444'};font-size:15px">
            ${sof>=0?'+':''}${formatSum(sof)}
          </div>
        </div>
      </div>
      <div style="max-height:320px;overflow-y:auto">
        ${harakatlar.map(h => `
          <div style="display:flex;align-items:center;gap:8px;padding:8px 10px;
            border-bottom:1px solid #f1f5f9;font-size:13px;
            cursor:${h.id&&h.tip==='sotuv'?'pointer':'default'};
            transition:background 0.15s"
            ${h.id&&h.tip==='sotuv'
              ? `onclick="kassaCheckTafsilot(${h.id})"
                 onmouseover="this.style.background='#f8fafc'"
                 onmouseout="this.style.background=''"` : ''}>
            <div style="width:30px;height:30px;border-radius:50%;flex-shrink:0;
              background:${h.tur==='kirim'?'#dcfce7':'#fee2e2'};
              display:flex;align-items:center;justify-content:center">
              <i class="fas ${h.tur==='kirim'?'fa-arrow-down':'fa-arrow-up'}"
                style="color:${h.tur==='kirim'?'#10b981':'#ef4444'};font-size:11px"></i>
            </div>
            <div style="flex:1;min-width:0">
              <div style="font-size:13px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
                ${h.tavsif}
                ${h.id&&h.tip==='sotuv'
                  ? '<i class="fas fa-eye" style="color:#94a3b8;font-size:10px;margin-left:4px"></i>' : ''}
              </div>
              <div style="font-size:11px;color:#94a3b8">${formatSana(h.sana)}</div>
            </div>
            <div style="font-weight:700;white-space:nowrap;
              color:${h.tur==='kirim'?'#10b981':'#ef4444'}">
              ${h.tur==='kirim'?'+':'-'}${formatSum(h.summa)}
            </div>
          </div>`).join('')}
      </div>`;
  } catch(e) { toast(e.message, 'error'); }
}
  } catch(e) { toast(e.message, 'error'); }
}


// ===== CHIQIM / KIRIM QO'SHISH =====
function chiqimQosh() {
  kassaHarakatModalOch('chiqim');
}

function kirimQosh() {
  kassaHarakatModalOch('kirim');
}

function kassaHarakatModalOch(tur) {
  const isKirim = tur === 'kirim';
  const ranglar = isKirim
    ? { bg: '#f0fdf4', border: '#bbf7d0', btn: 'btn-success', icon: 'fa-plus-circle', rang: '#10b981' }
    : { bg: '#fff1f2', border: '#fecaca', btn: 'btn-danger',  icon: 'fa-minus-circle', rang: '#ef4444' };

  const kategoriyalar = isKirim
    ? ['Sotuv tushumi', 'Investor puli', 'Qarz olindi', 'Boshqa kirim']
    : ['Ijara', 'Maosh', 'Kommunal', 'Yuk tashish', 'Ta\'mirlash', 'Soliq', 'Bank xizmati', 'Boshqa chiqim'];

  modalOch(`${isKirim ? '💰 Kassaga kirim' : '💸 Kassadan chiqim'}`, `
    <form onsubmit="kassaHarakatSaqla(event,'${tur}')">
      <div style="background:${ranglar.bg};border:1px solid ${ranglar.border};border-radius:10px;
        padding:12px;margin-bottom:16px;text-align:center;font-size:13px;color:${ranglar.rang}">
        <i class="fas ${ranglar.icon}" style="font-size:20px;margin-bottom:4px;display:block"></i>
        <b>${isKirim ? 'Kassaga pul kirishi' : 'Kassadan pul chiqishi'}</b> sifatida qayd etiladi
      </div>

      <div class="form-group">
        <label style="font-weight:600">Tavsif *</label>
        <input type="text" name="nomi" required autofocus
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          placeholder="${isKirim ? 'Masalan: Sotuv tushumi, Qarz olindi...' : 'Masalan: Ijara to\'lovi, Maosh...'}">
      </div>

      <div class="form-row">
        <div class="form-group">
          <label style="font-weight:600">Summa (so'm) *</label>
          <input type="number" name="summa" min="1" required
            style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:15px;font-weight:600"
            placeholder="0">
        </div>
        <div class="form-group">
          <label style="font-weight:600">Pul turi</label>
          <div style="display:flex;gap:6px;margin-top:4px">
            <label style="display:flex;align-items:center;gap:5px;padding:9px 10px;
              border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;flex:1;font-size:13px">
              <input type="radio" name="tolov_turi" value="naqd" checked> 💵 Naqd
            </label>
            <label style="display:flex;align-items:center;gap:5px;padding:9px 10px;
              border:2px solid #e2e8f0;border-radius:8px;cursor:pointer;flex:1;font-size:13px">
              <input type="radio" name="tolov_turi" value="karta"> 💳 Karta
            </label>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label style="font-weight:600">Kategoriya</label>
        <select name="kategoriya"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px;background:white">
          <option value="">— Tanlang —</option>
          ${kategoriyalar.map(k => `<option>${k}</option>`).join('')}
        </select>
      </div>

      <div class="form-group">
        <label style="font-weight:600">Izoh</label>
        <input type="text" name="izoh"
          style="width:100%;padding:10px;border:2px solid #e2e8f0;border-radius:8px;font-size:14px"
          placeholder="Ixtiyoriy...">
      </div>

      <div class="modal-footer" style="padding:0">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn ${ranglar.btn}">
          <i class="fas ${ranglar.icon}"></i>
          ${isKirim ? 'Kirim kiritish' : 'Chiqim kiritish'}
        </button>
      </div>
    </form>`);
}

async function kassaHarakatSaqla(e, tur) {
  e.preventDefault();
  const form = e.target;
  const data = {
    tur:             tur,
    nomi:            form.nomi.value.trim(),
    summa:           parseFloat(form.summa.value) || 0,
    tolov_turi:      form.querySelector('[name=tolov_turi]:checked')?.value || 'naqd',
    kategoriya:      form.kategoriya.value,
    izoh:            form.izoh.value.trim(),
    foydalanuvchi_id: joriyFoydalanuvchi?.id || null
  };

  if (!data.nomi || data.summa <= 0) {
    toast('Tavsif va summa kiritilishi shart!', 'warning'); return;
  }

  try {
    await apiPost('/kassa_harakatlari', data);
    modalYop();
    const sign = tur === 'kirim' ? '+' : '-';
    toast(`✅ ${tur === 'kirim' ? 'Kirim' : 'Chiqim'}: ${sign}${formatSum(data.summa)}`, 'success');
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
