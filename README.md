# 📋 Sistem Absensi Tukang & Kenek

Aplikasi web untuk mengelola absensi harian tukang dan kenek dengan perhitungan otomatis biaya dan saldo.

## ✨ Fitur Utama

- ✅ **Input Tanggal**: Pilih tanggal absensi
- ✅ **Input Jumlah**: Masukkan jumlah tukang dan kenek
- ✅ **Perhitungan Otomatis**: 
  - Tukang: Rp 220.000 per hari
  - Kenek: Rp 150.000 per hari
- ✅ **Tracking Saldo**: Input saldo yang sudah dibayar
- ✅ **Ringkasan Real-time**: Lihat biaya dan sisa bayaran secara langsung
- ✅ **Riwayat Data**: Tabel lengkap semua absensi
- ✅ **Export CSV**: Unduh data dalam format CSV
- ✅ **Print**: Cetak laporan absensi
- ✅ **Penyimpanan Lokal**: Data tersimpan di browser (localStorage)
- ✅ **Responsive Design**: Berfungsi di mobile, tablet, dan desktop

## 🚀 Cara Menggunakan

1. Buka file `index.html` di browser
2. Atau akses dari URL jika sudah di-hosting
3. Isi form:
   - Pilih tanggal
   - Masukkan jumlah tukang
   - Masukkan jumlah kenek
   - Masukkan saldo yang sudah dibayar (opsional)
4. Klik "Tambah Data"
5. Data akan ditampilkan di tabel riwayat
6. Gunakan fitur export atau print sesuai kebutuhan

## 📊 Informasi Harga

| Pekerja | Harga Per Hari |
|---------|----------------|
| Tukang  | Rp 220.000     |
| Kenek   | Rp 150.000     |

## 💾 Fitur Penyimpanan

- Data otomatis tersimpan di **localStorage browser**
- Data tetap ada meski browser ditutup
- Hapus data manual dengan tombol "Hapus Semua"

## 📁 Struktur File

```
absentukang/
├── index.html       # File HTML utama
├── styles.css       # File CSS styling
├── script.js        # File JavaScript logic
└── README.md        # File dokumentasi
```

## 🎨 Antarmuka

- **Header**: Judul dan deskripsi aplikasi
- **Form Section**: Input data absensi
- **Summary Section**: Ringkasan perhitungan biaya
- **Data Section**: Tabel riwayat absensi
- **Export Section**: Tombol aksi (export, print, hapus)

## 🔧 Teknologi

- **HTML5**: Struktur halaman
- **CSS3**: Styling responsif
- **JavaScript (Vanilla)**: Logic dan interaksi
- **LocalStorage**: Penyimpanan data client-side

## 📱 Responsif

Aplikasi ini fully responsive dan berfungsi optimal di:
- 📱 Mobile (iPhone, Android)
- 📱 Tablet (iPad, dll)
- 💻 Desktop
- 💻 Laptop

## 🎯 Fitur Lanjutan

### Export CSV
- Unduh data dalam format CSV
- Kompatibel dengan Excel dan tools lainnya
- Filename otomatis sesuai tanggal

### Print
- Cetak laporan langsung dari browser
- Format optimasi untuk kertas

### Edit Data
- Ganti data dengan memilih ulang tanggal yang sama
- Sistem akan menanyakan konfirmasi

### Validasi Input
- Validasi tanggal
- Validasi jumlah (minimal ada 1 tukang atau kenek)
- Notifikasi error yang jelas

## ⚠️ Tips Penggunaan

1. **Backup Data**: Gunakan fitur export CSV secara berkala untuk backup
2. **Clear Cache**: Jika ada error, coba clear cache browser
3. **Multiple Users**: Data shared di 1 browser (satu device)
4. **Akurasi**: Double-check input sebelum submit

## 🐛 Troubleshooting

### Data tidak tersimpan
- Periksa apakah localStorage enabled di browser
- Coba buka di browser lain
- Clear cache browser dan refresh

### Form tidak merespons
- Refresh halaman
- Clear browser cache
- Coba browser lain

### Export tidak bekerja
- Pastikan browser support file download
- Disable ad blocker
- Coba browser lain

## 📞 Support

Untuk bantuan lebih lanjut, silakan buka issue di repository ini.

## 📄 Lisensi

MIT License - Bebas untuk digunakan dan dimodifikasi

## 🙌 Kontribusi

Kontribusi terbuka! Silakan fork repository dan buat pull request.

---

**Versi**: 1.0.0  
**Last Updated**: 2026-05-31  
**Developer**: ahmaddzulkifli86-ai