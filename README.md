# KPM Academy - Web Admin CMS

Aplikasi Web Admin & CMS modern untuk **KPM Academy** yang dibangun dengan **Angular**, **Tailwind CSS (shadcn/ui style)**, dan terhubung langsung ke **Go Fiber Backend API** (`backend-api-kpmacademy`).

---

## 🏗️ Arsitektur Single Backend (Multi-Client)

```
                       ┌─────────────────────────┐
                       │   Go Fiber REST API     │
                       │  (backend-api-kpmacademy)│
                       └───────────┬─────────────┘
                                   │
                 ┌─────────────────┴─────────────────┐
                 │                                   │
                 ▼                                   ▼
    ┌─────────────────────────┐         ┌─────────────────────────┐
    │   Flutter Mobile App    │         │    Angular Web Admin    │
    │ (Siswa & Admin Mobile)  │         │  (shadcn/ui + Tailwind) │
    └─────────────────────────┘         └─────────────────────────┘
```

Setiap perubahan di Web Admin (paket, banner, jadwal live, kupon) **langsung tersinkronisasi 100% secara real-time ke aplikasi Mobile Siswa**.

---

## 🚀 Cara Menjalankan Web Admin

### 1. Masuk ke Direktori Project
```bash
cd C:\laragon\www\web-admin-mobile-apps
```

### 2. Jalankan Development Server
```bash
npm start
```
Buka browser di: **`http://localhost:4200`**

---

## 🔑 Akun Demo Administrator
- **Email:** `admin@kpmacademy.com`
- **Password:** `p@ssw0rd123`
*(Tersedia tombol 1-Click Autofill di halaman login)*

---

## 📦 Fitur-Fitur Web Admin

1. **Dashboard & Analytics:** Metrik total siswa, omset Midtrans, pesanan selesai, dan shortcut cepat.
2. **CMS Konten Lengkap:**
   - **Banner Promo:** Kelola banner slider gambar mobile.
   - **Paket Belajar & Tryout:** Kelola harga, diskon, masa aktif, dan jenjang sekolah.
   - **Live Class & Tutor:** Jadwal sesi live interaktif via Zoom / Meet.
   - **Video Materi:** Video pembelajaran HD per kategori.
   - **Modul PDF:** Modul materi & bank soal dapat diunduh.
   - **Kupon Voucher:** Kode promo diskon checkout belanja.
3. **Manajemen Pesanan & Midtrans:**
   - Live Search invoice & nama siswa real-time.
   - Modal bukti kwitansi & invoice digital.
   - Ekspor laporan transaksi ke CSV.
4. **Pengguna & Siswa:** Daftar akun siswa, tutor, dan admin dengan aksi toggle status.
5. **Pengaturan API:** Switcher endpoint Go API (Localhost port 8080 vs VPS Server) dengan live ping tester.
