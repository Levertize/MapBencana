/**
 * MapBencana — Data Parser
 * Normalisasi & transformasi data dari BMKG ke format internal
 */

// Daftar nama provinsi resmi Indonesia
const PROVINCES = [
  'Aceh',
  'Sumatera Utara',
  'Sumatera Barat',
  'Riau',
  'Kepulauan Riau',
  'Jambi',
  'Bengkulu',
  'Sumatera Selatan',
  'Kepulauan Bangka Belitung',
  'Lampung',
  'Banten',
  'DKI Jakarta',
  'Jawa Barat',
  'Jawa Tengah',
  'DI Yogyakarta',
  'Jawa Timur',
  'Bali',
  'Nusa Tenggara Barat',
  'Nusa Tenggara Timur',
  'Kalimantan Barat',
  'Kalimantan Tengah',
  'Kalimantan Selatan',
  'Kalimantan Timur',
  'Kalimantan Utara',
  'Sulawesi Utara',
  'Gorontalo',
  'Sulawesi Tengah',
  'Sulawesi Barat',
  'Sulawesi Selatan',
  'Sulawesi Tenggara',
  'Maluku',
  'Maluku Utara',
  'Papua Barat',
  'Papua',
  'Papua Tengah',
  'Papua Pegunungan',
  'Papua Selatan',
  'Papua Barat Daya',
];

// Mapping kota / wilayah / kata kunci ke Provinsi (untuk fallback jika nama provinsi tidak tertulis eksplisit)
const KEYWORD_PROVINCE_MAP = {
  yogyakarta: 'DI Yogyakarta',
  jakarta: 'DKI Jakarta',
  'bangka belitung': 'Kepulauan Bangka Belitung',
  'kep. riau': 'Kepulauan Riau',
  ntt: 'Nusa Tenggara Timur',
  ntb: 'Nusa Tenggara Barat',
  alor: 'Nusa Tenggara Timur',
  yapen: 'Papua',
  jayapura: 'Papua',
  ambon: 'Maluku',
  ternate: 'Maluku Utara',
  manado: 'Sulawesi Utara',
  makassar: 'Sulawesi Selatan',
  palu: 'Sulawesi Tengah',
  kendari: 'Sulawesi Tenggara',
  mamuju: 'Sulawesi Barat',
  banjarmasin: 'Kalimantan Selatan',
  pontianak: 'Kalimantan Barat',
  samarinda: 'Kalimantan Timur',
  palangkaraya: 'Kalimantan Tengah',
  tarakan: 'Kalimantan Utara',
  kupang: 'Nusa Tenggara Timur',
  mataram: 'Nusa Tenggara Barat',
  denpasar: 'Bali',
  tabanan: 'Bali',
  surabaya: 'Jawa Timur',
  semarang: 'Jawa Tengah',
  bandung: 'Jawa Barat',
  cianjur: 'Jawa Barat',
  serang: 'Banten',
  medan: 'Sumatera Utara',
  tapanuli: 'Sumatera Utara',
  padang: 'Sumatera Barat',
  pekanbaru: 'Riau',
  tanjungpinang: 'Kepulauan Riau',
  palembang: 'Sumatera Selatan',
  pangkalpinang: 'Kepulauan Bangka Belitung',
  'bandar lampung': 'Lampung',
};

/**
 * Mengekstrak nama provinsi dari teks deskripsi wilayah
 * @param {string} wilayahText - Deskripsi wilayah dari BMKG
 * @returns {string} Nama provinsi terdeteksi atau 'Lainnya'
 */
export const extractProvince = (wilayahText) => {
  if (!wilayahText) {
    return 'Lainnya';
  }

  const textLower = wilayahText.toLowerCase();

  // 1. Cocokkan langsung dengan nama provinsi (dari yang terpanjang ke terpendek agar 'Sulawesi Selatan' terdeteksi sebelum 'Sulawesi')
  const sortedProvinces = [...PROVINCES].sort((a, b) => b.length - a.length);
  for (const province of sortedProvinces) {
    if (textLower.includes(province.toLowerCase())) {
      return province;
    }
  }

  // 2. Cocokkan berdasarkan keyword mapping (kota/wilayah spesifik)
  for (const [keyword, province] of Object.entries(KEYWORD_PROVINCE_MAP)) {
    if (textLower.includes(keyword)) {
      return province;
    }
  }

  // 3. Fallback jika tidak ditemukan
  return 'Lainnya';
};

/**
 * Normalisasi data gempa dari format BMKG ke format internal aplikasi
 * @param {object} rawGempa - Objek gempa dari respons BMKG
 * @returns {object} Objek gempa ter-normalisasi
 */
export const parseBMKGEarthquake = (rawGempa) => {
  if (!rawGempa) {
    return null;
  }

  // Parse Koordinat (Format: "lat,lng")
  let lat = 0;
  let lng = 0;
  if (rawGempa.Coordinates) {
    const parts = rawGempa.Coordinates.split(',');
    lat = parseFloat(parts[0]);
    lng = parseFloat(parts[1]);
  } else {
    // Jika tidak ada field Coordinates, coba parse dari Lintang & Bujur
    const latStr = rawGempa.Lintang || '';
    const lngStr = rawGempa.Bujur || '';
    lat = parseFloat(latStr);
    lng = parseFloat(lngStr);
    if (latStr.includes('LS')) {
      lat = -Math.abs(lat);
    }
    if (lngStr.includes('BB')) {
      lng = -Math.abs(lng); // Biasanya Indonesia di BT (Bujur Timur)
    }
  }

  // Parse Kedalaman (Format: "10 km" atau "10")
  let depth = 0;
  if (rawGempa.Kedalaman) {
    depth = parseInt(rawGempa.Kedalaman.replace(/[^\d]/g, ''), 10) || 0;
  }

  // Parse Magnitude
  const magnitude = parseFloat(rawGempa.Magnitude) || 0.0;

  // Tentukan Provinsi
  const province = extractProvince(rawGempa.Wilayah);

  // Waktu kejadian (ISO 8601 DateTime jika ada, fallback ke gabungan Tanggal & Jam)
  let time;
  if (rawGempa.DateTime) {
    time = new Date(rawGempa.DateTime);
  } else {
    // Parser fallback untuk format "30 Mei 2026 21:35:10 WIB"
    // Karena format bahasa Indonesia di new Date() bisa bermasalah, kita buat parser sederhana
    time = parseIndonesianDateTime(rawGempa.Tanggal, rawGempa.Jam);
  }

  // Bikin ID unik
  const id = `gempa-${rawGempa.DateTime || rawGempa.Jam}-${lat}-${lng}`;

  return {
    id,
    type: 'gempa',
    lat,
    lng,
    magnitude,
    depth,
    location: rawGempa.Wilayah || '',
    province,
    time,
    potensi: rawGempa.Potensi || '',
  };
};

/**
 * Parser fallback untuk format tanggal Indonesia
 * @param {string} tanggalStr - "30 Mei 2026"
 * @param {string} jamStr - "21:35:10 WIB"
 * @returns {Date}
 */
const parseIndonesianDateTime = (tanggalStr, jamStr) => {
  try {
    const monthMap = {
      januari: 0, jan: 0,
      februari: 1, feb: 1,
      maret: 2, mar: 2,
      april: 3, apr: 3,
      mei: 4,
      juni: 5, jun: 5,
      juli: 6, jul: 6,
      agustus: 7, agu: 7,
      september: 8, sep: 8,
      oktober: 9, okt: 9,
      november: 10, nov: 10,
      desember: 11, des: 11,
    };

    const cleanTanggal = (tanggalStr || '').toLowerCase().trim();
    const parts = cleanTanggal.split(/\s+/);
    if (parts.length < 3) {
      return new Date();
    }

    const day = parseInt(parts[0], 10);
    const monthName = parts[1];
    const month = monthMap[monthName] !== undefined ? monthMap[monthName] : 0;
    const year = parseInt(parts[2], 10);

    const cleanJam = (jamStr || '').replace('WIB', '').trim();
    const timeParts = cleanJam.split(':');
    const hours = parseInt(timeParts[0], 10) || 0;
    const minutes = parseInt(timeParts[1], 10) || 0;
    const seconds = parseInt(timeParts[2], 10) || 0;

    // Asumsikan waktu adalah WIB (UTC+7), kita kurangi 7 jam untuk UTC
    const utcDate = new Date(Date.UTC(year, month, day, hours - 7, minutes, seconds));
    return utcDate;
  } catch {
    return new Date();
  }
};
