# 🏠 Household Finance — Progressive Web App

Aplikasi keuangan rumah tangga yang sudah dikonversi menjadi **PWA (Progressive Web App)**.

---

## 📁 Struktur File

```
household-finance-pwa/
├── index.html       ← Halaman utama (HTML saja, tanpa inline CSS/JS)
├── style.css        ← Semua styling (CSS variables, komponen, tema)
├── app.js           ← Seluruh logika aplikasi (state, render, CRUD)
├── sw.js            ← Service Worker (offline support & caching)
├── manifest.json    ← Web App Manifest (metadata PWA)
├── icons/
│   ├── icon-192.png ← Icon PWA 192×192
│   └── icon-512.png ← Icon PWA 512×512
└── README.md
```

---

## ✨ Fitur PWA yang Ditambahkan

| Fitur | Keterangan |
|---|---|
| **Manifest** | Nama app, ikon, warna tema, mode `standalone` |
| **Service Worker** | Cache-first strategy → bisa dipakai **offline** |
| **Install Prompt** | Banner otomatis muncul saat browser mendukung install |
| **Apple Support** | Meta tag untuk iOS (home screen icon, status bar) |
| **Offline-first** | Semua aset (HTML, CSS, JS) di-cache saat pertama buka |

---

## 🚀 Cara Menjalankan

### Lokal (wajib pakai web server, bukan file://)

```bash
# Python
python3 -m http.server 8080

# Node.js (npx)
npx serve .

# VS Code: pakai ekstensi Live Server
```

Buka `http://localhost:8080` di browser.

### Deploy (contoh)
- **Netlify**: drag & drop folder ke netlify.com
- **GitHub Pages**: push ke repo → Settings → Pages
- **Vercel**: `vercel deploy`

> ⚠️ **PWA hanya aktif di HTTPS** (atau localhost). Service Worker tidak akan ter-register di HTTP biasa.

---

## 📱 Install sebagai App

1. Buka di Chrome/Edge/Safari
2. Banner "Install Aplikasi" akan muncul otomatis
3. Atau klik menu browser → "Add to Home Screen"
4. Aplikasi akan berjalan seperti native app (fullscreen, offline)

---

## 💾 Data

Data tersimpan di **localStorage** browser dengan key `hfa_v4`. Data tidak akan hilang saat refresh atau menutup browser.
