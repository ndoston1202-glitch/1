// ===== KASSA XOTIRASI (task 4) =====
const KASSA_XOTIRA_KALIT = 'kassa_xotira';

function kassaXotirasiniSaqla() {
  try {
    localStorage.setItem(KASSA_XOTIRA_KALIT, JSON.stringify({
      chekMahsulotlar,
      tanlangan_mijoz,
      chegirma: document.getElementById('chegirmaInput')?.value || '',
      tolov_turi: document.getElementById('tolovTuri')?.value || 'naqd',
    }));
  } catch(e) {}
}

function kassaXotirasiniYukla() {
  try {
    const d = localStorage.getItem(KASSA_XOTIRA_KALIT);
    if (!d) return false;
    const x = JSON.parse(d);
    if (!x.chekMahsulotlar || !x.chekMahsulotlar.length) return false;
    chekMahsulotlar = x.chekMahsulotlar;
    tanlangan_mijoz = x.tanlangan_mijoz || null;
    return x;
  } catch(e) { return false; }
}

function kassaXotirasiniTozala() {
  localStorage.removeItem(KASSA_XOTIRA_KALIT);
}


let kassaMahsulotlar = [];
let chekMahsulotlar = [];
let tanlangan_mijoz = null;

async function kassaYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const soz = sozlamalarniOl();

  kontent.innerHTML = `
    <div class="kassa-wrapper">
      <div class="kassa-mahsulotlar">
        <div class="card" style="margin-bottom:12px">
          <div class="card-body" style="padding:12px">
            <div class="filter-bar">
              <input type="text" id="kassaQidiruv" class="search-input"
                placeholder="🔍 Mahsulot qidirish..." oninput="kassaMahsulotFilter()" style="flex:1">
              <select id="kassaKat" class="filter-select" onchange="kassaMahsulotFilter()">
                <option value="">Barcha kategoriyalar</option>
              </select>
              <button class="btn btn-secondary btn-sm" onclick="kassaKorinishAlmash()" title="Ko'rinishni almashtir">
                <i class="fas fa-th-large"></i>
              </button>
            </div>
          </div>
        </div>
        <div id="kassaMahsulotGrid" class="${soz.savdoKorinish==='jadval'?'':'mahsulot-grid'}"></div>
      </div>
      <div class="kassa-chek">
        <div class="chek-header">
          <div style="display:flex;justify-content:space-between;align-items:center">
            <h3><i class="fas fa-receipt"></i> Joriy chek</h3>
            <div style="display:flex;gap:6px">
              <button class="btn btn-warning btn-sm" onclick="qaytarishModal()" title="Qaytarish">
                <i class="fas fa-undo"></i> Qaytarish
              </button>
              <button class="btn btn-secondary btn-sm" onclick="chekTozala()">
                <i class="fas fa-times"></i>
              </button>
            </div>
          </div>
        </div>
        <div class="chek-items" id="chekItems">
          <div class="empty-state" style="padding:30px">
            <i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p>
          </div>
        </div>
        <div class="chek-footer">
          <div style="margin-bottom:10px;border:1px solid #e2e8f0;border-radius:8px;padding:10px;background:#f8fafc">
            <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px">
              <span style="font-size:13px;font-weight:600;color:#475569"><i class="fas fa-user"></i> Mijoz</span>
              <button class="btn btn-secondary btn-sm" onclick="mijozTanlash()">
                <i class="fas fa-search"></i> Tanlash
              </button>
            </div>
            <div id="tanlangan_mijoz_blok">
              <span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>
            </div>
          </div>
          <div class="chek-jami-qator"><span>Jami:</span><span id="chekJami">0 so'm</span></div>
          <div class="chek-jami-qator">
            <span>Chegirma:</span>
            <input type="number" id="chegirmaInput" min="0" placeholder="0"
              style="width:100px;text-align:right;border:1px solid #e2e8f0;border-radius:4px;padding:4px"
              oninput="chekHisoba();kassaXotirasiniSaqla()">
          </div>
          <div class="chek-jami-qator katta"><span>To'lash:</span><span id="chekYakuniy">0 so'm</span></div>
          <div class="form-group" style="margin:10px 0 8px">
            <label style="font-size:13px">To'lov turi</label>
            <select id="tolovTuri" class="filter-select" style="width:100%" onchange="kassaXotirasiniSaqla()">
              ${tolovUsullariOptions(soz)}
            </select>
          </div>
          <button class="btn btn-success" style="width:100%;padding:12px;font-size:15px" onclick="sotuvYakunla()">
            <i class="fas fa-check-circle"></i> Sotishni tasdiqlash
          </button>
        </div>
      </div>
    </div>`;

  try {
    const [mahsulotlar, kategoriyalar] = await Promise.all([apiGet('/mahsulotlar'), apiGet('/kategoriyalar')]);
    kassaMahsulotlar = mahsulotlar;
    const sel = document.getElementById('kassaKat');
    kategoriyalar.forEach(k => sel.innerHTML += `<option value="${k.id}">${k.nomi}</option>`);

    // XOTIRADAN YUKLASH (task 4)
    const xotira = kassaXotirasiniYukla();
    if (xotira && xotira.chekMahsulotlar.length) {
      // max miqdorlarni yangilaymiz
      chekMahsulotlar.forEach(c => {
        const m = mahsulotlar.find(x => x.id == c.mahsulot_id);
        if (m) c.max = m.miqdor;
      });
      tanlangan_mijoz = xotira.tanlangan_mijoz;
      chekKorsatish();
      setTimeout(() => {
        if (document.getElementById('chegirmaInput'))
          document.getElementById('chegirmaInput').value = xotira.chegirma || '';
        if (document.getElementById('tolovTuri') && xotira.tolov_turi)
          document.getElementById('tolovTuri').value = xotira.tolov_turi;
        if (tanlandan_mijoz) mijozBlokniyaJila();
        chekHisoba();
      }, 50);
      toast('💾 Oxirgi chek qayta yuklandi', 'success');
    } else {
      chekMahsulotlar = [];
      tanlangan_mijoz = null;
    }
    kassaMahsulotKorsatish(kassaMahsulotlar);
  } catch(e) { toast(e.message, 'error'); }
}


function tolovUsullariOptions(soz) {
  let opts = '';
  if (soz.tolovNaqd !== false) opts += `<option value="naqd">${soz.tolovNaqdNomi||'💵 Naqd pul'}</option>`;
  if (soz.tolovKarta !== false) opts += `<option value="karta">${soz.tolovKartaNomi||'💳 Plastik karta'}</option>`;
  if (soz.tolovQarz !== false) opts += `<option value="qarz">${soz.tolovQarzNomi||'📋 Qarz'}</option>`;
  if (soz.tolovBankTransfer) opts += `<option value="bank">${soz.tolovBankNomi||'🏦 Bank'}</option>`;
  return opts || '<option value="naqd">💵 Naqd pul</option>';
}

let _kassaJadvalKorinish = false;
function kassaKorinishAlmash() {
  _kassaJadvalKorinish = !_kassaJadvalKorinish;
  const grid = document.getElementById('kassaMahsulotGrid');
  if (_kassaJadvalKorinish) {
    grid.className = '';
    kassaMahsulotJadvalKorsatish(kassaMahsulotlar);
  } else {
    grid.className = 'mahsulot-grid';
    kassaMahsulotKorsatish(kassaMahsulotlar);
  }
}

function mijozBlokniyaJila() {
  if (!tanlangan_mijoz) return;
  const blok = document.getElementById('tanlangan_mijoz_blok');
  if (!blok) return;
  blok.innerHTML = `
    <div style="display:flex;align-items:center;gap:8px">
      <div style="width:28px;height:28px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;
        justify-content:center;color:#2563eb;font-weight:700;font-size:12px">
        ${tanlangan_mijoz.ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:13px">${tanlangan_mijoz.toliqIsm}</div>
        ${tanlangan_mijoz.telefon ? `<div style="font-size:11px;color:#64748b">${tanlangan_mijoz.telefon}</div>` : ''}
      </div>
      <button class="btn btn-secondary btn-sm btn-icon" onclick="mijozniBekor()"><i class="fas fa-times"></i></button>
    </div>`;
}

async function mijozTanlash() {
  const mijozlar = await apiGet('/mijozlar');
  window._kassaMijozlar = mijozlar;
  modalOch('Mijoz tanlash', `
    <div style="margin-bottom:12px">
      <input type="text" id="mijozQidiruv" class="search-input" placeholder="🔍 Mijoz qidirish..."
        oninput="mijozlarFilter()" style="width:100%">
    </div>
    <div id="mijozlarRoyxat" style="max-height:350px;overflow-y:auto">${mijozlarHtml(mijozlar)}</div>
    <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e2e8f0">
      <button class="btn btn-secondary" style="width:100%" onclick="mijozniBekor()">
        <i class="fas fa-times"></i> Mijozsiz davom etish
      </button>
    </div>`);
}

function mijozlarHtml(royxat) {
  if (!royxat.length) return '<div class="empty-state"><i class="fas fa-users"></i><p>Mijoz topilmadi</p></div>';
  return royxat.map(m => `
    <div onclick="mijozniTanla(${m.id},'${(m.ism+' '+(m.familiya||'')).trim().replace(/'/g,"\\'")}',
      '${(m.telefon||'').replace(/'/g,"\\'")}','${(m.familiya||'').replace(/'/g,"\\'")}',
      '${m.ism.replace(/'/g,"\\'")}' )"
      style="padding:10px 12px;border:1px solid #e2e8f0;border-radius:8px;margin-bottom:6px;
        cursor:pointer;display:flex;align-items:center;gap:10px"
      onmouseover="this.style.background='#f0f9ff'" onmouseout="this.style.background='white'">
      <div style="width:36px;height:36px;border-radius:50%;background:#dbeafe;display:flex;align-items:center;
        justify-content:center;color:#2563eb;font-weight:700;flex-shrink:0">
        ${m.ism[0].toUpperCase()}
      </div>
      <div style="flex:1">
        <div style="font-weight:600;font-size:14px">${m.ism} ${m.familiya||''}</div>
        <div style="font-size:12px;color:#64748b">${m.telefon||'Telefon yo\'q'}
          ${m.qarz>0 ? `<span style="color:#ef4444;margin-left:8px">Qarz: ${formatSum(m.qarz)}</span>` : ''}
        </div>
      </div>
      <i class="fas fa-chevron-right" style="color:#94a3b8"></i>
    </div>`).join('');
}

function mijozlarFilter() {
  const q = document.getElementById('mijozQidiruv').value.toLowerCase();
  const f = (window._kassaMijozlar||[]).filter(m =>
    (m.ism+' '+(m.familiya||'')).toLowerCase().includes(q) || (m.telefon||'').includes(q));
  document.getElementById('mijozlarRoyxat').innerHTML = mijozlarHtml(f);
}

function mijozniTanla(id, toliqIsm, telefon, familiya, ism) {
  tanlangan_mijoz = {id, ism, familiya, telefon, toliqIsm};
  mijozBlokniyaJila();
  kassaXotirasiniSaqla();
  modalYop();
}

function mijozniBekor() {
  tanlangan_mijoz = null;
  const blok = document.getElementById('tanlangan_mijoz_blok');
  if (blok) blok.innerHTML = '<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
  kassaXotirasiniSaqla();
  modalYop();
}


function kassaMahsulotFilter() {
  const q = document.getElementById('kassaQidiruv').value.toLowerCase();
  const kat = document.getElementById('kassaKat').value;
  const f = kassaMahsulotlar.filter(m => {
    return (m.nomi.toLowerCase().includes(q) || (m.shtrix_kod||'').includes(q))
      && (!kat || m.kategoriya_id == kat);
  });
  _kassaJadvalKorinish ? kassaMahsulotJadvalKorsatish(f) : kassaMahsulotKorsatish(f);
}

function chekMahsulotlar_foydaliNarx(m) {
  // chegirma_foiz yoki chegirma_sum hisobga oladi
  const chegirmaFoiz = m.chegirma_foiz || 0;
  const chegirmaSom = m.chegirma_som || 0;
  let narx = m.asl_narx || m.narxi;
  if (chegirmaFoiz > 0) narx = narx * (1 - chegirmaFoiz / 100);
  else if (chegirmaSom > 0) narx = Math.max(0, narx - chegirmaSom);
  return Math.round(narx);
}

function kassaMahsulotKorsatish(royxat) {
  const grid = document.getElementById('kassaMahsulotGrid');
  if (!royxat.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Topilmadi</p></div>'; return; }
  grid.innerHTML = royxat.map(m => `
    <div class="mahsulot-karta ${m.miqdor<=0?'kam':''}" onclick="chekGaQosh(${m.id})">
      ${m.rasm ? `<img src="${m.rasm}" style="width:100%;height:80px;object-fit:cover;border-radius:6px;margin-bottom:6px">` : ''}
      <h4>${m.nomi}</h4>
      <div class="narxi">${formatSum(m.sotish_narxi)}</div>
      <div class="miqdor">Mavjud: ${m.miqdor} ${m.birlik}</div>
      ${m.miqdor<=0?'<div style="color:#ef4444;font-size:11px">⚠ Tugagan</div>':''}
    </div>`).join('');
}

function kassaMahsulotJadvalKorsatish(royxat) {
  const grid = document.getElementById('kassaMahsulotGrid');
  if (!royxat.length) { grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i><p>Topilmadi</p></div>'; return; }
  grid.innerHTML = `<div class="table-wrapper"><table>
    <thead><tr><th>Nomi</th><th>Narxi</th><th>Mavjud</th><th></th></tr></thead>
    <tbody>${royxat.map(m => `
      <tr>
        <td><b>${m.nomi}</b><br><small style="color:#64748b">${m.kategoriya_nomi||''}</small></td>
        <td><b style="color:#2563eb">${formatSum(m.sotish_narxi)}</b></td>
        <td>${m.miqdor} ${m.birlik}</td>
        <td><button class="btn btn-primary btn-sm" onclick="chekGaQosh(${m.id})" ${m.miqdor<=0?'disabled':''}>
          <i class="fas fa-plus"></i>
        </button></td>
      </tr>`).join('')}
    </tbody></table></div>`;
}

function chekGaQosh(mahsulot_id) {
  const m = kassaMahsulotlar.find(x => x.id == mahsulot_id);
  if (!m || m.miqdor <= 0) { toast('Bu mahsulot omborda tugagan!', 'warning'); return; }
  const mavjud = chekMahsulotlar.find(x => x.mahsulot_id == mahsulot_id);
  if (mavjud) {
    if (mavjud.miqdor >= m.miqdor) { toast('Omborda yetarli emas!', 'warning'); return; }
    mavjud.miqdor += 1;
  } else {
    chekMahsulotlar.push({mahsulot_id:m.id, nomi:m.nomi, narxi:m.sotish_narxi,
      asl_narx:m.sotish_narxi, miqdor:1, birlik:m.birlik, max:m.miqdor, rasm:m.rasm||null,
      chegirma_foiz:0, chegirma_som:0});
  }
  chekKorsatish();
  kassaXotirasiniSaqla();
}

function chekKorsatish() {
  const div = document.getElementById('chekItems');
  if (!div) return;
  if (!chekMahsulotlar.length) {
    div.innerHTML = '<div class="empty-state" style="padding:30px"><i class="fas fa-shopping-cart"></i><p>Mahsulot tanlang</p></div>';
    chekHisoba(); return;
  }
  div.innerHTML = chekMahsulotlar.map((m,i) => {
    const chegirmaFoiz = m.chegirma_foiz || 0;
    const chegirmaSom = m.chegirma_som || 0;
    let chegirmaNarx = m.asl_narx || m.narxi;
    if (chegirmaFoiz > 0) chegirmaNarx = chegirmaNarx * (1 - chegirmaFoiz/100);
    else if (chegirmaSom > 0) chegirmaNarx = Math.max(0, chegirmaNarx - chegirmaSom);
    chegirmaNarx = Math.round(chegirmaNarx);
    const jami = chegirmaNarx * m.miqdor;
    return `
    <div class="chek-item" style="flex-direction:column;align-items:stretch;gap:6px">
      <div style="display:flex;align-items:center;gap:8px">
        ${m.rasm ? `<img src="${m.rasm}" style="width:32px;height:32px;object-fit:cover;border-radius:4px;flex-shrink:0">` : ''}
        <div style="flex:1">
          <div class="chek-item-nomi">${m.nomi}</div>
          <div class="chek-item-narxi">
            ${chegirmaFoiz>0||chegirmaSom>0
              ? `<s style="color:#94a3b8">${formatSum(m.asl_narx||m.narxi)}</s>
                 <b style="color:#10b981">${formatSum(chegirmaNarx)}</b>`
              : formatSum(m.narxi)} / ${m.birlik}
          </div>
        </div>
        <div class="chek-item-miqdor">
          <button onclick="chekMiqdorOzgartir(${i},-1)">−</button>
          <input type="number" value="${m.miqdor}" min="0.01" max="${m.max}" step="0.01"
            onchange="chekMiqdorSet(${i},this.value)" style="width:50px">
          <button onclick="chekMiqdorOzgartir(${i},1)">+</button>
        </div>
        <div class="chek-item-jami" style="min-width:80px;text-align:right">${formatSum(jami)}</div>
        <button class="btn btn-danger btn-icon btn-sm" onclick="chekDanOchir(${i})"><i class="fas fa-times"></i></button>
      </div>
      <!-- Alohida chegirma -->
      <div style="display:flex;align-items:center;gap:6px;padding:4px 8px;background:#f8fafc;border-radius:6px;font-size:12px">
        <span style="color:#64748b;min-width:60px">Chegirma:</span>
        <input type="number" placeholder="%" min="0" max="100" value="${chegirmaFoiz||''}"
          style="width:55px;border:1px solid #e2e8f0;border-radius:4px;padding:3px 6px;font-size:12px"
          oninput="mahsulotCheqirmaFoizOzgartir(${i},this.value)"
          title="Foizda chegirma">
        <span style="color:#94a3b8">%</span>
        <span style="color:#94a3b8;margin:0 2px">yoki</span>
        <input type="number" placeholder="so'm" min="0" value="${chegirmaSom||''}"
          style="width:80px;border:1px solid #e2e8f0;border-radius:4px;padding:3px 6px;font-size:12px"
          oninput="mahsulotCheqirmaSomOzgartir(${i},this.value)"
          title="So'mda chegirma">
        <span style="color:#94a3b8">so'm</span>
        ${chegirmaFoiz>0||chegirmaSom>0
          ? `<span style="color:#10b981;margin-left:4px">-${chegirmaFoiz>0?chegirmaFoiz+'%':formatSum(chegirmaSom)}</span>`
          : ''}
      </div>
    </div>`}).join('');
  chekHisoba();
}

function mahsulotCheqirmaFoizOzgartir(i, val) {
  const foiz = parseFloat(val) || 0;
  if (!chekMahsulotlar[i]) return;
  chekMahsulotlar[i].chegirma_foiz = foiz;
  chekMahsulotlar[i].chegirma_som = 0;
  const aslNarx = chekMahsulotlar[i].asl_narx || chekMahsulotlar[i].narxi;
  chekMahsulotlar[i].asl_narx = aslNarx;
  chekMahsulotlar[i].narxi = foiz > 0 ? Math.round(aslNarx * (1 - foiz/100)) : aslNarx;
  kassaXotirasiniSaqla();
  chekHisoba();
}

function mahsulotCheqirmaSomOzgartir(i, val) {
  const som = parseFloat(val) || 0;
  if (!chekMahsulotlar[i]) return;
  chekMahsulotlar[i].chegirma_som = som;
  chekMahsulotlar[i].chegirma_foiz = 0;
  const aslNarx = chekMahsulotlar[i].asl_narx || chekMahsulotlar[i].narxi;
  chekMahsulotlar[i].asl_narx = aslNarx;
  chekMahsulotlar[i].narxi = som > 0 ? Math.max(0, aslNarx - som) : aslNarx;
  kassaXotirasiniSaqla();
  chekHisoba();
}

function chekMiqdorOzgartir(i,delta) {
  const m=chekMahsulotlar[i], yangi=Math.round((m.miqdor+delta)*100)/100;
  if(yangi<=0){chekDanOchir(i);return;}
  if(yangi>m.max){toast('Omborda yetarli emas!','warning');return;}
  chekMahsulotlar[i].miqdor=yangi; chekKorsatish(); kassaXotirasiniSaqla();
}
function chekMiqdorSet(i,q) {
  const val=parseFloat(q);
  if(!val||val<=0){chekDanOchir(i);return;}
  if(val>chekMahsulotlar[i].max){toast('Omborda yetarli emas!','warning');return;}
  chekMahsulotlar[i].miqdor=val; chekKorsatish(); kassaXotirasiniSaqla();
}
function chekDanOchir(i) { chekMahsulotlar.splice(i,1); chekKorsatish(); kassaXotirasiniSaqla(); }

function chekTozala() {
  chekMahsulotlar=[]; tanlangan_mijoz=null;
  chekKorsatish();
  const ch=document.getElementById('chegirmaInput'); if(ch) ch.value='';
  const tb=document.getElementById('tanlangan_mijoz_blok');
  if(tb) tb.innerHTML='<span style="color:#94a3b8;font-size:13px">— Mijozsiz sotuv —</span>';
  kassaXotirasiniTozala();
}

function chekHisoba() {
  const jami=chekMahsulotlar.reduce((s,m)=>s+m.narxi*m.miqdor,0);
  const chegirma=parseFloat(document.getElementById('chegirmaInput')?.value)||0;
  const yakuniy=Math.max(0,jami-chegirma);
  const jEl=document.getElementById('chekJami'); if(jEl) jEl.textContent=formatSum(jami);
  const yEl=document.getElementById('chekYakuniy'); if(yEl) yEl.textContent=formatSum(yakuniy);
}


async function sotuvYakunla() {
  if (!chekMahsulotlar.length) { toast('Chek bo\'sh!', 'warning'); return; }
  const chegirma = parseFloat(document.getElementById('chegirmaInput').value) || 0;
  const tolov_turi = document.getElementById('tolovTuri').value;
  const data = {
    kassir_id: joriyFoydalanuvchi.id,
    mahsulotlar: chekMahsulotlar.map(m => ({mahsulot_id:m.mahsulot_id, miqdor:m.miqdor, narxi:m.narxi})),
    chegirma, tolov_turi,
    mijoz_id: tanlangan_mijoz ? tanlangan_mijoz.id : null,
    mijoz_ismi: tanlangan_mijoz ? tanlangan_mijoz.toliqIsm : ''
  };
  try {
    const r = await apiPost('/sotuvlar', data);
    toast(`✅ Sotuv: ${r.chek_raqam}`, 'success');
    const soz = sozlamalarniOl();
    const snap = { mahsulotlar:[...chekMahsulotlar], mijoz: tanlangan_mijoz, chegirma };
    kassaXotirasiniTozala();
    chekTozala();
    kassaMahsulotlar = await apiGet('/mahsulotlar');
    kassaMahsulotKorsatish(kassaMahsulotlar);
    if (soz.avtomatChek !== false) chekChidir(r, snap);
  } catch(e) { toast(e.message, 'error'); }
}

function chekChidir(sotuv, snap) {
  const soz = sozlamalarniOl();
  const mijozNomi = snap.mijoz ? snap.mijoz.toliqIsm : 'Mijozsiz';
  const kontent = `
    <div class="chek-print-box" id="chekPrint">
      <h3 style="text-align:center">🏗️ ${soz.chek_dokoni_nomi||"Qurilish Do'koni"}</h3>
      ${soz.chek_manzil?`<div style="text-align:center;font-size:11px">${soz.chek_manzil}</div>`:''}
      ${soz.chek_telefon?`<div style="text-align:center;font-size:11px">Tel: ${soz.chek_telefon}</div>`:''}
      <div class="chek-print-separator"></div>
      <div class="chek-print-qator"><span>Chek:</span><span>${sotuv.chek_raqam}</span></div>
      <div class="chek-print-qator"><span>Kassir:</span><span>${joriyFoydalanuvchi.ism}</span></div>
      <div class="chek-print-qator"><span>Mijoz:</span><span>${mijozNomi}</span></div>
      <div class="chek-print-qator"><span>Sana:</span><span>${new Date().toLocaleString('uz-UZ')}</span></div>
      <div class="chek-print-separator"></div>
      ${snap.mahsulotlar.map(m => {
        const chegirmaFoiz = m.chegirma_foiz || 0;
        const chegirmaSom = m.chegirma_som || 0;
        const aslNarx = m.asl_narx || m.narxi;
        const chegirmaMatn = chegirmaFoiz > 0 ? `-${chegirmaFoiz}%` : chegirmaSom > 0 ? `-${formatSum(chegirmaSom)}` : '';
        return `
        <div class="chek-print-qator"><span>${m.nomi}</span></div>
        <div class="chek-print-qator">
          <span>${m.miqdor} x ${formatSum(m.narxi)}${chegirmaMatn ? ` (chegirma: ${chegirmaMatn})` : ''}</span>
          <span>${formatSum(m.narxi*m.miqdor)}</span>
        </div>`;
      }).join('')}
      <div class="chek-print-separator"></div>
      ${snap.chegirma>0?`<div class="chek-print-qator"><span>Chegirma:</span><span>-${formatSum(snap.chegirma)}</span></div>`:''}
      <div class="chek-print-qator" style="font-weight:bold;font-size:14px">
        <span>JAMI:</span><span>${formatSum(sotuv.jami_summa)}</span>
      </div>
      <div class="chek-print-separator"></div>
      <div style="text-align:center;margin-top:8px">${soz.chek_xabar||"Rahmat! Yana keling! 🙏"}</div>
    </div>
    <div class="modal-footer" style="padding:0;margin-top:16px">
      <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
      <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Chop etish</button>
    </div>`;
  modalOch('Sotuv cheki', kontent);
}

// ===== QAYTARISH MODAL (task 3) =====
async function qaytarishModal() {
  const mahsulotlar = await apiGet('/mahsulotlar');
  const kontent = `
    <div>
      <p style="color:#64748b;font-size:13px;margin-bottom:12px">
        Qaytariladigan mahsulotlarni tanlang va miqdorini kiriting
      </p>
      <div class="form-group">
        <label>Sabab</label>
        <input type="text" id="qaytarish_sabab" class="search-input" style="width:100%"
          placeholder="Masalan: Sifatsiz, noto'g'ri mahsulot...">
      </div>
      <div id="qaytarishMahsulotlar" style="max-height:280px;overflow-y:auto;margin-bottom:12px">
        ${mahsulotlar.filter(m=>m.miqdor>=0).map(m=>`
          <div style="display:flex;align-items:center;gap:8px;padding:6px 0;border-bottom:1px solid #f1f5f9">
            <input type="checkbox" id="qtr_${m.id}" onchange="qaytarishChekBox(${m.id})">
            <label for="qtr_${m.id}" style="flex:1;font-size:13px;cursor:pointer">${m.nomi} <span style="color:#64748b">(${m.birlik})</span></label>
            <input type="number" id="qtr_m_${m.id}" min="0.01" step="0.01" placeholder="0"
              style="width:70px;border:1px solid #e2e8f0;border-radius:4px;padding:4px;display:none">
            <span style="font-size:12px;color:#2563eb;min-width:90px;text-align:right">${formatSum(m.sotish_narxi)}</span>
          </div>`).join('')}
      </div>
      <div style="padding:10px;background:#f8fafc;border-radius:8px;margin-bottom:12px">
        <b>Qaytarish summasi: <span id="qaytarishJami" style="color:#ef4444">0 so'm</span></b>
      </div>
      <div class="modal-footer" style="padding:0">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-warning" onclick="qaytarishYakunla()">
          <i class="fas fa-undo"></i> Qaytarishni tasdiqlash
        </button>
      </div>
    </div>`;
  modalOch('Mahsulot qaytarish', kontent);
  window._qaytarishMahsulotlar = mahsulotlar;
}

function qaytarishChekBox(id) {
  const inp = document.getElementById(`qtr_m_${id}`);
  const chk = document.getElementById(`qtr_${id}`);
  inp.style.display = chk.checked ? 'block' : 'none';
  qaytarishJamiHisoba();
}

function qaytarishJamiHisoba() {
  let jami = 0;
  (window._qaytarishMahsulotlar||[]).forEach(m => {
    const chk = document.getElementById(`qtr_${m.id}`);
    const inp = document.getElementById(`qtr_m_${m.id}`);
    if (chk && chk.checked && inp) jami += (parseFloat(inp.value)||0) * m.sotish_narxi;
  });
  const el = document.getElementById('qaytarishJami');
  if (el) el.textContent = formatSum(jami);
}

async function qaytarishYakunla() {
  const mahsulotlar = [];
  (window._qaytarishMahsulotlar||[]).forEach(m => {
    const chk = document.getElementById(`qtr_${m.id}`);
    const inp = document.getElementById(`qtr_m_${m.id}`);
    if (chk && chk.checked && inp && parseFloat(inp.value)>0) {
      mahsulotlar.push({mahsulot_id:m.id, miqdor:parseFloat(inp.value), narxi:m.sotish_narxi});
    }
  });
  if (!mahsulotlar.length) { toast('Mahsulot tanlanmagan!', 'warning'); return; }
  const sabab = document.getElementById('qaytarish_sabab').value;
  try {
    const r = await apiPost('/qaytarishlar', {
      kassir_id: joriyFoydalanuvchi.id,
      mahsulotlar, sabab,
      mijoz_id: tanlangan_mijoz?.id||null,
      mijoz_ismi: tanlangan_mijoz?.toliqIsm||''
    });
    toast(`✅ Qaytarish qabul qilindi! ${r.chek_raqam}`, 'success');
    modalYop();
    kassaMahsulotlar = await apiGet('/mahsulotlar');
    kassaMahsulotKorsatish(kassaMahsulotlar);
  } catch(e) { toast(e.message, 'error'); }
}
