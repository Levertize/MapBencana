/**
 * MapBencana — Global Constants
 * Semua URL API, konfigurasi, dan definisi konstanta
 */

// ---- API Endpoints ----
export const BMKG_AUTOGEMPA_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/autogempa.json';
export const BMKG_GEMPA_TERKINI_URL = 'https://data.bmkg.go.id/DataMKG/TEWS/gempaterkini.json';

// ---- Map Configuration ----
export const MAP_CONFIG = {
  center: [-2.5, 118],
  zoom: 5,
  minZoom: 4,
  maxZoom: 18,
  maxBounds: [
    [-15, 90],
    [10, 145],
  ],
};

// ---- Tile Layers ----
export const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>',
    name: 'Dark',
  },
  standard: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    name: 'Standard',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution:
      '&copy; <a href="https://www.esri.com/">Esri</a>, Maxar, Earthstar Geographics',
    name: 'Satellite',
  },
};

// ---- Disaster Types ----
export const DISASTER_TYPES = {
  gempa: {
    id: 'gempa',
    label: 'Gempa Bumi',
    icon: '⊙',
    color: '#EF4444',
    markerColor: '#EF4444',
  },
  'gunung-berapi': {
    id: 'gunung-berapi',
    label: 'Gunung Berapi',
    icon: '△',
    color: '#F97316',
    markerColor: '#F97316',
  },
  banjir: {
    id: 'banjir',
    label: 'Banjir',
    icon: '◈',
    color: '#3B82F6',
    markerColor: '#3B82F6',
  },
  'tanah-longsor': {
    id: 'tanah-longsor',
    label: 'Tanah Longsor',
    icon: '⚠',
    color: '#FBBF24',
    markerColor: '#FBBF24',
  },
  kebakaran: {
    id: 'kebakaran',
    label: 'Kebakaran Hutan',
    icon: '🔥',
    color: '#F59E0B',
    markerColor: '#F59E0B',
  },
  tsunami: {
    id: 'tsunami',
    label: 'Tsunami',
    icon: '🌊',
    color: '#06B6D4',
    markerColor: '#06B6D4',
  },
};

// ---- Choropleth Color Scale ----
export const CHOROPLETH_SCALE = [
  { min: 0, max: 5, color: '#FED7AA', label: '0 - 5' },
  { min: 6, max: 20, color: '#FB923C', label: '6 - 20' },
  { min: 21, max: 50, color: '#EA580C', label: '21 - 50' },
  { min: 51, max: 100, color: '#DC2626', label: '51 - 100' },
  { min: 101, max: Infinity, color: '#991B1B', label: '> 100' },
];

// ---- Magnitude Color Scale ----
export const MAGNITUDE_SCALE = [
  { min: 0, max: 3, color: '#22C55E', label: 'Ringan', radius: 6 },
  { min: 3, max: 5, color: '#FBBF24', label: 'Sedang', radius: 8 },
  { min: 5, max: 6, color: '#F97316', label: 'Kuat', radius: 12 },
  { min: 6, max: 7, color: '#EF4444', label: 'Sangat Kuat', radius: 16 },
  { min: 7, max: Infinity, color: '#991B1B', label: 'Dahsyat', radius: 22 },
];

// ---- Time Range Options ----
export const TIME_RANGES = {
  1: { label: 'Hari Ini', days: 1 },
  7: { label: '7 Hari Terakhir', days: 7 },
  15: { label: '15 Hari Terakhir', days: 15 },
  30: { label: '30 Hari Terakhir', days: 30 },
};

// ---- Fetch Config ----
export const FETCH_CONFIG = {
  timeout: 10000, // 10 seconds
  maxRetries: 3,
  retryDelay: 2000, // 2 seconds between retries
};
