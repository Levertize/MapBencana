/**
 * MapBencana — Choropleth Map Layer
 * Mengelola rendering batas provinsi, visualisasi choropleth bencana,
 * serta interaksi navigasi per wilayah
 */

import L from 'leaflet';
import { getMap } from './initMap.js';
import { registerLayer } from './layers.js';
import { getChoroplethColor } from '../utils/colorScale.js';

/** @type {L.GeoJSON|null} Instance layer choropleth (fill & border) */
let choroplethLayer = null;

/** @type {L.GeoJSON|null} Instance layer outline batas provinsi saja */
let borderLayer = null;

/** @type {object} Reference ke hitungan bencana per provinsi saat ini */
let currentProvinceCounts = {};

/**
 * Normalisasi nama provinsi dari GeoJSON agar cocok dengan format internal
 * @param {string} name - Nama provinsi mentah dari GeoJSON
 * @returns {string} Nama provinsi yang bersih/terstandarisasi
 */
const normalizeGeoJSONProvince = (name) => {
  if (!name) {
    return '';
  }
  let n = name.toUpperCase().trim();

  // Bersihkan prefix umum
  if (n.startsWith('PROVINSI ')) {
    n = n.replace('PROVINSI ', '');
  }
  if (n.startsWith('PROV. ')) {
    n = n.replace('PROV. ', '');
  }
  
  // Mapping variasi nama khusus
  if (n === 'PROBANTEN') {
    return 'Banten';
  }
  if (n === 'DAERAH ISTIMEWA YOGYAKARTA' || n === 'YOGYAKARTA') {
    return 'DI Yogyakarta';
  }
  if (n === 'DAERAH KHUSUS IBUKOTA JAKARTA' || n === 'JAKARTA' || n === 'DKI JAKARTA') {
    return 'DKI Jakarta';
  }
  if (n === 'BANGKA BELITUNG' || n === 'KEPULAUAN BANGKA BELITUNG') {
    return 'Kepulauan Bangka Belitung';
  }
  if (n === 'KEPULAUAN RIAU') {
    return 'Kepulauan Riau';
  }
  if (n === 'IRIAN JAYA BARAT') {
    return 'Papua Barat';
  }
  if (n === 'IRIAN JAYA TIMUR' || n === 'IRIAN JAYA' || n === 'IRIAN JAYA TENGAH') {
    return 'Papua';
  }
  
  return n;
};

/**
 * Mencari jumlah bencana dari provinceCounts berdasarkan nama GeoJSON
 * @param {string} rawName - Nama dari GeoJSON feature
 * @returns {number} Jumlah kejadian bencana
 */
const getDisasterCountForProvince = (rawName) => {
  const normalized = normalizeGeoJSONProvince(rawName).toLowerCase();
  
  const match = Object.keys(currentProvinceCounts).find(
    (key) => key.toLowerCase() === normalized
  );

  return match ? currentProvinceCounts[match].count : 0;
};

/**
 * Inisialisasi choropleth layer
 */
export const initChoroplethLayer = async () => {
  const map = getMap();
  if (!map) {
    console.error('[choropleth] Map belum diinisialisasi');
    return;
  }

  try {
    const response = await fetch('./data/indonesia-provinces.geojson');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const geojsonData = await response.json();

    // 1. Buat outline border layer (slate outline, tanpa fill)
    borderLayer = L.geoJSON(geojsonData, {
      style: {
        fill: false,
        color: '#475569', // Slate border
        weight: 1.5,
        opacity: 0.6,
        interactive: false,
      },
    });

    // 2. Buat choropleth fill layer dengan interaktivitas
    choroplethLayer = L.geoJSON(geojsonData, {
      style: featureStyle,
      onEachFeature: onEachFeatureHandler,
    });

    // Daftarkan ke registry
    // default active sesuai state awal: choropleth = true, province-border = true
    registerLayer('choropleth', choroplethLayer, true);
    registerLayer('province-border', borderLayer, true);
    
    console.log('[choropleth] Layer batas provinsi & choropleth berhasil dimuat.');
  } catch (error) {
    console.error('[choropleth] Gagal memuat GeoJSON provinsi:', error);
  }
};

/**
 * Fungsi pemberi gaya untuk setiap feature choropleth
 * @param {object} feature - GeoJSON feature
 * @returns {object} Leaflet style options
 */
const featureStyle = (feature) => {
  const provName = feature.properties.Propinsi || feature.properties.state || '';
  const count = getDisasterCountForProvince(provName);
  const color = getChoroplethColor(count);

  return {
    fillColor: color,
    weight: 1.2,
    opacity: 1,
    color: '#0F172A', // Border warna gelap agar kontras
    fillOpacity: count > 0 ? 0.7 : 0.15, // Pudar jika tidak ada kejadian
    transition: 'all 0.2s',
  };
};

/**
 * Handler interaksi mouse untuk setiap feature
 * @param {object} feature
 * @param {L.Layer} layer
 */
const onEachFeatureHandler = (feature, layer) => {
  const provName = feature.properties.Propinsi || feature.properties.state || '';
  
  layer.on({
    mouseover: (e) => {
      const l = e.target;
      const count = getDisasterCountForProvince(provName);

      l.setStyle({
        weight: 2,
        color: '#EF4444', // Aksen merah primary
        fillOpacity: 0.85,
      });

      if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        l.bringToFront();
      }

      // Bind dan tampilkan tooltip interaktif
      l.bindTooltip(`
        <div class="map-tooltip">
          <strong class="map-tooltip__title">${provName}</strong>
          <span class="map-tooltip__value">${count} Kejadian Bencana</span>
        </div>
      `, {
        direction: 'auto',
        className: 'custom-map-tooltip',
        sticky: true,
      }).openTooltip();
    },
    mouseout: (e) => {
      if (choroplethLayer) {
        choroplethLayer.resetStyle(e.target);
      }
    },
    click: (e) => {
      const map = getMap();
      if (map) {
        map.fitBounds(e.target.getBounds(), {
          padding: [50, 50],
          maxZoom: 7,
          animate: true,
          duration: 1.2,
        });
      }
    },
  });
};

/**
 * Memperbarui gaya choropleth berdasarkan data statistik terbaru
 * @param {object} provinceCounts - Pemetaan nama provinsi ke counts
 */
export const updateChoropleth = (provinceCounts) => {
  currentProvinceCounts = provinceCounts;
  
  if (choroplethLayer) {
    choroplethLayer.setStyle(featureStyle);
  }
};

/**
 * Fly / Zoom ke provinsi tertentu berdasarkan nama
 * @param {string} provinceName - Nama provinsi target
 * @returns {boolean} True jika provinsi ditemukan dan peta bergeser
 */
export const zoomToProvince = (provinceName) => {
  if (!choroplethLayer) {
    return false;
  }

  const normalizedTarget = normalizeGeoJSONProvince(provinceName).toLowerCase();
  let foundLayer = null;

  choroplethLayer.eachLayer((layer) => {
    if (foundLayer) {
      return;
    }

    const featName = layer.feature?.properties?.Propinsi || layer.feature?.properties?.state || '';
    const normalizedFeat = normalizeGeoJSONProvince(featName).toLowerCase();
    
    if (normalizedFeat === normalizedTarget) {
      foundLayer = layer;
    }
  });

  if (foundLayer) {
    const map = getMap();
    if (map) {
      const bounds = foundLayer.getBounds();
      map.fitBounds(bounds, {
        padding: [80, 80],
        maxZoom: 7,
        animate: true,
        duration: 1.5,
      });

      // Highlight sejenak untuk feedback visual
      foundLayer.setStyle({
        weight: 3,
        color: '#EF4444',
        fillOpacity: 0.9,
      });

      setTimeout(() => {
        if (choroplethLayer) {
          choroplethLayer.resetStyle(foundLayer);
        }
      }, 1500);

      return true;
    }
  }

  return false;
};
