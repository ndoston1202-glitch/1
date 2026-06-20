function hisobotYukla() {
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="hisobot-tabs">
      <button class="tab-btn active" onclick="tabAlmashtir('kunlik',this)"><i class="fas fa-calendar-day"></i> Kunlik</button>
      <button class="tab-btn" onclick="tabAlmashtir('oylik',this)"><i class="fas fa-calendar-alt"></i> Oylik</button>
      <button class="tab-btn" onclick="tabAlmashtir('sotuvlar',this)"><i class="fas fa-list"></i> Sotuvlar</button>
      <button class="tab-btn" onclick="tabAlmashtir('foyda',this)"><i class="fas fa-chart-line"></i> Foyda/Zarar</button>
      <button class="tab-btn" onclick="tabAlmashtir('qoldiq',this)"><i class="fas fa-boxes"></i> Mahsulot qoldig'i</button>
      <button class="tab-btn" onclick="tabAlmashtir('qaytarishlar',this)"><i class="fas fa-undo"></i> Qaytarishlar</button>
      <button class="tab-btn" onclick="tabAlmashtir('xarajatlar',this)"><i class="fas fa-money-bill"></i> Xarajatlar</button>
    </div>
    <div id="hisobotKontent"></div>`;
  tabAlmashtir('kunlik', document.querySelector('.tab-btn'));
}

function tabAlmashtir(tur, btn) {
  document.querySelectorAll('.hisobot-tabs .tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switch(tur) {
    case 'kunlik': kunlikHisobot(); break;
    case 'oylik': oylikHisobot(); break;
    case 'sotuvlar': sotuvlarTarixi(); break;
    case 'foyda': foydaHisoboti(); break;
    case 'qoldiq': qoldiqHisoboti(); break;
    case 'qaytarishlar': qaytarishlarHisoboti(); break;
    case 'xarajatlar': xarajatlarSahifasi(); break;
  }
}

async function kunlikHisobot() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-day"></i> Kunlik hisobot</h3>
        <input type="date" id="kunSana" value="${bugunSana()}" class="search-input" onchange="kunlikHisobotYukla()">
      </div>
      <div class="card-body" id="kunlikMalumat">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await kunlikHisobotYukla();
}

async function kunlikHisobotYukla() {
  const sana = document.getElementById('kunSana')?.value || bugunSana();
  try {
    const data = await apiGet(`/hisobot/kunlik?sana=${sana}`);
    document.getElementById('kunlikMalumat').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.sotuvlar.son||0}</h3><p>Sotuvlar soni</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.sotuvlar.jami)}</h3><p>Jami daromad</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.sotuvlar.jami||0)-(data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div></div>
      </div>
      ${data.topMahsulotlar.length ? `
        <h4 style="margin-bottom:12px"><i class="fas fa-trophy" style="color:#f59e0b"></i> Top 10</h4>
        <div class="table-wrapper"><table>
          <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Summa</th></tr></thead>
          <tbody>${data.topMahsulotlar.map((m,i)=>`
            <tr><td>${i<3?['🥇','🥈','🥉'][i]:i+1}</td><td>${m.nomi}</td>
            <td>${m.jami_miqdor}</td><td><b>${formatSum(m.jami_summa)}</b></td></tr>`).join('')}
          </tbody></table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu kunda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}

async function oylikHisobot() {
  const yil=new Date().getFullYear(), oy=new Date().getMonth()+1;
  const oylar=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-alt"></i> Oylik hisobot</h3>
        <div class="filter-bar">
          <select id="oyYil" class="filter-select" onchange="oylikHisobotYukla()">
            ${[yil-1,yil,yil+1].map(y=>`<option ${y==yil?'selected':''}>${y}</option>`).join('')}
          </select>
          <select id="oyOy" class="filter-select" onchange="oylikHisobotYukla()">
            ${oylar.map((o,i)=>`<option value="${i+1}" ${i+1==oy?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body" id="oylikMalumat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await oylikHisobotYukla();
}

async function oylikHisobotYukla() {
  const yil=document.getElementById('oyYil')?.value, oy=document.getElementById('oyOy')?.value;
  try {
    const data=await apiGet(`/hisobot/oylik?yil=${yil}&oy=${oy}`);
    const oylar=['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
    document.getElementById('oylikMalumat').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.jami.son||0}</h3><p>Jami sotuvlar</p></div></div>
        <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.jami.jami)}</h3><p>Jami daromad</p></div></div>
        <div class="stat-card"><div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div></div>
        <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.jami.jami||0)-(data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div></div>
      </div>
      ${data.kunliklar.length ? `
        <div class="table-wrapper"><table>
          <thead><tr><th>Sana</th><th>Sotuvlar</th><th>Jami summa</th></tr></thead>
          <tbody>${data.kunliklar.map(k=>`
            <tr><td>${new Date(k.kun).toLocaleDateString('uz-UZ',{day:'numeric',month:'long'})}</td>
            <td>${k.sotuvlar_soni}</td><td><b>${formatSum(k.jami)}</b></td></tr>`).join('')}
          </tbody></table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu oyda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}


// ===== SOTUVLAR TARIXI — chekni qayta chiqarish (task 3) =====
async function sotuvlarTarixi() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-list"></i> Sotuvlar tarixi</h3>
        <div class="filter-bar">
          <input type="date" id="stBosh" value="${oyBoshi}" class="search-input" onchange="sotuvlarRoyxatYukla()">
          <input type="date" id="stTugash" value="${bugun}" class="search-input" onchange="sotuvlarRoyxatYukla()">
        </div>
      </div>
      <div class="card-body" id="sotuvlarRoyxat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await sotuvlarRoyxatYukla();
}

async function sotuvlarRoyxatYukla() {
  const bosh=document.getElementById('stBosh')?.value, tug=document.getElementById('stTugash')?.value;
  try {
    const sotuvlar=await apiGet(`/sotuvlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=sotuvlar.reduce((s,x)=>s+x.jami_summa,0);
    document.getElementById('sotuvlarRoyxat').innerHTML = sotuvlar.length ? `
      <div style="background:#f0fdf4;padding:12px 16px;border-radius:8px;margin-bottom:16px;display:flex;gap:20px">
        <span><b>${sotuvlar.length}</b> ta sotuv</span>
        <span>Jami: <b>${formatSum(jami)}</b></span>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Chek</th><th>Kassir</th><th>Mijoz</th><th>To'lov</th><th>Summa</th><th>Sana</th><th></th></tr></thead>
        <tbody>${sotuvlar.map(s=>`
          <tr>
            <td><span class="badge badge-info">${s.chek_raqam}</span></td>
            <td>${s.kassir_ismi}</td>
            <td>${s.mijoz_ismi||'-'}</td>
            <td><span class="badge ${s.tolov_turi==='naqd'?'badge-success':s.tolov_turi==='karta'?'badge-info':'badge-warning'}">
              ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}
            </span></td>
            <td><b>${formatSum(s.jami_summa)}</b></td>
            <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm btn-icon" title="Batafsil" onclick="sotuvBatafsil(${s.id})"><i class="fas fa-eye"></i></button>
              <button class="btn btn-primary btn-sm btn-icon" title="Chekni qayta chiqarish" onclick="chekniQaytaChiqar(${s.id})"><i class="fas fa-print"></i></button>
              ${joriyFoydalanuvchi.rol==='admin'?`<button class="btn btn-danger btn-sm btn-icon" title="O'chirish" onclick="sotuvOchir(${s.id})"><i class="fas fa-trash"></i></button>`:''}
            </td>
          </tr>`).join('')}
        </tbody></table></div>` :
      '<div class="empty-state"><i class="fas fa-receipt"></i><p>Bu davrda sotuv yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

async function sotuvBatafsil(id) {
  try {
    const s=await apiGet('/sotuvlar/'+id);
    modalOch('Sotuv tafsilotlari', `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin-bottom:12px">
        <div><b>Chek:</b> ${s.chek_raqam}</div>
        <div><b>Kassir:</b> ${s.kassir_ismi}</div>
        <div><b>Sana:</b> ${formatSana(s.sana)}</div>
        <div><b>To'lov:</b> ${s.tolov_turi}</div>
        ${s.mijoz_ismi?`<div><b>Mijoz:</b> ${s.mijoz_ismi}</div>`:''}
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
        <tbody>${s.tafsilotlar.map(t=>`
          <tr><td>${t.mahsulot_nomi}</td><td>${t.miqdor} ${t.birlik}</td>
          <td>${formatSum(t.narxi)}</td><td><b>${formatSum(t.jami)}</b></td></tr>`).join('')}
        </tbody></table></div>
      <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px">
        ${s.chegirma>0?`<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>`:''}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#2563eb">
          <span>Jami:</span><span>${formatSum(s.jami_summa)}</span>
        </div>
      </div>
      <div class="modal-footer" style="padding:0;margin-top:12px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="chekniQaytaChiqar(${s.id})"><i class="fas fa-print"></i> Chekni chiqarish</button>
      </div>`);
  } catch(e) { toast(e.message,'error'); }
}

// Chekni qayta chiqarish (task 3)
async function chekniQaytaChiqar(id) {
  try {
    const s = await apiGet('/sotuvlar/'+id);
    const soz = sozlamalarniOl();
    const kontent = `
      <div class="chek-print-box" id="chekPrint">
        <h3 style="text-align:center">🏗️ ${soz.chek_dokoni_nomi||"Qurilish Do'koni"}</h3>
        ${soz.chek_manzil?`<div style="text-align:center;font-size:11px">${soz.chek_manzil}</div>`:''}
        ${soz.chek_telefon?`<div style="text-align:center;font-size:11px">Tel: ${soz.chek_telefon}</div>`:''}
        <div class="chek-print-separator"></div>
        <div class="chek-print-qator"><span>Chek:</span><span>${s.chek_raqam}</span></div>
        <div class="chek-print-qator"><span>Kassir:</span><span>${s.kassir_ismi}</span></div>
        ${s.mijoz_ismi?`<div class="chek-print-qator"><span>Mijoz:</span><span>${s.mijoz_ismi}</span></div>`:''}
        <div class="chek-print-qator"><span>Sana:</span><span>${formatSana(s.sana)}</span></div>
        <div class="chek-print-separator"></div>
        ${s.tafsilotlar.map(t=>`
          <div class="chek-print-qator"><span>${t.mahsulot_nomi}</span></div>
          <div class="chek-print-qator"><span>${t.miqdor} x ${formatSum(t.narxi)}</span><span>${formatSum(t.jami)}</span></div>
        `).join('')}
        <div class="chek-print-separator"></div>
        ${s.chegirma>0?`<div class="chek-print-qator"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>`:''}
        <div class="chek-print-qator" style="font-weight:bold;font-size:14px">
          <span>JAMI:</span><span>${formatSum(s.jami_summa)}</span>
        </div>
        <div class="chek-print-separator"></div>
        <div style="text-align:center;margin-top:8px">${soz.chek_xabar||"Rahmat! Yana keling! 🙏"}</div>
      </div>
      <div class="modal-footer" style="padding:0;margin-top:16px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        <button class="btn btn-primary" onclick="window.print()"><i class="fas fa-print"></i> Chop etish</button>
      </div>`;
    modalOch(`Chek — ${s.chek_raqam}`, kontent);
  } catch(e) { toast(e.message,'error'); }
}

function sotuvOchir(id) {
  tasdiqlash('Bu sotuvni o\'chirasizmi? Mahsulotlar omborga qaytariladi!', async () => {
    try { await apiDelete('/sotuvlar/'+id); toast('Sotuv o\'chirildi!'); sotuvlarRoyxatYukla(); }
    catch(e) { toast(e.message,'error'); }
  });
}


// ===== FOYDA / ZARAR HISOBOTI (task 5) =====
async function foydaHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-chart-line"></i> Foyda / Zarar hisoboti</h3>
        <div class="filter-bar">
          <input type="date" id="fBosh" value="${oyBoshi}" class="search-input" onchange="foydaYukla()">
          <input type="date" id="fTugash" value="${bugun}" class="search-input" onchange="foydaYukla()">
          <button class="btn btn-success btn-sm" onclick="foydaExcelExport()"><i class="fas fa-file-excel"></i> Excel</button>
        </div>
      </div>
      <div class="card-body" id="foydaKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await foydaYukla();
}

async function foydaYukla() {
  const bosh=document.getElementById('fBosh')?.value, tug=document.getElementById('fTugash')?.value;
  try {
    const data=await apiGet(`/hisobot/foyda?boshlanish=${bosh}&tugash=${tug}`);
    window._foydaData = data;
    const foydaRangi = data.jami_foyda >= 0 ? '#10b981' : '#ef4444';
    document.getElementById('foydaKontent').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon ${data.jami_foyda>=0?'green':'red'}">
            <i class="fas fa-${data.jami_foyda>=0?'arrow-up':'arrow-down'}"></i>
          </div>
          <div class="stat-info">
            <h3 style="color:${foydaRangi}">${formatSum(data.jami_foyda)}</h3>
            <p>Jami ${data.jami_foyda>=0?'foyda':'zarar'}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
          <div class="stat-info"><h3>${data.rows.length}</h3><p>Sotilgan mahsulot turi</p></div>
        </div>
      </div>
      ${data.rows.length ? `
        <div class="table-wrapper"><table>
          <thead><tr>
            <th>Mahsulot</th><th>Miqdor</th>
            <th>Kelish narxi</th><th>Sotish jami</th>
            <th>Kelish jami</th><th>Foyda/Zarar</th>
          </tr></thead>
          <tbody>${data.rows.map(r=>{
            const foyda=r.foyda||0;
            const rang=foyda>=0?'#10b981':'#ef4444';
            return `<tr>
              <td><b>${r.nomi}</b></td>
              <td>${r.jami_miqdor} ${r.birlik}</td>
              <td>${formatSum(r.kelish_narxi)}</td>
              <td>${formatSum(r.jami_sotish)}</td>
              <td>${formatSum(r.jami_kelish)}</td>
              <td><b style="color:${rang}">${foyda>=0?'+':''}${formatSum(foyda)}</b></td>
            </tr>`;}).join('')}
          </tbody>
          <tfoot><tr style="background:#f8fafc;font-weight:700">
            <td colspan="5">JAMI FOYDA/ZARAR</td>
            <td style="color:${foydaRangi}">${data.jami_foyda>=0?'+':''}${formatSum(data.jami_foyda)}</td>
          </tr></tfoot>
        </table></div>` :
        '<div class="empty-state"><i class="fas fa-chart-line"></i><p>Bu davrda sotuv yo\'q</p></div>'}`;
  } catch(e) { toast(e.message,'error'); }
}

function foydaExcelExport() {
  const data = window._foydaData;
  if (!data || !data.rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  const bosh=document.getElementById('fBosh')?.value||'';
  const tug=document.getElementById('fTugash')?.value||'';
  let csv = '\uFEFF';
  csv += `Foyda/Zarar hisoboti: ${bosh} - ${tug}\n\n`;
  csv += 'Mahsulot,Birlik,Miqdor,Kelish narxi,Sotish jami,Kelish jami,Foyda/Zarar\n';
  data.rows.forEach(r => {
    csv += `"${r.nomi}",${r.birlik},${r.jami_miqdor},${r.kelish_narxi},${r.jami_sotish||0},${r.jami_kelish||0},${r.foyda||0}\n`;
  });
  csv += `\n,,,,,,${data.jami_foyda}\n`;
  excelYukla(csv, `foyda_${bosh}_${tug}.csv`);
}

// ===== MAHSULOT QOLDIG'I HISOBOTI (task 5) =====
async function qoldiqHisoboti() {
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-boxes"></i> Mahsulotlar qoldig'i</h3>
        <div class="filter-bar">
          <input type="text" id="qoldiqQidiruv" class="search-input" placeholder="🔍 Qidirish..."
            oninput="qoldiqFilter()" style="min-width:200px">
          <select id="qoldiqKatFilter" class="filter-select" onchange="qoldiqFilter()">
            <option value="">Barcha kategoriyalar</option>
          </select>
          <button class="btn btn-success btn-sm" onclick="qoldiqExcelExport()">
            <i class="fas fa-file-excel"></i> Excel export
          </button>
        </div>
      </div>
      <div class="card-body" id="qoldiqKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await qoldiqYukla();
}

async function qoldiqYukla() {
  try {
    const rows = await apiGet('/hisobot/qoldiq');
    window._qoldiqData = rows;
    // kategoriyalarni to'ldirish
    const katlar = [...new Set(rows.map(r=>r.kategoriya_nomi||'Kategoriyasiz'))].sort();
    const sel = document.getElementById('qoldiqKatFilter');
    if (sel) katlar.forEach(k => sel.innerHTML += `<option>${k}</option>`);
    qoldiqKorsatish(rows);
  } catch(e) { toast(e.message,'error'); }
}

function qoldiqFilter() {
  const q=(document.getElementById('qoldiqQidiruv')?.value||'').toLowerCase();
  const kat=document.getElementById('qoldiqKatFilter')?.value||'';
  const f=(window._qoldiqData||[]).filter(r=>
    (!q||r.nomi.toLowerCase().includes(q)) &&
    (!kat||(r.kategoriya_nomi||'Kategoriyasiz')===kat));
  qoldiqKorsatish(f);
}

function qoldiqKorsatish(rows) {
  const jamiKelish=rows.reduce((s,r)=>s+(r.kelish_qiymati||0),0);
  const jamiSotish=rows.reduce((s,r)=>s+(r.sotish_qiymati||0),0);
  const div=document.getElementById('qoldiqKontent');
  if (!rows.length) { div.innerHTML='<div class="empty-state"><i class="fas fa-boxes"></i><p>Mahsulot topilmadi</p></div>'; return; }
  div.innerHTML = `
    <div class="stats-grid" style="margin-bottom:16px">
      <div class="stat-card"><div class="stat-icon blue"><i class="fas fa-boxes"></i></div>
        <div class="stat-info"><h3>${rows.length}</h3><p>Mahsulot turi</p></div></div>
      <div class="stat-card"><div class="stat-icon orange"><i class="fas fa-money-bill"></i></div>
        <div class="stat-info"><h3>${formatSum(jamiKelish)}</h3><p>Kelish qiymati</p></div></div>
      <div class="stat-card"><div class="stat-icon green"><i class="fas fa-coins"></i></div>
        <div class="stat-info"><h3>${formatSum(jamiSotish)}</h3><p>Sotish qiymati</p></div></div>
    </div>
    <div class="table-wrapper"><table>
      <thead><tr>
        <th>#</th><th>Mahsulot</th><th>Kategoriya</th><th>Birlik</th>
        <th>Soni</th><th>Kelish narxi</th><th>Sotish narxi</th>
        <th>Kelish qiymati</th><th>Sotish qiymati</th><th>Holat</th>
      </tr></thead>
      <tbody>${rows.map((r,i)=>`
        <tr>
          <td>${i+1}</td>
          <td><b>${r.nomi}</b></td>
          <td><span class="badge badge-secondary">${r.kategoriya_nomi||'-'}</span></td>
          <td>${r.birlik}</td>
          <td><b>${r.miqdor}</b></td>
          <td>${formatSum(r.kelish_narxi)}</td>
          <td>${formatSum(r.sotish_narxi)}</td>
          <td>${formatSum(r.kelish_qiymati)}</td>
          <td>${formatSum(r.sotish_qiymati)}</td>
          <td>${r.miqdor<=r.min_miqdor
            ?'<span class="badge badge-danger">⚠ Kam</span>'
            :'<span class="badge badge-success">✅ Yetarli</span>'}</td>
        </tr>`).join('')}
      </tbody>
      <tfoot><tr style="background:#f8fafc;font-weight:700">
        <td colspan="7">JAMI</td>
        <td>${formatSum(jamiKelish)}</td>
        <td>${formatSum(jamiSotish)}</td><td></td>
      </tr></tfoot>
    </table></div>`;
}

function qoldiqExcelExport() {
  const rows = window._qoldiqData || [];
  if (!rows.length) { toast('Ma\'lumot yo\'q!','warning'); return; }
  let csv = '\uFEFF';
  csv += `Mahsulotlar qoldig'i hisoboti — ${new Date().toLocaleDateString('uz-UZ')}\n\n`;
  csv += '#,Mahsulot,Kategoriya,Birlik,Soni,Kelish narxi,Sotish narxi,Kelish qiymati,Sotish qiymati,Holat\n';
  rows.forEach((r,i) => {
    const holat = r.miqdor <= r.min_miqdor ? 'Kam' : 'Yetarli';
    csv += `${i+1},"${r.nomi}","${r.kategoriya_nomi||'-'}",${r.birlik},${r.miqdor},${r.kelish_narxi},${r.sotish_narxi},${r.kelish_qiymati||0},${r.sotish_qiymati||0},${holat}\n`;
  });
  const jamiKelish=rows.reduce((s,r)=>s+(r.kelish_qiymati||0),0);
  const jamiSotish=rows.reduce((s,r)=>s+(r.sotish_qiymati||0),0);
  csv += `\nJAMI,,,,,,,,${jamiKelish},${jamiSotish},\n`;
  excelYukla(csv, `mahsulotlar_qoldig_${new Date().toISOString().split('T')[0]}.csv`);
}

function excelYukla(csv, fayl_nomi) {
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href=url; a.download=fayl_nomi; a.click();
  URL.revokeObjectURL(url);
  toast('✅ Excel fayl yuklandi!', 'success');
}

// ===== QAYTARISHLAR (task 3) =====
async function qaytarishlarHisoboti() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-undo"></i> Qaytarishlar</h3>
        <div class="filter-bar">
          <input type="date" id="qrBosh" value="${oyBoshi}" class="search-input" onchange="qaytarishlarYukla()">
          <input type="date" id="qrTugash" value="${bugun}" class="search-input" onchange="qaytarishlarYukla()">
        </div>
      </div>
      <div class="card-body" id="qaytarishlarKontent"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await qaytarishlarYukla();
}

async function qaytarishlarYukla() {
  const bosh=document.getElementById('qrBosh')?.value, tug=document.getElementById('qrTugash')?.value;
  try {
    const rows=await apiGet(`/qaytarishlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=rows.reduce((s,r)=>s+r.jami_summa,0);
    document.getElementById('qaytarishlarKontent').innerHTML = rows.length ? `
      <div style="background:#fff1f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
        <b>${rows.length}</b> ta qaytarish | Jami: <b style="color:#ef4444">${formatSum(jami)}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead>
          <tr>
            <th>Raqam</th><th>Kassir</th><th>Mijoz</th>
            <th>Sabab</th><th>Summa</th><th>Sana</th><th>Amallar</th>
          </tr>
        </thead>
        <tbody>${rows.map(r=>`
          <tr style="cursor:pointer" onmouseover="this.style.background='#fef2f2'" onmouseout="this.style.background=''">
            <td><span class="badge badge-warning" style="cursor:pointer" onclick="qaytarishBatafsil(${r.id})">${r.chek_raqam}</span></td>
            <td>${r.kassir_ismi||'-'}</td>
            <td>${r.mijoz_ismi||'-'}</td>
            <td style="font-size:12px;max-width:120px">${r.sabab||'-'}</td>
            <td><b style="color:#ef4444">${formatSum(r.jami_summa)}</b></td>
            <td style="font-size:12px;color:#64748b">${formatSana(r.sana)}</td>
            <td style="display:flex;gap:4px">
              <button class="btn btn-secondary btn-sm btn-icon" title="Batafsil ko'rish"
                onclick="qaytarishBatafsil(${r.id})">
                <i class="fas fa-eye"></i>
              </button>
              ${joriyFoydalanuvchi.rol==='admin'?`
                <button class="btn btn-danger btn-sm btn-icon" title="O'chirish"
                  onclick="qaytarishOchir(${r.id})">
                  <i class="fas fa-trash"></i>
                </button>`:''}
            </td>
          </tr>`).join('')}
        </tbody>
      </table></div>` :
      '<div class="empty-state"><i class="fas fa-undo"></i><p>Bu davrda qaytarish yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

// ===== QAYTARISH BATAFSIL =====
async function qaytarishBatafsil(id) {
  try {
    const r = await apiGet('/qaytarishlar/' + id);
    const tafsilotlar = r.tafsilotlar || [];
    modalOch(`Qaytarish — ${r.chek_raqam}`, `
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px;margin-bottom:16px;
        background:#fff1f2;padding:12px;border-radius:8px;border:1px solid #fecaca">
        <div><b>Raqam:</b> <span class="badge badge-warning">${r.chek_raqam}</span></div>
        <div><b>Kassir:</b> ${r.kassir_ismi||'-'}</div>
        <div><b>Sana:</b> ${formatSana(r.sana)}</div>
        <div><b>Mijoz:</b> ${r.mijoz_ismi||'-'}</div>
        ${r.sabab?`<div colspan="2"><b>Sabab:</b> ${r.sabab}</div>`:''}
      </div>

      <h4 style="margin-bottom:10px;font-size:14px;color:#475569">
        <i class="fas fa-list"></i> Qaytarilgan mahsulotlar:
      </h4>

      ${tafsilotlar.length ? `
        <div class="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>#</th>
                <th>Mahsulot</th>
                <th>Miqdor</th>
                <th>Narxi</th>
                <th>Jami</th>
              </tr>
            </thead>
            <tbody>
              ${tafsilotlar.map((t,i) => `
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
          display:flex;justify-content:space-between;font-size:16px;font-weight:700">
          <span>Jami qaytarish:</span>
          <span style="color:#ef4444">-${formatSum(r.jami_summa)}</span>
        </div>` :
        '<div class="empty-state"><i class="fas fa-box-open"></i><p>Tafsilot topilmadi</p></div>'}

      <div class="modal-footer" style="padding:0;margin-top:16px">
        <button class="btn btn-secondary" onclick="modalYop()">Yopish</button>
        ${joriyFoydalanuvchi.rol==='admin' ? `
          <button class="btn btn-danger" onclick="modalYop();qaytarishOchir(${r.id})">
            <i class="fas fa-trash"></i> O'chirish
          </button>` : ''}
      </div>`);
  } catch(e) { toast(e.message,'error'); }
}

function qaytarishOchir(id) {
  tasdiqlash('Bu qaytarishni o\'chirasizmi?', async () => {
    try { await apiDelete('/qaytarishlar/'+id); toast('O\'chirildi!'); qaytarishlarYukla(); }
    catch(e) { toast(e.message,'error'); }
  });
}

// ===== XARAJATLAR =====
async function xarajatlarSahifasi() {
  const bugun=bugunSana(), oyBoshi=bugun.slice(0,8)+'01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-money-bill"></i> Xarajatlar</h3>
        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap">
          <input type="date" id="xrBosh" value="${oyBoshi}" class="search-input" onchange="xarajatlarYukla()">
          <input type="date" id="xrTugash" value="${bugun}" class="search-input" onchange="xarajatlarYukla()">
          <button class="btn btn-primary btn-sm" onclick="xarajatQosh()"><i class="fas fa-plus"></i> Xarajat</button>
        </div>
      </div>
      <div class="card-body" id="xarajatlarRoyxat"><div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div></div>
    </div>`;
  await xarajatlarYukla();
}

async function xarajatlarYukla() {
  const bosh=document.getElementById('xrBosh')?.value, tug=document.getElementById('xrTugash')?.value;
  try {
    const xar=await apiGet(`/xarajatlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami=xar.reduce((s,x)=>s+x.summa,0);
    document.getElementById('xarajatlarRoyxat').innerHTML = xar.length ? `
      <div style="background:#fff1f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
        Jami xarajat: <b>${formatSum(jami)}</b>
      </div>
      <div class="table-wrapper"><table>
        <thead><tr><th>Nomi</th><th>Summa</th><th>Kategoriya</th><th>Xodim</th><th>Sana</th><th></th></tr></thead>
        <tbody>${xar.map(x=>`
          <tr>
            <td>${x.nomi}</td>
            <td><b style="color:#ef4444">${formatSum(x.summa)}</b></td>
            <td>${x.kategoriya||'-'}</td>
            <td>${x.xodim_ismi||'-'}</td>
            <td style="font-size:12px;color:#64748b">${formatSana(x.sana)}</td>
            <td><button class="btn btn-danger btn-sm btn-icon" onclick="xarajatOchir(${x.id})"><i class="fas fa-trash"></i></button></td>
          </tr>`).join('')}
        </tbody></table></div>` :
      '<div class="empty-state"><i class="fas fa-money-bill"></i><p>Bu davrda xarajat yo\'q</p></div>';
  } catch(e) { toast(e.message,'error'); }
}

function xarajatQosh() {
  const katlar=['Ijara','Maosh','Kommunal','Yuk tashish','Ta\'mirlash','Boshqa'];
  modalOch('Yangi xarajat', `
    <form onsubmit="xarajatSaqlash(event)">
      <div class="form-group"><label>Nomi *</label>
        <input type="text" name="nomi" required placeholder="Masalan: Oylik ijara"></div>
      <div class="form-row">
        <div class="form-group"><label>Summa *</label>
          <input type="number" name="summa" min="1" required placeholder="0"></div>
        <div class="form-group"><label>Kategoriya</label>
          <select name="kategoriya" class="filter-select" style="width:100%">
            <option value="">— Tanlang —</option>
            ${katlar.map(k=>`<option>${k}</option>`).join('')}
          </select></div>
      </div>
      <div class="form-group"><label>Izoh</label>
        <input type="text" name="izoh" placeholder="Ixtiyoriy"></div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-danger"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`);
}

async function xarajatSaqlash(e) {
  e.preventDefault();
  const f=e.target;
  try {
    await apiPost('/xarajatlar',{nomi:f.nomi.value,summa:parseFloat(f.summa.value),kategoriya:f.kategoriya.value,izoh:f.izoh.value,foydalanuvchi_id:joriyFoydalanuvchi.id});
    toast('Xarajat qo\'shildi!'); modalYop(); xarajatlarYukla();
  } catch(e){toast(e.message,'error');}
}
function xarajatOchir(id) {
  tasdiqlash('Bu xarajatni o\'chirasizmi?', async()=>{
    try{await apiDelete('/xarajatlar/'+id);toast('O\'chirildi!');xarajatlarYukla();}
    catch(e){toast(e.message,'error');}
  });
}
