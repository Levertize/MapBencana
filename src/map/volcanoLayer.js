/**
 * MapBencana — Volcano Map Layer
 * Mengelola rendering marker gunung berapi aktif di Indonesia
 */

import L from 'leaflet';
import { getMap } from './initMap.js';
import { registerLayer } from './layers.js';
import { createVolcanoPopup } from '../ui/popup.js';

/** @type {L.LayerGroup|null} Instance layer group gunung berapi */
let volcanoLayerGroup = null;

/**
 * Menginisialisasi layer gunung berapi dan mendaftarkannya ke registry
 */
export const initVolcanoLayer = async () => {
  const map = getMap();
  if (!map) {
    console.error('[volcanoLayer] Map belum diinisialisasi');
    return;
  }

  // Buat LayerGroup untuk gunung berapi
  volcanoLayerGroup = L.layerGroup();

  try {
    const response = await fetch('./data/volcanoes.json');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const volcanoes = await response.json();

    volcanoes.forEach((volcano) => {
      const marker = createVolcanoMarker(volcano);
      if (marker) {
        volcanoLayerGroup.addLayer(marker);
      }
    });

    // Daftarkan ke layer registry (default visible = true berdasarkan filterState default)
    registerLayer('volcanoes', volcanoLayerGroup, true);
    console.log('[volcanoLayer] Layer gunung berapi berhasil dimuat.');
  } catch (error) {
    console.error('[volcanoLayer] Gagal memuat data gunung berapi:', error);
  }
};

/**
 * Membuat marker Leaflet untuk satu gunung berapi
 * @param {object} volcano - Data gunung berapi
 * @returns {L.Marker|null} Marker Leaflet
 */
const createVolcanoMarker = (volcano) => {
  if (!volcano.lat || !volcano.lng) {
    return null;
  }

  // Tentukan warna berdasarkan status aktivitas
  const statusColorMap = {
    Normal: '#3B82F6', // Biru
    Waspada: '#FBBF24', // Kuning
    Siaga: '#F97316', // Orange
    Awas: '#EF4444', // Merah
  };
  const color = statusColorMap[volcano.status] || '#F97316';

  // Custom SVG triangle icon
  const markerHtml = `
    <div class="volcano-marker-wrapper" style="color: ${color};">
      <svg class="volcano-svg" width="24" height="24" viewBox="0 0 24 24">
        <!-- Segitiga representasi gunung berapi -->
        <polygon points="12,2 22,20 2,20" fill="currentColor" fill-opacity="0.85" stroke="#0B1121" stroke-width="1.5"/>
        <!-- Titik kawah tengah -->
        <circle cx="12" cy="14" r="2" fill="#fff"/>
      </svg>
    </div>
  `;

  const customIcon = L.divIcon({
    html: markerHtml,
    className: 'volcano-custom-icon',
    iconSize: [24, 24],
    iconAnchor: [12, 16], // Jangkar di tengah bawah segitiga
  });

  const marker = L.marker([volcano.lat, volcano.lng], { icon: customIcon });

  // Bind custom popup
  const popupContent = createVolcanoPopup(volcano);
  marker.bindPopup(popupContent, {
    maxWidth: 280,
    className: 'volcano-popup-bubble',
  });

  return marker;
};
