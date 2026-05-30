/**
 * MapBencana — Map Initialization
 * Inisialisasi Leaflet map dengan konfigurasi default
 */

import L from 'leaflet';
import { MAP_CONFIG, TILE_LAYERS } from '../utils/constants.js';
import { toastSuccess } from '../ui/toast.js';

/** @type {L.Map|null} Instance peta Leaflet */
let map = null;

/** @type {Object.<string, L.TileLayer>} Registry tile layers */
const tileLayers = {};

/** @type {string} ID tile layer aktif */
let activeLayerId = 'dark';

/**
 * Inisialisasi Leaflet map
 * @returns {L.Map} Instance peta
 */
export const initMap = () => {
  // Buat map instance
  map = L.map('map', {
    center: MAP_CONFIG.center,
    zoom: MAP_CONFIG.zoom,
    minZoom: MAP_CONFIG.minZoom,
    maxZoom: MAP_CONFIG.maxZoom,
    maxBounds: MAP_CONFIG.maxBounds,
    maxBoundsViscosity: 0.8,
    zoomControl: false, // Custom zoom control position
    attributionControl: true,
  });

  // Tambah zoom control di kanan atas
  L.control.zoom({ position: 'topright' }).addTo(map);

  // Tambah scale control
  L.control.scale({
    position: 'bottomleft',
    metric: true,
    imperial: false,
    maxWidth: 150,
  }).addTo(map);

  // Init tile layers
  Object.entries(TILE_LAYERS).forEach(([id, config]) => {
    tileLayers[id] = L.tileLayer(config.url, {
      attribution: config.attribution,
      maxZoom: MAP_CONFIG.maxZoom,
    });
  });

  // Set default tile layer (dark)
  tileLayers[activeLayerId].addTo(map);

  // Tambah locate button
  addLocateControl();

  // Tambah basemap switcher
  addBasemapSwitcher();

  return map;
};

/**
 * Mendapatkan instance peta
 * @returns {L.Map|null}
 */
export const getMap = () => map;

/**
 * Ganti tile layer
 * @param {string} layerId - ID tile layer ('dark', 'standard', 'satellite')
 */
export const switchTileLayer = (layerId) => {
  if (!tileLayers[layerId] || layerId === activeLayerId) {
    return;
  }

  // Hapus layer aktif
  map.removeLayer(tileLayers[activeLayerId]);

  // Tambah layer baru
  tileLayers[layerId].addTo(map);
  activeLayerId = layerId;
};

/**
 * Fly ke lokasi tertentu dengan animasi
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} zoom - Level zoom
 */
export const flyToLocation = (lat, lng, zoom = 10) => {
  if (!map) {
    return;
  }
  map.flyTo([lat, lng], zoom, {
    duration: 1.5,
    easeLinearity: 0.25,
  });
};

/**
 * Reset view ke posisi default Indonesia
 */
export const resetView = () => {
  if (!map) {
    return;
  }
  map.flyTo(MAP_CONFIG.center, MAP_CONFIG.zoom, {
    duration: 1,
  });
};

/**
 * Tambah tombol locate (geolocation) ke peta
 */
const addLocateControl = () => {
  const locateBtn = document.createElement('button');
  locateBtn.className = 'map-control-locate';
  locateBtn.setAttribute('aria-label', 'Temukan lokasi saya');
  locateBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="3"/>
      <path d="M12 2v4M12 18v4M2 12h4M18 12h4"/>
    </svg>
  `;

  locateBtn.addEventListener('click', () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          flyToLocation(pos.coords.latitude, pos.coords.longitude, 12);
        },
        (err) => {
          console.error('[initMap] Geolocation error:', err.message);
        },
      );
    }
  });

  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.parentElement.appendChild(locateBtn);
  }
};

/**
 * Tambah basemap switcher UI ke peta
 */
const addBasemapSwitcher = () => {
  const wrapper = document.createElement('div');
  wrapper.className = 'map-control-basemap-wrapper';

  const triggerBtn = document.createElement('button');
  triggerBtn.className = 'map-control-basemap';
  triggerBtn.setAttribute('aria-label', 'Ganti peta dasar');
  triggerBtn.setAttribute('aria-expanded', 'false');
  triggerBtn.innerHTML = `
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
    </svg>
  `;

  const optionsPanel = document.createElement('div');
  optionsPanel.className = 'map-basemap-options hidden';

  const options = [
    { id: 'dark', label: 'Dark Matter', class: 'dark' },
    { id: 'standard', label: 'Street Map', class: 'standard' },
    { id: 'satellite', label: 'Satelit', class: 'satellite' },
  ];

  options.forEach((opt) => {
    const btn = document.createElement('button');
    btn.className = `map-basemap-option${opt.id === activeLayerId ? ' active' : ''}`;
    btn.dataset.layerId = opt.id;
    btn.innerHTML = `
      <span class="map-basemap-option__thumbnail map-basemap-option__thumbnail--${opt.class}"></span>
      <span class="map-basemap-option__label">${opt.label}</span>
    `;

    btn.addEventListener('click', () => {
      switchTileLayer(opt.id);

      optionsPanel.querySelectorAll('.map-basemap-option').forEach((b) => {
        b.classList.remove('active');
      });
      btn.classList.add('active');

      optionsPanel.classList.add('hidden');
      triggerBtn.setAttribute('aria-expanded', 'false');

      toastSuccess(`Peta dasar diubah ke ${opt.label}`, {
        title: 'Peta Dasar',
        duration: 2000,
      });
    });

    optionsPanel.appendChild(btn);
  });

  triggerBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isExpanded = triggerBtn.getAttribute('aria-expanded') === 'true';
    triggerBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
    optionsPanel.classList.toggle('hidden');
  });

  document.addEventListener('click', (e) => {
    if (!wrapper.contains(e.target)) {
      optionsPanel.classList.add('hidden');
      triggerBtn.setAttribute('aria-expanded', 'false');
    }
  });

  wrapper.appendChild(triggerBtn);
  wrapper.appendChild(optionsPanel);

  const mapContainer = document.getElementById('map');
  if (mapContainer) {
    mapContainer.parentElement.appendChild(wrapper);
  }
};
