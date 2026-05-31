/**
 * MapBencana — Earthquake Map Layer
 * Mengelola rendering marker gempa bumi dengan clustering dan kustomisasi visual
 */

import L from 'leaflet';
import 'leaflet.markercluster';
import { getMap } from './initMap.js';
import { registerLayer } from './layers.js';
import { MAGNITUDE_SCALE } from '../utils/constants.js';
import { createEarthquakePopup } from '../ui/popup.js';

/** @type {L.MarkerClusterGroup|null} Instance layer cluster */
let earthquakeClusterGroup = null;

/** @type {object[]} Simpan data gempa ter-normalisasi */
let allEarthquakes = [];

/**
 * Mencari konfigurasi skala magnitudo untuk styling marker
 * @param {number} mag - Nilai magnitudo
 * @returns {object} Konfigurasi skala {min, max, color, label, radius}
 */
const getMagnitudeConfig = (mag) => {
  return (
    MAGNITUDE_SCALE.find((s) => mag >= s.min && mag < s.max) ||
    MAGNITUDE_SCALE[MAGNITUDE_SCALE.length - 1]
  );
};

/**
 * Menginisialisasi layer gempa bumi dan mendaftarkannya ke registry layer
 * @param {object[]} earthquakeData - List data gempa ter-normalisasi
 */
export const initEarthquakeLayer = (earthquakeData) => {
  allEarthquakes = earthquakeData;
  const map = getMap();

  if (!map) {
    console.error('[earthquakeLayer] Map belum diinisialisasi');
    return;
  }

  // Buat cluster group jika belum ada
  if (!earthquakeClusterGroup) {
    earthquakeClusterGroup = L.markerClusterGroup({
      showCoverageOnHover: false,
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      disableClusteringAtZoom: 14,
      iconCreateFunction: (cluster) => {
        const childCount = cluster.getChildCount();
        let sizeClass = 'small';
        if (childCount > 10) {
          sizeClass = 'medium';
        }
        if (childCount > 30) {
          sizeClass = 'large';
        }

        return L.divIcon({
          html: `<div><span>${childCount}</span></div>`,
          className: `marker-cluster marker-cluster-${sizeClass}`,
          iconSize: [40, 40],
        });
      },
    });

    // Daftarkan ke layer management (default visible)
    registerLayer('gempa', earthquakeClusterGroup, true);
  }

  // Render pertama kali dengan filter default (gempa aktif, timeRange 15 hari)
  updateEarthquakeMarkers(['gempa'], 15);
};

/**
 * Memperbarui marker gempa bumi di peta berdasarkan filter aktif
 * @param {string[]} activeTypes - Jenis bencana yang aktif (dari filter panel)
 * @param {number} timeRange - Rentang waktu dalam hari
 */
export const updateEarthquakeMarkers = (activeTypes, timeRange) => {
  if (!earthquakeClusterGroup) {
    return;
  }

  // Hapus semua marker yang ada
  earthquakeClusterGroup.clearLayers();

  // Jika gempa bumi tidak di-check, biarkan kosong
  if (!activeTypes.includes('gempa')) {
    return;
  }

  // Dapatkan 3 gempa teranyar secara nasional untuk efek pulse wave
  const sortedByTime = [...allEarthquakes].sort((a, b) => new Date(b.time) - new Date(a.time));
  const newestIds = new Set(sortedByTime.slice(0, 3).map((e) => e.id));

  // Hitung batas waktu filter
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - timeRange);

  allEarthquakes.forEach((gempa) => {
    const gempaDate = new Date(gempa.time);
    
    // Saring berdasarkan waktu
    if (gempaDate < limitDate) {
      return;
    }

    const isPulse = newestIds.has(gempa.id);
    const magConfig = getMagnitudeConfig(gempa.magnitude);
    const color = magConfig.color;
    const r = magConfig.radius;
    const size = (r * 2) + 24; // Ruang dasar marker

    // Logika denyut dinamis berdasarkan tingkat bahaya (magnitudo)
    let pulseHtml = '';
    const mag = gempa.magnitude;
    let pulseCount = 0;
    let pulseSizeMultiplier = 1.0;
    let pulseSpeed = '2.5s';

    if (mag >= 7.0) {
      pulseCount = 3;
      pulseSizeMultiplier = 3.0; // Area terdampak sangat luas
      pulseSpeed = '1.5s';       // Denyut sangat cepat
    } else if (mag >= 6.0) {
      pulseCount = 2;
      pulseSizeMultiplier = 2.2; // Area terdampak luas
      pulseSpeed = '1.8s';       // Denyut cepat
    } else if (mag >= 5.0) {
      pulseCount = 2;
      pulseSizeMultiplier = 1.6; // Area terdampak sedang-tinggi
      pulseSpeed = '2.2s';
    } else if (mag >= 4.0) {
      pulseCount = 1;
      pulseSizeMultiplier = 1.2; // Area terdampak sedang
      pulseSpeed = '2.8s';       // Denyut lambat
    } else if (isPulse) {
      // 3 gempa teranyar nasional tetap berdenyut meskipun magnitudo rendah
      pulseCount = 1;
      pulseSizeMultiplier = 1.0;
      pulseSpeed = '2.5s';
    }

    // Render multi-ring dengan delay berbeda
    for (let i = 0; i < pulseCount; i++) {
      const delay = (i * 0.6).toFixed(1);
      const pulseSize = size * pulseSizeMultiplier;
      pulseHtml += `
        <span class="earthquake-pulse" style="
          width: ${pulseSize}px;
          height: ${pulseSize}px;
          border-color: ${color};
          color: ${color};
          animation-delay: ${delay}s;
          animation-duration: ${pulseSpeed};
        "></span>
      `;
    }

    const markerHtml = `
      <div class="earthquake-marker-wrapper" style="width: ${size}px; height: ${size}px; color: ${color};">
        ${pulseHtml}
        <svg class="earthquake-target" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
          <!-- Lingkaran Luar Konsentris -->
          <circle cx="${size / 2}" cy="${size / 2}" r="${r + 4}" stroke="${color}" stroke-width="1.2" fill="none" stroke-opacity="0.4"/>
          <!-- Lingkaran Tengah -->
          <circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="${color}" fill-opacity="0.2" stroke="${color}" stroke-width="0.8"/>
          <!-- Pusat Titik Gempa -->
          <circle cx="${size / 2}" cy="${size / 2}" r="2.5" fill="${color}"/>
        </svg>
      </div>
    `;

    const customIcon = L.divIcon({
      html: markerHtml,
      className: 'earthquake-custom-icon',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2],
    });

    const marker = L.marker([gempa.lat, gempa.lng], { icon: customIcon });

    // Payload data untuk popup
    const popupData = {
      ...gempa,
      isNew: isPulse,
    };

    const popupContent = createEarthquakePopup(popupData);
    marker.bindPopup(popupContent, {
      maxWidth: 300,
      className: 'earthquake-popup-bubble',
      offset: [0, 0],
    });

    earthquakeClusterGroup.addLayer(marker);
  });
};
