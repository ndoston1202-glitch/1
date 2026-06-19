const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'dokoni.db'));

// Jadvallarni yaratish
db.exec(`
  -- Foydalanuvchilar (xodimlar)
  CREATE TABLE IF NOT EXISTS foydalanuvchilar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ism TEXT NOT NULL,
    familiya TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    parol TEXT NOT NULL,
    rol TEXT NOT NULL DEFAULT 'kassir', -- 'admin' yoki 'kassir'
    telefon TEXT,
    yaratilgan TEXT DEFAULT (datetime('now','localtime')),
    faol INTEGER DEFAULT 1
  );

  -- Kategoriyalar
  CREATE TABLE IF NOT EXISTS kategoriyalar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomi TEXT NOT NULL UNIQUE,
    tavsif TEXT,
    yaratilgan TEXT DEFAULT (datetime('now','localtime'))
  );

  -- Mahsulotlar
  CREATE TABLE IF NOT EXISTS mahsulotlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomi TEXT NOT NULL,
    kategoriya_id INTEGER,
    shtrix_kod TEXT UNIQUE,
    birlik TEXT NOT NULL DEFAULT 'dona', -- dona, kg, m, m2, litr
    kelish_narxi REAL NOT NULL DEFAULT 0,
    sotish_narxi REAL NOT NULL DEFAULT 0,
    miqdor REAL NOT NULL DEFAULT 0,
    min_miqdor REAL DEFAULT 5,
    tavsif TEXT,
    yaratilgan TEXT DEFAULT (datetime('now','localtime')),
    yangilangan TEXT DEFAULT (datetime('now','localtime')),
    faol INTEGER DEFAULT 1,
    FOREIGN KEY (kategoriya_id) REFERENCES kategoriyalar(id)
  );

  -- Sotuvlar (chek boshi)
  CREATE TABLE IF NOT EXISTS sotuvlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    chek_raqam TEXT UNIQUE NOT NULL,
    kassir_id INTEGER NOT NULL,
    jami_summa REAL NOT NULL DEFAULT 0,
    chegirma REAL DEFAULT 0,
    tolov_turi TEXT DEFAULT 'naqd', -- naqd, karta, qarz
    mijoz_ismi TEXT,
    mijoz_telefon TEXT,
    izoh TEXT,
    sana TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (kassir_id) REFERENCES foydalanuvchilar(id)
  );

  -- Sotuv tafsilotlari
  CREATE TABLE IF NOT EXISTS sotuv_tafsilotlari (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sotuv_id INTEGER NOT NULL,
    mahsulot_id INTEGER NOT NULL,
    miqdor REAL NOT NULL,
    narxi REAL NOT NULL,
    jami REAL NOT NULL,
    FOREIGN KEY (sotuv_id) REFERENCES sotuvlar(id),
    FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
  );

  -- Ombor kirim
  CREATE TABLE IF NOT EXISTS ombor_kirim (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mahsulot_id INTEGER NOT NULL,
    miqdor REAL NOT NULL,
    kelish_narxi REAL NOT NULL,
    yetkazuvchi TEXT,
    izoh TEXT,
    foydalanuvchi_id INTEGER,
    sana TEXT DEFAULT (datetime('now','localtime')),
    FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id),
    FOREIGN KEY (foydalanuvchi_id) REFERENCES foydalanuvchilar(id)
  );

  -- Xarajatlar
  CREATE TABLE IF NOT EXISTS xarajatlar (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    nomi TEXT NOT NULL,
    summa REAL NOT NULL,
    kategoriya TEXT,
    foydalanuvchi_id INTEGER,
    sana TEXT DEFAULT (datetime('now','localtime')),
    izoh TEXT,
    FOREIGN KEY (foydalanuvchi_id) REFERENCES foydalanuvchilar(id)
  );
`);

// Default admin yaratish
const adminBor = db.prepare("SELECT * FROM foydalanuvchilar WHERE username = 'admin'").get();
if (!adminBor) {
  db.prepare(`
    INSERT INTO foydalanuvchilar (ism, familiya, username, parol, rol)
    VALUES ('Admin', 'Superadmin', 'admin', 'admin123', 'admin')
  `).run();
}

// Default kategoriyalar
const katBor = db.prepare("SELECT COUNT(*) as son FROM kategoriyalar").get();
if (katBor.son === 0) {
  const kategoriyalar = [
    ['Tsement va qorishmalar', 'Tsement, ohak, gips va boshqalar'],
    ['G\'isht va bloklar', 'Qizil g\'isht, gaz blok, penoblok'],
    ['Qum va shag\'al', 'Qurilish qumi, shag\'al, tosh'],
    ['Temir va metall', 'Armatura, profil, list, truba'],
    ['Yog\'och va taxta', 'Taxta, fanera, DSP, OSB'],
    ['Santexnika', 'Quvur, kran, unitaz, lavabo'],
    ['Elektr materiallari', 'Kabel, rozetka, avtomat'],
    ['Bo\'yoq va lak', 'Devor bo\'yog\'i, lak, gruntovka'],
    ['Plitkalar', 'Devor va pol plitkalari'],
    ['Shifer va tom', 'Shifer, profnastil, metallocherepitsa'],
    ['Oyna va eshik', 'Oyna, eshik, deraza'],
    ['Asbob-uskunalar', 'Perforator, bolg\'a, arra'],
    ['Boshqa materiallar', 'Qolgan qurilish materiallari']
  ];
  const insertKat = db.prepare("INSERT INTO kategoriyalar (nomi, tavsif) VALUES (?, ?)");
  kategoriyalar.forEach(([nomi, tavsif]) => insertKat.run(nomi, tavsif));
}

module.exports = db;
