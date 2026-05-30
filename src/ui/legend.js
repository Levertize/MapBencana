/**
 * MapBencana — Map Legend
 * Legenda peta di bagian bawah area peta
 */

import { CHOROPLETH_SCALE, DISASTER_TYPES } from '../utils/constants.js';

/**
 * Inisialisasi legend bar
 * Legend sudah ada di HTML, fungsi ini menangani interaksi
 */
export const initLegend = () => {
  // Legend bar sudah dirender di HTML secara statis
  // Fungsi ini hanya perlu menghandle dynamic updates
  initLegendInteractions();
};

/**
 * Update legend berdasarkan mode tampilan
 * @param {'choropleth'|'disaster'} mode - Mode legend
 */
export const updateLegend = (mode) => {
  const legendBar = document.getElementById('legend-bar');
  if (!legendBar) {
    return;
  }

  if (mode === 'choropleth') {
    renderChoroplethLegend(legendBar);
  } else if (mode === 'disaster') {
    renderDisasterLegend(legendBar);
  }
};

/**
 * Render legend untuk mode choropleth
 * @param {HTMLElement} container
 */
const renderChoroplethLegend = (container) => {
  const title = container.querySelector('.legend-bar__title');
  const items = container.querySelector('.legend-bar__items');

  if (title) {
    title.textContent = 'Jumlah Kejadian (15 Hari)';
  }

  if (items) {
    items.innerHTML = CHOROPLETH_SCALE.map(
      (scale) => `
      <div class="legend-bar__item">
        <span class="legend-bar__color" style="background: ${scale.color};"></span>
        <span>${scale.label}</span>
      </div>
    `,
    ).join('');
  }
};

/**
 * Render legend untuk mode disaster markers
 * @param {HTMLElement} container
 */
const renderDisasterLegend = (container) => {
  const title = container.querySelector('.legend-bar__title');
  const items = container.querySelector('.legend-bar__items');

  if (title) {
    title.textContent = 'Jenis Bencana';
  }

  if (items) {
    items.innerHTML = Object.values(DISASTER_TYPES)
      .map(
        (type) => `
      <div class="legend-bar__item">
        <span class="legend-bar__color" style="background: ${type.color};"></span>
        <span>${type.label}</span>
      </div>
    `,
      )
      .join('');
  }
};

/**
 * Toggle visibility legend
 * @param {boolean} visible
 */
export const setLegendVisible = (visible) => {
  const legendBar = document.getElementById('legend-bar');
  if (legendBar) {
    legendBar.style.display = visible ? 'flex' : 'none';
  }
};

/**
 * Inisialisasi interaksi legend (hover highlight, dsb)
 */
const initLegendInteractions = () => {
  const legendItems = document.querySelectorAll('.legend-bar__item');

  legendItems.forEach((item) => {
    item.addEventListener('mouseenter', () => {
      // Subtle scale up effect
      item.style.transform = 'scale(1.05)';
      item.style.transition = 'transform 150ms ease';
    });

    item.addEventListener('mouseleave', () => {
      item.style.transform = 'scale(1)';
    });
  });
};
