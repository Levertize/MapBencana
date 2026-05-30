/**
 * MapBencana — Sidebar & Filter Logic
 * Mengelola icon navigation, filter panel, dan interaksi filter
 */

import { switchRightPanelView } from './statsPanel.js';

/**
 * State aktif filter
 * @type {{ types: Set<string>, timeRange: number, layers: Set<string> }}
 */
const filterState = {
  types: new Set(['gempa', 'gunung-berapi', 'banjir', 'tanah-longsor']),
  timeRange: 15,
  layers: new Set(['choropleth', 'province-border', 'volcanoes']),
};

/** @type {Function[]} Callbacks yang dipanggil saat filter berubah */
const filterCallbacks = [];

/**
 * Inisialisasi sidebar dan filter panel
 */
export const initSidebar = () => {
  initIconNav();
  initFilterCheckboxes();
  initTimeRange();
  initLayerToggles();
  initFilterPanelToggle();
  initStatsPanelToggle();
  initResetFilter();
  initResizeHandler();
};

/**
 * Register callback untuk perubahan filter
 * @param {Function} callback
 */
export const onFilterChange = (callback) => {
  filterCallbacks.push(callback);
};

/**
 * Mendapatkan state filter saat ini
 * @returns {{ types: string[], timeRange: number, layers: string[] }}
 */
export const getFilterState = () => ({
  types: Array.from(filterState.types),
  timeRange: filterState.timeRange,
  layers: Array.from(filterState.layers),
});

// ---- Internal Functions ----

/**
 * Notifikasi semua callback tentang perubahan filter
 */
const notifyFilterChange = () => {
  const state = getFilterState();
  filterCallbacks.forEach((cb) => {
    cb(state);
  });
};

/**
 * Set active item di icon navigation
 * @param {string} viewId
 */
const setActiveNavItem = (viewId) => {
  const navItems = document.querySelectorAll('.icon-nav__item');
  navItems.forEach((i) => {
    if (i.dataset.view === viewId) {
      i.classList.add('icon-nav__item--active');
      i.setAttribute('aria-current', 'page');
    } else {
      i.classList.remove('icon-nav__item--active');
      i.removeAttribute('aria-current');
    }
  });
};

/**
 * Inisialisasi icon navigation
 * Mengelola active state pada sidebar icon buttons
 */
const initIconNav = () => {
  const navItems = document.querySelectorAll('.icon-nav__item');

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const view = item.dataset.view;
      handleViewSwitch(view);
    });
  });
};

/**
 * Handle perpindahan view
 * @param {string} view - Nama view ('peta', 'statistik', dst)
 */
const handleViewSwitch = (view) => {
  const filterPanel = document.getElementById('filter-panel');
  const statsPanel = document.getElementById('stats-panel');
  const isMobile = window.innerWidth <= 1024;

  if (isMobile) {
    if (view === 'peta') {
      filterPanel?.classList.toggle('open');
      statsPanel?.classList.remove('open');
      setActiveNavItem('peta');
    } else {
      filterPanel?.classList.remove('open');
      statsPanel?.classList.add('open');
      setActiveNavItem(view);
      switchRightPanelView(view);
    }
  } else {
    // Desktop behavior
    setActiveNavItem(view);
    if (view === 'peta') {
      filterPanel?.classList.remove('hidden');
      statsPanel?.classList.remove('hidden');
      switchRightPanelView('statistik');
    } else {
      filterPanel?.classList.add('hidden');
      statsPanel?.classList.remove('hidden');
      switchRightPanelView(view);
    }
  }
};

/**
 * Inisialisasi filter checkboxes (jenis bencana)
 */
const initFilterCheckboxes = () => {
  const checkboxes = document.querySelectorAll('#filter-disaster-types input[type="checkbox"]');

  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', () => {
      const type = checkbox.dataset.type;

      if (checkbox.checked) {
        filterState.types.add(type);
      } else {
        filterState.types.delete(type);
      }

      notifyFilterChange();
    });
  });
};

/**
 * Inisialisasi time range dropdown
 */
const initTimeRange = () => {
  const select = document.getElementById('filter-time-range');

  if (select) {
    select.addEventListener('change', () => {
      filterState.timeRange = parseInt(select.value, 10);
      updateDateRangeDisplay();
      notifyFilterChange();
    });
  }
};

/**
 * Update tampilan date range berdasarkan pilihan
 */
const updateDateRangeDisplay = () => {
  const dateRangeText = document.querySelector('.filter-date-range__text');
  if (!dateRangeText) {
    return;
  }

  const end = new Date();
  const start = new Date();
  start.setDate(end.getDate() - filterState.timeRange);

  const formatSimple = (d) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

  dateRangeText.textContent = `${formatSimple(start)} - ${formatSimple(end)}`;
};

/**
 * Inisialisasi layer toggles
 */
const initLayerToggles = () => {
  const toggles = document.querySelectorAll('#layer-toggles input[type="checkbox"]');

  toggles.forEach((toggle) => {
    toggle.addEventListener('change', () => {
      const layer = toggle.dataset.layer;

      if (toggle.checked) {
        filterState.layers.add(layer);
      } else {
        filterState.layers.delete(layer);
      }

      notifyFilterChange();
    });
  });
};

/**
 * Inisialisasi collapse/expand filter panel
 */
const initFilterPanelToggle = () => {
  const toggleBtn = document.getElementById('filter-panel-toggle');
  const panelBody = document.getElementById('filter-panel-body');
  const filterPanel = document.getElementById('filter-panel');

  if (toggleBtn && panelBody) {
    toggleBtn.addEventListener('click', () => {
      const isMobile = window.innerWidth <= 1024;
      if (isMobile) {
        filterPanel?.classList.remove('open');
        setActiveNavItem('peta');
      } else {
        panelBody.classList.toggle('collapsed');
        toggleBtn.classList.toggle('collapsed');

        const isCollapsed = panelBody.classList.contains('collapsed');
        toggleBtn.setAttribute('aria-label', isCollapsed ? 'Buka panel filter' : 'Tutup panel filter');
      }
    });
  }
};

/**
 * Inisialisasi collapse/expand stats panel di mobile
 */
const initStatsPanelToggle = () => {
  const toggleBtn = document.getElementById('stats-panel-toggle');
  const statsPanel = document.getElementById('stats-panel');

  if (toggleBtn && statsPanel) {
    toggleBtn.addEventListener('click', () => {
      statsPanel.classList.remove('open');
      setActiveNavItem('peta');
    });
  }
};

/**
 * Inisialisasi reset filter button
 */
const initResetFilter = () => {
  const resetBtn = document.getElementById('btn-reset-filter');

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      // Reset checkboxes
      const checkboxes = document.querySelectorAll('#filter-disaster-types input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        cb.checked = true;
        filterState.types.add(cb.dataset.type);
      });

      // Reset time range
      const timeSelect = document.getElementById('filter-time-range');
      if (timeSelect) {
        timeSelect.value = '15';
        filterState.timeRange = 15;
      }

      // Reset layer toggles ke default
      const defaultLayers = ['choropleth', 'province-border', 'volcanoes'];
      const layerToggles = document.querySelectorAll('#layer-toggles input[type="checkbox"]');
      layerToggles.forEach((toggle) => {
        const isDefault = defaultLayers.includes(toggle.dataset.layer);
        toggle.checked = isDefault;
        if (isDefault) {
          filterState.layers.add(toggle.dataset.layer);
        } else {
          filterState.layers.delete(toggle.dataset.layer);
        }
      });

      updateDateRangeDisplay();
      notifyFilterChange();
    });
  }
};

/**
 * Inisialisasi window resize handler
 */
const initResizeHandler = () => {
  window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 1024;
    const filterPanel = document.getElementById('filter-panel');
    const statsPanel = document.getElementById('stats-panel');

    if (!isMobile) {
      const activeItem = document.querySelector('.icon-nav__item--active');
      const activeView = activeItem?.dataset.view || 'peta';

      filterPanel?.classList.remove('open');
      statsPanel?.classList.remove('open');

      if (activeView === 'peta') {
        filterPanel?.classList.remove('hidden');
        statsPanel?.classList.remove('hidden');
      } else {
        filterPanel?.classList.add('hidden');
        statsPanel?.classList.add('hidden');
      }
    } else {
      filterPanel?.classList.remove('hidden');
      statsPanel?.classList.remove('hidden');
    }
  });
};
