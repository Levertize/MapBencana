# MapBencana — Peta Interaktif Rawan Bencana Indonesia

[![Vite Build Status](https://img.shields.io/badge/Vite-Built-646CFF?logo=vite&style=flat-square)](https://vitejs.dev/)
[![Leaflet](https://img.shields.io/badge/Leaflet-1.9.4-4A8F29?logo=leaflet&style=flat-square)](https://leafletjs.com/)
[![D3.js](https://img.shields.io/badge/D3.js-7.9.0-F9A03F?logo=d3.js&style=flat-square)](https://d3js.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

Aplikasi pemetaan data interaktif berbasis web yang menampilkan titik-titik rawan bencana di Indonesia secara real-time maupun historis. Pengguna dapat memfilter jenis bencana, melihat statistik wilayah, dan mengeksplorasi data secara visual di atas peta interaktif.

**Live Demo:** [https://levertize.github.io/MapBencana/](https://levertize.github.io/MapBencana/)

---

## Fitur Utama

- **Base Map & Peta Interaktif:** Tampilan dasar Indonesia dengan mode terang/gelap serta basemap satelit.
- **Layer Gunung Berapi Aktif:** Deteksi lokasi gunung berapi aktif di Indonesia dengan marker segitiga visual kustom yang mencerminkan level aktivitas ("Normal", "Waspada", "Siaga", "Awas").
- **Visualisasi Choropleth Provinsi:** Batas wilayah provinsi diwarnai secara dinamis berdasarkan total frekuensi kejadian bencana untuk mendeteksi area paling rawan.
- **Heatmap Kepadatan & Efek Glowing:** Visualisasi area titik api/konsentrasi bencana yang padat menggunakan modulasi denyut animasi halus pada canvas heatmap tanpa warna biru/sian.
- **Animasi Gelombang Terdampak (Seismic Shockwaves):** Marker gempa bumi memancarkan denyut gelombang kejut konsentris melingkar. Ukuran radius, jumlah ring, dan kecepatan gelombang berubah secara dinamis sesuai skala magnitudo gempa.
- **Pencarian Lokasi & Fly-To:** Memungkinkan pencarian lokasi (provinsi, kabupaten, kota) secara instan dengan efek luncur (*fly-to*) di peta.
- **Panel Statistik Dinamis & Sparkline:** 
  - Grafik tren magnitudo kejadian historis 15 hari terakhir.
  - Sparkline total kejadian interaktif.
  - Perhitungan data statistik riil secara dinamis berdasarkan penyaringan aktif.
- **Responsive Layout & Mode Khusus:** Layout desktop memisahkan panel filter (kiri) dan panel statistik (kanan) secara bersih agar navigasi terasa lapang dan terfokus. Dukungan penuh untuk perangkat seluler.

---

## Tech Stack

| Layer | Teknologi | Deskripsi |
| --- | --- | --- |
| **Peta** | Leaflet.js v1.9+ | Pustaka pemetaan open-source yang ringan dan interaktif |
| **Visualisasi** | D3.js v7 | Digunakan untuk grafik statistik & manipulasi skala data |
| **UI/Layout** | Vanilla JS + CSS Grid/Flexbox | Zero dependency, performa render cepat, dan ringan |
| **Penyimpanan** | LocalStorage | Menyimpan preferensi tema (dark/light) dan durasi polling |
| **Build Tool** | Vite | Server pengembangan HMR cepat dan bundler optimal |
| **Deploy** | GitHub Pages | Host statis terintegrasi langsung dengan repositori |

---

## Sumber Data Riil

- **Gempa Bumi Real-time:** [BMKG autogempa.json](https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json)
- **Gempa Bumi 15 Hari Terakhir:** [BMKG gempaterkini.json](https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json)
- **Batas Wilayah Provinsi & Kabupaten:** GeoJSON batas wilayah Indonesia dari publik repositori geospasial.
- **Gunung Berapi Aktif:** Data koordinat statis berdasarkan VSI ESDM / PVMBG.

---

## Struktur Folder

```
mapbencana/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment otomatis
├── public/
│   └── data/
│       ├── indonesia-provinces.geojson   # Batas wilayah provinsi
│       ├── indonesia-districts.geojson   # Batas wilayah kabupaten/kota
│       └── volcanoes.json                # Data gunung berapi aktif
├── src/
│   ├── main.js                 # Entry point bootstrap aplikasi
│   ├── map/
│   │   ├── initMap.js          # Inisialisasi peta dasar & basemap Leaflet
│   │   ├── layers.js           # Pengendalian aktif/nonaktif layer registry
│   │   ├── earthquakeLayer.js  # Marker gempa bumi & efek gelombang
│   │   ├── volcanoLayer.js     # Marker gunung api
│   │   ├── choropleth.js       # Visualisasi warna wilayah provinsi
│   │   └── heatmap.js          # Pengelolaan canvas density heatmap
│   ├── ui/
│   │   ├── sidebar.js          # Switcher tab navigasi & filter panel
│   │   ├── popup.js            # Generator custom HTML info-window
│   │   ├── legend.js           # Manajemen legenda peta
│   │   ├── statsPanel.js       # Ringkasan data, grafik, & pengaturan
│   │   └── toast.js            # Pemicu notifikasi mengambang
│   ├── utils/
│   │   ├── colorScale.js       # Kalkulator kode warna data
│   │   ├── formatter.js        # Utilitas format angka dan tanggal
│   │   └── constants.js        # Berkas konfigurasi global & URL BMKG
│   └── styles/
│       ├── main.css            # Desain dasar, variabel CSS, & reset
│       ├── map.css             # Penataan peta, marker, & popup
│       ├── sidebar.css         # Desain panel navigasi & panel filter
│       └── components.css      # Gaya visual card, list riwayat, & button
├── index.html                  # File kerangka HTML5 utama
├── vite.config.js              # Konfigurasi bundling Vite
├── package.json                # Berkas konfigurasi dependensi npm
└── CHANGELOG.md                # Catatan riwayat rilis perubahan proyek
```

---

## Instalasi & Pengembangan Lokal

### Prasyarat
Pastikan Anda telah menginstal [Node.js](https://nodejs.org/) (versi 18 atau lebih baru).

### Cara Menjalankan
```bash
# 1. Clone repositori ini
git clone https://github.com/Levertize/MapBencana.git
cd MapBencana

# 2. Instal dependensi npm
npm install

# 3. Jalankan server pengembangan lokal (Vite)
npm run dev

# 4. Lakukan kompilasi build produksi secara lokal
npm run build
```

---

## Panduan Deployment ke GitHub Pages

Proyek ini telah dikonfigurasi untuk dapat di-deploy ke GitHub Pages dengan dua metode:

### A. Deployment Otomatis (GitHub Actions)
Setiap kali Anda melakukan push atau merge commit ke branch `main`, GitHub Actions workflow yang berada di `.github/workflows/deploy.yml` akan secara otomatis melakukan build dan mempublikasikan versi terbaru ke branch `gh-pages`.

### B. Deployment Manual (Local Script)
Jika Anda ingin mempublikasikan perubahan secara instan dari mesin lokal Anda, Anda dapat menjalankan perintah berikut:
```bash
npm run deploy
```
Perintah ini akan secara otomatis mem-build proyek ke folder `dist` dan mengunggah hasilnya ke branch `gh-pages` di remote repositori Anda.

---

## Lisensi
Proyek ini dilisensikan di bawah lisensi MIT. Lihat [LICENSE](LICENSE) jika tersedia untuk detail selengkapnya. Data yang digunakan merupakan hak cipta publik milik BMKG dan institusi terkait.
