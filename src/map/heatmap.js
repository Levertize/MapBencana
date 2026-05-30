/**
 * MapBencana — Heatmap Layer
 * Mengelola rendering heatmap kepadatan titik gempa bumi
 */

import L from 'leaflet';
// Daftarkan L ke window sebelum import plugin Leaflet.heat
window.L = L;
import 'leaflet.heat';

import { registerLayer } from './layers.js';

/** @type {L.HeatLayer|null} Instance layer heatmap */
let heatmapLayer = null;

/** @type {object[]} Simpan referensi data gempa bumi */
let allEarthquakes = [];

/**
 * Inisialisasi layer heatmap
 * @param {object[]} earthquakeData - List data gempa ter-normalisasi
 */
export const initHeatmapLayer = (earthquakeData) => {
  allEarthquakes = earthquakeData;

  // Inisialisasi L.heatLayer dengan array kosong dan opsi visualisasi
  heatmapLayer = L.heatLayer([], {
    radius: 25,
    blur: 15,
    maxZoom: 10,
    minOpacity: 0.3,
    gradient: {
      0.4: '#3B82F6', // Blue
      0.6: '#06B6D4', // Cyan
      0.7: '#10B981', // Emerald
      0.8: '#FBBF24', // Yellow
      0.9: '#F97316', // Orange
      1.0: '#EF4444', // Red
    },
  });

  // Daftarkan ke layer registry (default hidden = false)
  registerLayer('heatmap', heatmapLayer, false);
};

/**
 * Memperbarui titik-titik heatmap berdasarkan filter waktu aktif
 * @param {string[]} activeTypes - Jenis bencana aktif
 * @param {number} timeRange - Rentang waktu dalam hari
 */
export const updateHeatmap = (activeTypes, timeRange) => {
  if (!heatmapLayer) {
    return;
  }

  // Jika tipe gempa tidak aktif di filter, kosongkan heatmap
  if (!activeTypes.includes('gempa')) {
    heatmapLayer.setLatLngs([]);
    return;
  }

  // Filter data gempa berdasarkan waktu
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - timeRange);

  const points = allEarthquakes
    .filter((g) => new Date(g.time) >= limitDate)
    .map((g) => {
      // Normalisasi intensitas berbasis magnitudo untuk input heatmap (lebih sensitif agar warna lebih terlihat)
      const intensity = Math.max(0.4, Math.min(1.0, (g.magnitude - 2) / 4));
      return [g.lat, g.lng, intensity];
    });

  heatmapLayer.setLatLngs(points);
};
