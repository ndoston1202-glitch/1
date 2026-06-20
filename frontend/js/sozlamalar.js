// ===== SOZLAMALAR =====
const SOZLAMALAR_KALIT = 'dokoni_sozlamalar';

function sozlamalarniOl() {
  const def = {
    // Chek sozlamalari
    chek_dokoni_nomi: "Qurilish Do'koni",
    chek_manzil: '',
    chek_telefon: '',
    chek_xabar: "Rahmat! Yana keling! 🙏",
    chek_korinish: 'standart', // standart, kichik, katta

    // Interfeys
    rangTema: 'moviy', // moviy, yashil, toq
    tilozbekcha: true,

    // Savdo oynasi
    savdoKorinish: 'karta', // karta, jadval
    savdoTolovDefault: 'naqd',
    chegirmaMax: 100,
    avtomatChek: true,

    // To'lov usullari
    tolovNaqd: true,
    tolovKarta: true,
    tolovQarz: true,
    tolovBankTransfer: false,
    tolovNaqdNomi: "Naqd pul",
    tolovKartaNomi: "Plastik karta",
    tolovQarzNomi: "Qarz",
    tolovBankNomi: "Bank o'tkazmasi",
  };
  try {
    const saqlangan = localStorage.getItem(SOZLAMALAR_KALIT);
    return saqlangan ? { ...def, ...JSON.parse(saqlangan) } : def;
  } catch { return def; }
}

function sozlamalarniSaqla(sozlamalar) {
  localStorage.setItem(SOZLAMALAR_KALIT, JSON.stringify(sozlamalar));
}

function sozlamalarYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const s = sozlamalarniOl();

  kontent.innerHTML = `
    <div style="max-width:800px">
      <!-- TABS -->
      <div class="hisobot-tabs" style="margin-bottom:20px">
        <button class="tab-btn active" onclick="sozTabAlmashtir('chek',this)">
          <i class="fas fa-receipt"></i> Chek
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('interfeys',this)">
          <i class="fas fa-palette"></i> Interfeys
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('savdo',this)">
          <i class="fas fa-cash-register"></i> Savdo oynasi
        </button>
        <button class="tab-btn" onclick="sozTabAlmashtir('tolov',this)">
          <i class="fas fa-credit-card"></i> To'lov usullari
        </button>
      </div>
      <div id="sozKontent"></div>
    </div>`;

  sozTabAlmashtir('chek', document.querySelector('.tab-btn'));
}

function sozTabAlmashtir(tur, btn) {
  document.querySelectorAll('.hisobot-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const s = sozlamalarniOl();
  switch(tur) {
    case 'chek': sozChekKorsatish(s); break;
    case 'interfeys': sozInterfeysKorsatish(s); break;
    case 'savdo': sozSavdoKorsatish(s); break;
    case 'tolov': sozTolovKorsatish(s); break;
  }
}

// ===== 1. CHEK SOZLAMALARI =====
function sozChekKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-receipt"></i> Chek sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Do'kon nomi (chekda chiqadi)</label>
          <input type="text" id="soz_chek_dokoni_nomi" class="search-input" style="width:100%"
            value="${s.chek_dokoni_nomi}" placeholder="Qurilish Do'koni">
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Manzil</label>
            <input type="text" id="soz_chek_manzil" class="search-input" style="width:100%"
              value="${s.chek_manzil}" placeholder="Toshkent, Chilonzor...">
          </div>
          <div class="form-group">
            <label>Telefon</label>
            <input type="text" id="soz_chek_telefon" class="search-input" style="width:100%"
              value="${s.chek_telefon}" placeholder="+998 90 123 45 67">
          </div>
        </div>
        <div class="form-group">
          <label>Chek pastidagi xabar</label>
          <input type="text" id="soz_chek_xabar" class="search-input" style="width:100%"
            value="${s.chek_xabar}" placeholder="Rahmat! Yana keling!">
        </div>
        <div class="form-group">
          <label>Chek ko'rinishi</label>
          <select id="soz_chek_korinish" class="filter-select" style="width:100%">
            <option value="standart" ${s.chek_korinish==='standart'?'selected':''}>Standart (80mm)</option>
            <option value="kichik" ${s.chek_korinish==='kichik'?'selected':''}>Kichik (58mm)</option>
            <option value="katta" ${s.chek_korinish==='katta'?'selected':''}>Katta (A4)</option>
          </select>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="soz_avtomatChek" ${s.avtomatChek?'checked':''} style="margin-right:8px">
            Sotuvdan so'ng avtomatik chek ko'rsatsin
          </label>
        </div>

        <!-- CHEK PREVIEW -->
        <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:8px;padding:16px;margin-top:16px">
          <div style="font-weight:600;margin-bottom:10px;color:#475569">
            <i class="fas fa-eye"></i> Chek ko'rinishi (namuna):
          </div>
          <div id="chekPreview" style="max-width:300px;margin:0 auto;background:white;padding:12px;border:1px dashed #e2e8f0;border-radius:4px;font-family:monospace;font-size:12px">
          </div>
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozChekSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
          <button class="btn btn-secondary" style="margin-left:8px" onclick="chekPreviewYanila()">
            <i class="fas fa-eye"></i> Ko'rish
          </button>
        </div>
      </div>
    </div>`;
  chekPreviewYanila();
}

function chekPreviewYanila() {
  const nomi = document.getElementById('soz_chek_dokoni_nomi')?.value || "Qurilish Do'koni";
  const manzil = document.getElementById('soz_chek_manzil')?.value || '';
  const tel = document.getElementById('soz_chek_telefon')?.value || '';
  const xabar = document.getElementById('soz_chek_xabar')?.value || "Rahmat! Yana keling!";
  const preview = document.getElementById('chekPreview');
  if (!preview) return;
  preview.innerHTML = `
    <div style="text-align:center;font-weight:bold;font-size:14px;border-bottom:1px dashed #000;padding-bottom:6px;margin-bottom:8px">
      🏗️ ${nomi}
    </div>
    ${manzil ? `<div style="text-align:center;font-size:11px">${manzil}</div>` : ''}
    ${tel ? `<div style="text-align:center;font-size:11px">Tel: ${tel}</div>` : ''}
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between"><span>Chek:</span><span>CHK12345</span></div>
    <div style="display:flex;justify-content:space-between"><span>Sana:</span><span>${new Date().toLocaleDateString()}</span></div>
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between"><span>Tsement x2</span></div>
    <div style="display:flex;justify-content:space-between"><span>2 x 95,000</span><span>190,000</span></div>
    <div style="border-bottom:1px dashed #000;margin:6px 0"></div>
    <div style="display:flex;justify-content:space-between;font-weight:bold"><span>JAMI:</span><span>190,000 so'm</span></div>
    <div style="text-align:center;margin-top:8px;font-size:11px">${xabar}</div>`;
}

function sozChekSaqla() {
  const s = sozlamalarniOl();
  s.chek_dokoni_nomi = document.getElementById('soz_chek_dokoni_nomi').value;
  s.chek_manzil = document.getElementById('soz_chek_manzil').value;
  s.chek_telefon = document.getElementById('soz_chek_telefon').value;
  s.chek_xabar = document.getElementById('soz_chek_xabar').value;
  s.chek_korinish = document.getElementById('soz_chek_korinish').value;
  s.avtomatChek = document.getElementById('soz_avtomatChek').checked;
  sozlamalarniSaqla(s);
  toast('✅ Chek sozlamalari saqlandi!', 'success');
}

// ===== 2. INTERFEYS SOZLAMALARI =====
function sozInterfeysKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-palette"></i> Interfeys sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Rang temasi</label>
          <div style="display:flex;gap:12px;margin-top:8px;flex-wrap:wrap">
            ${[
              {id:'moviy', rang:'#2563eb', nomi:'Ko\'k'},
              {id:'yashil', rang:'#10b981', nomi:'Yashil'},
              {id:'toq', rang:'#7c3aed', nomi:'Binafsha'},
              {id:'qizil', rang:'#ef4444', nomi:'Qizil'},
              {id:'toshrang', rang:'#475569', nomi:'Toshrang'},
            ].map(t => `
              <div onclick="rangTanlash('${t.id}')"
                style="width:60px;text-align:center;cursor:pointer;padding:8px;border-radius:8px;border:2px solid ${s.rangTema===t.id?t.rang:'#e2e8f0'}">
                <div style="width:36px;height:36px;border-radius:50%;background:${t.rang};margin:0 auto 4px"></div>
                <span style="font-size:11px">${t.nomi}</span>
              </div>`).join('')}
          </div>
        </div>

        <div class="form-group" style="margin-top:16px">
          <label>Sahifadagi mahsulotlar soni (mahsulotlar ro'yxatida)</label>
          <select id="soz_sahifa_son" class="filter-select" style="width:200px">
            ${[10,20,50,100].map(n => `<option value="${n}" ${(s.sahifaSon||20)==n?'selected':''}>${n} ta</option>`).join('')}
          </select>
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozInterfeysSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function rangTanlash(id) {
  const s = sozlamalarniOl();
  s.rangTema = id;
  sozlamalarniSaqla(s);
  const ranglar = {moviy:'#2563eb', yashil:'#10b981', toq:'#7c3aed', qizil:'#ef4444', toshrang:'#475569'};
  const rang = ranglar[id] || '#2563eb';
  document.documentElement.style.setProperty('--primary', rang);
  toast(`✅ Rang o'zgartirildi!`, 'success');
  sozInterfeysKorsatish(s);
}

function sozInterfeysSaqla() {
  const s = sozlamalarniOl();
  s.sahifaSon = parseInt(document.getElementById('soz_sahifa_son').value);
  sozlamalarniSaqla(s);
  toast('✅ Interfeys sozlamalari saqlandi!', 'success');
}

// ===== 3. SAVDO OYNASI SOZLAMALARI =====
function sozSavdoKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-cash-register"></i> Savdo oynasi sozlamalari</h3></div>
      <div class="card-body">
        <div class="form-group">
          <label>Mahsulotlar ko'rinishi</label>
          <div style="display:flex;gap:12px;margin-top:8px">
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:2px solid ${s.savdoKorinish==='karta'?'#2563eb':'#e2e8f0'};border-radius:8px">
              <input type="radio" name="savdoKorinish" value="karta" ${s.savdoKorinish==='karta'?'checked':''}
                onchange="document.querySelectorAll('[name=savdoKorinish]').forEach((e,i)=>e.parentElement.style.borderColor=e.checked?'#2563eb':'#e2e8f0')">
              <i class="fas fa-th-large fa-lg" style="color:#2563eb"></i> Karta ko'rinish
            </label>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer;padding:12px;border:2px solid ${s.savdoKorinish==='jadval'?'#2563eb':'#e2e8f0'};border-radius:8px">
              <input type="radio" name="savdoKorinish" value="jadval" ${s.savdoKorinish==='jadval'?'checked':''}
                onchange="document.querySelectorAll('[name=savdoKorinish]').forEach((e,i)=>e.parentElement.style.borderColor=e.checked?'#2563eb':'#e2e8f0')">
              <i class="fas fa-list fa-lg" style="color:#2563eb"></i> Jadval ko'rinish
            </label>
          </div>
        </div>

        <div class="form-group">
          <label>Standart to'lov turi</label>
          <select id="soz_savdoTolovDefault" class="filter-select" style="width:100%">
            <option value="naqd" ${s.savdoTolovDefault==='naqd'?'selected':''}>💵 Naqd pul</option>
            <option value="karta" ${s.savdoTolovDefault==='karta'?'selected':''}>💳 Plastik karta</option>
            <option value="qarz" ${s.savdoTolovDefault==='qarz'?'selected':''}>📋 Qarz</option>
          </select>
        </div>

        <div class="form-group">
          <label>Maksimal chegirma (%)</label>
          <input type="number" id="soz_chegirmaMax" min="0" max="100" class="search-input"
            style="width:150px" value="${s.chegirmaMax||100}">
        </div>

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozSavdoSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function sozSavdoSaqla() {
  const s = sozlamalarniOl();
  const kor = document.querySelector('[name=savdoKorinish]:checked');
  s.savdoKorinish = kor ? kor.value : 'karta';
  s.savdoTolovDefault = document.getElementById('soz_savdoTolovDefault').value;
  s.chegirmaMax = parseInt(document.getElementById('soz_chegirmaMax').value) || 100;
  sozlamalarniSaqla(s);
  toast('✅ Savdo oynasi sozlamalari saqlandi!', 'success');
}

// ===== 4. TO'LOV USULLARI SOZLAMALARI =====
function sozTolovKorsatish(s) {
  document.getElementById('sozKontent').innerHTML = `
    <div class="card">
      <div class="card-header"><h3><i class="fas fa-credit-card"></i> To'lov usullari</h3></div>
      <div class="card-body">
        <p style="color:#64748b;margin-bottom:16px;font-size:14px">
          Yoqilgan to'lov usullari kassada ko'rinadi
        </p>
        ${[
          {key:'Naqd', icon:'💵', desc:'Naqd pul'},
          {key:'Karta', icon:'💳', desc:'Plastik karta'},
          {key:'Qarz', icon:'📋', desc:'Qarzga berish'},
          {key:'BankTransfer', icon:'🏦', desc:"Bank o'tkazmasi"},
        ].map(t => `
          <div style="display:flex;align-items:center;justify-content:space-between;padding:12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:8px">
            <div style="display:flex;align-items:center;gap:10px">
              <span style="font-size:20px">${t.icon}</span>
              <div>
                <div style="font-weight:600">${t.desc}</div>
                <input type="text" id="soz_tolov${t.key}Nomi" class="search-input"
                  style="width:200px;margin-top:4px;padding:4px 8px;font-size:12px"
                  value="${s['tolov'+t.key+'Nomi'] || t.desc}"
                  placeholder="Tugma nomi">
              </div>
            </div>
            <label style="display:flex;align-items:center;gap:8px;cursor:pointer">
              <span style="font-size:13px;color:#64748b">${s['tolov'+t.key]?'Yoqilgan':'O\'chirilgan'}</span>
              <div class="toggle-switch" onclick="tolovToggle('${t.key}',this)"
                style="width:44px;height:24px;border-radius:12px;background:${s['tolov'+t.key]?'#2563eb':'#e2e8f0'};
                position:relative;cursor:pointer;transition:background 0.2s" data-aktiv="${s['tolov'+t.key]?'1':'0'}">
                <div style="position:absolute;top:2px;width:20px;height:20px;border-radius:50%;background:white;
                  box-shadow:0 1px 3px rgba(0,0,0,0.3);transition:left 0.2s;
                  left:${s['tolov'+t.key]?'22px':'2px'}"></div>
              </div>
            </label>
          </div>`).join('')}

        <div style="margin-top:16px">
          <button class="btn btn-primary" onclick="sozTolovSaqla()">
            <i class="fas fa-save"></i> Saqlash
          </button>
        </div>
      </div>
    </div>`;
}

function tolovToggle(key, el) {
  const aktiv = el.dataset.aktiv === '1';
  const yangi = !aktiv;
  el.dataset.aktiv = yangi ? '1' : '0';
  el.style.background = yangi ? '#2563eb' : '#e2e8f0';
  el.children[0].style.left = yangi ? '22px' : '2px';
  el.previousElementSibling.textContent = yangi ? 'Yoqilgan' : "O'chirilgan";
}

function sozTolovSaqla() {
  const s = sozlamalarniOl();
  ['Naqd','Karta','Qarz','BankTransfer'].forEach(key => {
    const tog = document.querySelector(`[onclick="tolovToggle('${key}',this)"]`);
    if (tog) s['tolov'+key] = tog.dataset.aktiv === '1';
    const nomi = document.getElementById(`soz_tolov${key}Nomi`);
    if (nomi) s['tolov'+key+'Nomi'] = nomi.value;
  });
  sozlamalarniSaqla(s);
  toast('✅ To\'lov usullari saqlandi!', 'success');
}

// ===== SOZLAMALARNI DASTURGA QO'LLASH =====
function sozlamalarniQolla() {
  const s = sozlamalarniOl();
  // Rang
  const ranglar = {moviy:'#2563eb', yashil:'#10b981', toq:'#7c3aed', qizil:'#ef4444', toshrang:'#475569'};
  if (ranglar[s.rangTema]) {
    document.documentElement.style.setProperty('--primary', ranglar[s.rangTema]);
  }
}
