async function dashboardYukla() {
  const kontent = document.getElementById('asosiyKontent');
  try {
    const stat = await apiGet('/hisobot/umumiy');
    kontent.innerHTML = `
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-shopping-cart"></i></div>
          <div class="stat-info">
            <h3>${stat.bugun_sotuv.son || 0}</h3>
            <p>Bugungi sotuvlar</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon green"><i class="fas fa-money-bill-wave"></i></div>
          <div class="stat-info">
            <h3>${formatSum(stat.bugun_sotuv.jami)}</h3>
            <p>Bugungi daromad</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon orange"><i class="fas fa-calendar-alt"></i></div>
          <div class="stat-info">
            <h3>${formatSum(stat.oy_sotuv.jami)}</h3>
            <p>Oylik daromad</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon purple"><i class="fas fa-boxes"></i></div>
          <div class="stat-info">
            <h3>${stat.mahsulotlar_soni.son}</h3>
            <p>Jami mahsulotlar</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon red"><i class="fas fa-exclamation-triangle"></i></div>
          <div class="stat-info">
            <h3>${stat.kam_miqdor.son}</h3>
            <p>Kam qolgan mahsulot</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon blue"><i class="fas fa-receipt"></i></div>
          <div class="stat-info">
            <h3>${stat.jami_sotuv.son}</h3>
            <p>Jami sotuvlar</p>
          </div>
        </div>
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;flex-wrap:wrap">
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-clock"></i> Oxirgi sotuvlar</h3>
            <button class="btn btn-primary btn-sm" onclick="sahifaOch('kassa')">
              <i class="fas fa-plus"></i> Yangi sotuv
            </button>
          </div>
          <div class="card-body" id="oxirgiSotuvlar">
            <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>
        <div class="card">
          <div class="card-header">
            <h3><i class="fas fa-exclamation-circle" style="color:#ef4444"></i> Kam qolgan mahsulotlar</h3>
            <button class="btn btn-warning btn-sm" onclick="sahifaOch('ombor')">
              <i class="fas fa-plus"></i> Kirim
            </button>
          </div>
          <div class="card-body" id="kamMahsulotlar">
            <div style="text-align:center"><i class="fas fa-spinner fa-spin"></i></div>
          </div>
        </div>
      </div>
    `;

    // Oxirgi sotuvlar
    const sotuvlar = await apiGet('/sotuvlar');
    const oxirgi = sotuvlar.slice(0, 8);
    document.getElementById('oxirgiSotuvlar').innerHTML = oxirgi.length ? `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Chek</th><th>Kassir</th><th>Summa</th><th>Sana</th></tr></thead>
          <tbody>${oxirgi.map(s => `
            <tr>
              <td><span class="badge badge-info">${s.chek_raqam}</span></td>
              <td>${s.kassir_ismi}</td>
              <td><b>${formatSum(s.jami_summa)}</b></td>
              <td style="font-size:12px;color:#64748b">${formatSana(s.sana)}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><i class="fas fa-shopping-cart"></i><p>Hali sotuv yo\'q</p></div>';

    // Kam mahsulotlar
    const kamlar = await apiGet('/mahsulotlar?kam_miqdor=1');
    document.getElementById('kamMahsulotlar').innerHTML = kamlar.length ? `
      <div class="table-wrapper">
        <table>
          <thead><tr><th>Mahsulot</th><th>Mavjud</th><th>Minimum</th></tr></thead>
          <tbody>${kamlar.slice(0,8).map(m => `
            <tr>
              <td>${m.nomi}</td>
              <td><span class="badge badge-danger">${m.miqdor} ${m.birlik}</span></td>
              <td>${m.min_miqdor} ${m.birlik}</td>
            </tr>`).join('')}
          </tbody>
        </table>
      </div>` : '<div class="empty-state"><i class="fas fa-check-circle" style="color:#10b981"></i><p>Barcha mahsulotlar yetarli</p></div>';

  } catch (e) {
    kontent.innerHTML = `<div class="empty-state"><i class="fas fa-exclamation-triangle"></i><p>${e.message}</p></div>`;
  }
}
