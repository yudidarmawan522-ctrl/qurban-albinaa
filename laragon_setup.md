# Panduan Setup Database MySQL (Laragon)

File ini berisi instruksi untuk memindahkan database dari sistem JSON ke MySQL yang ada di Laragon.

## 1. Import Database ke Laragon

1. Buka **Laragon**.
2. Pastikan service **MySQL** sudah berjalan (Klik "Start All").
3. Klik tombol **"Database"** di Laragon (biasanya akan membuka HeidiSQL atau phpMyAdmin).
4. Buat database baru bernama **`qurban_db`**.
5. Klik kanan pada database `qurban_db` -> Pilih **"Run SQL File..."** atau **"Import"**.
6. Pilih file **`qurban_db.sql`** yang sudah saya buatkan di folder project ini.
7. Jalankan/Execute. Selesai!

## 2. Struktur Tabel

Berikut adalah tabel yang telah dibuat:
- **`animal_types`**: Menyimpan jenis hewan, berat, dan harga (Sapi Tipe A, Domba Super, dll).
- **`registrations`**: Menyimpan data pendaftar mudhohi beserta status pembayarannya.
- **`settings`**: Menyimpan target qurban dan nama program untuk dashboard.
- **`users`**: Menyimpan data login admin.

## 3. Data Login Default
Gunakan akun berikut untuk login pertama kali (jika sistem login MySQL sudah aktif):
- **Username**: `admin`
- **Password**: `admin123`

## 4. Integrasi ke Node.js (Opsional)

Jika Anda ingin aplikasi ini langsung membaca dari MySQL (bukan file JSON lagi), silakan beritahu saya. Saya akan membantu mengubah kode di folder `src/config/database.js` untuk menggunakan library `mysql2`.

---
**Catatan:** File `qurban_db.sql` sudah saya isi dengan data contoh yang ada di sistem saat ini agar Anda tidak perlu input ulang dari nol.
