# Panduan Deploy Al Binaa Qurban 1447H

Aplikasi ini sudah siap untuk di-online-kan agar bisa diakses oleh seluruh Wali Santri. Berikut adalah langkah-langkah untuk hosting gratis dan domain gratis:

## Langkah 1: Push ke GitHub Anda
Saya sudah menginisialisasi Git di komputer Anda. Sekarang Anda tinggal menghubungkannya ke akun GitHub Anda:
1. Buka [github.com](https://github.com) dan buat repository baru bernama `qurban-al-binaa`.
2. Jalankan perintah berikut di Terminal (PowerShell):
   ```powershell
   git remote add origin https://github.com/USERNAME_ANDA/qurban-al-binaa.git
   git branch -M main
   git push -u origin main
   ```

## Langkah 2: Hosting Gratis di Render.com
Render adalah layanan hosting gratis yang sangat bagus untuk aplikasi Node.js:
1. Daftar di [Render.com](https://render.com) menggunakan akun GitHub Anda.
2. Klik tombol **New +** lalu pilih **Web Service**.
3. Hubungkan repository `qurban-al-binaa` yang tadi Anda buat.
4. Gunakan pengaturan berikut:
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Klik **Create Web Service**.

## Langkah 3: Domain Gratis
Setelah deploy selesai, Anda akan mendapatkan domain gratis seperti:
`https://qurban-al-binaa.onrender.com`

---

### Catatan Penting Data (Persistence)
Karena ini menggunakan paket hosting gratis, file `database.json` akan terhapus jika aplikasi tidak diakses dalam waktu lama atau saat aplikasi di-update. 
> [!IMPORTANT]
> Untuk penggunaan jangka panjang (produksi), disarankan untuk menyambungkan aplikasi ini ke Database Eksternal seperti **MongoDB Atlas** (juga gratis). Jika Anda sudah siap, beri tahu saya dan saya akan bantu integrasikan.

Aplikasi Anda kini sudah siap tempur!
