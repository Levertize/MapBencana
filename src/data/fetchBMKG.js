/**
 * MapBencana — BMKG Data Fetcher
 * Modul untuk mengambil data gempa terkini dari BMKG API
 */

import { BMKG_GEMPA_TERKINI_URL, FETCH_CONFIG } from '../utils/constants.js';
import { parseBMKGEarthquake } from './parser.js';
import { toastWarning, toastSuccess } from '../ui/toast.js';

/**
 * Menunggu selama ms milidetik (utility untuk retry delay)
 * @param {number} ms - Jeda waktu
 * @returns {Promise<void>}
 */
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Mengambil data gempa dari BMKG dengan retry dan timeout logic
 * Jika gagal setelah maksimal retry, akan memuat data fallback lokal
 * @returns {Promise<object[]>} List gempa bumi ter-normalisasi
 */
export const fetchBMKGEarthquakes = async () => {
  let attempt = 0;
  const maxRetries = FETCH_CONFIG.maxRetries;
  const retryDelay = FETCH_CONFIG.retryDelay;
  const timeoutMs = FETCH_CONFIG.timeout;

  while (attempt < maxRetries) {
    attempt++;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);

    try {
      console.log(`[fetchBMKG] Mencoba mengambil data gempa BMKG... (Percobaan ${attempt}/${maxRetries})`);
      
      const response = await fetch(BMKG_GEMPA_TERKINI_URL, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json',
        },
      });

      clearTimeout(id);

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const data = await response.json();
      
      // Validasi struktur respons BMKG
      if (data && data.Infogempa && data.Infogempa.gempa) {
        const rawList = data.Infogempa.gempa;
        const normalizedList = rawList
          .map((item) => parseBMKGEarthquake(item))
          .filter((item) => item !== null);

        console.log(`[fetchBMKG] Sukses mengambil ${normalizedList.length} gempa bumi dari BMKG.`);
        
        toastSuccess('Data gempa bumi BMKG berhasil diperbarui', {
          title: 'Update Berhasil',
          duration: 3000,
        });

        return normalizedList;
      } else {
        throw new Error('Format respons BMKG tidak valid');
      }

    } catch (error) {
      clearTimeout(id);
      console.warn(`[fetchBMKG] Percobaan ${attempt} gagal:`, error.message);

      if (attempt < maxRetries) {
        console.log(`[fetchBMKG] Menunggu ${retryDelay / 1000}s sebelum mencoba kembali...`);
        await sleep(retryDelay);
      }
    }
  }

  // Jika semua percobaan gagal, gunakan fallback data lokal
  console.warn('[fetchBMKG] Semua percobaan fetch BMKG gagal. Menggunakan data fallback lokal.');
  
  toastWarning('Gagal menghubungi server BMKG. Memuat data cadangan lokal.', {
    title: 'Koneksi Bermasalah',
    duration: 5000,
  });

  return await fetchLocalFallback();
};

/**
 * Memuat data cadangan lokal dari public/data/earthquakes-fallback.json
 * @returns {Promise<object[]>} List gempa bumi ter-normalisasi
 */
const fetchLocalFallback = async () => {
  try {
    const fallbackPath = '/data/earthquakes-fallback.json';
    const response = await fetch(fallbackPath);
    
    if (!response.ok) {
      throw new Error(`Gagal memuat fallback JSON: status ${response.status}`);
    }

    const data = await response.json();
    if (data && data.Infogempa && data.Infogempa.gempa) {
      return data.Infogempa.gempa
        .map((item) => parseBMKGEarthquake(item))
        .filter((item) => item !== null);
    }
    return [];
  } catch (error) {
    console.error('[fetchBMKG] Gagal memuat data fallback lokal:', error);
    return [];
  }
};
