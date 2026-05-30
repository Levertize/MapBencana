/**
 * MapBencana — Data Formatters
 * Format angka, tanggal, dan koordinat untuk tampilan
 */

/**
 * Format angka dengan separator ribuan (format Indonesia: titik)
 * @param {number} num - Angka yang akan diformat
 * @returns {string} Angka terformat
 *
 * @example
 * formatNumber(1234567) // "1.234.567"
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) {
    return '-';
  }
  return new Intl.NumberFormat('id-ID').format(num);
};

/**
 * Format tanggal ke format Indonesia
 * @param {string|Date} date - Tanggal yang akan diformat
 * @param {object} options - Opsi format
 * @param {boolean} options.withTime - Sertakan waktu
 * @param {boolean} options.short - Format singkat
 * @returns {string} Tanggal terformat
 *
 * @example
 * formatDate('2025-06-08') // "8 Jun 2025"
 * formatDate('2025-06-08T10:15:23', { withTime: true }) // "8 Jun 2025, 10:15:23 WIB"
 */
export const formatDate = (date, options = {}) => {
  const { withTime = false, short = false } = options;
  const d = date instanceof Date ? date : new Date(date);

  if (isNaN(d.getTime())) {
    return '-';
  }

  const months = short
    ? ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
    : [
        'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
      ];

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  let result = `${day} ${month} ${year}`;

  if (withTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    const seconds = String(d.getSeconds()).padStart(2, '0');
    result += `, ${hours}:${minutes}:${seconds} WIB`;
  }

  return result;
};

/**
 * Format koordinat ke string yang mudah dibaca
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @param {number} precision - Jumlah desimal
 * @returns {string} Koordinat terformat
 *
 * @example
 * formatCoordinates(-7.32, 105.56) // "-7.32, 105.56"
 */
export const formatCoordinates = (lat, lng, precision = 2) => {
  if (lat === null || lng === null || lat === undefined || lng === undefined) {
    return '-';
  }
  return `${lat.toFixed(precision)}, ${lng.toFixed(precision)}`;
};

/**
 * Format magnitude dengan label deskriptif
 * @param {number} magnitude - Nilai magnitude
 * @returns {string} Magnitude terformat
 *
 * @example
 * formatMagnitude(5.6) // "M 5.6"
 */
export const formatMagnitude = (magnitude) => {
  if (magnitude === null || magnitude === undefined) {
    return '-';
  }
  return `M ${Number(magnitude).toFixed(1)}`;
};

/**
 * Format kedalaman gempa
 * @param {number} depth - Kedalaman dalam km
 * @returns {string} Kedalaman terformat
 *
 * @example
 * formatDepth(10) // "10 Km"
 */
export const formatDepth = (depth) => {
  if (depth === null || depth === undefined) {
    return '-';
  }
  return `${depth} Km`;
};

/**
 * Format waktu relatif (time ago)
 * @param {string|Date} date - Tanggal
 * @returns {string} Waktu relatif
 *
 * @example
 * formatTimeAgo(new Date(Date.now() - 3600000)) // "1 jam lalu"
 */
export const formatTimeAgo = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const now = new Date();
  const diff = now - d;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) {
    return 'Baru saja';
  }
  if (minutes < 60) {
    return `${minutes} menit lalu`;
  }
  if (hours < 24) {
    return `${hours} jam lalu`;
  }
  if (days < 30) {
    return `${days} hari lalu`;
  }

  return formatDate(d, { short: true });
};

/**
 * Format persentase perubahan
 * @param {number} current - Nilai saat ini
 * @param {number} previous - Nilai sebelumnya
 * @returns {{ value: string, direction: 'up'|'down'|'neutral' }}
 */
export const formatPercentChange = (current, previous) => {
  if (!previous || previous === 0) {
    return { value: '0%', direction: 'neutral' };
  }

  const change = ((current - previous) / previous) * 100;
  const direction = change > 0 ? 'up' : change < 0 ? 'down' : 'neutral';
  const value = `${Math.abs(change).toFixed(0)}%`;

  return { value, direction };
};
