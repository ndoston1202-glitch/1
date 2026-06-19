function hisobotYukla() {
  const kontent = document.getElementById('asosiyKontent');
  const bugun = bugunSana();
  const yil = new Date().getFullYear();
  const oy = new Date().getMonth() + 1;

  kontent.innerHTML = `
    <div class="hisobot-tabs">
      <button class="tab-btn active" onclick="tabAlmashtir('kunlik',this)"><i class="fas fa-calendar-day"></i> Kunlik</button>
      <button class="tab-btn" onclick="tabAlmashtir('oylik',this)"><i class="fas fa-calendar-alt"></i> Oylik</button>
      <button class="tab-btn" onclick="tabAlmashtir('sotuvlar',this)"><i class="fas fa-list"></i> Sotuvlar tarixi</button>
      <button class="tab-btn" onclick="tabAlmashtir('xarajatlar',this)"><i class="fas fa-money-bill"></i> Xarajatlar</button>
    </div>
    <div id="hisobotKontent"></div>`;

  tabAlmashtir('kunlik', document.querySelector('.tab-btn'));
}

function tabAlmashtir(tur, btn) {
  document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  switch(tur) {
    case 'kunlik': kunlikHisobot(); break;
    case 'oylik': oylikHisobot(); break;
    case 'sotuvlar': sotuvlarTarixi(); break;
    case 'xarajatlar': xarajatlarSahifasi(); break;
  }
}

async function kunlikHisobot() {
  const bugun = bugunSana();
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-day"></i> Kunlik hisobot</h3>
        <div class="filter-bar">
          <input type="date" id="kunSana" value="${bugun}" class="search-input" onchange="kunlikHisobotYukla()">
        </div>
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
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.sotuvlar.son || 0}</h3><p>Sotuvlar soni</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.sotuvlar.jami)}</h3><p>Jami daromad</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.sotuvlar.jami||0) - (data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div>
        </div>
      </div>
      ${data.topMahsulotlar.length ? `
        <h4 style="margin-bottom:12px"><i class="fas fa-trophy" style="color:#f59e0b"></i> Top 10 sotilgan mahsulotlar</h4>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Mahsulot</th><th>Miqdor</th><th>Summa</th></tr></thead>
            <tbody>${data.topMahsulotlar.map((m,i) => `
              <tr>
                <td>${i+1 <= 3 ? ['🥇','🥈','🥉'][i] : i+1}</td>
                <td>${m.nomi}</td>
                <td>${m.jami_miqdor}</td>
                <td><b>${formatSum(m.jami_summa)}</b></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu kunda sotuv yo\'q</p></div>'}`;
  } catch (e) { toast(e.message, 'error'); }
}

async function oylikHisobot() {
  const yil = new Date().getFullYear();
  const oy = new Date().getMonth() + 1;
  const oylar = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-calendar-alt"></i> Oylik hisobot</h3>
        <div class="filter-bar">
          <select id="oyYil" class="filter-select" onchange="oylikHisobotYukla()">
            ${[yil-1,yil,yil+1].map(y => `<option ${y==yil?'selected':''}>${y}</option>`).join('')}
          </select>
          <select id="oyOy" class="filter-select" onchange="oylikHisobotYukla()">
            ${oylar.map((o,i) => `<option value="${i+1}" ${i+1==oy?'selected':''}>${o}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="card-body" id="oylikMalumat">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await oylikHisobotYukla();
}

async function oylikHisobotYukla() {
  const yil = document.getElementById('oyYil')?.value;
  const oy = document.getElementById('oyOy')?.value;
  try {
    const data = await apiGet(`/hisobot/oylik?yil=${yil}&oy=${oy}`);
    const oylar = ['Yanvar','Fevral','Mart','Aprel','May','Iyun','Iyul','Avgust','Sentabr','Oktabr','Noyabr','Dekabr'];
    document.getElementById('oylikMalumat').innerHTML = `
      <div class="stats-grid" style="margin-bottom:20px">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info"><h3>${data.jami.son || 0}</h3><p>Jami sotuvlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-coins"></i></div>
          <div class="stat-info"><h3>${formatSum(data.jami.jami)}</h3><p>Jami daromad</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fas fa-minus-circle"></i></div>
          <div class="stat-info"><h3>${formatSum(data.xarajatlar.jami)}</h3><p>Xarajatlar</p></div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fas fa-chart-line"></i></div>
          <div class="stat-info"><h3>${formatSum((data.jami.jami||0)-(data.xarajatlar.jami||0))}</h3><p>Sof foyda</p></div>
        </div>
      </div>
      ${data.kunliklar.length ? `
        <h4 style="margin-bottom:12px">Kunlik statistika — ${oylar[parseInt(oy)-1]} ${yil}</h4>
        <div class="table-wrapper">
          <table>
            <thead><tr><th>Sana</th><th>Sotuvlar soni</th><th>Jami summa</th></tr></thead>
            <tbody>${data.kunliklar.map(k => `
              <tr>
                <td>${new Date(k.kun).toLocaleDateString('uz-UZ',{day:'numeric',month:'long'})}</td>
                <td>${k.sotuvlar_soni}</td>
                <td><b>${formatSum(k.jami)}</b></td>
              </tr>`).join('')}
            </tbody>
          </table>
        </div>` : '<div class="empty-state"><i class="fas fa-chart-bar"></i><p>Bu oyda sotuv yo\'q</p></div>'}`;
  } catch (e) { toast(e.message, 'error'); }
}

async function sotuvlarTarixi() {
  const bugun = bugunSana();
  const oyBoshi = bugun.slice(0,8) + '01';
  document.getElementById('hisobotKontent').innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-list"></i> Sotuvlar tarixi</h3>
        <div class="filter-bar">
          <input type="date" id="stBosh" value="${oyBoshi}" class="search-input" onchange="sotuvlarRoyxatYukla()">
          <input type="date" id="stTugash" value="${bugun}" class="search-input" onchange="sotuvlarRoyxatYukla()">
        </div>
      </div>
      <div class="card-body" id="sotuvlarRoyxat">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await sotuvlarRoyxatYukla();
}

async function sotuvlarRoyxatYukla() {
  const bosh = document.getElementById('stBosh')?.value;
  const tug = document.getElementById('stTugash')?.value;
  try {
    const sotuvlar = await apiGet(`/sotuvlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami = sotuvlar.reduce((s,x) => s + x.jami_summa, 0);
    document.getElementById('sotuvlarRoyxat').innerHTML = sotuvlar.length ? `
      <div style="background:#f0fdf4;padding:12px 16px;border-radius:8px;margin-bottom:16px;display:flex;gap:20px">
        <span><b>${sotuvlar.length}</b> ta sotuv</span>
        <span>Jami: <b>${formatSum(jami)}</b></span>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Chek</th><th>Kassir</th><th>Mijoz</th><th>To'lov</th><th>Summa</th><th>Sana</th><th></th></tr></thead>
          <tbody>${sotuvlar.map(s => `
            <tr>
              <td><span class="badge badge-info">${s.chek_raqam}</span></td>
              <td>${s.kassir_ismi}</td>
              <td>${s.mijoz_ismi || '-'}</td>
              <td><span class="badge ${s.tolov_turi==='naqd'?'badge-success':s.tolov_turi==='karta'?'badge-info':'badge-warning'}">
                ${s.tolov_turi==='naqd'?'💵 Naqd':s.tolov_turi==='karta'?'💳 Karta':'📋 Qarz'}
              </span></td>
              <td><b>${formatSum(s.jami_summa)}</b></td>
              <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
              <td>
                <button class="btn btn-secondary btn-sm btn-icon" title="Batafsil" onclick="sotuvBatafsil(${s.id})"><i class="fas fa-eye"></i></button>
                ${joriyFoydalanuvchi.rol==='admin'?`<button class="btn btn-danger btn-sm btn-icon" title="O'chirish" onclick="sotuvOchir(${s.id})"><i class="fas fa-trash"></i></button>`:''}
              </td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><i class="fas fa-receipt"></i><p>Bu davrda sotuv yo\'q</p></div>';
  } catch (e) { toast(e.message, 'error'); }
}

async function sotuvBatafsil(id) {
  try {
    const s = await apiGet('/sotuvlar/' + id);
    const kontent = `
      <div style="margin-bottom:12px">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:14px">
          <div><b>Chek:</b> ${s.chek_raqam}</div>
          <div><b>Kassir:</b> ${s.kassir_ismi}</div>
          <div><b>Sana:</b> ${formatSana(s.sana)}</div>
          <div><b>To'lov:</b> ${s.tolov_turi}</div>
          ${s.mijoz_ismi ? `<div><b>Mijoz:</b> ${s.mijoz_ismi}</div>` : ''}
        </div>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Mahsulot</th><th>Miqdor</th><th>Narxi</th><th>Jami</th></tr></thead>
          <tbody>${s.tafsilotlar.map(t => `
            <tr>
              <td>${t.mahsulot_nomi}</td>
              <td>${t.miqdor} ${t.birlik}</td>
              <td>${formatSum(t.narxi)}</td>
              <td><b>${formatSum(t.jami)}</b></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="border-top:1px solid #e2e8f0;margin-top:12px;padding-top:12px">
        ${s.chegirma > 0 ? `<div style="display:flex;justify-content:space-between;margin-bottom:6px"><span>Chegirma:</span><span>-${formatSum(s.chegirma)}</span></div>` : ''}
        <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:700;color:#2563eb">
          <span>Jami:</span><span>${formatSum(s.jami_summa)}</span>
        </div>
      </div>`;
    modalOch('Sotuv tafsilotlari', kontent);
  } catch (e) { toast(e.message, 'error'); }
}

function sotuvOchir(id) {
  tasdiqlash('Bu sotuvni o\'chirasizmi? Mahsulotlar omborga qaytariladi!', async () => {
    try { await apiDelete('/sotuvlar/' + id); toast('Sotuv o\'chirildi!'); sotuvlarRoyxatYukla(); }
    catch (e) { toast(e.message, 'error'); }
  });
}

async function xarajatlarSahifasi() {
  const bugun = bugunSana();
  const oyBoshi = bugun.slice(0,8) + '01';
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
      <div class="card-body" id="xarajatlarRoyxat">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await xarajatlarYukla();
}

async function xarajatlarYukla() {
  const bosh = document.getElementById('xrBosh')?.value;
  const tug = document.getElementById('xrTugash')?.value;
  try {
    const xarajatlar = await apiGet(`/xarajatlar?boshlanish=${bosh}&tugash=${tug}`);
    const jami = xarajatlar.reduce((s,x) => s + x.summa, 0);
    document.getElementById('xarajatlarRoyxat').innerHTML = xarajatlar.length ? `
      <div style="background:#fff1f2;padding:12px 16px;border-radius:8px;margin-bottom:16px">
        Jami xarajat: <b>${formatSum(jami)}</b>
      </div>
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Nomi</th><th>Summa</th><th>Kategoriya</th><th>Xodim</th><th>Sana</th><th></th></tr></thead>
          <tbody>${xarajatlar.map(x => `
            <tr>
              <td>${x.nomi}</td>
              <td><b style="color:#ef4444">${formatSum(x.summa)}</b></td>
              <td>${x.kategoriya || '-'}</td>
              <td>${x.xodim_ismi || '-'}</td>
              <td style="font-size:12px;color:#64748b">${formatSana(x.sana)}</td>
              <td><button class="btn btn-danger btn-sm btn-icon" onclick="xarajatOchir(${x.id})"><i class="fas fa-trash"></i></button></td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><i class="fas fa-money-bill"></i><p>Bu davrda xarajat yo\'q</p></div>';
  } catch (e) { toast(e.message, 'error'); }
}

function xarajatQosh() {
  const kategoriyalar = ['Ijara', 'Maosh', 'Kommunal', 'Yuk tashish', 'Ta\'mirlash', 'Boshqa'];
  const kontent = `
    <form onsubmit="xarajatSaqlash(event)">
      <div class="form-group">
        <label>Xarajat nomi *</label>
        <input type="text" name="nomi" required placeholder="Masalan: Oylik ijara">
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Summa (so'm) *</label>
          <input type="number" name="summa" min="1" required placeholder="0">
        </div>
        <div class="form-group">
          <label>Kategoriya</label>
          <select name="kategoriya" class="filter-select" style="width:100%">
            <option value="">— Tanlang —</option>
            ${kategoriyalar.map(k => `<option>${k}</option>`).join('')}
          </select>
        </div>
      </div>
      <div class="form-group">
        <label>Izoh</label>
        <input type="text" name="izoh" placeholder="Ixtiyoriy izoh">
      </div>
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-danger"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
  modalOch('Yangi xarajat', kontent);
}

async function xarajatSaqlash(e) {
  e.preventDefault();
  const form = e.target;
  try {
    await apiPost('/xarajatlar', { nomi: form.nomi.value, summa: parseFloat(form.summa.value), kategoriya: form.kategoriya.value, izoh: form.izoh.value, foydalanuvchi_id: joriyFoydalanuvchi.id });
    toast('Xarajat qo\'shildi!'); modalYop(); xarajatlarYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function xarajatOchir(id) {
  tasdiqlash('Bu xarajatni o\'chirasizmi?', async () => {
    try { await apiDelete('/xarajatlar/' + id); toast('Xarajat o\'chirildi!'); xarajatlarYukla(); }
    catch (e) { toast(e.message, 'error'); }
  });
}
