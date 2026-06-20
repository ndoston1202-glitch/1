const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));

// ==================== AUTH ====================
app.post('/api/login', (req, res) => {
  const { username, parol } = req.body;
  const user = db.prepare("SELECT * FROM foydalanuvchilar WHERE username=? AND parol=? AND faol=1").get(username, parol);
  if (!user) return res.status(401).json({ xato: "Username yoki parol noto'g'ri!" });
  const { parol: _, ...userInfo } = user;
  res.json({ muvaffaqiyat: true, foydalanuvchi: userInfo });
});

// ==================== FOYDALANUVCHILAR ====================
app.get('/api/foydalanuvchilar', (req, res) => {
  const list = db.prepare("SELECT id,ism,familiya,username,rol,telefon,yaratilgan,faol FROM foydalanuvchilar").all();
  res.json(list);
});

app.post('/api/foydalanuvchilar', (req, res) => {
  const { ism, familiya, username, parol, rol, telefon } = req.body;
  try {
    const r = db.prepare("INSERT INTO foydalanuvchilar (ism,familiya,username,parol,rol,telefon) VALUES (?,?,?,?,?,?)").run(ism, familiya, username, parol, rol || 'kassir', telefon || '');
    res.json({ muvaffaqiyat: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ xato: "Bu username allaqachon mavjud!" });
  }
});

app.put('/api/foydalanuvchilar/:id', (req, res) => {
  const { ism, familiya, username, parol, rol, telefon, faol } = req.body;
  const { id } = req.params;
  if (parol) {
    db.prepare("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,parol=?,rol=?,telefon=?,faol=? WHERE id=?").run(ism, familiya, username, parol, rol, telefon, faol, id);
  } else {
    db.prepare("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,rol=?,telefon=?,faol=? WHERE id=?").run(ism, familiya, username, rol, telefon, faol, id);
  }
  res.json({ muvaffaqiyat: true });
});

app.delete('/api/foydalanuvchilar/:id', (req, res) => {
  db.prepare("UPDATE foydalanuvchilar SET faol=0 WHERE id=?").run(req.params.id);
  res.json({ muvaffaqiyat: true });
});

// ==================== KATEGORIYALAR ====================
app.get('/api/kategoriyalar', (req, res) => {
  res.json(db.prepare("SELECT * FROM kategoriyalar ORDER BY nomi").all());
});

app.post('/api/kategoriyalar', (req, res) => {
  const { nomi, tavsif } = req.body;
  try {
    const r = db.prepare("INSERT INTO kategoriyalar (nomi,tavsif) VALUES (?,?)").run(nomi, tavsif || '');
    res.json({ muvaffaqiyat: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ xato: "Bu kategoriya allaqachon mavjud!" });
  }
});

app.put('/api/kategoriyalar/:id', (req, res) => {
  const { nomi, tavsif } = req.body;
  db.prepare("UPDATE kategoriyalar SET nomi=?,tavsif=? WHERE id=?").run(nomi, tavsif, req.params.id);
  res.json({ muvaffaqiyat: true });
});

app.delete('/api/kategoriyalar/:id', (req, res) => {
  db.prepare("DELETE FROM kategoriyalar WHERE id=?").run(req.params.id);
  res.json({ muvaffaqiyat: true });
});

// ==================== MAHSULOTLAR ====================
app.get('/api/mahsulotlar', (req, res) => {
  const { qidiruv, kategoriya, kam_miqdor } = req.query;
  let sql = `SELECT m.*, k.nomi as kategoriya_nomi FROM mahsulotlar m
             LEFT JOIN kategoriyalar k ON m.kategoriya_id = k.id WHERE m.faol=1`;
  const params = [];
  if (qidiruv) { sql += " AND (m.nomi LIKE ? OR m.shtrix_kod LIKE ?)"; params.push(`%${qidiruv}%`, `%${qidiruv}%`); }
  if (kategoriya) { sql += " AND m.kategoriya_id=?"; params.push(kategoriya); }
  if (kam_miqdor === '1') { sql += " AND m.miqdor <= m.min_miqdor"; }
  sql += " ORDER BY m.nomi";
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/mahsulotlar/:id', (req, res) => {
  const m = db.prepare("SELECT m.*, k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.id=?").get(req.params.id);
  if (!m) return res.status(404).json({ xato: "Mahsulot topilmadi" });
  res.json(m);
});

app.post('/api/mahsulotlar', (req, res) => {
  const { nomi, kategoriya_id, shtrix_kod, birlik, kelish_narxi, sotish_narxi, miqdor, min_miqdor, tavsif } = req.body;
  try {
    const r = db.prepare(`INSERT INTO mahsulotlar (nomi,kategoriya_id,shtrix_kod,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,tavsif)
      VALUES (?,?,?,?,?,?,?,?,?)`).run(nomi, kategoriya_id, shtrix_kod || null, birlik || 'dona', kelish_narxi || 0, sotish_narxi || 0, miqdor || 0, min_miqdor || 5, tavsif || '');
    res.json({ muvaffaqiyat: true, id: r.lastInsertRowid });
  } catch (e) {
    res.status(400).json({ xato: "Shtrix kod takrorlanmoqda yoki xato ma'lumot!" });
  }
});

app.put('/api/mahsulotlar/:id', (req, res) => {
  const { nomi, kategoriya_id, shtrix_kod, birlik, kelish_narxi, sotish_narxi, miqdor, min_miqdor, tavsif } = req.body;
  db.prepare(`UPDATE mahsulotlar SET nomi=?,kategoriya_id=?,shtrix_kod=?,birlik=?,kelish_narxi=?,sotish_narxi=?,
    miqdor=?,min_miqdor=?,tavsif=?,yangilangan=datetime('now','localtime') WHERE id=?`)
    .run(nomi, kategoriya_id, shtrix_kod || null, birlik, kelish_narxi, sotish_narxi, miqdor, min_miqdor, tavsif || '', req.params.id);
  res.json({ muvaffaqiyat: true });
});

app.delete('/api/mahsulotlar/:id', (req, res) => {
  db.prepare("UPDATE mahsulotlar SET faol=0 WHERE id=?").run(req.params.id);
  res.json({ muvaffaqiyat: true });
});

// ==================== SOTUVLAR ====================
app.get('/api/sotuvlar', (req, res) => {
  const { boshlanish, tugash, kassir_id } = req.query;
  let sql = `SELECT s.*, f.ism||' '||f.familiya as kassir_ismi FROM sotuvlar s
             LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE 1=1`;
  const params = [];
  if (boshlanish) { sql += " AND date(s.sana) >= ?"; params.push(boshlanish); }
  if (tugash) { sql += " AND date(s.sana) <= ?"; params.push(tugash); }
  if (kassir_id) { sql += " AND s.kassir_id=?"; params.push(kassir_id); }
  sql += " ORDER BY s.sana DESC";
  res.json(db.prepare(sql).all(...params));
});

app.get('/api/sotuvlar/:id', (req, res) => {
  const sotuv = db.prepare("SELECT s.*, f.ism||' '||f.familiya as kassir_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE s.id=?").get(req.params.id);
  if (!sotuv) return res.status(404).json({ xato: "Sotuv topilmadi" });
  const tafsilotlar = db.prepare("SELECT st.*, m.nomi as mahsulot_nomi, m.birlik FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id WHERE st.sotuv_id=?").all(req.params.id);
  res.json({ ...sotuv, tafsilotlar });
});

app.post('/api/sotuvlar', (req, res) => {
  const { kassir_id, mahsulotlar, chegirma, tolov_turi, mijoz_ismi, mijoz_telefon, izoh } = req.body;
  if (!mahsulotlar || mahsulotlar.length === 0) return res.status(400).json({ xato: "Mahsulot tanlanmagan!" });

  const chek_raqam = 'CHK' + Date.now();
  let jami = 0;
  mahsulotlar.forEach(m => { jami += m.miqdor * m.narxi; });
  const chegirmaSum = chegirma || 0;
  const yakuniy = jami - chegirmaSum;

  // Mahsulot miqdorini tekshirish
  for (const m of mahsulotlar) {
    const mah = db.prepare("SELECT miqdor, nomi FROM mahsulotlar WHERE id=?").get(m.mahsulot_id);
    if (!mah || mah.miqdor < m.miqdor) {
      return res.status(400).json({ xato: `"${mah?.nomi || 'Mahsulot'}" omborda yetarli emas! Mavjud: ${mah?.miqdor || 0}` });
    }
  }

  const insertSotuv = db.prepare("INSERT INTO sotuvlar (chek_raqam,kassir_id,jami_summa,chegirma,tolov_turi,mijoz_ismi,mijoz_telefon,izoh) VALUES (?,?,?,?,?,?,?,?)");
  const insertTafsil = db.prepare("INSERT INTO sotuv_tafsilotlari (sotuv_id,mahsulot_id,miqdor,narxi,jami) VALUES (?,?,?,?,?)");
  const updateMiqdor = db.prepare("UPDATE mahsulotlar SET miqdor=miqdor-?, yangilangan=datetime('now','localtime') WHERE id=?");

  const transaction = db.transaction(() => {
    const r = insertSotuv.run(chek_raqam, kassir_id, yakuniy, chegirmaSum, tolov_turi || 'naqd', mijoz_ismi || '', mijoz_telefon || '', izoh || '');
    const sotuv_id = r.lastInsertRowid;
    mahsulotlar.forEach(m => {
      insertTafsil.run(sotuv_id, m.mahsulot_id, m.miqdor, m.narxi, m.miqdor * m.narxi);
      updateMiqdor.run(m.miqdor, m.mahsulot_id);
    });
    return sotuv_id;
  });

  const sotuv_id = transaction();
  res.json({ muvaffaqiyat: true, sotuv_id, chek_raqam, jami_summa: yakuniy });
});

app.delete('/api/sotuvlar/:id', (req, res) => {
  // Miqdorlarni qaytarish
  const tafsilotlar = db.prepare("SELECT * FROM sotuv_tafsilotlari WHERE sotuv_id=?").all(req.params.id);
  const transaction = db.transaction(() => {
    tafsilotlar.forEach(t => {
      db.prepare("UPDATE mahsulotlar SET miqdor=miqdor+? WHERE id=?").run(t.miqdor, t.mahsulot_id);
    });
    db.prepare("DELETE FROM sotuv_tafsilotlari WHERE sotuv_id=?").run(req.params.id);
    db.prepare("DELETE FROM sotuvlar WHERE id=?").run(req.params.id);
  });
  transaction();
  res.json({ muvaffaqiyat: true });
});

// ==================== OMBOR KIRIM ====================
app.get('/api/ombor', (req, res) => {
  const { boshlanish, tugash } = req.query;
  let sql = `SELECT o.*, m.nomi as mahsulot_nomi, m.birlik, f.ism||' '||f.familiya as xodim_ismi
             FROM ombor_kirim o JOIN mahsulotlar m ON o.mahsulot_id=m.id
             LEFT JOIN foydalanuvchilar f ON o.foydalanuvchi_id=f.id WHERE 1=1`;
  const params = [];
  if (boshlanish) { sql += " AND date(o.sana) >= ?"; params.push(boshlanish); }
  if (tugash) { sql += " AND date(o.sana) <= ?"; params.push(tugash); }
  sql += " ORDER BY o.sana DESC";
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/ombor', (req, res) => {
  const { mahsulot_id, miqdor, kelish_narxi, yetkazuvchi, izoh, foydalanuvchi_id } = req.body;
  const transaction = db.transaction(() => {
    db.prepare("INSERT INTO ombor_kirim (mahsulot_id,miqdor,kelish_narxi,yetkazuvchi,izoh,foydalanuvchi_id) VALUES (?,?,?,?,?,?)")
      .run(mahsulot_id, miqdor, kelish_narxi, yetkazuvchi || '', izoh || '', foydalanuvchi_id);
    db.prepare("UPDATE mahsulotlar SET miqdor=miqdor+?, kelish_narxi=?, yangilangan=datetime('now','localtime') WHERE id=?")
      .run(miqdor, kelish_narxi, mahsulot_id);
  });
  transaction();
  res.json({ muvaffaqiyat: true });
});

// ==================== XARAJATLAR ====================
app.get('/api/xarajatlar', (req, res) => {
  const { boshlanish, tugash } = req.query;
  let sql = "SELECT x.*, f.ism||' '||f.familiya as xodim_ismi FROM xarajatlar x LEFT JOIN foydalanuvchilar f ON x.foydalanuvchi_id=f.id WHERE 1=1";
  const params = [];
  if (boshlanish) { sql += " AND date(x.sana) >= ?"; params.push(boshlanish); }
  if (tugash) { sql += " AND date(x.sana) <= ?"; params.push(tugash); }
  sql += " ORDER BY x.sana DESC";
  res.json(db.prepare(sql).all(...params));
});

app.post('/api/xarajatlar', (req, res) => {
  const { nomi, summa, kategoriya, foydalanuvchi_id, izoh } = req.body;
  db.prepare("INSERT INTO xarajatlar (nomi,summa,kategoriya,foydalanuvchi_id,izoh) VALUES (?,?,?,?,?)").run(nomi, summa, kategoriya || '', foydalanuvchi_id, izoh || '');
  res.json({ muvaffaqiyat: true });
});

app.delete('/api/xarajatlar/:id', (req, res) => {
  db.prepare("DELETE FROM xarajatlar WHERE id=?").run(req.params.id);
  res.json({ muvaffaqiyat: true });
});

// ==================== HISOBOTLAR ====================
app.get('/api/hisobot/kunlik', (req, res) => {
  const { sana } = req.query;
  const kun = sana || new Date().toISOString().split('T')[0];
  const sotuvlar = db.prepare("SELECT COUNT(*) as son, SUM(jami_summa) as jami FROM sotuvlar WHERE date(sana)=?").get(kun);
  const xarajatlar = db.prepare("SELECT SUM(summa) as jami FROM xarajatlar WHERE date(sana)=?").get(kun);
  const topMahsulotlar = db.prepare(`SELECT m.nomi, SUM(st.miqdor) as jami_miqdor, SUM(st.jami) as jami_summa
    FROM sotuv_tafsilotlari st JOIN mahsulotlar m ON st.mahsulot_id=m.id
    JOIN sotuvlar s ON st.sotuv_id=s.id WHERE date(s.sana)=? GROUP BY m.id ORDER BY jami_summa DESC LIMIT 10`).all(kun);
  res.json({ kun, sotuvlar, xarajatlar, topMahsulotlar });
});

app.get('/api/hisobot/oylik', (req, res) => {
  const { yil, oy } = req.query;
  const y = yil || new Date().getFullYear();
  const o = String(oy || new Date().getMonth() + 1).padStart(2, '0');
  const kunliklar = db.prepare(`SELECT date(sana) as kun, COUNT(*) as sotuvlar_soni, SUM(jami_summa) as jami
    FROM sotuvlar WHERE strftime('%Y-%m', sana)=? GROUP BY date(sana) ORDER BY kun`).all(`${y}-${o}`);
  const jami = db.prepare("SELECT COUNT(*) as son, SUM(jami_summa) as jami FROM sotuvlar WHERE strftime('%Y-%m', sana)=?").get(`${y}-${o}`);
  const xarajatlar = db.prepare("SELECT SUM(summa) as jami FROM xarajatlar WHERE strftime('%Y-%m', sana)=?").get(`${y}-${o}`);
  res.json({ yil: y, oy: o, kunliklar, jami, xarajatlar });
});

app.get('/api/hisobot/umumiy', (req, res) => {
  const mahsulotlar_soni = db.prepare("SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1").get();
  const bugun = new Date().toISOString().split('T')[0];
  const bugun_sotuv = db.prepare("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?").get(bugun);
  const oy = new Date().toISOString().slice(0,7);
  const oy_sotuv = db.prepare("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?").get(oy);
  const kam_miqdor = db.prepare("SELECT COUNT(*) as son FROM mahsulotlar WHERE miqdor<=min_miqdor AND faol=1").get();
  const jami_sotuv = db.prepare("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar").get();
  res.json({ mahsulotlar_soni, bugun_sotuv, oy_sotuv, kam_miqdor, jami_sotuv });
});

// ==================== QIDIRUV (shtrix kod) ====================
app.get('/api/qidiruv/:kod', (req, res) => {
  const m = db.prepare("SELECT m.*, k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.shtrix_kod=? AND m.faol=1").get(req.params.kod);
  if (!m) return res.status(404).json({ xato: "Mahsulot topilmadi" });
  res.json(m);
});

// Frontend sahifalarini serve qilish
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Server ishga tushdi: http://localhost:${PORT}`);
  console.log(`👤 Admin: username=admin, parol=admin123`);
});
