# Panduan Update (Capo Ledger Installer)

Karena ini aplikasi desktop yang dijalankan secara lokal di komputer teman-teman sindikat kamu, mereka harus meng-install aplikasinya lagi untuk mendapatkan fitur **Supabase Cloud Sync** terbaru yang baru saja kita kerjakan.

Tenang saja, mereka **tidak perlu menghapus** aplikasi yang lama. Mereka hanya perlu **menimpa / mendownload versi baru** installer-nya.

## Langkah Membuat File Update (.exe)

Lakukan ini dari komputermu sendiri untuk mem-build aplikasi finalnya:

1. Buka terminal di VS Code yang ada di folder `income-book-app`.
2. Matikan dulu proses `bun run dev` (tekan `Ctrl + C` di terminal).
3. Jalankan perintah ini untuk mulai membuat package `.exe` standar Windows:
   
   ```bash
   npm run build:win
   ```
   *Atau jika kamu mau mem-build untuk OS lain, cukup ketik `npm run build`.*

4. Tunggu beberapa menit sampai proses *packaging* selesai.
5. Jika sudah selesai, buka folder project ini di File Explorer: `e:\Main\Code\income-book-app\dist\`
6. Di dalam folder `dist`, cari file bernama **`Capo Ledger Setup 1.0.0.exe`** (atau versi sejenisnya).
7. Kirim file `.exe` ini (via Flashdisk, Google Drive, WhatsApp, atau Discord) ke teman-temanmu!

## Langkah Update untuk Teman

1. Minta mereka untuk **dobel-klik file `.exe` itu**.
2. Installer akan meng-overwrite otomatis program yang lama dengan diam-diam dan langsung membuka aplikasinya!
3. Saat mereka buka, mereka akan disambut dengan halaman Login Noir baru kita.
4. Minta mereka login menggunakan email dan password yang sudah kamu set up di *Supabase Users Dashboard*.
5. (Semua data local SQLite lama mereka tidak akan terbaca lagi, dan layar akan 100% kosong mengikuti Database Awannya!)

Selamat mendistribusikan sistem arsip rahasia baru ini! 🥂
