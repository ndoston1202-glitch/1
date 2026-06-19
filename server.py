#!/usr/bin/env python3
import json, sqlite3, os, re
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'dokoni.db')
FRONTEND = os.path.join(os.path.dirname(__file__), 'frontend')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA journal_mode=WAL")
    return conn

def init_db():
    conn = get_db()
    c = conn.cursor()
    c.executescript("""
    CREATE TABLE IF NOT EXISTS foydalanuvchilar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        ism TEXT NOT NULL, familiya TEXT NOT NULL,
        username TEXT UNIQUE NOT NULL, parol TEXT NOT NULL,
        rol TEXT NOT NULL DEFAULT 'kassir',
        telefon TEXT, yaratilgan TEXT DEFAULT (datetime('now','localtime')), faol INTEGER DEFAULT 1
    );
    CREATE TABLE IF NOT EXISTS kategoriyalar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL UNIQUE, tavsif TEXT,
        yaratilgan TEXT DEFAULT (datetime('now','localtime'))
    );
    CREATE TABLE IF NOT EXISTS mahsulotlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL, kategoriya_id INTEGER, shtrix_kod TEXT UNIQUE,
        birlik TEXT NOT NULL DEFAULT 'dona',
        kelish_narxi REAL NOT NULL DEFAULT 0, sotish_narxi REAL NOT NULL DEFAULT 0,
        miqdor REAL NOT NULL DEFAULT 0, min_miqdor REAL DEFAULT 5,
        tavsif TEXT, yaratilgan TEXT DEFAULT (datetime('now','localtime')),
        yangilangan TEXT DEFAULT (datetime('now','localtime')), faol INTEGER DEFAULT 1,
        FOREIGN KEY (kategoriya_id) REFERENCES kategoriyalar(id)
    );
    CREATE TABLE IF NOT EXISTS sotuvlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chek_raqam TEXT UNIQUE NOT NULL, kassir_id INTEGER NOT NULL,
        jami_summa REAL NOT NULL DEFAULT 0, chegirma REAL DEFAULT 0,
        tolov_turi TEXT DEFAULT 'naqd',
        mijoz_ismi TEXT, mijoz_telefon TEXT, izoh TEXT,
        sana TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (kassir_id) REFERENCES foydalanuvchilar(id)
    );
    CREATE TABLE IF NOT EXISTS sotuv_tafsilotlari (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sotuv_id INTEGER NOT NULL, mahsulot_id INTEGER NOT NULL,
        miqdor REAL NOT NULL, narxi REAL NOT NULL, jami REAL NOT NULL,
        FOREIGN KEY (sotuv_id) REFERENCES sotuvlar(id),
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
    );
    CREATE TABLE IF NOT EXISTS ombor_kirim (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        mahsulot_id INTEGER NOT NULL, miqdor REAL NOT NULL,
        kelish_narxi REAL NOT NULL, yetkazuvchi TEXT, izoh TEXT,
        foydalanuvchi_id INTEGER, sana TEXT DEFAULT (datetime('now','localtime')),
        FOREIGN KEY (mahsulot_id) REFERENCES mahsulotlar(id)
    );
    CREATE TABLE IF NOT EXISTS xarajatlar (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        nomi TEXT NOT NULL, summa REAL NOT NULL, kategoriya TEXT,
        foydalanuvchi_id INTEGER, sana TEXT DEFAULT (datetime('now','localtime')), izoh TEXT
    );
    """)
    conn.commit()
    admin = c.execute("SELECT id FROM foydalanuvchilar WHERE username='admin'").fetchone()
    if not admin:
        c.execute("INSERT INTO foydalanuvchilar (ism,familiya,username,parol,rol) VALUES ('Admin','Superadmin','admin','admin123','admin')")
    kat = c.execute("SELECT COUNT(*) as n FROM kategoriyalar").fetchone()
    if kat['n'] == 0:
        kats = [
            ('Tsement va qorishmalar','Tsement, ohak, gips'),
            ("G'isht va bloklar","Qizil g'isht, gaz blok, penoblok"),
            ('Qum va shag\'al','Qurilish qumi, shag\'al'),
            ('Temir va metall','Armatura, profil, list, truba'),
            ('Yog\'och va taxta','Taxta, fanera, DSP, OSB'),
            ('Santexnika','Quvur, kran, unitaz, lavabo'),
            ('Elektr materiallari','Kabel, rozetka, avtomat'),
            ('Bo\'yoq va lak','Devor bo\'yog\'i, lak, gruntovka'),
            ('Plitkalar','Devor va pol plitkalari'),
            ('Shifer va tom','Shifer, profnastil'),
            ('Oyna va eshik','Oyna, eshik, deraza'),
            ('Asbob-uskunalar','Perforator, bolg\'a, arra'),
            ('Boshqa materiallar','Qolgan qurilish materiallari'),
        ]
        for n, t in kats:
            c.execute("INSERT OR IGNORE INTO kategoriyalar (nomi,tavsif) VALUES (?,?)", (n,t))
    conn.commit()
    conn.close()


def rows_to_list(rows):
    return [dict(r) for r in rows]

def row_to_dict(row):
    return dict(row) if row else None

MIME = {
    '.html':'text/html','.css':'text/css','.js':'application/javascript',
    '.json':'application/json','.png':'image/png','.ico':'image/x-icon',
    '.svg':'image/svg+xml','.woff2':'font/woff2','.woff':'font/woff'
}

class Handler(BaseHTTPRequestHandler):
    def log_message(self, fmt, *args): pass

    def send_json(self, data, code=200):
        body = json.dumps(data, ensure_ascii=False).encode('utf-8')
        self.send_response(code)
        self.send_header('Content-Type','application/json; charset=utf-8')
        self.send_header('Content-Length', len(body))
        self.send_header('Access-Control-Allow-Origin','*')
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, msg, code=400):
        self.send_json({'xato': msg}, code)

    def read_body(self):
        length = int(self.headers.get('Content-Length', 0))
        return json.loads(self.rfile.read(length)) if length else {}

    def serve_file(self, path):
        if not os.path.exists(path):
            path = os.path.join(FRONTEND, 'index.html')
        ext = os.path.splitext(path)[1]
        mime = MIME.get(ext, 'text/plain')
        try:
            with open(path, 'rb') as f:
                data = f.read()
            self.send_response(200)
            self.send_header('Content-Type', mime)
            self.send_header('Content-Length', len(data))
            self.end_headers()
            self.wfile.write(data)
        except:
            self.send_response(404)
            self.end_headers()

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin','*')
        self.send_header('Access-Control-Allow-Methods','GET,POST,PUT,DELETE,OPTIONS')
        self.send_header('Access-Control-Allow-Headers','Content-Type')
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        qs = parse_qs(parsed.query)
        def qp(k): return qs.get(k, [None])[0]

        if not path.startswith('/api/'):
            fp = os.path.join(FRONTEND, path.lstrip('/')) if path != '/' else os.path.join(FRONTEND,'index.html')
            return self.serve_file(fp)

        conn = get_db()
        try:
            # FOYDALANUVCHILAR
            if path == '/api/foydalanuvchilar':
                rows = conn.execute("SELECT id,ism,familiya,username,rol,telefon,yaratilgan,faol FROM foydalanuvchilar").fetchall()
                return self.send_json(rows_to_list(rows))

            # KATEGORIYALAR
            if path == '/api/kategoriyalar':
                rows = conn.execute("SELECT * FROM kategoriyalar ORDER BY nomi").fetchall()
                return self.send_json(rows_to_list(rows))

            # MAHSULOTLAR
            if path == '/api/mahsulotlar':
                sql = "SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.faol=1"
                params = []
                if qp('qidiruv'):
                    sql += " AND (m.nomi LIKE ? OR m.shtrix_kod LIKE ?)"; params += [f"%{qp('qidiruv')}%"]*2
                if qp('kategoriya'):
                    sql += " AND m.kategoriya_id=?"; params.append(qp('kategoriya'))
                if qp('kam_miqdor') == '1':
                    sql += " AND m.miqdor<=m.min_miqdor"
                sql += " ORDER BY m.nomi"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                row = conn.execute("SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.id=?", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Mahsulot topilmadi', 404)
                return self.send_json(row_to_dict(row))

            m = re.match(r'^/api/qidiruv/(.+)$', path)
            if m:
                row = conn.execute("SELECT m.*,k.nomi as kategoriya_nomi FROM mahsulotlar m LEFT JOIN kategoriyalar k ON m.kategoriya_id=k.id WHERE m.shtrix_kod=? AND m.faol=1", (m.group(1),)).fetchone()
                if not row: return self.send_error_json('Mahsulot topilmadi', 404)
                return self.send_json(row_to_dict(row))

            # SOTUVLAR
            if path == '/api/sotuvlar':
                sql = "SELECT s.*,f.ism||' '||f.familiya as kassir_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(s.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(s.sana)<=?"; params.append(qp('tugash'))
                if qp('kassir_id'): sql += " AND s.kassir_id=?"; params.append(qp('kassir_id'))
                sql += " ORDER BY s.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            m = re.match(r'^/api/sotuvlar/(\d+)$', path)
            if m:
                sotuv = conn.execute("SELECT s.*,f.ism||' '||f.familiya as kassir_ismi FROM sotuvlar s LEFT JOIN foydalanuvchilar f ON s.kassir_id=f.id WHERE s.id=?", (m.group(1),)).fetchone()
                if not sotuv: return self.send_error_json('Sotuv topilmadi', 404)
                taf = conn.execute("SELECT st.*,mah.nomi as mahsulot_nomi,mah.birlik FROM sotuv_tafsilotlari st JOIN mahsulotlar mah ON st.mahsulot_id=mah.id WHERE st.sotuv_id=?", (m.group(1),)).fetchall()
                d = row_to_dict(sotuv); d['tafsilotlar'] = rows_to_list(taf)
                return self.send_json(d)

            # OMBOR
            if path == '/api/ombor':
                sql = "SELECT o.*,mah.nomi as mahsulot_nomi,mah.birlik,f.ism||' '||f.familiya as xodim_ismi FROM ombor_kirim o JOIN mahsulotlar mah ON o.mahsulot_id=mah.id LEFT JOIN foydalanuvchilar f ON o.foydalanuvchi_id=f.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(o.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(o.sana)<=?"; params.append(qp('tugash'))
                sql += " ORDER BY o.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            # XARAJATLAR
            if path == '/api/xarajatlar':
                sql = "SELECT x.*,f.ism||' '||f.familiya as xodim_ismi FROM xarajatlar x LEFT JOIN foydalanuvchilar f ON x.foydalanuvchi_id=f.id WHERE 1=1"
                params = []
                if qp('boshlanish'): sql += " AND date(x.sana)>=?"; params.append(qp('boshlanish'))
                if qp('tugash'): sql += " AND date(x.sana)<=?"; params.append(qp('tugash'))
                sql += " ORDER BY x.sana DESC"
                return self.send_json(rows_to_list(conn.execute(sql, params).fetchall()))

            # HISOBOTLAR
            if path == '/api/hisobot/kunlik':
                kun = qp('sana') or datetime.now().strftime('%Y-%m-%d')
                sotuvlar = row_to_dict(conn.execute("SELECT COUNT(*) as son, COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (kun,)).fetchone())
                xarajatlar = row_to_dict(conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE date(sana)=?", (kun,)).fetchone())
                top = rows_to_list(conn.execute("SELECT mah.nomi,SUM(st.miqdor) as jami_miqdor,SUM(st.jami) as jami_summa FROM sotuv_tafsilotlari st JOIN mahsulotlar mah ON st.mahsulot_id=mah.id JOIN sotuvlar s ON st.sotuv_id=s.id WHERE date(s.sana)=? GROUP BY mah.id ORDER BY jami_summa DESC LIMIT 10", (kun,)).fetchall())
                return self.send_json({'kun':kun,'sotuvlar':sotuvlar,'xarajatlar':xarajatlar,'topMahsulotlar':top})

            if path == '/api/hisobot/oylik':
                y = qp('yil') or datetime.now().strftime('%Y')
                o = (qp('oy') or str(datetime.now().month)).zfill(2)
                ym = f"{y}-{o}"
                kunliklar = rows_to_list(conn.execute("SELECT date(sana) as kun,COUNT(*) as sotuvlar_soni,SUM(jami_summa) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=? GROUP BY date(sana) ORDER BY kun", (ym,)).fetchall())
                jami = row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (ym,)).fetchone())
                xarajatlar = row_to_dict(conn.execute("SELECT COALESCE(SUM(summa),0) as jami FROM xarajatlar WHERE strftime('%Y-%m',sana)=?", (ym,)).fetchone())
                return self.send_json({'yil':y,'oy':o,'kunliklar':kunliklar,'jami':jami,'xarajatlar':xarajatlar})

            if path == '/api/hisobot/umumiy':
                bugun = datetime.now().strftime('%Y-%m-%d')
                oy = datetime.now().strftime('%Y-%m')
                return self.send_json({
                    'mahsulotlar_soni': row_to_dict(conn.execute("SELECT COUNT(*) as son FROM mahsulotlar WHERE faol=1").fetchone()),
                    'bugun_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE date(sana)=?", (bugun,)).fetchone()),
                    'oy_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar WHERE strftime('%Y-%m',sana)=?", (oy,)).fetchone()),
                    'kam_miqdor': row_to_dict(conn.execute("SELECT COUNT(*) as son FROM mahsulotlar WHERE miqdor<=min_miqdor AND faol=1").fetchone()),
                    'jami_sotuv': row_to_dict(conn.execute("SELECT COUNT(*) as son,COALESCE(SUM(jami_summa),0) as jami FROM sotuvlar").fetchone()),
                })

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()


    def do_POST(self):
        path = urlparse(self.path).path
        body = self.read_body()
        conn = get_db()
        try:
            if path == '/api/login':
                row = conn.execute("SELECT * FROM foydalanuvchilar WHERE username=? AND parol=? AND faol=1", (body.get('username',''), body.get('parol',''))).fetchone()
                if not row: return self.send_error_json("Username yoki parol noto'g'ri!", 401)
                d = row_to_dict(row); del d['parol']
                return self.send_json({'muvaffaqiyat': True, 'foydalanuvchi': d})

            if path == '/api/foydalanuvchilar':
                try:
                    r = conn.execute("INSERT INTO foydalanuvchilar (ism,familiya,username,parol,rol,telefon) VALUES (?,?,?,?,?,?)",
                        (body['ism'],body['familiya'],body['username'],body['parol'],body.get('rol','kassir'),body.get('telefon',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except: return self.send_error_json("Bu username allaqachon mavjud!")

            if path == '/api/kategoriyalar':
                try:
                    r = conn.execute("INSERT INTO kategoriyalar (nomi,tavsif) VALUES (?,?)", (body['nomi'],body.get('tavsif',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except: return self.send_error_json("Bu kategoriya allaqachon mavjud!")

            if path == '/api/mahsulotlar':
                try:
                    r = conn.execute("INSERT INTO mahsulotlar (nomi,kategoriya_id,shtrix_kod,birlik,kelish_narxi,sotish_narxi,miqdor,min_miqdor,tavsif) VALUES (?,?,?,?,?,?,?,?,?)",
                        (body['nomi'],body.get('kategoriya_id'),body.get('shtrix_kod'),body.get('birlik','dona'),
                         body.get('kelish_narxi',0),body.get('sotish_narxi',0),body.get('miqdor',0),body.get('min_miqdor',5),body.get('tavsif',''))).lastrowid
                    conn.commit(); return self.send_json({'muvaffaqiyat':True,'id':r})
                except Exception as e: return self.send_error_json(str(e))

            if path == '/api/sotuvlar':
                mahsulotlar = body.get('mahsulotlar', [])
                if not mahsulotlar: return self.send_error_json('Mahsulot tanlanmagan!')
                chek = 'CHK' + str(int(datetime.now().timestamp()*1000))
                jami = sum(m['miqdor']*m['narxi'] for m in mahsulotlar)
                chegirma = body.get('chegirma', 0)
                yakuniy = jami - chegirma
                for m in mahsulotlar:
                    row = conn.execute("SELECT miqdor,nomi FROM mahsulotlar WHERE id=?", (m['mahsulot_id'],)).fetchone()
                    if not row or row['miqdor'] < m['miqdor']:
                        return self.send_error_json(f"'{row['nomi'] if row else 'Mahsulot'}' omborda yetarli emas! Mavjud: {row['miqdor'] if row else 0}")
                r = conn.execute("INSERT INTO sotuvlar (chek_raqam,kassir_id,jami_summa,chegirma,tolov_turi,mijoz_ismi,mijoz_telefon,izoh) VALUES (?,?,?,?,?,?,?,?)",
                    (chek,body['kassir_id'],yakuniy,chegirma,body.get('tolov_turi','naqd'),body.get('mijoz_ismi',''),body.get('mijoz_telefon',''),body.get('izoh',''))).lastrowid
                for m in mahsulotlar:
                    conn.execute("INSERT INTO sotuv_tafsilotlari (sotuv_id,mahsulot_id,miqdor,narxi,jami) VALUES (?,?,?,?,?)",
                        (r, m['mahsulot_id'], m['miqdor'], m['narxi'], m['miqdor']*m['narxi']))
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor-?,yangilangan=datetime('now','localtime') WHERE id=?", (m['miqdor'], m['mahsulot_id']))
                conn.commit()
                return self.send_json({'muvaffaqiyat':True,'sotuv_id':r,'chek_raqam':chek,'jami_summa':yakuniy})

            if path == '/api/ombor':
                conn.execute("INSERT INTO ombor_kirim (mahsulot_id,miqdor,kelish_narxi,yetkazuvchi,izoh,foydalanuvchi_id) VALUES (?,?,?,?,?,?)",
                    (body['mahsulot_id'],body['miqdor'],body.get('kelish_narxi',0),body.get('yetkazuvchi',''),body.get('izoh',''),body.get('foydalanuvchi_id')))
                conn.execute("UPDATE mahsulotlar SET miqdor=miqdor+?,kelish_narxi=?,yangilangan=datetime('now','localtime') WHERE id=?",
                    (body['miqdor'],body.get('kelish_narxi',0),body['mahsulot_id']))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            if path == '/api/xarajatlar':
                conn.execute("INSERT INTO xarajatlar (nomi,summa,kategoriya,foydalanuvchi_id,izoh) VALUES (?,?,?,?,?)",
                    (body['nomi'],body['summa'],body.get('kategoriya',''),body.get('foydalanuvchi_id'),body.get('izoh','')))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()

    def do_PUT(self):
        path = urlparse(self.path).path
        body = self.read_body()
        conn = get_db()
        try:
            m = re.match(r'^/api/foydalanuvchilar/(\d+)$', path)
            if m:
                if body.get('parol'):
                    conn.execute("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,parol=?,rol=?,telefon=?,faol=? WHERE id=?",
                        (body['ism'],body['familiya'],body['username'],body['parol'],body['rol'],body.get('telefon',''),body.get('faol',1),m.group(1)))
                else:
                    conn.execute("UPDATE foydalanuvchilar SET ism=?,familiya=?,username=?,rol=?,telefon=?,faol=? WHERE id=?",
                        (body['ism'],body['familiya'],body['username'],body['rol'],body.get('telefon',''),body.get('faol',1),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/kategoriyalar/(\d+)$', path)
            if m:
                conn.execute("UPDATE kategoriyalar SET nomi=?,tavsif=? WHERE id=?", (body['nomi'],body.get('tavsif',''),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                conn.execute("UPDATE mahsulotlar SET nomi=?,kategoriya_id=?,shtrix_kod=?,birlik=?,kelish_narxi=?,sotish_narxi=?,miqdor=?,min_miqdor=?,tavsif=?,yangilangan=datetime('now','localtime') WHERE id=?",
                    (body['nomi'],body.get('kategoriya_id'),body.get('shtrix_kod'),body.get('birlik','dona'),body.get('kelish_narxi',0),body.get('sotish_narxi',0),body.get('miqdor',0),body.get('min_miqdor',5),body.get('tavsif',''),m.group(1)))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()

    def do_DELETE(self):
        path = urlparse(self.path).path
        conn = get_db()
        try:
            m = re.match(r'^/api/foydalanuvchilar/(\d+)$', path)
            if m:
                conn.execute("UPDATE foydalanuvchilar SET faol=0 WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/kategoriyalar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM kategoriyalar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/mahsulotlar/(\d+)$', path)
            if m:
                conn.execute("UPDATE mahsulotlar SET faol=0 WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/sotuvlar/(\d+)$', path)
            if m:
                sid = m.group(1)
                taf = conn.execute("SELECT * FROM sotuv_tafsilotlari WHERE sotuv_id=?", (sid,)).fetchall()
                for t in taf:
                    conn.execute("UPDATE mahsulotlar SET miqdor=miqdor+? WHERE id=?", (t['miqdor'],t['mahsulot_id']))
                conn.execute("DELETE FROM sotuv_tafsilotlari WHERE sotuv_id=?", (sid,))
                conn.execute("DELETE FROM sotuvlar WHERE id=?", (sid,))
                conn.commit(); return self.send_json({'muvaffaqiyat':True})

            m = re.match(r'^/api/xarajatlar/(\d+)$', path)
            if m:
                conn.execute("DELETE FROM xarajatlar WHERE id=?", (m.group(1),)); conn.commit()
                return self.send_json({'muvaffaqiyat':True})

            self.send_error_json('Topilmadi', 404)
        except Exception as e:
            self.send_error_json(str(e), 500)
        finally:
            conn.close()


if __name__ == '__main__':
    init_db()
    PORT = int(os.environ.get('PORT', 3000))
    server = HTTPServer(('0.0.0.0', PORT), Handler)
    print(f"✅ Server ishga tushdi: http://localhost:{PORT}")
    print(f"👤 Admin: username=admin, parol=admin123")
    server.serve_forever()
