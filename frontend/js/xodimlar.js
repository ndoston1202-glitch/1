async function xodimlarYukla() {
  if (joriyFoydalanuvchi.rol !== 'admin') {
    document.getElementById('asosiyKontent').innerHTML = `
      <div class="empty-state"><i class="fas fa-lock fa-3x"></i><p>Bu sahifaga faqat admin kirishi mumkin!</p></div>`;
    return;
  }
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-id-badge"></i> HR / Xodimlar boshqaruvi</h3>
        <button class="btn btn-primary" onclick="xodimQosh()">
          <i class="fas fa-user-plus"></i> Yangi xodim
        </button>
      </div>
      <div class="card-body" id="xodimlarJadval">
        <div style="text-align:center"><i class="fas fa-spinner fa-spin fa-2x"></i></div>
      </div>
    </div>`;
  await xodimlarRoyxatYukla();
}

async function xodimlarRoyxatYukla() {
  try {
    const xodimlar = await apiGet('/foydalanuvchilar');
    const div = document.getElementById('xodimlarJadval');
    if (!div) return;
    div.innerHTML = xodimlar.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr>
              <th>#</th><th>Ismi</th><th>Username</th>
              <th>Rol</th><th>Telefon</th><th>Holat</th>
              <th>Yaratilgan</th><th>Amallar</th>
            </tr>
          </thead>
          <tbody>
            ${xodimlar.map((x, i) => `
              <tr>
                <td>${i+1}</td>
                <td>
                  <div style="display:flex;align-items:center;gap:8px">
                    <div style="width:34px;height:34px;border-radius:50%;
                      background:${x.rol==='admin'?'#fef3c7':'#dbeafe'};
                      display:flex;align-items:center;justify-content:center;
                      font-weight:700;font-size:13px;flex-shrink:0;
                      color:${x.rol==='admin'?'#92400e':'#1d4ed8'}">
                      ${x.ism[0].toUpperCase()}
                    </div>
                    <div>
                      <div style="font-weight:600">${x.ism} ${x.familiya}</div>
                      <div style="font-size:11px;color:#64748b">${x.telefon||''}</div>
                    </div>
                  </div>
                </td>
                <td><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px">${x.username}</code></td>
                <td>
                  <div style="display:flex;align-items:center;gap:6px">
                    <span class="badge ${x.rol==='admin'?'badge-warning':'badge-info'}">
                      ${x.rol==='admin'?'👑 Admin':'💼 Kassir'}
                    </span>
                    ${x.username !== 'admin' ? `
                      <button class="btn btn-sm" 
                        style="font-size:11px;padding:3px 10px;background:${x.rol==='admin'?'#dbeafe':'#fef3c7'};color:${x.rol==='admin'?'#1d4ed8':'#92400e'};border:1px solid ${x.rol==='admin'?'#93c5fd':'#fcd34d'};border-radius:6px;cursor:pointer"
                        onclick="rolTezOzgartir(${x.id},'${x.rol}','${x.ism} ${x.familiya}')"
                        title="${x.rol==='admin'?'Kassirga o\'tkazish':'Adminga o\'tkazish'}">
                        <i class="fas fa-exchange-alt"></i>
                        ${x.rol==='admin'?'→ Kassir':'→ Admin'}
                      </button>` : ''}
                  </div>
                </td>
                <td>${x.telefon || '-'}</td>
                <td>
                  <span class="badge ${x.faol?'badge-success':'badge-danger'}" style="cursor:pointer"
                    onclick="${x.username!=='admin'?`holatTezOzgartir(${x.id},${x.faol},'${x.ism}')`:''}">
                    ${x.faol?'✅ Faol':'❌ Nofaol'}
                  </span>
                </td>
                <td style="font-size:12px;color:#64748b">${formatSana(x.yaratilgan)}</td>
                <td>
                  <button class="btn btn-warning btn-sm btn-icon" title="Tahrirlash"
                    onclick="xodimTahrir(${x.id})"><i class="fas fa-edit"></i></button>
                  ${x.username !== 'admin' ? `
                    <button class="btn btn-danger btn-sm btn-icon" title="O'chirish"
                      onclick="xodimOchir(${x.id},'${x.ism} ${x.familiya}')">
                      <i class="fas fa-trash"></i>
                    </button>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>
      <div style="padding:10px;color:#64748b;font-size:13px">
        Jami: ${xodimlar.length} ta xodim |
        Admin: ${xodimlar.filter(x=>x.rol==='admin').length} |
        Kassir: ${xodimlar.filter(x=>x.rol==='kassir').length}
      </div>` :
      '<div class="empty-state"><i class="fas fa-users"></i><p>Xodim topilmadi</p></div>';
  } catch (e) { toast(e.message, 'error'); }
}

// ===== ROLNI TEZDA O'ZGARTIRISH =====
async function rolTezOzgartir(id, joriyRol, ism) {
  const yangiRol = joriyRol === 'admin' ? 'kassir' : 'admin';
  const yangiIcon = yangiRol === 'admin' ? '👑' : '💼';
  const yangiNomi = yangiRol === 'admin' ? 'Admin' : 'Kassir';

  window._tasdiqlashCallback = async () => {
    try {
      const xodimlar = await apiGet('/foydalanuvchilar');
      const x = xodimlar.find(u => u.id == id);
      if (!x) return;
      await apiPut('/foydalanuvchilar/' + id, { ...x, rol: yangiRol, faol: x.faol });
      toast(`✅ ${ism} → ${yangiIcon} ${yangiNomi}`, 'success');
      xodimlarRoyxatYukla();
    } catch (e) { toast(e.message, 'error'); }
  };

  modalOch('Rolni o\'zgartirish', `
    <div style="text-align:center;padding:10px">
      <div style="font-size:48px;margin-bottom:12px">${yangiIcon}</div>
      <p style="font-size:15px;margin-bottom:4px">
        <b>"${ism}"</b>
      </p>
      <p style="color:#64748b;font-size:14px;margin-bottom:20px">
        ${joriyRol==='admin'?'👑 Admin':'💼 Kassir'} 
        <i class="fas fa-arrow-right" style="margin:0 8px;color:#94a3b8"></i> 
        ${yangiIcon} ${yangiNomi}
      </p>
      <div style="display:flex;gap:8px;justify-content:center">
        <button class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button class="btn btn-warning" onclick="modalYop();window._tasdiqlashCallback()">
          <i class="fas fa-check"></i> Tasdiqlash
        </button>
      </div>
    </div>`);
}

// ===== HOLATNI TEZDA O'ZGARTIRISH =====
async function holatTezOzgartir(id, joriyHolat, ism) {
  const yangiHolat = joriyHolat ? 0 : 1;
  const nomi = yangiHolat ? 'faollashtirish' : 'nofaol qilish';
  tasdiqlash(`"${ism}" xodimini ${nomi}?`, async () => {
    try {
      const xodimlar = await apiGet('/foydalanuvchilar');
      const x = xodimlar.find(u => u.id == id);
      if (!x) return;
      await apiPut('/foydalanuvchilar/' + id, { ...x, faol: yangiHolat });
      toast(`✅ Xodim holati o'zgartirildi!`, 'success');
      xodimlarRoyxatYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}

// ===== QO'SHISH / TAHRIRLASH =====
function xodimFormKontent(x = null) {
  return `
    <form onsubmit="xodimSaqlash(event,${x ? x.id : 'null'})">
      <div class="form-row">
        <div class="form-group">
          <label>Ismi *</label>
          <input type="text" name="ism" required value="${x ? x.ism : ''}">
        </div>
        <div class="form-group">
          <label>Familiyasi *</label>
          <input type="text" name="familiya" required value="${x ? x.familiya : ''}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Username *</label>
          <input type="text" name="username" required value="${x ? x.username : ''}"
            ${x && x.username==='admin' ? 'readonly' : ''}>
        </div>
        <div class="form-group">
          <label>Parol ${x ? '(o\'zgartirish uchun)' : '*'}</label>
          <input type="password" name="parol" ${x ? '' : 'required'}
            placeholder="${x ? 'Yangi parol kiriting' : 'Parol'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Rol *</label>
          <div style="display:flex;gap:8px;margin-top:4px">
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;
              border:2px solid ${x&&x.rol==='kassir'?'#3b82f6':'#e2e8f0'};border-radius:8px;flex:1">
              <input type="radio" name="rol" value="kassir" ${!x||x.rol==='kassir'?'checked':''}
                ${x&&x.username==='admin'?'disabled':''}>
              💼 Kassir
            </label>
            <label style="display:flex;align-items:center;gap:6px;cursor:pointer;padding:8px 12px;
              border:2px solid ${x&&x.rol==='admin'?'#f59e0b':'#e2e8f0'};border-radius:8px;flex:1">
              <input type="radio" name="rol" value="admin" ${x&&x.rol==='admin'?'checked':''}
                ${x&&x.username==='admin'?'disabled':''}>
              👑 Admin
            </label>
          </div>
        </div>
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" name="telefon" value="${x ? (x.telefon || '') : ''}"
            placeholder="+998 90 123 45 67">
        </div>
      </div>
      ${x ? `
        <div class="form-group">
          <label>Holat</label>
          <select name="faol" class="filter-select" style="width:100%">
            <option value="1" ${x.faol?'selected':''}>✅ Faol</option>
            <option value="0" ${!x.faol?'selected':''}>❌ Nofaol</option>
          </select>
        </div>` : ''}
      <div class="modal-footer" style="padding:0;margin-top:10px">
        <button type="button" class="btn btn-secondary" onclick="modalYop()">Bekor</button>
        <button type="submit" class="btn btn-primary"><i class="fas fa-save"></i> Saqlash</button>
      </div>
    </form>`;
}

function xodimQosh() {
  modalOch('Yangi xodim qo\'shish', xodimFormKontent());
}

async function xodimTahrir(id) {
  try {
    const xodimlar = await apiGet('/foydalanuvchilar');
    const x = xodimlar.find(u => u.id == id);
    if (!x) return;
    modalOch('Xodimni tahrirlash', xodimFormKontent(x));
  } catch (e) { toast(e.message, 'error'); }
}

async function xodimSaqlash(e, id) {
  e.preventDefault();
  const form = e.target;
  const rolRadio = form.querySelector('[name=rol]:checked');
  const data = {
    ism: form.ism.value,
    familiya: form.familiya.value,
    username: form.username.value,
    parol: form.parol.value || undefined,
    rol: rolRadio ? rolRadio.value : 'kassir',
    telefon: form.telefon.value,
    faol: form.faol ? parseInt(form.faol.value) : 1
  };
  if (!data.parol) delete data.parol;
  try {
    if (id) { await apiPut('/foydalanuvchilar/' + id, data); toast('Xodim yangilandi!'); }
    else { await apiPost('/foydalanuvchilar', data); toast('Xodim qo\'shildi!'); }
    modalYop();
    xodimlarRoyxatYukla();
  } catch (e) { toast(e.message, 'error'); }
}

function xodimOchir(id, nomi) {
  tasdiqlash(`"${nomi}" xodimini o'chirasizmi?`, async () => {
    try {
      await apiDelete('/foydalanuvchilar/' + id);
      toast('Xodim o\'chirildi!');
      xodimlarRoyxatYukla();
    } catch (e) { toast(e.message, 'error'); }
  });
}
