# 🧠 CONTEXT.md — Progress & State Proyek MapBencana

> **File ini WAJIB dibaca oleh AI assistant di setiap session baru.**
> Berisi rangkuman progress, keputusan arsitektur, dan status terkini proyek.
> Selalu baca juga: `AGENTS.md` (PRD) dan `RULES.md` (aturan pengembangan).

---

## 📅 Last Updated: 31 Mei 2026, 06:30 WIB

## 🏁 Status Proyek: Phase 2 SELESAI

---

## ✅ Yang Sudah Dikerjakan

### Phase 0 — Setup Proyek ✅ COMPLETE
- [x] Init Vite project (`package.json` dengan dependencies)
- [x] Konfigurasi Vite (`vite.config.js` — base `./` untuk GitHub Pages)
- [x] ESLint (`eslintrc.json` — ES6+, no var, prefer const)
- [x] Prettier (`.prettierrc` — single quotes, 2 space, trailing comma)
- [x] `.gitignore` — node_modules, dist, .env, IDE files
- [x] `README.md` — skeleton dengan deskripsi & quick start
- [x] `npm install` — semua dependencies terinstall

### Front-End UI Shell ✅ COMPLETE
Seluruh UI shell sudah dibangun sesuai desain `UI.png` (dark theme).

### Phase 1 — Peta Dasar ✅ COMPLETE
- [x] Tambah tile layer switcher UI (Standard / Satellite / Dark) — logic sudah ada di `initMap.js`
- [x] Test responsiveness di mobile viewport (penyesuaian letak kontrol peta dan tab menu bottom nav)

### Phase 2 — Data Layer Pertama (Gempa BMKG) ✅ COMPLETE
- [x] Buat `src/data/fetchBMKG.js` — fetch data gempa dari BMKG dengan retry (3x), timeout (10s), dan fallback lokal
- [x] Buat `src/data/parser.js` — normalisasi respons BMKG & ekstraksi provinsi dari teks lokasi secara pintar
- [x] Buat fallback JSON lokal `earthquakes-fallback.json`
- [x] Render marker gempa di peta dengan clustering (`leaflet.markercluster`)
- [x] Kustomisasi marker berbentuk target konsentris (SVG via `L.divIcon`) dengan pulse animation pada 3 gempa teranyar
- [x] Hubungkan popup template `createEarthquakePopup` dengan badge status "BARU" dinamis
- [x] Hubungkan filter checkboxes & dropdown waktu dari sidebar untuk menyaring marker & memperbarui statistik secara real-time
- [x] Hitung statistik dinamis di stats panel kanan (total counter, breakdown, dan provinsi terdampak teraktif) dari data riil terfilter

#### Files yang sudah dibuat/diubah:

| File | Status | Deskripsi |
|---|---|---|
| `index.html` | ✅ | Layout utama: navbar, icon sidebar, filter panel, map, stats panel, legend, toast |
| `src/main.js` | ✅ | Entry point — inisialisasi modul, trigger fetch BMKG, re-kalkulasi statistik dinamis, dan sinkronisasi filter event |
| `src/data/fetchBMKG.js` | [NEW] | Fetcher BMKG dengan timeout (AbortController), retry (3x), dan local fallback |
| `src/data/parser.js` | [NEW] | Normalisasi data gempa BMKG, parser tanggal Indonesia, dan ekstraksi nama provinsi dari deskripsi wilayah |
| `src/map/earthquakeLayer.js` | [NEW] | Layer cluster marker Leaflet, target konsentris SVG kustom, dan logika penyaringan berbasis waktu/tipe |
| `public/data/earthquakes-fallback.json` | [NEW] | Snapshot data cadangan untuk penanganan server BMKG offline |
| `src/map/initMap.js` | ✅ | Leaflet map — dark tile, zoom control, scale bar, locate button, basemap switcher control |
| `src/map/layers.js` | ✅ | Layer management — register, show, hide, toggle API |
| `src/ui/sidebar.js` | ✅ | Filter panel, time range dropdown, layer toggles, reset filter, mobile sidebar toggles |
| `src/ui/statsPanel.js` | ✅ | Stats panel kanan — total counter, 4 mini cards, ranking provinsi, dan rendering trend chart (bezier curve) dengan sumbu X & Y dinamis |
| `src/ui/legend.js` | ✅ | Legend bar (bottom map) — choropleth & disaster mode switching |
| `src/ui/popup.js` | ✅ | Popup templates — earthquake & volcano cards dengan formatted details |
| `src/ui/toast.js` | ✅ | Toast notification — success/error/warning/info, auto-dismiss, animations |
| `src/utils/constants.js` | ✅ | API URLs, map config, tile layers, disaster types, color scales, fetch config |
| `src/utils/colorScale.js` | ✅ | Choropleth color, magnitude style, color interpolation |
| `src/utils/formatter.js` | ✅ | Format angka (ID), tanggal, koordinat, magnitude, depth, time ago, percent change |
| `src/styles/main.css` | ✅ | Design system — CSS custom properties, fonts, layout, reset, typography |
| `src/styles/map.css` | ✅ | Map container, Leaflet controls dark mode, legend bar, target konsentris & pulse styles |
| `src/styles/components.css` | ✅ | Buttons, badges, search, stats cards (flat style), province ranking, trend chart |
| `public/data/volcanoes.json` | ✅ | Sample data 12 gunung berapi aktif Indonesia |

#### UI Components yang sudah fungsional:
- 🗺️ Peta Leaflet dark theme (CartoDB Dark Matter) — zoom, pan, scale
- 🗺️ Basemap Switcher (Dark Matter / Street Map / Satelit) — smooth slide-in animation, active state borders, success toast notifications
- 🧭 Icon sidebar (6 nav: Peta, Statistik, Riwayat, Peringatan, Pengaturan, Tentang) — active state
- 🧭 Mobile view (<= 768px) Bottom Navigation Bar + mobile-friendly panel toggles (slide-in) dan sinkronisasi navigasi otomatis
- 🔍 Filter checkboxes (6 jenis bencana) — SVG icons berwarna, toggle on/off
- ⏱️ Rentang waktu dropdown (Hari Ini / 7 / 15 / 30 hari)
- 🔄 Layer toggles (Heatmap, Choropleth, Batas Provinsi/Kabupaten, Gunung Berapi)
- 📊 Stats panel — animated number counter, mini cards, province ranking, SVG trend chart
- 📜 Legend bar (bottom) — choropleth color scale
- 📜 Side legend (right panel) — 6 jenis bencana dengan SVG icons
- 🔔 Toast notification system
- ⌨️ Keyboard shortcut Ctrl+K → focus search
- ⏰ Live clock di navbar
- 🔗 Share button (copy URL to clipboard)

---

## 🔴 Yang BELUM Dikerjakan (Next Steps)

### Phase 3 — UI & Filter (Koneksi Data Peta) ⬅️ NEXT PRIORITY
- [ ] Layer toggle → hubungkan layer checkbox (Heatmap, Choropleth, dll) ke peta
- [ ] Search lokasi → cari kota/provinsi → fly to lokasi koordinat
- [ ] Sambungkan toggle layer gunung berapi ke marker (statis dari `volcanoes.json`)

### Phase 4 — Layer Tambahan (Choropleth & Heatmap)
- [ ] Load GeoJSON batas provinsi (dari superpikar/indonesia-geojson)
- [ ] Render choropleth berdasarkan jumlah kejadian bencana
- [ ] Integrasikan `leaflet.heat` untuk heatmap mode

### Phase 5 — Stats & Polish
- [ ] Dark/light mode switcher untuk peta dasar
- [ ] Loading skeleton & error states pada chart/list
- [ ] Animasi marker saat data real-time masuk

### Phase 6 — Deploy & Dokumen
- [ ] Deploy ke GitHub Pages
- [ ] README dengan GIF demo
- [ ] CHANGELOG.md

---

## 🧱 Arsitektur & Keputusan Penting

1. **Tech stack**: Vite + Leaflet.js + D3.js + Vanilla JS (no framework)
2. **Tile layer default**: CartoDB Dark Matter (dark theme)
3. **Design system**: CSS Custom Properties di `:root` (`main.css`)
4. **Color palette**: Primary `#EF4444`, bg `#0B1121`, text `#F3F4F6`
5. **State management**: Dihubungkan via filter callback handler (`onFilterChange`) di `sidebar.js`.
6. **Data Fetching**: Timeout 10 detik, retry 3 kali dengan jeda 2 detik, dan mekanisme fallback lokal yang seragam.
7. **Custom Markers**: Marker gempa divisualisasikan dengan target konsentris SVG dinamis (radius & warna berbasis magnitude) dan pulse wave untuk 3 gempa teranyar.
8. **Dynamic Stats**: Trend chart di kanan menggunakan kurva bezier dinamis yang menampilkan fluktuasi magnitudo dari data gempa riil yang tersaring. Sumbu X label secara cerdas menampilkan rentang tanggal terfilter secara dinamis.

---

## 📌 Catatan untuk AI Session Berikutnya

1. **SELALU baca** `AGENTS.md` dan `RULES.md` sebelum coding.
2. **Jaga clean code**: pertahankan batasan baris fungsi dan ESLint curly rules.
3. **Prioritas berikutnya**: Phase 3 — selesaikan integrasi toggle layer (gunung berapi, batas provinsi) dan search lokasi.
4. **Dev server**: `npm run dev` di http://localhost:5173/ (Task ID: `edd21fa0-1a6e-425d-a4ff-542f93df22d4/task-60`).
5. **Stats card border styling**: Tetap pastikan stats-card di kanan tidak memiliki aksen top-border berwarna agar sesuai dengan permintaan user sebelumnya.

---

*File ini harus selalu di-update setiap ada progress. Jangan menghapus history — tambahkan di bagian yang sesuai.*
