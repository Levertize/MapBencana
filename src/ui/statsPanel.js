/**
 * MapBencana — Stats Panel
 * Panel statistik ringkasan bencana di sisi kanan
 */

import { formatNumber } from '../utils/formatter.js';
import { zoomToProvince } from '../map/choropleth.js';
import { switchTileLayer, flyToLocation } from '../map/initMap.js';

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

/** @type {object[]} Cache data gempa */
let cachedEarthquakes = [];

/** @type {object[]} Cache data gunung berapi */
let cachedVolcanoes = [];

/**
 * Inisialisasi stats panel
 */
export const initStatsPanel = () => {
  renderTotalSparkline();
  renderTrendChart();
  initStatsInteractions();
  initSettings();
  fetchVolcanoes();
};

/**
 * Menyimpan data gempa ter-cache ke panel
 * @param {object[]} data - Data gempa bumi ter-normalisasi
 */
export const setEarthquakeData = (data) => {
  cachedEarthquakes = data;
  const activeNavItem = document.querySelector('.icon-nav__item--active');
  const activeView = activeNavItem ? activeNavItem.dataset.view : 'peta';
  if (activeView === 'riwayat') {
    renderHistoryList();
  } else if (activeView === 'peringatan') {
    renderAlertsList();
  }
};

/**
 * Mengambil data gunung berapi secara asinkronus
 */
const fetchVolcanoes = async () => {
  try {
    const response = await fetch('./data/volcanoes.json');
    if (response.ok) {
      cachedVolcanoes = await response.json();
    }
  } catch (error) {
    console.error('[statsPanel] Gagal memuat data gunung berapi:', error);
  }
};

/**
 * Menampilkan skeleton shimmer loader di panel Ringkasan
 */
export const showStatsLoading = () => {
  const content = document.getElementById('ringkasan-content');
  const skeleton = document.getElementById('ringkasan-skeleton');
  const error = document.getElementById('ringkasan-error');

  content?.classList.add('hidden');
  error?.classList.add('hidden');
  skeleton?.classList.remove('hidden');
};

/**
 * Menampilkan pesan error di panel Ringkasan dengan tombol coba lagi
 * @param {Function} onRetry - Callback fungsi saat tombol ditekan
 */
export const showStatsError = (onRetry) => {
  const content = document.getElementById('ringkasan-content');
  const skeleton = document.getElementById('ringkasan-skeleton');
  const error = document.getElementById('ringkasan-error');

  content?.classList.add('hidden');
  skeleton?.classList.add('hidden');
  error?.classList.remove('hidden');

  const btnRetry = document.getElementById('btn-retry-stats');
  if (btnRetry && typeof onRetry === 'function') {
    const newBtn = btnRetry.cloneNode(true);
    btnRetry.parentNode.replaceChild(newBtn, btnRetry);
    newBtn.addEventListener('click', onRetry);
  }
};

/**
 * Berpindah sub-view di panel kanan
 * @param {string} view - Kode view ('statistik', 'riwayat', etc)
 */
export const switchRightPanelView = (view) => {
  const viewMap = {
    statistik: 'view-ringkasan',
    riwayat: 'view-riwayat',
    peringatan: 'view-peringatan',
    pengaturan: 'view-pengaturan',
    tentang: 'view-tentang',
  };

  const targetId = viewMap[view] || 'view-ringkasan';

  const views = document.querySelectorAll('.stats-panel__view');
  views.forEach((v) => {
    if (v.id === targetId) {
      v.classList.remove('hidden');
    } else {
      v.classList.add('hidden');
    }
  });

  const titleEl = document.getElementById('stats-panel-title');
  if (titleEl) {
    const titleMap = {
      statistik: 'RINGKASAN BENCANA',
      riwayat: 'RIWAYAT KEJADIAN',
      peringatan: 'PERINGATAN DINI',
      pengaturan: 'PENGATURAN',
      tentang: 'TENTANG APLIKASI',
    };
    titleEl.textContent = titleMap[view] || 'RINGKASAN BENCANA';
  }

  if (view === 'riwayat') {
    renderHistoryList();
  } else if (view === 'peringatan') {
    renderAlertsList();
  }
};

/**
 * Render daftar 15 gempa terbaru
 */
const renderHistoryList = () => {
  const container = document.getElementById('history-list');
  if (!container) {
    return;
  }

  if (cachedEarthquakes.length === 0) {
    container.innerHTML = `<div class="empty-state">Tidak ada data riwayat kejadian.</div>`;
    return;
  }

  const latest15 = cachedEarthquakes.slice(0, 15);

  container.innerHTML = latest15
    .map((eq) => {
      const mag = parseFloat(eq.magnitude);
      const magnitudeFormated = mag.toFixed(1);
      
      // Warna teks magnitudo minimalis
      let colorClass = 'text-success'; // M < 4.0
      if (mag >= 6.0) {
        colorClass = 'text-danger-dark'; // M >= 6.0
      } else if (mag >= 5.0) {
        colorClass = 'text-danger'; // M 5.0 - 5.9
      } else if (mag >= 4.0) {
        colorClass = 'text-warning'; // M 4.0 - 4.9
      }

      const dateStr = new Date(eq.time).toLocaleString('id-ID', {
        day: 'numeric',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit',
      });

      return `
        <div class="history-row" data-lat="${eq.lat}" data-lng="${eq.lng}">
          <div class="history-row__mag ${colorClass}">${magnitudeFormated}</div>
          <div class="history-row__body">
            <div class="history-row__location">${eq.location}</div>
            <div class="history-row__time">${dateStr} WIB</div>
          </div>
          <div class="history-row__right">
            <span class="history-row__depth">${eq.depth} km</span>
          </div>
        </div>
      `;
    })
    .join('');

  // Event listener klik pada baris
  container.querySelectorAll('.history-row').forEach((row) => {
    row.addEventListener('click', () => {
      const lat = parseFloat(row.dataset.lat);
      const lng = parseFloat(row.dataset.lng);
      flyToLocation(lat, lng, 9);
    });
  });
};

/**
 * Render peringatan dini gempa M5.0+ dan gunung api Siaga/Awas
 */
const renderAlertsList = () => {
  const container = document.getElementById('alerts-list');
  if (!container) {
    return;
  }

  const eqAlerts = cachedEarthquakes.filter((eq) => {
    return eq.magnitude >= 5.0;
  });
  const volcanoAlerts = cachedVolcanoes.filter((v) => {
    return v.status === 'Siaga' || v.status === 'Awas';
  });

  if (eqAlerts.length === 0 && volcanoAlerts.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--text-disabled)" stroke-width="2">
          <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
        </svg>
        <p>Tidak ada peringatan dini aktif saat ini.</p>
      </div>
    `;
    return;
  }

  let html = '';

  eqAlerts.forEach((eq) => {
    const magnitude = Number(eq.magnitude).toFixed(1);
    const dateStr = new Date(eq.time).toLocaleString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    html += `
      <div class="alert-card">
        <div class="alert-card__header">
          <span class="alert-card__badge">GEMPA BUMI M5.0+</span>
          <span class="alert-card__time">${dateStr} WIB</span>
        </div>
        <div class="alert-card__title">Kekuatan: M ${magnitude}</div>
        <p class="alert-card__desc">${eq.location}</p>
        <div class="alert-card__details">
          <span>Kedalaman: ${eq.depth} km</span>
        </div>
        <button class="btn btn--secondary btn--sm btn--full alert-card__btn-fly" data-lat="${eq.lat}" data-lng="${eq.lng}">
          Fokus Pusat Gempa
        </button>
      </div>
    `;
  });

  volcanoAlerts.forEach((v) => {
    html += `
      <div class="alert-card">
        <div class="alert-card__header">
          <span class="alert-card__badge">GUNUNG BERAPI (${v.status.toUpperCase()})</span>
          <span class="alert-card__province">${v.province}</span>
        </div>
        <div class="alert-card__title">${v.name}</div>
        <p class="alert-card__desc">Tipe: ${v.type} | Ketinggian: ${v.elevation} mdpl</p>
        <div class="alert-card__details">
          <span>Letusan Terakhir: ${v.lastEruption}</span>
        </div>
        <button class="btn btn--secondary btn--sm btn--full alert-card__btn-fly" data-lat="${v.lat}" data-lng="${v.lng}">
          Fokus Gunung Api
        </button>
      </div>
    `;
  });

  container.innerHTML = html;

  container.querySelectorAll('.alert-card__btn-fly').forEach((btn) => {
    btn.addEventListener('click', () => {
      const lat = parseFloat(btn.dataset.lat);
      const lng = parseFloat(btn.dataset.lng);
      flyToLocation(lat, lng, 9);
    });
  });
};

/**
 * Mengubah tema aplikasi
 * @param {string} theme - 'dark' | 'light'
 */
export const setTheme = (theme) => {
  const html = document.documentElement;
  const themeToggleNavbar = document.getElementById('btn-theme-toggle');
  const themeToggleSettings = document.getElementById('settings-theme-toggle');

  if (theme === 'dark') {
    html.classList.remove('light-theme');
    switchTileLayer('dark');
    localStorage.setItem('theme', 'dark');
    if (themeToggleSettings) {
      themeToggleSettings.checked = true;
    }
    if (themeToggleNavbar) {
      themeToggleNavbar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      `;
    }
  } else {
    html.classList.add('light-theme');
    switchTileLayer('standard');
    localStorage.setItem('theme', 'light');
    if (themeToggleSettings) {
      themeToggleSettings.checked = false;
    }
    if (themeToggleNavbar) {
      themeToggleNavbar.innerHTML = `
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/>
          <line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
          <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/>
          <line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
          <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      `;
    }
  }
};

/**
 * Inisialisasi formulir pengaturan dan event listeners
 */
const initSettings = () => {
  const themeToggle = document.getElementById('settings-theme-toggle');
  const pollingSelect = document.getElementById('settings-polling-interval');
  const notifToggle = document.getElementById('settings-notifications-toggle');

  const currentTheme = localStorage.getItem('theme') || 'dark';
  const currentInterval = localStorage.getItem('polling-interval') || '30000';
  const notifsEnabled = localStorage.getItem('notifications-enabled') !== 'false';

  if (themeToggle) {
    themeToggle.checked = currentTheme === 'dark';
    themeToggle.addEventListener('change', () => {
      setTheme(themeToggle.checked ? 'dark' : 'light');
    });
  }

  if (pollingSelect) {
    pollingSelect.value = currentInterval;
    pollingSelect.addEventListener('change', () => {
      const interval = parseInt(pollingSelect.value, 10);
      localStorage.setItem('polling-interval', interval);
      window.dispatchEvent(new CustomEvent('settings:polling', { detail: interval }));
    });
  }

  if (notifToggle) {
    notifToggle.checked = notifsEnabled;
    notifToggle.addEventListener('change', () => {
      localStorage.setItem('notifications-enabled', notifToggle.checked);
    });
  }
};

/**
 * Update stats panel dengan data baru
 * @param {object} data - Data statistik
 */
export const updateStats = (data) => {
  // Sembunyikan loading dan error, tampilkan konten utama
  const content = document.getElementById('ringkasan-content');
  const skeleton = document.getElementById('ringkasan-skeleton');
  const error = document.getElementById('ringkasan-error');

  skeleton?.classList.add('hidden');
  error?.classList.add('hidden');
  content?.classList.remove('hidden');

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
    parseFloat(max.toFixed(1)),
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
      ${points.map((p) => {
        return `<circle cx="${p.x}" cy="${p.y}" r="3" fill="#EF4444" stroke="#0B1121" stroke-width="2"/>`;
      }).join('')}

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
    .map((prov, i) => {
      return `
        <li class="province-ranking__item">
          <span class="province-ranking__rank">${i + 1}</span>
          <span class="province-ranking__dot" style="background: ${prov.color};"></span>
          <span class="province-ranking__name">${prov.name}</span>
          <span class="province-ranking__count">${prov.count}</span>
        </li>
      `;
    })
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
  // Province item click → fly to province (menggunakan event delegation)
  const rankingList = document.querySelector('.province-ranking__list');
  if (rankingList) {
    rankingList.addEventListener('click', (e) => {
      const item = e.target.closest('.province-ranking__item');
      if (item) {
        const name = item.querySelector('.province-ranking__name')?.textContent;
        if (name) {
          console.log(`[statsPanel] Province click: ${name} — zoom to province bounds`);
          zoomToProvince(name);
        }
      }
    });
  }
};
