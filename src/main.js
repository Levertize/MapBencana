/**
 * MapBencana — Main Entry Point
 * Inisialisasi semua module dan bootstrap aplikasi
 */

// ---- Import Styles ----
import './styles/main.css';
import './styles/map.css';
import './styles/sidebar.css';
import './styles/components.css';

// ---- Import Modules ----
import { initMap, flyToLocation } from './map/initMap.js';
import { initSidebar, onFilterChange, getFilterState } from './ui/sidebar.js';
import { initStatsPanel, updateStats } from './ui/statsPanel.js';
import { initLegend } from './ui/legend.js';
import { toastInfo, toastSuccess, toastWarning } from './ui/toast.js';
import { fetchBMKGEarthquakes } from './data/fetchBMKG.js';
import { initEarthquakeLayer, updateEarthquakeMarkers } from './map/earthquakeLayer.js';
import { showLayer, hideLayer, getLayer, registerLayer } from './map/layers.js';
import { initVolcanoLayer } from './map/volcanoLayer.js';
import { initChoroplethLayer, updateChoropleth, zoomToProvince } from './map/choropleth.js';
import { initHeatmapLayer, updateHeatmap } from './map/heatmap.js';
import { PROVINCES } from './data/parser.js';
import L from 'leaflet';

// Global state data gempa
let earthquakeData = [];

/**
 * Mendapatkan label tanggal sumbu X untuk trend chart secara dinamis
 * @param {number} timeRange - Rentang waktu dalam hari
 * @returns {string[]} Label sumbu X
 */
const getXLabelsForTimeRange = (timeRange) => {
  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - timeRange);

  const mid = new Date();
  mid.setDate(end.getDate() - Math.round(timeRange / 2));

  const formatShort = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]}`;
  };

  return [formatShort(start), formatShort(mid), formatShort(end)];
};

/**
 * Menghitung statistik gabungan secara dinamis dari data gempa bumi riil
 * @param {object[]} earthquakeData - List data gempa bumi riil
 * @param {string[]} activeTypes - Jenis bencana yang aktif di filter
 * @param {number} timeRange - Rentang waktu filter dalam hari
 * @returns {object} Data ter-kalkulasi untuk updateStats
 */
const calculateDynamicStats = (earthquakeData, activeTypes, timeRange) => {
  const limitDate = new Date();
  limitDate.setDate(limitDate.getDate() - timeRange);

  // Saring gempa berdasarkan rentang waktu
  const filteredEarthquakes = activeTypes.includes('gempa')
    ? earthquakeData.filter((g) => new Date(g.time) >= limitDate)
    : [];

  const totalFilteredGempa = filteredEarthquakes.length;

  // Status checkbox bencana lainnya
  const isVolcanoChecked = activeTypes.includes('gunung-berapi');
  const isBanjirChecked = activeTypes.includes('banjir');
  const isLongsorChecked = activeTypes.includes('tanah-longsor');

  // Breakdown dengan data gempa bumi riil + dummy bencana lainnya (statis/0)
  const breakdown = {
    gempa: {
      count: totalFilteredGempa,
      change: earthquakeData.length > 0 ? Math.round((totalFilteredGempa / earthquakeData.length) * 100) : 0,
      direction: 'up',
    },
    gunung: {
      count: isVolcanoChecked ? 45 : 0,
      change: 5,
      direction: 'up',
    },
    banjir: {
      count: isBanjirChecked ? 72 : 0,
      change: 15,
      direction: 'up',
    },
    longsor: {
      count: isLongsorChecked ? 34 : 0,
      change: 3,
      direction: 'down',
    },
  };

  const total =
    breakdown.gempa.count +
    breakdown.gunung.count +
    breakdown.banjir.count +
    breakdown.longsor.count;

  // Ranking provinsi teraktif
  // Kontribusi base dummy dari bencana lain agar ranking bervariasi
  const provinceCounts = {
    'Jawa Barat': { count: isLongsorChecked ? 15 : 0, color: '#EF4444' },
    'Jawa Timur': { count: isVolcanoChecked ? 15 : 0, color: '#F97316' },
    'Sulawesi Selatan': { count: isBanjirChecked ? 15 : 0, color: '#FB923C' },
    'Nusa Tenggara Timur': { count: isVolcanoChecked ? 10 : 0, color: '#FBBF24' },
    'Sumatera Barat': { count: isBanjirChecked ? 10 : 0, color: '#34D399' },
  };

  // Tambah sumbangan kejadian gempa bumi riil
  filteredEarthquakes.forEach((g) => {
    const prov = g.province;
    if (prov && prov !== 'Lainnya') {
      if (!provinceCounts[prov]) {
        const colors = ['#EF4444', '#F97316', '#FB923C', '#FBBF24', '#34D399', '#3B82F6', '#06B6D4'];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        provinceCounts[prov] = { count: 0, color: randomColor };
      }
      provinceCounts[prov].count++;
    }
  });

  const provinces = Object.entries(provinceCounts)
    .map(([name, item]) => ({
      name,
      count: item.count,
      color: item.color,
    }))
    .filter((p) => p.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // Trend data points dari magnitude gempa bumi terfilter (diurutkan kronologis)
  let trend = [];
  if (filteredEarthquakes.length > 0) {
    const chronologically = [...filteredEarthquakes].sort((a, b) => new Date(a.time) - new Date(b.time));
    trend = chronologically.map((g) => g.magnitude);
  } else {
    trend = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
  }

  // Pad dengan 0 jika data kurang dari 5 agar grafik digambar mulus
  while (trend.length < 5) {
    trend.unshift(0);
  }

  // Ambil label sumbu X dinamis
  const xLabels = getXLabelsForTimeRange(timeRange);

  return {
    total,
    breakdown,
    provinces,
    trend,
    xLabels,
    provinceCounts,
  };
};

/**
 * Bootstrap aplikasi MapBencana
 * Menginisialisasi semua komponen secara berurutan
 */
const bootstrap = async () => {
  try {
    // 1. Init map
    initMap();

    // 2. Init UI components
    initSidebar();
    initStatsPanel();
    initLegend();

    // 3. Setup navbar clock
    startClock();

    // 4. Setup search bar shortcut (⌘K / Ctrl+K) & input search
    initSearchShortcut();
    initSearch();

    // 5. Setup share button
    initShareButton();

    // 6. Fetch data BMKG
    console.log('[main] Memulai pembaruan data BMKG...');
    earthquakeData = await fetchBMKGEarthquakes();

    // 7. Sembunyikan map loading overlay
    const loadingEl = document.querySelector('.map-loading');
    if (loadingEl) {
      loadingEl.classList.add('hidden');
    }

    // 8. Inisialisasi layer gempa bumi
    initEarthquakeLayer(earthquakeData);

    // Inisialisasi layer tambahan (Phase 3 & 4)
    initHeatmapLayer(earthquakeData);
    await initChoroplethLayer();
    await initVolcanoLayer();

    // 9. Update stats panel dengan data riil pertama kali
    const initialFilter = getFilterState();
    const initialStats = calculateDynamicStats(earthquakeData, initialFilter.types, initialFilter.timeRange);
    updateStats(initialStats);
    updateChoropleth(initialStats.provinceCounts);
    updateHeatmap(initialFilter.types, initialFilter.timeRange);

    // Memicu animasi angka stats panel menggunakan data riil
    setTimeout(() => {
      animateStatsOnLoad();
    }, 100);

    // 10. Register filter change handler
    onFilterChange((state) => {
      // Update layer peta
      updateEarthquakeMarkers(state.types, state.timeRange);
      updateHeatmap(state.types, state.timeRange);
      
      // Update stats panel
      const newStats = calculateDynamicStats(earthquakeData, state.types, state.timeRange);
      updateStats(newStats);
      updateChoropleth(newStats.provinceCounts);

      // Handle layer toggles
      const availableLayers = ['heatmap', 'choropleth', 'province-border', 'district-border', 'volcanoes'];
      availableLayers.forEach((layerId) => {
        if (state.layers.includes(layerId)) {
          if (layerId === 'district-border' && !getLayer('district-border')) {
            // Lazy load district borders
            loadDistrictBordersLazy();
          } else {
            showLayer(layerId);
          }
        } else {
          hideLayer(layerId);
        }
      });
    });

    // 11. Show welcome toast
    setTimeout(() => {
      toastSuccess('MapBencana siap digunakan', {
        title: 'Selamat Datang',
        duration: 3000,
      });
    }, 1000);


  } catch (error) {
    console.error('[main] Bootstrap error:', error);
  }
};

/**
 * Memulai jam di navbar yang update setiap detik
 */
const startClock = () => {
  const timeEl = document.getElementById('navbar-time');
  if (!timeEl) {
    return;
  }

  const updateClock = () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    timeEl.textContent = `Update: ${hours}:${minutes}:${seconds} WIB`;
  };

  updateClock();
  setInterval(updateClock, 1000);
};

/**
 * Inisialisasi shortcut keyboard untuk search (⌘K / Ctrl+K)
 */
const initSearchShortcut = () => {
  const searchInput = document.getElementById('search-input');

  document.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      searchInput?.focus();
    }

    // Escape to blur search
    if (e.key === 'Escape') {
      searchInput?.blur();
    }
  });
};

/**
 * Inisialisasi share button
 */
const initShareButton = () => {
  const shareBtn = document.getElementById('btn-share');

  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      const url = window.location.href;

      try {
        await navigator.clipboard.writeText(url);
        toastInfo('Link berhasil disalin ke clipboard', {
          title: 'Link Disalin',
          duration: 2000,
        });
      } catch {
        // Fallback jika clipboard API tidak tersedia
        toastInfo(`Salin link: ${url}`, {
          title: 'Bagikan',
          duration: 5000,
        });
      }
    });
  }
};

/**
 * Animasi angka stats panel saat pertama kali load
 */
const animateStatsOnLoad = () => {
  const totalValue = document.querySelector('#stats-total .stats-card__value');
  if (totalValue) {
    const target = parseInt(totalValue.textContent, 10) || 297;
    totalValue.textContent = '0';

    const duration = 1200;
    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(target * eased);

      totalValue.textContent = current.toLocaleString('id-ID');

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }

  // Animate mini card values
  const miniValues = document.querySelectorAll('.stats-mini__value');
  miniValues.forEach((el, index) => {
    const target = parseInt(el.textContent, 10) || 0;
    el.textContent = '0';

    setTimeout(() => {
      const duration = 800;
      const startTime = performance.now();

      const animate = (currentTime) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        const current = Math.round(target * eased);

        el.textContent = current;

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    }, 200 + index * 100);
  });
};

/**
 * Dictionary koordinat kota-kota besar di Indonesia
 */
const CITIES_COORDINATES = {
  jakarta: [-6.2088, 106.8456],
  bandung: [-6.9175, 107.6191],
  surabaya: [-7.2575, 112.7521],
  semarang: [-6.9667, 110.4167],
  yogyakarta: [-7.7956, 110.3695],
  medan: [3.5952, 98.6722],
  makassar: [-5.1476, 119.4327],
  denpasar: [-8.6705, 115.2126],
  palembang: [-2.9761, 104.7754],
  balikpapan: [-1.2654, 116.8312],
  pontianak: [-0.0263, 109.3425],
  samarinda: [-0.5022, 117.1536],
  manado: [1.4748, 124.8428],
  kupang: [-10.1772, 123.6078],
  jayapura: [-2.5916, 140.6690],
  ambon: [-3.6954, 128.1814],
};

/**
 * Menjalankan logika pencarian lokasi
 * @param {string} query - Query pencarian
 */
const executeSearch = (query) => {
  if (!query) return;
  const q = query.trim().toLowerCase();

  // 1. Coba cari di daftar provinsi
  const matchedProvince = PROVINCES.find(
    (p) => p.toLowerCase() === q || p.toLowerCase().includes(q)
  );
  if (matchedProvince) {
    const success = zoomToProvince(matchedProvince);
    if (success) {
      toastSuccess(`Menampilkan wilayah: ${matchedProvince}`, { duration: 2000 });
      return;
    }
  }

  // 2. Coba cari di data gempa (koordinat riil kejadian terbaru)
  if (earthquakeData && earthquakeData.length > 0) {
    const matchedGempa = earthquakeData.find(
      (g) =>
        g.location.toLowerCase().includes(q) ||
        g.province.toLowerCase().includes(q)
    );
    if (matchedGempa) {
      flyToLocation(matchedGempa.lat, matchedGempa.lng, 9);
      toastSuccess(`Menemukan gempa terdekat di: ${matchedGempa.location}`, {
        title: 'Lokasi Kejadian',
        duration: 3000,
      });
      return;
    }
  }

  // 3. Coba cari di kota-kota besar
  const cityKey = Object.keys(CITIES_COORDINATES).find(
    (c) => c === q || c.includes(q)
  );
  if (cityKey) {
    const [lat, lng] = CITIES_COORDINATES[cityKey];
    flyToLocation(lat, lng, 10);
    const cityName = cityKey.charAt(0).toUpperCase() + cityKey.slice(1);
    toastSuccess(`Menuju kota: ${cityName}`, { duration: 2000 });
    return;
  }

  // 4. Jika tidak ada yang cocok
  toastWarning(`Lokasi "${query}" tidak ditemukan`, {
    title: 'Pencarian Gagal',
    duration: 3000,
  });
};

/**
 * Inisialisasi event listener untuk kolom pencarian
 */
const initSearch = () => {
  const searchInput = document.getElementById('search-input');
  const searchIcon = document.querySelector('.search-bar__icon');

  if (searchInput) {
    searchInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        executeSearch(searchInput.value);
        searchInput.blur();
      }
    });
  }

  if (searchIcon && searchInput) {
    searchIcon.style.cursor = 'pointer';
    searchIcon.addEventListener('click', () => {
      executeSearch(searchInput.value);
    });
  }
};

/**
 * Lazy load batas kabupaten/kota dari CDN
 */
const loadDistrictBordersLazy = () => {
  console.log('[main] Lazy loading batas kabupaten...');
  toastInfo('Mengunduh data batas kabupaten...', { duration: 2500 });

  fetch('https://raw.githubusercontent.com/rifani/geojson-political-indonesia/master/IDN_adm_2_kabkota.json')
    .then((res) => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })
    .then((data) => {
      const districtLayer = L.geoJSON(data, {
        style: {
          fill: false,
          color: '#64748B', // Slate
          weight: 0.8,
          opacity: 0.4,
          dashArray: '3, 3',
          interactive: false,
        },
      });
      registerLayer('district-border', districtLayer, true);
      toastSuccess('Batas kabupaten berhasil dimuat', { duration: 2000 });
    })
    .catch((err) => {
      console.error('[main] Gagal memuat batas kabupaten:', err);
      toastWarning('Gagal memuat batas kabupaten. Silakan coba lagi.', {
        title: 'Gagal Memuat',
        duration: 4000,
      });
    });
};

// ---- Start App ----
document.addEventListener('DOMContentLoaded', bootstrap);
