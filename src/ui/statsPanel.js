/**
 * MapBencana — Stats Panel
 * Panel statistik ringkasan bencana di sisi kanan
 */

import { formatNumber } from '../utils/formatter.js';

/**
 * Data dummy statistik (akan diganti dengan data real di phase berikutnya)
 * @type {object}
 */
const dummyStats = {
  total: 297,
  change: 12,
  breakdown: {
    gempa: { count: 128, change: 8, direction: 'up' },
    gunung: { count: 45, change: 5, direction: 'up' },
    banjir: { count: 72, change: 15, direction: 'up' },
    longsor: { count: 34, change: 3, direction: 'down' },
  },
  provinces: [
    { name: 'Jawa Barat', count: 48, color: '#EF4444' },
    { name: 'Jawa Timur', count: 42, color: '#F97316' },
    { name: 'Sulawesi Selatan', count: 31, color: '#FB923C' },
    { name: 'Nusa Tenggara Timur', count: 28, color: '#FBBF24' },
    { name: 'Sumatera Barat', count: 22, color: '#34D399' },
  ],
  trend: [8, 12, 15, 10, 18, 22, 14, 20, 25, 19, 28, 22, 30, 24, 26],
};

/**
 * Inisialisasi stats panel
 */
export const initStatsPanel = () => {
  renderTotalSparkline();
  renderTrendChart();
  initStatsInteractions();
};

/**
 * Update stats panel dengan data baru
 * @param {object} data - Data statistik
 */
export const updateStats = (data) => {
  // Update total
  const totalValue = document.querySelector('#stats-total .stats-card__value');
  if (totalValue) {
    animateNumber(totalValue, data.total !== undefined ? data.total : dummyStats.total);
  }

  // Update total sparkline
  if (data.trend) {
    renderTotalSparkline(data.trend);
  } else {
    renderTotalSparkline();
  }

  // Update mini cards
  updateMiniCards(data.breakdown || dummyStats.breakdown);

  // Update province ranking
  updateProvinceRanking(data.provinces || dummyStats.provinces);

  // Update trend chart
  if (data.trend) {
    renderTrendChart(data.trend, data.xLabels);
  }
};

/**
 * Helper untuk membuat smooth SVG path (cubic bezier) dari array points
 * @param {Array<{x: number, y: number}>} points
 * @returns {string} Path string untuk atribut d
 */
const getBezierPath = (points) => {
  if (points.length === 0) {
    return '';
  }
  if (points.length === 1) {
    return `M ${points[0].x} ${points[0].y}`;
  }

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i];
    const p1 = points[i + 1];

    const cp1x = p0.x + (p1.x - p0.x) / 3;
    const cp1y = p0.y;
    const cp2x = p0.x + 2 * (p1.x - p0.x) / 3;
    const cp2y = p1.y;

    path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1.y}`;
  }
  return path;
};

/**
 * Render sparkline kecil di dalam stats-card Total Kejadian
 * @param {number[]} data - Array data trend
 */
const renderTotalSparkline = (data = dummyStats.trend) => {
  const canvas = document.getElementById('total-sparkline');
  if (!canvas) {
    return;
  }

  const width = 90;
  const height = 45;
  const padding = { top: 4, right: 4, bottom: 4, left: 4 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((val - min) / range) * chartH;
    return { x, y };
  });

  const pathD = getBezierPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  canvas.innerHTML = `
    <svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
      <defs>
        <linearGradient id="totalSparkGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#EF4444" stop-opacity="0.25"/>
          <stop offset="100%" stop-color="#EF4444" stop-opacity="0.0"/>
        </linearGradient>
      </defs>
      <path d="${areaD}" fill="url(#totalSparkGradient)"/>
      <path d="${pathD}" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  `;
};

/**
 * Render trend chart sederhana menggunakan SVG
 * @param {number[]} data - Array data trend
 * @param {string[]} xLabels - Array label sumbu X
 */
const renderTrendChart = (data = dummyStats.trend, xLabels = ['25 Mei', '1 Jun', '8 Jun']) => {
  const canvas = document.getElementById('trend-chart-canvas');
  if (!canvas) {
    return;
  }

  const width = canvas.clientWidth || 260;
  const height = canvas.clientHeight || 80;
  const padding = { top: 10, right: 10, bottom: 20, left: 30 };

  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data.map((val, i) => {
    const x = padding.left + (i / (data.length - 1)) * chartW;
    const y = padding.top + chartH - ((val - min) / range) * chartH;
    return { x, y };
  });

  // Smooth bezier curve
  const pathD = getBezierPath(points);
  const areaD = `${pathD} L ${points[points.length - 1].x} ${padding.top + chartH} L ${points[0].x} ${padding.top + chartH} Z`;

  // Y-axis labels (min, mid, max)
  const yLabels = [
    parseFloat(min.toFixed(1)),
    parseFloat(((min + max) / 2).toFixed(1)),
    parseFloat(max.toFixed(1))
  ];

  canvas.innerHTML = `
    <svg width="100%" height="100%" viewBox="0 0 ${width} ${height}" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="trendGradient" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#EF4444" stop-opacity="0.3"/>
          <stop offset="100%" stop-color="#EF4444" stop-opacity="0.02"/>
        </linearGradient>
      </defs>

      <!-- Grid lines (solid like in UI.png) -->
      ${yLabels.map((_, i) => {
        const y = padding.top + (i / (yLabels.length - 1)) * chartH;
        return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="#1E293B" stroke-width="1"/>`;
      }).join('')}

      <!-- Area fill -->
      <path d="${areaD}" fill="url(#trendGradient)"/>

      <!-- Line -->
      <path d="${pathD}" fill="none" stroke="#EF4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>

      <!-- Dots on all points like in UI.png -->
      ${points.map((p) =>
        `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#EF4444" stroke="#0B1121" stroke-width="2"/>`
      ).join('')}

      <!-- Y-axis labels -->
      ${yLabels.map((val, i) => {
        const y = padding.top + chartH - (i / (yLabels.length - 1)) * chartH;
        return `<text x="${padding.left - 5}" y="${y + 4}" text-anchor="end" fill="#6B7280" font-size="9" font-family="Inter, sans-serif">${val}</text>`;
      }).join('')}

      <!-- X-axis labels -->
      ${xLabels.map((label, i) => {
        const x = padding.left + (i / (xLabels.length - 1)) * chartW;
        return `<text x="${x}" y="${height - 4}" text-anchor="middle" fill="#6B7280" font-size="9" font-family="Inter, sans-serif">${label}</text>`;
      }).join('')}
    </svg>
  `;
};


/**
 * Update mini stat cards
 * @param {object} breakdown - Data breakdown per jenis bencana
 */
const updateMiniCards = (breakdown) => {
  Object.entries(breakdown).forEach(([type, data]) => {
    const card = document.querySelector(`.stats-mini--${type}`);
    if (!card) {
      return;
    }

    const valueEl = card.querySelector('.stats-mini__value');
    const changeEl = card.querySelector('.stats-mini__change');

    if (valueEl) {
      valueEl.textContent = formatNumber(data.count);
    }

    if (changeEl) {
      changeEl.textContent = `${data.direction === 'up' ? '↑' : '↓'} ${data.change}%`;
      changeEl.className = `stats-mini__change stats-mini__change--${data.direction}`;
    }
  });
};

/**
 * Update province ranking list
 * @param {Array<{name: string, count: number, color: string}>} provinces
 */
const updateProvinceRanking = (provinces) => {
  const list = document.querySelector('.province-ranking__list');
  if (!list) {
    return;
  }

  list.innerHTML = provinces
    .map(
      (prov, i) => `
    <li class="province-ranking__item">
      <span class="province-ranking__rank">${i + 1}</span>
      <span class="province-ranking__dot" style="background: ${prov.color};"></span>
      <span class="province-ranking__name">${prov.name}</span>
      <span class="province-ranking__count">${prov.count}</span>
    </li>
  `,
    )
    .join('');
};

/**
 * Animasi penghitung angka
 * @param {HTMLElement} element - Elemen target
 * @param {number} target - Angka tujuan
 * @param {number} duration - Durasi animasi (ms)
 */
const animateNumber = (element, target, duration = 800) => {
  const start = parseInt(element.textContent, 10) || 0;
  const diff = target - start;
  const startTime = performance.now();

  const animate = (currentTime) => {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);

    // Ease out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = Math.round(start + diff * eased);

    element.textContent = formatNumber(current);

    if (progress < 1) {
      requestAnimationFrame(animate);
    }
  };

  requestAnimationFrame(animate);
};

/**
 * Inisialisasi interaksi stats panel
 */
const initStatsInteractions = () => {
  // Mini card hover effects (sudah di CSS)
  // Province item click → fly to province
  const provinceItems = document.querySelectorAll('.province-ranking__item');
  provinceItems.forEach((item) => {
    item.addEventListener('click', () => {
      const name = item.querySelector('.province-ranking__name')?.textContent;
      // TODO: Fly to province saat GeoJSON sudah tersedia
      console.warn(`[statsPanel] Province click: ${name} — fly to belum diimplementasi`);
    });
  });
};
