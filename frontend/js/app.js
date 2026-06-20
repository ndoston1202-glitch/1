// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('loginUsername').value;
  const parol = document.getElementById('loginParol').value;
  const xatoDiv = document.getElementById('loginXato');
  xatoDiv.style.display = 'none';
  try {
    const data = await apiPost('/login', { username, parol });
    joriyFoydalanuvchi = data.foydalanuvchi;
    localStorage.setItem('foydalanuvchi', JSON.stringify(joriyFoydalanuvchi));
    ilovaYukla();
  } catch (e) {
    xatoDiv.textContent = e.message;
    xatoDiv.style.display = 'block';
  }
});

function ilovaYukla() {
  document.getElementById('loginSahifa').style.display = 'none';
  document.getElementById('asosiyIlova').style.display = 'flex';
  document.getElementById('asosiyIlova').style.flexDirection = 'row';

  document.getElementById('sidebarUserIsm').textContent = joriyFoydalanuvchi.ism + ' ' + joriyFoydalanuvchi.familiya;
  document.getElementById('sidebarUserRol').textContent = joriyFoydalanuvchi.rol === 'admin' ? '👑 Admin' : '💼 Kassir';
  document.getElementById('topbarUser').textContent = joriyFoydalanuvchi.ism;

  // Admin menyu
  if (joriyFoydalanuvchi.rol === 'admin') {
    document.querySelectorAll('.admin-only').forEach(el => el.style.display = 'flex');
  }

  // Sana
  const sanani = () => {
    const h = new Date();
    document.getElementById('topbarSana').textContent = h.toLocaleString('uz-UZ', { weekday:'short', day:'numeric', month:'long', hour:'2-digit', minute:'2-digit' });
  };
  sanani(); setInterval(sanani, 60000);

  sozlamalarniQolla();
  sahifaOch('dashboard');
}

// ===== SAHIFALAR =====
function sahifaOch(nomi) {
  // Menyu faollashtirish
  document.querySelectorAll('.sidebar-menu li').forEach(li => li.classList.remove('active'));
  const menuEl = document.getElementById('menu-' + nomi);
  if (menuEl) menuEl.classList.add('active');

  const nomlar = {
    dashboard: '📊 Dashboard',
    kassa: '🛒 Kassa / Sotuv',
    mahsulotlar: '🏪 Ombor / Mahsulotlar',
    hisobot: '📈 Hisobotlar',
    jurnal: '📖 Jurnal',
    mijozlar: '👥 Mijozlar',
    xodimlar: '👔 HR / Xodimlar',
    sozlamalar: '⚙️ Sozlamalar'
  };
  document.getElementById('sahifaNomi').textContent = nomlar[nomi] || nomi;

  // Mobile: sidebar yop
  document.getElementById('sidebar').classList.remove('ochiq');
  document.getElementById('overlay').classList.remove('ochiq');

  const kontent = document.getElementById('asosiyKontent');
  kontent.innerHTML = '<div style="text-align:center;padding:40px"><i class="fas fa-spinner fa-spin fa-2x" style="color:#2563eb"></i></div>';

  switch(nomi) {
    case 'dashboard': dashboardYukla(); break;
    case 'kassa': kassaYukla(); break;
    case 'mahsulotlar': mahsulotlarYukla('mahsulotlar'); break;
    case 'ombor': mahsulotlarYukla('ombor'); break;
    case 'hisobot': hisobotYukla(); break;
    case 'jurnal': jurnalYukla(); break;
    case 'xodimlar': xodimlarYukla(); break;
    case 'mijozlar': mijozlarYukla(); break;
    case 'sozlamalar': sozlamalarYukla(); break;
  }
}

// ===== SIDEBAR TOGGLE =====
function sidebarToggle() {
  document.getElementById('sidebar').classList.toggle('ochiq');
  document.getElementById('overlay').classList.toggle('ochiq');
}

// ===== CHIQISH =====
function chiqish() {
  joriyFoydalanuvchi = null;
  localStorage.removeItem('foydalanuvchi');
  document.getElementById('asosiyIlova').style.display = 'none';
  document.getElementById('loginSahifa').style.display = 'flex';
  document.getElementById('loginUsername').value = '';
  document.getElementById('loginParol').value = '';
}

// ===== SAHIFA YUKLANGANDA =====
window.addEventListener('load', () => {
  const saqlangan = localStorage.getItem('foydalanuvchi');
  if (saqlangan) {
    joriyFoydalanuvchi = JSON.parse(saqlangan);
    ilovaYukla();
  }
});
