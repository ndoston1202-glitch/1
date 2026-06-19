async function xodimlarYukla() {
  if (joriyFoydalanuvchi.rol !== 'admin') {
    document.getElementById('asosiyKontent').innerHTML = '<div class="empty-state"><i class="fas fa-lock fa-3x"></i><p>Bu sahifaga faqat admin kirishi mumkin!</p></div>';
    return;
  }
  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = `
    <div class="card">
      <div class="card-header">
        <h3><i class="fas fa-users"></i> Xodimlar boshqaruvi</h3>
        <button class="btn btn-primary" onclick="xodimQosh()"><i class="fas fa-user-plus"></i> Yangi xodim</button>
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
    document.getElementById('xodimlarJadval').innerHTML = xodimlar.length ? `
      <div class="table-wrapper">
        <table>
          <thead>
            <tr><th>#</th><th>Ismi</th><th>Username</th><th>Rol</th><th>Telefon</th><th>Holat</th><th>Yaratilgan</th><th>Amallar</th></tr>
          </thead>
          <tbody>
            ${xodimlar.map((x, i) => `
              <tr>
                <td>${i+1}</td>
                <td><b>${x.ism} ${x.familiya}</b></td>
                <td><code style="background:#f1f5f9;padding:2px 6px;border-radius:4px">${x.username}</code></td>
                <td>
                  <span class="badge ${x.rol==='admin'?'badge-warning':'badge-info'}">
                    ${x.rol==='admin'?'👑 Admin':'💼 Kassir'}
                  </span>
                </td>
                <td>${x.telefon || '-'}</td>
                <td>
                  <span class="badge ${x.faol?'badge-success':'badge-danger'}">
                    ${x.faol?'✅ Faol':'❌ Nofaol'}
                  </span>
                </td>
                <td style="font-size:12px;color:#64748b">${formatSana(x.yaratilgan)}</td>
                <td>
                  <button class="btn btn-warning btn-sm btn-icon" title="Tahrirlash" onclick="xodimTahrir(${x.id})"><i class="fas fa-edit"></i></button>
                  ${x.username !== 'admin' ? `<button class="btn btn-danger btn-sm btn-icon" title="O'chirish" onclick="xodimOchir(${x.id},'${x.ism} ${x.familiya}')"><i class="fas fa-trash"></i></button>` : ''}
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><i class="fas fa-users"></i><p>Xodim topilmadi</p></div>';
  } catch (e) { toast(e.message, 'error'); }
}

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
          <input type="text" name="username" required value="${x ? x.username : ''}" ${x && x.username==='admin' ? 'readonly' : ''}>
        </div>
        <div class="form-group">
          <label>Parol ${x ? '(o\'zgartirish uchun)' : '*'}</label>
          <input type="password" name="parol" ${x ? '' : 'required'} placeholder="${x ? 'Yangi parol kiriting' : 'Parol'}">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Rol *</label>
          <select name="rol" class="filter-select" style="width:100%" ${x && x.username==='admin' ? 'disabled' : ''}>
            <option value="kassir" ${x && x.rol==='kassir'?'selected':''}>💼 Kassir</option>
            <option value="admin" ${x && x.rol==='admin'?'selected':''}>👑 Admin</option>
          </select>
        </div>
        <div class="form-group">
          <label>Telefon</label>
          <input type="text" name="telefon" value="${x ? (x.telefon || '') : ''}" placeholder="+998 90 123 45 67">
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
  const data = {
    ism: form.ism.value,
    familiya: form.familiya.value,
    username: form.username.value,
    parol: form.parol.value || undefined,
    rol: form.rol ? form.rol.value : 'admin',
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
    try { await apiDelete('/foydalanuvchilar/' + id); toast('Xodim o\'chirildi!'); xodimlarRoyxatYukla(); }
    catch (e) { toast(e.message, 'error'); }
  });
}
