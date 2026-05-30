/**
 * MapBencana — Layer Management
 * Manajemen layer peta (tile, GeoJSON, marker, heatmap)
 */

import { getMap } from './initMap.js';

/** @type {Object.<string, L.Layer>} Registry semua layer */
const layers = {};

/** @type {Set<string>} Set layer yang aktif */
const activeLayers = new Set();

/**
 * Menambahkan layer ke registry
 * @param {string} id - ID unik layer
 * @param {L.Layer} layer - Instance Leaflet layer
 * @param {boolean} visible - Apakah langsung ditampilkan
 */
export const registerLayer = (id, layer, visible = false) => {
  layers[id] = layer;

  if (visible) {
    showLayer(id);
  }
};

/**
 * Menampilkan layer di peta
 * @param {string} id - ID layer
 */
export const showLayer = (id) => {
  const map = getMap();
  const layer = layers[id];

  if (!map || !layer) {
    return;
  }

  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
  activeLayers.add(id);
};

/**
 * Menyembunyikan layer dari peta
 * @param {string} id - ID layer
 */
export const hideLayer = (id) => {
  const map = getMap();
  const layer = layers[id];

  if (!map || !layer) {
    return;
  }

  if (map.hasLayer(layer)) {
    map.removeLayer(layer);
  }
  activeLayers.delete(id);
};

/**
 * Toggle visibility layer
 * @param {string} id - ID layer
 * @returns {boolean} State baru (true = visible)
 */
export const toggleLayer = (id) => {
  if (activeLayers.has(id)) {
    hideLayer(id);
    return false;
  } else {
    showLayer(id);
    return true;
  }
};

/**
 * Cek apakah layer sedang aktif
 * @param {string} id - ID layer
 * @returns {boolean}
 */
export const isLayerActive = (id) => {
  return activeLayers.has(id);
};

/**
 * Mendapatkan instance layer berdasarkan ID
 * @param {string} id - ID layer
 * @returns {L.Layer|undefined}
 */
export const getLayer = (id) => {
  return layers[id];
};

/**
 * Menghapus layer dari registry dan peta
 * @param {string} id - ID layer
 */
export const removeLayer = (id) => {
  hideLayer(id);
  delete layers[id];
};

/**
 * Mendapatkan daftar semua layer yang terdaftar
 * @returns {string[]} Array of layer IDs
 */
export const getRegisteredLayers = () => {
  return Object.keys(layers);
};
