/**
 * MapBencana — Toast Notification System
 * Notifikasi toast dengan auto-dismiss dan animasi
 */

/** @type {number} Counter untuk ID unik toast */
let toastId = 0;

/** @type {number} Durasi default toast (ms) */
const DEFAULT_DURATION = 4000;

/**
 * Menampilkan toast notification
 * @param {string} message - Pesan utama
 * @param {'success'|'error'|'warning'|'info'} type - Jenis toast
 * @param {object} options - Opsi tambahan
 * @param {string} options.title - Judul toast
 * @param {number} options.duration - Durasi tampil (ms), 0 = persistent
 * @returns {number} Toast ID (bisa dipakai untuk dismiss manual)
 */
export const showToast = (message, type = 'info', options = {}) => {
  const { title, duration = DEFAULT_DURATION } = options;
  const container = document.getElementById('toast-container');

  if (!container) {
    return -1;
  }

  const id = ++toastId;
  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.dataset.toastId = id;

  toast.innerHTML = `
    <div class="toast__icon">
      ${getToastIcon(type)}
    </div>
    <div class="toast__content">
      ${title ? `<div class="toast__title">${title}</div>` : ''}
      <div class="toast__message">${message}</div>
    </div>
    <button class="toast__close" aria-label="Tutup notifikasi">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <line x1="18" y1="6" x2="6" y2="18"/>
        <line x1="6" y1="6" x2="18" y2="18"/>
      </svg>
    </button>
  `;

  // Close button handler
  const closeBtn = toast.querySelector('.toast__close');
  closeBtn.addEventListener('click', () => dismissToast(id));

  container.appendChild(toast);

  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => dismissToast(id), duration);
  }

  return id;
};

/**
 * Dismiss toast berdasarkan ID
 * @param {number} id - Toast ID
 */
export const dismissToast = (id) => {
  const toast = document.querySelector(`[data-toast-id="${id}"]`);

  if (!toast) {
    return;
  }

  toast.classList.add('toast--exit');

  // Hapus dari DOM setelah animasi selesai
  toast.addEventListener('animationend', () => {
    toast.remove();
  });
};

/**
 * Dismiss semua toast
 */
export const dismissAllToasts = () => {
  const toasts = document.querySelectorAll('.toast');
  toasts.forEach((toast) => {
    const id = parseInt(toast.dataset.toastId, 10);
    dismissToast(id);
  });
};

/**
 * Shortcut: tampilkan toast sukses
 * @param {string} message
 * @param {object} options
 */
export const toastSuccess = (message, options = {}) =>
  showToast(message, 'success', options);

/**
 * Shortcut: tampilkan toast error
 * @param {string} message
 * @param {object} options
 */
export const toastError = (message, options = {}) =>
  showToast(message, 'error', options);

/**
 * Shortcut: tampilkan toast warning
 * @param {string} message
 * @param {object} options
 */
export const toastWarning = (message, options = {}) =>
  showToast(message, 'warning', options);

/**
 * Shortcut: tampilkan toast info
 * @param {string} message
 * @param {object} options
 */
export const toastInfo = (message, options = {}) =>
  showToast(message, 'info', options);

/**
 * Mendapatkan icon SVG berdasarkan tipe toast
 * @param {string} type - Tipe toast
 * @returns {string} SVG HTML string
 */
const getToastIcon = (type) => {
  const icons = {
    success: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
      <polyline points="22,4 12,14.01 9,11.01"/>
    </svg>`,
    error: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="15" y1="9" x2="9" y2="15"/>
      <line x1="9" y1="9" x2="15" y2="15"/>
    </svg>`,
    warning: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
      <line x1="12" y1="9" x2="12" y2="13"/>
      <line x1="12" y1="17" x2="12.01" y2="17"/>
    </svg>`,
    info: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>`,
  };

  return icons[type] || icons.info;
};
