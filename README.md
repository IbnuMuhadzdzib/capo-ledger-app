# Income Book App — Fase 4 (Tema Biru-Emas + Teller Avatar Animasi)

Update kali ini ngikutin referensi buku tabungan asli (biru-emas, tabel ledger) dan bikin
avatar teller jadi vektor SVG yang dianimasikan, bukan placeholder lingkaran abu-abu.

## Yang Berubah

1. **Warna tema** — geser dari maroon-emas (Fase 3) jadi **biru-emas** ala buku tabungan
   BRI/BNI/Syariah. Cover, header, tab, tombol, semuanya ikut.
2. **Daftar transaksi jadi tabel ledger** — `IncomeList.tsx` sekarang render `<table>`
   (kolom Keterangan/Jumlah/Aksi), bukan kartu-kartu lepas. Lebih mirip buku tabungan asli.
3. **Notice bar** — ada pita kecil di atas halaman ("Simpan baik-baik buku tabungan digital
   ini"), niru gaya teks instruksional di header buku tabungan asli.
4. **Avatar teller jadi SVG animasi** — file baru `TellerAvatar.tsx`. Bukan gambar statis,
   tapi vektor yang dianimasikan lewat CSS:
   - Idle bob halus tiap ~3.6 detik
   - Kedip mata random tiap ~5 detik
   - "Ngomong" (mulut gerak) selama ~1.1 detik setiap kalimat dialog berubah

## ⚠️ Soal Kesetiaan ke Referensi Ilustrasi (Image 2)

Avatar ini **vektor geometris sederhana yang ditulis langsung sebagai kode**, bukan hasil
generate AI image atau tracing dari ilustrasi aslinya — karena Claude gak punya kemampuan
generate gambar raster. Ciri-ciri khas (kacamata bulat, ikal rambut, dasi kupu-kupu emas, jas
abu-abu) diadaptasi, tapi gak akan se-detail ilustrasi referensimu.

**Kalau kamu mau avatar yang benar-benar match ilustrasi itu:**
1. Generate/commission ilustrasinya secara terpisah (AI image tool, atau ilustrator).
2. Simpan filenya di `src/renderer/src/assets/teller/` (folder ini belum ada, bikin manual).
3. Ganti isi `TellerAvatar.tsx` — paling simpel, render `<img>` ke file itu untuk kondisi
   diam, dan (kalau punya beberapa frame) ganti `src` berdasarkan prop `talking` buat efek
   gerak. Atau tetap render SVG ini sebagai fallback animasi, sambil nunggu asetnya jadi.

## Cara Pasang (Update dari Fase 3)

### 1. Timpa file-file ini dari zip

```
src/renderer/src/index.css                       → TIMPA (tema biru-emas + animasi avatar)
src/renderer/src/components/IncomeList.tsx       → TIMPA (jadi tabel ledger)
src/renderer/src/components/PassbookPanel.tsx    → TIMPA (tambah notice bar)
src/renderer/src/components/TellerPanel.tsx      → TIMPA (pakai TellerAvatar + state talking)
src/renderer/src/components/TellerAvatar.tsx     → BARU
```

File lain (db.ts, ipc.ts, store, dst) **tidak berubah** dari Fase 3 — gak perlu ditimpa ulang.

### 2. Jalankan

```bash
npm run dev
```

Gak ada dependency baru.

## Yang Bakal Kamu Lihat

- Seluruh aplikasi sekarang biru-emas, bukan maroon-coklat.
- Daftar income tampil sebagai tabel dengan header kolom, bukan kartu.
- Avatar teller punya mata yang sesekali berkedip sendiri (coba diemin beberapa detik), dan
  mulutnya gerak-gerak pas kalimatnya baru ganti (klik tombol apa aja yang mancing dialog).

## Belum Dikerjakan (Dicatat, Bukan Dilupain)

- Motif ornate/batik ala cover belakang di Image 1 — area "cover" di layout sekarang cuma
  bingkai tipis 8px di sekeliling halaman, jadi kurang ada ruang buat nampilin motif itu
  dengan jelas. Kalau kamu mau ini tetap ditampilkan, mungkin perlu kita pikirin ulang
  proporsi cover vs halaman (misal cover dibuat lebih tebal di salah satu sisi).
- Avatar ilustrasi asli (lihat catatan di atas).
