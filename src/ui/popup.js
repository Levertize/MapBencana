/**
 * MapBencana — Popup Template
 * Template popup card untuk marker bencana
 */

import { formatDate, formatCoordinates, formatDepth } from '../utils/formatter.js';

/**
 * Membuat konten popup untuk marker gempa bumi
 * @param {object} data - Data gempa
 * @param {number} data.magnitude - Magnitude gempa
 * @param {string} data.location - Deskripsi lokasi
 * @param {string} data.province - Nama provinsi
 * @param {string|Date} data.time - Waktu kejadian
 * @param {number} data.depth - Kedalaman (km)
 * @param {number} data.lat - Latitude
 * @param {number} data.lng - Longitude
 * @param {boolean} data.isNew - Apakah data baru
 * @returns {string} HTML string popup content
 */
export const createEarthquakePopup = (data) => {
  const badgeHtml = data.isNew
    ? '<span class="badge badge--baru">BARU</span>'
    : '';

  return `
    <div class="popup-card">
      <div class="popup-card__header">
        <div class="popup-card__type-icon popup-card__type-icon--gempa">⊙</div>
        <span class="popup-card__type-name">Gempa Bumi</span>
        ${badgeHtml}
      </div>

      <div class="popup-card__magnitude">M ${Number(data.magnitude).toFixed(1)}</div>
      <div class="popup-card__location">${data.location || '-'}</div>
      <div class="popup-card__province">${data.province || '-'}</div>

      <div class="popup-card__details">
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
          </svg>
          <span class="popup-card__detail-label">Waktu</span>
          <span class="popup-card__detail-value">${formatDate(data.time, { withTime: true })}</span>
        </div>
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="12" y1="2" x2="12" y2="22"/><polyline points="8,18 12,22 16,18"/>
          </svg>
          <span class="popup-card__detail-label">Kedalaman</span>
          <span class="popup-card__detail-value">${formatDepth(data.depth)}</span>
        </div>
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/>
            <circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="popup-card__detail-label">Koordinat</span>
          <span class="popup-card__detail-value">${formatCoordinates(data.lat, data.lng)}</span>
        </div>
      </div>

      <button class="popup-card__action" onclick="console.warn('[popup] Detail view belum diimplementasi')">
        Lihat Detail
      </button>
    </div>
  `;
};

/**
 * Membuat konten popup untuk marker gunung berapi
 * @param {object} data - Data gunung berapi
 * @param {string} data.name - Nama gunung
 * @param {string} data.province - Provinsi
 * @param {number} data.elevation - Ketinggian (mdpl)
 * @param {string} data.status - Status aktivitas
 * @param {string} data.lastEruption - Letusan terakhir
 * @param {number} data.lat - Latitude
 * @param {number} data.lng - Longitude
 * @returns {string} HTML string popup content
 */
export const createVolcanoPopup = (data) => {
  const statusBadge = getVolcanoStatusBadge(data.status);

  return `
    <div class="popup-card">
      <div class="popup-card__header">
        <div class="popup-card__type-icon popup-card__type-icon--gunung">△</div>
        <span class="popup-card__type-name">Gunung Berapi</span>
        ${statusBadge}
      </div>

      <div class="popup-card__location" style="font-size: 1.25rem;">${data.name || '-'}</div>
      <div class="popup-card__province">${data.province || '-'}</div>

      <div class="popup-card__details">
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2L2 22h20L12 2z"/>
          </svg>
          <span class="popup-card__detail-label">Ketinggian</span>
          <span class="popup-card__detail-value">${data.elevation ? `${data.elevation} mdpl` : '-'}</span>
        </div>
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span class="popup-card__detail-label">Status</span>
          <span class="popup-card__detail-value">${data.status || '-'}</span>
        </div>
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/>
          </svg>
          <span class="popup-card__detail-label">Letusan Terakhir</span>
          <span class="popup-card__detail-value">${data.lastEruption || '-'}</span>
        </div>
        <div class="popup-card__detail">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
          </svg>
          <span class="popup-card__detail-label">Koordinat</span>
          <span class="popup-card__detail-value">${formatCoordinates(data.lat, data.lng)}</span>
        </div>
      </div>

      <button class="popup-card__action" onclick="console.warn('[popup] Detail view belum diimplementasi')">
        Lihat Detail
      </button>
    </div>
  `;
};

/**
 * Mendapatkan badge HTML berdasarkan status gunung berapi
 * @param {string} status
 * @returns {string} HTML badge
 */
const getVolcanoStatusBadge = (status) => {
  const statusMap = {
    Normal: 'badge--info',
    Waspada: 'badge--waspada',
    Siaga: 'badge--bahaya',
    Awas: 'badge--bahaya',
  };

  const badgeClass = statusMap[status] || 'badge--info';
  return `<span class="badge ${badgeClass}">${status || 'Unknown'}</span>`;
};
