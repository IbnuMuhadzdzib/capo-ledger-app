# Panduan Konfigurasi Supabase untuk Capo Ledger

Karena kamu mau aplikasi ini bisa dipakai bareng **kamu dan teman-temanmu**, ini hal penting yang harus kamu tahu:
Saat ini data kamu (Incomes & Allocations) masih tersimpan di **SQLite (Lokal di komputermu sendiri)**. Artinya, kalau temanmu login, dia **tidak akan melihat kodingan/data yang kamu input**, karena datanya tidak tersinkronisasi di satu server.

Kalau tujuan akhirnya adalah **Bisa nambah income bareng-bareng dan ter-sync secara real-time**, kita JELAS harus memindahkan semua struktur tabel SQLite yang kita buat kemarin (`incomes` & `allocations`) ke **Supabase Postgres Database**.

Berikut adalah panduan lengkap step-by-step untuk Set-Up Supabase-nya:

---

## 1. Cara Mengambil URL dan Anon Key
Supabase butuh `URL` dan `Anon Key` agar aplikasi kita tau server mana yang harus dihubungi.

1. Buka [supabase.com](https://supabase.com) dan login/daftar.
2. Buat project baru (klik **New Project**).
   - Isi form (Nama bebas, Password bikin yang susah, Region pilih **Singapore** biar cepat).
   - Tunggu sekitar 1-2 menit sampai project selesai di-setup.
3. Setelah masuk Dashboard project, klik ikon ⚙️ **Settings** (di paling bawah sidebar kiri).
4. Pilih menu **API** di bawah kategori `Configuration`.
5. Di sana kamu akan melihat porsi **Project URL** dan **Project API Keys**:
   - Salin **URL** ➔ paste ke `.env` sebagai `VITE_SUPABASE_URL`
   - Salin key yang berlabel **`anon`** dan **`public`** ➔ paste ke `.env` sebagai `VITE_SUPABASE_ANON_KEY`

---

## 2. Table Supabase yang Harus Dibuat
Untuk saat ini, jika kita ingin memigrasi data dari Lokal ke Cloud Supabase, kamu perlu membuka menu **SQL Editor** di sidebar kiri Supabase, lalu copy-paste dan jalankan (_RUN_) perintah SQL ini:

```sql
-- TABEL INCOMES (Pendapatan)
CREATE TABLE incomes (
  id TEXT PRIMARY KEY, /* Pakai TEXT karena ID kita generate pakai UUID dari frontend */
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  amount REAL NOT NULL,
  source TEXT NOT NULL,
  note TEXT,
  -- split income fields
  is_split BOOLEAN DEFAULT FALSE,
  gross_amount REAL,
  team_size INTEGER,
  -- System defaults
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) /* Melacak siapa temen kamu yang input data ini */
);

-- TABEL ALLOCATIONS (Pengeluaran/Alokasi)
CREATE TABLE allocations (
  id TEXT PRIMARY KEY,
  period_month INTEGER NOT NULL,
  period_year INTEGER NOT NULL,
  label TEXT NOT NULL,
  amount REAL NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  user_id UUID REFERENCES auth.users(id) /* Melacak siapa yang input */
);

-- NYALAKAN RLS (Untuk Keamanan Tingkat Tinggi)
ALTER TABLE incomes ENABLE ROW LEVEL SECURITY;
ALTER TABLE allocations ENABLE ROW LEVEL SECURITY;

-- Bikin policy untuk tabel incomes: User HANYA BISA mengatur datanya sendiri
CREATE POLICY "Users can manage their own incomes" 
  ON incomes FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);

-- Bikin policy untuk tabel allocations: User HANYA BISA mengatur datanya sendiri
CREATE POLICY "Users can manage their own allocations" 
  ON allocations FOR ALL 
  USING (auth.uid() = user_id) 
  WITH CHECK (auth.uid() = user_id);
```

---

## 3. Akun Login Teman-Teman
Penting: Kamu tidak perlu bikin tabel buat akun. Supabase sudah otomatis punya sistem manajemen akun (tabelnya tersembunyi/di-manage sistem yaitu `auth.users`).

Cara ngasih akses ke teman kamu:
1. Buka menu **Authentication** (di sidebar kiri logo gembok).
2. Di tab **Users**, klik tombol **Add User** ➔ **Create New User**.
3. Masukkan Email dan Password untuk temanmu (kamu bisa yang nentuin password awalnya dan cek centang "Auto Confirm User").
4. Lakukan untuk setiap teman yang ingin kamu kasih akses.
5. Nah, temanmu tinggal masukin email & password ini di layar **LoginScreen** Capo Ledger kita nanti!

---

### NEXT STEP
Saat ini, AuthGate sudah mengunci layar, tapi begitu login aplikasi kamu *MASIH* membaca data SQLite lokal. 
Apakah kamu mau saya mulai **merombak kodingan SQLite (`better-sqlite3`) menjadi kodingan Cloud Supabase (`supabase-js`)** agar semua data otomatis tarik & lempar ke Supabase secara real-time cloud sync? 
Balas *"Gas rombak databasenya ke supabase"* kalau kamu mau!
