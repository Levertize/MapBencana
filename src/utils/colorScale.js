/**
 * MapBencana — Color Scale Utilities
 * Fungsi untuk menentukan warna berdasarkan value
 */

import { CHOROPLETH_SCALE, MAGNITUDE_SCALE } from './constants.js';

/**
 * Mendapatkan warna choropleth berdasarkan jumlah kejadian
 * @param {number} count - Jumlah kejadian
 * @returns {string} Kode warna hex
 */
export const getChoroplethColor = (count) => {
  for (const scale of CHOROPLETH_SCALE) {
    if (count >= scale.min && count <= scale.max) {
      return scale.color;
    }
  }
  return CHOROPLETH_SCALE[CHOROPLETH_SCALE.length - 1].color;
};

/**
 * Mendapatkan warna dan radius marker berdasarkan magnitude gempa
 * @param {number} magnitude - Nilai magnitude
 * @returns {{ color: string, radius: number, label: string }}
 */
export const getMagnitudeStyle = (magnitude) => {
  for (const scale of MAGNITUDE_SCALE) {
    if (magnitude >= scale.min && magnitude < scale.max) {
      return {
        color: scale.color,
        radius: scale.radius,
        label: scale.label,
      };
    }
  }
  return {
    color: MAGNITUDE_SCALE[MAGNITUDE_SCALE.length - 1].color,
    radius: MAGNITUDE_SCALE[MAGNITUDE_SCALE.length - 1].radius,
    label: MAGNITUDE_SCALE[MAGNITUDE_SCALE.length - 1].label,
  };
};

/**
 * Interpolasi warna antara dua hex colors
 * @param {string} color1 - Start color (hex)
 * @param {string} color2 - End color (hex)
 * @param {number} factor - Faktor interpolasi (0-1)
 * @returns {string} Hasil interpolasi (hex)
 */
export const interpolateColor = (color1, color2, factor) => {
  const c1 = hexToRgb(color1);
  const c2 = hexToRgb(color2);

  const r = Math.round(c1.r + (c2.r - c1.r) * factor);
  const g = Math.round(c1.g + (c2.g - c1.g) * factor);
  const b = Math.round(c1.b + (c2.b - c1.b) * factor);

  return rgbToHex(r, g, b);
};

/**
 * Konversi hex ke RGB object
 * @param {string} hex - Kode warna hex
 * @returns {{ r: number, g: number, b: number }}
 */
const hexToRgb = (hex) => {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
};

/**
 * Konversi RGB values ke hex
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {string} Kode warna hex
 */
const rgbToHex = (r, g, b) => {
  return `#${[r, g, b].map((x) => x.toString(16).padStart(2, '0')).join('')}`;
};
